export interface WorkerInstance {
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
    ConfigurationDriftMonitor = 7
}

export enum ExecutionStatus {
    Pending = 0,
    Running = 1,
    Completed = 3,
    Failed = 4
}

export enum HealthStatus {
    Healthy = 0,
    Warning = 1,
    Critical = 2
}

export enum RegistrationStatus {
    Active = 0,
    Inactive = 1,
    Decommissioned = 2
}

