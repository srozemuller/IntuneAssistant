// Intune RBAC map: GET v1/rbac/intune-map and v1/rbac/intune-map/principals/{userId}.
// Mirrors the API response shapes of those two endpoints.

export type IntuneRbacCellState = 'None' | 'Granted' | 'MergedOnly';
export type IntuneRbacMembershipPath = 'Direct' | 'Nested' | 'Mixed';
export type IntuneRbacFlagKind =
    | 'DefaultTagOnly'
    | 'BroadScope'
    | 'DestructiveCustomRole'
    | 'EmptyAssignment'
    | 'NestedOnlyAdmin'
    | 'MembershipUnknown'
    | 'RoleUnknown';

export interface IntuneRbacScopeTag {
    id: string;
    displayName: string;
}

export interface IntuneRbacGroup {
    id: string;
    displayName: string;
    found: boolean;
    memberCount: number | null;
}

export interface IntuneRbacRole {
    id: string;
    displayName: string;
    description?: string | null;
    isBuiltIn: boolean;
    allowedActionCount: number;
    assignmentCount: number;
    scopeTags: IntuneRbacScopeTag[];
}

export interface IntuneRbacAssignment {
    id: string;
    displayName: string;
    description?: string | null;
    roleDefinitionId?: string | null;
    roleDisplayName?: string | null;
    roleIsBuiltIn?: boolean | null;
    scopeType: string;
    memberGroups: IntuneRbacGroup[];
    scopeGroups: IntuneRbacGroup[];
    scopeTags: IntuneRbacScopeTag[];
    adminCount: number;
    membershipUnknown: boolean;
}

export interface IntuneRbacAdmin {
    userId: string;
    displayName: string;
    userPrincipalName?: string | null;
    assignmentCount: number;
    path: IntuneRbacMembershipPath;
    roleNames: string[];
    scopeTagNames: string[];
    flags: IntuneRbacFlagKind[];
}

export interface IntuneRbacScopeTagAccess {
    scopeTagId: string;
    scopeTagName: string;
    userId: string;
    displayName: string;
    userPrincipalName?: string | null;
    write: IntuneRbacCellState;
    delete: IntuneRbacCellState;
    wipe: IntuneRbacCellState;
}

export interface IntuneRbacHygieneFlag {
    kind: IntuneRbacFlagKind;
    objectType: string;
    objectId: string;
    objectName: string;
    reason: string;
}

export interface IntuneRbacMap {
    tenantId: string;
    generatedAt: string;
    correlationId: string;
    summary: {
        roleCount: number;
        customRoleCount: number;
        assignmentCount: number;
        adminCount: number;
        scopeTagCount: number;
        flagCount: number;
    };
    roles: IntuneRbacRole[];
    assignments: IntuneRbacAssignment[];
    scopeTags: IntuneRbacScopeTag[];
    admins: IntuneRbacAdmin[];
    scopeTagAccess: IntuneRbacScopeTagAccess[];
    flags: IntuneRbacHygieneFlag[];
    warnings: string[];
}

export interface IntuneRbacPrincipalAssignment {
    assignmentId: string;
    assignmentName: string;
    roleDefinitionId?: string | null;
    roleDisplayName?: string | null;
    roleIsBuiltIn?: boolean | null;
    path: IntuneRbacMembershipPath;
    via: string[];
    scopeType: string;
    scopeGroups: IntuneRbacGroup[];
    scopeTags: IntuneRbacScopeTag[];
}

export interface IntuneRbacPermissionCell {
    scopeTagId: string;
    state: IntuneRbacCellState;
    grantedBy: string[];
}

export interface IntuneRbacPermissionRow {
    action: string;
    category: string;
    operation: string;
    cells: IntuneRbacPermissionCell[];
}

export interface IntuneRbacLostPermission {
    action: string;
    category: string;
    operation: string;
    scopeTagId: string;
    scopeTagName: string;
}

export interface IntuneRbacPrincipal {
    tenantId: string;
    correlationId: string;
    userId: string;
    displayName: string;
    userPrincipalName?: string | null;
    assignments: IntuneRbacPrincipalAssignment[];
    scopeTags: IntuneRbacScopeTag[];
    permissions: IntuneRbacPermissionRow[];
    wouldLose: IntuneRbacLostPermission[];
    grantedCellCount: number;
    mergedOnlyCellCount: number;
    flags: IntuneRbacFlagKind[];
    membershipUnknown: boolean;
}

export interface IntuneRbacEnvelope<T> {
    status: string;
    message: string;
    data: T;
    correlationId: string;
}
