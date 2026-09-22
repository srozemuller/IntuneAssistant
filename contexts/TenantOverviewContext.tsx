// contexts/TenantOverviewContext.tsx
'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
    ReactNode,
} from 'react';
import { useMsal } from '@azure/msal-react';
import { useCustomer } from '@/contexts/CustomerContext';
import { useApiStream } from '@/hooks/useApiStream';
import { ApiError } from '@/lib/apiRequest';
import { TENANT_OVERVIEW_CACHE_TTL_MS, TENANT_OVERVIEW_STREAM_ENDPOINT } from '@/lib/constants';
import { clearCachedSnapshots, deleteCachedSnapshot, readCachedSnapshot, writeCachedSnapshot } from '@/lib/overviewCache';
import type {
    OverviewAssignmentRow,
    OverviewAssignmentsPayload,
    OverviewCompletePayload,
    OverviewConnectedPayload,
    OverviewItem,
    OverviewSection,
    OverviewStep,
    OverviewStreamPhase,
    TenantOverviewSnapshot,
} from '@/types/tenantOverview';

// Bump when the snapshot shape changes so stale entries are ignored instead of half-parsed.
const SNAPSHOT_VERSION = 1;
const STORAGE_PREFIX = 'ia_tenant_overview_';
// Auto-start at sign-in is the normal behaviour; switching it off is per browser.
const AUTOSTART_SETTING_KEY = 'ia_overview_autostart';

function readAutoStartSetting(): boolean {
    try { return localStorage.getItem(AUTOSTART_SETTING_KEY) !== 'false'; } catch { return true; }
}

export interface OverviewSectionSummary {
    key: string;
    label: string;
    stepIndex: number;
    count: number;
    assignedCount: number;
    /** Items in the family that can be assigned at all (mixed families such as Tenant & Service hold both kinds). */
    assignableCount: number;
    /** False when none of the family's items can be assigned (Assignment & RBAC, Connectors); the UI shows no assigned ratio for it. */
    supportsAssignments: boolean;
    status: OverviewStep['status'];
}

interface OverviewState {
    phase: OverviewStreamPhase;
    steps: OverviewStep[];
    sections: Record<string, OverviewSection>;
    assignments: OverviewAssignmentRow[] | null;
    fetchedAt: number | null;
    warnings: string[];
    durationMs: number;
    error: string | null;
    /** True when the current data came from the local cache instead of a live stream. */
    isFromCache: boolean;
    /** True when the API served the tenant's shared server-side snapshot instead of collecting from Graph. */
    isFromServerCache: boolean;
}

type OverviewAction =
    | { type: 'reset' }
    | { type: 'restore'; snapshot: TenantOverviewSnapshot }
    | { type: 'start' }
    | { type: 'connected'; servedFrom: OverviewConnectedPayload['servedFrom'] }
    | { type: 'progress'; step: OverviewStep }
    | { type: 'section'; section: OverviewSection }
    | { type: 'assignments'; rows: OverviewAssignmentRow[] }
    | { type: 'complete'; payload: OverviewCompletePayload; fetchedAt: number }
    | { type: 'fail'; error: string };

const initialState: OverviewState = {
    phase: 'idle',
    steps: [],
    sections: {},
    assignments: null,
    fetchedAt: null,
    warnings: [],
    durationMs: 0,
    error: null,
    isFromCache: false,
    isFromServerCache: false,
};

function upsertStep(steps: OverviewStep[], step: OverviewStep): OverviewStep[] {
    const next = steps.filter(s => s.stepIndex !== step.stepIndex);
    next.push(step);
    return next.sort((a, b) => a.stepIndex - b.stepIndex);
}

