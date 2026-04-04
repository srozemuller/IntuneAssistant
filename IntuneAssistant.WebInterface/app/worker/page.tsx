'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    RefreshCw,
    Activity,
    CheckCircle,
    AlertTriangle,
    Server,
    Loader2,
    ExternalLink,
    XCircle,
    Cpu,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { WORKER_OVERVIEW_ENDPOINT } from '@/lib/constants';
import { WorkerOverview, WorkerInstance, HealthStatus, RegistrationStatus } from '@/types/worker';
import { DataTable } from '@/components/DataTable';
import { useRouter } from 'next/navigation';

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: WorkerOverview;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimeSince(ts: string): { totalSeconds: number; display: string } {
    // Format: "HH:MM:SS.fffffff" or "d.HH:MM:SS.fffffff"
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
    
    // Critical if no heartbeat in 10 minutes or healthStatus is Critical
    if (totalSeconds > 600 || healthStatus === HealthStatus.Critical) {
        return {
            label: 'Critical',
            color: 'bg-red-500 hover:bg-red-600',
            icon: XCircle,
            textColor: 'text-red-600 dark:text-red-400'
        };
    }
    
    // Warning if no heartbeat in 5 minutes or healthStatus is Warning
    if (totalSeconds > 300 || healthStatus === HealthStatus.Warning) {
        return {
            label: 'Warning',
            color: 'bg-yellow-500 hover:bg-yellow-600',
            icon: AlertTriangle,
            textColor: 'text-yellow-600 dark:text-yellow-400'
        };
    }
    
    return {
        label: 'Healthy',
        color: 'bg-green-500 hover:bg-green-600',
        icon: CheckCircle,
        textColor: 'text-green-600 dark:text-green-400'
    };
}

function getRegistrationStatusInfo(status: number) {
    switch (status) {
        case RegistrationStatus.Active:
            return { label: 'Active', color: 'bg-green-500 hover:bg-green-600' };
        case RegistrationStatus.Inactive:
            return { label: 'Inactive', color: 'bg-gray-500 hover:bg-gray-600' };
        case RegistrationStatus.Decommissioned:
            return { label: 'Decommissioned', color: 'bg-red-500 hover:bg-red-600' };
        default:
            return { label: 'Unknown', color: 'bg-gray-500 hover:bg-gray-600' };
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

export default function WorkerOverviewPage() {
    const { request } = useApiRequest();
    const router = useRouter();
    const [workerData, setWorkerData] = useState<WorkerOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorkerData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await request<ApiResponse>(WORKER_OVERVIEW_ENDPOINT);

            if (response?.data?.data) {
                setWorkerData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch worker data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [request]);

    useEffect(() => {
        fetchWorkerData();
    }, [fetchWorkerData]);

    // Calculate summary statistics
    const stats = React.useMemo(() => {
        if (!workerData) return { total: 0, healthy: 0, warning: 0, critical: 0, active: 0 };

        const workers = workerData.workers || [];
        return {
            total: workers.length,
            healthy: workers.filter(w => {
                const { totalSeconds } = parseTimeSince(w.timeSinceLastHeartbeat);
                return totalSeconds <= 300 && w.healthStatus === HealthStatus.Healthy;
            }).length,
            warning: workers.filter(w => {
                const { totalSeconds } = parseTimeSince(w.timeSinceLastHeartbeat);
                return (totalSeconds > 300 && totalSeconds <= 600) || w.healthStatus === HealthStatus.Warning;
            }).length,
            critical: workers.filter(w => {
                const { totalSeconds } = parseTimeSince(w.timeSinceLastHeartbeat);
                return totalSeconds > 600 || w.healthStatus === HealthStatus.Critical;
            }).length,
            active: workers.filter(w => w.registrationStatus === RegistrationStatus.Active).length,
        };
    }, [workerData]);

    // Table columns configuration
    const columns = [
        {
            key: 'machineName',
            label: 'Machine',
            width: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const worker = row as unknown as WorkerInstance;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{value as string}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{worker.workerInstanceId}</span>
                    </div>
                );
            }
        },
        {
            key: 'healthStatus',
            label: 'Health',
            width: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const worker = row as unknown as WorkerInstance;
                const healthInfo = getHealthStatusInfo(value as number, worker.timeSinceLastHeartbeat);
                const Icon = healthInfo.icon;
                return (
                    <Badge className={`${healthInfo.color} text-white`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {healthInfo.label}
                    </Badge>
                );
            }
        },
        {
            key: 'lastHeartbeat',
            label: 'Last Heartbeat',
            width: 180,
            render: (value: unknown, row: Record<string, unknown>) => {
                const worker = row as unknown as WorkerInstance;
                const { display } = parseTimeSince(worker.timeSinceLastHeartbeat);
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{display} ago</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(value as string)}</span>
                    </div>
                );
            }
        },
        {
            key: 'currentVersion',
            label: 'Version',
            width: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const worker = row as unknown as WorkerInstance;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{value as string}</span>
                        {worker.updateAvailable && (
                            <Badge variant="outline" className="text-xs mt-1 w-fit">
                                Update Available
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'osVersion',
            label: 'OS',
            width: 150,
            render: (value: unknown) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">{value as string}</span>
            )
        },
        {
            key: 'workerDashboardUrl',
            label: 'Dashboard',
            width: 120,
            render: (value: unknown) => {
                if (!value) {
                    return <span className="text-xs text-gray-400">N/A</span>;
                }
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(value as string, '_blank');
                        }}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                );
            }
        },
        {
            key: 'registrationStatus',
            label: 'Status',
            width: 120,
            render: (value: unknown) => {
                const statusInfo = getRegistrationStatusInfo(value as number);
                return (
                    <Badge className={`${statusInfo.color} text-white`}>
                        {statusInfo.label}
                    </Badge>
                );
            }
        },
    ];

    const handleRowClick = (worker: Record<string, unknown>) => {
        const w = worker as unknown as WorkerInstance;
        router.push(`/worker/${w.workerRegistrationId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!workerData) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>No Worker Data</CardTitle>
                        <CardDescription>Unable to load worker information</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Worker Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage and monitor your Intune Assistant workers
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
                    <Button onClick={() => router.push('/worker/jobs')}>
                        <Activity className="h-4 w-4 mr-2" />
                        Manage Jobs
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">{stats.active} active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Healthy</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.healthy}</div>
                        <p className="text-xs text-muted-foreground">Operating normally</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Warning</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.warning}</div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
                        <p className="text-xs text-muted-foreground">Requires action</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Latest Version</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{workerData.availableVersion}</div>
                        <p className="text-xs text-muted-foreground">Available</p>
                    </CardContent>
                </Card>
            </div>

            {/* Workers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Worker Instances</CardTitle>
                    <CardDescription>
                        Click on a worker to view details and manage settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {workerData.workers && workerData.workers.length > 0 ? (
                        <DataTable
                            data={workerData.workers as unknown as Record<string, unknown>[]}
                            columns={columns}
                            onRowClick={handleRowClick}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No Workers Found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No worker instances are currently registered
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}



