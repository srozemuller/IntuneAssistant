'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { RELEVANCE_META } from '@/lib/baselineCoverage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiRequest } from '@/hooks/useApiRequest';
import { SETTINGS_LIBRARY_TENANT_IMPACT_ENDPOINT } from '@/lib/constants';
import {
    IMPACT_RULES, IMPACT_RULE_ORDER, ImpactFinding, ImpactRuleId, PolicyAssignmentSummary,
    TenantSettingImpact, intunePolicyUrl,
} from '@/lib/settingsUsage';
import { settingHref } from '@/lib/settingsLibraryGraph';
import { WEB_PLATFORMS } from '@/lib/settingsLibraryGraph';
import {
    AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Download, ExternalLink,
    Filter, Laptop, Loader2, MinusCircle, RefreshCw, Search, ShieldAlert, Users, X,
} from 'lucide-react';

interface ApiEnvelope<T> { status: string; message?: string | null; data: T }

function formatDate(value?: string | null) {
    if (!value) return '—';
    try { return new Date(value).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return value; }
}

const SEVERITY_CLASS: Record<string, string> = {
    High: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
    Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    Low: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
};

function AssignmentPill({ assignment }: { assignment: PolicyAssignmentSummary }) {
    const filter = assignment.filterId
        ? <span className="text-muted-foreground"> · <Filter className="inline h-3 w-3" /> {assignment.filterName ?? assignment.filterId} ({assignment.filterType ?? 'include'})</span>
        : null;
    switch (assignment.targetType) {
        case 'allDevices': return <Badge variant="outline" className="text-xs gap-1 font-normal"><Laptop className="h-3 w-3" /> All devices{filter}</Badge>;
        case 'allUsers': return <Badge variant="outline" className="text-xs gap-1 font-normal"><Users className="h-3 w-3" /> All users{filter}</Badge>;
        case 'exclusionGroup': return <Badge variant="outline" className="text-xs gap-1 font-normal border-red-500/40 text-red-700 dark:text-red-400"><MinusCircle className="h-3 w-3" /> Excluded: {assignment.groupName ?? assignment.groupId}{filter}</Badge>;
        case 'group': return <Badge variant="outline" className="text-xs gap-1 font-normal"><Users className="h-3 w-3" /> {assignment.groupName ?? assignment.groupId}{filter}</Badge>;
        default: return <Badge variant="outline" className="text-xs font-normal">Unknown target{filter}</Badge>;
    }
}

