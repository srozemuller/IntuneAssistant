export interface AssignmentEvidenceDto {
    targetType: string;
    groupId?: string | null;
    groupName?: string | null;
    verdict: string;
    matchedVia: string;
    filterId?: string | null;
    filterName?: string | null;
    note: string;
}

export interface CompliancePolicyCoverageDto {
    policyId: string;
    policyName: string;
    platform: string;
    result: string;
    reason: string;
    assignmentEvidence: AssignmentEvidenceDto[];
}

export interface DeviceComplianceCoverageDto {
    managedDeviceId: string;
    deviceName: string;
    manufacturer?: string | null;
    model?: string | null;
    osVersion?: string | null;
    platform: string;
    ownership?: string | null;
    complianceState?: string | null;
    managementAgent?: string | null;
    enrollmentProfileName?: string | null;
    lastSyncDateTime?: string | null;
    userPrincipalName?: string | null;
    isUserless: boolean;
    overallResult: string;
    policyResults: CompliancePolicyCoverageDto[];
    showUserlessAdvisory: boolean;
}

export interface ComplianceCoverageRunSummaryDto {
    generatedAt: string;
    totalDevicesWithoutCompliancePolicy: number;
    totalDevicesAnalyzed: number;
    resultCounts: Record<string, number>;
    skippedPlatformCounts: Record<string, number>;
    devices: DeviceComplianceCoverageDto[];
}
