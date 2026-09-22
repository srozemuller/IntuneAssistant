'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/DataTable';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useApiStream } from '@/hooks/useApiStream';
import {
    SETTINGS_LIBRARY_SETTINGS_ENDPOINT,
    SETTINGS_LIBRARY_SETTINGS_STREAM_ENDPOINT,
    SETTINGS_LIBRARY_TENANT_USAGE_SUMMARY_ENDPOINT,
    SETTINGS_LIBRARY_TENANT_USAGE_HARVEST_STREAM_ENDPOINT,
    SETTINGS_LIBRARY_TENANT_IMPACT_ENDPOINT,
    SETTINGS_LIBRARY_TENANT_USAGE_EXPORT_ENDPOINT,
    SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT,
    SETTINGS_LIBRARY_SETTING_HISTORY_ENDPOINT,
    SETTINGS_LIBRARY_CATEGORIES_ENDPOINT,
    SETTINGS_LIBRARY_SNAPSHOTS_ENDPOINT,
} from '@/lib/constants';
import { graphHref, settingHref } from '@/lib/settingsLibraryGraph';
import { TenantSettingImpact, TenantSettingUsageSummary, UsageHarvestComplete, UsageHarvestProgress } from '@/lib/settingsUsage';
import {
    Search, ExternalLink, History, Layers, ShieldCheck,
    AlertTriangle, XCircle, Clock, ChevronRight, ChevronDown, Loader2,
    Info, ListTree, LinkIcon, Monitor, User, FolderTree, CheckCircle2, Share2, Building2, ShieldAlert, Download,
} from 'lucide-react';

// ─── Types (mirrors IntuneAssistant.Dto.Response.SettingsLibrary) ──────────────

interface ApiEnvelope<T> {
    status: string;
    message?: string | null;
    data: T;
    meta?: { totalCount?: number; hasMore?: boolean } & Record<string, unknown>;
}

interface CatalogSettingSummary {
    id: string;
    graphDefinitionId: string;
    name: string | null;
    displayName: string | null;
    description: string | null;
    scope: 'device' | 'user' | null;
    odataType: string | null;
    categoryId: string | null;
    platforms: string[];
    technologies: string[];
    settingUsage: string | null;
    lifecycleStatus: LifecycleStatus;
    hasReplacementCandidate: boolean;
    firstSeenAt: string;
    lastSeenAt: string;
    revisionCount: number;
    /** Tenant overlay from the API: policies in the caller's tenant configuring this setting; null until harvested. */
    tenantPolicyCount?: number | null;
}

interface CatalogSettingCategory {
    id: string;
    displayName: string | null;
    description: string | null;
    platforms: string[];
    technologies: string[];
    settingUsage: string | null;
    parentCategoryId: string | null;
    rootCategoryId: string | null;
    settingCount: number;
}

interface CatalogSnapshot {
    id: string;
    capturedAt: string;
    completedAt: string | null;
    collectionStatus: string;
    definitionCount: number;
}

// Stream payloads (mirrors IntuneAssistant.Models.SettingsLibrary.SettingsCatalogStreamModels)
interface CatalogStreamConnected { totalCount: number; chunkSize: number }
interface CatalogStreamChunk { items: CatalogSettingSummary[]; offset: number; loaded: number; totalCount: number }

interface CatalogSettingOption {
    itemId: string;
    name: string | null;
    displayName: string | null;
    description: string | null;
    helpText: string | null;
    isTemplated: boolean;
    valueTemplateId: string | null;
    dependentOn: { dependentOnId: string | null; parentSettingId: string | null }[];
    dependedOnBy: { childSettingId: string | null; required: boolean }[];
}

interface CatalogSettingRevision {
    id: string;
    revisionNumber: number;
    graphVersion: string | null;
    odataType: string | null;
    name: string | null;
    displayName: string | null;
    description: string | null;
    helpText: string | null;
    platforms: string[];
    technologies: string[];
    deviceMode: string | null;
    categoryId: string | null;
    baseUri: string | null;
    offsetUri: string | null;
    scope: 'device' | 'user' | null;
    keywords: string[];
    infoUrls: string[];
    accessTypes: string[];
    visibility: string | null;
    riskLevel: string | null;
    settingUsage: string | null;
    uxBehavior: string | null;
    rootDefinitionId: string | null;
    applicabilityDescription: string | null;
    defaultOptionId: string | null;
    options: CatalogSettingOption[] | null;
    minDeviceOccurrence: number | null;
    maxDeviceOccurrence: number | null;
    minimumCount: number | null;
    maximumCount: number | null;
    referredSettingDefinitionIds: string[];
    configurationServiceProviderVersion: string | null;
    minimumSupportedVersion: string | null;
    maximumSupportedVersion: string | null;
    windowsSkus: string[];
    requiresAzureAd: boolean | null;
    requiredAzureAdTrustType: string | null;
    contentHash: string;
    observedAt: string;
    lastObservedAt: string;
}

