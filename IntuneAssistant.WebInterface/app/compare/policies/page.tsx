'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    RefreshCw, ChevronDown, ChevronRight, ChevronLeft, Search, X, GitCompare,
    Download, CheckCircle2, AlertTriangle, XCircle,
    Layers, BarChart3, TrendingUp, Info, ShieldCheck, ShieldAlert, Sparkles, MinusCircle,
} from 'lucide-react';
import { CONFIGURATION_POLICIES_ENDPOINT, COMPARE_ENDPOINT, COMPARE_SET_ANALYSIS_ENDPOINT, SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT, ROLE_SCOPETAGS_ENDPOINT } from '@/lib/constants';
import { useApiRequest } from '@/hooks/useApiRequest';
import { apiRequest } from '@/lib/apiRequest';
import { apiScope } from '@/lib/msalConfig';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Policy {
    id: string;
    name: string;
    policyType: string;
    platform: string;
    isAssigned?: boolean;
    roleScopeTags?: string[];
    roleScopeTagIds?: string[];
}

interface ScopeTag {
    id: string;
    displayName: string;
    description?: string;
}

// ── Set-analysis types ─────────────────────────────────────────────────────────

type SetAnalysisStatus = 'Match' | 'Duplicate' | 'Conflict' | 'MissingInLeft' | 'MissingInRight' | 'NewInLeft' | 'NewInRight' | 'Overlap';

// Normalize API status strings or numeric enum values → SetAnalysisStatus
function normalizeSetAnalysisStatus(raw: unknown): SetAnalysisStatus {
    // Numeric enum: 0=Overlap,1=Conflict,2=Duplicate,3=MissingInRight,4=MissingInLeft,5=Match,6=NewInLeft,7=NewInRight
    const numericMap: Record<number, SetAnalysisStatus> = {
        0: 'Overlap',
        1: 'Conflict',
        2: 'Duplicate',
        3: 'MissingInRight',
        4: 'MissingInLeft',
        5: 'Match',
        6: 'NewInLeft',
        7: 'NewInRight',
    };
    if (typeof raw === 'number') return numericMap[raw] ?? 'Match';
    if (!raw || typeof raw !== 'string') return 'Match';
    const map: Record<string, SetAnalysisStatus> = {
        'match': 'Match',
        'duplicate': 'Duplicate',
        'conflict': 'Conflict',
        'missinginleft': 'MissingInLeft',
        'missing in left': 'MissingInLeft',
        'missinginright': 'MissingInRight',
        'missing in right': 'MissingInRight',
        'newinleft': 'NewInLeft',
        'new in left': 'NewInLeft',
        'newinright': 'NewInRight',
        'new in right': 'NewInRight',
        'overlap': 'Overlap',
    };
    return map[raw.toLowerCase()] ?? (raw as SetAnalysisStatus);
}

interface SetAnalysisOccurrence {
    policyId: string;
    policyName: string;
    value: string;
}

interface SetAnalysisItem {
    settingDefinitionId: string;
    settingName: string;
    status: SetAnalysisStatus;
    leftOccurrences: SetAnalysisOccurrence[];
    rightOccurrences: SetAnalysisOccurrence[];
}

interface SetAnalysisSummary {
    leftPolicyCount: number;
    rightPolicyCount: number;
    matchCount: number;
    overlapCount: number;
    conflictCount: number;
    duplicateCount: number;
    missingInRightCount: number;
    missingInLeftCount: number;
    totalSettings: number;
    newInLeftCount: number;
    newInRightCount: number;
}

interface SetAnalysisResponse {
    status: string;
    message: string;
    summary: SetAnalysisSummary;
    data: SetAnalysisItem[];
}

interface ChildSetting {
    name: string;
    value: string;
    sourceValue: string;
    targetValue: string;
}

interface ComparisonResult {
    name: string;
    id: string;
    definitionId: string;
    values: { sourceValue: string; checkedValue: string };
    description: string;
    keywords: string[];
    differences: string | null;
    settingCheckState: 'InSource' | 'InChecked' | 'InBothTheSame' | 'InBothDifferent';
    childSettings: ChildSetting[];
}

interface PolicyCompareResult {
    sourcePolicyId: string;
    sourcePolicyName: string;
    checkedPolicyId: string;
    checkedPolicyName: string;
    checkResults: ComparisonResult[];
}

interface MultiComparisonResponse {
    status: number;
    data: PolicyCompareResult | PolicyCompareResult[];
}

interface PoliciesApiResponse {
    status: string;
    message: string;
    data: { data: Policy[] };
}

interface ResolvedDefinitionOption {
    itemId: string;
    name: string;
    displayName: string;
}

interface ResolvedDefinition {
    id: string;
    displayName: string;
    options?: ResolvedDefinitionOption[];
}

interface ResolveApiResponse {
    status: number;
    data: ResolvedDefinition[];
}

/** Map: settingId.toLowerCase() → ResolvedDefinition */
type ResolvedMap = Map<string, ResolvedDefinition>;

// ── Status helpers — framed around the NEW policy ─────────────────────────────

type CheckState = ComparisonResult['settingCheckState'];
type StatusFilter = 'all' | CheckState;

/** How each state reads from the perspective of "should I enable this new policy?" */
const stateLabel: Record<CheckState, string> = {
    InBothTheSame:   'Already covered',
    InBothDifferent: 'Conflict',
    InSource:        'New — not elsewhere',
    InChecked:       'Only in existing',
};

const stateDescription: Record<CheckState, string> = {
    InBothTheSame:   'Same value in an existing policy — enabling is safe, no change in enforcement.',
    InBothDifferent: 'Different value in an existing policy — enabling may cause conflict or override.',
    InSource:        'Only in your new policy — no existing policy covers this setting.',
    InChecked:       'Only in the existing policy — your new policy does not configure this.',
};

const stateBadgeClass: Record<CheckState, string> = {
    InBothTheSame:   'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    InBothDifferent: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    InSource:        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    InChecked:       'bg-muted text-muted-foreground border-border',
};

const stateIcon: Record<CheckState, React.ReactNode> = {
    InBothTheSame:   <CheckCircle2 className="h-3 w-3" />,
    InBothDifferent: <AlertTriangle className="h-3 w-3" />,
    InSource:        <Sparkles className="h-3 w-3" />,
    InChecked:       <MinusCircle className="h-3 w-3" />,
};

