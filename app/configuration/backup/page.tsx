'use client';

import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Download,
    Play,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    AlertCircle,
    AlertTriangle,
    ArchiveIcon,
    RefreshCw,
    Tag,
    X,
    ChevronDown,
} from 'lucide-react';
import {
    RESOURCE_TYPES,
    SCOPE_TAG_UNSUPPORTED,
    RESOURCE_PLATFORM,
    type OsPlatform,
} from '@/app/configuration/backup/_shared';
import { BACKUP_LIST_ENDPOINT, BACKUP_FETCH_ENDPOINT, ROLE_SCOPETAGS_ENDPOINT } from '@/lib/constants';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useExportTenantId } from '@/hooks/useExportTenantId';
import { buildExportFilename } from '@/lib/exportFilename';

const BATCH_SIZE = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ExportStatus = 'idle' | 'listing' | 'fetching' | 'done' | 'error' | 'skipped' | 'retrying';

interface ExportItemDto {
    name: string;
    content: object;
}

interface ListItemDto {
    id: string;
    name: string;
    scopeTagIds: string[];
}

interface ScopeTag {
    id: string;
    displayName: string;
}

interface ListResult {
    items: ListItemDto[];
    count: number;
}

interface FetchResult {
    folderName: string;
    items: ExportItemDto[];
    errorMessage?: string;
}

interface ExportResourceState {
    status: ExportStatus;
    total: number;
    fetched: number;
    attempted: number;
    failedBatches: ListItemDto[][];
    items: ExportItemDto[];
    folderName: string;
    error?: string;
}

const emptyExportState = (folder: string): ExportResourceState => ({
    status: 'idle',
    total: 0,
    fetched: 0,
    attempted: 0,
    failedBatches: [],
    items: [],
    folderName: folder,
});

const initialExportState = (): Record<string, ExportResourceState> =>
    Object.fromEntries(RESOURCE_TYPES.map((r) => [r.key, emptyExportState(r.folder)]));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function runFetchBatches(
    key: string,
    batches: ListItemDto[][],
    request: ReturnType<typeof useApiRequest>['request'],
    signal: AbortSignal,
    onBatchComplete: (
        key: string,
        succeeded: ExportItemDto[],
        failedBatch: ListItemDto[] | null,
        batchSize: number
    ) => void
): Promise<{ stillFailing: ListItemDto[][] }> {
    const stillFailing: ListItemDto[][] = [];
    for (const batch of batches) {
        if (signal.aborted) break;
        try {
            const resp = await request(BACKUP_FETCH_ENDPOINT(key), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: batch }),
                signal,
            });
            const result = (resp?.data as { data?: FetchResult } | undefined)?.data;
            const batchItems = result?.items ?? [];
            onBatchComplete(key, batchItems, null, batch.length);
        } catch (err: unknown) {
            if ((err as Error)?.name === 'AbortError') break;
            stillFailing.push(batch);
            onBatchComplete(key, [], batch, batch.length);
        }
    }
    return { stillFailing };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ExportStatusBadge({ status }: { status: ExportStatus }) {
    const map: Record<ExportStatus, React.ReactNode> = {
        idle: (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> Not started
            </Badge>
        ),
        listing: (
            <Badge variant="outline" className="gap-1 text-blue-500">
                <Loader2 className="h-3 w-3 animate-spin" /> Listing
            </Badge>
        ),
        fetching: (
            <Badge variant="outline" className="gap-1 text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" /> Fetching
            </Badge>
        ),
        retrying: (
            <Badge variant="outline" className="gap-1 text-yellow-600">
                <Loader2 className="h-3 w-3 animate-spin" /> Retrying
            </Badge>
        ),
        done: (
            <Badge variant="outline" className="gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" /> Done
            </Badge>
        ),
        error: (
            <Badge variant="outline" className="gap-1 text-red-600">
                <XCircle className="h-3 w-3" /> Error
            </Badge>
        ),
        skipped: (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
                <AlertCircle className="h-3 w-3" /> Empty
            </Badge>
        ),
    };
    return <>{map[status]}</>;
}

