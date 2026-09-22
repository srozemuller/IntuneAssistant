'use client';

// One setting and what surrounds it, as a map: what it needs flows in from the left, what it
// unlocks flows out to the right, the Microsoft templates that ship it sit above, its neighbours
// below. Clicking anything around it walks there (the parent decides what "there" is: the
// explorer swaps the setting in place, the setting page navigates).
//
// Theme-neutral on purpose: no background of its own and only theme tokens, so it reads as part
// of the page in light and dark mode instead of an embedded stage.

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { DependencyKind, KIND_META, settingHref } from '@/lib/settingsLibraryGraph';
import { ContextItem, SettingContext, templateFamilyLabel } from '@/lib/settingsExplorer';
import { AlertTriangle, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

const ROW = 64;
/** Rows visible per side before the column scrolls. */
const VISIBLE = 7;

export type HopSide = 'left' | 'right';

/** What each line colour means, phrased from the centre setting's point of view. */
const LEGEND_TEXT: Record<DependencyKind, { label: string; hint: string }> = {
    DependsOn: { label: 'depends on', hint: 'The setting on the right of the line only applies when the one on the left is configured' },
    OptionDependsOn: { label: 'one option depends on', hint: 'Only a specific option of the setting requires the other one' },
    Child: { label: 'group member', hint: 'A group setting and the settings configured inside it' },
    PartOf: { label: 'lives inside', hint: 'The setting sits inside another setting and is configured from there' },
    Refers: { label: 'reusable setting', hint: 'Refers to a reusable setting that must exist first' },
};

export function hasDependencies(context: SettingContext | null | undefined) {
    return Boolean(context && (context.needsFirst.length + context.unlocks.length + context.contains.length) > 0);
}

export function SettingFocusMap({ context, onHop, enterFrom, showSettingLink = true }: {
    context: SettingContext;
    onHop: (item: ContextItem, side: HopSide) => void;
    /** Which side the reader came from — the map slides in from there. */
    enterFrom?: HopSide | null;
    /** Link the centre card to the full setting page (off on the setting page itself). */
    showSettingLink?: boolean;
}) {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const [w, setW] = useState(0);
    useLayoutEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const update = () => setW(el.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const left = context.needsFirst;
    const right = useMemo(() => [...context.unlocks, ...context.contains], [context]);
    // A long side scrolls inside its own column instead of paging; the links follow the scroll
    // position, and a link whose card has scrolled out of view is simply not drawn.
    const [leftScroll, setLeftScroll] = useState(0);
    const [rightScroll, setRightScroll] = useState(0);

    const rows = Math.max(Math.min(left.length, VISIBLE), Math.min(right.length, VISIBLE), 1);
    const h = Math.max(300, rows * ROW + 130);
    const narrow = w > 0 && w < 760;
    const sideW = Math.min(320, Math.max(190, w * 0.27));
    const centerW = Math.min(400, Math.max(240, w * 0.32));
    const leftX = 0;
    const rightX = w - sideW;
    const centerX = (w - centerW) / 2;
    const midY = h / 2 + 14;
    const colH = (count: number) => Math.min(count, VISIBLE) * ROW - 12;
    const colTop = (count: number) => midY - colH(Math.max(1, count)) / 2;
    /** Centre of row i as drawn, or null when that card is scrolled out of the column. */
    const linkY = (count: number, i: number, scroll: number) => {
        const y = i * ROW + 26 - scroll;
        return y < 4 || y > colH(count) - 4 ? null : colTop(count) + y;
    };

    const templates = context.strongerTogether.filter(g => g.kind === 'template');
    const nearby = context.strongerTogether
        .filter(g => g.kind !== 'template')
        .flatMap(g => g.settings)
        .filter(s => s.settingId)
        .slice(0, 12);
    const deprecated = context.lifecycleStatus !== 'Active';
    const replacements = context.watchOut.flatMap(wo => wo.code === 'deprecated' ? wo.settings : []).filter(s => s.settingId).slice(0, 2);

    const legend = useMemo(() => {
        const present = new Set<DependencyKind>();
        for (const item of [...left, ...right]) if (item.kind) present.add(item.kind);
        return (Object.keys(LEGEND_TEXT) as DependencyKind[]).filter(k => present.has(k));
    }, [left, right]);
    const hasRequired = left.some(i => i.isRequired);

    const curve = (x1: number, y1: number, x2: number, y2: number) => {
        const dx = (x2 - x1) * 0.5;
        return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
    };

    const centerCard = (
        <div className={`rounded-2xl border-2 bg-card p-4 shadow-lg ${deprecated ? 'border-amber-500/70 shadow-amber-500/10' : 'border-sky-500/70 shadow-sky-500/10'}`}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{context.categoryName ?? 'Setting'}{context.platforms.length ? ` · ${context.platforms.join(', ')}` : ''}</div>
            <div className="text-base font-semibold leading-snug mt-0.5">{context.displayName}</div>
            <div className="flex items-center gap-1.5 flex-wrap mt-2 text-[11px]">
                {context.hasTenantUsage && (
                    <span className={`rounded-full px-2 py-0.5 border ${context.tenantPolicyCount ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' : 'bg-muted text-muted-foreground border-border'}`}>
                        {context.tenantPolicyCount ? `in ${context.tenantPolicyCount} of your policies` : 'not in your tenant'}
                    </span>
                )}
                {context.watchOut.map(wo => (
                    <span key={wo.code} title={wo.detail} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                        <AlertTriangle className="h-3 w-3" /> {wo.title}
                    </span>
                ))}
            </div>
            {replacements.map(item => (
                <button key={item.definitionId} type="button" onClick={() => onHop(item, 'right')}
                    className="mt-2 flex w-full items-center gap-1 text-left text-[11px] rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/20">
                    Use instead <ArrowRight className="h-3 w-3 shrink-0" /> <span className="truncate">{item.displayName}</span>
                </button>
            ))}
            {(showSettingLink || context.readMore[0]) && (
                <div className="flex items-center gap-3 mt-3 text-[11px]">
                    {showSettingLink && <Link href={settingHref(context.settingId)} className="inline-flex items-center gap-1 font-medium hover:underline"><ExternalLink className="h-3 w-3" /> Full setting page</Link>}
                    {context.readMore[0] && <a href={context.readMore[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"><ExternalLink className="h-3 w-3" /> Microsoft docs</a>}
                </div>
            )}
        </div>
    );

    return (
        <div key={context.settingId} className={enterFrom ? `focus-enter-${enterFrom}` : 'focus-enter'}>
            <style>{`
                @keyframes focusFlow { to { stroke-dashoffset: -28 } }
                @keyframes focusIn { from { opacity: 0; transform: scale(.97) } to { opacity: 1; transform: none } }
                @keyframes focusFromLeft { from { opacity: 0; transform: translateX(-12%) } to { opacity: 1; transform: none } }
                @keyframes focusFromRight { from { opacity: 0; transform: translateX(12%) } to { opacity: 1; transform: none } }
                .focus-flow { stroke-dasharray: 6 8; animation: focusFlow 1.1s linear infinite }
                .focus-enter { animation: focusIn .3s ease-out both }
                .focus-enter-left { animation: focusFromLeft .35s cubic-bezier(.2,.8,.2,1) both }
                .focus-enter-right { animation: focusFromRight .35s cubic-bezier(.2,.8,.2,1) both }
                @media (prefers-reduced-motion: reduce) { .focus-flow, .focus-enter, .focus-enter-left, .focus-enter-right { animation: none } }
            `}</style>

            {templates.length > 0 && (
                <div className="flex flex-col items-center gap-1.5 mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stronger together — Microsoft ships it in</div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {templates.slice(0, 6).map(t => (
                            <Link key={t.id} href={`/settings-library/explore?template=${t.id}`}
                                title={`${templateFamilyLabel(t.templateFamily)} · ${t.totalSettings} settings${t.recommendedValue ? ` · ships as ${t.recommendedValue}` : ''}`}
                                className="inline-flex items-center gap-1 rounded-full border border-teal-500/50 bg-teal-500/10 px-2.5 py-1 text-[11px] text-teal-700 dark:text-teal-200 hover:bg-teal-500/20">
                                <ShieldCheck className="h-3 w-3" /> {t.name}
                                {t.recommendedValue && <span className="opacity-70">= {t.recommendedValue.split('_').pop()}</span>}
                            </Link>
                        ))}
                        {templates.length > 6 && <span className="text-[11px] text-muted-foreground self-center">+{templates.length - 6}</span>}
                    </div>
                </div>
            )}

            <div ref={stageRef} className="relative w-full" style={narrow ? undefined : { height: h }}>
                {narrow ? (
                    // Narrow screens: the same three groups, stacked.
                    <div className="space-y-3">
                        <SideList title="Needs first" hint="configure these before it works" items={left} empty="Needs nothing first" showTenant={context.hasTenantUsage} onPick={i => onHop(i, 'left')} />
                        {centerCard}
                        <SideList title="Unlocks" hint="only apply once this is set" items={right} empty="Unlocks nothing — an end point" showTenant={context.hasTenantUsage} onPick={i => onHop(i, 'right')} />
                    </div>
                ) : w > 0 && (
                    <>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                            {left.map((item, i) => { const y = linkY(left.length, i, leftScroll); return y === null ? null : (
                                <path key={`l-${item.definitionId}-${i}`} d={curve(leftX + sideW, y, centerX, midY)} fill="none"
                                    stroke={item.kind ? KIND_META[item.kind].color : '#64748b'} strokeWidth={item.isRequired ? 2.5 : 1.6} className="focus-flow" />
                            ); })}
                            {right.map((item, i) => { const y = linkY(right.length, i, rightScroll); return y === null ? null : (
                                <path key={`r-${item.definitionId}-${i}`} d={curve(centerX + centerW, midY, rightX, y)} fill="none"
                                    stroke={item.kind ? KIND_META[item.kind].color : '#64748b'} strokeWidth={1.6} className="focus-flow" />
                            ); })}
                        </svg>

                        <ColumnHeader x={leftX} w={sideW} y={colTop(left.length) - 52} title="Needs first" hint="configure these before it works" count={left.length} />
                        <ColumnHeader x={rightX} w={sideW} y={colTop(right.length) - 52} title="Unlocks" hint="only apply once this is set" count={right.length} />

                        {left.length === 0 && <EmptySide x={leftX} w={sideW} y={midY - 22} text="Needs nothing first" />}
                        {right.length === 0 && <EmptySide x={rightX} w={sideW} y={midY - 22} text="Unlocks nothing — an end point" />}

                        <SideColumn items={left} x={leftX} w={sideW} top={colTop(left.length)} height={colH(left.length)} scroll={leftScroll} onScroll={setLeftScroll}
                            showTenant={context.hasTenantUsage} onPick={item => onHop(item, 'left')} />
                        <SideColumn items={right} x={rightX} w={sideW} top={colTop(right.length)} height={colH(right.length)} scroll={rightScroll} onScroll={setRightScroll}
                            showTenant={context.hasTenantUsage} onPick={item => onHop(item, 'right')} />

                        <div className="absolute -translate-y-1/2" style={{ left: centerX, width: centerW, top: midY }}>{centerCard}</div>
                    </>
                )}
            </div>

            {/* legend: only the kinds actually drawn, in the words a reader uses */}
            {legend.length > 0 && (
                <div className="flex items-center justify-center gap-x-4 gap-y-1 flex-wrap mt-2 text-[11px] text-muted-foreground">
                    {legend.map(kind => (
                        <span key={kind} className="inline-flex items-center gap-1.5" title={LEGEND_TEXT[kind].hint}>
                            <svg width="26" height="6" aria-hidden><line x1="0" y1="3" x2="26" y2="3" stroke={KIND_META[kind].color} strokeWidth="2" strokeDasharray="6 4" /></svg>
                            {LEGEND_TEXT[kind].label}
                        </span>
                    ))}
                    {hasRequired && (
                        <span className="inline-flex items-center gap-1.5" title="Microsoft marks this prerequisite as required">
                            <svg width="26" height="6" aria-hidden><line x1="0" y1="3" x2="26" y2="3" stroke="currentColor" strokeWidth="3.5" strokeDasharray="6 4" /></svg>
                            thicker = required
                        </span>
                    )}
                    {context.hasTenantUsage && <span className="inline-flex items-center gap-1"><span className="text-emerald-600 dark:text-emerald-300">✓ n</span> = in n of your policies</span>}
                </div>
            )}

            {nearby.length > 0 && (
                <div className="flex flex-col items-center gap-1.5 mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Nearby — same area and linked settings</div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {nearby.map(item => (
                            <button key={item.definitionId} type="button" onClick={() => onHop(item, 'right')} title={item.reason}
                                className={`rounded-full border px-2.5 py-1 text-[11px] truncate max-w-[240px] hover:bg-muted ${item.tenantPolicyCount ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-200 bg-emerald-500/5' : 'border-border text-muted-foreground bg-card hover:text-foreground'}`}>
                                {item.displayName}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ColumnHeader({ x, w, y, title, hint, count }: { x: number; w: number; y: number; title: string; hint: string; count: number }) {
    return (
        <div className="absolute" style={{ left: x, width: w, top: Math.max(0, y) }}>
            <div className="text-xs font-semibold">{title} <span className="text-muted-foreground font-normal">· {count}</span></div>
            <div className="text-[10px] text-muted-foreground">{hint}</div>
        </div>
    );
}

function EmptySide({ x, w, y, text }: { x: number; w: number; y: number; text: string }) {
    return <div className="absolute text-xs text-muted-foreground text-center border border-dashed border-border rounded-lg py-3" style={{ left: x, width: w, top: y }}>{text}</div>;
}

/** One side of the map. Up to VISIBLE rows it is a plain stack; beyond that it scrolls, with a fade and a count for what is out of view. */
function SideColumn({ items, x, w, top, height, scroll, onScroll, showTenant, onPick }: {
    items: ContextItem[]; x: number; w: number; top: number; height: number; scroll: number; onScroll: (y: number) => void; showTenant: boolean; onPick: (item: ContextItem) => void;
}) {
    if (items.length === 0) return null;
    const scrollable = items.length > VISIBLE;
    const below = scrollable ? Math.max(0, Math.round((items.length * ROW - 12 - height - scroll) / ROW)) : 0;
    const above = scrollable ? Math.round(scroll / ROW) : 0;
    return (
        <>
            <div className={`absolute ${scrollable ? 'overflow-y-auto overscroll-contain pr-1' : ''}`} style={{ left: x, width: w, top, height, scrollbarWidth: 'thin' }}
                onScroll={scrollable ? e => onScroll(e.currentTarget.scrollTop) : undefined} tabIndex={scrollable ? 0 : undefined} aria-label={scrollable ? `${items.length} settings, scrollable` : undefined}>
                <div className="flex flex-col" style={{ gap: 12 }}>
                    {items.map((item, i) => <SideCard key={`${item.definitionId}-${i}`} inline item={item} showTenant={showTenant} onClick={() => onPick(item)} />)}
                </div>
            </div>
            {above > 0 && <div className="absolute text-center text-[10px] text-muted-foreground pointer-events-none" style={{ left: x, width: w, top: top - 14 }}>↑ {above} more</div>}
            {below > 0 && <div className="absolute text-center text-[10px] text-muted-foreground pointer-events-none" style={{ left: x, width: w, top: top + height + 2 }}>↓ {below} more — scroll</div>}
        </>
    );
}

function SideCard({ item, style, showTenant, onClick, inline }: { item: ContextItem; style?: React.CSSProperties; showTenant: boolean; onClick: () => void; inline?: boolean }) {
    const reachable = Boolean(item.settingId);
    const color = item.kind ? KIND_META[item.kind].color : '#64748b';
    const off = item.lifecycleStatus && item.lifecycleStatus !== 'Active';
    return (
        <button type="button" disabled={!reachable} onClick={onClick} title={reachable ? item.reason : "Referenced by Microsoft's metadata, but not in the catalog"}
            className={`${inline ? 'w-full shrink-0' : 'absolute'} text-left rounded-lg border bg-card px-2.5 py-1.5 transition-all hover:bg-muted hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0`}
            style={{ ...style, height: ROW - 12, borderColor: color }}>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-medium truncate ${off ? 'text-amber-700 dark:text-amber-300' : ''}`}>{item.displayName ?? item.definitionId}</span>
                {showTenant && (item.tenantPolicyCount
                    ? <span className="text-[10px] text-emerald-600 dark:text-emerald-300 shrink-0">✓ {item.tenantPolicyCount}</span>
                    : <span className="text-[10px] text-muted-foreground/60 shrink-0">—</span>)}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">{item.reason}</div>
        </button>
    );
}

function SideList({ title, hint, items, empty, showTenant, onPick }: { title: string; hint: string; items: ContextItem[]; empty: string; showTenant: boolean; onPick: (item: ContextItem) => void }) {
    return (
        <div>
            <div className="text-xs font-semibold">{title} <span className="text-muted-foreground font-normal">· {items.length}</span></div>
            <div className="text-[10px] text-muted-foreground mb-1.5">{hint}</div>
            {items.length === 0
                ? <div className="text-xs text-muted-foreground text-center border border-dashed border-border rounded-lg py-3">{empty}</div>
                : <div className="space-y-1.5">{items.slice(0, 12).map((item, i) => <SideCard key={`${item.definitionId}-${i}`} inline item={item} showTenant={showTenant} onClick={() => onPick(item)} />)}</div>}
        </div>
    );
}
