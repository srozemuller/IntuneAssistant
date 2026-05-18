'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    RefreshCw,
    Cpu,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Server,
    ArrowUpCircle,
    Loader2,
    Save,
    ArrowLeft,
    ExternalLink,
    Plus,
    Trash2,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useMsal } from '@azure/msal-react';
import { apiRequest, ApiError } from '@/lib/apiRequest';
import { apiScope } from '@/lib/msalConfig';
import { WORKER_OVERVIEW_ENDPOINT, WORKER_CONFIG_ENDPOINT, WORKER_REGISTRATION_DELETE_ENDPOINT } from '@/lib/constants';
import { WorkerOverview, WorkerInstance, HealthStatus, RegistrationStatus } from '@/types/worker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: WorkerOverview;
}

interface ConnectedJob {
    jobId: string;
    jobName: string;
    jobType: string;
}

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

    if (totalSeconds > 3600 || healthStatus === HealthStatus.Offline) {
        return { label: 'Offline',  color: 'bg-red-500',    icon: XCircle,       textColor: 'text-red-600 dark:text-red-400' };
    }
    if (totalSeconds > 600  || healthStatus === HealthStatus.Stale) {
        return { label: 'Stale',    color: 'bg-yellow-500', icon: AlertTriangle, textColor: 'text-yellow-600 dark:text-yellow-400' };
    }
    if (healthStatus === HealthStatus.Unknown) {
        return { label: 'Unknown',  color: 'bg-gray-500',   icon: AlertTriangle, textColor: 'text-gray-500 dark:text-gray-400' };
    }
    return { label: 'Healthy', color: 'bg-green-500', icon: CheckCircle, textColor: 'text-green-600 dark:text-green-400' };
}

function getRegistrationStatusInfo(status: number) {
    switch (status) {
        case RegistrationStatus.Approved: return { label: 'Approved', color: 'bg-green-500' };
        case RegistrationStatus.Pending:  return { label: 'Pending',  color: 'bg-yellow-500' };
        case RegistrationStatus.Rejected: return { label: 'Rejected', color: 'bg-red-500' };
        case RegistrationStatus.Revoked:  return { label: 'Revoked',  color: 'bg-orange-500' };
        default:                          return { label: 'Unknown',  color: 'bg-gray-500' };
    }
}

function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return dateStr;
    }
}

function getUpdateRingLabel(ring: number) {
    switch (ring) {
        case 1: return 'Fast';
        case 2: return 'Stable';
        case 3: return 'Slow';
        default: return `Ring ${ring}`;
    }
}

function compareVersions(current: string, available: string): boolean {
    if (!current || !available) return false;
    
    const parseParts = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
    const currentParts = parseParts(current);
    const availableParts = parseParts(available);
    
    const maxLength = Math.max(currentParts.length, availableParts.length);
    for (let i = 0; i < maxLength; i++) {
        const currentPart = currentParts[i] || 0;
        const availablePart = availableParts[i] || 0;
        
        if (availablePart > currentPart) return true;
        if (availablePart < currentPart) return false;
    }
    
    return false;
}

