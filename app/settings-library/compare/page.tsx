'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiRequest } from '@/hooks/useApiRequest';
import { SETTINGS_LIBRARY_COMPARE_ENDPOINT } from '@/lib/constants';
import {
    ArrowLeft, GitCompare, Sparkles, Pencil, RefreshCw, Loader2, ChevronRight, XCircle,
} from 'lucide-react';

// ─── Types (mirrors IntuneAssistant.Dto.Response.SettingsLibrary) ──────────────

interface ApiEnvelope<T> {
    status: string;
    message?: string | null;
    data: T;
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

interface CompareEntry {
    settingId: string;
    graphDefinitionId: string;
    displayName: string | null;
    platforms: string[];
    technologies: string[];
    change: SettingChange;
}

interface CompareResult {
    fromSnapshotId: string;
    fromCapturedAt: string;
    toSnapshotId: string;
    toCapturedAt: string;
    addedCount: number;
    removedCount: number;
    changedCount: number;
    unchangedCount: number;
    entries: CompareEntry[];
}

const CHANGE_TYPE_BADGE: Record<string, { icon: React.ElementType; className: string; label: string }> = {
    Added: { icon: Sparkles, className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30', label: 'Added' },
    Changed: { icon: Pencil, className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30', label: 'Changed' },
    Removed: { icon: XCircle, className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30', label: 'Removed' },
};

const IMPORTANCE_DOT: Record<string, string> = {
    High: 'bg-red-500',
    Medium: 'bg-amber-500',
    Low: 'bg-muted-foreground/40',
};

const PAGE_SIZE = 50;

function formatDateForInput(date: Date) {
    return date.toISOString().slice(0, 10);
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return value;
    }
}

type FilterKind = 'all' | 'Added' | 'Removed' | 'Changed';

export default function SettingsLibraryComparePage() {
    const { request } = useApiRequest();

    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatDateForInput(d);
    });
    const [toDate, setToDate] = useState(() => formatDateForInput(new Date()));

    const [result, setResult] = useState<CompareResult | null>(null);
    const [entries, setEntries] = useState<CompareEntry[]>([]);
    const [nextPage, setNextPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [filter, setFilter] = useState<FilterKind>('all');

    const runCompare = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const from = new Date(fromDate).toISOString();
            const toEnd = new Date(toDate);
            toEnd.setHours(23, 59, 59, 999);
            const to = toEnd.toISOString();

            const params = new URLSearchParams({ from, to, page: '1', pageSize: String(PAGE_SIZE) });
            const response = await request<ApiEnvelope<CompareResult>>(`${SETTINGS_LIBRARY_COMPARE_ENDPOINT}?${params.toString()}`);

            // A 404 (no snapshot exists that early) already shows the global error banner via
            // useApiRequest; response is undefined here, so this just renders the empty state.
            if (!response?.data?.data) {
                setResult(null);
                setEntries([]);
                setNotFound(true);
                return;
            }

            setResult(response.data.data);
            setEntries(response.data.data.entries ?? []);
            setNextPage(2);
        } finally {
            setLoading(false);
        }
    }, [request, fromDate, toDate]);

    const totalEntries = result ? result.addedCount + result.removedCount + result.changedCount : 0;
    const hasMore = entries.length < totalEntries;

    const loadMore = useCallback(async () => {
        setLoadingMore(true);
        try {
            const from = new Date(fromDate).toISOString();
            const toEnd = new Date(toDate);
            toEnd.setHours(23, 59, 59, 999);
            const to = toEnd.toISOString();

            const params = new URLSearchParams({ from, to, page: String(nextPage), pageSize: String(PAGE_SIZE) });
            const response = await request<ApiEnvelope<CompareResult>>(`${SETTINGS_LIBRARY_COMPARE_ENDPOINT}?${params.toString()}`);
            if (response?.data?.data) {
                setEntries(prev => [...prev, ...response.data.data.entries]);
                setNextPage(p => p + 1);
            }
        } finally {
            setLoadingMore(false);
        }
    }, [request, fromDate, toDate, nextPage]);

    const visibleEntries = filter === 'all' ? entries : entries.filter(e => e.change.changeType === filter);

    return (
        <div className="p-6 space-y-6">
            <div>
                <Link href="/settings-library" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings Library
                </Link>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <GitCompare className="h-6 w-6" /> Compare Two Points in Time
                </h1>
                <p className="text-muted-foreground mt-1">
                    See exactly what changed in the catalog between two dates — added, removed and changed settings, ranked by importance.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Compare</CardTitle>
                    <CardDescription>Each date resolves to the nearest completed catalog snapshot at or before it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">From</label>
                            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full md:w-40" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">To</label>
                            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full md:w-40" />
                        </div>
                        <Button onClick={runCompare} disabled={loading} className="gap-1.5">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
                            Compare
                        </Button>
                    </div>

                    {notFound && (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            No completed catalog snapshot exists at or before one of those dates. Try a later &ldquo;from&rdquo; date.
                        </div>
                    )}

                    {result && (
                        <>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <span className="text-muted-foreground">
                                    {formatDateTime(result.fromCapturedAt)} → {formatDateTime(result.toCapturedAt)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setFilter('all')} className="contents">
                                    <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer">
                                        All ({totalEntries.toLocaleString()})
                                    </Badge>
                                </button>
                                <button onClick={() => setFilter('Added')} className="contents">
                                    <Badge variant={filter === 'Added' ? 'default' : 'outline'} className="cursor-pointer gap-1">
                                        <Sparkles className="h-3 w-3" /> Added ({result.addedCount.toLocaleString()})
                                    </Badge>
                                </button>
                                <button onClick={() => setFilter('Changed')} className="contents">
                                    <Badge variant={filter === 'Changed' ? 'default' : 'outline'} className="cursor-pointer gap-1">
                                        <Pencil className="h-3 w-3" /> Changed ({result.changedCount.toLocaleString()})
                                    </Badge>
                                </button>
                                <button onClick={() => setFilter('Removed')} className="contents">
                                    <Badge variant={filter === 'Removed' ? 'default' : 'outline'} className="cursor-pointer gap-1">
                                        <XCircle className="h-3 w-3" /> Removed ({result.removedCount.toLocaleString()})
                                    </Badge>
                                </button>
                                <Badge variant="outline" className="text-muted-foreground">
                                    {result.unchangedCount.toLocaleString()} unaffected
                                </Badge>
                            </div>

                            {visibleEntries.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-10">
                                    No {filter === 'all' ? 'changes' : filter.toLowerCase()} in this window.
                                </div>
                            )}

                            <div className="space-y-2">
                                {visibleEntries.map(entry => {
                                    const badge = CHANGE_TYPE_BADGE[entry.change.changeType] ?? CHANGE_TYPE_BADGE.Changed;
                                    const BadgeIcon = badge.icon;

                                    return (
                                        <div key={entry.settingId} className="rounded-md border p-3">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Badge className={`${badge.className} gap-1 text-xs shrink-0`}>
                                                        <BadgeIcon className="h-3 w-3" /> {badge.label}
                                                    </Badge>
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${IMPORTANCE_DOT[entry.change.importance] ?? IMPORTANCE_DOT.Low}`}
                                                        title={`${entry.change.importance} importance · ${entry.change.category}`}
                                                    />
                                                    <span className="font-medium truncate">{entry.displayName || entry.graphDefinitionId}</span>
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

                            {filter === 'all' && hasMore && (
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
                                                Load More ({(totalEntries - entries.length).toLocaleString()} remaining)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
