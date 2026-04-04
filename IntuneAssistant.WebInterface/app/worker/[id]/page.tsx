'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { WORKER_OVERVIEW_ENDPOINT, WORKER_CONFIG_ENDPOINT } from '@/lib/constants';
import { WorkerOverview, WorkerInstance, HealthStatus, RegistrationStatus } from '@/types/worker';

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: WorkerOverview;
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
    
    if (totalSeconds > 600 || healthStatus === HealthStatus.Critical) {
        return {
            label: 'Critical',
            color: 'bg-red-500',
            icon: XCircle,
            textColor: 'text-red-600 dark:text-red-400'
        };
    }
    
    if (totalSeconds > 300 || healthStatus === HealthStatus.Warning) {
        return {
            label: 'Warning',
            color: 'bg-yellow-500',
            icon: AlertTriangle,
            textColor: 'text-yellow-600 dark:text-yellow-400'
        };
    }
    
    return {
        label: 'Healthy',
        color: 'bg-green-500',
        icon: CheckCircle,
        textColor: 'text-green-600 dark:text-green-400'
    };
}

function getRegistrationStatusInfo(status: number) {
    switch (status) {
        case RegistrationStatus.Active:
            return { label: 'Active', color: 'bg-green-500' };
        case RegistrationStatus.Inactive:
            return { label: 'Inactive', color: 'bg-gray-500' };
        case RegistrationStatus.Decommissioned:
            return { label: 'Decommissioned', color: 'bg-red-500' };
        default:
            return { label: 'Unknown', color: 'bg-gray-500' };
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
    const { request } = useApiRequest();
    
    const workerId = params.id as string;
    
    const [workerData, setWorkerData] = useState<WorkerOverview | null>(null);
    const [worker, setWorker] = useState<WorkerInstance | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Form state
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [updateRing, setUpdateRing] = useState(2);
    const [senderEmail, setSenderEmail] = useState('');

    const fetchWorkerData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await request<ApiResponse>(WORKER_OVERVIEW_ENDPOINT, { method: 'GET' });

            if (response?.data?.data) {
                const data = response.data.data;
                setWorkerData(data);
                
                // Find the specific worker
                const foundWorker = data.workers?.find(
                    (w: WorkerInstance) => w.workerRegistrationId === workerId
                );
                
                if (foundWorker) {
                    setWorker(foundWorker);
                } else {
                    router.push('/worker');
                }
                
                // Set form values from global config
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
    }, [request, workerId, router]);

    useEffect(() => {
        fetchWorkerData();
    }, [fetchWorkerData]);

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
        </div>
    );
}
