// lib/settingsUsage.ts
// Shapes for the Settings Library's tenant-usage overlay. Mirrors
// IntuneAssistant.Dto.Response.SettingsUsage and the harvest SSE events.

export interface TenantSettingUsageSummary {
    tenantId: string;
    harvestedAt: string | null;
    durationMs: number;
    policyCount: number;
    settingCount: number;
    usageCount: number;
    failedPolicyCount: number;
    isHarvesting: boolean;
    startedBy: string | null;
}

export type AssignmentTargetType = 'allDevices' | 'allUsers' | 'group' | 'exclusionGroup' | 'unknown';

export interface PolicyAssignmentSummary {
    targetType: AssignmentTargetType;
    groupId: string | null;
    groupName: string | null;
    filterId: string | null;
    filterName: string | null;
    filterType: 'include' | 'exclude' | null;
}

export interface TenantSettingUsageValue {
    valueSummary: string | null;
    parentDefinitionId: string | null;
    depth: number;
}

export interface TenantSettingUsagePolicy {
    policyId: string;
    policyName: string;
    policyType: string;
    templateFamily: string | null;
    platforms: string[];
    technologies: string[];
    values: TenantSettingUsageValue[];
    isAssigned: boolean;
    assignments: PolicyAssignmentSummary[];
}

export interface TenantSettingUsageDetail {
    definitionId: string;
    harvestedAt: string | null;
    policies: TenantSettingUsagePolicy[];
}

/** SSE payloads of GET /settings-library/tenant-usage/harvest/stream, keyed by event name. */
export interface UsageHarvestProgress { processed: number; total: number; usageSoFar: number; failed: number }
export interface UsageHarvestComplete {
    harvestedAt: string; policyCount: number; settingCount: number; usageCount: number; failedPolicyCount: number; durationMs: number;
    /** False when the tenant has no Configuration Management entitlement: nothing was stored, the `result` event carried everything. */
    persisted: boolean;
}

/** Payload of the `result` event of a session-only harvest — what the stored endpoints would otherwise serve. */
export interface UsageHarvestResult {
    summary: TenantSettingUsageSummary;
    policyCountsByDefinition: Record<string, number>;
    usageByDefinition: Record<string, TenantSettingUsagePolicy[]>;
    impact: TenantSettingImpact;
}

// ─── Session-only harvest (no Configuration Management) ─────────────────────
// Kept in sessionStorage per tenant so the browse, detail and impact pages share it for the
// duration of the browser session; it never reaches the server.

const SESSION_KEY = (tenantId: string) => `ia_settings_usage_${tenantId}`;

export function saveSessionHarvest(tenantId: string, result: UsageHarvestResult) {
    try { sessionStorage.setItem(SESSION_KEY(tenantId), JSON.stringify(result)); } catch { /* quota or private mode — the page state still has it */ }
}

export function loadSessionHarvest(tenantId: string): UsageHarvestResult | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY(tenantId));
        return raw ? JSON.parse(raw) as UsageHarvestResult : null;
    } catch { return null; }
}

/** Intune's own labels for template families, for the policy-type line. */
export function policyTypeLabel(policy: Pick<TenantSettingUsagePolicy, 'policyType' | 'templateFamily'>): string {
    const family = policy.templateFamily ?? '';
    if (/^endpointSecurity/i.test(family)) return 'Endpoint security';
    if (/^baseline/i.test(family)) return 'Security baseline';
    if (/^enrollmentConfiguration/i.test(family)) return 'Enrollment configuration';
    if (/^deviceConfiguration/i.test(family)) return 'Device configuration';
    return 'Settings catalog';
}

/** Where a policy lives in the Intune admin center — assignment/edit is done there, not here. */
export function intunePolicyUrl(policyId: string): string {
    return `https://intune.microsoft.com/#view/Microsoft_Intune_Workflows/PolicySummaryBlade/policyId/${encodeURIComponent(policyId)}`;
}

// ─── Impact report ──────────────────────────────────────────────────────────

export type ImpactRuleId =
    | 'deprecated-in-use' | 'possibly-removed-in-use' | 'removed-in-use'
    | 'changed-since-harvest' | 'unassigned-policy' | 'min-version-unmet' | 'max-version-exceeded' | 'baseline-gap';