interface CatalogSettingDetail {
    id: string;
    graphDefinitionId: string;
    canonicalKey: string;
    canonicalName: string | null;
    lifecycleStatus: LifecycleStatus;
    firstSeenAt: string;
    lastSeenAt: string;
    consecutiveMissedSnapshots: number;
    hasReplacementCandidate: boolean;
    revisionCount: number;
    currentRevision: CatalogSettingRevision | null;
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

type LifecycleStatus = 'Active' | 'Deprecated' | 'PossiblyRemoved' | 'Removed';

// Sentinel for the tree's "no category" node — never a real Graph category id.
const UNCATEGORIZED = '__uncategorized__';

// Local page size inside the selected category; the whole category is streamed in, this only slices it.
const TABLE_PAGE_SIZE = 25;

const PLATFORM_LABELS: Record<string, string> = {
    windows10: 'Windows',
    windows10X: 'Windows 10X',
    macOS: 'macOS',
    iOS: 'iOS/iPadOS',
    android: 'Android',
    androidEnterprise: 'Android Enterprise',
    linux: 'Linux',
};

// Only meaningful for CSP-addressed (typically Windows) settings — Graph has no equivalent signal
// for macOS/iOS/Android, so null is rendered as "—", never guessed as one or the other.
function scopeBadge(scope: 'device' | 'user' | null) {
    if (!scope) return <span className="text-muted-foreground text-xs">—</span>;
    return scope === 'device'
        ? <Badge variant="outline" className="gap-1 text-xs"><Monitor className="h-3 w-3" /> Device</Badge>
        : <Badge variant="outline" className="gap-1 text-xs"><User className="h-3 w-3" /> User</Badge>;
}

// "#microsoft.graph.deviceManagementConfigurationChoiceSettingCollectionDefinition" → "Choice collection".
// Graph's own type name is the only type signal a summary row carries; it is shortened, never re-classified.
function settingTypeLabel(odataType: string | null): string | null {
    if (!odataType) return null;
    const core = odataType
        .replace('#microsoft.graph.deviceManagementConfiguration', '')
        .replace(/Definition$/, '');
    switch (core) {
        case 'ChoiceSetting': return 'Choice';
        case 'SimpleSetting': return 'Simple';
        case 'SettingGroup': return 'Group';
        case 'ChoiceSettingCollection': return 'Choice collection';
        case 'SimpleSettingCollection': return 'Simple collection';
        case 'SettingGroupCollection': return 'Group collection';
        case 'RedirectSetting': return 'Redirect';
        default: return core.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
}

function lifecycleBadge(status: LifecycleStatus) {
    switch (status) {
        case 'Active':
            return (
                <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 gap-1">
                    <ShieldCheck className="h-3 w-3" /> Active
                </Badge>
            );
        case 'Deprecated':
            return (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
                    <AlertTriangle className="h-3 w-3" /> Deprecated
                </Badge>
            );
        case 'PossiblyRemoved':
            return (
                <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1">
                    <AlertTriangle className="h-3 w-3" /> Possibly Removed
                </Badge>
            );
        case 'Removed':
            return (
                <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1">
                    <XCircle className="h-3 w-3" /> Removed
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function formatDate(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return value;
    }
}

// ── Small presentational helpers for the expanded detail panel ────────────────
// Keeping these tiny and reused everywhere in the panel is what makes it read as organized
// sections instead of one dense, undifferentiated block.

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-border/60">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</span>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <div className="text-xs uppercase text-muted-foreground tracking-wide">{children}</div>;
}

function Field({ label, value, mono, capitalize }: { label: string; value?: string | null; mono?: boolean; capitalize?: boolean }) {
    if (!value) return null;
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className={[mono && 'font-mono text-xs break-all', capitalize && 'capitalize'].filter(Boolean).join(' ')}>
                {value}
            </div>
        </div>
    );
}

// ── Category tree ─────────────────────────────────────────────────────────────

interface CategoryNode {
    id: string;
    name: string;
    ownCount: number;
    /** Own settings plus every descendant's — what the tree shows next to the name. */
    totalCount: number;
    children: CategoryNode[];
}

function buildCategoryTree(categories: CatalogSettingCategory[]): CategoryNode[] {
    const known = new Set(categories.map(c => c.id));
    const childrenByParent = new Map<string | null, CatalogSettingCategory[]>();
    for (const category of categories) {
        // A parent that isn't in the list at all (not synced yet) makes its child a root — better than hiding it.
        const parentKey = category.parentCategoryId && known.has(category.parentCategoryId) ? category.parentCategoryId : null;
        if (!childrenByParent.has(parentKey)) childrenByParent.set(parentKey, []);
        childrenByParent.get(parentKey)!.push(category);
    }

    const toNode = (category: CatalogSettingCategory): CategoryNode => {
        const children = (childrenByParent.get(category.id) ?? [])
            .map(toNode)
            .sort((a, b) => a.name.localeCompare(b.name));
        return {
            id: category.id,
            name: category.displayName || category.id,
            ownCount: category.settingCount,
            totalCount: category.settingCount + children.reduce((sum, child) => sum + child.totalCount, 0),
            children,
        };
    };

    return (childrenByParent.get(null) ?? []).map(toNode).sort((a, b) => a.name.localeCompare(b.name));
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        const inChild = findNode(node.children, id);
        if (inChild) return inChild;
    }
    return null;
}

function CategoryTreeItem({ node, depth, selectedId, expanded, onSelect, onToggle }: {
    node: CategoryNode;
    depth: number;
    selectedId: string | null;
    expanded: Set<string>;
    onSelect: (id: string) => void;
    onToggle: (id: string) => void;
}) {
    const isSelected = node.id === selectedId;
    const isOpen = expanded.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
        <div>
            <div
                className={`flex items-center gap-1 rounded-md pr-2 py-1 text-sm cursor-pointer ${
                    isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60'
                }`}
                style={{ paddingLeft: `${8 + depth * 14}px` }}
                onClick={() => onSelect(node.id)}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        className="p-0.5 rounded hover:bg-muted"
                        onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                ) : (
                    <span className="w-[18px] shrink-0" />
                )}
                <span className="truncate flex-1" title={node.name}>{node.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">{node.totalCount.toLocaleString()}</span>
            </div>
            {hasChildren && isOpen && node.children.map(child => (
                <CategoryTreeItem
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    selectedId={selectedId}
                    expanded={expanded}
                    onSelect={onSelect}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
}

function SettingsLibraryHero() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 p-8 text-white">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Layers className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        Settings Library
                    </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-4">
                    Every Intune Setting, Explained
                </h1>
                <p className="text-xl text-teal-100 max-w-2xl">
                    Search, browse and understand the full Microsoft Intune Settings Catalog — dependencies,
                    history, security baselines and what your own tenant already configures.
                </p>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 blur-2xl"></div>
            </div>
        </div>
    );
}

export default function SettingsLibraryPage() {
    const { request } = useApiRequest();
    // useApiRequest aborts its previous in-flight request whenever a new one starts. The category
    // tree, the tenant-usage summary and the latest snapshot all load on mount and independently
    // of each other, so each gets its own hook instance — sharing one made them cancel each
    // other, and the category call (the slowest) lost every time, leaving the tree empty.
    const { request: categoryRequest } = useApiRequest();
    const { request: usageRequest } = useApiRequest();
    const { request: snapshotRequest } = useApiRequest();
    const categoryRunRef = useRef(0);
    const { stream, cancel } = useApiStream();
    // The harvest is its own stream: useApiStream holds one AbortController per instance, so sharing
    // the settings stream's would cancel the harvest the moment a filter changed.
    const { stream: harvestStream, cancel: cancelHarvest } = useApiStream();

    // ── tenant usage overlay ─────────────────────────────────────────────────
    const [usageSummary, setUsageSummary] = useState<TenantSettingUsageSummary | null | undefined>(undefined);
    const [impactCounts, setImpactCounts] = useState<TenantSettingImpact['countsByRule'] | null>(null);
    const [harvesting, setHarvesting] = useState(false);
    const [harvestProgress, setHarvestProgress] = useState<UsageHarvestProgress | null>(null);
    const [harvestResult, setHarvestResult] = useState<{ ok: boolean; message: string } | null>(null);
    // Bumped after a harvest so the tree counts and the current stream pick up the new overlay.
    const [usageVersion, setUsageVersion] = useState(0);

    // ── catalog stats (header) ────────────────────────────────────────────────
    const [latestSnapshot, setLatestSnapshot] = useState<CatalogSnapshot | null>(null);
    const [uncategorizedCount, setUncategorizedCount] = useState(0);

    // ── categories + tree ────────────────────────────────────────────────────
    const [categories, setCategories] = useState<CatalogSettingCategory[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [treeFilter, setTreeFilter] = useState('');

    // ── filters ──────────────────────────────────────────────────────────────
    // Declared ahead of the tree memos below, which read platform/deprecatedOnly.
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [platform, setPlatform] = useState<string | null>(null);
    const [deprecatedOnly, setDeprecatedOnly] = useState(false);
    const [usedInTenantOnly, setUsedInTenantOnly] = useState(false);
    const hasScopingFilter = platform !== null || deprecatedOnly || usedInTenantOnly;

    const categoryNameById = useMemo(() => {
        const map = new Map<string, string>();
        categories.forEach(c => { if (c.displayName) map.set(c.id, c.displayName); });
        return map;
    }, [categories]);

    // Category counts arrive already scoped to the platform/deprecated filters (see the fetch
    // below), so a subtree total of 0 means "nothing here under the current filter".
    const tree = useMemo(() => buildCategoryTree(categories), [categories]);
    const filteredTotal = useMemo(
        () => tree.reduce((sum, node) => sum + node.totalCount, 0) + uncategorizedCount,
        [tree, uncategorizedCount]
    );

    // Platform chips come from the categories the backend actually has, not a hardcoded list.
    const platformOptions = useMemo(() => {
        const set = new Set<string>();
        categories.forEach(c => c.platforms?.forEach(p => set.add(p)));
        return Array.from(set).sort();
    }, [categories]);

    // Two prunes: under a platform/deprecated filter, categories with nothing matching disappear
    // (their counts are already scoped server-side); the name filter then keeps a matching node's
    // ancestors so the path to it stays visible.
    const visibleTree = useMemo(() => {
        const dropEmpty = (nodes: CategoryNode[]): CategoryNode[] => nodes
            .filter(node => node.totalCount > 0)
            .map(node => ({ ...node, children: dropEmpty(node.children) }));
        const scoped = hasScopingFilter ? dropEmpty(tree) : tree;

        const term = treeFilter.trim().toLowerCase();
        if (!term) return scoped;
        const prune = (nodes: CategoryNode[]): CategoryNode[] => nodes.flatMap(node => {
            const children = prune(node.children);
            const selfMatches = node.name.toLowerCase().includes(term);
            return selfMatches || children.length > 0 ? [{ ...node, children: selfMatches ? node.children : children }] : [];
        });
        return prune(scoped);
    }, [tree, treeFilter, hasScopingFilter]);

    // Debounce the free-text search so every keystroke doesn't fire a request.
    useEffect(() => {
        const handle = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
        return () => clearTimeout(handle);
    }, [searchInput]);

    // A search term switches the page from "one category" to "the whole catalog"; the tree selection is
    // kept so clearing the search drops the user back where they were.
    const searchMode = searchTerm.length > 0;

    // ── streamed rows ────────────────────────────────────────────────────────
    const [rows, setRows] = useState<CatalogSettingSummary[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [streaming, setStreaming] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [tablePage, setTablePage] = useState(1);
    // Only the newest stream may touch state: a superseded one that finishes late must not flip
    // "streaming" off or write stale rows while its replacement is still running.
    const streamRunRef = useRef(0);

    // ── expand/collapse ──────────────────────────────────────────────────────
    // DataTable's expandedRowRender has no built-in open/closed state of its own — whatever it
    // returns renders under EVERY row, unconditionally. That "collapsed by default, click to see
    // the rest" behavior has to be owned here: nothing is expanded until a row is clicked, and
    // more than one row can be open at once (useful for comparing two settings side by side).
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    // ── expanded row detail cache ────────────────────────────────────────────
    const [detailById, setDetailById] = useState<Record<string, CatalogSettingDetail | undefined>>({});
    const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});

    // ── history dialog ───────────────────────────────────────────────────────
    const [historyOpenFor, setHistoryOpenFor] = useState<CatalogSettingSummary | null>(null);
    const [historyEntries, setHistoryEntries] = useState<SettingHistoryEntry[] | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    // The category tree's counts follow the platform/deprecated filters (a few hundred rows, one
    // grouped query server-side), so they reload whenever those change.
    // The latest snapshot is filter-independent and only reloads after a harvest.
    useEffect(() => {
        (async () => {
            const scope = new URLSearchParams();
            if (platform) scope.append('platforms', platform);
            if (deprecatedOnly) scope.append('lifecycleStatuses', 'Deprecated');
            if (usedInTenantOnly) scope.append('usedInTenant', 'true');
            const scopeQuery = scope.toString();

            // One after the other (never Promise.all on one hook), and a superseded run — a filter
            // change, or React Strict Mode's double effect — writes nothing: its aborted request
            // comes back undefined, which is not "the catalog has no categories".
            const run = ++categoryRunRef.current;
            const categoriesResponse = await categoryRequest<ApiEnvelope<CatalogSettingCategory[]>>(`${SETTINGS_LIBRARY_CATEGORIES_ENDPOINT}${scopeQuery ? `?${scopeQuery}` : ''}`);
            if (run !== categoryRunRef.current || !categoriesResponse) return;
            setCategories(categoriesResponse.data?.data ?? []);
            setCategoriesLoaded(true);
            const uncategorizedResponse = await categoryRequest<ApiEnvelope<CatalogSettingSummary[]>>(`${SETTINGS_LIBRARY_SETTINGS_ENDPOINT}?uncategorized=true&page=1&pageSize=1${scopeQuery ? `&${scopeQuery}` : ''}`);
            if (run !== categoryRunRef.current || !uncategorizedResponse) return;
            setUncategorizedCount(Number(uncategorizedResponse.data?.meta?.totalCount ?? 0));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usageVersion, platform, deprecatedOnly, usedInTenantOnly]);

    // The tenant usage summary drives the header line and the "in use" chip; reloads after a harvest.
    useEffect(() => {
        (async () => {
            const response = await usageRequest<ApiEnvelope<TenantSettingUsageSummary | null>>(SETTINGS_LIBRARY_TENANT_USAGE_SUMMARY_ENDPOINT);
            if (!response) return; // superseded
            const summary = response.data?.data ?? null;
            setUsageSummary(summary);
            if (summary?.harvestedAt) {
                const impact = await usageRequest<ApiEnvelope<TenantSettingImpact>>(SETTINGS_LIBRARY_TENANT_IMPACT_ENDPOINT);
                if (!impact) return;
                setImpactCounts(impact?.data?.data?.countsByRule ?? null);
            } else {
                setImpactCounts(null);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usageVersion]);

    // Bill of materials download: the API answers with the file body; apiRequest hands non-JSON back as text.
    const [exporting, setExporting] = useState<'csv' | 'markdown' | null>(null);
    const runExport = useCallback(async (format: 'csv' | 'markdown') => {
        setExporting(format);
        try {
            const response = await request<string>(`${SETTINGS_LIBRARY_TENANT_USAGE_EXPORT_ENDPOINT}?format=${format}`);
            const body = response?.data;
            if (typeof body !== 'string' || body.length === 0) return;
            const blob = new Blob([body], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `settings-bill-of-materials.${format === 'csv' ? 'csv' : 'md'}`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(null);
        }
    }, [request]);

    const returnToImpactRef = useRef(false);
    const runHarvest = useCallback(async () => {
        setHarvesting(true);
        setHarvestProgress(null);
        setHarvestResult(null);
        try {
            const outcome = await harvestStream(SETTINGS_LIBRARY_TENANT_USAGE_HARVEST_STREAM_ENDPOINT, (message) => {
                switch (message.event) {
                    case 'progress':
                        setHarvestProgress(JSON.parse(message.data) as UsageHarvestProgress);
                        break;
                    case 'complete': {
                        const done = JSON.parse(message.data) as UsageHarvestComplete;
                        const failed = done.failedPolicyCount > 0 ? ` ${done.failedPolicyCount} policies could not be read and are missing from this harvest.` : '';
                        setHarvestResult({
                            ok: true,
                            message: `Harvested ${done.policyCount.toLocaleString()} policies: ${done.settingCount.toLocaleString()} distinct settings in use (${done.usageCount.toLocaleString()} occurrences).${failed}`,
                        });
                        setUsageVersion(v => v + 1);
                        // Started from the impact page's "Harvest again": take the reader back to it.
                        if (returnToImpactRef.current) { returnToImpactRef.current = false; window.location.assign('/settings-library/impact'); }
                        break;
                    }
                    case 'skipped':
                        setHarvestResult({ ok: false, message: 'A harvest is already running for this tenant. Try again in a moment.' });
                        break;
                    case 'error': {
                        const payload = JSON.parse(message.data) as { message?: string; details?: string };
                        setHarvestResult({ ok: false, message: payload.details ? `${payload.message} ${payload.details}` : (payload.message ?? 'The harvest failed.') });
                        break;
                    }
                    default:
                        break;
                }
            });
            if (outcome === 'consent-required' || outcome === 'session-expired') {
                setHarvestResult({ ok: false, message: 'Sign in again (or grant consent) to harvest tenant usage.' });
            }
        } catch (err) {
            setHarvestResult({ ok: false, message: err instanceof Error ? err.message : 'The harvest failed.' });
        } finally {
            setHarvesting(false);
            setHarvestProgress(null);
        }
    }, [harvestStream]);

    useEffect(() => () => cancelHarvest(), [cancelHarvest]);

    // /settings-library?harvest=1[&return=impact] — other pages' "Harvest again" buttons land here,
    // because the harvest stream and its progress live on this page. Runs once, then cleans the URL.
    const autoHarvestRef = useRef(false);
    useEffect(() => {
        if (autoHarvestRef.current) return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('harvest') !== '1') return;
        autoHarvestRef.current = true;
        returnToImpactRef.current = params.get('return') === 'impact';
        window.history.replaceState(null, '', window.location.pathname);
        runHarvest();
    }, [runHarvest]);

    useEffect(() => {
        (async () => {
            const response = await snapshotRequest<ApiEnvelope<CatalogSnapshot[]>>(`${SETTINGS_LIBRARY_SNAPSHOTS_ENDPOINT}?page=1&pageSize=1`);
            if (!response) return; // superseded
            setLatestSnapshot(response.data?.data?.[0] ?? null);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usageVersion]);

    // First root category is selected by default, so the page never opens on an empty panel.
    useEffect(() => {
        if (categoriesLoaded && selectedCategoryId === null) {
            setSelectedCategoryId(tree[0]?.id ?? (uncategorizedCount > 0 ? UNCATEGORIZED : null));
        }
    }, [categoriesLoaded, tree, uncategorizedCount, selectedCategoryId]);

    const selectedNode = useMemo(
        () => (selectedCategoryId && selectedCategoryId !== UNCATEGORIZED ? findNode(tree, selectedCategoryId) : null),
        [tree, selectedCategoryId]
    );

    const startStream = useCallback(async () => {
        if (!searchMode && selectedCategoryId === null) return; // nothing to show yet

        const runId = ++streamRunRef.current;
        const isCurrent = () => streamRunRef.current === runId;

        const params = new URLSearchParams();
        if (searchMode) params.set('search', searchTerm);
        if (platform) params.append('platforms', platform);
        if (deprecatedOnly) params.append('lifecycleStatuses', 'Deprecated');
        if (usedInTenantOnly) params.set('usedInTenant', 'true');
        if (!searchMode) {
            if (selectedCategoryId === UNCATEGORIZED) {
                params.set('uncategorized', 'true');
            } else if (selectedNode) {
                // A parent category shows its whole subtree — its own settings plus every descendant's.
                // The server expands the subtree: sending every descendant id here (Administrative
                // Templates has ~330) made the URL long enough to fail with an HTTP/2 protocol error.
                params.append('categoryIds', selectedNode.id);
                params.set('includeDescendants', 'true');
            }
        }

        setRows([]);
        setLoaded(0);
        setTotalCount(0);
        setTablePage(1);
        setStreamError(null);
        setStreaming(true);

        try {
            const outcome = await stream(`${SETTINGS_LIBRARY_SETTINGS_STREAM_ENDPOINT}?${params.toString()}`, (message) => {
                if (!isCurrent()) return;
                switch (message.event) {
                    case 'connected': {
                        const payload = JSON.parse(message.data) as CatalogStreamConnected;
                        setTotalCount(payload.totalCount);
                        break;
                    }
                    case 'chunk': {
                        const payload = JSON.parse(message.data) as CatalogStreamChunk;
                        setRows(prev => [...prev, ...payload.items]);
                        setLoaded(payload.loaded);
                        setTotalCount(payload.totalCount);
                        break;
                    }
                    case 'error': {
                        const payload = JSON.parse(message.data) as { message?: string };
                        setStreamError(payload.message ?? 'Failed to load settings.');
                        break;
                    }
                    default:
                        break;
                }
            });
            if (outcome === 'consent-required' || outcome === 'session-expired') {
                if (isCurrent()) setStreamError('Sign in again to load the settings catalog.');
            }
        } catch (err) {
            if (isCurrent()) setStreamError(err instanceof Error ? err.message : 'Failed to load settings.');
        } finally {
            if (isCurrent()) setStreaming(false);
        }
    }, [stream, searchMode, searchTerm, platform, deprecatedOnly, usedInTenantOnly, selectedCategoryId, selectedNode]);

    // Any filter or selection change (or a fresh harvest) restarts the stream from scratch —
    // never appends onto a stale set.
    useEffect(() => {
        startStream();
    }, [startStream, usageVersion]);

    // Leaving the page cancels whatever is still streaming.
    useEffect(() => () => cancel(), [cancel]);

    const loadDetail = useCallback(async (id: string) => {
        if (detailById[id] || detailLoading[id]) return;

        setDetailLoading(prev => ({ ...prev, [id]: true }));
        try {
            const response = await request<ApiEnvelope<CatalogSettingDetail>>(
                SETTINGS_LIBRARY_SETTING_DETAIL_ENDPOINT(id)
            );
            if (response?.data?.data) {
                setDetailById(prev => ({ ...prev, [id]: response.data.data }));
            }
        } finally {
            setDetailLoading(prev => ({ ...prev, [id]: false }));
        }
    }, [request, detailById, detailLoading]);

    const openHistory = useCallback(async (setting: CatalogSettingSummary) => {
        setHistoryOpenFor(setting);
        setHistoryEntries(null);
        setHistoryLoading(true);
        try {
            const response = await request<ApiEnvelope<SettingHistoryEntry[]>>(
                SETTINGS_LIBRARY_SETTING_HISTORY_ENDPOINT(setting.id)
            );
            setHistoryEntries(response?.data?.data ?? []);
        } finally {
            setHistoryLoading(false);
        }
    }, [request]);

    const selectCategory = useCallback((id: string) => {
        setSelectedCategoryId(id);
        setExpandedIds(new Set());
    }, []);

    const toggleCategory = useCallback((id: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    // Brief, always-relevant columns only. In search mode the category column comes back, since
    // results span the whole catalog; inside one category it would repeat the panel title on every row.
    const columns = useMemo(() => [
        {
            key: 'displayName',
            label: 'Setting',
            sortable: true,
            render: (_: unknown, row: Record<string, unknown>) => {
                const setting = row as unknown as CatalogSettingSummary;
                const isOpen = expandedIds.has(setting.id);
                return (
                    <div className="flex items-start gap-2">
                        {isOpen
                            ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                            : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}
                        <div className="flex flex-col min-w-0">
                            <Link
                                href={`/settings-library/settings/${setting.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-medium hover:underline w-fit"
                            >
                                {setting.displayName || setting.name || setting.graphDefinitionId}
                                {(setting.tenantPolicyCount ?? 0) > 0 && (
                                    <Badge className="ml-2 align-middle text-[11px] bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-normal">
                                        <Building2 className="h-3 w-3" /> In use · {setting.tenantPolicyCount} {setting.tenantPolicyCount === 1 ? 'policy' : 'policies'}
                                    </Badge>
                                )}
                            </Link>
                            {/* Description beats the raw definition id here — some settings (deeply
                                nested ADMX child/label rows, mainly) have no DisplayName at all in
                                Graph's own data, so a short description snippet gives far more
                                context at a glance than a technical id would. */}
                            <span className="text-xs text-muted-foreground truncate max-w-[420px]">
                                {setting.description || setting.graphDefinitionId}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        ...(searchMode ? [{
            key: 'categoryId',
            label: 'Category',
            sortable: true,
            // Sort by the resolved display name, not the raw categoryId GUID — otherwise "sorted"
            // would alphabetize by an id the user never sees.
            sortValue: (row: Record<string, unknown>) => {
                const categoryId = row.categoryId as string | null;
                return (categoryId ? categoryNameById.get(categoryId) : undefined) ?? categoryId ?? '';
            },
            render: (value: unknown) => {
                const categoryId = value as string | null;
                if (!categoryId) return <span className="text-muted-foreground text-xs">—</span>;
                const name = categoryNameById.get(categoryId);
                return (
                    <span className="text-sm truncate max-w-[160px] inline-block" title={name ?? categoryId}>
                        {name ?? categoryId}
                    </span>
                );
            },
        }] : []),
        {
            key: 'scope',
            label: 'Scope',
            render: (value: unknown) => scopeBadge(value as 'device' | 'user' | null),
        },
        {
            key: 'odataType',
            label: 'Type',
            sortable: true,
            sortValue: (row: Record<string, unknown>) => settingTypeLabel(row.odataType as string | null) ?? '',
            render: (value: unknown) => {
                const label = settingTypeLabel(value as string | null);
                return label ? <Badge variant="secondary" className="text-xs">{label}</Badge> : <span className="text-muted-foreground text-xs">—</span>;
            },
        },
        {
            key: 'platforms',
            label: 'Platform',
            render: (_: unknown, row: Record<string, unknown>) => {
                const setting = row as unknown as CatalogSettingSummary;
                return (
                    <div className="flex flex-wrap gap-1">
                        {setting.platforms.map(p => (
                            <Badge key={p} variant="outline" className="text-xs">{PLATFORM_LABELS[p] ?? p}</Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            key: 'lifecycleStatus',
            label: 'Status',
            render: (value: unknown) => lifecycleBadge(value as LifecycleStatus),
        },
        {
            key: 'revisionCount',
            label: 'Revisions',
            sortable: true,
            render: (value: unknown, row: Record<string, unknown>) => {
                const setting = row as unknown as CatalogSettingSummary;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2"
                        onClick={(e) => { e.stopPropagation(); openHistory(setting); }}
                    >
                        <History className="h-3.5 w-3.5" />
                        {String(value)}
                    </Button>
                );
            },
        },
    ], [openHistory, expandedIds, categoryNameById, searchMode]);

    const expandedRowRender = useCallback((row: Record<string, unknown>) => {
        const setting = row as unknown as CatalogSettingSummary;

        // The core fix: nothing renders for a row unless it's actually been opened. Without this
        // guard, DataTable would show this content under every single row at once.
        if (!expandedIds.has(setting.id)) return null;

        const detail = detailById[setting.id];
        const isLoading = detailLoading[setting.id];

        // The fetch itself is kicked off from the onRowClick handler below, not here — this
        // function runs during DataTable's render, and calling a state setter (which loadDetail
        // does) from inside another component's render phase is what React was flagging.
        if (isLoading || !detail) {
            return (
                <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading setting details…
                </div>
            );
        }

        const revision = detail.currentRevision;
        if (!revision) {
            return <div className="p-6 text-sm text-muted-foreground">No revision data available.</div>;
        }

        const categoryName = revision.categoryId
            ? categoryNameById.get(revision.categoryId) ?? revision.categoryId
            : null;

        const hasApplicabilityExtras = revision.visibility === 'template'
            || revision.minimumSupportedVersion || revision.maximumSupportedVersion
            || revision.windowsSkus.length > 0 || revision.requiresAzureAd;

        return (
            <div className="p-6 space-y-5 bg-muted/30">
                {/* ── Platform / technology at a glance, then what it does ── */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {revision.platforms.map(p => (
                        <Badge key={p} variant="outline" className="text-xs gap-1"><Monitor className="h-3 w-3" /> {PLATFORM_LABELS[p] ?? p}</Badge>
                    ))}
                    {revision.technologies.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs uppercase">{t}</Badge>
                    ))}
                    {(revision.rootDefinitionId && revision.rootDefinitionId !== setting.graphDefinitionId) && (
                        <Link href={settingHref(revision.rootDefinitionId)} onClick={(e) => e.stopPropagation()} className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1">
                            <ListTree className="h-3 w-3" /> part of <span className="font-mono">{revision.rootDefinitionId}</span>
                        </Link>
                    )}
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                        <Link href={graphHref(setting.id)}><Share2 className="h-3.5 w-3.5" /> Dependency web</Link>
                    </Button>
                </div>

                {(revision.description || revision.helpText) && (
                    <div className="space-y-2">
                        {revision.description && (
                            <p className="text-sm leading-relaxed">{revision.description}</p>
                        )}
                        {revision.helpText && (
                            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-muted-foreground/30 pl-3">
                                {revision.helpText}
                            </p>
                        )}
                    </div>
                )}

                {/* ── Options first when there are any — "what can I set this to" is the usual question ── */}
                {revision.options && revision.options.length > 0 && (
                    <div>
                        <SectionHeader icon={ListTree} title={`Options (${revision.options.length})`} />
                        <div className="space-y-1.5">
                            {revision.options.map(option => {
                                const isDefault = option.itemId === revision.defaultOptionId;
                                return (
                                    <div
                                        key={option.itemId}
                                        className={`rounded-md border p-2.5 text-sm ${isDefault ? 'border-primary/40 bg-primary/5' : 'bg-background'}`}
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">{option.displayName || option.name}</span>
                                            {isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                                            {option.isTemplated && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Layers className="h-3 w-3" /> Templated
                                                </Badge>
                                            )}
                                        </div>
                                        {option.description && (
                                            <p className="text-muted-foreground mt-1">{option.description}</p>
                                        )}
                                        {option.dependentOn.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-1">
                                                <span>Requires:</span>
                                                {option.dependentOn.map(d => d.parentSettingId).filter((id): id is string => !!id).map(id => (
                                                    <Link key={id} href={settingHref(id)} onClick={(e) => e.stopPropagation()} className="font-mono hover:underline text-foreground">{id}</Link>
                                                ))}
                                            </p>
                                        )}
                                        {option.dependedOnBy.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-1">
                                                <span>Enables:</span>
                                                {option.dependedOnBy.map(d => d.childSettingId).filter((id): id is string => !!id).map(id => (
                                                    <Link key={id} href={settingHref(id)} onClick={(e) => e.stopPropagation()} className="font-mono hover:underline text-foreground">{id}</Link>
                                                ))}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── At a glance — category, CSP path, type, occurrence, risk ── */}
                <div>
                    <SectionHeader icon={Info} title="Details" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                        <Field label="Category" value={categoryName} />
                        {revision.scope && (
                            <div>
                                <FieldLabel>Scope</FieldLabel>
                                <div>{scopeBadge(revision.scope)}</div>
                            </div>
                        )}
                        <Field label="CSP Path" value={revision.baseUri || revision.offsetUri ? `${revision.baseUri}${revision.offsetUri}` : null} mono />
                        <Field label="Type" value={settingTypeLabel(revision.odataType) ?? revision.uxBehavior} />
                        <Field
                            label="Occurrence"
                            value={revision.minDeviceOccurrence != null || revision.maxDeviceOccurrence != null
                                ? `${revision.minDeviceOccurrence === 0 ? 'Optional' : 'Required'} · up to ${revision.maxDeviceOccurrence ?? '∞'}`
                                : null}
                        />
                        <Field label="Risk Level" value={revision.riskLevel} capitalize />
                    </div>
                </div>

                {/* ── Applicability — only shown when there's something platform-specific to say ── */}
                {hasApplicabilityExtras && (
                    <div>
                        <SectionHeader icon={ShieldCheck} title="Applicability" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                            {revision.visibility === 'template' && (
                                <div>
                                    <FieldLabel>Template</FieldLabel>
                                    <Badge variant="outline" className="gap-1"><Layers className="h-3 w-3" /> Settings Catalog Template</Badge>
                                </div>
                            )}
                            {(revision.minimumSupportedVersion || revision.maximumSupportedVersion) && (
                                <Field
                                    label="Windows Version"
                                    value={`${revision.minimumSupportedVersion ?? '*'} – ${revision.maximumSupportedVersion ?? 'latest'}`}
                                />
                            )}
                            {revision.windowsSkus.length > 0 && (
                                <div className="col-span-2">
                                    <FieldLabel>Available on</FieldLabel>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {revision.windowsSkus.map(sku => (
                                            <Badge key={sku} variant="outline" className="text-xs">{sku}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {revision.requiresAzureAd && (
                                <Field label="Requires Azure AD" value={revision.requiredAzureAdTrustType || 'Yes'} />
                            )}
                        </div>
                    </div>
                )}

                {/* ── Search & docs — smaller, secondary reference info ── */}
                {(revision.keywords.length > 0 || revision.infoUrls.length > 0 || revision.referredSettingDefinitionIds.length > 0) && (
                    <div>
                        <SectionHeader icon={LinkIcon} title="Search & Docs" />
                        <div className="space-y-3 text-sm">
                            {revision.infoUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {revision.infoUrls.map(url => (
                                        <a
                                            key={url}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                                        >
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                            {url.includes('learn.microsoft.com') || url.includes('docs.microsoft.com') ? 'MS Learn' : new URL(url).hostname}
                                        </a>
                                    ))}
                                </div>
                            )}
                            {revision.keywords.length > 0 && (
                                <div>
                                    <FieldLabel>Keywords</FieldLabel>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {revision.keywords.map(k => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}
                                    </div>
                                </div>
                            )}
                            {revision.referredSettingDefinitionIds.length > 0 && (
                                <div>
                                    <FieldLabel>Referenced Settings</FieldLabel>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {revision.referredSettingDefinitionIds.map(id => (
                                            <Link key={id} href={settingHref(id)} onClick={(e) => e.stopPropagation()} className="font-mono text-xs hover:underline w-fit">{id}</Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }, [expandedIds, detailById, detailLoading, categoryNameById]);

    const tableRows = rows as unknown as Record<string, unknown>[];
    const panelTitle = searchMode
        ? `Results for “${searchTerm}”`
        : selectedCategoryId === UNCATEGORIZED
            ? 'Uncategorized'
            : selectedNode?.name ?? 'Settings';
    const progressPercent = totalCount > 0 ? Math.min(100, Math.round((loaded / totalCount) * 100)) : 0;

    return (
        <div className="space-y-6 p-6">
            <SettingsLibraryHero />

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Layers className="h-6 w-6" /> Browse the Catalog
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {/* The catalog total comes from the latest snapshot, so it stays put while the tree's counts follow the filters. */}
                        {latestSnapshot
                            ? `${latestSnapshot.definitionCount.toLocaleString()} settings available · Last updated ${formatDate(latestSnapshot.completedAt ?? latestSnapshot.capturedAt)}`
                            : 'Every Microsoft Intune Settings Catalog definition'}
                        {hasScopingFilter && ` · ${filteredTotal.toLocaleString()} match the current filter`}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {usageSummary === undefined
                            ? 'Checking your tenant…'
                            : usageSummary?.harvestedAt
                                ? `Your tenant: ${usageSummary.settingCount.toLocaleString()} settings in use across ${usageSummary.policyCount.toLocaleString()} policies · harvested ${formatDate(usageSummary.harvestedAt)}`
                                : 'Tenant usage not harvested yet — harvest to see which settings your policies use.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {usageSummary?.harvestedAt && (
                        <>
                            <Button onClick={() => runExport('csv')} disabled={exporting !== null} variant="outline" className="gap-1.5" title="Every configured setting with value, policy, assignment, lifecycle, replacement and baseline recommendation">
                                {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV
                            </Button>
                            <Button onClick={() => runExport('markdown')} disabled={exporting !== null} variant="outline" className="gap-1.5">
                                {exporting === 'markdown' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Markdown
                            </Button>
                        </>
                    )}
                    <Button onClick={runHarvest} disabled={harvesting} variant="outline" className="gap-1.5">
                        {harvesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                        {harvesting ? 'Harvesting…' : 'Harvest tenant usage'}
                    </Button>
                </div>
            </div>

            {harvesting && (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{harvestProgress ? `Reading policy settings… ${harvestProgress.processed} / ${harvestProgress.total} policies` : 'Listing your policies…'}</span>
                        {harvestProgress && <span>{harvestProgress.usageSoFar.toLocaleString()} settings found</span>}
                    </div>
                    <div className="h-1.5 w-full rounded bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${harvestProgress && harvestProgress.total > 0 ? Math.round((harvestProgress.processed / harvestProgress.total) * 100) : 5}%` }}
                        />
                    </div>
                </div>
            )}

            {impactCounts && Object.values(impactCounts).some(n => (n ?? 0) > 0) && (() => {
                const total = Object.values(impactCounts).reduce((sum, n) => sum + (n ?? 0), 0);
                const lifecycle = (impactCounts['deprecated-in-use'] ?? 0) + (impactCounts['removed-in-use'] ?? 0) + (impactCounts['possibly-removed-in-use'] ?? 0);
                return (
                    <Link href="/settings-library/impact" className="flex items-center gap-2 text-sm rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 p-3 hover:bg-amber-500/15">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>
                            <span className="font-medium">{total} {total === 1 ? 'finding' : 'findings'} for your tenant</span>
                            {lifecycle > 0 && ` — ${lifecycle} deprecated or removed ${lifecycle === 1 ? 'setting' : 'settings'} still in your policies`}
                            {(impactCounts['unassigned-policy'] ?? 0) > 0 && ` · ${impactCounts['unassigned-policy']} unassigned ${impactCounts['unassigned-policy'] === 1 ? 'policy' : 'policies'}`}
                            {(impactCounts['min-version-unmet'] ?? 0) > 0 && ` · ${impactCounts['min-version-unmet']} below the minimum build`}
                        </span>
                        <ChevronRight className="h-4 w-4 ml-auto shrink-0" />
                    </Link>
                );
            })()}

            {harvestResult && (
                <div className={`flex items-center gap-2 text-sm rounded-md border p-3 ${
                    harvestResult.ok
                        ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
                }`}>
                    {harvestResult.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                    {harvestResult.message}
                </div>
            )}

            {/* ── Search + platform chips: the two filters that apply to whatever is shown below ── */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search the whole catalog by name, description, keyword, or CSP path…"
                        className="pl-9"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground mr-1">Platform</span>
                    <Button variant={platform === null ? 'default' : 'outline'} size="sm" className="h-7" onClick={() => setPlatform(null)}>
                        All
                    </Button>
                    {platformOptions.map(p => (
                        <Button
                            key={p}
                            variant={platform === p ? 'default' : 'outline'}
                            size="sm"
                            className="h-7"
                            onClick={() => setPlatform(prev => prev === p ? null : p)}
                        >
                            {PLATFORM_LABELS[p] ?? p}
                        </Button>
                    ))}
                    <span className="mx-1 h-4 border-l" />
                    <span title={usageSummary?.harvestedAt ? undefined : 'Harvest tenant usage first'}>
                        <Button
                            variant={usedInTenantOnly ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 gap-1"
                            disabled={!usageSummary?.harvestedAt}
                            onClick={() => setUsedInTenantOnly(v => !v)}
                        >
                            <Building2 className="h-3 w-3" /> Only settings my tenant uses
                        </Button>
                    </span>
                    <Button
                        variant={deprecatedOnly ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 gap-1"
                        onClick={() => setDeprecatedOnly(v => !v)}
                    >
                        <AlertTriangle className="h-3 w-3" /> Deprecated
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5 items-start">
                {/* ── Browse by category ── */}
                <Card className={searchMode ? 'opacity-60' : ''}>
                    <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <FolderTree className="h-3.5 w-3.5" /> Browse by category
                        </div>
                        <Input
                            value={treeFilter}
                            onChange={e => setTreeFilter(e.target.value)}
                            placeholder="Filter categories…"
                            className="h-8 text-sm"
                        />
                        <div className="max-h-[65vh] overflow-y-auto -mx-1 pr-1">
                            {!categoriesLoaded && (
                                <div className="text-sm text-muted-foreground px-2 py-3 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
                                </div>
                            )}
                            {categoriesLoaded && visibleTree.length === 0 && (
                                <div className="text-sm text-muted-foreground px-2 py-3">No categories match.</div>
                            )}
                            {visibleTree.map(node => (
                                <CategoryTreeItem
                                    key={node.id}
                                    node={node}
                                    depth={0}
                                    selectedId={searchMode ? null : selectedCategoryId}
                                    expanded={expandedCategories}
                                    onSelect={selectCategory}
                                    onToggle={toggleCategory}
                                />
                            ))}
                            {categoriesLoaded && uncategorizedCount > 0 && !treeFilter && (
                                <div
                                    className={`flex items-center gap-1 rounded-md px-2 py-1 mt-1 text-sm cursor-pointer border-t pt-2 ${
                                        selectedCategoryId === UNCATEGORIZED && !searchMode ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60'
                                    }`}
                                    onClick={() => selectCategory(UNCATEGORIZED)}
                                >
                                    <span className="w-[18px] shrink-0" />
                                    <span className="flex-1 text-muted-foreground">Uncategorized</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">{uncategorizedCount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── The selected category (or search results) ── */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-baseline gap-2 min-w-0">
                                <h2 className="text-base font-semibold truncate">{panelTitle}</h2>
                                {totalCount > 0 && (
                                    <span className="text-sm text-muted-foreground shrink-0">
                                        ({totalCount.toLocaleString()} setting{totalCount === 1 ? '' : 's'})
                                    </span>
                                )}
                            </div>
                            {streaming && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    {totalCount > 0 ? `Loading ${loaded.toLocaleString()} of ${totalCount.toLocaleString()}…` : 'Loading…'}
                                </span>
                            )}
                        </div>

                        {/* Thin progress bar while the category streams in; the rows below are usable immediately. */}
                        {streaming && totalCount > 0 && (
                            <div className="h-1 w-full rounded bg-muted overflow-hidden">
                                <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${progressPercent}%` }} />
                            </div>
                        )}

                        {streamError && (
                            <div className="flex items-center gap-2 text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 p-3">
                                <XCircle className="h-4 w-4 shrink-0" /> {streamError}
                            </div>
                        )}

                        {rows.length > 0 && (
                            <DataTable
                                data={tableRows}
                                columns={columns}
                                expandedRowRender={expandedRowRender}
                                onRowClick={(row) => {
                                    const id = (row as unknown as CatalogSettingSummary).id;
                                    // Kick off the detail fetch here, in the click handler — never inside
                                    // expandedRowRender, which runs during DataTable's own render phase.
                                    // Calling a state setter from there is exactly the "Cannot update a
                                    // component while rendering a different component" violation.
                                    if (!expandedIds.has(id)) loadDetail(id);
                                    toggleExpand(id);
                                }}
                                showPagination
                                showSearch={false}
                                currentPage={tablePage}
                                itemsPerPage={TABLE_PAGE_SIZE}
                                onPageChange={setTablePage}
                            />
                        )}

                        {!streaming && !streamError && rows.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                {searchMode
                                    ? 'No settings match your search.'
                                    : selectedCategoryId === null
                                        ? 'Pick a category to browse its settings.'
                                        : platform || deprecatedOnly || usedInTenantOnly
                                            ? `No ${deprecatedOnly ? 'deprecated ' : ''}settings${usedInTenantOnly ? ' your tenant uses' : ''} in this category${platform ? ` for ${PLATFORM_LABELS[platform] ?? platform}` : ''}.`
                                            : 'This category has no settings.'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={historyOpenFor !== null} onOpenChange={(open) => { if (!open) setHistoryOpenFor(null); }}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            {historyOpenFor?.displayName || historyOpenFor?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Full revision history — oldest first, with what changed at each step.
                        </DialogDescription>
                    </DialogHeader>

                    {historyLoading && <div className="text-sm text-muted-foreground py-4">Loading history…</div>}

                    {!historyLoading && historyEntries && historyEntries.length === 0 && (
                        <div className="text-sm text-muted-foreground py-4">No history recorded yet.</div>
                    )}

                    {!historyLoading && historyEntries && historyEntries.length > 0 && (
                        <div className="space-y-3">
                            {historyEntries.map((entry, idx) => (
                                <div key={entry.revision?.id ?? `${idx}-${entry.occurredAt}`} className="rounded-md border p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">
                                                {entry.revision ? `Revision ${entry.revision.revisionNumber}` : entry.change.changeType}
                                            </Badge>
                                            {!entry.revision && (
                                                <span className="text-xs text-muted-foreground">
                                                    {entry.change.category} · {entry.change.importance} importance
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {formatDate(entry.revision?.observedAt ?? entry.occurredAt)}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
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
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
