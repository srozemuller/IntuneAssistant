// types/rbac.ts

export interface ActivitySummary {
    totalActions: number;
    readActions: number;
    writeActions: number;
    deleteActions: number;
    uniqueActionsPerformed: string[];
    unusedPermissions: string[];
}

export interface UserAnalysis {
    userId: string;
    userPrincipalName: string;
    displayName: string;
    roleMembership: string;
    sourceGroupId: string;
    sourceGroupName: string;
    isOverPrivileged: boolean;
    overPrivilegeReason: string;
    activitySummary: ActivitySummary;
}

export interface RbacAnalysisData {
    roleName: string;
    roleId: string;
    userAnalyses: UserAnalysis[];
    totalUsers: number;
    overPrivilegedUsers: number;
    analysisStartDate: string;
    analysisEndDate: string;
    correlationId: string;
}

export interface RbacAnalysisResponse {
    status: number;
    message: string;
    data: RbacAnalysisData;
    correlationId: string;
}

