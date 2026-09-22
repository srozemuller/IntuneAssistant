// types/tenantOverview.ts
// Mirrors IntuneAssistant/Models/Overview/TenantOverviewStreamModels.cs. There is no generated client:
// if the backend shape changes, this file has to change by hand.
//
// Change history (the stream's `changes` event + IntuneAssistant.API's TenantOverviewChangesController,
// `v1/overview/changes*`) is a paid Configuration Management feature on top of the beta flag and is not
// ported to this community app — only the resource inventory (sections, items, assignments) is.

export type OverviewStepStatus = 'pending' | 'loading' | 'completed' | 'failed';

export interface OverviewAssignment {
    id: string | null;
    /** Graph target type without the `#microsoft.graph.` prefix, e.g. `groupAssignmentTarget`. */
    targetType: string;
    groupId: string | null;
    isExcluded: boolean;
    filterId: string | null;
    filterType: string | null;
}

export interface OverviewItem {
    id: string;
    name: string | null;
    description: string | null;
    /** Backend `PolicyType` enum name, e.g. `SettingsCatalog`, `DeviceCompliancePolicies`, `MobileApp`. */
    policyType: string;
    policySubType: string | null;
    /** Settings Catalog only: `templateReference.templateFamily`, e.g. `endpointSecurityAntivirus`, `baseline`. */
    templateFamily?: string | null;
    templateDisplayName?: string | null;
    platform: string | null;
    odataType: string | null;
    /** False for built-in tenant defaults even though Graph attaches an implicit target to them. */
    isAssigned: boolean;
    /** False for filters, scope tags and RBAC roles: they are targets/scopes, never assigned themselves. Absent means true. */
    supportsAssignments?: boolean;
    isTenantDefault: boolean;
    configurationState: string | null;
    createdDateTime: string | null;
    lastModifiedDateTime: string | null;
    scopeTagIds: string[];
    settingCount: number;
    assignments: OverviewAssignment[];
}

export interface OverviewSection {
    key: string;
    label: string;
    stepIndex: number;
    items: OverviewItem[];
    count: number;
}

export type OverviewStepKind = 'connect' | 'family' | 'derived';

export interface OverviewStep {
    step: string;
    stepIndex: number;
    status: OverviewStepStatus;
    /** `family` steps are resource types; `connect` and `derived` (assignments) only show in the status window. */
    kind?: OverviewStepKind;
    itemCount?: number | null;
    durationMs?: number | null;
    error?: string | null;
}

export interface OverviewConnectedPayload {
    message: string;
    /** `server-cache` when the API replayed the tenant's stored snapshot; `other-instance` while it waited for another server; absent for a live collection. */
    servedFrom?: 'server-cache' | 'other-instance' | null;
    collectedAt?: string | null;
}

export interface OverviewCompletePayload {
    totalItems: number;
    sectionCount: number;
    failedSectionCount: number;
    durationMs: number;
    completedAt: string;
    warnings: string[];
}

export type OverviewStreamPhase = 'idle' | 'streaming' | 'completed' | 'failed';

/**
 * One assignment row, exactly what `GET /v1/assignments` returns (backend `CustomAssignmentsModel`), delivered by
 * the stream's `assignments` event. Extends Record so it can feed DataTable unchanged.
 */
export interface OverviewAssignmentRow extends Record<string, unknown> {
    resourceType: string;
    subResourceType: string | null;
    assignmentType: string;
    platform: string | null;
    isAssigned: boolean;
    isTenantDefault?: boolean;
    configurationState?: string | null;
    targetId: string | null;
    targetName: string;
    resourceId: string | null;
    resourceName: string | null;
    filterId: string | null;
    filterType: string | null;
    assignmentDirection: string;
    isExcluded: boolean;
    isNestedAssignment?: boolean;
    scopeTagIds?: string[];
    warnings?: string[];
    group?: {
        id: string;
        displayName: string;
        description: string;
    } | null;
}

export interface OverviewAssignmentsPayload {
    key: string;
    label: string;
    stepIndex: number;
    items: OverviewAssignmentRow[];
    count: number;
}

/** What gets persisted per user + tenant so a reload inside the cache window skips the stream entirely. */
export interface TenantOverviewSnapshot {
    version: number;
    fetchedAt: number;
    tenantId: string;
    sections: Record<string, OverviewSection>;
    /** Null when the assignments step failed or the snapshot predates it. */
    assignments: OverviewAssignmentRow[] | null;
    steps: OverviewStep[];
    warnings: string[];
    durationMs: number;
}
