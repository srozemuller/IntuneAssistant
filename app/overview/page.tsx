// app/overview/page.tsx
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import { SearchQueryParam } from '@/components/SearchQueryParam';
import { useTenantOverview, formatRelativeTime } from '@/contexts/TenantOverviewContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Database,
    Layers,
    Loader2,
    Play,
    RefreshCw,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OverviewItem } from '@/types/tenantOverview';

const ROWS_PER_SECTION = 25;
const PLATFORM_COLORS = ['#334155', '#0f172a', '#64748b', '#7c3aed', '#0891b2', '#dc2626', '#94a3b8'];

interface PlatformSlice {
    name: string;
    value: number;
}

interface PlatformTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
}

const PlatformTooltip = ({ active, payload }: PlatformTooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {payload[0].name}: {payload[0].value}
            </p>
        </div>
    );
};

function formatDate(value: string | null): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return '';
    return date.toLocaleDateString();
}

function AssignmentBadge({ item }: { item: OverviewItem }) {
    if (item.supportsAssignments === false) {
        return null; // filters, scope tags, roles: nothing to assign
    }
    if (item.isTenantDefault) {
        return <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300">Tenant default</Badge>;
    }
    if (item.configurationState === 'NotConfigured') {
        return <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">Not configured</Badge>;
    }
    return item.isAssigned
        ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300">Assigned</Badge>
        : <Badge variant="outline" className="border-red-300 text-red-700 dark:border-red-800 dark:text-red-400">Not assigned</Badge>;
}

function matchesSearch(item: OverviewItem, tokens: string[]): boolean {
    if (tokens.length === 0) return true;
    const haystack = [item.name, item.description, item.platform, item.policySubType, item.policyType, item.id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    return tokens.every(token => haystack.includes(token));
}

function OverviewHero() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-slate-700 to-gray-900 p-8 text-white">
            <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
                        <Database className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="border-white/30 bg-white/20 text-white">
                        Tenant Overview
                    </Badge>
                </div>
                <h1 className="mb-4 text-4xl font-bold">Every configuration, in one place</h1>
                <p className="max-w-2xl text-xl text-slate-200">
                    Every configuration in your Intune tenant, streamed once and kept for 30 minutes so the rest of the app — and the global search — can use it instantly.
                </p>
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-10">
                <div className="absolute right-20 top-20 h-64 w-64 rounded-full bg-gradient-to-br from-slate-400 to-gray-400 blur-3xl" />
                <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-gradient-to-br from-gray-400 to-slate-400 blur-2xl" />
            </div>
        </div>
    );
}

export default function TenantOverviewPage() {
    return <TenantOverviewContent />;
}