function FindingRow({ finding }: { finding: ImpactFinding }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b last:border-b-0">
            <button onClick={() => setOpen(v => !v)} className="w-full text-left px-3 py-2.5 flex items-start gap-2 hover:bg-muted/40">
                {open ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{finding.displayName ?? finding.policies[0]?.policyName ?? finding.key}</span>
                        <Badge className={`text-[11px] ${SEVERITY_CLASS[finding.severity] ?? ''}`}>{finding.severity}</Badge>
                        {finding.sinceHarvest && <Badge variant="outline" className="text-[11px]">since your harvest</Badge>}
                        {finding.replacements.length > 0 && <Badge className="text-[11px] bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30">replacement known</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{finding.title}</div>
                </div>
            </button>
            {open && (
                <div className="px-9 pb-3 space-y-3 text-sm">
                    {finding.detail && <p className="text-muted-foreground">{finding.detail}</p>}

                    {finding.replacements.length > 0 && (
                        <div className="rounded-md border border-green-500/30 bg-green-500/5 p-2.5 space-y-1">
                            <div className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">Use instead</div>
                            {finding.replacements.map(r => (
                                <div key={r.settingId}>
                                    <Link href={settingHref(r.settingId)} className="font-medium hover:underline">{r.displayName ?? r.definitionId}</Link>
                                    <span className="text-xs text-muted-foreground"> · {r.confidence} confidence</span>
                                    {r.evidence && <div className="text-xs text-muted-foreground italic mt-0.5">“{r.evidence}”</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {finding.baseline && (
                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span title={finding.baseline.relevanceReason ?? ''} className={`rounded-full border px-1.5 py-px text-[10px] ${RELEVANCE_META[finding.baseline.relevance].className}`}>{RELEVANCE_META[finding.baseline.relevance].label}</span>
                            <span><span className="text-foreground">{finding.baseline.matching}</span> match</span>
                            <span><span className="text-amber-700 dark:text-amber-400">{finding.baseline.different}</span> differ</span>
                            <span><span className="text-red-700 dark:text-red-400">{finding.baseline.missing}</span> not configured</span>
                            <span>of {finding.baseline.total}</span>
                            <Link href={`/settings-library/baselines/${finding.baseline.familyId}`} className="hover:underline inline-flex items-center gap-1">Setting-by-setting <ArrowRight className="h-3 w-3" /></Link>
                        </div>
                    )}

                    {finding.version && (
                        <div className="text-xs text-muted-foreground">
                            Supported range: {finding.version.minimumSupportedVersion ?? '*'} – {finding.version.maximumSupportedVersion ?? '*'} ·
                            {' '}{finding.version.devicesBelowMinimum > 0 && `${finding.version.devicesBelowMinimum} below`}
                            {finding.version.devicesAboveMaximum > 0 && `${finding.version.devicesAboveMaximum} above`} of {finding.version.devicesOnPlatform} devices
                            {finding.version.examples.length > 0 && (
                                <span> — e.g. {finding.version.examples.map(e => `${e.version} (${e.count})`).join(', ')}</span>
                            )}
                        </div>
                    )}

                    {finding.changedProperties.length > 0 && (
                        <div className="space-y-0.5">
                            {finding.changedProperties.slice(0, 8).map((p, i) => (
                                <div key={i} className="text-xs flex items-start gap-1.5">
                                    <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                                    <span><span className="font-medium">{p.changeType}</span>{p.field && <span className="text-muted-foreground"> ({p.field})</span>}
                                        {p.previousValue && p.currentValue && <span className="text-muted-foreground">: <span className="line-through">{p.previousValue}</span> → {p.currentValue}</span>}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        {finding.policies.map(p => (
                            <div key={p.policyId} className="flex flex-wrap items-center gap-1.5">
                                <a href={intunePolicyUrl(p.policyId)} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
                                    {p.policyName} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                </a>
                                {p.isAssigned
                                    ? p.assignments.map((a, i) => <AssignmentPill key={i} assignment={a} />)
                                    : <span className="text-xs text-amber-700 dark:text-amber-400 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> not assigned</span>}
                            </div>
                        ))}
                    </div>

                    {finding.settingId && (
                        <Link href={settingHref(finding.settingId)} className="text-xs hover:underline inline-flex items-center gap-1">
                            Open the setting <ArrowRight className="h-3 w-3" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

type GroupBy = 'rule' | 'policy' | 'severity';
const SEVERITIES = ['High', 'Medium', 'Low'] as const;
type Severity = typeof SEVERITIES[number];
const SEVERITY_DOT: Record<Severity, string> = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-blue-500' };
const PAGE = 25;
const platformLabel = (id: string) => WEB_PLATFORMS.find(p => p.id === id)?.label ?? id;

function csvCell(value: string) {
    // Leading = + - @ would run as a formula in Excel; quote everything and neutralise those.
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
}

/** One collapsible group of findings, paged so a 150-policy group does not become the page. */
function FindingGroup({ title, subtitle, findings, defaultOpen, badge }: { title: React.ReactNode; subtitle?: string; findings: ImpactFinding[]; defaultOpen: boolean; badge?: React.ReactNode }) {
    const [open, setOpen] = useState(defaultOpen);
    const [shown, setShown] = useState(PAGE);
    return (
        <Card className="py-0 gap-0 overflow-hidden">
            <button type="button" onClick={() => setOpen(v => !v)} className="w-full text-left px-4 py-3 flex items-start gap-2 hover:bg-muted/40">
                {open ? <ChevronDown className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                    <div className="font-medium flex items-center gap-2 flex-wrap">{title}<Badge variant="secondary" className="text-xs">{findings.length}</Badge>{badge}</div>
                    {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-1">
                    {SEVERITIES.map(sev => {
                        const n = findings.filter(f => f.severity === sev).length;
                        return n > 0 ? <span key={sev} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[sev]}`} />{n}</span> : null;
                    })}
                </div>
            </button>
            {open && (
                <CardContent className="p-0">
                    <div className="border-t">
                        {findings.slice(0, shown).map(f => <FindingRow key={`${f.ruleId}|${f.key}`} finding={f} />)}
                    </div>
                    {findings.length > shown && (
                        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center gap-3">
                            Showing {shown} of {findings.length}
                            <button type="button" className="underline hover:text-foreground" onClick={() => setShown(v => v + PAGE * 2)}>Show more</button>
                            <button type="button" className="underline hover:text-foreground" onClick={() => setShown(findings.length)}>Show all</button>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

export default function TenantImpactPage() {
    const { request } = useApiRequest();
    const runRef = useRef(0);
    const [impact, setImpact] = useState<TenantSettingImpact | null | undefined>(undefined);

    // ── investigation state ──
    const [activeRule, setActiveRule] = useState<ImpactRuleId | null>(null);
    const [severities, setSeverities] = useState<Severity[]>([]);
    const [term, setTerm] = useState('');
    const [platform, setPlatform] = useState('');
    const [policyId, setPolicyId] = useState('');
    const [onlyAssigned, setOnlyAssigned] = useState(false);
    const [onlyReplaceable, setOnlyReplaceable] = useState(false);
    const [onlySinceHarvest, setOnlySinceHarvest] = useState(false);
    const [groupBy, setGroupBy] = useState<GroupBy>('rule');

    // Sequential — useApiRequest aborts an in-flight request when a new one starts.
    const load = useCallback(async () => {
        const run = ++runRef.current;
        const impactResponse = await request<ApiEnvelope<TenantSettingImpact>>(SETTINGS_LIBRARY_TENANT_IMPACT_ENDPOINT);
        if (run !== runRef.current) return;
        setImpact(impactResponse?.data?.data ?? null);
    }, [request]);
    useEffect(() => { load(); }, [load]);

    const all = useMemo(() => impact?.findings ?? [], [impact]);

    // Filter options come from the findings themselves, with counts, so nothing offered is empty.
    const platformOptions = useMemo(() => {
        const counts = new Map<string, number>();
        for (const f of all) for (const p of f.platforms) counts.set(p, (counts.get(p) ?? 0) + 1);
        return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    }, [all]);
    const policyOptions = useMemo(() => {
        const map = new Map<string, { name: string; count: number }>();
        for (const f of all) for (const p of f.policies) map.set(p.policyId, { name: p.policyName, count: (map.get(p.policyId)?.count ?? 0) + 1 });
        return [...map.entries()].sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name));
    }, [all]);

    // Everything except the rule filter — the tiles show what each rule holds under the other filters.
    const preRule = useMemo(() => {
        const needle = term.trim().toLowerCase();
        return all.filter(f => {
            if (severities.length > 0 && !severities.includes(f.severity)) return false;
            if (platform && !f.platforms.includes(platform)) return false;
            if (policyId && !f.policies.some(p => p.policyId === policyId)) return false;
            if (onlyAssigned && !f.policies.some(p => p.isAssigned)) return false;
            if (onlyReplaceable && f.replacements.length === 0) return false;
            if (onlySinceHarvest && !f.sinceHarvest) return false;
            if (needle) {
                const hay = `${f.displayName ?? ''} ${f.title} ${f.definitionId ?? ''} ${f.policies.map(p => p.policyName).join(' ')}`.toLowerCase();
                if (!hay.includes(needle)) return false;
            }
            return true;
        });
    }, [all, severities, platform, policyId, onlyAssigned, onlyReplaceable, onlySinceHarvest, term]);
    const filtered = useMemo(() => activeRule ? preRule.filter(f => f.ruleId === activeRule) : preRule, [preRule, activeRule]);

    const groups = useMemo(() => {
        const out: { id: string; title: React.ReactNode; subtitle?: string; findings: ImpactFinding[]; badge?: React.ReactNode }[] = [];
        if (groupBy === 'rule') {
            for (const rule of IMPACT_RULE_ORDER) {
                const findings = filtered.filter(f => f.ruleId === rule);
                if (findings.length) out.push({ id: rule, title: IMPACT_RULES[rule].label, subtitle: IMPACT_RULES[rule].blurb, findings });
            }
        } else if (groupBy === 'severity') {
            for (const sev of SEVERITIES) {
                const findings = filtered.filter(f => f.severity === sev);
                if (findings.length) out.push({ id: sev, title: <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${SEVERITY_DOT[sev]}`} />{sev}</span>, findings });
            }
        } else {
            const byPolicy = new Map<string, { name: string; assigned: boolean; findings: ImpactFinding[] }>();
            const noPolicy: ImpactFinding[] = [];
            for (const f of filtered) {
                if (f.policies.length === 0) { noPolicy.push(f); continue; }
                for (const p of f.policies) {
                    if (policyId && p.policyId !== policyId) continue;
                    const entry = byPolicy.get(p.policyId) ?? { name: p.policyName, assigned: p.isAssigned, findings: [] };
                    entry.findings.push(f);
                    byPolicy.set(p.policyId, entry);
                }
            }
            const rank = (list: ImpactFinding[]) => list.reduce((s, f) => s + (f.severity === 'High' ? 100 : f.severity === 'Medium' ? 10 : 1), 0);
            for (const [id, entry] of [...byPolicy.entries()].sort((a, b) => rank(b[1].findings) - rank(a[1].findings) || a[1].name.localeCompare(b[1].name)))
                out.push({
                    id, title: entry.name, findings: entry.findings,
                    subtitle: [...new Set(entry.findings.map(f => IMPACT_RULES[f.ruleId].label))].join(' · '),
                    badge: entry.assigned ? undefined : <Badge variant="outline" className="text-[11px] text-amber-700 dark:text-amber-400 border-amber-500/40">not assigned</Badge>,
                });
            if (noPolicy.length) out.push({ id: '__none__', title: 'Not tied to one policy', subtitle: 'Baselines and tenant-wide findings', findings: noPolicy });
        }
        return out;
    }, [filtered, groupBy, policyId]);

    const severityCounts = useMemo(() => Object.fromEntries(SEVERITIES.map(sev => [sev, all.filter(f => f.severity === sev).length])) as Record<Severity, number>, [all]);
    const filtersActive = activeRule !== null || severities.length > 0 || term !== '' || platform !== '' || policyId !== '' || onlyAssigned || onlyReplaceable || onlySinceHarvest;
    const clearFilters = () => { setActiveRule(null); setSeverities([]); setTerm(''); setPlatform(''); setPolicyId(''); setOnlyAssigned(false); setOnlyReplaceable(false); setOnlySinceHarvest(false); };
    const toggleSeverity = (sev: Severity) => setSeverities(prev => prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev]);

    const exportCsv = () => {
        const rows = [['Severity', 'Rule', 'Setting or subject', 'Finding', 'Platforms', 'Policies', 'Assigned', 'Replacement', 'Since harvest']];
        for (const f of filtered) rows.push([
            f.severity, IMPACT_RULES[f.ruleId].label, f.displayName ?? f.key, f.title, f.platforms.map(platformLabel).join(', '),
            f.policies.map(p => p.policyName).join('; '), f.policies.length === 0 ? '' : f.policies.some(p => p.isAssigned) ? 'yes' : 'no',
            f.replacements.map(r => r.displayName ?? r.definitionId).join('; '), f.sinceHarvest ? 'yes' : '',
        ]);
        const blob = new Blob(['﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `tenant-impact-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const Toggle = ({ on, set, children }: { on: boolean; set: (v: boolean) => void; children: React.ReactNode }) => (
        <button type="button" onClick={() => set(!on)} className={`h-8 rounded-md border px-2.5 text-xs transition-colors ${on ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>{children}</button>
    );

    return (
        <div className="p-6 space-y-5">
            {/* ── header: what this is, how fresh it is, and the one action ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldAlert className="h-6 w-6" /> Settings impact for your tenant</h1>
                    <p className="text-muted-foreground mt-1 text-sm max-w-3xl">
                        What in your configuration is deprecated, removed, changed, dead or unsupported — and what to use instead.
                    </p>
                </div>
                {impact?.harvestedAt && (
                    <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-2.5">
                        <div>
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Last harvest</div>
                            <div className="text-base font-semibold leading-tight">{formatDate(impact.harvestedAt)}</div>
                            <div className="text-xs text-muted-foreground">
                                {impact.hasDeviceOsCounts ? `${impact.devicesTotal.toLocaleString()} device${impact.devicesTotal === 1 ? '' : 's'}` : 'device OS versions not available'}
                                {' · '}{policyOptions.length.toLocaleString()} polic{policyOptions.length === 1 ? 'y' : 'ies'} with findings
                            </div>
                        </div>
                        <Button asChild size="sm" className="gap-1.5 shrink-0">
                            <Link href="/settings-library?harvest=1&return=impact"><RefreshCw className="h-3.5 w-3.5" /> Harvest again</Link>
                        </Button>
                    </div>
                )}
            </div>

            {impact === undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Computing…</div>
            )}

            {impact !== undefined && !impact?.harvestedAt && (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground space-y-3">
                        <div>Tenant usage hasn&apos;t been harvested yet. This report is built from it.</div>
                        <Button asChild size="sm" className="gap-1.5"><Link href="/settings-library?harvest=1&return=impact"><RefreshCw className="h-3.5 w-3.5" /> Harvest tenant usage</Link></Button>
                    </CardContent>
                </Card>
            )}

            {impact?.harvestedAt && (
                <>
                    {/* ── severity: the first cut ── */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium mr-1">{all.length.toLocaleString()} finding{all.length === 1 ? '' : 's'}</span>
                        {SEVERITIES.map(sev => (
                            <button key={sev} type="button" onClick={() => toggleSeverity(sev)} disabled={severityCounts[sev] === 0}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${severities.includes(sev) ? SEVERITY_CLASS[sev] : 'hover:bg-muted/50'}`}>
                                <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[sev]}`} /> {severityCounts[sev]} {sev}
                            </button>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">High = already broken or gone · Medium = will break or deviates · Low = worth a look</span>
                    </div>

                    {/* ── rule tiles: click to focus one rule; counts follow the other filters ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {IMPACT_RULE_ORDER.map(rule => {
                            const count = preRule.filter(f => f.ruleId === rule).length;
                            const totalForRule = impact.countsByRule[rule] ?? 0;
                            const active = activeRule === rule;
                            return (
                                <button key={rule} type="button" onClick={() => setActiveRule(prev => prev === rule ? null : rule)} title={IMPACT_RULES[rule].blurb}
                                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${active ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'} ${count === 0 ? 'opacity-50' : ''}`}>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-semibold tabular-nums">{count}</span>
                                        {count !== totalForRule && <span className="text-[11px] text-muted-foreground">of {totalForRule}</span>}
                                        <span className="text-[11px] text-muted-foreground">{count === 1 ? IMPACT_RULES[rule].unit.replace(/ies$/, 'y').replace(/s$/, '') : IMPACT_RULES[rule].unit}</span>
                                    </div>
                                    <div className="text-xs font-medium">{IMPACT_RULES[rule].label}</div>
                                </button>
                            );
                        })}
                    </div>

                    {impact.deviceOsCountsError && (
                        <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" /> Device OS versions could not be read at the last harvest ({impact.deviceOsCountsError}); the build-version rules were skipped.
                        </div>
                    )}

                    {/* ── toolbar: narrow down, regroup, take it with you ── */}
                    <div className="sticky top-0 z-10 -mx-2 px-2 py-2 bg-background/95 backdrop-blur border-b space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative flex-1 min-w-[220px] max-w-sm">
                                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input value={term} onChange={e => setTerm(e.target.value)} placeholder="Search setting or policy…" className="h-8 pl-8 text-xs" />
                            </div>
                            <select value={platform} onChange={e => setPlatform(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs max-w-[180px]" aria-label="Platform">
                                <option value="">All platforms</option>
                                {platformOptions.map(([id, n]) => <option key={id} value={id}>{platformLabel(id)} ({n})</option>)}
                            </select>
                            <select value={policyId} onChange={e => setPolicyId(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs max-w-[260px]" aria-label="Policy">
                                <option value="">All policies ({policyOptions.length})</option>
                                {policyOptions.map(([id, p]) => <option key={id} value={id}>{p.name} ({p.count})</option>)}
                            </select>
                            <Toggle on={onlyAssigned} set={setOnlyAssigned}>Assigned only</Toggle>
                            <Toggle on={onlyReplaceable} set={setOnlyReplaceable}>Replacement known</Toggle>
                            <Toggle on={onlySinceHarvest} set={setOnlySinceHarvest}>New since harvest</Toggle>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="text-muted-foreground">Group by</span>
                            <div className="flex rounded-md border overflow-hidden">
                                {(['rule', 'policy', 'severity'] as GroupBy[]).map(g => (
                                    <button key={g} type="button" onClick={() => setGroupBy(g)} className={`px-2.5 py-1 capitalize ${groupBy === g ? 'bg-muted font-medium' : 'text-muted-foreground hover:text-foreground'}`}>{g}</button>
                                ))}
                            </div>
                            <span className="text-muted-foreground ml-1">
                                {filtersActive ? <>Showing <span className="text-foreground font-medium">{filtered.length}</span> of {all.length}</> : <>{all.length} findings</>}
                                {groupBy === 'policy' && ` in ${groups.length} polic${groups.length === 1 ? 'y' : 'ies'}`}
                            </span>
                            {filtersActive && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground underline"><X className="h-3 w-3" /> Clear filters</button>}
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5 ml-auto" onClick={exportCsv} disabled={filtered.length === 0}><Download className="h-3.5 w-3.5" /> Export these ({filtered.length})</Button>
                        </div>
                    </div>

                    {all.length === 0 && (
                        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" /> Nothing found — every setting you use is current, assigned and supported.
                        </CardContent></Card>
                    )}
                    {all.length > 0 && filtered.length === 0 && (
                        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
                            No findings match these filters. <button type="button" onClick={clearFilters} className="underline">Clear filters</button>
                        </CardContent></Card>
                    )}

                    <div className="space-y-3">
                        {groups.map((g, i) => (
                            <FindingGroup key={`${groupBy}-${g.id}`} title={g.title} subtitle={g.subtitle} findings={g.findings} badge={g.badge}
                                defaultOpen={groups.length === 1 || (i < 3 && g.findings.length <= 15)} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
