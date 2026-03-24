'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Save,
    Loader2,
    XCircle,
    CheckCircle,
    Clock,
    Settings,
    Mail,
    Zap,
    ZapOff,
    AlertTriangle,
    Play,
    History as HistoryIcon,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { 
    WORKER_JOB_BY_ID_ENDPOINT, 
    WORKER_JOB_RUN_NOW_ENDPOINT, 
    WORKER_JOB_EXECUTION_ENDPOINT, 
    WORKER_JOB_LATEST_EXECUTION_ENDPOINT,
    WORKER_JOB_EXECUTIONS_ENDPOINT
} from '@/lib/constants';

// ─── Types ──────────────────────────────────────────────────────────────────

interface WorkerJob {
    id: string;
    jobType: number;
    jobName: string;
    isEnabled: boolean;
    intervalHours: number;
    cronExpression: string | null;
    lastRunAt: string | null;
    nextScheduledRun: string | null;
    failureCount: number;
    lastFailureAt: string | null;
    isPoisoned: boolean;
    jobConfigurationJson: string;
    workerRegistrationId: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
}

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: WorkerJob;
}

// Execution Types
interface RunNowResponse {
    status: string;
    message: string;
    details: unknown[];
    data: {
        executionId: string;
        jobId: string;
        status: string;
        createdAt: string;
        note: string;
    };
}

