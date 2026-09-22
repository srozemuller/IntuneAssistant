// lib/settingsLibraryGraph.ts
// Shared shapes and helpers for the settings dependency web. Mirrors
// IntuneAssistant.Dto.Response.SettingsLibrary.SettingDependencyGraphDto and friends.

export type DependencyKind = 'DependsOn' | 'OptionDependsOn' | 'Child' | 'PartOf' | 'Refers';

export interface GraphNodeDto {
    definitionId: string;
    settingId: string | null;
    displayName: string | null;
    categoryId: string | null;
    categoryName: string | null;
    platforms: string[];
    scope: 'device' | 'user' | null;
    odataType: string | null;
    lifecycleStatus: 'Active' | 'Deprecated' | 'PossiblyRemoved' | 'Removed' | null;
    depth: number;
}

export interface GraphEdgeDto {
    source: string;
    target: string;
    kind: DependencyKind;
    sourceOptionId: string | null;
    condition: string | null;
    isRequired: boolean | null;
}

export interface DependencyGraphDto {
    seedSettingId: string;
    seedDefinitionId: string;
    depth: number;
    truncated: boolean;
    nodes: GraphNodeDto[];
    edges: GraphEdgeDto[];
}

/** The whole catalog: every edge (optionally filtered) and every node they touch. No seed. */
export interface CatalogGraphDto {
    platform: string | null;
    kinds: DependencyKind[];
    nodeCount: number;
    edgeCount: number;
    nodes: GraphNodeDto[];
    edges: GraphEdgeDto[];
}

/** Platforms offered as filters on the whole-catalog web, largest first. */
export const WEB_PLATFORMS: { id: string; label: string }[] = [
    { id: 'windows10', label: 'Windows' },
    { id: 'macOS', label: 'macOS' },
    { id: 'iOS', label: 'iOS / iPadOS' },
    { id: 'linux', label: 'Linux' },
    { id: 'androidEnterprise', label: 'Android Enterprise' },
];

/** Plain-language meaning of each edge kind, read source → target. */
export const KIND_META: Record<DependencyKind, { label: string; sentence: string; color: string }> = {
    DependsOn:       { label: 'Depends on',        sentence: 'is only applicable when',        color: '#f59e0b' },
    OptionDependsOn: { label: 'Option depends on', sentence: 'has an option that requires',    color: '#a78bfa' },
    Child:           { label: 'Contains',          sentence: 'contains',                       color: '#22d3ee' },
    PartOf:          { label: 'Part of',           sentence: 'is part of',                     color: '#64748b' },
    Refers:          { label: 'Refers to',         sentence: 'refers to the reusable setting', color: '#34d399' },
};

/** Where a definition id can be opened: the detail route accepts either a catalog GUID or a Graph definition id. */
export function settingHref(settingIdOrDefinitionId: string) {
    return `/settings-library/settings/${encodeURIComponent(settingIdOrDefinitionId)}`;
}

export function graphHref(settingId: string) {
    return `/settings-library/settings/${settingId}/graph`;
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isGuid = (value: string) => GUID.test(value);

// ─── Scenario-level summary (mirrors SettingsGraphSummaryDto) ────────────────

export const UNCATEGORIZED_SCENARIO = '__uncategorized__';
export const EXTERNAL_SCENARIO = '__external__';

export interface GraphScenario {
    id: string;
    name: string;
    settingCount: number;
    deprecatedCount: number;
    inUseCount: number;
    deprecatedInUseCount: number;
    internalEdgeCount: number;
    hasChildren: boolean;
}

export interface GraphFlow {
    sourceId: string; sourceName: string; kind: DependencyKind; targetId: string; targetName: string; count: number;
}

export interface SettingsGraphSummary {
    platform: string | null;
    parentCategoryId: string | null;
    parentCategoryName: string | null;
    totalSettings: number;
    totalEdges: number;
    hasTenantUsage: boolean;
    scenarios: GraphScenario[];
    edgeKinds: { kind: DependencyKind; count: number }[];
    flows: GraphFlow[];
}

/** Stable, distinct colours for scenarios — same palette the 3D web uses for categories. */
export const SCENARIO_PALETTE = ['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#c084fc', '#fb7185', '#2dd4bf', '#f97316', '#a3e635', '#38bdf8', '#e879f9', '#facc15', '#f87171', '#4ade80', '#818cf8', '#fb923c'];
