'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApiRequest } from '@/hooks/useApiRequest';
import { BASELINE_LIBRARY_TEMPLATES_ENDPOINT, BASELINE_LIBRARY_COVERAGE_ENDPOINT } from '@/lib/constants';
import { BaselineCoverageSummary, RELEVANCE_META } from '@/lib/baselineCoverage';
import { ShieldCheck, Loader2, ChevronRight, Clock } from 'lucide-react';

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

interface BaselineTemplateFamily {
    id: string;
    baseId: string;
    displayName: string | null;
    platforms: string | null;
    technologies: string | null;
    firstSeenAt: string;
    lastSeenAt: string;
    revisionCount: number;
    currentRevision: BaselineTemplateRevision | null;
}

const LIFECYCLE_BADGE: Record<string, string> = {
    active: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
    superseded: 'bg-muted text-muted-foreground border-transparent',
    draft: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
};

function formatDate(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return value;
    }
}

export default function BaselineLibraryPage() {
    const { request } = useApiRequest();
    const [families, setFamilies] = useState<BaselineTemplateFamily[]>([]);
    const [coverage, setCoverage] = useState<Record<string, BaselineCoverageSummary> | null>(null);
    const [loading, setLoading] = useState(true);

    const loadFamilies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await request<ApiEnvelope<BaselineTemplateFamily[]>>(BASELINE_LIBRARY_TEMPLATES_ENDPOINT);
            setFamilies(response?.data?.data ?? []);
            // Sequential (useApiRequest aborts a previous in-flight call).
            const cov = await request<ApiEnvelope<BaselineCoverageSummary[]>>(BASELINE_LIBRARY_COVERAGE_ENDPOINT);
            const map: Record<string, BaselineCoverageSummary> = {};
            for (const c of cov?.data?.data ?? []) map[c.familyId] = c;
            setCoverage(map);
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadFamilies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6" /> Security Baselines
                </h1>
                <p className="text-muted-foreground mt-1">
                    Microsoft&apos;s security baseline templates, tracked across versions — one Graph call already
                    returns every version Microsoft still retains, distinguished by lifecycle state.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Baseline Templates</CardTitle>
                    <CardDescription>{families.length} tracked {families.length === 1 ? 'family' : 'families'}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading baseline templates…
                        </div>
                    )}

                    {!loading && families.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            No baseline templates ingested yet.
                        </div>
                    )}

                    {!loading && families.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                                        <th className="pb-2 pr-4">Baseline</th>
                                        <th className="pb-2 pr-4">Platform</th>
                                        <th className="pb-2 pr-4">Current Version</th>
                                        <th className="pb-2 pr-4">Lifecycle</th>
                                        <th className="pb-2 pr-4">Versions Tracked</th>
                                        <th className="pb-2 pr-4">Your coverage</th>
                                        <th className="pb-2 pr-4">Last Seen</th>
                                        <th className="pb-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {families.map(family => (
                                        <tr key={family.id} className="border-b last:border-0">
                                            <td className="py-3 pr-4">
                                                <Link href={`/settings-library/baselines/${family.id}`} className="font-medium hover:underline">
                                                    {family.displayName || family.currentRevision?.displayName || family.baseId}
                                                </Link>
                                                {family.technologies && (
                                                    <div className="text-xs text-muted-foreground">{family.technologies}</div>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {family.platforms && <Badge variant="outline" className="text-xs">{family.platforms}</Badge>}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {family.currentRevision?.displayVersion ?? (family.currentRevision ? `Version ${family.currentRevision.version}` : '—')}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {family.currentRevision && (
                                                    <Badge className={`text-xs ${LIFECYCLE_BADGE[family.currentRevision.lifecycleState] ?? ''}`}>
                                                        {family.currentRevision.lifecycleState}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="secondary" className="text-xs">{family.revisionCount}</Badge>
                                            </td>
                                            <td className="py-3 pr-4 min-w-[180px]">
                                                {(() => {
                                                    const c = coverage?.[family.id];
                                                    if (!coverage) return <span className="text-xs text-muted-foreground">…</span>;
                                                    if (!c || c.total === 0) return <span className="text-xs text-muted-foreground">no harvest</span>;
                                                    const pct = (n: number) => `${Math.round((n / c.total) * 100)}%`;
                                                    return (
                                                        <div className="space-y-1">
                                                            <div className="flex h-2 w-full overflow-hidden rounded bg-muted" title={`${c.matching} match · ${c.different} differ · ${c.missing} not configured`}>
                                                                <span className="bg-green-500" style={{ width: pct(c.matching) }} />
                                                                <span className="bg-amber-500" style={{ width: pct(c.different) }} />
                                                                <span className="bg-slate-400" style={{ width: pct(c.notComparable) }} />
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                                                <span title={c.relevanceReason ?? RELEVANCE_META[c.relevance].hint} className={`rounded-full border px-1.5 py-px text-[10px] ${RELEVANCE_META[c.relevance].className}`}>{RELEVANCE_META[c.relevance].label}</span>
                                                                {c.relevance === 'NotFollowed'
                                                                    ? <span>{c.configured} of {c.total} overlap incidentally</span>
                                                                    : <span>{c.matching} match · {c.different} differ · {c.missing} missing of {c.total}</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {formatDate(family.lastSeenAt)}
                                            </td>
                                            <td className="py-3">
                                                <Link href={`/settings-library/baselines/${family.id}`} className="text-muted-foreground hover:text-foreground">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