interface ExecutionStatus {
    id: string;
    jobConfigId: string;
    workerRegistrationId: string;
    status: number; // 0=Pending, 1=Claimed, 2=Running, 3=Completed, 4=Failed
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

interface ExecutionStatusResponse {
    status: string;
    message: string;
    details: unknown[];
    data: ExecutionStatus;
}

interface ExecutionsListResponse {
    status: string;
    message: string;
    details: unknown[];
    data: ExecutionStatus[];
}

// Job Config Types
interface IntuneAuditJobConfig {
    recipientEmail: string;
    ccEmails?: string;
    tenantId: string;
    lookbackDays: number;
    categories?: string;
    onlyReportIfEventsFound: boolean;
    maxEvents: number;
}

interface ConfigurationDriftJobConfig {
    recipientEmail: string;
    ccEmails?: string;
    tenantId: string;
    onlyReportIfDriftsFound: boolean;
}

type JobConfig = IntuneAuditJobConfig | ConfigurationDriftJobConfig;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getJobTypeName(jobType: number): string {
    const types: Record<number, string> = {
        1: 'Audit Report',
        7: 'Drift Check',
    };
    return types[jobType] || `Job Type ${jobType}`;
}

function getJobTypeColor(jobType: number): string {
    const colors: Record<number, string> = {
        1: 'bg-blue-500',
        7: 'bg-yellow-500',
    };
    return colors[jobType] || 'bg-gray-500';
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function getExecutionStatusText(status: number): string {
    const statuses: Record<number, string> = {
        0: 'Pending',
        1: 'Claimed',
        2: 'Running',
        3: 'Completed',
        4: 'Failed',
    };
    return statuses[status] || 'Unknown';
}

function getExecutionStatusColor(status: number): string {
    const colors: Record<number, string> = {
        0: 'bg-gray-500',
        1: 'bg-blue-500',
        2: 'bg-yellow-500',
        3: 'bg-green-500',
        4: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
}

function isExecutionCompleted(status: number): boolean {
    return status === 3 || status === 4; // Completed or Failed
}

function parseJobConfig(json: string, jobType: number): JobConfig {
    try {
        const parsed = JSON.parse(json);
        
        // Normalize property names (backend uses PascalCase, we use camelCase)
        const normalized: Record<string, unknown> = {};
        Object.keys(parsed).forEach(key => {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            normalized[camelKey] = parsed[key];
        });
        
        if (jobType === 1) {
            // Intune Audit Report
            return {
                recipientEmail: normalized.recipientEmail as string || '',
                ccEmails: normalized.ccEmails as string || undefined,
                tenantId: normalized.tenantId as string || '',
                lookbackDays: Number(normalized.lookbackDays) || 7,
                categories: normalized.categories as string || undefined,
                onlyReportIfEventsFound: Boolean(normalized.onlyReportIfEventsFound),
                maxEvents: Number(normalized.maxEvents) || 500,
            } as IntuneAuditJobConfig;
        } else if (jobType === 7) {
            // Configuration Drift
            return {
                recipientEmail: normalized.recipientEmail as string || '',
                ccEmails: normalized.ccEmails as string || undefined,
                tenantId: normalized.tenantId as string || '',
                onlyReportIfDriftsFound: Boolean(normalized.onlyReportIfDriftsFound ?? true),
            } as ConfigurationDriftJobConfig;
        }
        
        return normalized as unknown as JobConfig;
    } catch {
        // Return defaults based on job type
        if (jobType === 1) {
            return {
                recipientEmail: '',
                tenantId: '',
                lookbackDays: 7,
                onlyReportIfEventsFound: false,
                maxEvents: 500,
            } as IntuneAuditJobConfig;
        } else if (jobType === 7) {
            return {
                recipientEmail: '',
                tenantId: '',
                onlyReportIfDriftsFound: true,
            } as ConfigurationDriftJobConfig;
        }
        return {} as unknown as JobConfig;
    }
}

function isIntuneAuditConfig(config: JobConfig, jobType: number): config is IntuneAuditJobConfig {
    return jobType === 1;
}

function isConfigurationDriftConfig(config: JobConfig, jobType: number): config is ConfigurationDriftJobConfig {
    return jobType === 7;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function EditJobPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();
    const params = useParams();
    const jobId = params?.id as string;

    const [job, setJob] = useState<WorkerJob | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [showRunConfirmDialog, setShowRunConfirmDialog] = useState(false);
    const [currentExecution, setCurrentExecution] = useState<ExecutionStatus | null>(null);
    const [executions, setExecutions] = useState<ExecutionStatus[]>([]);
    const [loadingExecutions, setLoadingExecutions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [isEnabled, setIsEnabled] = useState(true);
    const [intervalHours, setIntervalHours] = useState(24);
    const [nextScheduledRun, setNextScheduledRun] = useState<string | null>(null);
    const [config, setConfig] = useState<JobConfig | null>(null);

    // Ref to avoid circular dependencies
    const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    const pollExecutionStatus = useCallback(async (executionId: string) => {
        try {
            const result = await request<ExecutionStatusResponse>(
                WORKER_JOB_EXECUTION_ENDPOINT(jobId, executionId)
            );

            if (result?.data?.data) {
                const execution = result.data.data;
                setCurrentExecution(execution);

                // If execution is completed or failed, stop polling
                if (isExecutionCompleted(execution.status)) {
                    stopPolling();
                    setRunning(false);

                    if (execution.status === 3) {
                        // Completed successfully
                        setSuccessMessage('Job completed successfully!');
                        // Refresh job data inline
                        const jobResult = await request<ApiResponse>(WORKER_JOB_BY_ID_ENDPOINT(jobId));
                        if (jobResult?.data?.data) {
                            const jobData = jobResult.data.data;
                            setJob(jobData);
                            setIsEnabled(jobData.isEnabled);
                            setIntervalHours(jobData.intervalHours);
                            setNextScheduledRun(jobData.nextScheduledRun);
                            setConfig(parseJobConfig(jobData.jobConfigurationJson, jobData.jobType));
                        }
                        // Refresh executions list
                        const execResult = await request<ExecutionsListResponse>(
                            WORKER_JOB_EXECUTIONS_ENDPOINT(jobId)
                        );
                        if (execResult?.data?.data) {
                            const sorted = [...execResult.data.data]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 10);
                            setExecutions(sorted);
                        }
                    } else if (execution.status === 4) {
                        // Failed
                        setError(execution.errorMessage || 'Job execution failed');
                    }

                    // Clear execution after 10 seconds
                    setTimeout(() => {
                        setCurrentExecution(null);
                        setSuccessMessage(null);
                    }, 10000);
                }
            }
        } catch (err) {
            console.error('Failed to poll execution status:', err);
        }
    }, [jobId, request, stopPolling]);

    const startPollingExecution = useCallback((executionId: string) => {
        stopPolling(); // Clear any existing
        pollingIntervalRef.current = setInterval(() => {
            pollExecutionStatus(executionId);
        }, 2000);
        
        // Do initial poll immediately
        pollExecutionStatus(executionId);
    }, [pollExecutionStatus, stopPolling]);

    const fetchJob = useCallback(async () => {
        if (!jobId || accounts.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const result = await request<ApiResponse>(WORKER_JOB_BY_ID_ENDPOINT(jobId));
            if (result?.data?.data) {
                const jobData = result.data.data;
                setJob(jobData);
                setIsEnabled(jobData.isEnabled);
                setIntervalHours(jobData.intervalHours);
                setNextScheduledRun(jobData.nextScheduledRun);
                setConfig(parseJobConfig(jobData.jobConfigurationJson, jobData.jobType));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch job');
        } finally {
            setLoading(false);
        }
    }, [jobId, accounts, request]);

    const checkForActiveExecution = useCallback(async () => {
        try {
            const result = await request<ExecutionStatusResponse>(
                WORKER_JOB_LATEST_EXECUTION_ENDPOINT(jobId)
            );

            if (result?.data?.data) {
                const execution = result.data.data;
                // Only show if execution is not completed/failed
                if (!isExecutionCompleted(execution.status)) {
                    setCurrentExecution(execution);
                    setRunning(true);
                    startPollingExecution(execution.id);
                }
            }
        } catch {
            // No active execution or error fetching - that's okay
        }
    }, [jobId, request, startPollingExecution]);

    const fetchExecutions = useCallback(async () => {
        setLoadingExecutions(true);
        try {
            const result = await request<ExecutionsListResponse>(
                WORKER_JOB_EXECUTIONS_ENDPOINT(jobId)
            );

            if (result?.data?.data) {
                // Get last 10, sort by createdAt descending
                const sorted = [...result.data.data]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10);
                setExecutions(sorted);
            }
        } catch (err) {
            console.error('Failed to fetch executions:', err);
        } finally {
            setLoadingExecutions(false);
        }
    }, [jobId, request]);

    useEffect(() => {
        fetchJob();
        checkForActiveExecution();
        fetchExecutions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId, accounts.length]); // Only run when jobId or accounts.length changes

    // Cleanup polling interval on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);


    const handleSave = async () => {
        if (!job || !config) return;

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Convert camelCase back to PascalCase for backend
            const configForBackend: Record<string, unknown> = {};
            Object.keys(config).forEach(key => {
                const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
                configForBackend[pascalKey] = config[key as keyof JobConfig];
            });

            const payload = {
                isEnabled,
                intervalHours,
                nextScheduledRun,
                jobConfigurationJson: JSON.stringify(configForBackend),
            };

            const result = await request<ApiResponse>(
                WORKER_JOB_BY_ID_ENDPOINT(jobId),
                {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                }
            );

            if (result?.data?.data) {
                setSuccessMessage('Job updated successfully');
                setJob(result.data.data);
                // Refresh config from updated job
                setConfig(parseJobConfig(result.data.data.jobConfigurationJson, result.data.data.jobType));
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update job');
        } finally {
            setSaving(false);
        }
    };

    const handleRunNow = async () => {
        if (!job) return;

        setRunning(true);
        setError(null);
        setSuccessMessage(null);
        setShowRunConfirmDialog(false);

        try {
            const result = await request<RunNowResponse>(
                WORKER_JOB_RUN_NOW_ENDPOINT(jobId),
                {
                    method: 'POST',
                }
            );

            if (result?.data?.data) {
                const { executionId } = result.data.data;
                setSuccessMessage('Job triggered successfully! Monitoring execution...');
                startPollingExecution(executionId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to trigger job');
            setRunning(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateConfig = (key: string, value: any) => {
        if (!config) return;
        setConfig({ ...config, [key]: value } as JobConfig);
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading && !job) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Job
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching job data…
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error && !job) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={fetchJob} variant="outline">
                                Try Again
                            </Button>
                            <Button onClick={() => router.push('/worker/jobs')} variant="ghost">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Jobs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!job || !config) return null;

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-4xl mx-auto">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => router.push('/worker/jobs')}
                        variant="ghost"
                        size="sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Edit Job
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                            {job.jobName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowRunConfirmDialog(true)}
                        disabled={running || !isEnabled}
                        variant="outline"
                        size="sm"
                        title={!isEnabled ? 'Job must be enabled to run' : 'Run this job immediately'}
                    >
                        {running ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Run Now
                            </>
                        )}
                    </Button>
                    <Badge className={`${getJobTypeColor(job.jobType)} text-white`}>
                        {getJobTypeName(job.jobType)}
                    </Badge>
                </div>
            </div>

            {/* ── Success/Error Messages ───────────────────────────────────────── */}
            {successMessage && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">{successMessage}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && job && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Execution Status ─────────────────────────────────────────────── */}
            {currentExecution && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {currentExecution.status === 2 ? (
                                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                                    ) : currentExecution.status === 3 ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : currentExecution.status === 4 ? (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-gray-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            Execution Status
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            ID: {currentExecution.id.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                                <Badge className={`${getExecutionStatusColor(currentExecution.status)} text-white`}>
                                    {getExecutionStatusText(currentExecution.status)}
                                </Badge>
                            </div>

                            {currentExecution.progressMessage && (
                                <div className="text-sm text-gray-700 dark:text-gray-200">
                                    {currentExecution.progressMessage}
                                </div>
                            )}

                            {currentExecution.progressPercentage !== null && (
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${currentExecution.progressPercentage}%` }}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                {currentExecution.claimedAt && (
                                    <div>
                                        <span className="text-gray-500">Claimed:</span>
                                        <span className="ml-1 text-gray-900 dark:text-gray-100">
                                            {formatDateTime(currentExecution.claimedAt)}
                                        </span>
                                    </div>
                                )}
                                {currentExecution.completedAt && (
                                    <div>
                                        <span className="text-gray-500">Completed:</span>
                                        <span className="ml-1 text-gray-900 dark:text-gray-100">
                                            {formatDateTime(currentExecution.completedAt)}
                                        </span>
                                    </div>
                                )}
                                {currentExecution.durationSeconds !== null && (
                                    <div>
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="ml-1 text-gray-900 dark:text-gray-100">
                                            {currentExecution.durationSeconds}s
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Job Status Card ──────────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Job Status & Schedule
                    </CardTitle>
                    <CardDescription>Control when and how this job runs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                            {isEnabled ? (
                                <Zap className="h-5 w-5 text-green-500" />
                            ) : (
                                <ZapOff className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                                <Label htmlFor="isEnabled" className="text-base font-medium cursor-pointer">
                                    Job Enabled
                                </Label>
                                <p className="text-sm text-gray-500">
                                    {isEnabled
                                        ? 'Job is active and will run on schedule'
                                        : 'Job is paused and will not run'}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="isEnabled"
                            checked={isEnabled}
                            onCheckedChange={setIsEnabled}
                        />
                    </div>

                    <Separator />

                    {/* Interval Hours */}
                    <div className="space-y-2">
                        <Label htmlFor="intervalHours" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Run Interval (Hours)
                        </Label>
                        <Input
                            id="intervalHours"
                            type="number"
                            min="1"
                            max="8760"
                            value={intervalHours}
                            onChange={(e) => setIntervalHours(Number(e.target.value))}
                            className="max-w-xs"
                        />
                        <p className="text-sm text-gray-500">
                            Job runs every {intervalHours} hour{intervalHours !== 1 ? 's' : ''}
                            {intervalHours >= 24 && ` (${(intervalHours / 24).toFixed(1)} days)`}
                        </p>
                    </div>

                    {/* Next Scheduled Run */}
                    <div className="space-y-2">
                        <Label htmlFor="nextScheduledRun" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Next Scheduled Run
                        </Label>
                        <Input
                            id="nextScheduledRun"
                            type="datetime-local"
                            value={nextScheduledRun ? new Date(nextScheduledRun).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                                if (e.target.value) {
                                    setNextScheduledRun(new Date(e.target.value).toISOString());
                                } else {
                                    setNextScheduledRun(null);
                                }
                            }}
                            className="max-w-xs"
                        />
                        <p className="text-sm text-gray-500">
                            Manually adjust when this job should run next
                        </p>
                    </div>

                    {/* Job Metadata */}
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1">Last Run</p>
                            <p className="font-medium">{formatDateTime(job.lastRunAt)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Next Scheduled</p>
                            <p className="font-medium">{formatDateTime(job.nextScheduledRun)}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Failure Count</p>
                            <div className="flex items-center gap-2">
                                {job.failureCount > 0 ? (
                                    <Badge className="bg-red-500 text-white">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {job.failureCount}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-green-500 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        0
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Created</p>
                            <p className="font-medium text-xs">{formatDateTime(job.createdAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Configuration & History Tabs ─────────────────────────────────── */}
            <Tabs defaultValue="configuration" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="configuration" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configuration
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4" />
                        Execution History
                        {executions.length > 0 && (
                            <Badge variant="secondary" className="ml-1">{executions.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="configuration" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Job Configuration
                            </CardTitle>
                            <CardDescription>Configure job-specific settings and recipients</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Common Fields: Recipient Email */}
                            <div className="space-y-2">
                                <Label htmlFor="recipientEmail" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Recipient Email *
                                </Label>
                                <Input
                                    id="recipientEmail"
                                    type="email"
                                    value={config.recipientEmail}
                                    onChange={(e) => updateConfig('recipientEmail', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                                <p className="text-sm text-gray-500">Primary email recipient for reports</p>
                            </div>

                            {/* Common Fields: CC Emails */}
                            <div className="space-y-2">
                                <Label htmlFor="ccEmails">CC Recipients (Optional)</Label>
                                <Input
                                    id="ccEmails"
                                    type="text"
                                    value={config.ccEmails || ''}
                                    onChange={(e) => updateConfig('ccEmails', e.target.value || undefined)}
                                    placeholder="user1@example.com, user2@example.com"
                                />
                                <p className="text-sm text-gray-500">Additional recipients (comma-separated)</p>
                            </div>

                            {/* Common Fields: Tenant ID */}
                            <div className="space-y-2">
                                <Label htmlFor="tenantId">Tenant ID *</Label>
                                <Input
                                    id="tenantId"
                                    type="text"
                                    value={config.tenantId}
                                    onChange={(e) => updateConfig('tenantId', e.target.value)}
                                    placeholder="00000000-0000-0000-0000-000000000000"
                                    className="font-mono text-sm"
                                    required
                                />
                                <p className="text-sm text-gray-500">Microsoft Entra tenant ID to monitor</p>
                            </div>

                            <Separator />

                            {/* Job Type-Specific Fields */}
                            {isIntuneAuditConfig(config, job.jobType) && (
                                <>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Audit Report Settings
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="lookbackDays">Lookback Days</Label>
                                        <Input
                                            id="lookbackDays"
                                            type="number"
                                            min="1"
                                            max="90"
                                            value={config.lookbackDays}
                                            onChange={(e) => updateConfig('lookbackDays', Number(e.target.value))}
                                            className="max-w-xs"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Number of days to look back for audit events (1-90 days)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxEvents">Maximum Events</Label>
                                        <Input
                                            id="maxEvents"
                                            type="number"
                                            min="1"
                                            max="10000"
                                            value={config.maxEvents}
                                            onChange={(e) => updateConfig('maxEvents', Number(e.target.value))}
                                            className="max-w-xs"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Maximum number of events to include in the report
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="categories">Filter Categories (Optional)</Label>
                                        <Input
                                            id="categories"
                                            type="text"
                                            value={config.categories || ''}
                                            onChange={(e) => updateConfig('categories', e.target.value || undefined)}
                                            placeholder="Application, Policy, Device, Role"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Filter by specific audit categories (comma-separated)
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <Label htmlFor="onlyReportIfEventsFound" className="text-base font-medium cursor-pointer">
                                                Only Report If Events Found
                                            </Label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Skip sending report if no events are found
                                            </p>
                                        </div>
                                        <Switch
                                            id="onlyReportIfEventsFound"
                                            checked={config.onlyReportIfEventsFound}
                                            onCheckedChange={(checked) => updateConfig('onlyReportIfEventsFound', checked)}
                                        />
                                    </div>
                                </>
                            )}

                            {isConfigurationDriftConfig(config, job.jobType) && (
                                <>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Drift Monitoring Settings
                                    </h3>

                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <Label htmlFor="onlyReportIfDriftsFound" className="text-base font-medium cursor-pointer">
                                                Only Report If Drifts Found
                                            </Label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Skip sending report if no configuration drifts are detected
                                            </p>
                                        </div>
                                        <Switch
                                            id="onlyReportIfDriftsFound"
                                            checked={config.onlyReportIfDriftsFound}
                                            onCheckedChange={(checked) => updateConfig('onlyReportIfDriftsFound', checked)}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HistoryIcon className="h-5 w-5" />
                                Recent Executions
                            </CardTitle>
                            <CardDescription>
                                Last 10 job executions and their results
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingExecutions ? (
                                <div className="text-center py-12">
                                    <Loader2 className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-600 dark:text-gray-300">Loading executions...</p>
                                </div>
                            ) : executions.length === 0 ? (
                                <div className="text-center py-12">
                                    <HistoryIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No Executions Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        This job hasn&apos;t been executed yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {executions.map((execution, index) => (
                                        <div
                                            key={execution.id}
                                            className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1">
                                                        {execution.status === 2 ? (
                                                            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                                                        ) : execution.status === 3 ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        ) : execution.status === 4 ? (
                                                            <XCircle className="h-5 w-5 text-red-500" />
                                                        ) : execution.status === 1 ? (
                                                            <Clock className="h-5 w-5 text-blue-500" />
                                                        ) : (
                                                            <Clock className="h-5 w-5 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={`${getExecutionStatusColor(execution.status)} text-white`}>
                                                                {getExecutionStatusText(execution.status)}
                                                            </Badge>
                                                            {index === 0 && execution.status < 3 && (
                                                                <Badge variant="outline" className="border-blue-500 text-blue-600">
                                                                    Latest
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
                                                            <div className="flex items-center gap-4 flex-wrap">
                                                                {execution.claimedAt && (
                                                                    <span>
                                                                        <strong>Claimed:</strong> {formatDateTime(execution.claimedAt)}
                                                                    </span>
                                                                )}
                                                                {execution.completedAt && (
                                                                    <span>
                                                                        <strong>Completed:</strong> {formatDateTime(execution.completedAt)}
                                                                    </span>
                                                                )}
                                                                {execution.durationSeconds !== null && (
                                                                    <span>
                                                                        <strong>Duration:</strong> {execution.durationSeconds}s
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {execution.progressMessage && (
                                                                <div className="mt-2 text-gray-600 dark:text-gray-300">
                                                                    {execution.progressMessage}
                                                                </div>
                                                            )}
                                                            {execution.errorMessage && (
                                                                <div className="mt-2 text-red-600 dark:text-red-400 flex items-start gap-1">
                                                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                                                    <span>{execution.errorMessage}</span>
                                                                </div>
                                                            )}
                                                            {execution.resultSummaryJson && (
                                                                <details className="mt-2">
                                                                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                                                                        View Result Summary
                                                                    </summary>
                                                                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                                                                        {JSON.stringify(JSON.parse(execution.resultSummaryJson), null, 2)}
                                                                    </pre>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400 text-right shrink-0">
                                                    {formatDateTime(execution.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ── Actions ──────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <Button
                    onClick={() => router.push('/worker/jobs')}
                    variant="outline"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={saving || !config.recipientEmail || !config.tenantId}
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* ── Run Now Confirmation Dialog ────────────────────────────────── */}
            <Dialog open={showRunConfirmDialog} onOpenChange={setShowRunConfirmDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-500" />
                            Run Job Now
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to run this job immediately?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                {job.jobName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Job Type: {getJobTypeName(job.jobType)}
                            </p>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <p className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                <span>This will trigger the job to run immediately, outside of its regular schedule.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                <span>The job will execute as soon as a worker picks it up from the queue.</span>
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowRunConfirmDialog(false)}
                            disabled={running}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRunNow}
                            disabled={running}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {running ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Run Now
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
