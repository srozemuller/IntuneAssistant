'use client';

// The "what else?" view around one setting: needs first / unlocks / contains, the sets it is
// stronger inside (Microsoft templates, linked settings, its area), what to watch out for, and
// where to read more. Rendered inside the explorer's side sheet and on the setting detail page,
// so it owns nothing about layout beyond its own sections.

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { settingHref } from '@/lib/settingsLibraryGraph';
import { ContextItem, ContextGroup, ContextWarning, SettingContext, templateFamilyLabel } from '@/lib/settingsExplorer';
import {
    ArrowDownToLine, ArrowUpFromLine, Boxes, Sparkles, AlertTriangle, BookOpen, ExternalLink, ShieldCheck, Link2, Layers, Building2, CheckCircle2,
} from 'lucide-react';

const LIFECYCLE_TONE: Record<string, string> = {
    Deprecated: 'text-amber-600 dark:text-amber-400',
    PossiblyRemoved: 'text-orange-600 dark:text-orange-400',
    Removed: 'text-red-600 dark:text-red-400',
};

function ItemRow({ item, onOpen, showTenant }: { item: ContextItem; onOpen?: (item: ContextItem) => void; showTenant: boolean }) {
    const name = item.displayName ?? item.definitionId;
    const tone = item.lifecycleStatus ? LIFECYCLE_TONE[item.lifecycleStatus] : undefined;
    const label = item.settingId
        ? onOpen
            ? <button type="button" onClick={() => onOpen(item)} className={`text-left hover:underline ${tone ?? ''}`}>{name}</button>
            : <Link href={settingHref(item.settingId)} className={`hover:underline ${tone ?? ''}`}>{name}</Link>
        : <span className="text-muted-foreground" title="Referenced by Microsoft's metadata, but not in the catalog">{name}</span>;
    return (
        <div className="flex items-start justify-between gap-3 py-1.5 border-b last:border-b-0 border-border/60">
            <div className="min-w-0">
                <div className="text-sm flex items-center gap-1.5 flex-wrap">
                    {label}
                    {item.isRequired && <Badge variant="outline" className="text-[10px] h-4 px-1">required</Badge>}
                    {item.lifecycleStatus && item.lifecycleStatus !== 'Active' && (
                        <Badge variant="outline" className={`text-[10px] h-4 px-1 ${tone ?? ''}`}>{item.lifecycleStatus === 'Deprecated' ? 'deprecated' : item.lifecycleStatus === 'PossiblyRemoved' ? 'possibly removed' : 'removed'}</Badge>
                    )}
                </div>
                <div className="text-xs text-muted-foreground">
                    {item.reason}
                    {item.categoryName && <span> · {item.categoryName}</span>}
                    {item.recommendedValue && <span> · ships as <code className="text-[11px]">{item.recommendedValue}</code></span>}
                </div>
            </div>
            {showTenant && (
                <span className="shrink-0 text-xs text-muted-foreground inline-flex items-center gap-1" title={item.tenantPolicyCount ? `In ${item.tenantPolicyCount} of your policies` : 'Not configured in your tenant'}>
                    {item.tenantPolicyCount
                        ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {item.tenantPolicyCount}</>
                        : <span className="text-muted-foreground/60">—</span>}
                </span>
            )}
        </div>
    );
}

