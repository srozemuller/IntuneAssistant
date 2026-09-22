'use client';

// The 3D dependency web. Rendered only on the client (three.js/WebGL) — the page dynamic-imports
// this with ssr:false. Two modes:
//  - seed mode (seedSettingId given): GET /settings-library/settings/{id}/graph, grows by expanding
//    nodes in place; node objects are kept by identity across merges so the force layout doesn't
//    re-scramble what is already on screen.
//  - full mode (no seed): GET /settings-library/graph — the entire catalog (~11k nodes / 31k edges,
//    or one platform). Everything is already loaded, so there is nothing to expand; rendering is
//    tuned down (low-poly nodes, no arrows, faster settle) to stay interactive at that size.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ForceGraph3D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-3d';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApiRequest } from '@/hooks/useApiRequest';
import { SETTINGS_LIBRARY_GRAPH_ENDPOINT, SETTINGS_LIBRARY_SETTING_GRAPH_ENDPOINT } from '@/lib/constants';
import {
    CatalogGraphDto, DependencyGraphDto, DependencyKind, GraphNodeDto, KIND_META, settingHref,
} from '@/lib/settingsLibraryGraph';
import {
    Loader2, Crosshair, Expand, ExternalLink, Search, X, Maximize2, Footprints, Orbit, AlertTriangle, Layers,
} from 'lucide-react';

interface ApiEnvelope<T> { status: string; message?: string | null; data: T }

interface GraphNode extends GraphNodeDto {
    id: string;              // = definitionId; what links refer to
    expanded: boolean;       // its own neighbourhood has been fetched
    degree: number;          // edges touching it in the current graph (drives size)
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    kind: DependencyKind;
    sourceOptionId: string | null;
    condition: string | null;
    isRequired: boolean | null;
    key: string;
}

type FgRef = ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>;

// Category colours: assigned in order of first appearance, so a category keeps its colour as the
// web grows. Palette chosen to stay distinct on the dark canvas.
const PALETTE = ['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#c084fc', '#fb7185', '#2dd4bf', '#f97316', '#a3e635', '#38bdf8', '#e879f9', '#facc15'];
const EXTERNAL_COLOR = '#475569';
const SEED_COLOR = '#ffffff';
const SELECTED_COLOR = '#fde68a';
const DIM_COLOR = '#1f2937';

const endId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

interface DependencyWebProps {
    /** Start from this setting's neighbourhood. Omit for the whole catalog. */
    seedSettingId?: string;
    /** Full mode only: restrict the web to edges whose both ends are on this platform. */
    platform?: string | null;
    /** Full mode only: one scenario (category subtree) plus its one-hop neighbours instead of the whole catalog. */
    categoryId?: string | null;
    /** Full mode only: light up this category (by display name) once loaded — e.g. the far end of a clicked flow. */
    initialHighlightCategory?: string | null;
}

