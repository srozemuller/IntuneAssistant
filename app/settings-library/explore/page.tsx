'use client';

// Task explorer — the Settings Library's front door. "I want to do X on Y": type the task, get
// the settings involved grouped by the area they live in, the Microsoft templates that already
// bundle them, and pointers for the parts of the task the catalog does not cover. Click a
// setting and the side sheet says what it needs first, what it unlocks, what it is stronger
// with and what to watch out for — without leaving the results.

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApiRequest } from '@/hooks/useApiRequest';
import { SETTINGS_LIBRARY_EXPLORE_ENDPOINT, SETTINGS_LIBRARY_SETTING_CONTEXT_ENDPOINT } from '@/lib/constants';
import { WEB_PLATFORMS } from '@/lib/settingsLibraryGraph';
import {
    EXAMPLE_INTENTS, ExploreArea, ExploreHit, ExploreResult, ExploreTemplate, ContextItem, SettingContext,
    templateFamilyLabel,
} from '@/lib/settingsExplorer';
import { HopSide, SettingFocusMap } from '@/components/settings-library/SettingFocusMap';
import {
    Search, Loader2, Compass, ShieldCheck, ExternalLink, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertTriangle, ChevronRight,
    ArrowLeft, Layers, Building2, Sparkles, User, Monitor, Lightbulb,
} from 'lucide-react';

interface ApiEnvelope<T> { status: string; message?: string | null; data: T }

const ALL_PLATFORMS = { id: '', label: 'All platforms' };

function LifecycleBadge({ status }: { status: ExploreHit['lifecycleStatus'] }) {
    if (status === 'Active') return null;
    const tone = status === 'Deprecated' ? 'text-amber-600 border-amber-500/50' : status === 'PossiblyRemoved' ? 'text-orange-600 border-orange-500/50' : 'text-red-600 border-red-500/50';
    return <Badge variant="outline" className={`text-[10px] h-4 px-1 ${tone}`}>{status === 'Deprecated' ? 'deprecated' : status === 'PossiblyRemoved' ? 'possibly removed' : 'removed'}</Badge>;
}