function reducer(state: OverviewState, action: OverviewAction): OverviewState {
    switch (action.type) {
        case 'reset':
            return initialState;
        case 'restore':
            return {
                phase: 'completed',
                steps: action.snapshot.steps,
                sections: action.snapshot.sections,
                assignments: action.snapshot.assignments ?? null,
                fetchedAt: action.snapshot.fetchedAt,
                warnings: action.snapshot.warnings,
                durationMs: action.snapshot.durationMs,
                error: null,
                isFromCache: true,
                isFromServerCache: false,
            };
        case 'start':
            // Keep the previous sections visible while refreshing so the page never flashes empty.
            return { ...state, phase: 'streaming', steps: [], warnings: [], error: null, isFromCache: false, isFromServerCache: false };
        case 'connected':
            return { ...state, isFromServerCache: action.servedFrom === 'server-cache' };
        case 'progress':
            return { ...state, steps: upsertStep(state.steps, action.step) };
        case 'section':
            return { ...state, sections: { ...state.sections, [action.section.key]: action.section } };
        case 'assignments':
            return { ...state, assignments: action.rows };
        case 'complete':
            return {
                ...state,
                phase: 'completed',
                fetchedAt: action.fetchedAt,
                warnings: action.payload.warnings ?? [],
                durationMs: action.payload.durationMs,
                error: null,
            };
        case 'fail':
            return { ...state, phase: 'failed', error: action.error };
        default:
            return state;
    }
}

function storageKey(accountId: string, tenantId: string): string {
    return `${STORAGE_PREFIX}${accountId}_${tenantId}`;
}

async function readSnapshot(key: string): Promise<TenantOverviewSnapshot | null> {
    const snapshot = await readCachedSnapshot<TenantOverviewSnapshot>(key);
    if (!snapshot || snapshot.version !== SNAPSHOT_VERSION || typeof snapshot.fetchedAt !== 'number') {
        return null;
    }
    // A snapshot without assignment rows and without an "Assignments: ..." warning came from an API that did
    // not run the assignments step yet (older server behind a newer frontend). Treat it as incomplete so the
    // next bootstrap streams again instead of serving a half-empty cache for the whole cache window.
    const assignmentsStepFailed = snapshot.warnings?.some(w => w.startsWith('Assignments')) ?? false;
    if (snapshot.assignments === null && !assignmentsStepFailed) {
        return null;
    }
    return snapshot;
}

function writeSnapshot(key: string, snapshot: TenantOverviewSnapshot): void {
    // Fire and forget: a failed write only means the next reload streams again instead of reading the cache.
    void writeCachedSnapshot(key, snapshot).then(ok => {
        if (!ok) console.warn('Tenant overview snapshot was not cached');
    });
}

/** Removes every cached overview for every user/tenant - called on sign-out so nothing lingers on shared machines. */
export async function clearTenantOverviewCache(): Promise<void> {
    await clearCachedSnapshots();
}

interface TenantOverviewContextType {
    /**
     * False until the customer record is known, and for customers not on the beta channel: the tenant overview
     * (stream, cache, search) is a beta feature and the API refuses it for everyone else, so nothing is
     * started here either.
     */
    isEnabled: boolean;
    /** True while the customer record (and with it the beta flag) is still loading. */
    isResolving: boolean;
    phase: OverviewStreamPhase;
    steps: OverviewStep[];
    sections: Record<string, OverviewSection>;
    /** Assignment rows for every non-application family; null until the assignments step has delivered (or if it failed). */
    assignments: OverviewAssignmentRow[] | null;
    fetchedAt: number | null;
    warnings: string[];
    durationMs: number;
    error: string | null;
    isFromCache: boolean;
    isFromServerCache: boolean;
    /** True when the data is older than the cache window (or missing). */
    isStale: boolean;
    /** Completed + failed steps divided by the total number of steps, 0..1. */
    progress: number;
    // Derived, memoised views - pages read these instead of re-walking the sections themselves.
    allItems: OverviewItem[];
    sectionSummaries: OverviewSectionSummary[];
    totalCount: number;
    assignedCount: number;
    unassignedCount: number;
    // Status window
    isStatusVisible: boolean;
    showStatus: () => void;
    hideStatus: () => void;
    // Actions
    refresh: () => void;
    /** Drops the stored snapshot and the in-memory data for this user + tenant, then streams from scratch. */
    reset: () => void;
    /** Drops everything like reset, but stays idle - nothing is collected until refresh() is called. */
    clear: () => void;
    cancel: () => void;
    /** Whether a missing or stale cache triggers a stream at sign-in. Persisted per browser. */
    autoStartEnabled: boolean;
    setAutoStartEnabled: (enabled: boolean) => void;
}

const TenantOverviewContext = createContext<TenantOverviewContextType | undefined>(undefined);

