'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    SETTINGS_LIBRARY_CHANGES_ENDPOINT,
    SETTINGS_LIBRARY_CHANGES_SUMMARY_ENDPOINT,
    SETTINGS_LIBRARY_CATEGORIES_ENDPOINT,
    BASELINE_LIBRARY_CHANGES_ENDPOINT,
} from '@/lib/constants';
import {
    ArrowLeft, Layers, Sparkles, Pencil, RefreshCw, Loader2, ChevronRight, XCircle, RotateCcw,
    AlertTriangle, ShieldCheck, Clock,
} from 'lucide-react';

// ─── Types (mirrors IntuneAssistant.Dto.Response.SettingsLibrary / BaselineLibrary) ────────────

interface ApiEnvelope<T> {
    status: string;
    message?: string | null;
    data: T;
    meta?: { totalCount?: number; hasMore?: boolean } & Record<string, unknown>;
}

interface ChangedProperty {
    changeType: string;
    category: string;
    importance: string;
    field: string | null;
    previousValue: string | null;
    currentValue: string | null;
}

interface SettingChange {
    changeType: string;
    category: string;
    importance: string;
    changedProperties: ChangedProperty[];
}

interface SettingChangeFeedEntry {
    settingId: string;
    graphDefinitionId: string;
    displayName: string | null;
    platforms: string[];
    technologies: string[];
    revisionId: string | null;
    revisionNumber: number | null;
    catalogSnapshotId: string | null;
    occurredAt: string;
    isNewSetting: boolean;
    change: SettingChange;
}

interface ChangeFeedSummary {
    addedCount: number;
    changedCount: number;
    removedCount: number;
    reappearedCount: number;
    deprecatedCount: number;
}

interface CatalogSettingCategory {
    id: string;
    platforms: string[];
    technologies: string[];
}

interface BaselineChangeFeedEntry {
    familyId: string;
    displayName: string | null;
    platforms: string | null;
    revisionId: string;
    version: number;
    displayVersion: string | null;
    lifecycleState: string;
    observedAt: string;
    isNewFamily: boolean;
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
}

type ChangeTypeFilter = 'Added' | 'Changed' | 'Removed' | 'Reappeared' | 'Deprecated';
type ChangelogTab = 'catalog' | 'templates';

