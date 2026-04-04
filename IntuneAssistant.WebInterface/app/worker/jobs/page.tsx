'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    RefreshCw,
    BriefcaseBusiness,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Calendar,
    Search,
    Loader2,
    Eye,
    Zap,
    ZapOff,
    Skull,
    Settings,
    TrendingUp,
    Activity,
    Plus,
    Save,
    Mail,
    Trash2,
    Server,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { WORKER_JOBS_ENDPOINT, WORKER_JOB_LATEST_EXECUTION_ENDPOINT, WORKER_OVERVIEW_ENDPOINT } from '@/lib/constants';
import { DataTable } from '@/components/DataTable';
import { useTenant } from '@/contexts/TenantContext';
import { WorkerOverview } from '@/types/worker';

// ─── Types ──────────────────────────────────────────────────────────────────

interface WorkerJob extends Record<string, unknown> {
    id: string;
    jobType: number;
    jobName: string;
    isEnabled: boolean;
    intervalHours: number;
    cronExpression: string | null;
    lastRunAt: string | null;
    nextScheduledRun: string | null;
    consecutiveFailureCount: number;
    lastConsecutiveFailureAt: string | null;
    isPoisoned: boolean;
    jobConfigurationJson: string;
    workerRegistrationId: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string | null;
    totalExecutions: number;
    totalSuccessCount: number;
    totalFailedCount: number;
    lastSuccessAt: string | null;
    lastFailedAt: string | null;
}

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: WorkerJob[];
}

interface ExecutionStatus {
    id: string;
    jobConfigId: string;
    status: number; // 0=Pending, 1=Claimed, 2=Running, 3=Completed, 4=Failed
    progressPercentage: number | null;
    progressMessage: string | null;
}

interface ExecutionStatusResponse {
    status: string;
    message: string;
    details: unknown[];
    data: ExecutionStatus;
}

