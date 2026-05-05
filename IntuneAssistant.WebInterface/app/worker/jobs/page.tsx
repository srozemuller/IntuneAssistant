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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    RefreshCw, BriefcaseBusiness, CheckCircle, XCircle, AlertTriangle,
    Clock, Calendar, Search, Loader2, Zap, ZapOff, Skull, Settings,
    TrendingUp, Activity, Plus, Save, Mail, Trash2, Server,
    Filter, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { WORKER_JOBS_ENDPOINT, WORKER_JOB_LATEST_EXECUTION_ENDPOINT, WORKER_OVERVIEW_ENDPOINT } from '@/lib/constants';
import { DataTable } from '@/components/DataTable';
import { useTenant } from '@/contexts/TenantContext';
import { WorkerOverview } from '@/types/worker';

// ─── Types ────────────────────────────────────────────────────────────────────

// Matches the actual API response fields
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

interface ActiveExecution {
    id: string;
    jobConfigId: string;
    status: number; // 0=Pending, 1=Claimed, 2=InProgress
}

interface ActiveExecutionResponse {
    status: string;
    message: string;
    details: unknown[];
    data: ActiveExecution;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTimeSince(ts: string): { totalSeconds: number } {
    const dayMatch = ts.match(/^(\d+)\.(\d+):(\d+):(\d+)/);
    if (dayMatch) {
        const total = parseInt(dayMatch[1], 10) * 86400
            + parseInt(dayMatch[2], 10) * 3600
            + parseInt(dayMatch[3], 10) * 60
            + parseInt(dayMatch[4], 10);
        return { totalSeconds: total };
    }
    const match = ts.match(/^(\d+):(\d+):(\d+)/);
    if (!match) return { totalSeconds: 0 };
    return {
        totalSeconds: parseInt(match[1], 10) * 3600
            + parseInt(match[2], 10) * 60
            + parseInt(match[3], 10),
    };
}

function getHealthStatusInfo(healthStatus: number, timeSince: string) {
    const { totalSeconds } = parseTimeSince(timeSince);
    if (totalSeconds > 3600 || healthStatus === 2) return { label: 'Offline', color: 'bg-red-500' };
    if (totalSeconds > 600  || healthStatus === 1) return { label: 'Stale',   color: 'bg-yellow-500' };
    if (healthStatus === 3)                         return { label: 'Unknown', color: 'bg-gray-500' };
    return { label: 'Healthy', color: 'bg-green-500' };
}

function getJobTypeName(jobType: number): string {
    const types: Record<number, string> = {
        1: 'Intune Audit Report',
        //2: 'Entra Audit Report',
        //3: 'Compliance Report',
        //4: 'Security Report',
        //5: 'Configuration Backup',
        //6: 'Automated Remediation',
        7: 'Configuration Drift Monitor',
    };
    return types[jobType] || `Job Type ${jobType}`;
}

function getJobTypeColor(jobType: number): string {
    const colors: Record<number, string> = {
        1: 'bg-blue-500', 2: 'bg-purple-500', 3: 'bg-green-500',
        4: 'bg-orange-500', 5: 'bg-cyan-500', 6: 'bg-red-500', 7: 'bg-yellow-500',
    };
    return colors[jobType] || 'bg-gray-500';
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
        }).format(new Date(iso));
    } catch { return iso; }
}

function getRelativeTime(iso: string | null): string {
    if (!iso) return '—';
    try {
        const diffMs = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diffMs / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    } catch { return iso; }
}

/** Extract tenantId from jobConfigurationJson (handles both PascalCase and camelCase). */
function getTenantIdFromConfig(json: string): string | null {
    try {
        const parsed = JSON.parse(json) as Record<string, unknown>;
        return (parsed.TenantId ?? parsed.tenantId ?? null) as string | null;
    } catch { return null; }
}

