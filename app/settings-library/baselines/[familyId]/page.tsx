'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiRequest } from '@/hooks/useApiRequest';
import { BaselineCoverageCard } from '@/components/settings-library/BaselineCoverageCard';
import {
    BASELINE_LIBRARY_FAMILY_HISTORY_ENDPOINT,
    BASELINE_LIBRARY_FAMILY_COMPARE_ENDPOINT,
} from '@/lib/constants';
import {
    ArrowLeft, Sparkles, Pencil, XCircle, Loader2, ChevronRight, GitCompare, Clock,
} from 'lucide-react';

// ─── Types (mirrors IntuneAssistant.Dto.Response.BaselineLibrary) ──────────────

interface ApiEnvelope<T> {
    status: string;
    message?: string | null;
    data: T;
}

interface BaselineTemplateRevision {
    id: string;
    graphTemplateId: string;
    version: number;
    displayName: string;
    displayVersion: string | null;
    lifecycleState: string;
    observedAt: string;
    settingCount: number;
}

const LIFECYCLE_BADGE: Record<string, string> = {
    active: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
    superseded: 'bg-muted text-muted-foreground border-transparent',
    draft: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

interface BaselineSettingChange {
    definitionId: string;
    categoryDisplayName: string | null;
    changeType: 'Added' | 'Removed' | 'Modified';
    previousValueJson: string | null;
    currentValueJson: string | null;
}

interface BaselineTemplateHistoryEntry {
    revision: BaselineTemplateRevision;
    changes: BaselineSettingChange[];
}

interface BaselineCompareResult {
    fromRevision: BaselineTemplateRevision;
    toRevision: BaselineTemplateRevision;
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    unchangedCount: number;
    changes: BaselineSettingChange[];
}

const CHANGE_BADGE: Record<string, { icon: React.ElementType; className: string }> = {
    Added: { icon: Sparkles, className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' },
    Modified: { icon: Pencil, className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30' },
    Removed: { icon: XCircle, className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30' },
};

function formatDate(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return value;
    }
}

function ChangeList({ changes }: { changes: BaselineSettingChange[] }) {
    if (changes.length === 0) {
        return <div className="text-sm text-muted-foreground py-2">No setting differences.</div>;
    }
    return (
        <div className="space-y-1 mt-2">
            {changes.map((change, i) => {
                const badge = CHANGE_BADGE[change.changeType] ?? CHANGE_BADGE.Modified;
                const BadgeIcon = badge.icon;
                return (
                    <div key={i} className="text-sm flex items-start gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            <Badge className={`${badge.className} gap-1 text-xs mr-1.5`}>
                                <BadgeIcon className="h-3 w-3" /> {change.changeType}
                            </Badge>
                            <span className="font-mono text-xs">{change.definitionId}</span>
                            {change.categoryDisplayName && (
                                <span className="text-muted-foreground text-xs"> · {change.categoryDisplayName}</span>
                            )}
                            {change.previousValueJson && change.currentValueJson && (
                                <div className="text-muted-foreground text-xs">
                                    <span className="line-through">{change.previousValueJson}</span> → {change.currentValueJson}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function BaselineFamilyDetailPage() {
    const params = useParams<{ familyId: string }>();
    const { request } = useApiRequest();

    const [history, setHistory] = useState<BaselineTemplateHistoryEntry[] | null>(null);
    const [loading, setLoading] = useState(true);

    const [fromRevisionId, setFromRevisionId] = useState<string>('');
    const [toRevisionId, setToRevisionId] = useState<string>('');
    const [compareResult, setCompareResult] = useState<BaselineCompareResult | null>(null);
    const [comparing, setComparing] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const response = await request<ApiEnvelope<BaselineTemplateHistoryEntry[]>>(
                    BASELINE_LIBRARY_FAMILY_HISTORY_ENDPOINT(params.familyId)
                );
                const entries = response?.data?.data ?? [];
                setHistory(entries);
                if (entries.length > 0) {
                    setFromRevisionId(entries[0].revision.id);
                    setToRevisionId(entries[entries.length - 1].revision.id);
                }
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.familyId]);

    const revisions = useMemo(() => (history ?? []).map(h => h.revision), [history]);

    const runCompare = useCallback(async () => {
        if (!fromRevisionId || !toRevisionId) return;
        setComparing(true);
        try {
            const url = `${BASELINE_LIBRARY_FAMILY_COMPARE_ENDPOINT(params.familyId)}?from=${fromRevisionId}&to=${toRevisionId}`;
            const response = await request<ApiEnvelope<BaselineCompareResult>>(url);
            setCompareResult(response?.data?.data ?? null);
        } finally {
            setComparing(false);
        }
    }, [request, params.familyId, fromRevisionId, toRevisionId]);

    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading baseline history…
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="p-6 space-y-4">
                <Link href="/settings-library/baselines" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Security Baselines
                </Link>
                <div className="text-sm text-muted-foreground">No history found for this baseline.</div>
            </div>
        );
    }

    const current = history[history.length - 1].revision;

    return (
        <div className="p-6 space-y-6">
            <div>
                <Link href="/settings-library/baselines" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Security Baselines
                </Link>
                <h1 className="text-2xl font-semibold">{current.displayName}</h1>
                <p className="text-muted-foreground mt-1">
                    {history.length} version{history.length === 1 ? '' : 's'} tracked · currently {current.displayVersion ?? `Version ${current.version}`}
                </p>
            </div>

            <BaselineCoverageCard familyId={params.familyId} />

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><GitCompare className="h-4 w-4" /> Compare Versions</CardTitle>
                    <CardDescription>What was added, removed, or modified between two tracked versions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">From</label>
                            <select
                                className="border rounded-md px-2 py-1.5 text-sm bg-background"
                                value={fromRevisionId}
                                onChange={e => setFromRevisionId(e.target.value)}
                            >
                                {revisions.map(r => (
                                    <option key={r.id} value={r.id}>{r.displayVersion ?? `Version ${r.version}`}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">To</label>
                            <select
                                className="border rounded-md px-2 py-1.5 text-sm bg-background"
                                value={toRevisionId}
                                onChange={e => setToRevisionId(e.target.value)}
                            >
                                {revisions.map(r => (
                                    <option key={r.id} value={r.id}>{r.displayVersion ?? `Version ${r.version}`}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={runCompare} disabled={comparing} className="gap-1.5">
                            {comparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
                            Compare
                        </Button>
                    </div>

                    {compareResult && (
                        <>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1">
                                    <Sparkles className="h-3 w-3" /> {compareResult.addedCount} added
                                </Badge>
                                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1">
                                    <Pencil className="h-3 w-3" /> {compareResult.modifiedCount} modified
                                </Badge>
                                <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1">
                                    <XCircle className="h-3 w-3" /> {compareResult.removedCount} removed
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground">{compareResult.unchangedCount} unchanged</Badge>
                            </div>
                            <ChangeList changes={compareResult.changes} />
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Version History</CardTitle>
                    <CardDescription>Every version this platform has observed, oldest first</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {history.map((entry, idx) => (
                        <div key={entry.revision.id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{entry.revision.displayVersion ?? `Version ${entry.revision.version}`}</Badge>
                                    <Badge className={`text-xs ${LIFECYCLE_BADGE[entry.revision.lifecycleState] ?? ''}`}>
                                        {entry.revision.lifecycleState}
                                    </Badge>
                                    {idx === 0 && (
                                        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1 text-xs">
                                            <Sparkles className="h-3 w-3" /> First observed
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Observed {formatDate(entry.revision.observedAt)}
                                </span>
                            </div>
                            <ChangeList changes={entry.changes} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
