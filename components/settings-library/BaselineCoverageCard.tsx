'use client';

// Setting-by-setting coverage of one baseline against the tenant's stored harvest, with a status
// filter. Recommended and configured values are shown as people read them (option display
// names) with the raw ids underneath, so a "Differs" can always be verified.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiRequest } from '@/hooks/useApiRequest';
import { BASELINE_LIBRARY_FAMILY_COVERAGE_ENDPOINT } from '@/lib/constants';
import { BaselineCoverage, BaselineCoverageSetting, BaselineCoverageStatus, COVERAGE_STATUS, RELEVANCE_META } from '@/lib/baselineCoverage';
import { AlertTriangle, ChevronDown, ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { intunePolicyUrl } from '@/lib/settingsUsage';

interface ApiEnvelope<T> { status: string; message?: string | null; data: T }

function Value({ display, raw }: { display: string | null; raw: string | null }) {
    if (!display && !raw) return <span className="text-muted-foreground">—</span>;
    return (
        <span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{display ?? raw}</span>
            {display && raw && display !== raw && <span className="block font-mono text-[10px] text-muted-foreground mt-0.5 break-all">{raw}</span>}
        </span>
    );
}

function SettingRow({ setting, depth = 0 }: { setting: BaselineCoverageSetting; depth?: number }) {
    const [open, setOpen] = useState(depth === 0 && setting.status === 'Different');
    const status = COVERAGE_STATUS[setting.status];
    const expandable = setting.children.length > 0 || setting.policies.length > 0;
    return (
        <>
            <tr className="border-b last:border-b-0 align-top">
                <td className="py-2 pr-3" style={{ paddingLeft: `${depth * 18 + 4}px` }}>
                    <button onClick={() => expandable && setOpen(v => !v)} className="text-left flex items-start gap-1.5" disabled={!expandable}>
                        {expandable ? (open ? <ChevronDown className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />) : <span className="w-3.5 shrink-0" />}
                        <span className="min-w-0">
                            <span className="text-sm">{setting.displayName ?? setting.definitionId}</span>
                            {setting.categoryDisplayName && depth === 0 && <span className="block text-[11px] text-muted-foreground">{setting.categoryDisplayName}</span>}
                        </span>
                    </button>
                </td>
                <td className="py-2 pr-3"><Value display={setting.recommendedDisplay} raw={setting.recommendedRaw} /></td>
                <td className="py-2 pr-3">
                    {setting.policies.length === 0
                        ? <span className="text-xs text-muted-foreground">not configured</span>
                        : setting.policies.slice(0, open ? undefined : 1).map(p => (
                            <div key={p.policyId} className="mb-1 last:mb-0">
                                <Value display={p.configuredDisplay} raw={p.configuredRaw} />
                                <div className="text-[11px] text-muted-foreground">
                                    <a href={intunePolicyUrl(p.policyId)} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.policyName}</a>
                                    {!p.isAssigned && <span className="text-amber-700 dark:text-amber-400"> · not assigned</span>}
                                </div>
                            </div>
                        ))}
                    {!open && setting.policies.length > 1 && <div className="text-[11px] text-muted-foreground">+{setting.policies.length - 1} more</div>}
                </td>
                <td className="py-2"><Badge className={`text-[11px] ${status.className}`}>{status.label}</Badge></td>
            </tr>
            {open && setting.children.map(c => <SettingRow key={c.definitionId} setting={c} depth={depth + 1} />)}
        </>
    );
}

export function BaselineCoverageCard({ familyId }: { familyId: string }) {
    const { request } = useApiRequest();
    const runRef = useRef(0);
    const [coverage, setCoverage] = useState<BaselineCoverage | null | undefined>(undefined);
    const [filter, setFilter] = useState<BaselineCoverageStatus | null>(null);

    useEffect(() => {
        const run = ++runRef.current;
        (async () => {
            const response = await request<ApiEnvelope<BaselineCoverage>>(BASELINE_LIBRARY_FAMILY_COVERAGE_ENDPOINT(familyId));
            if (run !== runRef.current) return;
            setCoverage(response?.data?.data ?? null);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [familyId]);

    const visible = useMemo(() => (coverage?.settings ?? []).filter(s => filter === null || s.status === filter), [coverage, filter]);
    const s = coverage?.summary;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Your tenant against this baseline</CardTitle>
                    {coverage?.harvestedAt && <span className="text-xs text-muted-foreground">from your harvest of {new Date(coverage.harvestedAt).toLocaleString()}</span>}
                </div>
                <CardDescription>
                    {coverage === undefined ? 'Comparing…'
                        : coverage === null ? <>No stored harvest yet — <Link href="/settings-library" className="underline">harvest tenant usage</Link> first.</>
                        : s && (
                            <>
                                <span title={RELEVANCE_META[s.relevance].hint} className={`mr-1.5 rounded-full border px-1.5 py-px text-[10px] align-middle ${RELEVANCE_META[s.relevance].className}`}>{RELEVANCE_META[s.relevance].label}</span>
                                {s.relevanceReason}{' '}
                                {`${s.configured} of ${s.total} baseline settings are configured somewhere in your tenant`}
                                {s.configured > 0 && ` (${s.configuredViaBaselinePolicy} in a policy built from this baseline, ${s.configuredViaOwnPolicies} in your own Settings Catalog policies)`}
                                {`: ${s.matching} with Microsoft's recommended value, ${s.different} differently, ${s.missing} in no policy at all${s.notComparable > 0 ? `, ${s.notComparable} without a comparable recommendation` : ''}.`}
                            </>
                        )}
                </CardDescription>
            </CardHeader>
            {coverage && s && (
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        {([['Different', s.different], ['Missing', s.missing], ['Matching', s.matching], ['NotComparable', s.notComparable]] as [BaselineCoverageStatus, number][]).map(([st, n]) => (
                            <Button key={st} size="sm" variant={filter === st ? 'default' : 'outline'} className="h-7 text-xs gap-1" onClick={() => setFilter(prev => prev === st ? null : st)} disabled={n === 0}>
                                {st === 'Different' && <AlertTriangle className="h-3 w-3" />}{COVERAGE_STATUS[st].label} <Badge variant="secondary" className="text-[10px] px-1">{n}</Badge>
                            </Button>
                        ))}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                                    <th className="pb-2 pr-3">Setting</th>
                                    <th className="pb-2 pr-3">Microsoft recommends</th>
                                    <th className="pb-2 pr-3">You configure</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(setting => <SettingRow key={setting.definitionId} setting={setting} />)}
                            </tbody>
                        </table>
                        {visible.length === 0 && <div className="text-sm text-muted-foreground py-4">Nothing in this status.</div>}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Policy names open the Intune admin center.
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