function StatusBadge({ state }: { state: CheckState }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${stateBadgeClass[state]}`}>
            {stateIcon[state]}{stateLabel[state]}
        </span>
    );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    );
}

/** Show percentage with smart precision:
 *  - If count > 0 but rounds to 0, show "<1%" so it's never misleadingly 0%
 *  - Otherwise show whole number */
function smartPct(count: number, total: number): string {
    if (total === 0) return '0%';
    if (count === 0) return '0%';
    const pct = (count / total) * 100;
    if (pct < 1) return '<1%';
    return `${Math.round(pct)}%`;
}

function LoadingBanner({ onCancel, batchProgress }: { onCancel: () => void; batchProgress: { done: number; total: number } | null }) {
    const pct = batchProgress ? Math.round((batchProgress.done / batchProgress.total) * 100) : 0;
    return (
        <Card className="border overflow-hidden">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold">Analysing policy overlap…</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {batchProgress
                            ? batchProgress.total === 1
                                ? 'Running comparison…'
                                : `Type group ${batchProgress.done} of ${batchProgress.total} — comparing policies of the same type`
                            : 'Preparing…'
                        }
                    </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onCancel}
                        className="flex-shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5">
                        <XCircle className="h-4 w-4" />Cancel
                    </Button>
                </div>
                {/* Batch progress bar */}
                {batchProgress && (
                    <div className="space-y-1">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{batchProgress.done} / {batchProgress.total} batches</span>
                            <span>{pct}%</span>
                        </div>
                    </div>
                )}
                {/* Skeleton rows */}
                {([1, 0.65, 0.4, 0.2] as const).map((opacity, i) => (
                    <div key={i} className="flex gap-3 items-center px-1" style={{ opacity }}>
                        <div className="h-8 w-8 rounded bg-muted animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-2.5 rounded bg-muted animate-pulse" style={{ width: `${60 + (i * 7) % 25}%` }} />
                            <div className="h-2 rounded bg-muted/60 animate-pulse" style={{ width: `${35 + (i * 11) % 20}%` }} />
                        </div>
                        <div className="h-5 w-24 rounded-full bg-muted animate-pulse flex-shrink-0" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// ── ValueCell ──────────────────────────────────────────────────────────────────

/** Resolve a raw value (may be an option item ID) to a friendly display string.
 *  Returns { primary, raw } where primary is the human-readable label and
 *  raw is the original value (shown underneath when different). */
function resolveValue(raw: string, definitionId: string, resolvedMap: ResolvedMap): { primary: string; raw: string } {
    if (!raw) return { primary: '', raw: '' };

    const rawLower = raw.toLowerCase();
    const def = resolvedMap.get(definitionId.toLowerCase());

    if (def?.options?.length) {
        // 1. Exact match: value IS the full option item ID
        const exactMatch = def.options.find(o => o.itemId.toLowerCase() === rawLower);
        if (exactMatch) return { primary: exactMatch.displayName, raw };

        // 2. Value starts with definitionId + '_' — strip prefix and look up
        const prefix = definitionId.toLowerCase() + '_';
        if (rawLower.startsWith(prefix)) {
            const suffix = raw.slice(prefix.length);
            const suffixMatch = def.options.find(o =>
                o.itemId.toLowerCase() === rawLower ||
                o.itemId.toLowerCase().endsWith('_' + suffix.toLowerCase())
            );
            if (suffixMatch) return { primary: suffixMatch.displayName, raw };
            // At least show the bare suffix rather than the full ID
            return { primary: suffix, raw };
        }
    }

    // 3. No definition or no match — if value looks like a full option ID (contains the definitionId as prefix),
    //    strip down to just the suffix so it's less noisy
    const prefix = definitionId.toLowerCase() + '_';
    if (rawLower.startsWith(prefix)) {
        const suffix = raw.slice(prefix.length);
        return { primary: suffix, raw };
    }

    return { primary: raw, raw };
}

function ValueCell({ value, definitionId = '', resolvedMap }: { value: string; definitionId?: string; resolvedMap?: ResolvedMap }) {
    const [expanded, setExpanded] = useState(false);
    if (!value) return <span className="italic text-muted-foreground/60 text-xs">—</span>;

    // Resolve friendly value
    const { primary, raw } = resolvedMap && definitionId
        ? resolveValue(value, definitionId, resolvedMap)
        : { primary: value, raw: value };

    const lines = primary.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length > 1) {
        const visible = expanded ? lines : lines.slice(0, 2);
        const hidden = lines.length - 2;
        return (
            <div className="min-w-0 space-y-0.5">
                {visible.map((line, i) => <div key={i} className="text-xs font-mono bg-muted/40 rounded px-1.5 py-0.5 break-all">{line}</div>)}
                {!expanded && hidden > 0 && <button onClick={e => { e.stopPropagation(); setExpanded(true); }} className="text-[10px] text-primary hover:underline">+{hidden} more</button>}
                {expanded && hidden > 0 && <button onClick={e => { e.stopPropagation(); setExpanded(false); }} className="text-[10px] text-primary hover:underline">show less</button>}
            </div>
        );
    }

    const MAX = 80;

    return (
        <div className="min-w-0">
            {primary.length > MAX && !expanded ? (
                <>
                    <span className="text-xs break-all">{primary.slice(0, MAX)}&hellip;</span>
                    <button onClick={e => { e.stopPropagation(); setExpanded(true); }} className="ml-1 text-[10px] text-primary hover:underline">more</button>
                </>
            ) : (
                <span className="text-xs break-all">{primary}</span>
            )}
        </div>
    );
}

// ── Multi-select ───────────────────────────────────────────────────────────────

function MultiPolicySelect({ selectedIds, onChange, options, disabled, label, placeholder }: {
    selectedIds: string[]; onChange: (ids: string[]) => void; options: Policy[];
    disabled?: boolean; label: string; placeholder: string;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const filtered = options.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.platform.toLowerCase().includes(search.toLowerCase()));
    const selected = options.filter(p => selectedIds.includes(p.id));
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); } };
        document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
    }, []);
    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
    const toggle = (id: string) => onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
    const allFilteredIds = filtered.map(p => p.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
    const someSelected = !allSelected && allFilteredIds.some(id => selectedIds.includes(id));
    const toggleAll = () => {
        if (allSelected) {
            onChange(selectedIds.filter(id => !allFilteredIds.includes(id)));
        } else {
            const merged = [...new Set([...selectedIds, ...allFilteredIds])];
            onChange(merged);
        }
    };
    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className={`w-full min-h-11 px-3 py-2 rounded-lg border bg-background cursor-pointer flex items-start gap-2 flex-wrap transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'} ${open ? 'ring-2 ring-primary/50 border-primary' : ''}`}
                onClick={() => !disabled && setOpen(o => !o)}>
                {selected.length === 0
                    ? <span className="text-muted-foreground text-sm self-center">{placeholder}</span>
                    : selected.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 text-xs">
                            {p.name}
                            <button onClick={e => { e.stopPropagation(); toggle(p.id); }}><X className="h-3 w-3" /></button>
                        </span>
                    ))}
                <ChevronDown className={`h-4 w-4 text-muted-foreground ml-auto self-center flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            {open && !disabled && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-xl overflow-hidden">
                    <div className="p-2 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input ref={inputRef} type="text" placeholder="Search policies…" value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-background rounded border-0 outline-none focus:ring-1 focus:ring-primary/50" />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {/* Select all row */}
                        {filtered.length > 0 && (
                            <div
                                className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-muted/50 border-b bg-muted/10 sticky top-0"
                                onClick={toggleAll}
                            >
                                <div className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${allSelected ? 'bg-primary border-primary' : someSelected ? 'bg-primary/40 border-primary' : 'border-muted-foreground/30'}`}>
                                    {allSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                    {someSelected && <span className="block w-2 h-0.5 bg-primary-foreground rounded" />}
                                </div>
                                <span className="text-xs font-medium text-foreground">
                                    {allSelected ? 'Deselect all' : `Select all (${filtered.length})`}
                                </span>
                                {selected.length > 0 && (
                                    <button
                                        onClick={e => { e.stopPropagation(); onChange([]); }}
                                        className="ml-auto text-xs text-destructive hover:underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}
                        {filtered.length > 0 ? filtered.map(p => (
                            <div key={p.id} className={`px-3 py-2.5 flex items-start gap-2 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${selectedIds.includes(p.id) ? 'bg-primary/5' : ''}`} onClick={() => toggle(p.id)}>
                                <div className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${selectedIds.includes(p.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                    {selectedIds.includes(p.id) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-tight">{p.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                        <span>{p.policyType}</span><span>·</span><span>{p.platform}</span>
                                        {p.isAssigned && <Badge className="text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20">Assigned</Badge>}
                                    </p>
                                </div>
                            </div>
                        )) : <div className="p-6 text-center text-sm text-muted-foreground">No policies found</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Decision helper ────────────────────────────────────────────────────────────

function DecisionCard({ results }: { results: PolicyCompareResult[] }) {
    const allResults = results.flatMap(r => r.checkResults ?? []);
    const total = allResults.length;
    if (total === 0) return null;

    const same       = allResults.filter(c => c.settingCheckState === 'InBothTheSame').length;
    const conflicts  = allResults.filter(c => c.settingCheckState === 'InBothDifferent').length;
    const newOnly    = allResults.filter(c => c.settingCheckState === 'InSource').length;
    const conflictPolicies = [...new Set(
        results.flatMap(r => (r.checkResults ?? []).filter(c => c.settingCheckState === 'InBothDifferent').map(() => r.checkedPolicyName))
    )];

    let verdict: 'safe' | 'caution' | 'risk';
    let title: string;
    let description: string;

    if (conflicts === 0 && newOnly === 0) {
        verdict = 'safe';
        title = 'Safe to enable — fully covered';
        description = 'All settings in your new policy already exist with the same values in existing policies. Enabling it adds no new enforcement.';
    } else if (conflicts === 0) {
        verdict = 'safe';
        title = 'Likely safe — no conflicts';
        description = `No conflicting settings found. ${newOnly} setting${newOnly !== 1 ? 's' : ''} are unique to your new policy and would add new enforcement.`;
    } else if (conflicts <= total * 0.2) {
        verdict = 'caution';
        title = 'Review before enabling — some conflicts';
        description = `${conflicts} setting${conflicts !== 1 ? 's' : ''} conflict with existing policies. These may override each other depending on policy precedence.`;
    } else {
        verdict = 'risk';
        title = 'High conflict — careful consideration needed';
        description = `${conflicts} out of ${total} settings conflict with existing policies. Enabling this policy will likely override or be overridden by existing configuration.`;
    }

    const colors = {
        safe:    { bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', icon: <ShieldCheck className="h-6 w-6 text-green-600" />, text: 'text-green-800 dark:text-green-200', sub: 'text-green-700 dark:text-green-300' },
        caution: { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: <ShieldAlert className="h-6 w-6 text-amber-600" />, text: 'text-amber-800 dark:text-amber-200', sub: 'text-amber-700 dark:text-amber-300' },
        risk:    { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',         icon: <ShieldAlert className="h-6 w-6 text-red-600" />,    text: 'text-red-800 dark:text-red-200',     sub: 'text-red-700 dark:text-red-300' },
    }[verdict];

    return (
        <Card className={`border-2 ${colors.bg}`}>
            <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{colors.icon}</div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${colors.text}`}>{title}</p>
                        <p className={`text-xs mt-0.5 ${colors.sub}`}>{description}</p>
                        {conflictPolicies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground mr-1">Conflicts with:</span>
                                {conflictPolicies.map(name => (
                                    <span key={name} className="text-xs px-1.5 py-0.5 rounded border bg-background">{name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Mini stat pills */}
                    <div className="flex-shrink-0 flex flex-col gap-1 text-right text-xs">
                        <span className="text-green-600 font-medium">{same} covered</span>
                        {conflicts > 0 && <span className="text-red-600 font-medium">{conflicts} conflict{conflicts !== 1 ? 's' : ''}</span>}
                        {newOnly > 0 && <span className="text-blue-600 font-medium">{newOnly} new</span>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Coverage tab ───────────────────────────────────────────────────────────────

type SettingOverallStatus = 'covered' | 'conflict' | 'notInTenant';
interface SettingCoverageRow {
    id: string;
    definitionId: string;
    name: string;
    sourceValue: string;
    status: SettingOverallStatus;
    matchedIn: { policyName: string; value: string }[];
    conflictedIn: { policyName: string; value: string }[];
}

const coverageStatusConfig: Record<SettingOverallStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    covered:     { label: 'Covered',       bg: 'bg-green-50/60 dark:bg-green-900/10',   text: 'text-green-700 dark:text-green-300',  icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    conflict:    { label: 'Conflict',      bg: 'bg-red-50/60 dark:bg-red-900/10',        text: 'text-red-700 dark:text-red-300',      icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
    notInTenant: { label: 'Not in tenant', bg: 'bg-blue-50/40 dark:bg-blue-900/10',      text: 'text-blue-700 dark:text-blue-300',    icon: <Sparkles className="h-4 w-4 text-blue-500" /> },
};

function CoverageTab({ rows, summary, resolvedMap }: {
    rows: SettingCoverageRow[];
    summary: { total: number; covered: number; conflict: number; notInTenant: number };
    resolvedMap: ResolvedMap;
}) {
    const [filter, setFilter] = useState<SettingOverallStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const filtered = useMemo(() => rows.filter(r => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [rows, filter, search]);

    const toggle = (id: string) => setExpanded(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    // Coverage bar widths
    const covPct  = summary.total === 0 ? 0 : Math.round((summary.covered / summary.total) * 100);
    const confPct = summary.total === 0 ? 0 : Math.round((summary.conflict / summary.total) * 100);
    const notPct  = summary.total === 0 ? 0 : Math.round((summary.notInTenant / summary.total) * 100);

    return (
        <div className="space-y-4">
            {/* Big coverage bar */}
            <Card>
                <CardContent className="pt-5 pb-5">
                    <div className="flex items-end justify-between mb-3">
                        <div>
                            <p className="text-sm font-semibold">Overall setting coverage across all compared policies</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Each setting in your new policy — is it covered by at least one existing policy?
                            </p>
                        </div>
                        <span className={`text-3xl font-bold ${covPct >= 80 ? 'text-green-600' : covPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{covPct}%</span>
                    </div>
                    <div className="flex h-4 w-full rounded-full overflow-hidden bg-muted gap-0.5">
                        {covPct  > 0 && <div className="bg-green-500 h-full transition-all" style={{ width: `${covPct}%` }} title={`${summary.covered} covered`} />}
                        {confPct > 0 && <div className="bg-red-400 h-full transition-all"   style={{ width: `${confPct}%` }} title={`${summary.conflict} conflict`} />}
                        {notPct  > 0 && <div className="bg-blue-400 h-full transition-all"  style={{ width: `${notPct}%` }} title={`${summary.notInTenant} not in tenant`} />}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs flex-wrap">
                        {[
                            { label: 'Covered',       n: summary.covered,      pct: covPct,  color: 'bg-green-500' },
                            { label: 'Conflict only', n: summary.conflict,     pct: confPct, color: 'bg-red-400' },
                            { label: 'Not in tenant', n: summary.notInTenant,  pct: notPct,  color: 'bg-blue-400' },
                        ].map(k => (
                            <span key={k.label} className="flex items-center gap-1.5">
                                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${k.color}`} />
                                <span className="text-muted-foreground">{k.label}</span>
                                <span className="font-semibold">{k.n}</span>
                                <span className="text-muted-foreground/60">({k.pct}%)</span>
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Filter + search toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'covered', 'conflict', 'notInTenant'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}>
                        {f === 'all' ? `All (${rows.length})` :
                         f === 'covered' ? `Covered (${summary.covered})` :
                         f === 'conflict' ? `Conflict (${summary.conflict})` :
                         `Not in tenant (${summary.notInTenant})`}
                    </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search settings…" value={search} onChange={e => setSearch(e.target.value)}
                        className="border rounded px-2 py-1 text-xs bg-background w-48 focus:ring-1 focus:ring-primary/50 outline-none" />
                    {search && <button onClick={() => setSearch('')}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                </div>
            </div>

            {/* Settings table */}
            <Card className="overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[2fr_1fr_auto] gap-3 px-4 py-2.5 bg-muted/20 border-b text-xs font-medium text-muted-foreground">
                    <span>Setting</span>
                    <span>Value in new policy</span>
                    <span className="w-36 text-right">Overall status</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No settings match the current filter.</div>
                ) : (
                    <div className="divide-y">
                        {filtered.map(row => {
                            const cfg = coverageStatusConfig[row.status];
                            const isExpanded = expanded.has(row.id);
                            const hasDetail = row.matchedIn.length > 0 || row.conflictedIn.length > 0;
                            return (
                                <div key={row.id} className={cfg.bg}>
                                    {/* Main row */}
                                    <div
                                        className={`grid grid-cols-[2fr_1fr_auto] gap-3 px-4 py-3 items-center text-sm ${hasDetail ? 'cursor-pointer hover:brightness-95' : ''}`}
                                        onClick={() => hasDetail && toggle(row.id)}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {hasDetail
                                                ? (isExpanded
                                                    ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />)
                                                : <span className="w-3.5" />
                                            }
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold truncate">{row.name}</p>
                                                {hasDetail && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {row.matchedIn.length > 0 && `${row.matchedIn.length} polic${row.matchedIn.length !== 1 ? 'ies' : 'y'} match`}
                                                        {row.matchedIn.length > 0 && row.conflictedIn.length > 0 && ' · '}
                                                        {row.conflictedIn.length > 0 && <span className="text-red-600">{row.conflictedIn.length} conflict{row.conflictedIn.length !== 1 ? 's' : ''}</span>}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <ValueCell value={row.sourceValue} definitionId={row.definitionId} resolvedMap={resolvedMap} />
                                        <div className="w-36 flex justify-end">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${
                                                row.status === 'covered'     ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' :
                                                row.status === 'conflict'    ? 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300' :
                                                                               'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                                            }`}>
                                                {cfg.icon}{cfg.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="px-4 pb-3 pt-0 space-y-3 border-t bg-background/50">
                                            {row.matchedIn.length > 0 && (
                                                <div className="pt-3">
                                                    <p className="text-[10px] font-semibold uppercase text-green-700 dark:text-green-400 mb-1.5 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />Matched in {row.matchedIn.length} polic{row.matchedIn.length !== 1 ? 'ies' : 'y'}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {row.matchedIn.map((m, i) => (
                                                            <div key={i} className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 rounded px-2.5 py-1.5 border border-green-100 dark:border-green-800">
                                                                <span className="font-medium truncate mr-3">{m.policyName}</span>
                                                                <ValueCell value={m.value} definitionId={row.definitionId} resolvedMap={resolvedMap} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {row.conflictedIn.length > 0 && (
                                                <div className={row.matchedIn.length === 0 ? 'pt-3' : ''}>
                                                    <p className="text-[10px] font-semibold uppercase text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />Different value in {row.conflictedIn.length} polic{row.conflictedIn.length !== 1 ? 'ies' : 'y'}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {row.conflictedIn.map((c, i) => (
                                                            <div key={i} className="flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/20 rounded px-2.5 py-1.5 border border-red-100 dark:border-red-800">
                                                                <span className="font-medium truncate mr-3">{c.policyName}</span>
                                                                <ValueCell value={c.value} definitionId={row.definitionId} resolvedMap={resolvedMap} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}

// ── Per-result card ────────────────────────────────────────────────────────────

const ResultCard = React.memo(function ResultCard({ result, resolvedMap }: { result: PolicyCompareResult; resolvedMap: ResolvedMap }) {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [search, setSearch] = useState('');
    const [expandedSettings, setExpandedSettings] = useState<Set<string>>(new Set());
    // Start collapsed for performance — 250+ cards can't all be open
    const [isExpanded, setIsExpanded] = useState(false);

    const cr = result.checkResults ?? [];
    const total      = cr.length;
    const same       = cr.filter(r => r.settingCheckState === 'InBothTheSame').length;
    const conflicts  = cr.filter(r => r.settingCheckState === 'InBothDifferent').length;
    const newOnly    = cr.filter(r => r.settingCheckState === 'InSource').length;
    const existOnly  = cr.filter(r => r.settingCheckState === 'InChecked').length;
    const safePercent     = total === 0 ? 0 : Math.round((same / total) * 100);
    const conflictPercent = total === 0 ? 0 : Math.round((conflicts / total) * 100);

    const filtered = useMemo(() => cr.filter(r => {
        if (statusFilter !== 'all' && r.settingCheckState !== statusFilter) return false;
        if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [cr, statusFilter, search]);

    const toggleSetting = (key: string) => setExpandedSettings(prev => {
        const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next;
    });

    const scoreColor = safePercent >= 80 ? 'text-green-600' : safePercent >= 50 ? 'text-amber-600' : 'text-red-600';
    const conflictColor = conflictPercent > 30 ? 'text-red-600' : conflictPercent > 0 ? 'text-amber-600' : 'text-muted-foreground';

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b" onClick={() => setIsExpanded(e => !e)}>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{result.checkedPolicyName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {total} settings compared ·{' '}
                        <span className={`font-medium ${scoreColor}`}>{safePercent}% covered</span>
                        {conflicts > 0 && <span className={`ml-2 font-medium ${conflictColor}`}>· {conflicts} conflict{conflicts !== 1 ? 's' : ''}</span>}
                    </p>
                </div>
                <div className="flex gap-3 text-xs flex-shrink-0">
                    <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" />{same}</span>
                    {conflicts > 0 && <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-3 w-3" />{conflicts}</span>}
                    <span className="flex items-center gap-1 text-blue-600"><Sparkles className="h-3 w-3" />{newOnly}</span>
                </div>
            </div>

            {isExpanded && (
                <CardContent className="pt-0 pb-4 px-0">
                    {/* KPI pills */}
                    <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-b">
                        {[
                            { label: 'Already covered', count: same,      pct: smartPct(same, total),     bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', cls: 'text-green-600 dark:text-green-400', help: 'Same value in existing policy' },
                            { label: 'Conflicts',        count: conflicts,  pct: smartPct(conflicts, total), bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',         cls: 'text-red-600 dark:text-red-400',   help: 'Different value — may override' },
                            { label: 'New (unique)',      count: newOnly,   pct: smartPct(newOnly, total),   bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',   cls: 'text-blue-600 dark:text-blue-400',  help: 'Only in your new policy' },
                            { label: 'Existing only',    count: existOnly, pct: smartPct(existOnly, total), bg: 'bg-muted border-border',                                                   cls: 'text-muted-foreground',             help: 'Not in your new policy' },
                        ].map(k => (
                            <div key={k.label} className={`rounded-lg border px-3 py-2 text-center ${k.bg}`} title={k.help}>
                                <p className={`text-xl font-bold ${k.cls}`}>{k.count}</p>
                                <p className={`text-[10px] font-medium ${k.cls}`}>{k.label}</p>
                                <p className="text-[10px] text-muted-foreground">{k.pct}</p>
                            </div>
                        ))}
                    </div>

                    {/* Stacked coverage bar */}
                    <div className="px-4 py-2 border-b space-y-1">
                        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted">
                            {safePercent > 0     && <div className="bg-green-500 h-full" style={{ width: `${safePercent}%` }} />}
                            {conflictPercent > 0 && <div className="bg-red-400 h-full"   style={{ width: `${conflictPercent}%` }} />}
                            {newOnly > 0 && total > 0 && <div className="bg-blue-400 h-full" style={{ width: `${Math.round((newOnly / total) * 100)}%` }} />}
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500" />Covered {safePercent}%</span>
                            {conflictPercent > 0 && <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-400" />Conflict {conflictPercent}%</span>}
                        </div>
                    </div>

                    {/* Policy labels */}
                    <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b">
                        <div className="bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded border-l-4 border-blue-400">
                            <p className="text-[10px] text-blue-600 font-medium uppercase">New policy (evaluating)</p>
                            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mt-0.5">{result.sourcePolicyName}</p>
                        </div>
                        <div className="bg-muted p-2.5 rounded border-l-4 border-border">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Existing policy</p>
                            <p className="text-xs font-medium mt-0.5">{result.checkedPolicyName}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b">
                        {(['all', 'InBothTheSame', 'InBothDifferent', 'InSource', 'InChecked'] as const).map(f => (
                            <button key={f} onClick={() => setStatusFilter(f)}
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${statusFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}>
                                {f === 'all' ? 'All' : stateLabel[f]}
                            </button>
                        ))}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <Search className="h-3.5 w-3.5 text-muted-foreground" />
                            <input type="text" placeholder="Search settings…" value={search} onChange={e => setSearch(e.target.value)}
                                className="border rounded px-2 py-1 text-xs bg-background w-44 focus:ring-1 focus:ring-primary/50 outline-none" />
                        </div>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-muted/10 text-xs font-medium text-muted-foreground border-b">
                        <span>Setting</span><span>New Policy Value</span><span>Existing Policy Value</span><span className="w-32 text-right">Decision Signal</span>
                    </div>

                    {filtered.length === 0
                        ? <div className="p-6 text-center text-sm text-muted-foreground">No settings match current filter.</div>
                        : (
                            <div className="divide-y">
                                {filtered.map((r, i) => {
                                    const key = r.id + i;
                                    const expanded = expandedSettings.has(key);
                                    const hasChildren = (r.childSettings?.length ?? 0) > 0;
                                    const hasDetail = !!(r.description && r.description !== r.name) || (r.keywords?.length ?? 0) > 0 || hasChildren;
                                    const rowBg =
                                        r.settingCheckState === 'InBothTheSame'   ? 'bg-green-50/30 dark:bg-green-900/10' :
                                        r.settingCheckState === 'InBothDifferent' ? 'bg-red-50/30 dark:bg-red-900/10'    :
                                        r.settingCheckState === 'InSource'        ? 'bg-blue-50/30 dark:bg-blue-900/10'  :
                                                                                    '';
                                    return (
                                        <div key={i}>
                                            {/* Summary row — always clickable */}
                                            <div className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2.5 text-sm items-start cursor-pointer hover:bg-muted/10 ${rowBg}`}
                                                onClick={() => toggleSetting(key)}>
                                                <div className="flex items-start gap-2 min-w-0">
                                                    {expanded
                                                        ? <ChevronDown className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                        : <ChevronRight className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    }
                                                    <p className="text-xs font-medium break-words">{r.name}</p>
                                                </div>
                                                <ValueCell value={r.values.sourceValue} definitionId={r.definitionId ?? r.id} resolvedMap={resolvedMap} />
                                                <ValueCell value={r.values.checkedValue} definitionId={r.definitionId ?? r.id} resolvedMap={resolvedMap} />
                                                <div className="w-32 flex justify-end">
                                                    <StatusBadge state={r.settingCheckState} />
                                                </div>
                                            </div>

                                            {/* Expanded detail panel */}
                                            {expanded && (
                                                <div className={`border-t ${rowBg}`}>
                                                    {/* Description + keywords */}
                                                    {hasDetail && (
                                                        <div className="px-9 py-3 space-y-2 border-b bg-muted/10">
                                                            {r.description && r.description !== r.name && (
                                                                <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                                                            )}
                                                            {r.keywords?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {r.keywords.map((k, ki) => (
                                                                        <span key={ki} className="text-[10px] px-1.5 py-0.5 rounded-full border bg-background text-muted-foreground">{k}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Child settings */}
                                                    {hasChildren && (
                                                        <div className="bg-muted/5">
                                                            <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-9 py-1.5 text-[10px] font-medium text-muted-foreground bg-muted/20 border-b">
                                                                <span>Child Setting</span><span>New Policy</span><span>Existing Policy</span><span className="w-32" />
                                                            </div>
                                                            {r.childSettings.map((child, ci) => {
                                                                const isDiff = child.sourceValue !== child.targetValue;
                                                                return (
                                                                    <div key={ci} className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-9 py-2 text-xs items-start border-b last:border-b-0 ${isDiff ? 'bg-red-50/20 dark:bg-red-900/5' : 'bg-green-50/20 dark:bg-green-900/5'}`}>
                                                                        <span className="font-medium">{child.name}</span>
                                                                        <ValueCell value={child.sourceValue} definitionId={r.definitionId ?? r.id} resolvedMap={resolvedMap} />
                                                                        <ValueCell value={child.targetValue} definitionId={r.definitionId ?? r.id} resolvedMap={resolvedMap} />
                                                                        <div className="w-32 flex justify-end">
                                                                            {isDiff
                                                                                ? <span className="inline-flex items-center gap-1 text-red-600 text-xs"><AlertTriangle className="h-3 w-3" />Conflict</span>
                                                                                : <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />Same</span>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </CardContent>
            )}
        </Card>
    );
});

// ── Set-analysis status config ─────────────────────────────────────────────────

const setAnalysisStatusConfig: Record<SetAnalysisStatus, { label: string; badge: string; row: string; icon: React.ReactNode }> = {
    Match:          { label: 'Match',            badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300',   row: 'bg-green-50/20 dark:bg-green-900/5',  icon: <CheckCircle2 className="h-3 w-3" /> },
    Duplicate:      { label: 'Duplicate',         badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',   row: 'bg-amber-50/20 dark:bg-amber-900/5',  icon: <AlertTriangle className="h-3 w-3" /> },
    Conflict:       { label: 'Conflict',          badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300',             row: 'bg-red-50/30 dark:bg-red-900/10',     icon: <AlertTriangle className="h-3 w-3" /> },
    MissingInLeft:  { label: 'Missing in left',   badge: 'bg-muted text-muted-foreground border-border',                                             row: '',                                    icon: <MinusCircle className="h-3 w-3" /> },
    MissingInRight: { label: 'Missing in right',  badge: 'bg-muted text-muted-foreground border-border',                                             row: '',                                    icon: <MinusCircle className="h-3 w-3" /> },
    NewInLeft:      { label: 'New in left',       badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',        row: 'bg-blue-50/20 dark:bg-blue-900/5',    icon: <Sparkles className="h-3 w-3" /> },
    NewInRight:     { label: 'New in right',      badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300', row: 'bg-purple-50/20 dark:bg-purple-900/5', icon: <Sparkles className="h-3 w-3" /> },
    Overlap:        { label: 'Overlap',           badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',   row: 'bg-orange-50/20 dark:bg-orange-900/5',  icon: <Layers className="h-3 w-3" /> },
};

function SetAnalysisStatusBadge({ status }: { status: SetAnalysisStatus }) {
    const c = setAnalysisStatusConfig[status] ?? { label: status, badge: 'bg-muted text-muted-foreground border-border', icon: null };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ${c.badge}`}>
            {c.icon}{c.label}
        </span>
    );
}

// ── SetAnalysisView ────────────────────────────────────────────────────────────

function SetAnalysisView({ items, summary, resolvedMap }: {
    items: SetAnalysisItem[];
    summary: SetAnalysisSummary;
    resolvedMap: ResolvedMap;
}) {
    const [statusFilter, setStatusFilter] = useState<SetAnalysisStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const filtered = useMemo(() => items.filter(s => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (search && !s.settingName.toLowerCase().includes(search.toLowerCase()) &&
            !s.settingDefinitionId.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }), [items, statusFilter, search]);

    const toggle = (id: string) => setExpandedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const total = summary.totalSettings;
    const pct = (n: number) => total === 0 ? '0%' : `${Math.round((n / total) * 100)}%`;

    const kpis: { label: string; count: number; color: string; status?: SetAnalysisStatus | 'all'; icon: React.ReactNode }[] = [
        { label: 'Total settings', count: total,                       color: 'bg-muted',            icon: <GitCompare className="h-5 w-5 text-muted-foreground" /> },
        { label: 'Match',          count: summary.matchCount,          color: 'bg-green-500/10',     status: 'Match',          icon: <CheckCircle2 className="h-5 w-5 text-green-600" /> },
        { label: 'Duplicate',      count: summary.duplicateCount,      color: 'bg-amber-500/10',     status: 'Duplicate',      icon: <AlertTriangle className="h-5 w-5 text-amber-500" /> },
        { label: 'Conflict',       count: summary.conflictCount,       color: 'bg-red-500/10',       status: 'Conflict',       icon: <AlertTriangle className="h-5 w-5 text-red-600" /> },
        { label: 'New in left',    count: summary.newInLeftCount,      color: 'bg-blue-500/10',      status: 'NewInLeft',      icon: <Sparkles className="h-5 w-5 text-blue-600" /> },
        { label: 'New in right',   count: summary.newInRightCount,     color: 'bg-purple-500/10',    status: 'NewInRight',     icon: <Sparkles className="h-5 w-5 text-purple-600" /> },
        { label: 'Missing in left', count: summary.missingInLeftCount, color: 'bg-muted',            status: 'MissingInLeft',  icon: <MinusCircle className="h-5 w-5 text-muted-foreground" /> },
        { label: 'Missing in right', count: summary.missingInRightCount, color: 'bg-muted',          status: 'MissingInRight', icon: <MinusCircle className="h-5 w-5 text-muted-foreground" /> },
    ];

    return (
        <div className="space-y-5">
            {/* KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {kpis.map(k => (
                    <Card key={k.label}
                        className={`cursor-pointer hover:border-primary/40 transition-colors ${statusFilter === k.status ? 'border-primary ring-1 ring-primary/30' : ''}`}
                        onClick={() => setStatusFilter(k.status === statusFilter ? 'all' : (k.status ?? 'all'))}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${k.color}`}>{k.icon}</div>
                                <div>
                                    <p className="text-xs text-muted-foreground leading-tight">{k.label}</p>
                                    <p className="text-xl font-bold leading-tight">{k.count}</p>
                                    {k.status && k.status !== 'all' && (
                                        <p className="text-[10px] text-muted-foreground">{pct(k.count)}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Coverage bar */}
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted gap-px">
                {summary.matchCount > 0     && <div className="bg-green-500 h-full"        style={{ width: pct(summary.matchCount) }}     title={`Match: ${summary.matchCount}`} />}
                {summary.duplicateCount > 0 && <div className="bg-amber-400 h-full"        style={{ width: pct(summary.duplicateCount) }} title={`Duplicate: ${summary.duplicateCount}`} />}
                {summary.conflictCount > 0  && <div className="bg-red-400 h-full"          style={{ width: pct(summary.conflictCount) }}  title={`Conflict: ${summary.conflictCount}`} />}
                {summary.newInLeftCount > 0 && <div className="bg-blue-400 h-full"         style={{ width: pct(summary.newInLeftCount) }} title={`New in left: ${summary.newInLeftCount}`} />}
                {summary.newInRightCount > 0 && <div className="bg-purple-400 h-full"      style={{ width: pct(summary.newInRightCount) }} title={`New in right: ${summary.newInRightCount}`} />}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm"
                    onClick={() => setStatusFilter('all')} className="text-xs h-7 px-2.5">
                    All ({total})
                </Button>
                {(['Match', 'Duplicate', 'Conflict', 'NewInLeft', 'NewInRight', 'MissingInLeft', 'MissingInRight'] as SetAnalysisStatus[]).map(s => {
                    const c = kpis.find(k => k.status === s);
                    if (!c || c.count === 0) return null;
                    return (
                        <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
                            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)} className="text-xs h-7 px-2.5">
                            {setAnalysisStatusConfig[s].label} ({c.count})
                        </Button>
                    );
                })}
                <div className="flex items-center gap-1 ml-auto">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search settings…" value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border rounded px-2 py-1 text-xs bg-background w-48 outline-none focus:ring-1 focus:ring-primary/50" />
                    {search && <button onClick={() => setSearch('')}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-3 px-4 py-2.5 bg-muted/10 border-b text-xs font-medium text-muted-foreground">
                    <span>Setting</span>
                    <span className="text-blue-700 dark:text-blue-300">← Left policies</span>
                    <span className="text-purple-700 dark:text-purple-300">Right policies →</span>
                    <span className="w-32 text-right">Status</span>
                </div>
                {filtered.length === 0
                    ? <div className="p-8 text-center text-sm text-muted-foreground">No settings match the current filter.</div>
                    : filtered.map(item => {
                        const cfg = setAnalysisStatusConfig[item.status] ?? { label: item.status, badge: 'bg-muted text-muted-foreground border-border', row: '', icon: null };
                        const isExpanded = expandedIds.has(item.settingDefinitionId);
                        return (
                            <div key={item.settingDefinitionId} className={`border-b last:border-b-0 ${cfg.row}`}>
                                {/* Collapsed row */}
                                <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-3 px-4 py-2.5 items-start cursor-pointer hover:bg-muted/10"
                                    onClick={() => toggle(item.settingDefinitionId)}>
                                    {/* Setting name */}
                                    <div className="flex items-start gap-1.5 min-w-0">
                                        {isExpanded
                                            ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                            : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />}
                                        <div className="min-w-0">
                                            <span className="text-xs font-medium break-words">{item.settingName}</span>
                                            {item.settingName !== item.settingDefinitionId && (
                                                <span className="block font-mono text-[10px] text-muted-foreground/50 break-all">{item.settingDefinitionId}</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Left summary */}
                                    <div className="min-w-0 space-y-0.5" onClick={e => e.stopPropagation()}>
                                        {item.leftOccurrences.length === 0
                                            ? <span className="italic text-muted-foreground/50 text-xs">—</span>
                                            : (() => {
                                                const uniqueVals = [...new Map(item.leftOccurrences.map(o => [o.value, o])).values()];
                                                return uniqueVals.map((o, i) => {
                                                    const friendly = resolvedMap.size > 0
                                                        ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary
                                                        : o.value;
                                                    return <div key={i} className="text-xs text-blue-800 dark:text-blue-200">{friendly}</div>;
                                                });
                                            })()
                                        }
                                        {item.leftOccurrences.length > 0 && (
                                            <span className="text-[10px] text-muted-foreground">{item.leftOccurrences.length} {item.leftOccurrences.length === 1 ? 'policy' : 'policies'}</span>
                                        )}
                                    </div>
                                    {/* Right summary */}
                                    <div className="min-w-0 space-y-0.5" onClick={e => e.stopPropagation()}>
                                        {item.rightOccurrences.length === 0
                                            ? <span className="italic text-muted-foreground/50 text-xs">—</span>
                                            : (() => {
                                                const uniqueVals = [...new Map(item.rightOccurrences.map(o => [o.value, o])).values()];
                                                return uniqueVals.map((o, i) => {
                                                    const friendly = resolvedMap.size > 0
                                                        ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary
                                                        : o.value;
                                                    return <div key={i} className="text-xs text-purple-800 dark:text-purple-200">{friendly}</div>;
                                                });
                                            })()
                                        }
                                        {item.rightOccurrences.length > 0 && (
                                            <span className="text-[10px] text-muted-foreground">{item.rightOccurrences.length} {item.rightOccurrences.length === 1 ? 'policy' : 'policies'}</span>
                                        )}
                                    </div>
                                    <div className="shrink-0 w-32 flex justify-end">
                                        <SetAnalysisStatusBadge status={item.status} />
                                    </div>
                                </div>

                                {/* Expanded per-policy detail */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 border-t bg-muted/5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                                                    Left — {item.leftOccurrences.length} {item.leftOccurrences.length === 1 ? 'policy' : 'policies'}
                                                </p>
                                                {item.leftOccurrences.length === 0
                                                    ? <span className="italic text-xs text-muted-foreground/50">Not present</span>
                                                    : <div className="space-y-1.5">
                                                        {item.leftOccurrences.map((o, i) => {
                                                            const friendly = resolvedMap.size > 0
                                                                ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary
                                                                : o.value;
                                                            return (
                                                                <div key={i} className="text-xs space-y-0.5">
                                                                    <p className="font-medium text-blue-700 dark:text-blue-300 truncate" title={o.policyName}>{o.policyName}</p>
                                                                    <p className="text-muted-foreground">{friendly}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                }
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2">
                                                    Right — {item.rightOccurrences.length} {item.rightOccurrences.length === 1 ? 'policy' : 'policies'}
                                                </p>
                                                {item.rightOccurrences.length === 0
                                                    ? <span className="italic text-xs text-muted-foreground/50">Not present</span>
                                                    : <div className="space-y-1.5">
                                                        {item.rightOccurrences.map((o, i) => {
                                                            const friendly = resolvedMap.size > 0
                                                                ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary
                                                                : o.value;
                                                            return (
                                                                <div key={i} className="text-xs space-y-0.5">
                                                                    <p className="font-medium text-purple-700 dark:text-purple-300 truncate" title={o.policyName}>{o.policyName}</p>
                                                                    <p className="text-muted-foreground">{friendly}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                }
            </Card>
            <p className="text-xs text-muted-foreground text-right">Showing {filtered.length} of {total} settings</p>
        </div>
    );
}

// ── Scope tag filter ───────────────────────────────────────────────────────────

function ScopeTagFilter({ scopeTags, value, onChange, label }: {
    scopeTags: ScopeTag[];
    value: string;
    onChange: (v: string) => void;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="flex-1 rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50">
                <option value="">All scope tags</option>
                {scopeTags.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
            </select>
            {value && (
                <button onClick={() => onChange('')} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PolicyComparison() {
    const { accounts, instance } = useMsal();
    const { request } = useApiRequest();

    const [policies, setPolicies] = useState<Policy[]>([]);
    const [scopeTags, setScopeTags] = useState<ScopeTag[]>([]);
    const [loadingScopeTags, setLoadingScopeTags] = useState(false);
    const [sourcePolicyIds, setSourcePolicyIds] = useState<string[]>([]);
    const [leftScopeTagFilter, setLeftScopeTagFilter] = useState('');
    const [existingPolicyIds, setExistingPolicyIds] = useState<string[]>([]);
    const [rightScopeTagFilter, setRightScopeTagFilter] = useState('');
    const [results, setResults] = useState<PolicyCompareResult[]>([]);
    const [setAnalysisItems, setSetAnalysisItems] = useState<SetAnalysisItem[] | null>(null);
    const [setAnalysisSummary, setSetAnalysisSummary] = useState<SetAnalysisSummary | null>(null);
    const [resolvedMap, setResolvedMap] = useState<ResolvedMap>(new Map());
    const [loadingPolicies, setLoadingPolicies] = useState(false);
    const [comparing, setComparing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectionCollapsed, setSelectionCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<'coverage' | 'detail' | 'summary'>('coverage');
    const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
    const [detailFilter, setDetailFilter] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const abortRef = useRef<AbortController | null>(null);
    const BATCH_SIZE = 25;

    const fetchScopeTags = useCallback(async () => {
        if (!accounts.length) return;
        setLoadingScopeTags(true);
        try {
            const resp = await request<{ status: string; data: ScopeTag[] }>(ROLE_SCOPETAGS_ENDPOINT, { method: 'GET' });
            const raw = resp?.data?.data;
            setScopeTags(Array.isArray(raw) ? raw as ScopeTag[] : []);
        } catch { /* non-critical */ } finally { setLoadingScopeTags(false); }
    }, [accounts, request]);

    const fetchPolicies = useCallback(async () => {
        if (!accounts.length) return;
        setLoadingPolicies(true);
        setError(null);
        try {
            const response = await request<PoliciesApiResponse>(CONFIGURATION_POLICIES_ENDPOINT);
            const data = (response?.data as unknown as { data: { data: Policy[] } })?.data?.data
                      ?? (response?.data as unknown as { data: Policy[] })?.data;
            if (Array.isArray(data)) setPolicies(data);
            else throw new Error('Unexpected response format');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch policies');
        } finally {
            setLoadingPolicies(false);
        }
    }, [accounts.length, request]);

    useEffect(() => { if (accounts.length) fetchScopeTags(); }, [accounts.length]);

    /** Helper: does a policy have a given scope tag ID */
    const policyHasTag = (p: Policy, tagId: string) =>
        p.roleScopeTags?.includes(tagId) || p.roleScopeTagIds?.includes(tagId) || false;

    /** Left-side options: filtered by left scope tag */
    const leftPolicyOptions = useMemo(() =>
        leftScopeTagFilter
            ? policies.filter(p => policyHasTag(p, leftScopeTagFilter))
            : policies,
        [policies, leftScopeTagFilter]
    );

    /** Right-side options: filtered by right scope tag, and optionally narrowed
     *  to platform/type that at least one left policy shares */
    const existingPolicyOptions = useMemo(() => {
        let opts = policies.filter(p => !sourcePolicyIds.includes(p.id));
        // Scope tag filter
        if (rightScopeTagFilter) opts = opts.filter(p => policyHasTag(p, rightScopeTagFilter));
        // If left policies selected, optionally limit to matching platform/type combos
        if (sourcePolicyIds.length > 0) {
            const sourcePolicies = policies.filter(p => sourcePolicyIds.includes(p.id));
            const combos = new Set(sourcePolicies.map(p => `${p.platform}|${p.policyType}`));
            opts = opts.filter(p => combos.has(`${p.platform}|${p.policyType}`));
        }
        return opts;
    }, [policies, sourcePolicyIds, rightScopeTagFilter]);

    const cancelCompare = () => { abortRef.current?.abort(); abortRef.current = null; setComparing(false); setBatchProgress(null); };

    const runCompare = async () => {
        if (sourcePolicyIds.length === 0 || existingPolicyIds.length === 0 || !accounts.length) return;
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setComparing(true);
        setError(null);
        setResolvedMap(new Map());
        setResults([]);
        setSetAnalysisItems(null);
        setSetAnalysisSummary(null);
        setPage(0);

        try {
            const tokenResp = await instance.acquireTokenSilent({ scopes: [apiScope], account: accounts[0] });
            const accessToken = tokenResp.accessToken;
            const allResults: PolicyCompareResult[] = [];

            const sourcePolicies = policies.filter(p => sourcePolicyIds.includes(p.id));
            const existingPolicies = policies.filter(p => existingPolicyIds.includes(p.id));

            if (sourcePolicyIds.length === 1) {
                // ── Single source: group right-side by type and send a request per type ──
                const sourcePolicy = sourcePolicies[0];
                const policyType = sourcePolicy?.policyType ?? 'SettingsCatalog';
                // Only compare right-side policies of the same type
                const matchingRight = existingPolicies.filter(p => p.policyType === policyType).map(p => p.id);

                if (matchingRight.length === 0) {
                    setError('No existing policies of the same type as the selected source policy.');
                    setComparing(false);
                    return;
                }

                const batches: string[][] = [];
                for (let i = 0; i < matchingRight.length; i += BATCH_SIZE)
                    batches.push(matchingRight.slice(i, i + BATCH_SIZE));

                setBatchProgress({ done: 0, total: batches.length });

                for (let b = 0; b < batches.length; b++) {
                    if (controller.signal.aborted) return;

                    const response = await apiRequest<MultiComparisonResponse>(
                        `${COMPARE_ENDPOINT}/${policyType}`,
                        {
                            method: 'POST',
                            body: JSON.stringify({ SourcePolicyId: sourcePolicyIds[0], ComparePolicyIds: batches[b] }),
                            signal: controller.signal,
                        },
                        accessToken
                    );
                    if (controller.signal.aborted) return;

                    const raw = response?.data?.data;
                    if (raw) {
                        const batchArr: PolicyCompareResult[] = Array.isArray(raw) ? raw : [raw];
                        allResults.push(...batchArr);
                        setResults([...allResults]);
                    }
                    setBatchProgress({ done: b + 1, total: batches.length });
                }
            } else {
                // ── Multiple sources: group by policyType and send one set-analysis request per type ──
                // Build a map: policyType → { leftIds, rightIds }
                const typeGroups = new Map<string, { leftIds: string[]; rightIds: string[] }>();
                for (const p of sourcePolicies) {
                    if (!typeGroups.has(p.policyType)) typeGroups.set(p.policyType, { leftIds: [], rightIds: [] });
                    typeGroups.get(p.policyType)!.leftIds.push(p.id);
                }
                for (const p of existingPolicies) {
                    if (typeGroups.has(p.policyType)) {
                        typeGroups.get(p.policyType)!.rightIds.push(p.id);
                    }
                    // Silently skip right-side policies whose type has no left-side counterpart
                }

                const typeEntries = [...typeGroups.entries()].filter(([, g]) => g.leftIds.length > 0 && g.rightIds.length > 0);
                if (typeEntries.length === 0) {
                    setError('No matching policy types between left and right selections. Please compare policies of the same type.');
                    setComparing(false);
                    return;
                }

                setBatchProgress({ done: 0, total: typeEntries.length });

                const allSetItems: SetAnalysisItem[] = [];
                let mergedSummary: SetAnalysisSummary | null = null;

                for (let t = 0; t < typeEntries.length; t++) {
                    if (controller.signal.aborted) return;
                    const [policyType, group] = typeEntries[t];

                    const response = await apiRequest<{ data: SetAnalysisResponse }>(
                        COMPARE_SET_ANALYSIS_ENDPOINT(policyType),
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                leftPolicyIds: group.leftIds,
                                rightPolicyIds: group.rightIds,
                            }),
                            signal: controller.signal,
                        },
                        accessToken
                    );
                    if (controller.signal.aborted) return;

                    const rawResp = response?.data as unknown as Record<string, unknown>;
                    const saResp: SetAnalysisResponse | null =
                        (rawResp?.summary !== undefined && Array.isArray(rawResp?.data))
                            ? (rawResp as unknown as SetAnalysisResponse)
                            : ((rawResp?.data as Record<string, unknown>)?.summary !== undefined &&
                               Array.isArray((rawResp?.data as Record<string, unknown>)?.data))
                                ? (rawResp.data as unknown as SetAnalysisResponse)
                                : null;

                    if (saResp?.data) {
                        allSetItems.push(...saResp.data.map(item => ({
                            ...item,
                            status: normalizeSetAnalysisStatus(item.status),
                        })));
                        if (!mergedSummary) {
                            mergedSummary = { ...saResp.summary };
                        } else {
                            // Merge summaries across types
                            const s = saResp.summary;
                            mergedSummary.leftPolicyCount  += s.leftPolicyCount;
                            mergedSummary.rightPolicyCount += s.rightPolicyCount;
                            mergedSummary.matchCount       += s.matchCount;
                            mergedSummary.overlapCount     += s.overlapCount;
                            mergedSummary.conflictCount    += s.conflictCount;
                            mergedSummary.duplicateCount   += s.duplicateCount;
                            mergedSummary.missingInRightCount += s.missingInRightCount;
                            mergedSummary.missingInLeftCount  += s.missingInLeftCount;
                            mergedSummary.totalSettings    += s.totalSettings;
                            mergedSummary.newInLeftCount   += s.newInLeftCount;
                            mergedSummary.newInRightCount  += s.newInRightCount;
                        }
                    }
                    setBatchProgress({ done: t + 1, total: typeEntries.length });
                }

                if (allSetItems.length > 0 && mergedSummary) {
                    setSetAnalysisItems(allSetItems);
                    setSetAnalysisSummary(mergedSummary);
                    // Resolve definitions for friendly values
                    const ids = [...new Set(allSetItems.map(i => i.settingDefinitionId))];
                    if (ids.length > 0) {
                        try {
                            const resolveResp = await apiRequest<ResolveApiResponse>(
                                SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT,
                                { method: 'POST', body: JSON.stringify(ids) },
                                accessToken
                            );
                            const defs = resolveResp?.data?.data ?? [];
                            const map: ResolvedMap = new Map();
                            defs.forEach(d => map.set(d.id.toLowerCase(), d));
                            setResolvedMap(map);
                        } catch { /* non-critical */ }
                    }
                }
            }

            setSelectionCollapsed(true);
            setActiveTab('coverage');

            // Resolve setting definitions for friendly value display
            try {
                const settingIds = [...new Set(
                    allResults.flatMap(r => (r.checkResults ?? []).map(c => c.definitionId ?? c.id).filter(Boolean))
                )];
                if (settingIds.length > 0) {
                    const resolveResp = await apiRequest<ResolveApiResponse>(
                        SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT,
                        { method: 'POST', body: JSON.stringify(settingIds) },
                        accessToken
                    );
                    const defs = resolveResp?.data?.data ?? [];
                    const map: ResolvedMap = new Map();
                    defs.forEach(d => map.set(d.id.toLowerCase(), d));
                    setResolvedMap(map);
                }
            } catch { /* non-critical */ }
        } catch (err) {
            if ((err as Error)?.name !== 'AbortError') setError(err instanceof Error ? err.message : 'Comparison failed');
        } finally {
            if (!controller.signal.aborted) { abortRef.current = null; setComparing(false); setBatchProgress(null); }
        }
    };

    const globalSummary = useMemo(() => {
        if (!results.length) return null;
        let total = 0, same = 0, conflicts = 0, newOnly = 0, existOnly = 0;
        for (const r of results) {
            const cr = r.checkResults ?? [];
            total    += cr.length;
            same     += cr.filter(c => c.settingCheckState === 'InBothTheSame').length;
            conflicts += cr.filter(c => c.settingCheckState === 'InBothDifferent').length;
            newOnly  += cr.filter(c => c.settingCheckState === 'InSource').length;
            existOnly += cr.filter(c => c.settingCheckState === 'InChecked').length;
        }
        return {
            total, same, conflicts, newOnly, existOnly, policies: results.length,
            coveredPercent:  total === 0 ? 0 : Math.round((same / total) * 100),
            conflictPercent: total === 0 ? 0 : Math.round((conflicts / total) * 100),
            newPercent:      total === 0 ? 0 : Math.round((newOnly / total) * 100),
        };
    }, [results]);

    /** Per-setting aggregate across ALL compared policies.
     *  Priority: InBothTheSame > InBothDifferent > InSource (not in any policy) */
    const settingCoverage = useMemo((): SettingCoverageRow[] => {
        if (!results.length) return [];
        // Collect all settings that come from the source (new) policy
        // i.e. InSource, InBothTheSame, InBothDifferent — anything the new policy *has*
        const map = new Map<string, SettingCoverageRow>();

        for (const r of results) {
            for (const c of r.checkResults ?? []) {
                if (c.settingCheckState === 'InChecked') continue; // only in existing, not in new policy
                const key = c.id;
                if (!map.has(key)) {
                    map.set(key, {
                        id: c.id,
                        definitionId: c.definitionId ?? c.id,
                        name: c.name,
                        sourceValue: c.values?.sourceValue ?? '',
                        status: 'notInTenant',
                        matchedIn: [],
                        conflictedIn: [],
                    });
                }
                const row = map.get(key)!;
                if (c.settingCheckState === 'InBothTheSame') {
                    row.matchedIn.push({ policyName: r.checkedPolicyName, value: c.values?.checkedValue ?? '' });
                } else if (c.settingCheckState === 'InBothDifferent') {
                    row.conflictedIn.push({ policyName: r.checkedPolicyName, value: c.values?.checkedValue ?? '' });
                }
                // Re-derive status from accumulated data
                if (row.matchedIn.length > 0) {
                    row.status = 'covered';
                } else if (row.conflictedIn.length > 0) {
                    row.status = 'conflict';
                }
            }
        }

        // Sort: notInTenant first, then conflict, then covered
        const order: Record<SettingOverallStatus, number> = { notInTenant: 0, conflict: 1, covered: 2 };
        return [...map.values()].sort((a, b) => order[a.status] - order[b.status]);
    }, [results]);

    const coverageSummary = useMemo(() => {
        if (!settingCoverage.length) return null;
        const total = settingCoverage.length;
        const covered = settingCoverage.filter(s => s.status === 'covered').length;
        const conflict = settingCoverage.filter(s => s.status === 'conflict').length;
        const notInTenant = settingCoverage.filter(s => s.status === 'notInTenant').length;
        return { total, covered, conflict, notInTenant };
    }, [settingCoverage]);

    const exportCSV = () => {
        if (!results.length) return;
        const rows = results.flatMap(r => (r.checkResults ?? []).map(c => ({
            'New Policy': r.sourcePolicyName, 'Existing Policy': r.checkedPolicyName,
            'Setting': c.name, 'Setting ID': c.id,
            'New Policy Value': c.values.sourceValue, 'Existing Policy Value': c.values.checkedValue,
            'Decision Signal': stateLabel[c.settingCheckState],
        })));
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h as keyof typeof r] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'policy-decision-analysis.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    // Card-level pagination for the detail view
    const filteredResults = useMemo(() => {
        if (!detailFilter) return results;
        // Only show policies that actually have conflicts or new-only settings
        return results.filter(r => (r.checkResults ?? []).some(c =>
            c.settingCheckState === 'InBothDifferent' || c.settingCheckState === 'InSource'
        ));
    }, [results, detailFilter]);

    const pageCount = Math.ceil(filteredResults.length / pageSize);
    const pagedResults = useMemo(() =>
        filteredResults.slice(page * pageSize, (page + 1) * pageSize),
        [filteredResults, page, pageSize]
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Compare existing policies in your environment
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Select a new (unassigned) policy and compare it against existing policies to identify coverage, conflicts, and unique settings before enabling it.
                    </p>
                </div>
                {results.length > 0 && (
                    <div className="flex gap-2">
                        {comparing ? (
                            <Button variant="outline" size="sm" onClick={cancelCompare} className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5">
                                <XCircle className="h-4 w-4" />Cancel
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={runCompare} disabled={sourcePolicyIds.length === 0 || existingPolicyIds.length === 0}>
                                <RefreshCw className="h-4 w-4 mr-2" />Re-run
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={exportCSV} disabled={comparing}>
                            <Download className="h-4 w-4 mr-2" />Export CSV
                        </Button>
                    </div>
                )}
            </div>

            {/* Selection card */}
            <Card>
                <CardHeader className="cursor-pointer select-none" onClick={() => setSelectionCollapsed(c => !c)}>
                    <CardTitle className="text-base flex items-center gap-2">
                        {selectionCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        Policy Selection
                        {selectionCollapsed && sourcePolicyIds.length > 0 && (
                            <span className="ml-2 flex gap-1.5 flex-wrap">
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">{sourcePolicyIds.length} source {sourcePolicyIds.length === 1 ? 'policy' : 'policies'}</Badge>
                                <span className="text-xs text-muted-foreground self-center">vs {existingPolicyIds.length} existing</span>
                            </span>
                        )}
                    </CardTitle>
                    {!selectionCollapsed && (
                        <CardDescription className="mt-1">
                            Select one or more <strong>source policies</strong> on the left and one or more <strong>target policies</strong> on the right.
                            Use scope tag filters to quickly narrow down each side.
                            {policies.length > 0 && <> Found <strong>{policies.length}</strong> policies.</>}
                        </CardDescription>
                    )}
                </CardHeader>

                {!selectionCollapsed && (
                    <CardContent className="space-y-4" onClick={e => e.stopPropagation()}>
                        {policies.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <GitCompare className="h-12 w-12 text-muted-foreground/40" />
                                <p className="text-muted-foreground text-sm">Load policies to get started.</p>
                                <Button onClick={fetchPolicies} disabled={loadingPolicies} className="gap-2">
                                    {loadingPolicies ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    {loadingPolicies ? 'Loading…' : 'Load Policies'}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left side — source policies */}
                                    <div className="space-y-2">
                                        <ScopeTagFilter
                                            scopeTags={scopeTags}
                                            value={leftScopeTagFilter}
                                            onChange={v => { setLeftScopeTagFilter(v); setSourcePolicyIds([]); }}
                                            label="Filter by scope tag:"
                                        />
                                        <MultiPolicySelect
                                            selectedIds={sourcePolicyIds}
                                            onChange={ids => { setSourcePolicyIds(ids); setExistingPolicyIds(prev => prev.filter(id => !ids.includes(id))); }}
                                            options={leftPolicyOptions}
                                            label="Source Policies (left side)"
                                            placeholder="Select one or more source policies…"
                                            disabled={comparing}
                                        />
                                        {sourcePolicyIds.length > 0 && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                {sourcePolicyIds.length === 1
                                                    ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" />Single source — uses <code className="bg-muted px-1 rounded">compare/{'{type}'}</code></>
                                                    : <><Sparkles className="h-3.5 w-3.5 text-blue-500" />{sourcePolicyIds.length} sources — uses <code className="bg-muted px-1 rounded">compare/{'{type}'}/set-analysis</code></>
                                                }
                                            </p>
                                        )}
                                        {loadingScopeTags && <p className="text-xs text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" />Loading scope tags…</p>}
                                    </div>

                                    {/* Right side — target policies */}
                                    <div className="space-y-2">
                                        <ScopeTagFilter
                                            scopeTags={scopeTags}
                                            value={rightScopeTagFilter}
                                            onChange={v => { setRightScopeTagFilter(v); setExistingPolicyIds([]); }}
                                            label="Filter by scope tag:"
                                        />
                                        <MultiPolicySelect
                                            selectedIds={existingPolicyIds}
                                            onChange={setExistingPolicyIds}
                                            options={existingPolicyOptions}
                                            label={`Target Policies (right side)${sourcePolicyIds.length > 0 ? ' — filtered to matching platform/type' : ''}`}
                                            placeholder={sourcePolicyIds.length > 0 ? 'Select target policies…' : 'Select source policies first…'}
                                            disabled={comparing}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button onClick={runCompare} disabled={sourcePolicyIds.length === 0 || existingPolicyIds.length === 0 || comparing || !accounts.length} className="gap-2">
                                        <ShieldCheck className="h-4 w-4" />
            {results.length > 0 ? 'Re-run Analysis' : setAnalysisItems ? 'Re-run Set Analysis' : 'Analyse Policy Overlap'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => { fetchPolicies(); fetchScopeTags(); }} disabled={loadingPolicies}>
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingPolicies ? 'animate-spin' : ''}`} />Refresh
                                    </Button>
                                    {!accounts.length && <span className="text-sm text-amber-600 flex items-center gap-1"><Info className="h-4 w-4" />Sign in first.</span>}
                                </div>
                            </>
                        )}
                    </CardContent>
                )}
            </Card>

            {comparing && <LoadingBanner onCancel={cancelCompare} batchProgress={batchProgress} />}

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-4">
                        <p className="text-destructive text-sm flex items-center gap-2"><XCircle className="h-4 w-4" />{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* ── Set-analysis results (multi-source) ─────────────────────────── */}
            {setAnalysisItems && setAnalysisSummary && !comparing && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <GitCompare className="h-5 w-5 text-primary" />Set Analysis Results
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {sourcePolicyIds.length} left × {existingPolicyIds.length} right policies · {setAnalysisSummary.totalSettings} unique settings
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                            if (!setAnalysisItems?.length) return;
                            const rows = setAnalysisItems.flatMap(i => [
                                ...i.leftOccurrences.map(o => ({ 'Setting ID': i.settingDefinitionId, 'Setting Name': i.settingName, Status: i.status, Side: 'Left', Policy: o.policyName, Value: o.value })),
                                ...i.rightOccurrences.map(o => ({ 'Setting ID': i.settingDefinitionId, 'Setting Name': i.settingName, Status: i.status, Side: 'Right', Policy: o.policyName, Value: o.value })),
                            ]);
                            const headers = Object.keys(rows[0]);
                            const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h as keyof typeof r] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
                            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'set-analysis.csv'; a.click();
                        }} className="gap-1.5">
                            <Download className="h-4 w-4" />Export CSV
                        </Button>
                    </div>
                    <SetAnalysisView items={setAnalysisItems} summary={setAnalysisSummary} resolvedMap={resolvedMap} />
                </div>
            )}

            {/* ── Single-source results ────────────────────────────────────────── */}
            {results.length > 0 && globalSummary && !comparing && (
                <div className="space-y-6">
                    {/* Decision card */}
                    <DecisionCard results={results} />

                    {/* KPI cards — per-setting aggregate (not per policy-pair) */}
                    {coverageSummary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setActiveTab('coverage')}>
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10"><ShieldCheck className="h-5 w-5 text-green-600" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Covered settings</p>
                                            <p className={`text-2xl font-bold ${coverageSummary.covered / coverageSummary.total >= 0.8 ? 'text-green-600' : coverageSummary.covered / coverageSummary.total >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>{smartPct(coverageSummary.covered, coverageSummary.total)}</p>
                                            <p className="text-xs text-muted-foreground">{coverageSummary.covered} of {coverageSummary.total} settings</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setActiveTab('coverage')}>
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/10"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Conflicting settings</p>
                                            <p className={`text-2xl font-bold ${coverageSummary.conflict > 0 ? 'text-red-600' : 'text-green-600'}`}>{smartPct(coverageSummary.conflict, coverageSummary.total)}</p>
                                            <p className="text-xs text-muted-foreground">{coverageSummary.conflict} of {coverageSummary.total} settings</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setActiveTab('coverage')}>
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10"><Sparkles className="h-5 w-5 text-blue-600" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Not in tenant</p>
                                            <p className={`text-2xl font-bold ${coverageSummary.notInTenant > 0 ? 'text-blue-600' : 'text-green-600'}`}>{smartPct(coverageSummary.notInTenant, coverageSummary.total)}</p>
                                            <p className="text-xs text-muted-foreground">{coverageSummary.notInTenant} of {coverageSummary.total} settings</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted"><GitCompare className="h-5 w-5 text-muted-foreground" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Policies analysed</p>
                                            <p className="text-2xl font-bold">{results.length}</p>
                                            <p className="text-xs text-muted-foreground">{coverageSummary.total} unique settings</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 border-b">
                        {(['coverage', 'detail', 'summary'] as const).map(tab => (
                            <button key={tab}
                                className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab === 'coverage'
                                    ? <><ShieldCheck className="h-4 w-4 inline mr-1" />Overall Coverage</>
                                    : tab === 'detail'
                                    ? <><Layers className="h-4 w-4 inline mr-1" />Per-Policy Detail</>
                                    : <><BarChart3 className="h-4 w-4 inline mr-1" />Summary</>}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'coverage' && coverageSummary && (
                        <CoverageTab
                            rows={settingCoverage}
                            summary={coverageSummary}
                            resolvedMap={resolvedMap}
                        />
                    )}

                    {activeTab === 'detail' && (
                        <div className="space-y-4">
                            {/* Toolbar */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button variant={detailFilter ? 'default' : 'outline'} size="sm" onClick={() => { setDetailFilter(f => !f); setPage(0); }} className="gap-2">
                                    {detailFilter ? <X className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                    {detailFilter ? 'Show all policies' : 'Conflicts / new only'}
                                </Button>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {filteredResults.length} {detailFilter ? 'policies with conflicts/new settings' : 'policies'} · page {page + 1} of {Math.max(pageCount, 1)}
                                </span>
                                <div className="flex items-center gap-1 ml-auto">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, pageCount - 1))} disabled={page >= pageCount - 1}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {pagedResults.length === 0
                                ? <div className="p-6 text-center text-sm text-muted-foreground">No policies match current filter.</div>
                                : pagedResults.map(r => <ResultCard key={r.checkedPolicyId} result={r} resolvedMap={resolvedMap} />)
                            }

                            {/* Bottom pagination */}
                            {pageCount > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>
                                        <ChevronLeft className="h-4 w-4 mr-1" />Prev
                                    </Button>
                                    <span className="text-xs text-muted-foreground px-2">Page {page + 1} / {pageCount}</span>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, pageCount - 1))} disabled={page >= pageCount - 1}>
                                        Next<ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Per-Policy Overlap Breakdown</CardTitle>
                                <CardDescription>Coverage, conflicts and unique settings per existing policy compared.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {results.map(r => {
                                    const cr = r.checkResults ?? [];
                                    const t  = cr.length;
                                    const s  = cr.filter(c => c.settingCheckState === 'InBothTheSame').length;
                                    const d  = cr.filter(c => c.settingCheckState === 'InBothDifferent').length;
                                    const no = cr.filter(c => c.settingCheckState === 'InSource').length;
                                    const eo = cr.filter(c => c.settingCheckState === 'InChecked').length;
                                    const sp = t === 0 ? 0 : Math.round((s / t) * 100);
                                    const dp = t === 0 ? 0 : Math.round((d / t) * 100);
                                    return (
                                        <div key={r.checkedPolicyId} className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold">{r.checkedPolicyName}</span>
                                                <span className="text-xs text-muted-foreground">{t} settings</span>
                                            </div>
                                            <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
                                                {sp > 0 && <div className="bg-green-500 h-full" style={{ width: `${sp}%` }} />}
                                                {dp > 0 && <div className="bg-red-400 h-full"   style={{ width: `${dp}%` }} />}
                                                {t > 0   && <div className="bg-blue-400 h-full" style={{ width: `${Math.round((no / t) * 100)}%` }} />}
                                            </div>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { label: 'Covered',    n: s,  color: 'bg-green-500' },
                                                    { label: 'Conflict',   n: d,  color: 'bg-red-400' },
                                                    { label: 'New only',   n: no, color: 'bg-blue-400' },
                                                    { label: 'Exist only', n: eo, color: 'bg-muted-foreground' },
                                                ].map(k => (
                                                    <div key={k.label}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-muted-foreground">{k.label}</span>
                                                            <span className="font-medium">{smartPct(k.n, t)}</span>
                                                        </div>
                                                        <ProgressBar value={t === 0 ? 0 : Math.round((k.n / t) * 100)} color={k.color} />
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{k.n} settings</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