function TenantOverviewContent() {
    const { accounts } = useMsal();
    const {
        phase,
        sections,
        assignments,
        sectionSummaries,
        allItems,
        totalCount,
        assignedCount,
        unassignedCount,
        fetchedAt,
        isStale,
        isFromCache,
        isFromServerCache,
        progress,
        warnings,
        error,
        durationMs,
        isStatusVisible,
        showStatus,
        refresh,
        reset,
        autoStartEnabled,
        setAutoStartEnabled,
    } = useTenantOverview();

    const [search, setSearch] = useState('');
    const applyQueryParam = useCallback((value: string) => setSearch(value), []);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const tokens = useMemo(() => search.toLowerCase().split(/\s+/).filter(Boolean), [search]);

    const tenantDefaultCount = useMemo(() => allItems.filter(i => i.isTenantDefault).length, [allItems]);
    const loadedTypes = useMemo(() => sectionSummaries.filter(s => s.count > 0).length, [sectionSummaries]);

    const platformSlices = useMemo<PlatformSlice[]>(() => {
        const counts = new Map<string, number>();
        allItems.forEach(item => {
            const key = item.platform && item.platform.trim() ? item.platform : 'Unknown';
            counts.set(key, (counts.get(key) ?? 0) + 1);
        });
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 6).map(([name, value]) => ({ name, value }));
        const rest = sorted.slice(6).reduce((sum, [, value]) => sum + value, 0);
        return rest > 0 ? [...top, { name: 'Other', value: rest }] : top;
    }, [allItems]);

    const visibleSections = useMemo(() => {
        return Object.values(sections)
            .sort((a, b) => a.stepIndex - b.stepIndex)
            .map(section => ({
                ...section,
                items: section.items.filter(item => matchesSearch(item, tokens)),
            }))
            .filter(section => tokens.length === 0 || section.items.length > 0);
    }, [sections, tokens]);

    const matchedCount = useMemo(
        () => visibleSections.reduce((sum, s) => sum + s.items.length, 0),
        [visibleSections]
    );

    const isSectionOpen = (key: string) => openSections[key] ?? tokens.length > 0;

    if (accounts.length === 0) return null;

    return (
        <div className="space-y-6">
            <SearchQueryParam onQuery={applyQueryParam} />
            <OverviewHero />

            {/* Header controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="text-sm">
                    {phase === 'streaming' && (
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading {Math.round(progress * 100)}%
                        </span>
                    )}
                    {phase !== 'streaming' && fetchedAt !== null && (
                        <>
                            <span className="text-gray-600 dark:text-gray-400">
                                Data collected {formatRelativeTime(fetchedAt)}{isFromCache ? ' (cached)' : isFromServerCache ? ' (shared tenant snapshot)' : ''}
                            </span>
                            {isStale && (
                                <span className="block text-xs font-medium text-amber-600 dark:text-amber-400">Refresh recommended</span>
                            )}
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {phase === 'streaming' && !isStatusVisible && (
                        <Button variant="outline" size="sm" onClick={showStatus}>
                            <Activity className="mr-2 h-4 w-4" />
                            Show progress
                        </Button>
                    )}
                    <Button onClick={refresh} disabled={phase === 'streaming'} size="sm">
                        <RefreshCw className={cn('mr-2 h-4 w-4', phase === 'streaming' && 'animate-spin')} />
                        Refresh data
                    </Button>
                    <span title="Clear the cached overview for this tenant and collect everything from scratch">
                        <Button onClick={reset} disabled={phase === 'streaming'} size="sm" variant="ghost">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Reset cache
                        </Button>
                    </span>
                </div>
            </div>

            {/* Inline error / partial-data state (no toasts in this app) */}
            {phase === 'failed' && (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
                    <CardContent className="flex items-start gap-3 py-4">
                        <XCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                        <div className="flex-1">
                            <p className="font-medium text-red-800 dark:text-red-300">The overview could not be loaded</p>
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={refresh}>Try again</Button>
                    </CardContent>
                </Card>
            )}
            {warnings.length > 0 && phase !== 'failed' && (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
                    <CardContent className="flex items-start gap-3 py-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300">Some resource types could not be loaded</p>
                            <ul className="mt-1 list-inside list-disc text-sm text-amber-700 dark:text-amber-400">
                                {warnings.map(w => <li key={w}>{w}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {phase === 'idle' ? (
                <Card className="shadow-sm">
                    <CardContent className="py-16 text-center">
                        <Database className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-gray-100">Nothing collected yet</h3>
                        <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
                            Start collecting to stream every configuration in this tenant. The status window in the bottom-right corner shows each resource type as it lands.
                        </p>
                        <Button onClick={refresh} size="lg">
                            <Play className="mr-2 h-5 w-5" />
                            Start collecting
                        </Button>
                        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <Switch id="overview-autostart" checked={autoStartEnabled} onCheckedChange={setAutoStartEnabled} />
                            <label htmlFor="overview-autostart">Collect automatically at sign-in</label>
                        </div>
                    </CardContent>
                </Card>
            ) : phase === 'streaming' && totalCount === 0 ? (
                <AssignmentsTableSkeleton showStats={true} showFilters={true} tableRows={12} tableColumns={5} />
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-white dark:bg-gray-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total configurations</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalCount}</p>
                                    </div>
                                    <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800"><Database className="h-6 w-6 text-slate-600 dark:text-slate-300" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{assignedCount}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{unassignedCount} not assigned · {tenantDefaultCount} tenant defaults</p>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/40"><CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Configuration types</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{loadedTypes}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">of {sectionSummaries.length} resource families</p>
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/40"><Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-gray-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Data loaded</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{Math.round(progress * 100)}%</p>
                                        {phase === 'completed' && durationMs > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">in {(durationMs / 1000).toFixed(1)}s</p>
                                        )}
                                    </div>
                                    <div className="rounded-full bg-cyan-100 p-3 dark:bg-cyan-900/40"><Activity className="h-6 w-6 text-cyan-600 dark:text-cyan-400" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resource families + platform split */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <Card className="bg-white dark:bg-gray-800 lg:col-span-3">
                            <CardHeader>
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Resource types</CardTitle>
                                        <CardDescription>What was found per family.</CardDescription>
                                    </div>
                                    <span className="text-xs uppercase tracking-wide text-gray-400">assigned / total</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                                    {sectionSummaries.map(summary => {
                                        const assignable = summary.supportsAssignments;
                                        const denominator = assignable ? summary.assignableCount : summary.count;
                                        const share = denominator > 0 ? (summary.assignedCount / denominator) * 100 : 0;
                                        const unassigned = Math.max(summary.assignableCount - summary.assignedCount, 0);
                                        const nonAssignable = Math.max(summary.count - summary.assignableCount, 0);
                                        const title = assignable
                                            ? `${summary.assignedCount} assigned · ${unassigned} not assigned${nonAssignable > 0 ? ` · ${nonAssignable} not assignable` : ''}`
                                            : `${summary.count} items · not assignable`;
                                        return (
                                            <li key={summary.key} className="group flex items-center gap-3 py-1" title={title}>
                                                <span className="flex w-44 shrink-0 items-center gap-2 truncate text-sm text-gray-800 dark:text-gray-200">
                                                    {summary.status === 'loading' && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-500" />}
                                                    {summary.status === 'failed' && <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                                                    <span className="truncate">{summary.label}</span>
                                                </span>
                                                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                                    {assignable && share > 0 && (
                                                        <span className="block h-full rounded-full bg-slate-500 transition-all" style={{ width: `${share}%` }} />
                                                    )}
                                                </span>
                                                <span className="w-24 shrink-0 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                                                    {assignable
                                                        ? <>{summary.assignedCount}<span className="text-gray-400"> / {denominator}</span></>
                                                        : <span className="text-gray-400">{summary.count}</span>}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-800 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">By platform</CardTitle>
                                <CardDescription>Where your configurations apply.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {platformSlices.length === 0 ? (
                                    <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">No data yet.</p>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 md:flex-row">
                                        <div className="h-[220px] w-full md:w-1/2">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={platformSlices} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                                                        {platformSlices.map((slice, index) => (
                                                            <Cell key={slice.name} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<PlatformTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <ul className="w-full space-y-1.5 text-sm md:w-1/2">
                                            {platformSlices.map((slice, index) => (
                                                <li key={slice.name} className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[index % PLATFORM_COLORS.length] }} />
                                                        {slice.name}
                                                    </span>
                                                    <span className="tabular-nums text-gray-600 dark:text-gray-400">
                                                        {slice.value} <span className="text-xs">({Math.round((slice.value / Math.max(totalCount, 1)) * 100)}%)</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search + grouped inventory */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <CardTitle className="text-lg">All configurations</CardTitle>
                                    <CardDescription>
                                        {tokens.length > 0 ? `${matchedCount} of ${totalCount} match your search` : `${totalCount} configurations across ${loadedTypes} types`}
                                        {assignments && ` · ${assignments.length} assignment rows`}
                                    </CardDescription>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search configurations..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {visibleSections.length === 0 && (
                                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {tokens.length > 0 ? 'Nothing matches your search.' : 'No configurations loaded yet.'}
                                </p>
                            )}
                            {visibleSections.map(section => {
                                const open = isSectionOpen(section.key);
                                const expanded = expandedSections[section.key] ?? false;
                                const rows = expanded ? section.items : section.items.slice(0, ROWS_PER_SECTION);
                                return (
                                    <Collapsible
                                        key={section.key}
                                        open={open}
                                        onOpenChange={value => setOpenSections(prev => ({ ...prev, [section.key]: value }))}
                                        className="rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                            <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                                {open ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                                {section.label}
                                            </span>
                                            <Badge variant="secondary">{section.items.length}</Badge>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-700 dark:border-gray-700">
                                                {rows.map(item => (
                                                    <li key={`${section.key}-${item.id}`} className="px-4 py-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                {item.name || item.id}
                                                            </span>
                                                            {item.platform && <Badge variant="outline" className="text-xs">{item.platform}</Badge>}
                                                            {item.policySubType && <Badge variant="outline" className="text-xs font-normal text-gray-500">{item.policySubType}</Badge>}
                                                            {item.templateDisplayName && <Badge variant="outline" className="text-xs font-normal text-gray-500">{item.templateDisplayName}</Badge>}
                                                            <AssignmentBadge item={item} />
                                                        </div>
                                                        {item.description && (
                                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                                        )}
                                                        <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(item.lastModifiedDateTime) && <span>Modified {formatDate(item.lastModifiedDateTime)}</span>}
                                                            {item.settingCount > 0 && <span>{item.settingCount} settings</span>}
                                                            {item.assignments.length > 0 && !item.isTenantDefault && (
                                                                <span>{item.assignments.length} assignment{item.assignments.length === 1 ? '' : 's'}</span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                                {section.items.length > ROWS_PER_SECTION && (
                                                    <li className="px-4 py-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setExpandedSections(prev => ({ ...prev, [section.key]: !expanded }))}
                                                        >
                                                            {expanded ? 'Show fewer' : `Show all ${section.items.length}`}
                                                        </Button>
                                                    </li>
                                                )}
                                            </ul>
                                        </CollapsibleContent>
                                    </Collapsible>
                                );
                            })}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