const CHANGE_TYPE_BADGE: Record<string, { icon: React.ElementType; className: string; label: string }> = {
    Added: { icon: Sparkles, className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30', label: 'Added' },
    Changed: { icon: Pencil, className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30', label: 'Changed' },
    Removed: { icon: XCircle, className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30', label: 'Removed' },
    Reappeared: { icon: RotateCcw, className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', label: 'Reappeared' },
    Deprecated: { icon: AlertTriangle, className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30', label: 'Deprecated' },
    PossiblyRemoved: { icon: AlertTriangle, className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', label: 'Possibly removed' },
};

const CHANGE_TYPE_FILTERS: { type: ChangeTypeFilter; countKey: keyof ChangeFeedSummary }[] = [
    { type: 'Added', countKey: 'addedCount' },
    { type: 'Changed', countKey: 'changedCount' },
    { type: 'Deprecated', countKey: 'deprecatedCount' },
    { type: 'Removed', countKey: 'removedCount' },
    { type: 'Reappeared', countKey: 'reappearedCount' },
];

const IMPORTANCE_DOT: Record<string, string> = {
    High: 'bg-red-500',
    Medium: 'bg-amber-500',
    Low: 'bg-muted-foreground/40',
};

const LIFECYCLE_BADGE: Record<string, string> = {
    active: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
    superseded: 'bg-muted text-muted-foreground border-transparent',
    draft: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

const PAGE_SIZE = 50;

function formatDate(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return value;
    }
}

function formatDateForInput(date: Date) {
    return date.toISOString().slice(0, 10);
}

// Group entries by the calendar day they were observed on — a changelog reads far better as
// "what happened on Sep 3" than as one flat, undated list.
function groupByDay(entries: SettingChangeFeedEntry[]): { day: string; items: SettingChangeFeedEntry[] }[] {
    const groups = new Map<string, SettingChangeFeedEntry[]>();
    for (const entry of entries) {
        const day = entry.occurredAt.slice(0, 10);
        if (!groups.has(day)) groups.set(day, []);
        groups.get(day)!.push(entry);
    }
    return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([day, items]) => ({ day, items }));
}

function groupBaselineByDay(entries: BaselineChangeFeedEntry[]): { day: string; items: BaselineChangeFeedEntry[] }[] {
    const groups = new Map<string, BaselineChangeFeedEntry[]>();
    for (const entry of entries) {
        const day = entry.observedAt.slice(0, 10);
        if (!groups.has(day)) groups.set(day, []);
        groups.get(day)!.push(entry);
    }
    return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([day, items]) => ({ day, items }));
}

export default function SettingsLibraryChangelogPage() {
    const { request } = useApiRequest();
    const [tab, setTab] = useState<ChangelogTab>('catalog');

    // Shared date range across both tabs — "what changed" means the same window either way.
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatDateForInput(d);
    });
    const [toDate, setToDate] = useState(() => formatDateForInput(new Date()));

    // ── Settings Catalog perspective ─────────────────────────────────────────
    const [entries, setEntries] = useState<SettingChangeFeedEntry[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [summary, setSummary] = useState<ChangeFeedSummary | null>(null);
    const [nextPage, setNextPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [onlyNewSettings, setOnlyNewSettings] = useState(false);
    const [changeTypes, setChangeTypes] = useState<ChangeTypeFilter[]>([]);

    // Platform/technology option lists are derived from the categories the backend actually has,
    // not hardcoded — a new platform/technology Microsoft adds shows up here without a code change.
    const [platformOptions, setPlatformOptions] = useState<Option[]>([]);
    const [technologyOptions, setTechnologyOptions] = useState<Option[]>([]);

    useEffect(() => {
        (async () => {
            const response = await request<ApiEnvelope<CatalogSettingCategory[]>>(SETTINGS_LIBRARY_CATEGORIES_ENDPOINT);
            const categories = response?.data?.data ?? [];
            const platformSet = new Set<string>();
            const technologySet = new Set<string>();
            for (const category of categories) {
                category.platforms?.forEach(p => platformSet.add(p));
                category.technologies?.forEach(t => technologySet.add(t));
            }
            setPlatformOptions(Array.from(platformSet).sort().map(p => ({ label: p, value: p })));
            setTechnologyOptions(Array.from(technologySet).sort().map(t => ({ label: t, value: t })));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildParams = useCallback((page: number) => {
        const params = new URLSearchParams();
        if (fromDate) params.set('from', new Date(fromDate).toISOString());
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            params.set('to', end.toISOString());
        }
        platforms.forEach(p => params.append('platforms', p));
        technologies.forEach(t => params.append('technologies', t));
        if (onlyNewSettings) params.set('onlyNewSettings', 'true');
        changeTypes.forEach(t => params.append('changeTypes', t));
        params.set('page', String(page));
        params.set('pageSize', String(PAGE_SIZE));
        return params;
    }, [fromDate, toDate, platforms, technologies, onlyNewSettings, changeTypes]);

    const fetchPage = useCallback(async (pageToFetch: number, replace: boolean) => {
        const setBusy = replace ? setLoading : setLoadingMore;
        setBusy(true);
        try {
            const params = buildParams(pageToFetch);
            const response = await request<ApiEnvelope<SettingChangeFeedEntry[]>>(
                `${SETTINGS_LIBRARY_CHANGES_ENDPOINT}?${params.toString()}`
            );

            if (response?.data) {
                const incoming = response.data.data ?? [];
                setEntries(prev => replace ? incoming : [...prev, ...incoming]);
                setTotalCount(Number(response.data.meta?.totalCount ?? 0));
                setNextPage(pageToFetch + 1);
            }
        } finally {
            setBusy(false);
        }
    }, [request, buildParams]);

    const fetchSummary = useCallback(async () => {
        // The summary bar always reflects the full date/platform/technology window regardless of
        // the active change-type filter — the backend ignores changeTypes for this endpoint too.
        const params = new URLSearchParams();
        if (fromDate) params.set('from', new Date(fromDate).toISOString());
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            params.set('to', end.toISOString());
        }
        platforms.forEach(p => params.append('platforms', p));
        technologies.forEach(t => params.append('technologies', t));
        if (onlyNewSettings) params.set('onlyNewSettings', 'true');

        const response = await request<ApiEnvelope<ChangeFeedSummary>>(
            `${SETTINGS_LIBRARY_CHANGES_SUMMARY_ENDPOINT}?${params.toString()}`
        );
        if (response?.data?.data) setSummary(response.data.data);
    }, [request, fromDate, toDate, platforms, technologies, onlyNewSettings]);

    useEffect(() => {
        if (tab !== 'catalog') return;
        fetchPage(1, /* replace */ true);
        fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, fromDate, toDate, platforms, technologies, onlyNewSettings, changeTypes]);

    const hasMore = entries.length < totalCount;
    const loadMore = useCallback(() => fetchPage(nextPage, /* replace */ false), [fetchPage, nextPage]);
    const grouped = useMemo(() => groupByDay(entries), [entries]);

    const toggleChangeType = useCallback((type: ChangeTypeFilter) => {
        setChangeTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    }, []);

    // ── Baseline Templates perspective ───────────────────────────────────────
    const [baselineEntries, setBaselineEntries] = useState<BaselineChangeFeedEntry[]>([]);
    const [baselineLoading, setBaselineLoading] = useState(false);

    useEffect(() => {
        if (tab !== 'templates') return;
        (async () => {
            setBaselineLoading(true);
            try {
                const params = new URLSearchParams();
                if (fromDate) params.set('from', new Date(fromDate).toISOString());
                if (toDate) {
                    const end = new Date(toDate);
                    end.setHours(23, 59, 59, 999);
                    params.set('to', end.toISOString());
                }
                const response = await request<ApiEnvelope<BaselineChangeFeedEntry[]>>(
                    `${BASELINE_LIBRARY_CHANGES_ENDPOINT}?${params.toString()}`
                );
                setBaselineEntries(response?.data?.data ?? []);
            } finally {
                setBaselineLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, fromDate, toDate]);

    const baselineGrouped = useMemo(() => groupBaselineByDay(baselineEntries), [baselineEntries]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <Link href="/settings-library" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings Library
                </Link>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Layers className="h-6 w-6" /> Settings Library Changelog
                </h1>
                <p className="text-muted-foreground mt-1">
                    What changed in Intune — from the raw Settings Catalog, or from the security baseline templates built on top of it.
                </p>
            </div>

            <div className="flex gap-2">
                <Button variant={tab === 'catalog' ? 'default' : 'outline'} size="sm" onClick={() => setTab('catalog')} className="gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Settings Catalog
                </Button>
                <Button variant={tab === 'templates' ? 'default' : 'outline'} size="sm" onClick={() => setTab('templates')} className="gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Baseline Templates
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">From</label>
                    <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full md:w-40" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">To</label>
                    <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full md:w-40" />
                </div>
            </div>

            {tab === 'catalog' && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Change Feed</CardTitle>
                        <CardDescription>{formatDate(fromDate)} → {formatDate(toDate)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                            <div className="flex flex-col gap-1 w-full md:w-56">
                                <label className="text-xs text-muted-foreground">Platform</label>
                                <MultiSelect options={platformOptions} selected={platforms} onChange={setPlatforms} placeholder="All platforms" />
                            </div>
                            <div className="flex flex-col gap-1 w-full md:w-56">
                                <label className="text-xs text-muted-foreground">Technology</label>
                                <MultiSelect options={technologyOptions} selected={technologies} onChange={setTechnologies} placeholder="All technologies" />
                            </div>
                            <Button
                                variant={onlyNewSettings ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setOnlyNewSettings(v => !v)}
                                className="gap-1.5"
                            >
                                <Sparkles className="h-3.5 w-3.5" /> New settings only
                            </Button>
                        </div>

                        {/* Compact, clickable summary bar — selecting a count filters the list below by that change type. */}
                        {summary && (
                            <div className="flex flex-wrap gap-2">
                                {CHANGE_TYPE_FILTERS.map(({ type, countKey }) => {
                                    const badge = CHANGE_TYPE_BADGE[type];
                                    const BadgeIcon = badge.icon;
                                    const active = changeTypes.includes(type);
                                    const count = summary[countKey];
                                    return (
                                        <button key={type} onClick={() => toggleChangeType(type)} className="contents">
                                            <Badge
                                                variant={active ? 'default' : 'outline'}
                                                className={`cursor-pointer gap-1 ${active ? '' : 'text-muted-foreground'}`}
                                            >
                                                <BadgeIcon className="h-3 w-3" /> {count.toLocaleString()} {badge.label.toLowerCase()}
                                            </Badge>
                                        </button>
                                    );
                                })}
                                {changeTypes.length > 0 && (
                                    <button onClick={() => setChangeTypes([])} className="contents">
                                        <Badge variant="outline" className="cursor-pointer text-muted-foreground">Clear</Badge>
                                    </button>
                                )}
                            </div>
                        )}

                        {loading && entries.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-10">Loading changes…</div>
                        )}
                        {!loading && entries.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                No changes in this window. Try widening the date range or clearing a filter.
                            </div>
                        )}

                        {grouped.map(({ day, items }) => (
                            <div key={day}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-sm font-semibold">{formatDate(day)}</h2>
                                    <Badge variant="secondary" className="text-xs">{items.length} change{items.length === 1 ? '' : 's'}</Badge>
                                </div>
                                <div className="space-y-2">
                                    {items.map(entry => {
                                        const badge = CHANGE_TYPE_BADGE[entry.change.changeType] ?? CHANGE_TYPE_BADGE.Changed;
                                        const BadgeIcon = badge.icon;
                                        const key = entry.revisionId ?? `${entry.settingId}-${entry.catalogSnapshotId}-${entry.change.changeType}`;

                                        return (
                                            <div key={key} className="rounded-md border p-3">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Badge className={`${badge.className} gap-1 text-xs shrink-0`}>
                                                            <BadgeIcon className="h-3 w-3" /> {badge.label}
                                                        </Badge>
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${IMPORTANCE_DOT[entry.change.importance] ?? IMPORTANCE_DOT.Low}`}
                                                            title={`${entry.change.importance} importance · ${entry.change.category}`}
                                                        />
                                                        <Link
                                                            href={`/settings-library/settings/${entry.settingId}`}
                                                            className="font-medium truncate hover:underline"
                                                        >
                                                            {entry.displayName || entry.graphDefinitionId}
                                                        </Link>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 shrink-0">
                                                        {entry.platforms.map(p => (
                                                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                {entry.change.changedProperties.length > 0 && (
                                                    <div className="mt-2 space-y-1 pl-1">
                                                        {entry.change.changedProperties.map((property, i) => (
                                                            <div key={i} className="text-sm flex items-start gap-1.5">
                                                                <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                                                                <span>
                                                                    <span className="font-medium">{property.changeType}</span>
                                                                    {property.field && <span className="text-muted-foreground"> ({property.field})</span>}
                                                                    {property.previousValue && property.currentValue && (
                                                                        <span className="text-muted-foreground">
                                                                            {': '}
                                                                            <span className="line-through">{property.previousValue}</span>
                                                                            {' → '}
                                                                            {property.currentValue}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className="flex justify-center pt-2">
                                <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg" className="min-w-[200px]">
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Loading more…
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Load More ({(totalCount - entries.length).toLocaleString()} remaining)
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {tab === 'templates' && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Baseline Template Changes</CardTitle>
                        <CardDescription>
                            {formatDate(fromDate)} → {formatDate(toDate)} · every baseline version transition this platform has observed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {baselineLoading && (
                            <div className="text-center text-sm text-muted-foreground py-10">Loading baseline changes…</div>
                        )}
                        {!baselineLoading && baselineEntries.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                No baseline template changes in this window.
                            </div>
                        )}

                        {baselineGrouped.map(({ day, items }) => (
                            <div key={day}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-sm font-semibold">{formatDate(day)}</h2>
                                    <Badge variant="secondary" className="text-xs">{items.length} change{items.length === 1 ? '' : 's'}</Badge>
                                </div>
                                <div className="space-y-2">
                                    {items.map(entry => (
                                        <div key={entry.revisionId} className="rounded-md border p-3">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {entry.isNewFamily ? (
                                                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1 text-xs shrink-0">
                                                            <Sparkles className="h-3 w-3" /> New baseline
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 text-xs shrink-0">
                                                            <Pencil className="h-3 w-3" /> New version
                                                        </Badge>
                                                    )}
                                                    <Link
                                                        href={`/settings-library/baselines/${entry.familyId}`}
                                                        className="font-medium truncate hover:underline"
                                                    >
                                                        {entry.displayName || 'Baseline template'}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground">
                                                        {entry.displayVersion ?? `Version ${entry.version}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {entry.platforms && (
                                                        <Badge variant="outline" className="text-xs">{entry.platforms}</Badge>
                                                    )}
                                                    <Badge className={`text-xs ${LIFECYCLE_BADGE[entry.lifecycleState] ?? ''}`}>
                                                        {entry.lifecycleState}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {entry.addedCount > 0 && (
                                                    <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1 text-xs">
                                                        <Sparkles className="h-3 w-3" /> {entry.addedCount} added
                                                    </Badge>
                                                )}
                                                {entry.modifiedCount > 0 && (
                                                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 text-xs">
                                                        <Pencil className="h-3 w-3" /> {entry.modifiedCount} modified
                                                    </Badge>
                                                )}
                                                {entry.removedCount > 0 && (
                                                    <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1 text-xs">
                                                        <XCircle className="h-3 w-3" /> {entry.removedCount} removed
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Observed {formatDate(entry.observedAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