export function TenantOverviewProvider({ children }: { children: ReactNode }) {
    const { accounts, inProgress } = useMsal();
    const { hasConnectedTenant, customerLoading } = useCustomer();
    const { stream, cancel: cancelStream } = useApiStream();
    // Available to every connected community account. The backend endpoint (`v1/overview/stream`) still
    // carries `[Authorize(Policy = "RequireBetaTester")]` — a per-customer flag this app cannot grant — so
    // most accounts will get a 403 until that policy is revisited (tracked in the backend todo list).
    // `startStream` below treats that specific 403 as quietly idle instead of a visible failure, so
    // enabling this unconditionally doesn't show anyone a broken feature.
    const isEnabled = hasConnectedTenant;
    const isResolving = customerLoading;

    const [state, dispatch] = useReducer(reducer, initialState);
    const [isStatusVisible, setStatusVisible] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [autoStartEnabled, setAutoStartState] = useState(true);
    const autoStartRef = useRef(true);
    useEffect(() => {
        const enabled = readAutoStartSetting();
        autoStartRef.current = enabled;
        setAutoStartState(enabled);
    }, []);
    const setAutoStartEnabled = useCallback((enabled: boolean) => {
        autoStartRef.current = enabled;
        setAutoStartState(enabled);
        try { localStorage.setItem(AUTOSTART_SETTING_KEY, String(enabled)); } catch { /* storage unavailable */ }
    }, []);

    const account = accounts[0];
    const accountId = account?.homeAccountId ?? null;
    // Single-tenant per account in this app - no TenantContext/tenant switcher, just the signed-in account's tenant.
    const tenantId = account?.tenantId ?? null;
    const cacheKey = accountId && tenantId && isEnabled ? storageKey(accountId, tenantId) : null;

    // The key the currently running (or last finished) stream belongs to. Guards React strict-mode double
    // effects: a result for a key that is no longer current is dropped.
    const activeKeyRef = useRef<string | null>(null);
    const runIdRef = useRef(0);

    const startStream = useCallback(async (key: string, force = false) => {
        const runId = ++runIdRef.current;
        activeKeyRef.current = key;
        dispatch({ type: 'start' });
        setStatusVisible(true);

        const isCurrent = () => runIdRef.current === runId && activeKeyRef.current === key;
        const collected: { sections: Record<string, OverviewSection>; assignments: OverviewAssignmentRow[] | null; steps: OverviewStep[] } =
            { sections: {}, assignments: null, steps: [] };

        try {
            const outcome = await stream(force ? `${TENANT_OVERVIEW_STREAM_ENDPOINT}?force=true` : TENANT_OVERVIEW_STREAM_ENDPOINT, message => {
                if (!isCurrent()) return;
                let data: unknown;
                try {
                    data = JSON.parse(message.data);
                } catch {
                    return;
                }

                switch (message.event) {
                    case 'connected': {
                        const payload = data as OverviewConnectedPayload;
                        dispatch({ type: 'connected', servedFrom: payload.servedFrom ?? null });
                        break;
                    }
                    case 'progress': {
                        const step = data as OverviewStep;
                        collected.steps = upsertStep(collected.steps, step);
                        dispatch({ type: 'progress', step });
                        break;
                    }
                    case 'section': {
                        const section = (data as { section: OverviewSection }).section;
                        collected.sections[section.key] = section;
                        dispatch({ type: 'section', section });
                        break;
                    }
                    case 'assignments': {
                        const payload = data as OverviewAssignmentsPayload;
                        collected.assignments = payload.items ?? [];
                        dispatch({ type: 'assignments', rows: collected.assignments });
                        break;
                    }
                    case 'complete': {
                        const payload = data as OverviewCompletePayload;
                        // The snapshot's own completion time: identical for every user served the same server-side copy.
                        const parsed = payload.completedAt ? Date.parse(payload.completedAt) : NaN;
                        const fetchedAt = Number.isNaN(parsed) ? Date.now() : parsed;
                        dispatch({ type: 'complete', payload, fetchedAt });
                        writeSnapshot(key, {
                            version: SNAPSHOT_VERSION,
                            fetchedAt,
                            tenantId: tenantId ?? '',
                            sections: collected.sections,
                            assignments: collected.assignments,
                            steps: collected.steps,
                            warnings: payload.warnings ?? [],
                            durationMs: payload.durationMs,
                        });
                        break;
                    }
                    case 'error': {
                        const payload = data as { message?: string; details?: string };
                        dispatch({ type: 'fail', error: payload.details || payload.message || 'The overview stream failed' });
                        break;
                    }
                    // Change history ('changes') is a paid Configuration Management feature on top of the beta
                    // flag and is not part of this community app - any such event is simply ignored.
                    default:
                        break;
                }
            });

            if (!isCurrent()) return;
            if (outcome === 'consent-required') {
                dispatch({ type: 'fail', error: 'Additional Microsoft Graph permissions are required. Grant consent and refresh.' });
            } else if (outcome === 'session-expired') {
                dispatch({ type: 'fail', error: 'Your session has expired. Sign in again to load the overview.' });
            } else if (outcome === 'aborted') {
                dispatch({ type: 'fail', error: 'Loading was cancelled.' });
            }
        } catch (err) {
            if (!isCurrent()) return;
            if (err instanceof ApiError && err.status === 403) {
                // Not a failure this account caused — the backend's beta-rollout gate simply hasn't been
                // opened for this tenant yet. Go quietly idle instead of showing a "failed" card on every
                // login; nothing here changes once that gate is revisited on the backend.
                activeKeyRef.current = null;
                dispatch({ type: 'reset' });
                setStatusVisible(false);
                return;
            }
            dispatch({ type: 'fail', error: err instanceof Error ? err.message : 'The overview stream failed' });
        }
    }, [stream, tenantId]);

    // Bootstrap: whenever the signed-in account changes, restore the cached snapshot for that pair and
    // stream only when it is missing or older than the cache window.
    useEffect(() => {
        if (inProgress !== 'none' || isResolving) return;

        if (!cacheKey || !tenantId) {
            activeKeyRef.current = null;
            runIdRef.current++;
            cancelStream();
            dispatch({ type: 'reset' });
            setStatusVisible(false);
            return;
        }

        if (activeKeyRef.current === cacheKey) return;

        // Claim the key synchronously so two overlapping effect runs cannot start two streams while the
        // IndexedDB read is in flight. If this run is torn down before the read settles (React strict mode runs
        // every effect twice in development), release the claim again so the next run can take over - otherwise
        // the key stays claimed, the next run bails out early, and nothing ever streams.
        activeKeyRef.current = cacheKey;
        let disposed = false;
        let settled = false;

        void readSnapshot(cacheKey).then(snapshot => {
            settled = true;
            if (disposed || activeKeyRef.current !== cacheKey) return;
            if (snapshot && Date.now() - snapshot.fetchedAt < TENANT_OVERVIEW_CACHE_TTL_MS) {
                dispatch({ type: 'restore', snapshot });
                return;
            }
            if (!autoStartRef.current) {
                // Stay idle; the overview page offers a Start button and the auto-start switch.
                return;
            }
            void startStream(cacheKey);
        });

        return () => {
            disposed = true;
            if (!settled && activeKeyRef.current === cacheKey) {
                activeKeyRef.current = null;
            }
        };
    }, [cacheKey, tenantId, inProgress, isResolving, startStream, cancelStream]);

    // Ticks once a minute so "collected 12 minutes ago" and the stale flag stay honest without a reload.
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const refresh = useCallback(() => {
        if (!cacheKey) return;
        void startStream(cacheKey, true);
    }, [cacheKey, startStream]);

    const cancel = useCallback(() => {
        cancelStream();
    }, [cancelStream]);

    const reset = useCallback(() => {
        if (!cacheKey) return;
        cancelStream();
        runIdRef.current++;
        dispatch({ type: 'reset' });
        void deleteCachedSnapshot(cacheKey).finally(() => {
            void startStream(cacheKey, true);
        });
    }, [cacheKey, cancelStream, startStream]);

    const clear = useCallback(() => {
        if (!cacheKey) return;
        cancelStream();
        runIdRef.current++;
        dispatch({ type: 'reset' });
        setStatusVisible(false);
        void deleteCachedSnapshot(cacheKey);
    }, [cacheKey, cancelStream]);

    const showStatus = useCallback(() => setStatusVisible(true), []);
    const hideStatus = useCallback(() => setStatusVisible(false), []);

    const isStale = state.fetchedAt === null || now - state.fetchedAt >= TENANT_OVERVIEW_CACHE_TTL_MS;

    const progress = useMemo(() => {
        if (state.steps.length === 0) return 0;
        const done = state.steps.filter(s => s.status === 'completed' || s.status === 'failed').length;
        return done / state.steps.length;
    }, [state.steps]);

    const allItems = useMemo(
        () => Object.values(state.sections)
            .sort((a, b) => a.stepIndex - b.stepIndex)
            .flatMap(section => section.items),
        [state.sections]
    );

    const sectionSummaries = useMemo<OverviewSectionSummary[]>(() => {
        const stepByIndex = new Map(state.steps.map(s => [s.stepIndex, s]));
        const byKey = new Map<string, OverviewSectionSummary>();

        Object.values(state.sections).forEach(section => {
            byKey.set(section.key, {
                key: section.key,
                label: section.label,
                stepIndex: section.stepIndex,
                count: section.items.length,
                assignedCount: section.items.filter(i => i.isAssigned).length,
                assignableCount: section.items.filter(i => i.supportsAssignments !== false).length,
                supportsAssignments: section.items.length === 0 || section.items.some(i => i.supportsAssignments !== false),
                status: stepByIndex.get(section.stepIndex)?.status ?? 'completed',
            });
        });

        // Family steps that have not delivered a section yet (still loading, or failed) still get a row. The
        // connect step and derived steps (assignments) are not resource types and stay out of this list.
        state.steps.forEach(step => {
            if (step.stepIndex === 0 || (step.kind ?? 'family') !== 'family') return;
            const existing = [...byKey.values()].find(s => s.stepIndex === step.stepIndex);
            if (!existing) {
                byKey.set(`step-${step.stepIndex}`, {
                    key: `step-${step.stepIndex}`,
                    label: step.step,
                    stepIndex: step.stepIndex,
                    count: 0,
                    assignedCount: 0,
                    assignableCount: 0,
                    supportsAssignments: true,
                    status: step.status,
                });
            }
        });

        return [...byKey.values()].sort((a, b) => a.stepIndex - b.stepIndex);
    }, [state.sections, state.steps]);

    const totalCount = allItems.length;
    const assignedCount = useMemo(() => allItems.filter(i => i.isAssigned).length, [allItems]);
    /** Items that could be assigned but are not - excludes tenant defaults and non-assignable items (filters, scope tags, roles). */
    const unassignedCount = useMemo(
        () => allItems.filter(i => i.supportsAssignments !== false && !i.isAssigned && !i.isTenantDefault).length,
        [allItems]
    );

    const value = useMemo<TenantOverviewContextType>(() => ({
        isEnabled,
        isResolving,
        phase: state.phase,
        steps: state.steps,
        sections: state.sections,
        assignments: state.assignments,
        fetchedAt: state.fetchedAt,
        warnings: state.warnings,
        durationMs: state.durationMs,
        error: state.error,
        isFromCache: state.isFromCache,
        isFromServerCache: state.isFromServerCache,
        isStale,
        progress,
        allItems,
        sectionSummaries,
        totalCount,
        assignedCount,
        unassignedCount,
        isStatusVisible,
        showStatus,
        hideStatus,
        refresh,
        reset,
        clear,
        cancel,
        autoStartEnabled,
        setAutoStartEnabled,
    }), [isEnabled, isResolving, state, isStale, progress, allItems, sectionSummaries, totalCount, assignedCount, unassignedCount, isStatusVisible, showStatus, hideStatus, refresh, reset, clear, cancel, autoStartEnabled, setAutoStartEnabled]);

    return (
        <TenantOverviewContext.Provider value={value}>
            {children}
        </TenantOverviewContext.Provider>
    );
}

export function useTenantOverview(): TenantOverviewContextType {
    const context = useContext(TenantOverviewContext);
    if (!context) {
        throw new Error('useTenantOverview must be used within a TenantOverviewProvider');
    }
    return context;
}

/** "just now", "3 minutes ago", "2 hours ago" - enough for the collected-at label, no library needed. */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
    const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}
