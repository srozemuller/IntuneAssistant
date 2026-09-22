// lib/settingsExplorer.ts
// Task explorer shapes — mirrors IntuneAssistant.Dto.Response.SettingsLibrary.SettingsExplorerDtos.

import type { DependencyKind } from '@/lib/settingsLibraryGraph';

export type LifecycleStatus = 'Active' | 'Deprecated' | 'PossiblyRemoved' | 'Removed';

export interface ExploreTemplateRef {
    familyId: string;
    displayName: string;
    templateFamily: string;
    recommendedValue: string | null;
}

export interface ExploreHit {
    settingId: string;
    definitionId: string;
    displayName: string | null;
    description: string | null;
    platforms: string[];
    scope: 'device' | 'user' | null;
    lifecycleStatus: LifecycleStatus;
    hasReplacementCandidate: boolean;
    needsFirstCount: number;
    unlocksCount: number;
    templates: ExploreTemplateRef[];
    tenantPolicyCount: number | null;
    score: number;
}

export interface ExploreArea {
    categoryId: string;
    name: string;
    rootCategoryId: string | null;
    rootName: string | null;
    platforms: string[];
    matchCount: number;
    inUseCount: number;
    settings: ExploreHit[];
}

export interface ExploreTemplate {
    familyId: string;
    displayName: string;
    templateFamily: string;
    platforms: string | null;
    displayVersion: string | null;
    totalSettings: number;
    matchingSettings: number;
    inUseCount: number;
}

export interface ExploreRedirect {
    key: string;
    title: string;
    description: string;
    learnUrl: string | null;
    catalogQuery: string | null;
}

export interface ExploreResult {
    query: string;
    platform: string | null;
    template: ExploreTemplate | null;
    totalMatches: number;
    truncated: boolean;
    hasTenantUsage: boolean;
    areas: ExploreArea[];
    templates: ExploreTemplate[];
    redirects: ExploreRedirect[];
}

export interface ContextItem {
    settingId: string | null;
    definitionId: string;
    displayName: string | null;
    categoryName: string | null;
    platforms: string[];
    lifecycleStatus: LifecycleStatus | null;
    reason: string;
    kind: DependencyKind | null;
    isRequired: boolean | null;
    recommendedValue: string | null;
    tenantPolicyCount: number | null;
}

export interface ContextGroup {
    kind: 'template' | 'related' | 'area';
    id: string;
    name: string;
    templateFamily: string | null;
    displayVersion: string | null;
    description: string;
    totalSettings: number;
    recommendedValue: string | null;
    settings: ContextItem[];
}

export interface ContextWarning {
    code: string;
    title: string;
    detail: string;
    settings: ContextItem[];
}

export interface SettingContext {
    settingId: string;
    definitionId: string;
    displayName: string | null;
    categoryId: string | null;
    categoryName: string | null;
    platforms: string[];
    lifecycleStatus: LifecycleStatus;
    hasTenantUsage: boolean;
    tenantPolicyCount: number | null;
    needsFirst: ContextItem[];
    unlocks: ContextItem[];
    contains: ContextItem[];
    strongerTogether: ContextGroup[];
    watchOut: ContextWarning[];
    readMore: string[];
}

/** Microsoft's templateFamily values, in the words the Intune portal uses. */
export const TEMPLATE_FAMILY_LABEL: Record<string, string> = {
    baseline: 'Security baseline',
    endpointSecurityAntivirus: 'Endpoint security · Antivirus',
    endpointSecurityDiskEncryption: 'Endpoint security · Disk encryption',
    endpointSecurityFirewall: 'Endpoint security · Firewall',
    endpointSecurityEndpointDetectionAndResponse: 'Endpoint security · EDR',
    endpointSecurityAttackSurfaceReduction: 'Endpoint security · Attack surface reduction',
    endpointSecurityAccountProtection: 'Endpoint security · Account protection',
    endpointSecurityApplicationControl: 'Endpoint security · App control',
};

export const templateFamilyLabel = (family: string | null | undefined) =>
    family ? TEMPLATE_FAMILY_LABEL[family] ?? family : 'Template';

/** Starting points shown before the first search — one per kind of task the explorer is for. */
export const EXAMPLE_INTENTS: { label: string; query: string; platform: string }[] = [
    { label: 'Edge favorites', query: 'favorites', platform: 'windows10' },
    { label: 'Attack surface reduction', query: 'attack surface reduction', platform: 'windows10' },
    { label: 'BitLocker', query: 'bitlocker', platform: 'windows10' },
    { label: 'Hardened UNC paths', query: 'unc', platform: 'windows10' },
    { label: 'Windows Hello', query: 'windows hello', platform: 'windows10' },
    { label: 'Certificates on iOS', query: 'certificate', platform: 'iOS' },
    { label: 'FileVault on macOS', query: 'filevault', platform: 'macOS' },
    { label: 'Screen lock on Android', query: 'lock screen', platform: 'androidEnterprise' },
];

/** Overlay a session-only harvest's counts onto server results that came back without a tenant overlay. */
export function overlayCounts(result: ExploreResult, counts: Record<string, number>): ExploreResult {
    const apply = (hit: ExploreHit): ExploreHit => ({ ...hit, tenantPolicyCount: counts[hit.definitionId] ?? 0 });
    return {
        ...result,
        hasTenantUsage: true,
        areas: result.areas.map(a => {
            const settings = a.settings.map(apply);
            return { ...a, settings, inUseCount: settings.filter(s => (s.tenantPolicyCount ?? 0) > 0).length };
        }),
    };
}

export function overlayContextCounts(context: SettingContext, counts: Record<string, number>): SettingContext {
    const apply = (item: ContextItem): ContextItem => ({ ...item, tenantPolicyCount: counts[item.definitionId] ?? 0 });
    return {
        ...context,
        hasTenantUsage: true,
        tenantPolicyCount: counts[context.definitionId] ?? 0,
        needsFirst: context.needsFirst.map(apply),
        unlocks: context.unlocks.map(apply),
        contains: context.contains.map(apply),
        strongerTogether: context.strongerTogether.map(g => ({ ...g, settings: g.settings.map(apply) })),
        watchOut: context.watchOut.map(w => ({ ...w, settings: w.settings.map(apply) })),
    };
}