function Section({ icon, title, hint, count, children }: { icon: React.ReactNode; title: string; hint: string; count?: number; children: React.ReactNode }) {
    return (
        <section className="space-y-1.5">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <h3 className="text-sm font-semibold">{title}</h3>
                {count !== undefined && <Badge variant="secondary" className="text-[11px]">{count}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{hint}</p>
            <div>{children}</div>
        </section>
    );
}

function GroupBlock({ group, onOpen, showTenant }: { group: ContextGroup; onOpen?: (item: ContextItem) => void; showTenant: boolean }) {
    const icon = group.kind === 'template' ? <ShieldCheck className="h-3.5 w-3.5" /> : group.kind === 'related' ? <Link2 className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />;
    const shown = group.settings.length;
    return (
        <div className="rounded-md border border-border/70 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                        <span className="text-muted-foreground">{icon}</span>
                        {group.kind === 'template'
                            ? <Link href={`/settings-library/explore?template=${group.id}`} className="hover:underline">{group.name}</Link>
                            : group.kind === 'area'
                                ? <Link href={`/settings-library/explore?category=${encodeURIComponent(group.id)}`} className="hover:underline">{group.name}</Link>
                                : group.name}
                        {group.templateFamily && <Badge variant="outline" className="text-[10px] h-4 px-1">{templateFamilyLabel(group.templateFamily)}</Badge>}
                        {group.displayVersion && <span className="text-xs text-muted-foreground">{group.displayVersion}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{group.description}</div>
                    {group.recommendedValue && (
                        <div className="text-xs mt-1">Ships this setting as <code className="text-[11px] bg-muted px-1 rounded">{group.recommendedValue}</code></div>
                    )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{group.totalSettings} setting{group.totalSettings === 1 ? '' : 's'}</span>
            </div>
            {shown > 0 && (
                <div>
                    {group.settings.map(item => <ItemRow key={item.definitionId} item={item} onOpen={onOpen} showTenant={showTenant} />)}
                    {group.totalSettings > shown + 1 && (
                        <div className="text-xs text-muted-foreground pt-1.5">
                            {group.kind === 'template'
                                ? <Link href={`/settings-library/explore?template=${group.id}`} className="hover:underline">See all {group.totalSettings} settings in this template →</Link>
                                : group.kind === 'area'
                                    ? <Link href={`/settings-library/explore?category=${encodeURIComponent(group.id)}`} className="hover:underline">See all {group.totalSettings} settings in {group.name} →</Link>
                                    : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function WarningBlock({ warning, onOpen, showTenant }: { warning: ContextWarning; onOpen?: (item: ContextItem) => void; showTenant: boolean }) {
    const severe = warning.code === 'deprecated' || warning.code === 'deprecated-prerequisite' || warning.code === 'risk';
    return (
        <div className={`rounded-md border p-3 space-y-1 ${severe ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/70'}`}>
            <div className="text-sm font-medium flex items-center gap-1.5">
                <AlertTriangle className={`h-3.5 w-3.5 ${severe ? 'text-amber-500' : 'text-muted-foreground'}`} /> {warning.title}
            </div>
            <div className="text-xs text-muted-foreground">{warning.detail}</div>
            {warning.settings.length > 0 && (
                <div className="pt-1">{warning.settings.map(item => <ItemRow key={item.definitionId} item={item} onOpen={onOpen} showTenant={showTenant} />)}</div>
            )}
        </div>
    );
}

export interface SettingContextPanelProps {
    context: SettingContext;
    /** When set, setting names become buttons that call this instead of links — the explorer keeps the reader in its sheet. */
    onOpen?: (item: ContextItem) => void;
    /** Hide the section headers' "this setting" framing when the page already shows the name. */
    compact?: boolean;
    /** Leave out needs first / unlocks / contains — for pages that draw them as the focus map. */
    hideDependencies?: boolean;
}

export function SettingContextPanel({ context: full, onOpen, compact, hideDependencies }: SettingContextPanelProps) {
    const context = hideDependencies ? { ...full, needsFirst: [], unlocks: [], contains: [] } : full;
    const showTenant = context.hasTenantUsage;
    const empty = context.needsFirst.length === 0 && context.unlocks.length === 0 && context.contains.length === 0
        && context.strongerTogether.length === 0 && context.watchOut.length === 0 && context.readMore.length === 0;

    return (
        <div className="space-y-5">
            {showTenant && !compact && (
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {context.tenantPolicyCount
                        ? `Your tenant configures this in ${context.tenantPolicyCount} polic${context.tenantPolicyCount === 1 ? 'y' : 'ies'}.`
                        : 'Not configured in your tenant yet.'}
                    <span className="text-muted-foreground/70">The right-hand column shows how many of your policies hold each setting.</span>
                </div>
            )}

            {empty && (
                <div className="text-sm text-muted-foreground">
                    This setting stands on its own: nothing depends on it, it depends on nothing, and no Microsoft template ships it.
                </div>
            )}

            {context.watchOut.length > 0 && (
                <Section icon={<AlertTriangle className="h-4 w-4" />} title="Watch out" hint="Things that change whether this setting works for you." count={context.watchOut.length}>
                    <div className="space-y-2">{context.watchOut.map(w => <WarningBlock key={w.code} warning={w} onOpen={onOpen} showTenant={showTenant} />)}</div>
                </Section>
            )}

            {context.needsFirst.length > 0 && (
                <Section icon={<ArrowDownToLine className="h-4 w-4" />} title="Needs first" hint="Configure these before this setting has any effect." count={context.needsFirst.length}>
                    {context.needsFirst.map(item => <ItemRow key={`${item.definitionId}-${item.reason}`} item={item} onOpen={onOpen} showTenant={showTenant} />)}
                </Section>
            )}

            {context.unlocks.length > 0 && (
                <Section icon={<ArrowUpFromLine className="h-4 w-4" />} title="Unlocks" hint="These only apply once this setting is configured — the next step after it." count={context.unlocks.length}>
                    {context.unlocks.map(item => <ItemRow key={`${item.definitionId}-${item.reason}`} item={item} onOpen={onOpen} showTenant={showTenant} />)}
                </Section>
            )}

            {context.contains.length > 0 && (
                <Section icon={<Boxes className="h-4 w-4" />} title="Contains" hint="Members of this group — they are configured inside it." count={context.contains.length}>
                    {context.contains.map(item => <ItemRow key={item.definitionId} item={item} onOpen={onOpen} showTenant={showTenant} />)}
                </Section>
            )}

            {context.strongerTogether.length > 0 && (
                <Section icon={<Sparkles className="h-4 w-4" />} title="Stronger together" hint="Sets this setting belongs to: Microsoft's own templates, settings the library links to it, and its neighbours in the catalog.">
                    <div className="space-y-2">{context.strongerTogether.map(g => <GroupBlock key={`${g.kind}-${g.id}`} group={g} onOpen={onOpen} showTenant={showTenant} />)}</div>
                </Section>
            )}

            {context.readMore.length > 0 && (
                <Section icon={<BookOpen className="h-4 w-4" />} title="Read more" hint="Microsoft's documentation for this setting.">
                    <div className="space-y-1">
                        {context.readMore.map(url => (
                            <a key={url} href={url} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-1 hover:underline break-all">
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {url.replace(/^https?:\/\//, '')}
                            </a>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}
