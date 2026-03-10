'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { useMonitorContext } from '@/contexts/MonitorContext';
import {
    Shield,
    Plus,
    RefreshCw,
    Eye,
    Trash2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Activity
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { MonitorsListSkeleton } from '@/components/MonitorsListSkeleton';
import {
    MONITOR_CONFIGURATION_ENDPOINT,
    MONITOR_CONFIGURATION_RESULTS_ENDPOINT,
    MONITOR_CONFIGURATION_DRIFTS_ENDPOINT
} from '@/lib/constants';
import { CancelledCard } from '@/components/CancelledCard';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

interface Monitor {
    id: string;
    displayName: string;
    description: string;
    status: 'active' | 'inactive';
    monitorRunFrequencyInHours: number;
    mode: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
}

interface MonitorResult {
    id: string;
    monitorId: string;
    runInitiationDateTime: string;
    runCompletionDateTime: string;
    runStatus: 'successful' | 'partiallySuccessful' | 'failed';
    driftsCount: number;
    driftsFixed: number;
    runType: string;
}

interface Drift {
    id: string;
    monitorId: string;
    resourceType: string;
    baselineResourceDisplayName: string;
    firstReportedDateTime: string;
    status: string;
    driftedProperties: Array<{
        propertyName: string;
        currentValue: unknown;
        desiredValue: unknown;
    }>;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

interface MonitorWithStats extends Monitor {
    latestResult?: MonitorResult;
    activeDriftsCount: number;
}

export default function MonitorsPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();

    // Use context for shared state
    const {
        monitors: contextMonitors,
        drifts: contextDrifts,
        results: contextResults,
        hasData,
        isLoading: contextLoading,
        setIsLoading: setContextLoading,
        setMonitors: setContextMonitors,
        setDrifts: setContextDrifts,
        setResults: setContextResults,
        monitorById,
        driftsByMonitorId,
        resultsByMonitorId,
        updateLastFetchTime
    } = useMonitorContext();

    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [monitorToDelete, setMonitorToDelete] = useState<MonitorWithStats | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Use cached data or fetch if not available
    const loading = contextLoading || localLoading;

    const fetchMonitors = async () => {
        if (accounts.length === 0) {
            setError('No authenticated account found');
            return;
        }

        try {
            setLocalLoading(true);
            setContextLoading(true);
            setError(null);
            setIsCancelled(false);

            // Fetch all monitors
            const monitorsResponse = await request<ApiResponse<Monitor[]>>(
                MONITOR_CONFIGURATION_ENDPOINT,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            // Unwrap ApiResponseWithCorrelation → monitorsResponse.data is the ApiResponse envelope, monitorsResponse.data.data is the actual Monitor[]
            if (!monitorsResponse?.data?.data) {
                throw new Error('No monitor data received');
            }

            const monitorsArray = Array.isArray(monitorsResponse.data.data)
                ? monitorsResponse.data.data
                : [monitorsResponse.data.data];

            // Fetch results and drifts for all monitors
            const [resultsResponse, driftsResponse] = await Promise.all([
                request<ApiResponse<MonitorResult[]>>(
                    MONITOR_CONFIGURATION_RESULTS_ENDPOINT,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }
                ),
                request<ApiResponse<Drift[]>>(
                    MONITOR_CONFIGURATION_DRIFTS_ENDPOINT,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            ]);

            // Unwrap ApiResponseWithCorrelation for results and drifts
            const results = Array.isArray(resultsResponse?.data?.data) ? resultsResponse.data.data : [];
            const drifts = Array.isArray(driftsResponse?.data?.data) ? driftsResponse.data.data : [];

            // Update context with fetched data
            setContextMonitors(monitorsArray);
            setContextResults(results);
            setContextDrifts(drifts);
            updateLastFetchTime();
        } catch (err) {
            if (err instanceof Error && err.message === 'Request was cancelled') {
                setIsCancelled(true);
                setError('Request was cancelled');
            } else {
                console.error('Error fetching monitors:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch monitors');
            }
        } finally {
            setLocalLoading(false);
            setContextLoading(false);
        }
    };

    // Memoize monitors with stats using context data
    const monitorsWithStats = useMemo((): MonitorWithStats[] => {
        return contextMonitors.map(monitor => {
            // Use memoized maps from context
            const monitorResults = resultsByMonitorId.get(monitor.id) || [];
            const monitorDrifts = driftsByMonitorId.get(monitor.id) || [];

            const latestResult = monitorResults.length > 0
                ? monitorResults.sort((a, b) =>
                    new Date(b.runCompletionDateTime).getTime() -
                    new Date(a.runCompletionDateTime).getTime()
                )[0]
                : undefined;

            const activeDriftsCount = monitorDrifts.filter(d => d.status === 'active').length;

            return {
                ...monitor,
                status: monitor.status as 'active' | 'inactive',
                latestResult,
                activeDriftsCount
            } as MonitorWithStats;
        });
    }, [contextMonitors, resultsByMonitorId, driftsByMonitorId]);

    const handleDeleteMonitor = async () => {
        if (!monitorToDelete) return;

        try {
            setDeleting(true);
            await request(
                `${MONITOR_CONFIGURATION_ENDPOINT}/${monitorToDelete.id}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            // Refresh monitors list
            await fetchMonitors();
            setDeleteDialogOpen(false);
            setMonitorToDelete(null);
        } catch (err) {
            console.error('Error deleting monitor:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete monitor');
        } finally {
            setDeleting(false);
        }
    };


    useEffect(() => {
        // Only fetch if we don't have data in context
        if (!hasData && accounts.length > 0) {
            fetchMonitors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length, hasData]);

    // Memoize stats calculations
    const stats = useMemo(() => ({
        totalMonitors: monitorsWithStats.length,
        activeMonitors: monitorsWithStats.filter(m => m.status === 'active').length,
        totalDrifts: monitorsWithStats.reduce((sum, m) => sum + m.activeDriftsCount, 0),
        recentRuns: monitorsWithStats.filter(m => m.latestResult).length
    }), [monitorsWithStats]);

    const columns = [
        {
            key: 'displayName',
            label: 'Monitor Name',
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const monitor = row as unknown as MonitorWithStats;
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            {String(value)}
                        </div>
                        {monitor.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {monitor.description}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Status',
            width: 120,
            render: (value: unknown) => {
                const status = String(value) as 'active' | 'inactive';
                return (
                    <Badge
                        variant={status === 'active' ? 'default' : 'secondary'}
                        className={status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-400 text-white'
                        }
                    >
                        {status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            }
        },
        {
            key: 'activeDriftsCount',
            label: 'Active Drifts',
            width: 120,
            render: (value: unknown) => {
                const count = Number(value);
                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={count > 0 ? 'destructive' : 'secondary'}
                            className={count > 0
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }
                        >
                            {count > 0 ? (
                                <AlertCircle className="h-3 w-3 mr-1" />
                            ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {count}
                        </Badge>
                    </div>
                );
            }
        },
        {
            key: 'latestResult',
            label: 'Last Run',
            width: 180,
            render: (value: unknown) => {
                const result = value as MonitorResult | undefined;
                if (!result) {
                    return (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            No runs yet
                        </span>
                    );
                }

                const statusColors = {
                    successful: 'bg-green-500 text-white',
                    partiallySuccessful: 'bg-yellow-500 text-white',
                    failed: 'bg-red-500 text-white'
                };

                return (
                    <div className="space-y-1">
                        <Badge
                            variant="outline"
                            className={statusColors[result.runStatus]}
                        >
                            {result.runStatus === 'successful' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {result.runStatus === 'partiallySuccessful' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {result.runStatus === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {result.runStatus}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(result.runCompletionDateTime).toLocaleString()}
                        </p>
                    </div>
                );
            }
        },
        {
            key: 'monitorRunFrequencyInHours',
            label: 'Frequency',
            width: 100,
            render: (value: unknown) => {
                const hours = Number(value);
                return (
                    <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{hours}h</span>
                    </div>
                );
            }
        },
        {
            key: 'createdDateTime',
            label: 'Created',
            width: 150,
            render: (value: unknown) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(String(value)).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            width: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const monitor = row as unknown as MonitorWithStats;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/monitor/details/${monitor.id}`)}
                            className="h-8"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setMonitorToDelete(monitor);
                                setDeleteDialogOpen(true);
                            }}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    if (isCancelled) {
        return <CancelledCard onRetry={fetchMonitors} />;
    }

    // Show skeleton when loading
    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Configuration Monitors
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View and manage all your Intune configuration monitors
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            disabled
                        >
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => router.push('/monitor/add')}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Monitor
                        </Button>
                    </div>
                </div>

                {/* Skeleton Content */}
                <MonitorsListSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Configuration Monitors
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and manage all your Intune configuration monitors
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchMonitors}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => router.push('/monitor/add')}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Monitor
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card bg-gradient-to-br from-blue-50/60 to-cyan-50/40 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-200/30 dark:border-blue-700/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Monitors
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.totalMonitors}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-gradient-to-br from-green-50/60 to-emerald-50/40 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200/30 dark:border-green-700/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {stats.activeMonitors}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-gradient-to-br from-red-50/60 to-rose-50/40 dark:from-red-900/20 dark:to-rose-900/10 border border-red-200/30 dark:border-red-700/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Drifts
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                            {stats.totalDrifts}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card bg-gradient-to-br from-yellow-50/60 to-amber-50/40 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200/30 dark:border-yellow-700/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Recent Runs
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {stats.recentRuns}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Display */}
            {error && !isCancelled && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Monitors Table */}
            <Card className="glass-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle>Monitors</CardTitle>
                    <CardDescription>
                        Manage your configuration monitors and view their current status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {monitorsWithStats.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No monitors found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Create your first monitor to start tracking configuration drift
                            </p>
                            <Button
                                onClick={() => router.push('/monitor/add')}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Monitor
                            </Button>
                        </div>
                    ) : (
                        <DataTable
                            data={monitorsWithStats as unknown as Record<string, unknown>[]}
                            columns={columns}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle>Delete Monitor</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the monitor &quot;{monitorToDelete?.displayName}&quot;?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setMonitorToDelete(null);
                            }}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteMonitor}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