interface ParsedJobConfig {
    [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimeSince(ts: string): { totalSeconds: number; display: string } {
    const dayMatch = ts.match(/^(\d+)\.(\d+):(\d+):(\d+)/);
    if (dayMatch) {
        const d = parseInt(dayMatch[1], 10);
        const h = parseInt(dayMatch[2], 10);
        const m = parseInt(dayMatch[3], 10);
        const s = parseInt(dayMatch[4], 10);
        const total = d * 86400 + h * 3600 + m * 60 + s;
        
        const parts: string[] = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 || parts.length === 0) parts.push(`${s}s`);
        
        return { totalSeconds: total, display: parts.join(' ') };
    }
    
    const match = ts.match(/^(\d+):(\d+):(\d+)/);
    if (!match) return { totalSeconds: 0, display: ts };
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const s = parseInt(match[3], 10);
    const total = h * 3600 + m * 60 + s;

    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return { totalSeconds: total, display: parts.join(' ') };
}

function getHealthStatusInfo(healthStatus: number, timeSince: string) {
    const { totalSeconds } = parseTimeSince(timeSince);
    
    // Critical if no heartbeat in 10 minutes or healthStatus is Critical (2)
    if (totalSeconds > 600 || healthStatus === 2) {
        return {
            label: 'Critical',
            color: 'bg-red-500',
            icon: 'XCircle',
        };
    }
    
    // Warning if no heartbeat in 5 minutes or healthStatus is Warning (1)
    if (totalSeconds > 300 || healthStatus === 1) {
        return {
            label: 'Warning',
            color: 'bg-yellow-500',
            icon: 'AlertTriangle',
        };
    }
    
    return {
        label: 'Healthy',
        color: 'bg-green-500',
        icon: 'CheckCircle',
    };
}

function getJobTypeName(jobType: number): string {
    const types: Record<number, string> = {
        1: 'Audit Report',
        2: 'Backup',
        3: 'Deployment',
        4: 'Compliance Check',
        5: 'Sync',
        6: 'Cleanup',
        7: 'Drift Check',
        8: 'Health Check',
    };
    return types[jobType] || `Job Type ${jobType}`;
}

function getJobTypeColor(jobType: number): string {
    const colors: Record<number, string> = {
        1: 'bg-blue-500',
        2: 'bg-purple-500',
        3: 'bg-green-500',
        4: 'bg-orange-500',
        5: 'bg-cyan-500',
        6: 'bg-red-500',
        7: 'bg-yellow-500',
        8: 'bg-pink-500',
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

function getRelativeTime(iso: string | null): string {
    if (!iso) return '—';
    try {
        const now = new Date();
        const then = new Date(iso);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    } catch {
        return iso;
    }
}

function getNextRunRelative(iso: string | null): string {
    if (!iso) return '—';
    try {
        const now = new Date();
        const then = new Date(iso);
        const diffMs = then.getTime() - now.getTime();

        if (diffMs < 0) return 'Overdue';

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `in ${diffMins}m`;
        if (diffHours < 24) return `in ${diffHours}h`;
        return `in ${diffDays}d`;
    } catch {
        return iso;
    }
}

function parseJobConfig(json: string): ParsedJobConfig {
    try {
        return JSON.parse(json);
    } catch {
        return {};
    }
}

// ─── Job Details Dialog ──────────────────────────────────────────────────────

interface JobDetailsDialogProps {
    job: WorkerJob | null;
    isOpen: boolean;
    onClose: () => void;
}

function JobDetailsDialog({ job, isOpen, onClose }: JobDetailsDialogProps) {
    if (!job) return null;

    const config = parseJobConfig(job.jobConfigurationJson);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-5 w-5 text-blue-500" />
                        {job.jobName}
                    </DialogTitle>
                    <DialogDescription>
                        Job ID: <span className="font-mono text-xs">{job.id}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                {job.isEnabled ? (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                        <Zap className="h-3 w-3 mr-1" />
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <ZapOff className="h-3 w-3 mr-1" />
                                        Disabled
                                    </Badge>
                                )}
                                {job.isPoisoned && (
                                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                                        <Skull className="h-3 w-3 mr-1" />
                                        Poisoned
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">Job Type</div>
                            <Badge className={`${getJobTypeColor(job.jobType)} hover:opacity-90 text-white`}>
                                {getJobTypeName(job.jobType)}
                            </Badge>
                        </div>
                    </div>

                    {/* Timing Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Scheduling
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interval</div>
                                <div className="font-medium">{job.intervalHours}h</div>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cron Expression</div>
                                <div className="font-mono text-xs">{job.cronExpression || '—'}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Run</div>
                                <div className="text-sm">{formatDateTime(job.lastRunAt)}</div>
                                <div className="text-xs text-gray-400">{getRelativeTime(job.lastRunAt)}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Scheduled Run</div>
                                <div className="text-sm">{formatDateTime(job.nextScheduledRun)}</div>
                                <div className="text-xs text-gray-400">{getNextRunRelative(job.nextScheduledRun)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Failure Info */}
                    {(job.totalFailedCount > 0 || job.lastFailedAt) && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Failures
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <div className="text-xs text-red-600 dark:text-red-400 mb-1">Failure Count</div>
                                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{job.totalFailedCount}</div>
                                </div>
                                {job.lastFailedAt && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <div className="text-xs text-red-600 dark:text-red-400 mb-1">Last Failure</div>
                                        <div className="text-sm text-red-600 dark:text-red-400">{formatDateTime(job.lastFailedAt)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Configuration */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Configuration
                        </h4>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border font-mono text-xs overflow-x-auto">
                            <pre>{JSON.stringify(config, null, 2)}</pre>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Metadata
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</div>
                                <div>{formatDateTime(job.createdAt)}</div>
                                <div className="text-xs text-gray-500">by {job.createdBy}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Updated</div>
                                <div>{formatDateTime(job.updatedAt)}</div>
                                {job.updatedBy && <div className="text-xs text-gray-500">by {job.updatedBy}</div>}
                            </div>
                            <div className="col-span-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Worker Registration ID</div>
                                <div className="font-mono text-xs break-all">{job.workerRegistrationId}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WorkerJobsPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();
    const { selectedTenant } = useTenant();
    
    // Get tenant ID from claims as fallback
    const tenantIdFromClaims = accounts[0]?.tenantId || accounts[0]?.idTokenClaims?.tid as string | undefined;
    const effectiveTenantId = selectedTenant?.tenantId || tenantIdFromClaims;

    const [jobs, setJobs] = useState<WorkerJob[]>([]);
    const [workerData, setWorkerData] = useState<WorkerOverview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [filterWorker, setFilterWorker] = useState<string>('all');
    const [selectedJob, setSelectedJob] = useState<WorkerJob | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [jobExecutions, setJobExecutions] = useState<Map<string, ExecutionStatus>>(new Map());
    
    // Delete Job Dialog State
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [jobToDelete, setJobToDelete] = useState<WorkerJob | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    
    // Create Job Dialog State
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);
    
    // Form fields
    const [formJobType, setFormJobType] = useState(1); // Default to Intune Audit Report
    const [formJobName, setFormJobName] = useState('');
    const [formIsEnabled, setFormIsEnabled] = useState(true);
    const [formIntervalHours, setFormIntervalHours] = useState(168); // Weekly default
    const [formFirstRunAt, setFormFirstRunAt] = useState('');
    const [formSelectedWorkers, setFormSelectedWorkers] = useState<string[]>([]); // Worker Registration IDs
    
    // Intune Audit Report Config
    const [formRecipientEmail, setFormRecipientEmail] = useState('');
    const [formCcEmails, setFormCcEmails] = useState('');
    const [formLookbackDays, setFormLookbackDays] = useState(7);
    const [formCategories, setFormCategories] = useState('');
    const [formOnlyReportIfEventsFound, setFormOnlyReportIfEventsFound] = useState(false);
    const [formMaxEvents, setFormMaxEvents] = useState(500);

    const fetchJobs = useCallback(async () => {
        if (accounts.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch jobs and worker data in parallel
            const [jobsResult, workerResult] = await Promise.all([
                request<ApiResponse>(WORKER_JOBS_ENDPOINT),
                request<{ status: string; message: string; details: unknown[]; data: WorkerOverview }>(WORKER_OVERVIEW_ENDPOINT)
            ]);
            
            if (jobsResult?.data?.data) {
                const jobsList = jobsResult.data.data;
                setJobs(jobsList);
                setLastRefreshed(new Date());
                
                // Fetch execution status for all jobs
                const executionsMap = new Map<string, ExecutionStatus>();
                
                await Promise.all(
                    jobsList.map(async (job) => {
                        try {
                            const execResult = await request<ExecutionStatusResponse>(
                                WORKER_JOB_LATEST_EXECUTION_ENDPOINT(job.id)
                            );
                            
                            if (execResult?.data?.data) {
                                const execution = execResult.data.data;
                                // Only store if pending or running
                                if (execution.status === 0 || execution.status === 1 || execution.status === 2) {
                                    executionsMap.set(job.id, execution);
                                }
                            }
                        } catch {
                            // No active execution for this job
                        }
                    })
                );
                
                setJobExecutions(executionsMap);
            }
            
            if (workerResult?.data?.data) {
                setWorkerData(workerResult.data.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    }, [accounts, request]);

    const handleCreateJob = async () => {
        setCreateError(null);
        setCreateSuccess(null);

        // Validation
        if (!formJobName.trim()) {
            setCreateError('Job name is required');
            return;
        }
        if (!formRecipientEmail.trim()) {
            setCreateError('Recipient email is required');
            return;
        }
        if (!effectiveTenantId) {
            setCreateError('No tenant ID available. Please log in again.');
            return;
        }
        if (formSelectedWorkers.length === 0) {
            setCreateError('Please select at least one worker');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formRecipientEmail)) {
            setCreateError('Invalid recipient email format');
            return;
        }

        setCreating(true);

        try {
            // Build job configuration based on job type
            let jobConfig: Record<string, unknown> = {};

            if (formJobType === 1) {
                // Intune Audit Report
                jobConfig = {
                    RecipientEmail: formRecipientEmail,
                    TenantId: effectiveTenantId,
                    LookbackDays: formLookbackDays,
                    MaxEvents: formMaxEvents,
                    OnlyReportIfEventsFound: formOnlyReportIfEventsFound,
                };

                if (formCcEmails.trim()) {
                    jobConfig.CcEmails = formCcEmails;
                }

                if (formCategories.trim()) {
                    jobConfig.Categories = formCategories;
                }
            }

            // Create jobs for all selected workers
            const createPromises = formSelectedWorkers.map(workerId => {
                // Build payload for each worker
                const payload: Record<string, unknown> = {
                    jobType: formJobType,
                    jobName: formJobName.trim(),
                    isEnabled: formIsEnabled,
                    intervalHours: formIntervalHours,
                    jobConfigurationJson: JSON.stringify(jobConfig),
                    workerRegistrationId: workerId,
                };

                // Add firstRunAt if specified
                if (formFirstRunAt) {
                    payload.firstRunAt = new Date(formFirstRunAt).toISOString();
                }

                return request<ApiResponse>(
                    WORKER_JOBS_ENDPOINT,
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    }
                );
            });

            const results = await Promise.all(createPromises);
            const successCount = results.filter(r => r?.data?.data).length;

            if (successCount > 0) {
                setCreateSuccess(`Successfully created ${successCount} job(s) for ${formSelectedWorkers.length} worker(s)`);
                // Refresh jobs list
                await fetchJobs();
                
                // Reset form and close dialog after brief delay
                setTimeout(() => {
                    setShowCreateDialog(false);
                    resetCreateForm();
                }, 1500);
            } else {
                setCreateError('Failed to create any jobs');
            }
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create job');
        } finally {
            setCreating(false);
        }
    };

    const resetCreateForm = () => {
        setFormJobType(1);
        setFormJobName('');
        setFormIsEnabled(true);
        setFormIntervalHours(168);
        setFormFirstRunAt('');
        setFormSelectedWorkers([]);
        setFormRecipientEmail('');
        setFormCcEmails('');
        setFormLookbackDays(7);
        setFormCategories('');
        setFormOnlyReportIfEventsFound(false);
        setFormMaxEvents(500);
        setCreateError(null);
        setCreateSuccess(null);
    };

    const handleDeleteJob = async () => {
        if (!jobToDelete) return;

        setDeleting(true);
        setDeleteError(null);

        try {
            await request(
                `${WORKER_JOBS_ENDPOINT}/${jobToDelete.id}`,
                {
                    method: 'DELETE',
                }
            );

            // Close dialog and refresh jobs list
            setShowDeleteDialog(false);
            setJobToDelete(null);
            await fetchJobs();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete job');
        } finally {
            setDeleting(false);
        }
    };

    const didFetchRef = useRef(false);
    useEffect(() => {
        if (accounts.length === 0) return;
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]); // primitive dep — safe against reference churn

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchJobs(), 30_000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh]); // Only run when autoRefresh changes

    // ── Derived stats ─────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = jobs.length;
        const enabled = jobs.filter(j => j.isEnabled).length;
        const disabled = jobs.filter(j => !j.isEnabled).length;
        const poisoned = jobs.filter(j => j.isPoisoned).length;
        const withFailures = jobs.filter(j => j.totalFailedCount > 0).length;
        const totalFailures = jobs.reduce((sum, j) => sum + j.totalFailedCount, 0);

        return { total, enabled, disabled, poisoned, withFailures, totalFailures };
    }, [jobs]);

    // ── Filtered jobs ─────────────────────────────────────────────────────────
    const filteredJobs = useMemo(() => {
        let result = jobs;

        // Filter by worker
        if (filterWorker !== 'all') {
            result = result.filter(j => j.workerRegistrationId === filterWorker);
        }

        // Filter by enabled status
        if (filterEnabled === 'enabled') {
            result = result.filter(j => j.isEnabled);
        } else if (filterEnabled === 'disabled') {
            result = result.filter(j => !j.isEnabled);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.jobName.toLowerCase().includes(query) ||
                j.id.toLowerCase().includes(query) ||
                getJobTypeName(j.jobType).toLowerCase().includes(query) ||
                j.jobConfigurationJson.toLowerCase().includes(query)
            );
        }

        return result;
    }, [jobs, filterWorker, filterEnabled, searchQuery]);

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            key: 'jobName',
            label: 'Job Name',
            width: 280,
            render: (value: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                const execution = jobExecutions.get(job.id);
                
                return (
                    <div className="flex items-center gap-2">
                        {execution && (
                            <div className="relative">
                                {execution.status === 2 ? (
                                    // Running - spinning loader
                                    <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                                ) : (
                                    // Pending/Claimed - pulsing dot
                                    <div className="relative flex h-4 w-4 items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {String(value)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Badge className={`${getJobTypeColor(job.jobType)} text-white text-xs px-1.5 py-0`}>
                                    {getJobTypeName(job.jobType)}
                                </Badge>
                                {execution && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-300 text-blue-600">
                                        {execution.status === 2 ? 'Running' : 'Pending'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'workerRegistrationId',
            label: 'Worker',
            width: 200,
            render: (value: unknown) => {
                const workerId = value as string;
                const worker = workerData?.workers?.find(w => w.workerRegistrationId === workerId);
                
                if (!worker) {
                    return (
                        <div className="text-xs text-gray-400">
                            <div className="font-mono truncate">{workerId.substring(0, 8)}...</div>
                        </div>
                    );
                }
                
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{worker.machineName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{worker.workerInstanceId}</span>
                    </div>
                );
            }
        },
        {
            key: 'isEnabled',
            label: 'Status',
            width: 140,
            render: (value: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                return (
                    <div className="flex flex-col gap-1">
                        {value ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white w-fit">
                                <Zap className="h-3 w-3 mr-1" />
                                Enabled
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="w-fit">
                                <ZapOff className="h-3 w-3 mr-1" />
                                Disabled
                            </Badge>
                        )}
                        {job.isPoisoned && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white w-fit">
                                <Skull className="h-3 w-3 mr-1" />
                                Poisoned
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'lastRunAt',
            label: 'Last Run',
            width: 180,
            render: (value: unknown) => {
                const iso = value as string | null;
                return (
                    <div className="text-sm">
                        <div className="text-gray-900 dark:text-gray-100">{getRelativeTime(iso)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(iso)}</div>
                    </div>
                );
            }
        },
        {
            key: 'nextScheduledRun',
            label: 'Next Run',
            width: 180,
            render: (value: unknown) => {
                const iso = value as string | null;
                const relative = getNextRunRelative(iso);
                return (
                    <div className="text-sm">
                        <div className={`font-medium ${relative === 'Overdue' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {relative}
                        </div>
                        <div className="text-xs text-gray-500">{formatDateTime(iso)}</div>
                    </div>
                );
            }
        },
        {
            key: 'intervalHours',
            label: 'Interval',
            width: 100,
            render: (value: unknown) => {
                const hours = value as number;
                const days = hours / 24;
                return (
                    <div className="text-sm">
                        <div className="font-medium">{hours}h</div>
                        {days >= 1 && <div className="text-xs text-gray-500">({days}d)</div>}
                    </div>
                );
            }
        },
        {
            key: 'lastSuccessAt',
            label: 'Last Job Status',
            width: 140,
            render: (_: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                const lastSuccess = job.lastSuccessAt ? new Date(job.lastSuccessAt).getTime() : 0;
                const lastFailed = job.lastFailedAt ? new Date(job.lastFailedAt).getTime() : 0;
                
                // Determine the status based on most recent execution
                if (!lastSuccess && !lastFailed) {
                    // Never executed
                    return (
                        <Badge variant="outline" className="border-gray-400 text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Never Run
                        </Badge>
                    );
                } else if (lastSuccess > lastFailed) {
                    // Last run was successful
                    return (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                        </Badge>
                    );
                } else {
                    // Last run failed
                    return (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                        </Badge>
                    );
                }
            }
        },
        {
            key: 'id',
            label: 'Actions',
            width: 100,
            render: (_: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                                setIsDetailsOpen(true);
                            }}
                            title="View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setJobToDelete(job);
                                setDeleteError(null);
                                setShowDeleteDialog(true);
                            }}
                            title="Delete Job"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [jobExecutions, workerData?.workers]);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading && jobs.length === 0) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Jobs
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
    if (error && jobs.length === 0) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={fetchJobs} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <BriefcaseBusiness className="h-8 w-8 text-blue-500" />
                        Job Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Monitor and manage all worker jobs
                    </p>
                    {lastRefreshed && (
                        <p className="text-xs text-gray-400 mt-1">
                            Last refreshed: {formatDateTime(lastRefreshed.toISOString())}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                        />
                        <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh (30s)</Label>
                    </div>
                    <Button 
                        onClick={() => {
                            resetCreateForm();
                            setShowCreateDialog(true);
                        }} 
                        variant="default" 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job
                    </Button>
                    <Button onClick={fetchJobs} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* ── Stat Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Jobs</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.total}</p>
                            </div>
                            <BriefcaseBusiness className="h-10 w-10 text-blue-500 opacity-40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Enabled</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.enabled}</p>
                            </div>
                            <Zap className="h-10 w-10 text-green-500 opacity-40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Disabled</p>
                                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.disabled}</p>
                            </div>
                            <ZapOff className="h-10 w-10 text-gray-500 opacity-40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Poisoned</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.poisoned}</p>
                            </div>
                            <Skull className="h-10 w-10 text-red-500 opacity-40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">With Failures</p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.withFailures}</p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-orange-500 opacity-40" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Failures</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.totalFailures}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-purple-500 opacity-40" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Filters & Search ──────────────────────────────────────────── */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search jobs by name, ID, type, or configuration..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        {/* Worker filter */}
                        {workerData?.workers && workerData.workers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-gray-400 shrink-0" />
                                <select
                                    value={filterWorker}
                                    onChange={(e) => setFilterWorker(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="all">All Workers</option>
                                    {workerData.workers.map((w) => (
                                        <option key={w.workerRegistrationId} value={w.workerRegistrationId}>
                                            {w.machineName} – {w.workerInstanceId}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant={filterEnabled === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterEnabled('all')}
                            >
                                All Jobs
                            </Button>
                            <Button
                                variant={filterEnabled === 'enabled' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterEnabled('enabled')}
                            >
                                <Zap className="h-4 w-4 mr-1" />
                                Enabled
                            </Button>
                            <Button
                                variant={filterEnabled === 'disabled' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterEnabled('disabled')}
                            >
                                <ZapOff className="h-4 w-4 mr-1" />
                                Disabled
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Jobs Table ────────────────────────────────────────────────── */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Active Jobs
                        <Badge variant="secondary" className="ml-2">
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {filterWorker !== 'all' && (() => {
                            const w = workerData?.workers?.find(x => x.workerRegistrationId === filterWorker);
                            return w ? `Worker: ${w.machineName}` : 'Filtered by worker';
                        })()}
                        {filterWorker !== 'all' && filterEnabled !== 'all' && ' · '}
                        {filterEnabled !== 'all' && `Showing ${filterEnabled} jobs`}
                        {searchQuery && ` · Search: "${searchQuery}"`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredJobs.length > 0 ? (
                        <DataTable
                            data={filteredJobs}
                            columns={columns}
                            showPagination={true}
                            itemsPerPage={25}
                            onRowClick={(row) => {
                                const job = row as unknown as WorkerJob;
                                router.push(`/worker/jobs/${job.id}`);
                            }}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <BriefcaseBusiness className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No jobs found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {searchQuery || filterEnabled !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No jobs have been configured yet'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Job Details Dialog ────────────────────────────────────────── */}
            <JobDetailsDialog
                job={selectedJob}
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedJob(null);
                }}
            />

            {/* ── Create Job Dialog ──────────────────────────────────────────── */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-500" />
                            Create New Job
                        </DialogTitle>
                        <DialogDescription>
                            Configure a new worker job to run automated tasks
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Success Message */}
                        {createSuccess && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{createSuccess}</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {createError && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{createError}</span>
                                </div>
                            </div>
                        )}

                        {/* Job Type */}
                        <div className="space-y-2">
                            <Label htmlFor="jobType">Job Type *</Label>
                            <select
                                id="jobType"
                                value={formJobType}
                                onChange={(e) => setFormJobType(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                            >
                                <option value={1}>Intune Audit Report</option>
                            </select>
                            <p className="text-xs text-gray-500">Select the type of automated task</p>
                        </div>

                        {/* Job Name */}
                        <div className="space-y-2">
                            <Label htmlFor="jobName">Job Name *</Label>
                            <Input
                                id="jobName"
                                type="text"
                                value={formJobName}
                                onChange={(e) => setFormJobName(e.target.value)}
                                placeholder="e.g., Weekly Intune Audit Report"
                                required
                            />
                            <p className="text-xs text-gray-500">A descriptive name for this job</p>
                        </div>

                        {/* Enable Job */}
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                {formIsEnabled ? <Zap className="h-5 w-5 text-green-500" /> : <ZapOff className="h-5 w-5 text-gray-400" />}
                                <div>
                                    <Label htmlFor="isEnabled" className="text-base font-medium cursor-pointer">
                                        Enable Job
                                    </Label>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Start executing this job immediately after creation
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="isEnabled"
                                checked={formIsEnabled}
                                onCheckedChange={setFormIsEnabled}
                            />
                        </div>

                        {/* Interval Hours */}
                        <div className="space-y-2">
                            <Label htmlFor="intervalHours">Run Interval (Hours) *</Label>
                            <Input
                                id="intervalHours"
                                type="number"
                                min="1"
                                max="8760"
                                value={formIntervalHours}
                                onChange={(e) => setFormIntervalHours(Number(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                Common: 24 (daily), 168 (weekly), 720 (monthly)
                            </p>
                        </div>

                        {/* First Run At */}
                        <div className="space-y-2">
                            <Label htmlFor="firstRunAt" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                First Run At (Optional)
                            </Label>
                            <Input
                                id="firstRunAt"
                                type="datetime-local"
                                value={formFirstRunAt}
                                onChange={(e) => setFormFirstRunAt(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            <p className="text-xs text-gray-500">
                                Schedule when this job should start. If empty, starts immediately based on interval.
                            </p>
                            {formFirstRunAt && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    ⏰ Will start at: {new Date(formFirstRunAt).toLocaleString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short'
                                    })}
                                </p>
                            )}
                        </div>

                        {/* Worker Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                Select Workers *
                            </Label>
                            <div className="text-xs text-gray-500 mb-3">
                                Choose which workers should execute this job. The job will be created for each selected worker.
                            </div>
                            {workerData && workerData.workers && workerData.workers.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                                    {/* Select All */}
                                    <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <input
                                            type="checkbox"
                                            id="select-all-workers"
                                            checked={formSelectedWorkers.length === workerData.workers.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormSelectedWorkers(workerData.workers.map(w => w.workerRegistrationId));
                                                } else {
                                                    setFormSelectedWorkers([]);
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label
                                            htmlFor="select-all-workers"
                                            className="text-sm font-medium cursor-pointer flex-1"
                                        >
                                            Select All ({workerData.workers.length} workers)
                                        </label>
                                    </div>
                                    <Separator />
                                    {/* Individual Workers */}
                                    {workerData.workers.map((worker) => {
                                        const isSelected = formSelectedWorkers.includes(worker.workerRegistrationId);
                                        const healthInfo = getHealthStatusInfo(worker.healthStatus, worker.timeSinceLastHeartbeat);
                                        
                                        return (
                                            <div
                                                key={worker.workerRegistrationId}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`worker-${worker.workerRegistrationId}`}
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormSelectedWorkers([...formSelectedWorkers, worker.workerRegistrationId]);
                                                        } else {
                                                            setFormSelectedWorkers(formSelectedWorkers.filter(id => id !== worker.workerRegistrationId));
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <label
                                                    htmlFor={`worker-${worker.workerRegistrationId}`}
                                                    className="text-sm cursor-pointer flex-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{worker.machineName}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{worker.workerInstanceId}</div>
                                                        </div>
                                                        <Badge className={`${healthInfo.color} text-white text-xs`}>
                                                            {healthInfo.label}
                                                        </Badge>
                                                    </div>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm">No workers available. Please register a worker first.</span>
                                    </div>
                                </div>
                            )}
                            {formSelectedWorkers.length > 0 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                    ✓ {formSelectedWorkers.length} worker(s) selected
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Job-Specific Configuration */}
                        {formJobType === 1 && (
                            <>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Intune Audit Report Configuration
                                </h3>

                                {/* Recipient Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="recipientEmail" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Recipient Email *
                                    </Label>
                                    <Input
                                        id="recipientEmail"
                                        type="email"
                                        value={formRecipientEmail}
                                        onChange={(e) => setFormRecipientEmail(e.target.value)}
                                        placeholder="admin@contoso.com"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">Primary email recipient for the audit report</p>
                                </div>

                                {/* CC Emails */}
                                <div className="space-y-2">
                                    <Label htmlFor="ccEmails">CC Emails (Optional)</Label>
                                    <Input
                                        id="ccEmails"
                                        type="text"
                                        value={formCcEmails}
                                        onChange={(e) => setFormCcEmails(e.target.value)}
                                        placeholder="manager@contoso.com, security@contoso.com"
                                    />
                                    <p className="text-xs text-gray-500">Comma-separated list of additional recipients</p>
                                </div>

                                {/* Tenant Information (Auto-populated) */}
                                {selectedTenant ? (
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start gap-2">
                                            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                    Target Tenant
                                                </p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                                    {selectedTenant.displayName || selectedTenant.domainName}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-300 font-mono mt-1">
                                                    {selectedTenant.tenantId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : effectiveTenantId ? (
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start gap-2">
                                            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                    Target Tenant (from login)
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-300 font-mono mt-1">
                                                    {effectiveTenantId}
                                                </p>
                                                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                                    Using tenant from your authentication session
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                                    No Tenant Available
                                                </p>
                                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                                    Please log in again to continue
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lookback Days */}
                                <div className="space-y-2">
                                    <Label htmlFor="lookbackDays">Lookback Days</Label>
                                    <Input
                                        id="lookbackDays"
                                        type="number"
                                        min="1"
                                        max="90"
                                        value={formLookbackDays}
                                        onChange={(e) => setFormLookbackDays(Number(e.target.value))}
                                        className="max-w-xs"
                                    />
                                    <p className="text-xs text-gray-500">Number of days to look back for audit events (1-90)</p>
                                </div>

                                {/* Max Events */}
                                <div className="space-y-2">
                                    <Label htmlFor="maxEvents">Maximum Events</Label>
                                    <Input
                                        id="maxEvents"
                                        type="number"
                                        min="1"
                                        max="10000"
                                        value={formMaxEvents}
                                        onChange={(e) => setFormMaxEvents(Number(e.target.value))}
                                        className="max-w-xs"
                                    />
                                    <p className="text-xs text-gray-500">Maximum number of events to include in report</p>
                                </div>


                                {/* Only Report If Events Found */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <Label htmlFor="onlyReportIfEventsFound" className="text-base font-medium cursor-pointer">
                                            Only Report If Events Found
                                        </Label>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            Skip sending report if no audit events are found
                                        </p>
                                    </div>
                                    <Switch
                                        id="onlyReportIfEventsFound"
                                        checked={formOnlyReportIfEventsFound}
                                        onCheckedChange={setFormOnlyReportIfEventsFound}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateJob}
                            disabled={creating || !effectiveTenantId || !formRecipientEmail}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title={!effectiveTenantId ? 'No tenant ID available' : !formRecipientEmail ? 'Please enter recipient email' : ''}
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Create Job
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Job Confirmation Dialog ─────────────────────────────── */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Trash2 className="h-5 w-5" />
                            Delete Job
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this job? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Job Info */}
                        {jobToDelete && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div className="flex items-start gap-3">
                                    <BriefcaseBusiness className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                            {jobToDelete.jobName}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={`${getJobTypeColor(jobToDelete.jobType)} text-white text-xs`}>
                                                {getJobTypeName(jobToDelete.jobType)}
                                            </Badge>
                                            {jobToDelete.isEnabled ? (
                                                <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                                    <Zap className="h-3 w-3 mr-1" />
                                                    Enabled
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs border-gray-400 text-gray-600">
                                                    <ZapOff className="h-3 w-3 mr-1" />
                                                    Disabled
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                            Interval: {jobToDelete.intervalHours}h
                                            {jobToDelete.lastRunAt && (
                                                <> • Last run: {formatDateTime(jobToDelete.lastRunAt)}</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {deleteError && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{deleteError}</span>
                                </div>
                            </div>
                        )}

                        {/* Warning */}
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Warning</p>
                                <p className="mt-1">
                                    Deleting this job will:
                                </p>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                                    <li>Stop all scheduled executions</li>
                                    <li>Remove job configuration permanently</li>
                                    <li>Delete execution history</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setJobToDelete(null);
                                setDeleteError(null);
                            }}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteJob}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Job
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}