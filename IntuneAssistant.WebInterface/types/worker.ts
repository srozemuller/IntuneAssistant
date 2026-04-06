export interface WorkerInstance {
    tenantId: string;
    tenantDisplayName: string;
    workerRegistrationId: string;
    workerInstanceId: string;
    workerVersion: string;
    machineName: string;
    osVersion: string;
    workerDashboardUrl: string | null;
    registeredAt: string;
    registrationStatus: number;
    lastHeartbeat: string;
    timeSinceLastHeartbeat: string;
    healthStatus: number;
    currentVersion: string;
    updateAvailable: boolean;
}

export interface WorkerOverview {
    customerId: string;
    isConfigured: boolean;
    isEnabled: boolean;
    acceptNewJobs: boolean;
    autoUpdate: boolean;
    updateRing: number;
    senderEmail: string;
    isSenderEmailConfigured: boolean;
    availableVersion: string;
    updatedAt: string;
    updatedBy: string | null;
    workers: WorkerInstance[];
}

export interface WorkerJob {
    id: string;
    jobType: number;
    jobName: string;
    isEnabled: boolean;
    intervalHours: number;
    cronExpression: string | null;
    lastRunAt: string | null;
    nextScheduledRun: string | null;
    failureCount: number;
    lastFailedAt: string | null;
    isPoisoned: boolean;
    jobConfigurationJson: string;
    workerRegistrationId: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
    currentExecutionStatus?: number;
    currentExecutionId?: string;
}

export interface JobConfig {
    recipientEmail: string;
    ccEmails?: string;
    tenantId: string;
    lookbackDays?: number;
    categories?: string;
    onlyReportIfEventsFound?: boolean;
    onlyReportIfDriftsFound?: boolean;
    maxEvents?: number;
}

export interface JobExecution {
    id: string;
    jobConfigId: string;
    workerRegistrationId: string;
    status: number;
    createdAt: string;
    claimedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    expiresAt: string | null;
    progressPercentage: number | null;
    progressMessage: string | null;
    resultSummaryJson: string | null;
    errorMessage: string | null;
    durationSeconds: number | null;
}

export enum JobType {
    IntuneAuditReport = 1,
    EntraAuditReport = 2,
    ComplianceReport = 3,
    SecurityReport = 4,
    ConfigurationBackup = 5,
    AutomatedRemediation = 6,
    ConfigurationDriftMonitor = 7,
}

export enum ExecutionStatus {
    Pending = 0,
    Claimed = 1,
    InProgress = 2,
    Success = 3,
    Failed = 4,
    Expired = 5,
    Cancelled = 6,
}

export enum HealthStatus {
    Healthy = 0,
    Stale = 1,    // No heartbeat for 10 min
    Offline = 2,  // No heartbeat for 60 min
    Unknown = 3,
}

export enum RegistrationStatus {
    Pending = 0,       // Awaiting admin approval
    Approved = 1,      // Approved, worker can authenticate
    Rejected = 2,      // Rejected by admin
    Revoked = 3,       // Approved but later revoked
}