function ExportProgressCell({
    state,
    onRetry,
}: {
    state: ExportResourceState;
    onRetry: () => void;
}) {
    if (state.status === 'idle') return <span className="text-muted-foreground">—</span>;
    if (state.status === 'listing')
        return <span className="text-muted-foreground text-xs animate-pulse">Counting...</span>;
    if (state.total === 0) return <span className="text-muted-foreground">0</span>;

    const isActive = state.status === 'fetching' || state.status === 'retrying';
    const failedItems = state.failedBatches.reduce((s, b) => s + b.length, 0);
    const pct = state.attempted > 0 ? Math.round((state.fetched / state.attempted) * 100) : 100;
    const pctColor = pct === 100 ? 'text-green-600' : pct >= 90 ? 'text-yellow-600' : 'text-red-600';

    return (
        <span className="tabular-nums text-sm flex items-center justify-end gap-2">
            <span>
                {isActive ? state.attempted : state.fetched} / {state.total}
            </span>
            {!isActive && state.attempted > 0 && (
                <span className={`text-xs font-medium ${pctColor}`}>{pct}%</span>
            )}
            {!isActive && failedItems > 0 && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 underline-offset-2 hover:underline"
                    title={`Retry ${failedItems} failed item${failedItems !== 1 ? 's' : ''}`}
                >
                    <RefreshCw className="h-3 w-3" />
                    Retry {failedItems}
                </button>
            )}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BackupPage() {
    const exportTenantId = useExportTenantId();
    const [exportStates, setExportStates] = useState<Record<string, ExportResourceState>>(initialExportState);
    const [exportRunning, setExportRunning] = useState(false);
    const [exportDone, setExportDone] = useState(false);
    const [selectedResourceTypes, setSelectedResourceTypes] = useState<Set<string>>(
        () => new Set(RESOURCE_TYPES.map((r) => r.key))
    );
    const [backupOsFilter, setBackupOsFilter] = useState<OsPlatform | 'all'>('all');
    const [scopeTagFilter, setScopeTagFilter] = useState<string[]>([]);
    const [scopeTags, setScopeTags] = useState<ScopeTag[]>([]);
    const [scopeTagsLoading, setScopeTagsLoading] = useState(false);
    const [scopeTagsLoaded, setScopeTagsLoaded] = useState(false);
    const [scopeTagSearch, setScopeTagSearch] = useState('');
    const [scopeTagDropdownOpen, setScopeTagDropdownOpen] = useState(false);

    const abortRef = useRef<AbortController | null>(null);
    const scopeTagDropdownRef = useRef<HTMLDivElement>(null);
    const { request } = useApiRequest();

    const fetchScopeTags = useCallback(() => {
        if (scopeTagsLoaded) return;
        setScopeTagsLoading(true);
        request<{ status: string; data: ScopeTag[] }>(ROLE_SCOPETAGS_ENDPOINT)
            .then((resp) => {
                setScopeTags(resp?.data?.data ?? []);
                setScopeTagsLoaded(true);
            })
            .catch((err) => console.error('Failed to fetch scope tags', err))
            .finally(() => setScopeTagsLoading(false));
    }, [request, scopeTagsLoaded]);

    React.useEffect(() => {
        if (!scopeTagDropdownOpen) return;
        const handler = (e: MouseEvent) => {
            if (scopeTagDropdownRef.current && !scopeTagDropdownRef.current.contains(e.target as Node))
                setScopeTagDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [scopeTagDropdownOpen]);

    const patchExport = useCallback(
        (key: string, patch: Partial<ExportResourceState> | ((p: ExportResourceState) => Partial<ExportResourceState>)) =>
            setExportStates((prev) => {
                const cur = prev[key];
                const up = typeof patch === 'function' ? patch(cur) : patch;
                return { ...prev, [key]: { ...cur, ...up } };
            }),
        []
    );

    // One action: list and fetch everything selected from Microsoft Graph (via the API's read-only backup
    // endpoints) and package it into a ZIP, built and saved entirely in the browser.
    const downloadBackup = async () => {
        setExportRunning(true);
        setExportDone(false);
        setExportStates(initialExportState());
        abortRef.current = new AbortController();
        const signal = abortRef.current.signal;
        const collected: Record<string, ExportItemDto[]> = {};

        for (const rt of RESOURCE_TYPES) {
            if (signal.aborted) break;

            if (!selectedResourceTypes.has(rt.key)) {
                patchExport(rt.key, { status: 'skipped' });
                continue;
            }

            if (backupOsFilter !== 'all') {
                const rtPlatform = RESOURCE_PLATFORM[rt.key] ?? 'mixed';
                const matches = rtPlatform === backupOsFilter || rtPlatform === 'cross-platform' || rtPlatform === 'mixed';
                if (!matches) {
                    patchExport(rt.key, { status: 'skipped' });
                    continue;
                }
            }

            patchExport(rt.key, { status: 'listing' });
            let listItems: ListItemDto[] = [];
            try {
                const resp = await request(BACKUP_LIST_ENDPOINT(rt.key), { method: 'GET', signal });
                const listResult = (resp?.data as { data?: ListResult } | undefined)?.data;
                listItems = listResult?.items ?? [];
            } catch (err: unknown) {
                if ((err as Error)?.name === 'AbortError') break;
                patchExport(rt.key, { status: 'error', error: String(err) });
                continue;
            }

            if (listItems.length === 0) {
                patchExport(rt.key, { status: 'skipped' });
                continue;
            }

            if (scopeTagFilter.length > 0 && SCOPE_TAG_UNSUPPORTED.has(rt.key)) {
                patchExport(rt.key, { status: 'skipped' });
                continue;
            }

            const filteredItems = scopeTagFilter.length > 0
                ? listItems.filter((i) => i.scopeTagIds?.some((t) => scopeTagFilter.includes(t)))
                : listItems;

            if (filteredItems.length === 0) {
                patchExport(rt.key, { status: 'skipped' });
                continue;
            }

            patchExport(rt.key, { total: filteredItems.length, status: 'fetching' });
            const batches: ListItemDto[][] = [];
            for (let i = 0; i < filteredItems.length; i += BATCH_SIZE) batches.push(filteredItems.slice(i, i + BATCH_SIZE));

            const onBatchComplete = (k: string, succeeded: ExportItemDto[], failedBatch: ListItemDto[] | null, batchSize: number) => {
                (collected[k] ??= []).push(...succeeded);
                setExportStates((prev) => {
                    const s = prev[k];
                    return {
                        ...prev,
                        [k]: {
                            ...s,
                            fetched: s.fetched + succeeded.length,
                            attempted: s.attempted + batchSize,
                            items: [...s.items, ...succeeded],
                            failedBatches: failedBatch ? [...s.failedBatches, failedBatch] : s.failedBatches,
                        },
                    };
                });
            };

            const { stillFailing } = await runFetchBatches(rt.key, batches, request, signal, onBatchComplete);
            patchExport(rt.key, (prev) => ({
                status: prev.fetched === 0 && stillFailing.length > 0 ? 'error' : 'done',
                failedBatches: stillFailing,
            }));
        }

        setExportRunning(false);
        setExportDone(true);
        if (!signal.aborted) {
            await buildAndSaveZip(collected);
        }
    };

    const retryExport = async (key: string) => {
        const state = exportStates[key];
        if (state.failedBatches.length === 0) return;
        patchExport(key, { status: 'retrying', failedBatches: [] });
        const signal = abortRef.current?.signal ?? new AbortController().signal;

        const onBatchComplete = (k: string, succeeded: ExportItemDto[], failedBatch: ListItemDto[] | null) => {
            setExportStates((prev) => {
                const s = prev[k];
                return {
                    ...prev,
                    [k]: {
                        ...s,
                        fetched: s.fetched + succeeded.length,
                        items: [...s.items, ...succeeded],
                        failedBatches: failedBatch ? [...s.failedBatches, failedBatch] : s.failedBatches,
                    },
                };
            });
        };

        const { stillFailing } = await runFetchBatches(key, state.failedBatches, request, signal, onBatchComplete);
        patchExport(key, (prev) => ({
            status: stillFailing.length === 0 ? 'done' : prev.fetched > 0 ? 'done' : 'error',
            failedBatches: stillFailing,
        }));
    };

    const cancelBackup = () => { abortRef.current?.abort(); setExportRunning(false); };

    const buildAndSaveZip = async (itemsByKey: Record<string, ExportItemDto[]>) => {
        const zip = new JSZip();
        const dateStr = new Date().toISOString().slice(0, 10);
        const root = zip.folder(`IntuneBackup-${dateStr}`)!;

        for (const rt of RESOURCE_TYPES) {
            const items = itemsByKey[rt.key] ?? [];
            if (items.length === 0) continue;
            const folder = root.folder(rt.folder)!;
            const seen: Record<string, number> = {};
            for (const item of items) {
                let name = item.name || 'unnamed';
                if (seen[name] !== undefined) { seen[name]++; name = `${name} (${seen[name]})`; } else seen[name] = 0;
                folder.file(`${name}.json`, JSON.stringify(item.content, null, 2));
            }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, buildExportFilename(exportTenantId, 'intune-backup', 'zip'));
    };

    // Re-download what the last run assembled (e.g. if the browser blocked the automatic save).
    const downloadZip = () => buildAndSaveZip(Object.fromEntries(RESOURCE_TYPES.map((rt) => [rt.key, exportStates[rt.key].items])));

    const exportDoneCount = Object.values(exportStates).filter((s) => s.status === 'done').length;
    const exportErrorCount = Object.values(exportStates).filter((s) => s.status === 'error').length;
    const exportTotalItems = Object.values(exportStates).reduce((s, r) => s + r.fetched, 0);
    const exportHasRetryable = Object.values(exportStates).some((s) => s.failedBatches.length > 0);

    return (
        <div className="container mx-auto py-6 max-w-7xl space-y-6">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <ArchiveIcon className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Backup
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Export your Intune configuration</h1>
                    <p className="text-xl text-white/80 max-w-2xl">
                        Browse and export your tenant&apos;s resource types to a ZIP archive compatible with
                        IntuneManagement. Read-only — nothing is ever written back to your tenant.
                    </p>
                </div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-400 to-green-400 blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 blur-2xl" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export Configuration</CardTitle>
                    <CardDescription>
                        Exports all supported resource types and packages them into a ZIP file. Compatible with
                        IntuneManagement.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filter panel */}
                    <div className="rounded-md border p-4 space-y-4 bg-muted/20">
                        <p className="text-sm font-medium text-muted-foreground">
                            Filters — optional. Leave empty to back up everything.
                        </p>

                        {/* OS platform filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">OS Platform</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                {([
                                    { value: 'all', label: 'All' },
                                    { value: 'windows', label: 'Windows' },
                                    { value: 'macos', label: 'macOS' },
                                    { value: 'ios', label: 'iOS' },
                                    { value: 'android', label: 'Android' },
                                ] as { value: OsPlatform | 'all'; label: string }[]).map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setBackupOsFilter(opt.value)}
                                        disabled={exportRunning}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
                                            backupOsFilter === opt.value
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {backupOsFilter !== 'all' && (
                                <p className="text-xs text-muted-foreground">
                                    Cross-platform resources (scope tags, assignment filters, CA policies) are always included.
                                </p>
                            )}
                        </div>

                        {/* Scope tag filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scope Tags</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative" ref={scopeTagDropdownRef}>
                                    <button
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm bg-background hover:bg-muted/50 transition-colors disabled:opacity-50"
                                        onClick={() => { setScopeTagDropdownOpen((v) => !v); fetchScopeTags(); }}
                                        disabled={exportRunning}
                                    >
                                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                        {scopeTagFilter.length === 0
                                            ? 'All scope tags'
                                            : `${scopeTagFilter.length} tag${scopeTagFilter.length !== 1 ? 's' : ''} selected`}
                                        {scopeTagsLoading
                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                                    </button>

                                    {scopeTagDropdownOpen && (
                                        <div className="absolute z-20 top-full mt-1 left-0 w-64 rounded-md border bg-popover shadow-lg">
                                            <div className="p-2 border-b">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Search scope tags…"
                                                    className="w-full px-2 py-1 text-sm rounded border bg-background outline-none focus:ring-1 focus:ring-primary"
                                                    value={scopeTagSearch}
                                                    onChange={(e) => setScopeTagSearch(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-52 overflow-y-auto py-1">
                                                {scopeTagsLoading && (
                                                    <p className="px-3 py-3 text-xs text-muted-foreground flex items-center gap-2">
                                                        <Loader2 className="h-3 w-3 animate-spin" /> Loading scope tags…
                                                    </p>
                                                )}
                                                {!scopeTagsLoading && scopeTagsLoaded && scopeTags.length === 0 && (
                                                    <p className="px-3 py-3 text-xs text-muted-foreground">This tenant has no scope tags</p>
                                                )}
                                                {scopeTags
                                                    .filter((t) => t.displayName.toLowerCase().includes(scopeTagSearch.toLowerCase()))
                                                    .map((tag) => (
                                                        <label
                                                            key={tag.id}
                                                            className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/50"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={scopeTagFilter.includes(tag.id)}
                                                                onChange={(e) =>
                                                                    setScopeTagFilter((prev) =>
                                                                        e.target.checked
                                                                            ? [...prev, tag.id]
                                                                            : prev.filter((id) => id !== tag.id)
                                                                    )
                                                                }
                                                                className="h-3.5 w-3.5"
                                                            />
                                                            {tag.displayName}
                                                        </label>
                                                    ))}
                                                {!scopeTagsLoading && scopeTagsLoaded && scopeTags.length > 0 &&
                                                    scopeTags.filter((t) =>
                                                        t.displayName.toLowerCase().includes(scopeTagSearch.toLowerCase())
                                                    ).length === 0 && (
                                                    <p className="px-3 py-2 text-xs text-muted-foreground">No matching scope tags</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {scopeTagFilter.map((id) => {
                                    const tag = scopeTags.find((t) => t.id === id);
                                    return tag ? (
                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {tag.displayName}
                                            <button onClick={() => setScopeTagFilter((prev) => prev.filter((t) => t !== id))} className="hover:text-primary/70">
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                                {scopeTagFilter.length > 0 && (
                                    <button className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline" onClick={() => setScopeTagFilter([])}>
                                        Clear
                                    </button>
                                )}
                            </div>

                            {scopeTagFilter.length > 0 && (
                                <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                                    <span title="Warning"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" /></span>
                                    <p className="text-xs">
                                        Resources without scope tag support will be skipped:{' '}
                                        <strong>{RESOURCE_TYPES.filter((rt) => SCOPE_TAG_UNSUPPORTED.has(rt.key)).map((rt) => rt.label).join(', ')}</strong>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {!exportRunning ? (
                            <Button onClick={downloadBackup} disabled={selectedResourceTypes.size === 0}>
                                <Download className="h-4 w-4 mr-2" />
                                {backupOsFilter !== 'all' || scopeTagFilter.length > 0
                                    ? 'Download filtered backup'
                                    : 'Download backup'}
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={cancelBackup}>Cancel</Button>
                        )}
                        {exportDone && (
                            <Button variant="outline" onClick={downloadZip}>
                                <Play className="h-4 w-4 mr-2" />
                                Save ZIP again
                            </Button>
                        )}
                        {exportDone && exportHasRetryable && (
                            <Button variant="outline" onClick={() => RESOURCE_TYPES.forEach((rt) => { if (exportStates[rt.key].failedBatches.length > 0) retryExport(rt.key); })}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry All Failed
                            </Button>
                        )}
                        {exportDone && (
                            <span className="text-sm text-muted-foreground">
                                {exportDoneCount} types succeeded, {exportErrorCount} failed — {exportTotalItems} items total
                            </span>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-2 text-left font-medium w-8">
                                        <Checkbox
                                            disabled={exportRunning}
                                            checked={
                                                selectedResourceTypes.size === RESOURCE_TYPES.length
                                                    ? true
                                                    : selectedResourceTypes.size === 0
                                                    ? false
                                                    : 'indeterminate'
                                            }
                                            onCheckedChange={(v) =>
                                                setSelectedResourceTypes(
                                                    v ? new Set(RESOURCE_TYPES.map((r) => r.key)) : new Set()
                                                )
                                            }
                                        />
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium">Resource Type</th>
                                    <th className="px-4 py-2 text-left font-medium">Folder</th>
                                    <th className="px-4 py-2 text-left font-medium">Status</th>
                                    <th className="px-4 py-2 text-right font-medium">Progress / Success</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RESOURCE_TYPES.map((rt) => {
                                    const state = exportStates[rt.key];
                                    return (
                                        <tr key={rt.key} className={`border-b last:border-0 hover:bg-muted/30 ${!selectedResourceTypes.has(rt.key) ? 'opacity-40' : ''}`}>
                                            <td className="px-4 py-2">
                                                <Checkbox
                                                    disabled={exportRunning}
                                                    checked={selectedResourceTypes.has(rt.key)}
                                                    onCheckedChange={(v) =>
                                                        setSelectedResourceTypes((prev) => {
                                                            const next = new Set(prev);
                                                            v ? next.add(rt.key) : next.delete(rt.key);
                                                            return next;
                                                        })
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-2">{rt.label}</td>
                                            <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                                                {state.folderName}
                                            </td>
                                            <td className="px-4 py-2">
                                                <ExportStatusBadge status={state.status} />
                                                {state.error && state.status === 'error' && (
                                                    <span className="ml-2 text-xs text-red-500" title={state.error}>
                                                        {state.error.slice(0, 60)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <ExportProgressCell
                                                    state={state}
                                                    onRetry={() => retryExport(rt.key)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