export default function WorkerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { instance, accounts } = useMsal();
    const { request } = useApiRequest();
    
    const workerId = params.id as string;
    
    const [workerData, setWorkerData] = useState<WorkerOverview | null>(null);
    const [worker, setWorker] = useState<WorkerInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [connectedJobs, setConnectedJobs] = useState<ConnectedJob[]>([]);

    // Form state
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [updateRing, setUpdateRing] = useState(2);
    const [senderEmail, setSenderEmail] = useState('');

    const fetchWorkerData = useCallback(async (isRefresh = false) => {
        if (accounts.length === 0) return;          // ← no token without accounts
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await request<ApiResponse>(WORKER_OVERVIEW_ENDPOINT);

            if (response?.data?.data) {
                const data = response.data.data;
                setWorkerData(data);
                
                const foundWorker = data.workers?.find(
                    (w: WorkerInstance) => w.workerRegistrationId === workerId
                );
                
                if (foundWorker) {
                    setWorker(foundWorker);
                } else {
                    router.push('/worker');
                }
                
                setAutoUpdate(data.autoUpdate);
                setUpdateRing(data.updateRing);
                setSenderEmail(data.senderEmail || '');
            }
        } catch (error) {
            console.error('Failed to fetch worker data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [accounts, request, workerId, router]);

    const didFetchRef = useRef(false);
    useEffect(() => {
        if (accounts.length === 0) return;
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        fetchWorkerData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]); // primitive — won't re-fire on reference churn

    const handleSaveSettings = async () => {
        setSaving(true);
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (senderEmail && !emailRegex.test(senderEmail)) {
            setSaving(false);
            return;
        }

        try {
            const payload = {
                autoUpdate,
                updateRing,
                senderEmail: senderEmail || null,
            };

            await request(WORKER_CONFIG_ENDPOINT, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            fetchWorkerData(true);
        } catch (error) {
            console.error('Failed to update settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteWorker = async () => {
        if (!worker) return;
        setDeleting(true);
        setDeleteError(null);
        setConnectedJobs([]);
        try {
            // Use apiRequest directly — useApiRequest swallows errors internally
            // and we need the structured error body (connectedJobs) from ApiError.responseData
            let accessToken: string | undefined;
            if (accounts.length > 0) {
                const tokenResponse = await instance.acquireTokenSilent({
                    scopes: [apiScope],
                    account: accounts[0],
                });
                accessToken = tokenResponse.accessToken;
            }
            await apiRequest(
                WORKER_REGISTRATION_DELETE_ENDPOINT(worker.workerRegistrationId),
                { method: 'DELETE' },
                accessToken
            );
            // 2xx → success
            router.push('/worker');
        } catch (err) {
            if (err instanceof ApiError) {
                const body = err.responseData as { message?: string; data?: { connectedJobs?: ConnectedJob[] } } | undefined;
                const jobs = body?.data?.connectedJobs ?? [];
                if (jobs.length > 0) {
                    setConnectedJobs(jobs);
                    setDeleteError(body?.message ?? 'Cannot delete worker registration');
                } else {
                    setDeleteError(body?.message ?? err.message);
                }
            } else {
                setDeleteError(err instanceof Error ? err.message : 'Failed to delete worker registration');
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!worker || !workerData) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Worker Not Found</CardTitle>
                        <CardDescription>The specified worker could not be found</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/worker')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Workers
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const healthInfo = getHealthStatusInfo(worker.healthStatus, worker.timeSinceLastHeartbeat);
    const regInfo = getRegistrationStatusInfo(worker.registrationStatus);
    const { display: timeSinceDisplay } = parseTimeSince(worker.timeSinceLastHeartbeat);
    const HealthIcon = healthInfo.icon;
    const isUpdateAvailable = compareVersions(worker.currentVersion, workerData.availableVersion);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/worker')}
                        className="mb-4 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workers
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Server className="h-8 w-8 text-blue-500" />
                        {worker.machineName}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Worker Instance Details
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => fetchWorkerData(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => router.push(`/worker/jobs/new?workerId=${worker.workerRegistrationId}`)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Job
                    </Button>
                    {worker.workerDashboardUrl && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(worker.workerDashboardUrl || '', '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={() => { setDeleteError(null); setConnectedJobs([]); setDeleteDialogOpen(true); }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Registration
                    </Button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                        <HealthIcon className={`h-4 w-4 ${healthInfo.textColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${healthInfo.textColor}`}>{healthInfo.label}</div>
                        <p className="text-xs text-muted-foreground">{timeSinceDisplay} since last heartbeat</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registration</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Badge className={`${regInfo.color} text-white`}>{regInfo.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-2">{formatDateTime(worker.registeredAt)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Version</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{worker.currentVersion}</div>
                        {isUpdateAvailable && (
                            <Badge variant="outline" className="text-xs mt-1">
                                <ArrowUpCircle className="h-3 w-3 mr-1" />
                                Update to {workerData.availableVersion}
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Heartbeat</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{timeSinceDisplay}</div>
                        <p className="text-xs text-muted-foreground">{formatDateTime(worker.lastHeartbeat)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Worker Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Worker Information</CardTitle>
                        <CardDescription>Detailed information about this worker instance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-xs text-gray-500">Worker Instance ID</Label>
                            <div className="text-sm font-mono mt-1 break-all">{worker.workerInstanceId}</div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="text-xs text-gray-500">Worker Registration ID</Label>
                            <div className="text-sm font-mono mt-1 break-all">{worker.workerRegistrationId}</div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="text-xs text-gray-500">Machine Name</Label>
                            <div className="text-sm mt-1">{worker.machineName}</div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="text-xs text-gray-500">Operating System</Label>
                            <div className="text-sm mt-1">{worker.osVersion}</div>
                        </div>
                        <Separator />
                        <div>
                            <Label className="text-xs text-gray-500">Worker Version</Label>
                            <div className="text-sm font-mono mt-1">{worker.workerVersion}</div>
                        </div>
                        {worker.workerDashboardUrl && (
                            <>
                                <Separator />
                                <div>
                                    <Label className="text-xs text-gray-500">Dashboard URL</Label>
                                    <div className="text-sm mt-1 break-all">
                                        <a
                                            href={worker.workerDashboardUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline flex items-center gap-1"
                                        >
                                            {worker.workerDashboardUrl}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Global Worker Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Global Worker Settings</CardTitle>
                        <CardDescription>These settings apply to all workers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-update">Auto Update</Label>
                                    <div className="text-xs text-gray-500">
                                        Automatically update workers when new versions are available
                                    </div>
                                </div>
                                <Switch
                                    id="auto-update"
                                    checked={autoUpdate}
                                    onCheckedChange={setAutoUpdate}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="update-ring">Update Ring</Label>
                                <div className="text-xs text-gray-500 mb-2">
                                    Control the update rollout speed
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map((ring) => (
                                        <Button
                                            key={ring}
                                            type="button"
                                            variant={updateRing === ring ? 'default' : 'outline'}
                                            onClick={() => setUpdateRing(ring)}
                                            className="w-full"
                                        >
                                            {getUpdateRingLabel(ring)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="sender-email">Sender Email</Label>
                                <div className="text-xs text-gray-500 mb-2">
                                    Email address used for sending job reports
                                </div>
                                <Input
                                    id="sender-email"
                                    type="email"
                                    value={senderEmail}
                                    onChange={(e) => setSenderEmail(e.target.value)}
                                    placeholder="sender@example.com"
                                />
                                {workerData.isSenderEmailConfigured && (
                                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <CheckCircle className="h-3 w-3" />
                                        Email is configured
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label className="text-xs text-gray-500">Last Updated</Label>
                        <div className="text-sm mt-1">{formatDateTime(workerData.updatedAt)}</div>
                    </div>
                    {workerData.updatedBy && (
                        <div>
                            <Label className="text-xs text-gray-500">Updated By</Label>
                            <div className="text-sm mt-1">{workerData.updatedBy}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={open => { if (!deleting) { setDeleteDialogOpen(open); } }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Worker Registration
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-3 pt-2">
                                {/* Blocking state — jobs still assigned */}
                                {connectedJobs.length > 0 ? (
                                    <>
                                        <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                                {deleteError}
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Reassign or delete the following jobs before removing this worker registration:
                                        </p>
                                        <div className="rounded-lg border border-border divide-y divide-border max-h-64 overflow-y-auto">
                                            {connectedJobs.map(job => (
                                                <div key={job.jobId} className="flex items-center justify-between px-3 py-2.5 gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">{job.jobName}</p>
                                                        <p className="text-xs text-muted-foreground">{job.jobType}</p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0 text-xs h-7"
                                                        onClick={() => router.push(`/worker/jobs/${job.jobId}`)}
                                                    >
                                                        Open Job
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            Are you sure you want to delete the registration for{' '}
                                            <span className="font-semibold text-foreground">{worker.machineName}</span>?
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            This will remove registration{' '}
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                                                {worker.workerRegistrationId}
                                            </code>{' '}
                                            from Intune Assistant. The worker process on the host machine will no longer be able to connect.
                                        </p>
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                            This action cannot be undone.
                                        </p>
                                        {deleteError && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                                <XCircle className="h-4 w-4 shrink-0" />
                                                {deleteError}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleting}
                        >
                            {connectedJobs.length > 0 ? 'Close' : 'Cancel'}
                        </Button>
                        {connectedJobs.length === 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleDeleteWorker}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting…
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Registration
                                    </>
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