function getNextRunRelative(iso: string | null): string {
    if (!iso) return '—';
    try {
        const diffMs = new Date(iso).getTime() - Date.now();
        if (diffMs < 0) return 'Overdue';
        const mins = Math.floor(diffMs / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (mins < 60) return `in ${mins}m`;
        if (hours < 24) return `in ${hours}h`;
        return `in ${days}d`;
    } catch { return iso; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkerJobsPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();
    const { selectedTenant } = useTenant();

    const tenantIdFromClaims = accounts[0]?.tenantId || (accounts[0]?.idTokenClaims?.tid as string | undefined);
    const effectiveTenantId = selectedTenant?.tenantId || tenantIdFromClaims;

    // ── Data state ────────────────────────────────────────────────────────────
    const [jobs, setJobs] = useState<WorkerJob[]>([]);
    const [workerData, setWorkerData] = useState<WorkerOverview | null>(null);
    const [activeExecutions, setActiveExecutions] = useState<Map<string, ActiveExecution>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [filterWorker, setFilterWorker] = useState<string>('all');
    const [filterCustomer, setFilterCustomer] = useState<string>('all');

    // ── Delete dialog state ───────────────────────────────────────────────────
    const [jobToDelete, setJobToDelete] = useState<WorkerJob | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // ── Create dialog state ───────────────────────────────────────────────────
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);

    // Create form fields
    const [formJobType, setFormJobType] = useState(1);
    const [formJobName, setFormJobName] = useState('');
    const [formIsEnabled, setFormIsEnabled] = useState(true);
    const [formIntervalHours, setFormIntervalHours] = useState(168);
    const [formFirstRunAt, setFormFirstRunAt] = useState('');
    const [formSelectedWorkers, setFormSelectedWorkers] = useState<string[]>([]);
    const [formRecipientEmail, setFormRecipientEmail] = useState('');
    const [formCcEmails, setFormCcEmails] = useState('');
    const [formLookbackDays, setFormLookbackDays] = useState(7);
    const [formCategories, setFormCategories] = useState('');
    const [formOnlyReportIfEventsFound, setFormOnlyReportIfEventsFound] = useState(false);
    const [formMaxEvents, setFormMaxEvents] = useState(500);
    const [formWorkerSearch, setFormWorkerSearch] = useState('');

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchJobs = useCallback(async () => {
        if (accounts.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const [jobsResult, workerResult] = await Promise.all([
                request<ApiResponse>(WORKER_JOBS_ENDPOINT),
                request<{ status: string; data: WorkerOverview }>(WORKER_OVERVIEW_ENDPOINT),
            ]);

            if (jobsResult?.data?.data) {
                const list = jobsResult.data.data;
                setJobs(list);
                setLastRefreshed(new Date());

                // Fetch active (non-terminal) execution status for each job
                const execMap = new Map<string, ActiveExecution>();
                await Promise.all(list.map(async (job) => {
                    try {
                        const r = await request<ActiveExecutionResponse>(
                            WORKER_JOB_LATEST_EXECUTION_ENDPOINT(job.id)
                        );
                        if (r?.data?.data) {
                            const ex = r.data.data;
                            if (ex.status === 0 || ex.status === 1 || ex.status === 2) {
                                execMap.set(job.id, ex);
                            }
                        }
                    } catch { /* no active execution */ }
                }));
                setActiveExecutions(execMap);
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

    const didFetchRef = useRef(false);
    useEffect(() => {
        if (accounts.length === 0 || didFetchRef.current) return;
        didFetchRef.current = true;
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    useEffect(() => {
        if (!autoRefresh) return;
        const id = setInterval(fetchJobs, 30_000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh]);

    // ── Create ────────────────────────────────────────────────────────────────

    const resetCreateForm = () => {
        setFormJobType(1); setFormJobName(''); setFormIsEnabled(true);
        setFormIntervalHours(168); setFormFirstRunAt(''); setFormSelectedWorkers([]);
        setFormRecipientEmail(''); setFormCcEmails(''); setFormLookbackDays(7);
        setFormCategories(''); setFormOnlyReportIfEventsFound(false); setFormMaxEvents(500);
        setFormWorkerSearch('');
        setCreateError(null); setCreateSuccess(null);
    };

    const handleCreateJob = async () => {
        setCreateError(null);
        setCreateSuccess(null);

        if (!formJobName.trim())           return setCreateError('Job name is required');
        if (!formRecipientEmail.trim())    return setCreateError('Recipient email is required');
        if (!effectiveTenantId)            return setCreateError('No tenant ID available. Please log in again.');
        if (formSelectedWorkers.length === 0) return setCreateError('Please select at least one worker');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formRecipientEmail))
            return setCreateError('Invalid recipient email format');

        setCreating(true);
        try {
            const jobConfig: Record<string, unknown> = {
                RecipientEmail: formRecipientEmail,
                TenantId: effectiveTenantId,
                LookbackDays: formLookbackDays,
                MaxEvents: formMaxEvents,
                OnlyReportIfEventsFound: formOnlyReportIfEventsFound,
                ...(formCcEmails.trim()   && { CcEmails:   formCcEmails }),
                ...(formCategories.trim() && { Categories: formCategories }),
            };

            const results = await Promise.all(
                formSelectedWorkers.map(workerId => {
                    const payload: Record<string, unknown> = {
                        jobType: formJobType,
                        jobName: formJobName.trim(),
                        isEnabled: formIsEnabled,
                        intervalHours: formIntervalHours,
                        jobConfigurationJson: JSON.stringify(jobConfig),
                        workerRegistrationId: workerId,
                    };
                    if (formFirstRunAt) payload.firstRunAt = new Date(formFirstRunAt).toISOString();
                    return request<ApiResponse>(WORKER_JOBS_ENDPOINT, { method: 'POST', body: JSON.stringify(payload) });
                })
            );

            const ok = results.filter(r => r?.data?.data).length;
            if (ok > 0) {
                setCreateSuccess(`Created ${ok} job(s) for ${formSelectedWorkers.length} worker(s)`);
                await fetchJobs();
                setTimeout(() => { setShowCreateDialog(false); resetCreateForm(); }, 1500);
            } else {
                setCreateError('Failed to create any jobs');
            }
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create job');
        } finally {
            setCreating(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDeleteJob = async () => {
        if (!jobToDelete) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await request(`${WORKER_JOBS_ENDPOINT}/${jobToDelete.id}`, { method: 'DELETE' });
            setJobToDelete(null);
            await fetchJobs();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete job');
        } finally {
            setDeleting(false);
        }
    };

    // ── Derived state ─────────────────────────────────────────────────────────

    const stats = useMemo(() => ({
        total:         jobs.length,
        enabled:       jobs.filter(j => j.isEnabled).length,
        disabled:      jobs.filter(j => !j.isEnabled).length,
        poisoned:      jobs.filter(j => j.isPoisoned).length,
        withFailures:  jobs.filter(j => j.totalFailedCount > 0).length,
        totalFailures: jobs.reduce((s, j) => s + j.totalFailedCount, 0),
    }), [jobs]);

    /** Unique customers derived from jobs — resolved via worker tenantId / tenantDisplayName. */
    const uniqueCustomers = useMemo(() => {
        const map = new Map<string, string>(); // tenantId → display label
        jobs.forEach(job => {
            const worker = workerData?.workers?.find(w => w.workerRegistrationId === job.workerRegistrationId);
            const tenantId = worker?.tenantId || getTenantIdFromConfig(job.jobConfigurationJson);
            if (!tenantId) return;
            if (!map.has(tenantId)) {
                const label = worker?.tenantDisplayName || tenantId;
                map.set(tenantId, label);
            }
        });
        return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
    }, [jobs, workerData?.workers]);

    const filteredJobs = useMemo(() => {
        let r = jobs;
        if (filterCustomer !== 'all') {
            r = r.filter(j => {
                const worker = workerData?.workers?.find(w => w.workerRegistrationId === j.workerRegistrationId);
                const tenantId = worker?.tenantId || getTenantIdFromConfig(j.jobConfigurationJson);
                return tenantId === filterCustomer;
            });
        }
        if (filterWorker !== 'all')       r = r.filter(j => j.workerRegistrationId === filterWorker);
        if (filterEnabled === 'enabled')  r = r.filter(j => j.isEnabled);
        if (filterEnabled === 'disabled') r = r.filter(j => !j.isEnabled);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter(j =>
                j.jobName.toLowerCase().includes(q) ||
                j.id.toLowerCase().includes(q) ||
                getJobTypeName(j.jobType).toLowerCase().includes(q) ||
                j.jobConfigurationJson.toLowerCase().includes(q)
            );
        }
        return r;
    }, [jobs, filterCustomer, filterWorker, filterEnabled, searchQuery, workerData?.workers]);

    const activeFilterCount = (filterCustomer !== 'all' ? 1 : 0)
        + (filterWorker !== 'all' ? 1 : 0)
        + (filterEnabled !== 'all' ? 1 : 0)
        + (searchQuery.trim() ? 1 : 0);

    const clearFilters = () => {
        setFilterCustomer('all');
        setFilterWorker('all');
        setFilterEnabled('all');
        setSearchQuery('');
    };

    // ── Table columns ─────────────────────────────────────────────────────────

    const columns = useMemo(() => [
        {
            key: 'jobName',
            label: 'Job Name',
            width: 280,
            render: (value: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                const ex = activeExecutions.get(job.id);
                return (
                    <div className="flex items-center gap-2">
                        {ex && (
                            ex.status === 2
                                ? <Loader2 className="h-4 w-4 text-yellow-500 animate-spin shrink-0" />
                                : <span className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                                  </span>
                        )}
                        <div>
                            <div className="font-medium text-sm">{String(value)}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Badge className={`${getJobTypeColor(job.jobType)} text-white text-xs px-1.5 py-0`}>
                                    {getJobTypeName(job.jobType)}
                                </Badge>
                                {ex && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-300 text-blue-600">
                                        {ex.status === 2 ? 'In Progress' : ex.status === 1 ? 'Claimed' : 'Pending'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'workerRegistrationId',
            label: 'Worker',
            width: 200,
            render: (value: unknown) => {
                const worker = workerData?.workers?.find(w => w.workerRegistrationId === value);
                if (!worker) return <span className="text-xs text-gray-400 font-mono">{String(value).substring(0, 8)}…</span>;
                return (
                    <div>
                        <div className="text-sm font-medium">{worker.machineName}</div>
                        <div className="text-xs text-gray-500 font-mono">{worker.workerInstanceId}</div>
                    </div>
                );
            },
        },
        {
            key: 'jobConfigurationJson',
            label: 'Customer',
            width: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                // Prefer tenantDisplayName from the mapped worker; fall back to tenantId in the config
                const worker = workerData?.workers?.find(w => w.workerRegistrationId === job.workerRegistrationId);
                const displayName = worker?.tenantDisplayName;
                const tenantId = worker?.tenantId || getTenantIdFromConfig(String(value));
                if (!displayName && !tenantId) {
                    return <span className="text-xs text-gray-400">—</span>;
                }
                return (
                    <div>
                        {displayName && <div className="text-sm font-medium">{displayName}</div>}
                        {tenantId && (
                            <div className="text-xs text-gray-500 font-mono truncate" title={tenantId}>
                                {tenantId}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'isEnabled',
            label: 'Status',
            width: 130,
            render: (value: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                return (
                    <div className="flex flex-col gap-1">
                        {value
                            ? <Badge className="bg-green-500 hover:bg-green-600 text-white w-fit"><Zap className="h-3 w-3 mr-1" />Enabled</Badge>
                            : <Badge variant="secondary" className="w-fit"><ZapOff className="h-3 w-3 mr-1" />Disabled</Badge>
                        }
                        {job.isPoisoned && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white w-fit"><Skull className="h-3 w-3 mr-1" />Poisoned</Badge>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'lastRunAt',
            label: 'Last Run',
            width: 160,
            render: (value: unknown) => {
                const iso = value as string | null;
                return (
                    <div className="text-sm">
                        <div>{getRelativeTime(iso)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(iso)}</div>
                    </div>
                );
            },
        },
        {
            key: 'nextScheduledRun',
            label: 'Next Run',
            width: 160,
            render: (value: unknown) => {
                const iso = value as string | null;
                const rel = getNextRunRelative(iso);
                return (
                    <div className="text-sm">
                        <div className={rel === 'Overdue' ? 'font-medium text-red-600 dark:text-red-400' : ''}>{rel}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(iso)}</div>
                    </div>
                );
            },
        },
        {
            key: 'intervalHours',
            label: 'Interval',
            width: 90,
            render: (value: unknown) => {
                const h = value as number;
                return (
                    <div className="text-sm">
                        <div className="font-medium">{h}h</div>
                        {h >= 24 && <div className="text-xs text-gray-500">{h / 24}d</div>}
                    </div>
                );
            },
        },
        {
            key: 'lastSuccessAt',
            label: 'Last Status',
            width: 120,
            render: (_: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                if (!job.lastRunAt) {
                    return <Badge variant="outline" className="border-gray-400 text-gray-600"><Clock className="h-3 w-3 mr-1" />Never Run</Badge>;
                }
                const lastSuccessTime = job.lastSuccessAt ? new Date(job.lastSuccessAt).getTime() : 0;
                const lastFailedTime  = job.lastFailedAt  ? new Date(job.lastFailedAt).getTime()  : 0;
                const lastWasFail     = lastFailedTime > lastSuccessTime;
                return lastWasFail
                    ? <Badge className="bg-red-500 hover:bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
                    : <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
            },
        },
        {
            key: 'id',
            label: '',
            width: 60,
            render: (_: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as WorkerJob;
                return (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => { e.stopPropagation(); setJobToDelete(job); setDeleteError(null); }}
                        title="Delete Job"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                );
            },
        },
    ], [activeExecutions, workerData?.workers]);

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading && jobs.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error && jobs.length === 0) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">{error}</span>
                        <Button onClick={fetchJobs} variant="outline" size="sm" className="ml-auto">
                            <RefreshCw className="h-4 w-4 mr-2" />Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <BriefcaseBusiness className="h-8 w-8 text-blue-500" />
                        Job Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all worker jobs</p>
                    {lastRefreshed && (
                        <p className="text-xs text-gray-400 mt-1">Last refreshed: {formatDateTime(lastRefreshed.toISOString())}</p>
                    )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">Auto-refresh (30s)</Label>
                    </div>
                    <Button onClick={() => { resetCreateForm(); setShowCreateDialog(true); }}>
                        <Plus className="h-4 w-4 mr-2" />Create Job
                    </Button>
                    <Button onClick={fetchJobs} variant="outline" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total',          value: stats.total,        icon: BriefcaseBusiness, color: 'text-blue-600' },
                    { label: 'Enabled',        value: stats.enabled,      icon: Zap,               color: 'text-green-600' },
                    { label: 'Disabled',       value: stats.disabled,     icon: ZapOff,            color: 'text-gray-600' },
                    { label: 'Poisoned',       value: stats.poisoned,     icon: Skull,             color: 'text-red-600' },
                    { label: 'With Failures',  value: stats.withFailures, icon: AlertTriangle,     color: 'text-orange-600' },
                    { label: 'Total Failures', value: stats.totalFailures,icon: TrendingUp,        color: 'text-purple-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                                </div>
                                <Icon className={`h-8 w-8 opacity-30 ${color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                        <button
                            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                            className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                            Filters
                            {isFiltersExpanded
                                ? <ChevronUp className="h-4 w-4" />
                                : <ChevronDown className="h-4 w-4" />
                            }
                        </button>
                        <div className="flex items-center gap-2">
                            {!isFiltersExpanded && activeFilterCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {activeFilterCount} active
                                </Badge>
                            )}
                            {activeFilterCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </CardTitle>

                    {/* Active filter chips shown when collapsed */}
                    {!isFiltersExpanded && activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                            {searchQuery && (
                                <Badge variant="outline" className="text-xs">Search: {searchQuery}</Badge>
                            )}
                            {filterCustomer !== 'all' && (
                                <Badge variant="outline" className="text-xs">
                                    Customer: {uniqueCustomers.find(c => c.id === filterCustomer)?.label ?? filterCustomer}
                                </Badge>
                            )}
                            {filterWorker !== 'all' && (
                                <Badge variant="outline" className="text-xs">
                                    Worker: {workerData?.workers?.find(w => w.workerRegistrationId === filterWorker)?.machineName ?? filterWorker}
                                </Badge>
                            )}
                            {filterEnabled !== 'all' && (
                                <Badge variant="outline" className="text-xs">
                                    Status: {filterEnabled}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardHeader>

                {isFiltersExpanded && (
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by name, ID, type, or configuration…"
                                className="w-full pl-9 pr-9 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Customer filter */}
                            {uniqueCustomers.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-gray-200">Customer</label>
                                    <select
                                        value={filterCustomer}
                                        onChange={e => setFilterCustomer(e.target.value)}
                                        className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="all">All Customers</option>
                                        {uniqueCustomers.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Worker filter */}
                            {workerData?.workers && workerData.workers.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium dark:text-gray-200">Worker</label>
                                    <select
                                        value={filterWorker}
                                        onChange={e => setFilterWorker(e.target.value)}
                                        className="w-full h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="all">All Workers</option>
                                        {workerData.workers.map(w => (
                                            <option key={w.workerRegistrationId} value={w.workerRegistrationId}>
                                                {w.machineName} – {w.workerInstanceId}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Status filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium dark:text-gray-200">Status</label>
                                <div className="flex gap-2">
                                    {(['all', 'enabled', 'disabled'] as const).map(f => (
                                        <Button
                                            key={f}
                                            size="sm"
                                            variant={filterEnabled === f ? 'default' : 'outline'}
                                            onClick={() => setFilterEnabled(f)}
                                        >
                                            {f === 'enabled' && <Zap className="h-3 w-3 mr-1" />}
                                            {f === 'disabled' && <ZapOff className="h-3 w-3 mr-1" />}
                                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Active filter chips with remove buttons */}
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                                {searchQuery && (
                                    <Badge variant="outline" className="text-xs">
                                        Search: {searchQuery}
                                        <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {filterCustomer !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Customer: {uniqueCustomers.find(c => c.id === filterCustomer)?.label ?? filterCustomer}
                                        <button onClick={() => setFilterCustomer('all')} className="ml-1 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {filterWorker !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Worker: {workerData?.workers?.find(w => w.workerRegistrationId === filterWorker)?.machineName ?? filterWorker}
                                        <button onClick={() => setFilterWorker('all')} className="ml-1 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {filterEnabled !== 'all' && (
                                    <Badge variant="outline" className="text-xs">
                                        Status: {filterEnabled}
                                        <button onClick={() => setFilterEnabled('all')} className="ml-1 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Table */}
            <Card className="relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Jobs
                        <Badge variant="secondary">{filteredJobs.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredJobs.length > 0 ? (
                        <DataTable
                            data={filteredJobs}
                            columns={columns}
                            showPagination
                            itemsPerPage={25}
                            onRowClick={row => router.push(`/worker/jobs/${(row as unknown as WorkerJob).id}`)}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <BriefcaseBusiness className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 mb-4">
                                {activeFilterCount > 0 ? 'No jobs match your filters' : 'No jobs configured yet'}
                            </p>
                            {activeFilterCount > 0 && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Job Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={open => { if (!open) resetCreateForm(); setShowCreateDialog(open); }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-500" />Create New Job
                        </DialogTitle>
                        <DialogDescription>Configure a new worker job</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {createSuccess && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-4 w-4 shrink-0" />{createSuccess}
                            </div>
                        )}
                        {createError && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2 text-red-700 dark:text-red-400">
                                <XCircle className="h-4 w-4 shrink-0" />{createError}
                            </div>
                        )}

                        {/* Job Type */}
                        <div className="space-y-1.5">
                            <Label>Job Type *</Label>
                            <select
                                value={formJobType}
                                onChange={e => setFormJobType(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value={1}>Intune Audit Report</option>
                                {/*<option value={2}>Entra Audit Report</option>*/}
                                {/*<option value={3}>Compliance Report</option>*/}
                                {/*<option value={4}>Security Report</option>*/}
                                {/*<option value={5}>Configuration Backup</option>*/}
                                {/*<option value={6}>Automated Remediation</option>*/}
                                <option value={7}>Configuration Drift Monitor</option>
                            </select>
                        </div>

                        {/* Job Name */}
                        <div className="space-y-1.5">
                            <Label>Job Name *</Label>
                            <Input value={formJobName} onChange={e => setFormJobName(e.target.value)} placeholder="e.g., Weekly Intune Audit Report" />
                        </div>

                        {/* Enabled toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                                <Label className="text-sm font-medium cursor-pointer">Enable Job</Label>
                                <p className="text-xs text-gray-500 mt-0.5">Start executing immediately after creation</p>
                            </div>
                            <Switch checked={formIsEnabled} onCheckedChange={setFormIsEnabled} />
                        </div>

                        {/* Interval */}
                        <div className="space-y-1.5">
                            <Label>Interval (hours) *</Label>
                            <Input type="number" min={1} max={8760} value={formIntervalHours} onChange={e => setFormIntervalHours(Number(e.target.value))} className="max-w-xs" />
                            <p className="text-xs text-gray-500">24 = daily · 168 = weekly · 720 = monthly</p>
                        </div>

                        {/* First Run At */}
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" />First Run At (optional)</Label>
                            <Input
                                type="datetime-local"
                                value={formFirstRunAt}
                                onChange={e => setFormFirstRunAt(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="max-w-xs"
                            />
                            {formFirstRunAt && (
                                <p className="text-xs text-blue-600">⏰ {new Date(formFirstRunAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
                            )}
                        </div>

                        {/* Worker Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Server className="h-4 w-4" />Select Workers *</Label>
                            {workerData?.workers?.length ? (
                                <div className="border rounded-lg overflow-hidden">
                                    {/* Search */}
                                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formWorkerSearch}
                                                onChange={e => setFormWorkerSearch(e.target.value)}
                                                placeholder="Search by machine name, customer, instance ID…"
                                                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            {formWorkerSearch && (
                                                <button
                                                    onClick={() => setFormWorkerSearch('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    type="button"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Select All (approved only, respects search) */}
                                    {(() => {
                                        const q = formWorkerSearch.toLowerCase().trim();
                                        const visibleWorkers = workerData.workers.filter(w =>
                                            !q ||
                                            w.machineName.toLowerCase().includes(q) ||
                                            (w.tenantDisplayName || '').toLowerCase().includes(q) ||
                                            w.workerInstanceId.toLowerCase().includes(q) ||
                                            w.workerRegistrationId.toLowerCase().includes(q) ||
                                            (w.tenantId || '').toLowerCase().includes(q)
                                        );
                                        const approvedVisible = visibleWorkers.filter(w => w.registrationStatus === 1);
                                        const allApprovedSelected = approvedVisible.length > 0 && approvedVisible.every(w => formSelectedWorkers.includes(w.workerRegistrationId));
                                        const totalApproved = workerData.workers.filter(w => w.registrationStatus === 1).length;
                                        return (
                                            <>
                                                <label className="flex items-center gap-3 px-3 py-2 bg-gray-50/70 dark:bg-gray-800/70 border-b cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={allApprovedSelected}
                                                        disabled={approvedVisible.length === 0}
                                                        onChange={e => setFormSelectedWorkers(
                                                            e.target.checked
                                                                ? [...new Set([...formSelectedWorkers, ...approvedVisible.map(w => w.workerRegistrationId)])]
                                                                : formSelectedWorkers.filter(id => !approvedVisible.some(w => w.workerRegistrationId === id))
                                                        )}
                                                        className="h-4 w-4"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {q
                                                            ? `Select all approved in results (${approvedVisible.length})`
                                                            : `Select all approved (${totalApproved} of ${workerData.workers.length})`
                                                        }
                                                    </span>
                                                </label>
                                                {/* Workers list */}
                                                <div className="max-h-56 overflow-y-auto divide-y">
                                                    {visibleWorkers.length === 0 ? (
                                                        <div className="px-3 py-4 text-center text-xs text-gray-500">
                                                            No workers match &quot;{formWorkerSearch}&quot;
                                                        </div>
                                                    ) : (
                                                        visibleWorkers.map(w => {
                                                            const health = getHealthStatusInfo(w.healthStatus, w.timeSinceLastHeartbeat);
                                                            const isApproved = w.registrationStatus === 1;
                                                            const registrationLabel = w.registrationStatus === 0 ? 'Pending'
                                                                : w.registrationStatus === 2 ? 'Rejected'
                                                                : null;
                                                            return (
                                                                <label
                                                                    key={w.workerRegistrationId}
                                                                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                                                                        isApproved
                                                                            ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                                                                            : 'cursor-not-allowed opacity-50 bg-gray-50/50 dark:bg-gray-800/30'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formSelectedWorkers.includes(w.workerRegistrationId)}
                                                                        disabled={!isApproved}
                                                                        onChange={e => {
                                                                            if (!isApproved) return;
                                                                            setFormSelectedWorkers(
                                                                                e.target.checked
                                                                                    ? [...formSelectedWorkers, w.workerRegistrationId]
                                                                                    : formSelectedWorkers.filter(id => id !== w.workerRegistrationId)
                                                                            );
                                                                        }}
                                                                        className="h-4 w-4"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium truncate">{w.machineName}</span>
                                                                            {!isApproved && registrationLabel && (
                                                                                <Badge variant="outline" className="text-xs shrink-0 border-amber-400 text-amber-600 dark:text-amber-400">
                                                                                    {registrationLabel}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {w.tenantDisplayName && (
                                                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">{w.tenantDisplayName}</div>
                                                                        )}
                                                                        <div className="text-xs text-gray-500 font-mono truncate">{w.workerInstanceId}</div>
                                                                    </div>
                                                                    <Badge className={`${health.color} text-white text-xs shrink-0`}>{health.label}</Badge>
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 flex items-center gap-2 text-yellow-700">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">No workers available. Please register a worker first.</span>
                                </div>
                            )}
                            {formSelectedWorkers.length > 0 && (
                                <p className="text-xs text-blue-600">✓ {formSelectedWorkers.length} worker(s) selected</p>
                            )}
                        </div>

                        <Separator />

                        {/* Job-specific config — currently only type 1 has a UI */}
                        {formJobType === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Settings className="h-4 w-4" />Intune Audit Report Configuration
                                </h3>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-2"><Mail className="h-4 w-4" />Recipient Email *</Label>
                                    <Input type="email" value={formRecipientEmail} onChange={e => setFormRecipientEmail(e.target.value)} placeholder="admin@contoso.com" />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>CC Emails (optional)</Label>
                                    <Input value={formCcEmails} onChange={e => setFormCcEmails(e.target.value)} placeholder="manager@contoso.com, security@contoso.com" />
                                    <p className="text-xs text-gray-500">Comma-separated</p>
                                </div>

                                {/* Tenant info (read-only) */}
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-sm">
                                    <p className="font-medium text-blue-900 dark:text-blue-100">Target Tenant</p>
                                    {selectedTenant ? (
                                        <>
                                            <p className="text-blue-800 dark:text-blue-200 mt-0.5">{selectedTenant.displayName || selectedTenant.domainName}</p>
                                            <p className="text-xs text-blue-600 font-mono mt-0.5">{selectedTenant.tenantId}</p>
                                        </>
                                    ) : effectiveTenantId ? (
                                        <p className="text-xs text-blue-600 font-mono mt-0.5">{effectiveTenantId}</p>
                                    ) : (
                                        <p className="text-amber-600 mt-0.5">No tenant available — please log in again</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Lookback Days</Label>
                                        <Input type="number" min={1} max={90} value={formLookbackDays} onChange={e => setFormLookbackDays(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Max Events</Label>
                                        <Input type="number" min={1} max={10000} value={formMaxEvents} onChange={e => setFormMaxEvents(Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Categories (optional)</Label>
                                    <Input value={formCategories} onChange={e => setFormCategories(e.target.value)} placeholder="Application, Policy, Device, Role" />
                                    <p className="text-xs text-gray-500">Comma-separated</p>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <Label className="text-sm font-medium cursor-pointer">Only Report If Events Found</Label>
                                        <p className="text-xs text-gray-500 mt-0.5">Skip sending if no events found</p>
                                    </div>
                                    <Switch checked={formOnlyReportIfEventsFound} onCheckedChange={setFormOnlyReportIfEventsFound} />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetCreateForm(); }} disabled={creating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateJob} disabled={creating || !effectiveTenantId}>
                            {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <><Save className="h-4 w-4 mr-2" />Create Job</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!jobToDelete} onOpenChange={open => { if (!open) { setJobToDelete(null); setDeleteError(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />Delete Job
                        </DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>

                    {jobToDelete && (
                        <div className="space-y-4 py-2">
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
                                <p className="font-semibold text-sm">{jobToDelete.jobName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`${getJobTypeColor(jobToDelete.jobType)} text-white text-xs`}>{getJobTypeName(jobToDelete.jobType)}</Badge>
                                    <span className="text-xs text-gray-500">{jobToDelete.intervalHours}h interval</span>
                                </div>
                            </div>

                            {deleteError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2 text-red-700">
                                    <XCircle className="h-4 w-4 shrink-0" />{deleteError}
                                </div>
                            )}

                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                <p>All scheduled executions and execution history will be permanently removed.</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setJobToDelete(null); setDeleteError(null); }} disabled={deleting}>Cancel</Button>
                        <Button onClick={handleDeleteJob} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                            {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting…</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

