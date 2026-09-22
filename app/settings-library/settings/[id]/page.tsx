'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT,
    SETTINGS_LIBRARY_SETTING_BY_DEFINITION_ENDPOINT,
    SETTINGS_LIBRARY_SETTING_HISTORY_ENDPOINT,
    SETTINGS_LIBRARY_SETTING_CONTEXT_ENDPOINT,
    SETTINGS_LIBRARY_SETTING_TENANT_USAGE_ENDPOINT,
} from '@/lib/constants';
import { isGuid, settingHref } from '@/lib/settingsLibraryGraph';
import { SettingContext } from '@/lib/settingsExplorer';
import { SettingContextPanel } from '@/components/settings-library/SettingContextPanel';
import { SettingFocusMap, hasDependencies } from '@/components/settings-library/SettingFocusMap';
import {
    TenantSettingUsageDetail, PolicyAssignmentSummary, SettingRelation, intunePolicyUrl, policyTypeLabel,
} from '@/lib/settingsUsage';
import {
    ArrowLeft, ShieldCheck, AlertTriangle, XCircle, Clock, ChevronRight, Sparkles, Pencil,
    RotateCcw, Monitor, User, Loader2, History as HistoryIcon, Info, Share2, ArrowLeftRight,
    Building2, Users, Laptop, MinusCircle, Filter, ExternalLink, Replace,
} from 'lucide-react';

// ─── Types (mirrors IntuneAssistant.Dto.Response.SettingsLibrary) ──────────────

interface ApiEnvelope<T> {
    status: string;
    message?: string | null;
    data: T;
}

type LifecycleStatus = 'Active' | 'Deprecated' | 'PossiblyRemoved' | 'Removed';

interface CatalogSettingRevision {
    id: string;
    revisionNumber: number;
    displayName: string | null;
    description: string | null;
    helpText: string | null;
    platforms: string[];
    technologies: string[];
    categoryId: string | null;
    baseUri: string | null;
    offsetUri: string | null;
    scope: 'device' | 'user' | null;
    riskLevel: string | null;
    settingUsage: string | null;
    applicabilityDescription: string | null;
    minimumSupportedVersion: string | null;
    maximumSupportedVersion: string | null;
    observedAt: string;
    lastObservedAt: string;
}

