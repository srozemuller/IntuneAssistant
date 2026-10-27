'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Download, ExternalLink, Info, RefreshCw, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import { useApiRequest } from '@/hooks/useApiRequest';
import { DEPRECATION_RADAR_ENDPOINT } from '@/lib/constants';
import {
    CONSUMER_KIND_LABEL, CONSUMER_ROLE_LABEL, DeprecationFinding, DeprecationFindings, OBJECT_TYPE_LABEL,
    buildDeprecationCsv, describeDays, describeReach,
} from '@/lib/deprecationRadar';

interface ApiEnvelope<T> { status: string; message?: string | null; data: T }

const DUE_SOON_DAYS = 30;

function dueClass(finding: DeprecationFinding) {
    if (finding.daysRemaining == null) return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    return finding.daysRemaining <= DUE_SOON_DAYS
        ? 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
}

function dueText(finding: DeprecationFinding) {
    if (!finding.deadline) return 'No date published';
    const days = finding.daysRemaining;
    if (days == null) return finding.deadline;
    return days < 0 ? `${finding.deadline} · passed ${describeDays(days)}` : `${finding.deadline} · ${describeDays(days)}`;
}

function FindingCard({ finding, defaultOpen }: { finding: DeprecationFinding; defaultOpen: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-lg border bg-card">
            <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left" aria-expanded={open}>
                {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                        {finding.objectName} <span className="text-xs font-normal text-muted-foreground">· {OBJECT_TYPE_LABEL[finding.objectType]}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{finding.ruleTitle}</span>
                </span>
                <Badge variant="outline" className={`text-[11px] shrink-0 ${dueClass(finding)}`}>{dueText(finding)}</Badge>
                <Badge variant="outline" className="text-[11px] shrink-0">
                    {finding.consumers.length} consumer{finding.consumers.length === 1 ? '' : 's'}
                </Badge>
            </button>
            {open && (
                <div className="border-t px-4 py-3 space-y-3 text-sm">
                    {finding.evidence && (
                        <div className="text-xs text-muted-foreground">
                            Rule: <code className="font-mono break-all">{finding.evidence}</code>
                        </div>
                    )}
                    {finding.consumers.length === 0 ? (
                        <div className="text-xs text-muted-foreground">Nothing in this tenant uses it yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left text-muted-foreground">
                                        <th className="py-1 pr-3 font-medium">Consumer</th>
                                        <th className="py-1 pr-3 font-medium">Type</th>
                                        <th className="py-1 pr-3 font-medium">Role</th>
                                        <th className="py-1 font-medium">Reached</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finding.consumers.map(c => (
                                        <tr key={`${c.kind}-${c.id}-${c.role}-${c.via}-${c.viaGroupId ?? ''}`} className="border-t border-dashed">
                                            <td className="py-1 pr-3">{c.name}{c.targetName ? <span className="text-muted-foreground"> → {c.targetName}</span> : null}</td>
                                            <td className="py-1 pr-3">{CONSUMER_KIND_LABEL[c.kind]}{c.resourceType ? <span className="text-muted-foreground"> · {c.resourceType}</span> : null}</td>
                                            <td className="py-1 pr-3">{CONSUMER_ROLE_LABEL[c.role]}</td>
                                            <td className="py-1">{describeReach(c)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {finding.replacement && <div className="text-xs text-muted-foreground">{finding.replacement}</div>}
                    {finding.infoUrl && (
                        <a href={finding.infoUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs underline text-primary">
                            Read Microsoft&apos;s information <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

/** The "Objects and devices" tab of Tenant Impact: what Microsoft is about to stop supporting in this tenant, and what depends on it. */
export function DeprecationRadarPanel() {
    const { request } = useApiRequest();
    const tenantKey = 'home'; // the community edition has no tenant switching
    const runRef = useRef(0);
    const [result, setResult] = useState<DeprecationFindings | null | undefined>(undefined);
    const [ruleId, setRuleId] = useState('');
    const [term, setTerm] = useState('');

    // `refresh` reads the tenant's groups from Graph again; without it the API serves a group list cached for up to an hour.
    const load = useCallback(async (refresh = false) => {
        const run = ++runRef.current;
        setResult(undefined);
        const response = await request<ApiEnvelope<DeprecationFindings>>(refresh ? `${DEPRECATION_RADAR_ENDPOINT}?refresh=true` : DEPRECATION_RADAR_ENDPOINT);
        if (run !== runRef.current) return;
        setResult(response?.data?.data ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantKey]);
    useEffect(() => { load(); }, [load]);
    const generatedAt = result?.generatedAt ? new Date(result.generatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null;

    const all = useMemo(() => result?.findings ?? [], [result]);
    const rules = useMemo(() => {
        const map = new Map<string, { title: string; count: number }>();
        for (const f of all) map.set(f.ruleId, { title: f.ruleTitle, count: (map.get(f.ruleId)?.count ?? 0) + 1 });
        return [...map.entries()];
    }, [all]);

    const filtered = useMemo(() => {
        const needle = term.trim().toLowerCase();
        return all.filter(f => {
            if (ruleId && f.ruleId !== ruleId) return false;
            if (!needle) return true;
            const hay = `${f.objectName} ${f.ruleTitle} ${f.consumers.map(c => c.name).join(' ')}`.toLowerCase();
            return hay.includes(needle);
        });
    }, [all, ruleId, term]);

    const dueSoon = all.filter(f => f.daysRemaining != null && f.daysRemaining <= DUE_SOON_DAYS).length;
    const undated = all.filter(f => f.daysRemaining == null).length;
    const filtersActive = ruleId !== '' || term !== '';

    const exportCsv = () => {
        const blob = new Blob([buildDeprecationCsv(filtered)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `deprecation-radar-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    if (result === undefined) {
        return <AssignmentsTableSkeleton showStats={false} showFilters={true} tableRows={8} tableColumns={4} />;
    }
    if (result === null) {
        return (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground space-y-3">
                <div>The deprecation findings could not be loaded.</div>
                <Button size="sm" variant="outline" onClick={() => load()}>Try again</Button>
            </CardContent></Card>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-3xl">
                Objects in your tenant that Microsoft is about to stop supporting, with the policies, apps and Conditional Access policies that depend on them.
                Nothing is stored; this view is built from your tenant each time you open it.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => load(true)}>
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh from Microsoft Graph
                </Button>
                <span>{generatedAt ? `Updated ${generatedAt}. ` : ''}Groups are cached for up to an hour; refresh after you create or change one.</span>
            </div>

            {result.warnings.length > 0 && (
                <div className="space-y-1">
                    {result.warnings.map(w => (
                        <div key={`${w.code}-${w.message}`} className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w.message}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium mr-1">{all.length.toLocaleString()} finding{all.length === 1 ? '' : 's'}</span>
                {dueSoon > 0 && (
                    <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-[11px]">
                        {dueSoon} due within {DUE_SOON_DAYS} days
                    </Badge>
                )}
                {undated > 0 && (
                    <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px]">
                        {undated} without a date
                    </Badge>
                )}
            </div>

            {all.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Nothing found — no group or filter in this tenant uses something Microsoft is retiring.
                </CardContent></Card>
            ) : (
                <>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <div className="relative flex-1 min-w-[220px] max-w-sm">
                            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input value={term} onChange={e => setTerm(e.target.value)} placeholder="Search object or consumer…" className="h-8 pl-8 text-xs" />
                        </div>
                        <select value={ruleId} onChange={e => setRuleId(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs max-w-[280px]" aria-label="Rule">
                            <option value="">All rules ({all.length})</option>
                            {rules.map(([id, r]) => <option key={id} value={id}>{r.title} ({r.count})</option>)}
                        </select>
                        {filtersActive && (
                            <button type="button" onClick={() => { setRuleId(''); setTerm(''); }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground underline">
                                <X className="h-3 w-3" /> Clear filters
                            </button>
                        )}
                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5 ml-auto" onClick={exportCsv} disabled={filtered.length === 0}>
                            <Download className="h-3.5 w-3.5" /> Export these ({filtered.length})
                        </Button>
                    </div>

                    {filtered.length === 0 ? (
                        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> No findings match these filters.
                        </CardContent></Card>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((f, i) => (
                                <FindingCard key={`${tenantKey}-${f.ruleId}-${f.objectId}`} finding={f} defaultOpen={filtered.length === 1 || (i < 2 && f.consumers.length <= 10)} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