export const IMPACT_RULES: Record<ImpactRuleId, { label: string; unit: 'settings' | 'policies' | 'baselines'; blurb: string }> = {
    'removed-in-use':          { label: 'Removed, still in use',        unit: 'settings', blurb: 'Microsoft no longer publishes these; your policies still carry them.' },
    'possibly-removed-in-use': { label: 'Missing from the catalog',     unit: 'settings', blurb: 'Absent from recent catalog collections — likely being removed.' },
    'deprecated-in-use':       { label: 'Deprecated, still in use',     unit: 'settings', blurb: 'Still applied today, but Microsoft will stop supporting them.' },
    'changed-since-harvest':   { label: 'Changed since your harvest',   unit: 'settings', blurb: 'Microsoft changed these after you last harvested.' },
    'unassigned-policy':       { label: 'Not assigned',                 unit: 'policies', blurb: 'Configured settings that reach no device or user.' },
    'min-version-unmet':       { label: 'Need a newer Windows build',   unit: 'settings', blurb: 'Some of your devices run a build below what these settings require.' },
    'max-version-exceeded':    { label: 'Past their last Windows build', unit: 'settings', blurb: 'Some of your devices run a build above what these settings support.' },
    'baseline-gap':            { label: 'Baselines not fully applied',   unit: 'baselines', blurb: "Microsoft security baselines with settings you don't configure or set differently." },
};

export const IMPACT_RULE_ORDER: ImpactRuleId[] = [
    'removed-in-use', 'possibly-removed-in-use', 'deprecated-in-use', 'changed-since-harvest',
    'baseline-gap', 'unassigned-policy', 'min-version-unmet', 'max-version-exceeded',
];

export interface ImpactPolicyRef {
    policyId: string; policyName: string; isAssigned: boolean; settingCount: number; assignments: PolicyAssignmentSummary[];
}
export interface ImpactReplacement {
    settingId: string; definitionId: string; displayName: string | null; confidence: 'Low' | 'Medium' | 'High' | 'Verified'; evidence: string | null;
}
export interface ImpactVersion {
    minimumSupportedVersion: string | null; maximumSupportedVersion: string | null;
    devicesBelowMinimum: number; devicesAboveMaximum: number; devicesOnPlatform: number;
    examples: { platform: string; version: string; count: number }[];
}
export interface ImpactChangedProperty {
    changeType: string; category: string; importance: string; field: string | null; previousValue: string | null; currentValue: string | null;
}
export interface ImpactFinding {
    ruleId: ImpactRuleId;
    severity: 'High' | 'Medium' | 'Low';
    key: string;
    title: string;
    detail: string | null;
    settingId: string | null;
    definitionId: string | null;
    displayName: string | null;
    lifecycleStatus: 'Active' | 'Deprecated' | 'PossiblyRemoved' | 'Removed' | null;
    platforms: string[];
    sinceHarvest: boolean;
    occurredAt: string | null;
    policies: ImpactPolicyRef[];
    replacements: ImpactReplacement[];
    version: ImpactVersion | null;
    changedProperties: ImpactChangedProperty[];
    /** baseline-gap only. */
    baseline: import('./baselineCoverage').BaselineCoverageSummary | null;
}
export interface TenantSettingImpact {
    harvestedAt: string | null;
    hasDeviceOsCounts: boolean;
    deviceOsCountsError: string | null;
    devicesTotal: number;
    countsByRule: Partial<Record<ImpactRuleId, number>>;
    findings: ImpactFinding[];
}

/** Relations as the setting detail endpoint returns them (mirrors CatalogSettingRelationDto). */
export interface SettingRelation {
    id: string;
    sourceSettingId: string; sourceGraphDefinitionId: string | null; sourceDisplayName: string | null;
    targetSettingId: string; targetGraphDefinitionId: string | null; targetDisplayName: string | null;
    relationType: 'Replaces' | 'Supersedes' | 'RenamedTo' | 'EquivalentTo' | 'SimilarTo' | 'SplitInto' | 'MergedInto';
    confidence: 'Low' | 'Medium' | 'High' | 'Verified';
    migrationNotes: string | null;
    evidence: { evidenceType: string; description: string; sourceName: string | null; sourceUrl: string | null }[];
}