function HitRow({ hit, showTenant, onOpen }: { hit: ExploreHit; showTenant: boolean; onOpen: (hit: ExploreHit) => void }) {
    return (
        <button
            type="button"
            onClick={() => onOpen(hit)}
            className="w-full text-left rounded-md border border-border/60 hover:border-border hover:bg-muted/40 px-3 py-2 transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                    <div className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                        <span>{hit.displayName ?? hit.definitionId}</span>
                        <LifecycleBadge status={hit.lifecycleStatus} />
                        {hit.scope === 'user' && <span className="text-muted-foreground" title="User-scoped"><User className="h-3 w-3" /></span>}
                        {hit.scope === 'device' && <span className="text-muted-foreground" title="Device-scoped"><Monitor className="h-3 w-3" /></span>}
                    </div>
                    {hit.description && <div className="text-xs text-muted-foreground line-clamp-2">{hit.description}</div>}
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {hit.needsFirstCount > 0 && (
                            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1" title="Settings to configure first">
                                <ArrowDownToLine className="h-3 w-3" /> needs {hit.needsFirstCount}
                            </span>
                        )}
                        {hit.unlocksCount > 0 && (
                            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1" title="Settings this one unlocks or contains">
                                <ArrowUpFromLine className="h-3 w-3" /> unlocks {hit.unlocksCount}
                            </span>
                        )}
                        {hit.templates.map(t => (
                            <span key={t.familyId} className="text-[11px] inline-flex items-center gap-1 text-teal-700 dark:text-teal-300" title={`${templateFamilyLabel(t.templateFamily)}${t.recommendedValue ? ` · ships as ${t.recommendedValue}` : ''}`}>
                                <ShieldCheck className="h-3 w-3" /> {t.displayName}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-xs text-muted-foreground">
                    {showTenant && (
                        hit.tenantPolicyCount
                            ? <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title={`In ${hit.tenantPolicyCount} of your policies`}><CheckCircle2 className="h-3.5 w-3.5" /> {hit.tenantPolicyCount}</span>
                            : <span className="text-muted-foreground/50" title="Not configured in your tenant">—</span>
                    )}
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </button>
    );
}

function TemplateCard({ template, showTenant }: { template: ExploreTemplate; showTenant: boolean }) {
    return (
        <Link href={`/settings-library/explore?template=${template.familyId}`} className="block rounded-md border border-border/70 hover:border-border hover:bg-muted/40 p-3 transition-colors min-w-[220px]">
            <div className="text-sm font-medium flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> {template.displayName}</div>
            <div className="text-xs text-muted-foreground">{templateFamilyLabel(template.templateFamily)}{template.displayVersion ? ` · ${template.displayVersion}` : ''}</div>
            <div className="text-xs text-muted-foreground mt-1">
                {template.matchingSettings > 0 && template.matchingSettings !== template.totalSettings
                    ? `${template.matchingSettings} of ${template.totalSettings} settings match`
                    : `${template.totalSettings} settings`}
                {showTenant && template.inUseCount > 0 && <span> · {template.inUseCount} in your tenant</span>}
            </div>
        </Link>
    );
}

function ExplorePageInner() {
    const router = useRouter();
    const search = useSearchParams();
    const { request } = useApiRequest();
    // Own instance: opening a setting must not cancel a search that is still loading, or vice versa.
    const { request: contextRequest } = useApiRequest();

    const q = search.get('q') ?? '';
    const platform = search.get('platform') ?? '';
    const template = search.get('template');
    const category = search.get('category');

    const [draft, setDraft] = useState(q);
    const [result, setResult] = useState<ExploreResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeArea, setActiveArea] = useState<string | null>(null);
    const runRef = useRef(0);

    // Focus: ?setting= swaps the results for the setting's map — what it needs on the left, what it
    // unlocks on the right. Hopping keeps the search in the URL, so "back to results" is one click.
    const setting = search.get('setting');
    const [context, setContext] = useState<SettingContext | null | undefined>(undefined);
    const [enterFrom, setEnterFrom] = useState<HopSide | null>(null);
    const [walk, setWalk] = useState<{ id: string; name: string }[]>([]);
    const contextRunRef = useRef(0);

    useEffect(() => { setDraft(q); }, [q]);

    const go = useCallback((next: { q?: string; platform?: string; template?: string | null; category?: string | null }) => {
        const params = new URLSearchParams();
        const nq = next.q ?? (next.template || next.category ? '' : q);
        const np = next.platform ?? platform;
        if (next.template) params.set('template', next.template);
        else if (next.category) params.set('category', next.category);
        else if (nq) params.set('q', nq);
        if (np) params.set('platform', np);
        router.push(`/settings-library/explore${params.size ? `?${params}` : ''}`);
    }, [router, q, platform]);

    const load = useCallback(async () => {
        if (!q.trim() && !template && !category) { setResult(null); return; }
        const run = ++runRef.current;
        setLoading(true); setError(null);
        try {
            const params = new URLSearchParams();
            if (template) params.set('templateId', template);
            else if (category) params.set('categoryId', category);
            else params.set('q', q.trim());
            if (platform) params.set('platform', platform);
            const response = await request<ApiEnvelope<ExploreResult>>(`${SETTINGS_LIBRARY_EXPLORE_ENDPOINT}?${params}`);
            if (run !== runRef.current) return;
            if (!response) return; // aborted by a newer request
            const data = response.data?.data ?? null;
            setResult(data);
            setActiveArea(null);
            if (!data) setError(response.data?.message ?? 'The explorer could not load results.');
        } catch (e) {
            if (run === runRef.current) setError(e instanceof Error ? e.message : 'The explorer could not load results.');
        } finally {
            if (run === runRef.current) setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, platform, template, category]);

    useEffect(() => { load(); }, [load]);

    const openSetting = useCallback((settingId: string | null, side: HopSide | null = null) => {
        const params = new URLSearchParams();
        if (template) params.set('template', template);
        else if (category) params.set('category', category);
        else if (q) params.set('q', q);
        if (platform) params.set('platform', platform);
        if (settingId) params.set('setting', settingId);
        setEnterFrom(side);
        router.push(`/settings-library/explore${params.size ? `?${params}` : ''}`);
    }, [router, q, platform, template, category]);

    useEffect(() => {
        if (!setting) { setContext(undefined); return; }
        const run = ++contextRunRef.current;
        setContext(undefined);
        (async () => {
            const response = await contextRequest<ApiEnvelope<SettingContext>>(SETTINGS_LIBRARY_SETTING_CONTEXT_ENDPOINT(setting));
            if (run !== contextRunRef.current) return;
            if (!response) { setContext(null); return; } // still the current run and no answer: it failed
            setContext(response.data?.data ?? null);
            const data = response.data?.data;
            if (data) setWalk(prev => [...prev.filter(x => x.id !== data.settingId), { id: data.settingId, name: data.displayName ?? data.definitionId }].slice(-5));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setting]);

    const onHop = useCallback((item: ContextItem, side: HopSide) => {
        if (item.settingId) openSetting(item.settingId, side);
    }, [openSetting]);

    const showTenant = result?.hasTenantUsage ?? false;
    const totalShown = useMemo(() => result?.areas.reduce((s, a) => s + a.settings.length, 0) ?? 0, [result]);
    const visibleAreas: ExploreArea[] = useMemo(() => result ? (activeArea ? result.areas.filter(a => a.categoryId === activeArea) : result.areas) : [], [result, activeArea]);
    const idle = !q.trim() && !template && !category && !setting;

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold flex items-center gap-2"><Compass className="h-6 w-6" /> Explore settings by task</h1>
                <p className="text-sm text-muted-foreground max-w-3xl">
                    Say what you want to do — &ldquo;Edge favorites&rdquo;, &ldquo;BitLocker&rdquo;, &ldquo;certificates on iOS&rdquo; — and see the settings involved, grouped by where they live, with what they need first, what they unlock, and the Microsoft templates that already bundle them.
                </p>
            </div>

            <form
                onSubmit={e => { e.preventDefault(); go({ q: draft.trim(), template: null, category: null }); }}
                className="flex items-center gap-2 flex-wrap"
            >
                <div className="relative flex-1 min-w-[260px] max-w-xl">
                    <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={draft} onChange={e => setDraft(e.target.value)} placeholder="What do you want to configure?" className="pl-8" maxLength={200} />
                </div>
                <Button type="submit" size="sm" disabled={!draft.trim()}>Explore</Button>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {[ALL_PLATFORMS, ...WEB_PLATFORMS].map(p => (
                        <Button key={p.id || 'all'} type="button" size="sm" variant={platform === p.id ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => go({ platform: p.id, template, category })}>{p.label}</Button>
                    ))}
                </div>
            </form>

            {idle && (
                <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> Try one of these</div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {EXAMPLE_INTENTS.map(example => (
                            <Button key={example.label} type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => go({ q: example.query, platform: example.platform, template: null, category: null })}>
                                {example.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {error && <div className="text-sm text-destructive flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</div>}

            {loading && !result && (
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Looking through the catalog…</div>
            )}

            {setting && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openSetting(null)}>
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> {q || template || category ? 'Back to results' : 'Back to explore'}
                        </Button>
                        {walk.length > 1 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 flex-wrap">
                                <span>walked</span>
                                {walk.map((step, i) => (
                                    <React.Fragment key={step.id}>
                                        {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                                        {step.id === setting
                                            ? <span className="text-foreground font-medium truncate max-w-[200px]">{step.name}</span>
                                            : <button type="button" onClick={() => openSetting(step.id, 'left')} className="hover:text-foreground hover:underline truncate max-w-[200px]">{step.name}</button>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    {context === undefined && <div className="text-sm text-muted-foreground inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Working out what this needs…</div>}
                    {context === null && <div className="text-sm text-muted-foreground">Could not load this setting.</div>}
                    {context && (
                        <>
                            <SettingFocusMap context={context} onHop={onHop} enterFrom={enterFrom} />
                            <p className="text-xs text-muted-foreground text-center">Click anything around the setting to walk there. Lines show Microsoft&apos;s own dependency metadata; the legend under the map says what each colour means.</p>
                        </>
                    )}
                </section>
            )}

            {!setting && result && (
                <div className="space-y-5">
                    {/* what we are looking at */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-0.5">
                            {result.template ? (
                                <>
                                    <div className="text-lg font-medium flex items-center gap-2 flex-wrap">
                                        <ShieldCheck className="h-5 w-5 text-teal-600" /> {result.template.displayName}
                                        <Badge variant="outline" className="text-[11px]">{templateFamilyLabel(result.template.templateFamily)}</Badge>
                                        {result.template.displayVersion && <span className="text-sm text-muted-foreground">{result.template.displayVersion}</span>}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Every setting this template ships, grouped by area — the set Microsoft put together for this task.
                                        {' '}{result.totalMatches} of its {result.template.totalSettings} settings are in the catalog{platform ? ` for ${WEB_PLATFORMS.find(p => p.id === platform)?.label ?? platform}` : ''}.
                                        {showTenant && <span> Your tenant configures {result.template.inUseCount}.</span>}
                                    </div>
                                </>
                            ) : category ? (
                                <>
                                    <div className="text-lg font-medium flex items-center gap-2"><Layers className="h-5 w-5" /> {result.areas[0]?.name ?? 'Area'}</div>
                                    <div className="text-sm text-muted-foreground">All {result.totalMatches} settings in this area, prerequisites first.</div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {result.totalMatches === 0
                                        ? <>Nothing in the catalog starts a word with <span className="font-medium text-foreground">&ldquo;{result.query}&rdquo;</span>{platform ? ` on ${WEB_PLATFORMS.find(p => p.id === platform)?.label ?? platform}` : ''}.</>
                                        : <>{result.totalMatches}{result.truncated ? '+' : ''} setting{result.totalMatches === 1 ? '' : 's'} for <span className="font-medium text-foreground">&ldquo;{result.query}&rdquo;</span> in {result.areas.length} area{result.areas.length === 1 ? '' : 's'}{result.truncated ? `, best ${totalShown} shown` : ''}.</>}
                                    {showTenant && <span className="inline-flex items-center gap-1 ml-2"><Building2 className="h-3.5 w-3.5" /> overlaid with your tenant&apos;s policies</span>}
                                </div>
                            )}
                        </div>
                        {(result.template || category) && (
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => go({ q: q || '', template: null, category: null })}>
                                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to search
                            </Button>
                        )}
                    </div>

                    {/* pointers outside the catalog */}
                    {result.redirects.length > 0 && (
                        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {result.redirects.map(r => (
                                <div key={r.key} className="rounded-md border border-sky-500/40 bg-sky-500/5 p-3 space-y-1">
                                    <div className="text-sm font-medium flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-sky-600" /> {r.title}</div>
                                    <div className="text-xs text-muted-foreground">{r.description}</div>
                                    <div className="flex items-center gap-3 text-xs pt-0.5">
                                        {r.learnUrl && <a href={r.learnUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline"><ExternalLink className="h-3 w-3" /> Microsoft Learn</a>}
                                        {r.catalogQuery && r.catalogQuery !== result.query && (
                                            <button type="button" className="hover:underline" onClick={() => go({ q: r.catalogQuery!, template: null, category: null })}>Catalog settings for &ldquo;{r.catalogQuery}&rdquo;</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Microsoft's own sets */}
                    {result.templates.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Microsoft already bundles this</div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {result.templates.map(t => <TemplateCard key={t.familyId} template={t} showTenant={showTenant} />)}
                            </div>
                        </div>
                    )}

                    {result.areas.length > 0 && (
                        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                            {/* areas */}
                            <aside className="space-y-1 lg:sticky lg:top-4 self-start">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Areas</div>
                                <button type="button" onClick={() => setActiveArea(null)} className={`w-full text-left text-sm rounded px-2 py-1 flex items-center justify-between ${activeArea === null ? 'bg-muted font-medium' : 'hover:bg-muted/60'}`}>
                                    <span>All areas</span><span className="text-xs text-muted-foreground">{result.totalMatches}</span>
                                </button>
                                {result.areas.map(a => (
                                    <button key={a.categoryId} type="button" onClick={() => setActiveArea(a.categoryId)} className={`w-full text-left text-sm rounded px-2 py-1 flex items-center justify-between gap-2 ${activeArea === a.categoryId ? 'bg-muted font-medium' : 'hover:bg-muted/60'}`}>
                                        <span className="min-w-0 truncate">
                                            {a.rootName && <span className="text-muted-foreground">{a.rootName} › </span>}{a.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {showTenant && a.inUseCount > 0 && <span className="text-emerald-600 dark:text-emerald-400">{a.inUseCount}/</span>}{a.matchCount}
                                        </span>
                                    </button>
                                ))}
                            </aside>

                            {/* settings per area */}
                            <div className="space-y-6 min-w-0">
                                {visibleAreas.map(area => (
                                    <section key={area.categoryId} className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-base font-semibold">{area.name}</h2>
                                            {area.rootName && <span className="text-xs text-muted-foreground">in {area.rootName}</span>}
                                            <Badge variant="secondary" className="text-[11px]">{area.matchCount}</Badge>
                                            {area.settings.length < area.matchCount && (
                                                <Link href={`/settings-library/explore?category=${encodeURIComponent(area.categoryId)}${platform ? `&platform=${platform}` : ''}`} className="text-xs hover:underline">
                                                    best {area.settings.length} shown · see all {area.matchCount} →
                                                </Link>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            {area.settings.map(hit => <HitRow key={hit.settingId} hit={hit} showTenant={showTenant} onOpen={h => openSetting(h.settingId)} />)}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}>
            <ExplorePageInner />
        </Suspense>
    );
}