export default function DependencyWeb({ seedSettingId, platform = null, categoryId = null, initialHighlightCategory = null }: DependencyWebProps) {
    const fullMode = !seedSettingId;
    const { request } = useApiRequest();
    const fgRef = useRef<FgRef | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [size, setSize] = useState({ width: 800, height: 600 });
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphLink[]>([]);
    const [seedDefinitionId, setSeedDefinitionId] = useState<string | null>(null);
    const [selected, setSelected] = useState<GraphNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanding, setExpanding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [truncated, setTruncated] = useState(false);
    const [depth, setDepth] = useState(2);
    const [walkMode, setWalkMode] = useState(false);
    const [search, setSearch] = useState('');
    const [hiddenKinds, setHiddenKinds] = useState<Set<DependencyKind>>(new Set());
    // A category picked from the legend: its settings stay lit, everything else dims.
    const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
    const categoryColors = useRef(new Map<string, string>());

    const categoryKey = (node: GraphNode) => node.categoryName ?? node.categoryId ?? '—';

    // Fill the container; the graph needs explicit pixel dimensions.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            setSize({ width: Math.max(320, rect.width), height: Math.max(320, rect.height) });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const colorFor = useCallback((node: GraphNode) => {
        if (!node.settingId) return EXTERNAL_COLOR;
        const key = node.categoryName ?? node.categoryId ?? '—';
        let color = categoryColors.current.get(key);
        if (!color) {
            color = PALETTE[categoryColors.current.size % PALETTE.length];
            categoryColors.current.set(key, color);
        }
        return color;
    }, []);

    // Merge a fetched neighbourhood into what is on screen. Existing node objects are reused
    // (positions live on them); links are de-duplicated on their full identity.
    const merge = useCallback((graph: Pick<DependencyGraphDto, 'nodes' | 'edges'>, expandedId: string | null) => {
        setNodes(prev => {
            const byId = new Map(prev.map(n => [n.id, n]));
            for (const dto of graph.nodes) {
                const existing = byId.get(dto.definitionId);
                if (existing) {
                    // A node first seen as an "external" placeholder can be filled in later.
                    if (!existing.settingId && dto.settingId) Object.assign(existing, dto);
                    if (dto.definitionId === expandedId) existing.expanded = true;
                } else {
                    byId.set(dto.definitionId, { ...dto, id: dto.definitionId, expanded: dto.definitionId === expandedId, degree: 0 });
                }
            }
            return Array.from(byId.values());
        });
        setLinks(prev => {
            const byKey = new Map(prev.map(l => [l.key, l]));
            for (const e of graph.edges) {
                const key = `${e.source}|${e.target}|${e.kind}|${e.sourceOptionId ?? ''}|${e.condition ?? ''}`;
                if (!byKey.has(key)) byKey.set(key, { ...e, key });
            }
            return Array.from(byKey.values());
        });
    }, []);

    const fetchGraph = useCallback(async (settingId: string, fetchDepth: number) => {
        const response = await request<ApiEnvelope<DependencyGraphDto>>(
            `${SETTINGS_LIBRARY_SETTING_GRAPH_ENDPOINT(settingId)}?depth=${fetchDepth}&maxNodes=600`
        );
        return response?.data?.data ?? null;
    }, [request]);

    const fetchCatalogGraph = useCallback(async (forPlatform: string | null, forCategory: string | null) => {
        const params = new URLSearchParams();
        if (forPlatform) params.set('platform', forPlatform);
        if (forCategory) params.set('categoryId', forCategory);
        const query = params.toString();
        const url = query ? `${SETTINGS_LIBRARY_GRAPH_ENDPOINT}?${query}` : SETTINGS_LIBRARY_GRAPH_ENDPOINT;
        const response = await request<ApiEnvelope<CatalogGraphDto>>(url);
        return response?.data?.data ?? null;
    }, [request]);

    // Initial load (and reload when depth / platform changes): start over. `cancelled` covers both
    // a prop change mid-flight and React Strict Mode's double effect run — the superseded run's
    // (aborted) request must not write "could not load" over the live one.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                if (seedSettingId) {
                    const graph = await fetchGraph(seedSettingId, depth);
                    if (cancelled) return;
                    if (!graph) { setError('Could not load the dependency web for this setting.'); return; }
                    categoryColors.current.clear();
                    setNodes([]);
                    setLinks([]);
                    setSelected(null);
                    setSeedDefinitionId(graph.seedDefinitionId);
                    setTruncated(graph.truncated);
                    merge(graph, graph.seedDefinitionId);
                } else {
                    const graph = await fetchCatalogGraph(platform, categoryId);
                    if (cancelled) return;
                    if (!graph) { setError('Could not load the catalog dependency web.'); return; }
                    categoryColors.current.clear();
                    setNodes([]);
                    setLinks([]);
                    setSelected(null);
                    setSeedDefinitionId(null);
                    setTruncated(false);
                    // Everything is present; mark every node expanded so nothing offers to fetch more.
                    merge({ nodes: graph.nodes, edges: graph.edges }, null);
                    setNodes(prev => prev.map(n => { n.expanded = true; return n; }));
                    setHighlightCategory(initialHighlightCategory ?? null);
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the dependency web.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [seedSettingId, depth, platform, categoryId, initialHighlightCategory, fetchGraph, fetchCatalogGraph, merge]);

    const expandNode = useCallback(async (node: GraphNode) => {
        if (fullMode || !node.settingId || node.expanded || expanding) return;
        setExpanding(node.id);
        try {
            const graph = await fetchGraph(node.settingId, 1);
            if (graph) {
                merge(graph, node.id);
                if (graph.truncated) setTruncated(true);
            }
        } finally {
            setExpanding(null);
        }
    }, [fullMode, expanding, fetchGraph, merge]);

    // Degree drives node size; recomputed whenever the graph changes.
    const visibleLinks = useMemo(() => links.filter(l => !hiddenKinds.has(l.kind)), [links, hiddenKinds]);
    const graphData = useMemo(() => {
        const degree = new Map<string, number>();
        for (const l of visibleLinks) {
            degree.set(endId(l.source), (degree.get(endId(l.source)) ?? 0) + 1);
            degree.set(endId(l.target), (degree.get(endId(l.target)) ?? 0) + 1);
        }
        for (const n of nodes) n.degree = degree.get(n.id) ?? 0;
        return { nodes, links: visibleLinks };
    }, [nodes, visibleLinks]);

    const searchMatches = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return null;
        return new Set(nodes.filter(n => (n.displayName ?? n.id).toLowerCase().includes(term) || n.id.toLowerCase().includes(term)).map(n => n.id));
    }, [nodes, search]);

    const neighboursOfSelected = useMemo(() => {
        if (!selected) return null;
        const set = new Set<string>([selected.id]);
        for (const l of visibleLinks) {
            if (endId(l.source) === selected.id) set.add(endId(l.target));
            if (endId(l.target) === selected.id) set.add(endId(l.source));
        }
        return set;
    }, [selected, visibleLinks]);

    const focusNode = useCallback((node: GraphNode) => {
        const fg = fgRef.current;
        const n = node as NodeObject<GraphNode>;
        if (!fg || n.x === undefined || n.y === undefined || n.z === undefined) return;
        const distance = 120;
        const ratio = 1 + distance / Math.hypot(n.x, n.y, n.z || 1);
        fg.cameraPosition({ x: n.x * ratio, y: n.y * ratio, z: n.z * ratio }, { x: n.x, y: n.y, z: n.z }, 900);
    }, []);

    const legend = useMemo(() => {
        const counts = new Map<string, number>();
        for (const n of nodes) {
            if (!n.settingId) continue;
            const key = n.categoryName ?? n.categoryId ?? '—';
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }));
    }, [nodes]);

    const [categoryFilter, setCategoryFilter] = useState('');
    const visibleLegend = useMemo(() => {
        const term = categoryFilter.trim().toLowerCase();
        return term ? legend.filter(([name]) => name.toLowerCase().includes(term)) : legend;
    }, [legend, categoryFilter]);

    // Click a category: light it up and bring the camera to it; click it again to clear.
    const toggleCategory = useCallback((key: string) => {
        setHighlightCategory(prev => {
            const next = prev === key ? null : key;
            if (next) fgRef.current?.zoomToFit(800, 60, (n: GraphNode) => categoryKey(n) === next);
            return next;
        });
        setSelected(null);
    }, []);

    const selectedLinks = useMemo(() => {
        if (!selected) return [];
        return visibleLinks
            .filter(l => endId(l.source) === selected.id || endId(l.target) === selected.id)
            .map(l => {
                const outgoing = endId(l.source) === selected.id;
                const otherId = outgoing ? endId(l.target) : endId(l.source);
                const other = nodes.find(n => n.id === otherId);
                return { link: l, outgoing, other };
            });
    }, [selected, visibleLinks, nodes]);

    const toggleKind = (kind: DependencyKind) => setHiddenKinds(prev => {
        const next = new Set(prev);
        if (next.has(kind)) next.delete(kind); else next.add(kind);
        return next;
    });

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[560px] rounded-lg overflow-hidden border bg-[#070b14]">
            {/* ── Top-left: search + depth + controls ── */}
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-2 w-[300px]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Highlight settings by name…"
                        className="h-8 pl-8 text-sm bg-slate-900/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200" aria-label="Clear">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {!fullMode && (
                        <>
                            <span className="text-[11px] uppercase tracking-wide text-slate-400 mr-1">Depth</span>
                            {[1, 2, 3].map(d => (
                                <Button key={d} size="sm" variant={depth === d ? 'default' : 'outline'} className="h-7 px-2.5 text-xs" onClick={() => setDepth(d)}>{d}</Button>
                            ))}
                            <span className="mx-1 h-4 border-l border-slate-700" />
                        </>
                    )}
                    <Button size="sm" variant={walkMode ? 'default' : 'outline'} className="h-7 px-2.5 text-xs gap-1" onClick={() => setWalkMode(v => !v)}>
                        {walkMode ? <Footprints className="h-3.5 w-3.5" /> : <Orbit className="h-3.5 w-3.5" />}
                        {walkMode ? 'Walk' : 'Orbit'}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" onClick={() => fgRef.current?.zoomToFit(800, 40)}>
                        <Maximize2 className="h-3.5 w-3.5" /> Fit
                    </Button>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-900/80 border border-slate-700 rounded px-2 py-1">
                    {walkMode
                        ? <>Walk mode: <kbd>W</kbd>/<kbd>S</kbd> forward/back, <kbd>A</kbd>/<kbd>D</kbd> strafe, <kbd>R</kbd>/<kbd>F</kbd> up/down, drag to look around.</>
                        : <>Drag to rotate · scroll to zoom · right-drag to pan · click a node to inspect it{fullMode ? '' : ' · right-click to expand'}.</>}
                </div>
            </div>

            {/* ── Top-right: stats + edge-kind legend (click to hide a kind) ── */}
            <div className="absolute right-3 top-3 z-10 w-[240px] space-y-2">
                <div className="text-xs text-slate-300 bg-slate-900/80 border border-slate-700 rounded px-2.5 py-1.5 flex items-center justify-between">
                    <span>{nodes.length.toLocaleString()} settings · {visibleLinks.length.toLocaleString()} links</span>
                    {(loading || expanding) && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                </div>
                {truncated && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-700/60 rounded px-2.5 py-1.5 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        Some connections were cut at the node cap — expand a node to fetch the rest of its neighbourhood.
                    </div>
                )}
                <div className="bg-slate-900/80 border border-slate-700 rounded px-2.5 py-2 space-y-1">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Links</div>
                    {(Object.keys(KIND_META) as DependencyKind[]).map(kind => (
                        <button
                            key={kind}
                            onClick={() => toggleKind(kind)}
                            className={`flex items-center gap-2 text-xs w-full text-left ${hiddenKinds.has(kind) ? 'opacity-40 line-through' : ''}`}
                        >
                            <span className="inline-block h-0.5 w-5 rounded" style={{ background: KIND_META[kind].color }} />
                            <span className="text-slate-200">{KIND_META[kind].label}</span>
                        </button>
                    ))}
                </div>
                {legend.length > 0 && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded px-2.5 py-2 space-y-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] uppercase tracking-wide text-slate-400">Categories · {legend.length}</span>
                            {highlightCategory && (
                                <button onClick={() => setHighlightCategory(null)} className="text-[11px] text-slate-400 hover:text-slate-200">clear</button>
                            )}
                        </div>
                        <div className="relative mb-1">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                            <Input
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                placeholder="Find a category…"
                                className="h-7 pl-6 text-xs bg-slate-950/60 border-slate-700 text-slate-100 placeholder:text-slate-500"
                            />
                            {categoryFilter && (
                                <button onClick={() => setCategoryFilter('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200" aria-label="Clear">
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                        <div className="max-h-[38vh] overflow-y-auto space-y-0.5 pr-0.5">
                            {visibleLegend.length === 0 && (
                                <div className="text-[11px] text-slate-500 px-1 py-1">No category matches.</div>
                            )}
                            {visibleLegend.map(([name, count]) => {
                                const active = highlightCategory === name;
                                return (
                                    <button
                                        key={name}
                                        onClick={() => toggleCategory(name)}
                                        className={`flex items-center gap-2 text-xs w-full text-left rounded px-1 py-0.5 hover:bg-slate-800/80 ${active ? 'bg-slate-800 ring-1 ring-slate-600' : highlightCategory ? 'opacity-50' : ''}`}
                                    >
                                        <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: categoryColors.current.get(name) }} />
                                        <span className="text-slate-200 truncate flex-1" title={name}>{name}</span>
                                        <span className="text-slate-500 tabular-nums">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-800">
                            <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: EXTERNAL_COLOR }} />
                            <span className="text-slate-400">Referenced, not in the catalog</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom-left: the selected setting ── */}
            {selected && (
                <div className="absolute left-3 bottom-3 z-10 w-[360px] max-h-[55%] overflow-y-auto bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-slate-100 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="font-medium text-sm leading-tight">{selected.displayName ?? selected.id}</div>
                            <div className="font-mono text-[11px] text-slate-400 break-all">{selected.id}</div>
                        </div>
                        <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-200 shrink-0" aria-label="Close">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {selected.categoryName && (
                            <button onClick={() => toggleCategory(categoryKey(selected))} title="Highlight every setting in this category">
                                <Badge variant="outline" className="text-[11px] border-slate-600 text-slate-200 gap-1 hover:bg-slate-800 cursor-pointer"><Layers className="h-3 w-3" />{selected.categoryName}</Badge>
                            </button>
                        )}
                        {selected.platforms.map(p => <Badge key={p} variant="outline" className="text-[11px] border-slate-600 text-slate-200">{p}</Badge>)}
                        {selected.scope && <Badge variant="outline" className="text-[11px] border-slate-600 text-slate-200 capitalize">{selected.scope}</Badge>}
                        {selected.lifecycleStatus && selected.lifecycleStatus !== 'Active' && (
                            <Badge className="text-[11px] bg-amber-500/20 text-amber-300 border-amber-500/40">{selected.lifecycleStatus}</Badge>
                        )}
                        {!selected.settingId && <Badge className="text-[11px] bg-slate-700 text-slate-300 border-transparent">Not in catalog</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-600" onClick={() => focusNode(selected)}>
                            <Crosshair className="h-3.5 w-3.5" /> Focus
                        </Button>
                        {!fullMode && selected.settingId && !selected.expanded && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-600" disabled={expanding !== null} onClick={() => expandNode(selected)}>
                                {expanding === selected.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Expand className="h-3.5 w-3.5" />} Expand connections
                            </Button>
                        )}
                        {selected.settingId && (
                            <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1 border-slate-600">
                                <Link href={settingHref(selected.settingId)}><ExternalLink className="h-3.5 w-3.5" /> Open setting</Link>
                            </Button>
                        )}
                    </div>
                    {selectedLinks.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">{selectedLinks.length} connection{selectedLinks.length === 1 ? '' : 's'}</div>
                            {selectedLinks.slice(0, 40).map(({ link, outgoing, other }) => (
                                <button
                                    key={link.key}
                                    onClick={() => { if (other) { setSelected(other); focusNode(other); } }}
                                    className="w-full text-left text-xs flex items-start gap-1.5 hover:bg-slate-800/80 rounded px-1 py-0.5"
                                >
                                    <span className="inline-block h-0.5 w-3 mt-2 rounded shrink-0" style={{ background: KIND_META[link.kind].color }} />
                                    <span className="min-w-0">
                                        <span className="text-slate-400">{outgoing ? KIND_META[link.kind].sentence : `← ${KIND_META[link.kind].label.toLowerCase()} by`}</span>{' '}
                                        <span className="text-slate-100">{other?.displayName ?? other?.id ?? '?'}</span>
                                        {link.sourceOptionId && <span className="text-slate-500"> · via option {link.sourceOptionId.split('_').pop()}</span>}
                                        {link.isRequired && <span className="text-amber-300"> · required</span>}
                                    </span>
                                </button>
                            ))}
                            {selectedLinks.length > 40 && <div className="text-[11px] text-slate-500">…and {selectedLinks.length - 40} more</div>}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="text-sm text-red-300 bg-red-950/70 border border-red-800 rounded px-3 py-2">{error}</div>
                </div>
            )}
            {loading && !error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-slate-300 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> {fullMode ? 'Loading the whole catalog web — this takes a moment…' : 'Building the web…'}
                </div>
            )}

            <ForceGraph3D<GraphNode, GraphLink>
                // controlType only applies at mount, so switching modes remounts the graph; node
                // positions live on the node objects and survive it.
                key={walkMode ? 'fly' : 'orbit'}
                ref={fgRef}
                width={size.width}
                height={size.height}
                graphData={graphData}
                backgroundColor="#070b14"
                controlType={walkMode ? 'fly' : 'orbit'}
                showNavInfo={false}
                nodeId="id"
                nodeLabel={(n: GraphNode) => {
                    const name = n.displayName ?? n.id;
                    const sub = [n.categoryName, n.platforms.join(', '), n.settingId ? null : 'not in catalog'].filter(Boolean).join(' · ');
                    return `<div style="font: 12px system-ui; color: #e2e8f0; background: rgba(15,23,42,.92); border: 1px solid #334155; border-radius: 6px; padding: 6px 8px; max-width: 320px"><div style="font-weight: 600">${name}</div>${sub ? `<div style="color:#94a3b8; margin-top:2px">${sub}</div>` : ''}</div>`;
                }}
                nodeVal={(n: GraphNode) => (n.id === seedDefinitionId ? 8 : (fullMode ? 1 : 2) + Math.min(n.degree, 40) * (fullMode ? 0.2 : 0.35))}
                // Full mode draws ~11k spheres; fewer segments per sphere keeps the frame rate up.
                nodeResolution={fullMode ? 4 : 8}
                // Pre-simulate before the first paint and settle sooner so the big web stops
                // drifting within seconds instead of a minute.
                warmupTicks={fullMode ? 80 : 0}
                cooldownTicks={fullMode ? 600 : Infinity}
                d3AlphaDecay={fullMode ? 0.035 : 0.0228}
                d3VelocityDecay={fullMode ? 0.35 : 0.4}
                nodeColor={(n: GraphNode) => {
                    if (searchMatches) return searchMatches.has(n.id) ? SELECTED_COLOR : DIM_COLOR;
                    if (selected) {
                        if (n.id === selected.id) return SELECTED_COLOR;
                        return neighboursOfSelected?.has(n.id) ? colorFor(n) : DIM_COLOR;
                    }
                    if (highlightCategory) return categoryKey(n) === highlightCategory ? colorFor(n) : DIM_COLOR;
                    if (n.id === seedDefinitionId) return SEED_COLOR;
                    return colorFor(n);
                }}
                nodeOpacity={0.95}
                linkColor={(l: GraphLink) => {
                    const base = KIND_META[l.kind].color;
                    if (selected) {
                        const touches = endId(l.source) === selected.id || endId(l.target) === selected.id;
                        return touches ? base : '#1e293b';
                    }
                    if (highlightCategory) {
                        const s = l.source as GraphNode, t = l.target as GraphNode;
                        const inCategory = typeof s !== 'string' && typeof t !== 'string'
                            && (categoryKey(s) === highlightCategory || categoryKey(t) === highlightCategory);
                        return inCategory ? base : '#111827';
                    }
                    return base;
                }}
                linkWidth={(l: GraphLink) => (selected && (endId(l.source) === selected.id || endId(l.target) === selected.id) ? 1.6 : l.kind === 'PartOf' ? 0.3 : 0.7)}
                linkOpacity={fullMode ? 0.28 : 0.55}
                linkDirectionalArrowLength={(l: GraphLink) => (fullMode || l.kind === 'PartOf' ? 0 : 3)}
                linkDirectionalArrowRelPos={1}
                linkDirectionalParticles={(l: GraphLink) => (selected && (endId(l.source) === selected.id || endId(l.target) === selected.id) ? 2 : 0)}
                linkDirectionalParticleWidth={1.2}
                onNodeClick={(n: GraphNode) => { setSelected(n); focusNode(n); }}
                onNodeRightClick={(n: GraphNode) => { void expandNode(n); }}
                onBackgroundClick={() => { setSelected(null); setHighlightCategory(null); }}
                enableNodeDrag={!walkMode}
            />
        </div>
    );
}