interface CatalogSettingDetail {
    id: string;
    graphDefinitionId: string;
    canonicalName: string | null;
    lifecycleStatus: LifecycleStatus;
    firstSeenAt: string;
    lastSeenAt: string;
    revisionCount: number;
    currentRevision: CatalogSettingRevision | null;
    incomingRelations?: SettingRelation[];
    outgoingRelations?: SettingRelation[];
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

interface SettingHistoryEntry {
    revision: CatalogSettingRevision | null;
    occurredAt: string;
    change: SettingChange;
}

const CHANGE_TYPE_BADGE: Record<string, { icon: React.ElementType; className: string; label: string }> = {
    Added: { icon: Sparkles, className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30', label: 'Added' },
    Changed: { icon: Pencil, className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30', label: 'Changed' },
    Removed: { icon: XCircle, className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30', label: 'Removed' },
    Reappeared: { icon: RotateCcw, className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', label: 'Reappeared' },
    Deprecated: { icon: AlertTriangle, className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30', label: 'Deprecated' },
    PossiblyRemoved: { icon: AlertTriangle, className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30', label: 'Possibly removed' },
};

const IMPORTANCE_DOT: Record<string, string> = {
    High: 'bg-red-500',
    Medium: 'bg-amber-500',
    Low: 'bg-muted-foreground/40',
};

function formatDate(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return value;
    }
}

function lifecycleBadge(status: LifecycleStatus) {
    switch (status) {
        case 'Active':
            return <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1"><ShieldCheck className="h-3 w-3" /> Active</Badge>;
        case 'Deprecated':
            return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"><AlertTriangle className="h-3 w-3" /> Deprecated</Badge>;
        case 'PossiblyRemoved':
            return <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1"><AlertTriangle className="h-3 w-3" /> Possibly Removed</Badge>;
        case 'Removed':
            return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1"><XCircle className="h-3 w-3" /> Removed</Badge>;
    }
}

function scopeBadge(scope: 'device' | 'user' | null) {
    if (!scope) return null;
    return scope === 'device'
        ? <Badge variant="outline" className="gap-1 text-xs"><Monitor className="h-3 w-3" /> Device</Badge>
        : <Badge variant="outline" className="gap-1 text-xs"><User className="h-3 w-3" /> User</Badge>;
}

function AssignmentPill({ assignment }: { assignment: PolicyAssignmentSummary }) {
    const filter = assignment.filterId
        ? <span className="text-muted-foreground"> · <Filter className="inline h-3 w-3" /> {assignment.filterName ?? assignment.filterId} ({assignment.filterType ?? 'include'})</span>
        : null;
    switch (assignment.targetType) {
        case 'allDevices':
            return <Badge variant="outline" className="text-xs gap-1 font-normal"><Laptop className="h-3 w-3" /> All devices{filter}</Badge>;
        case 'allUsers':
            return <Badge variant="outline" className="text-xs gap-1 font-normal"><Users className="h-3 w-3" /> All users{filter}</Badge>;
        case 'exclusionGroup':
            return <Badge variant="outline" className="text-xs gap-1 font-normal border-red-500/40 text-red-700 dark:text-red-400"><MinusCircle className="h-3 w-3" /> Excluded: {assignment.groupName ?? assignment.groupId}{filter}</Badge>;
        case 'group':
            return <Badge variant="outline" className="text-xs gap-1 font-normal"><Users className="h-3 w-3" /> {assignment.groupName ?? assignment.groupId}{filter}</Badge>;
        default:
            return <Badge variant="outline" className="text-xs font-normal">Unknown target{filter}</Badge>;
    }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div>
            <div className="text-xs uppercase text-muted-foreground tracking-wide">{label}</div>
            <div className="text-sm">{value}</div>
        </div>
    );
}

export default function SettingTimelinePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { request } = useApiRequest();

    const [detail, setDetail] = useState<CatalogSettingDetail | null>(null);
    const [history, setHistory] = useState<SettingHistoryEntry[] | null>(null);
    const [context, setContext] = useState<SettingContext | null>(null);
    const [usage, setUsage] = useState<TenantSettingUsageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    // useApiRequest aborts the previous in-flight request whenever a new one starts, so the calls
    // below run one after another (never Promise.all), and a superseded run — React Strict Mode
    // fires this effect twice in dev — must not write anything: an aborted request comes back as
    // `undefined`, which is not the same as the API saying "no such setting".
    const runRef = useRef(0);

    const load = useCallback(async () => {
        const run = ++runRef.current;
        const isStale = () => run !== runRef.current;
        setLoading(true);
        try {
            // Dependencies are expressed in Graph definition ids, so links from them land here with
            // that id instead of the catalog GUID — resolve it first, then load by GUID as usual.
            const routeId = decodeURIComponent(params.id);
            const detailResponse = await request<ApiEnvelope<CatalogSettingDetail>>(
                isGuid(routeId)
                    ? SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT(routeId)
                    : SETTINGS_LIBRARY_SETTING_BY_DEFINITION_ENDPOINT(routeId)
            );
            if (isStale()) return;
            const resolved = detailResponse?.data?.data ?? null;
            setDetail(resolved);
            if (!resolved) return;

            const historyResponse = await request<ApiEnvelope<SettingHistoryEntry[]>>(SETTINGS_LIBRARY_SETTING_HISTORY_ENDPOINT(resolved.id));
            if (isStale()) return;
            setHistory(historyResponse?.data?.data ?? []);

            // What this needs first / unlocks / is stronger with / to watch out for — the same
            // read model the explorer's side sheet uses.
            const contextResponse = await request<ApiEnvelope<SettingContext>>(SETTINGS_LIBRARY_SETTING_CONTEXT_ENDPOINT(resolved.id));
            if (isStale()) return;
            setContext(contextResponse?.data?.data ?? null);

            const usageResponse = await request<ApiEnvelope<TenantSettingUsageDetail>>(SETTINGS_LIBRARY_SETTING_TENANT_USAGE_ENDPOINT(resolved.id));
            if (isStale()) return;
            setUsage(usageResponse?.data?.data ?? null);
        } finally {
            if (!isStale()) setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    useEffect(() => { load(); }, [load]);


    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading setting…
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="p-6 space-y-4">
                <Link href="/settings-library" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings Library
                </Link>
                <div className="text-sm text-muted-foreground">Setting not found.</div>
            </div>
        );
    }

    const revision = detail.currentRevision;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <Link href="/settings-library" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings Library
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-semibold">{revision?.displayName || detail.canonicalName || detail.graphDefinitionId}</h1>
                        {lifecycleBadge(detail.lifecycleStatus)}
                        {scopeBadge(revision?.scope ?? null)}
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">{detail.graphDefinitionId}</p>
                    {revision?.description && <p className="text-sm mt-2 max-w-3xl">{revision.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                        {revision?.platforms.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                        {revision?.technologies.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                </div>
                {context && (context.needsFirst.length + context.unlocks.length + context.contains.length) > 0 && (
                    <Button asChild variant="outline" className="gap-1.5 shrink-0">
                        <Link href={`/settings-library/explore?setting=${detail.id}`}><Share2 className="h-4 w-4" /> Walk its dependencies</Link>
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4" /> Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Field label="First observed" value={formatDate(detail.firstSeenAt)} />
                    <Field label="Last observed" value={formatDate(detail.lastSeenAt)} />
                    <Field label="Revisions" value={detail.revisionCount} />
                    <Field label="Category" value={context?.categoryName ?? revision?.categoryId} />
                    <Field label="Help text" value={revision?.helpText} />
                    <Field label="Risk level" value={revision?.riskLevel} />
                    <Field label="Setting usage" value={revision?.settingUsage} />
                    <Field
                        label="CSP path"
                        value={revision?.baseUri ? <span className="font-mono text-xs">{revision.baseUri}{revision.offsetUri}</span> : null}
                    />
                    <Field
                        label="OS version range"
                        value={
                            revision?.minimumSupportedVersion || revision?.maximumSupportedVersion
                                ? `${revision.minimumSupportedVersion ?? '*'} .. ${revision.maximumSupportedVersion ?? '*'}`
                                : null
                        }
                    />
                    <Field label="Applicability" value={revision?.applicabilityDescription} />
                </CardContent>
            </Card>

            {(detail.incomingRelations ?? []).some(r => r.relationType === 'Replaces') && (
                <Card className="border-green-500/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Replace className="h-4 w-4" /> Use this instead</CardTitle>
                        <CardDescription>Microsoft names a replacement for this setting in its own documentation text.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {detail.incomingRelations!.filter(r => r.relationType === 'Replaces').map(r => (
                            <div key={r.id} className="text-sm">
                                <Link href={settingHref(r.sourceSettingId)} className="font-medium hover:underline">{r.sourceDisplayName ?? r.sourceGraphDefinitionId}</Link>
                                <Badge variant="outline" className="ml-2 text-[11px]">{r.confidence} confidence</Badge>
                                {r.evidence[0]?.description && <div className="text-xs text-muted-foreground italic mt-0.5">“{r.evidence[0].description}”</div>}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Used in your tenant</CardTitle>
                        {usage?.harvestedAt && (
                            <span className="text-xs text-muted-foreground">
                                {usage.policies.length} {usage.policies.length === 1 ? 'policy' : 'policies'} · as of {formatDate(usage.harvestedAt)} ·{' '}
                                <Link href="/settings-library" className="hover:underline">harvest again</Link>
                            </span>
                        )}
                    </div>
                    <CardDescription>
                        {!usage?.harvestedAt
                            ? <>Tenant usage hasn&apos;t been harvested yet — use <Link href="/settings-library" className="underline">Harvest tenant usage</Link> on the browse page to see which of your policies configure this setting.</>
                            : usage.policies.length === 0
                                ? 'None of your policies configure this setting.'
                                : 'Each policy that configures this setting, the value it sets, and who it is assigned to — read from your tenant at the last harvest.'}
                    </CardDescription>
                </CardHeader>
                {usage && usage.policies.length > 0 && (
                    <CardContent>
                        <div className="rounded-md border divide-y">
                            {usage.policies.map(policy => (
                                <div key={policy.policyId} className="p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <a
                                            href={intunePolicyUrl(policy.policyId)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-sm hover:underline inline-flex items-center gap-1"
                                        >
                                            {policy.policyName} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </a>
                                        <span className="text-xs text-muted-foreground">
                                            {policyTypeLabel(policy)}{policy.platforms.length > 0 && ` · ${policy.platforms.join(', ')}`}
                                        </span>
                                    </div>
                                    <div className="text-sm flex flex-wrap items-center gap-1.5">
                                        <span className="text-muted-foreground">Configured:</span>
                                        {policy.values.map((v, i) => (
                                            <span key={i} className="rounded bg-muted px-2 py-0.5 text-xs">{v.valueSummary ?? (v.depth > 0 ? 'configured' : 'set')}</span>
                                        ))}
                                    </div>
                                    {policy.isAssigned
                                        ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {policy.assignments.map((a, i) => <AssignmentPill key={i} assignment={a} />)}
                                            </div>
                                        )
                                        : (
                                            <div className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Not assigned — this policy has no effect on any device or user.
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> How this fits</CardTitle>
                    <CardDescription>
                        What to configure first, what this unlocks, the sets it is stronger inside, and what to watch out for — read from Microsoft&apos;s own metadata and templates.
                        {' '}<Link href={`/settings-library/explore?setting=${detail.id}`} className="inline-flex items-center gap-1 hover:underline"><Share2 className="h-3 w-3" /> Walk through it in the explorer</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* With dependencies the setting is drawn as its map — needs on the left, unlocks on
                        the right — and clicking around it opens that setting's page. */}
                    {context && hasDependencies(context) && (
                        <SettingFocusMap context={context} showSettingLink={false} onHop={item => item.settingId && router.push(settingHref(item.settingId))} />
                    )}
                    {context
                        ? <SettingContextPanel context={context} hideDependencies={hasDependencies(context)} compact />
                        : <div className="text-sm text-muted-foreground">The context for this setting could not be loaded.</div>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><HistoryIcon className="h-4 w-4" /> Timeline</CardTitle>
                    <CardDescription>Every revision and lifecycle transition this setting has gone through, oldest first.</CardDescription>
                </CardHeader>
                <CardContent>
                    {(!history || history.length === 0) && (
                        <div className="text-sm text-muted-foreground py-4">No history recorded yet.</div>
                    )}
                    {history && history.length > 0 && (
                        <div className="space-y-3">
                            {history.map((entry, idx) => {
                                const badge = CHANGE_TYPE_BADGE[entry.change.changeType] ?? CHANGE_TYPE_BADGE.Changed;
                                const BadgeIcon = badge.icon;

                                return (
                                    <div key={entry.revision?.id ?? `${idx}-${entry.occurredAt}`} className="rounded-md border p-3">
                                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`${badge.className} gap-1 text-xs`}>
                                                    <BadgeIcon className="h-3 w-3" /> {badge.label}
                                                </Badge>
                                                {entry.revision && (
                                                    <Badge variant="outline" className="text-xs">Revision {entry.revision.revisionNumber}</Badge>
                                                )}
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${IMPORTANCE_DOT[entry.change.importance] ?? IMPORTANCE_DOT.Low}`}
                                                    title={`${entry.change.importance} importance · ${entry.change.category}`}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {formatDate(entry.revision?.observedAt ?? entry.occurredAt)}
                                            </span>
                                        </div>
                                        {entry.change.changedProperties.length > 0 && (
                                            <div className="space-y-1 pl-1">
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
