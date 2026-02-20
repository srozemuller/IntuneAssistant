// app/monitor/global-overview/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { useMonitorContext } from '@/contexts/MonitorContext';
import {RefreshCw,
    Database,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Shield,
    AlertCircle,
    Eye
} from 'lucide-react';
import {
    MONITOR_CONFIGURATION_ENDPOINT,
    MONITOR_CONFIGURATION_DRIFTS_ENDPOINT,
    MONITOR_CONFIGURATION_RESULTS_ENDPOINT
} from '@/lib/constants';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CancelledCard } from '@/components/CancelledCard';
import { GlobalOverviewSkeleton } from '@/components/GlobalOverviewSkeleton';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";

// Custom Tooltip for charts with dark mode support
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {payload[0].name}: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

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
interface DriftedProperty {
    propertyName: string;
    currentValue: unknown;
    desiredValue: unknown;
}

interface Drift {
    id: string;
    monitorId: string;
    resourceType: string;
    baselineResourceDisplayName: string;
    firstReportedDateTime: string;
    status: string;
    driftedProperties: DriftedProperty[];
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

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function GlobalOverviewPage() {
    const { accounts } = useMsal();
    const { request, cancel } = useApiRequest();

    // Use context for shared state across monitor pages
    const {
        monitors,
        drifts,
        results,
        setMonitors,
        setDrifts,
        setResults,
        hasData,
        updateLastFetchTime
    } = useMonitorContext();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);

    const [selectedMonitorForDrifts, setSelectedMonitorForDrifts] = useState<string | null>(null);
    const [isDriftDialogOpen, setIsDriftDialogOpen] = useState(false);

    // Load data from context on mount if available
    useEffect(() => {
        if (!hasData && accounts.length > 0) {
            // No cached data, show welcome card
        }
    }, [hasData, accounts.length]);

    const fetchAllData = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);
        setIsCancelled(false);

        try {
            const [monitorsResponse, driftsResponse, resultsResponse] = await Promise.all([
                request<ApiResponse<Monitor[]>>(MONITOR_CONFIGURATION_ENDPOINT, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                request<ApiResponse<Drift[]>>(MONITOR_CONFIGURATION_DRIFTS_ENDPOINT, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                request<ApiResponse<MonitorResult[]>>(MONITOR_CONFIGURATION_RESULTS_ENDPOINT, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            if (monitorsResponse?.data) setMonitors(monitorsResponse.data);
            if (driftsResponse?.data) setDrifts(driftsResponse.data);
            if (resultsResponse?.data) setResults(resultsResponse.data);
            updateLastFetchTime();
        } catch (err) {
            console.error('Failed to fetch monitor data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        cancel();
        setMonitors([]);
        setDrifts([]);
        setResults([]);
        setError(null);
        setLoading(false);
        setIsCancelled(true);
    };

    const showDriftsForMonitor = (monitorId: string) => {
        setSelectedMonitorForDrifts(monitorId);
        setIsDriftDialogOpen(true);
    };

    // Memoize statistics calculations
    const stats = useMemo(() => ({
        totalMonitors: monitors.length,
        activeMonitors: monitors.filter(m => m.status === 'active').length,
        inactiveMonitors: monitors.filter(m => m.status === 'inactive').length,
        totalDrifts: drifts.length,
        activeDrifts: drifts.filter(d => d.status === 'active').length,
        totalRuns: results.length,
        successfulRuns: results.filter(r => r.runStatus === 'successful').length,
        partiallySuccessfulRuns: results.filter(r => r.runStatus === 'partiallySuccessful').length,
        failedRuns: results.filter(r => r.runStatus === 'failed').length,
        successRate: results.length > 0
            ? ((results.filter(r => r.runStatus === 'successful').length / results.length) * 100).toFixed(1)
            : '0',
        totalDriftsDetected: results.reduce((sum, r) => sum + r.driftsCount, 0),
        totalDriftsFixed: results.reduce((sum, r) => sum + r.driftsFixed, 0)
    }), [monitors, drifts, results]);

    // Memoize chart data
    const chartData = useMemo(() => ({
        monitorStatusData: [
            { name: 'Active', value: stats.activeMonitors, color: '#4ade80' },      // More subtle green
            { name: 'Inactive', value: stats.inactiveMonitors, color: '#94a3b8' }   // Muted gray
        ],
        runStatusData: [
            { name: 'Successful', value: stats.successfulRuns, color: '#4ade80' },           // Subtle green
            { name: 'Partial', value: stats.partiallySuccessfulRuns, color: '#fbbf24' },     // Subtle amber
            { name: 'Failed', value: stats.failedRuns, color: '#f87171' }                     // Subtle red
        ]
    }), [stats]);

const monitorsWithDrifts = useMemo(() =>
    monitors.map(monitor => {
        const monitorDrifts = drifts.filter(drift => drift.monitorId === monitor.id);
        const monitorResults = results.filter(result => result.monitorId === monitor.id);
        const latestResult = monitorResults.length > 0
            ? monitorResults.sort((a, b) =>
                new Date(b.runCompletionDateTime).getTime() - new Date(a.runCompletionDateTime).getTime()
            )[0]
            : undefined;

        return {
            ...monitor,
            driftsCount: monitorDrifts.length,
            latestResult
        };
    }),
    [monitors, drifts, results]
);

    const columns = [
        {
            key: 'displayName',
            label: 'Monitor Name',
            width: 200,
            render: (value: unknown, row: Record<string, unknown>) => (
                <div className="space-y-1">
                    <span className="font-medium text-sm">{String(value)}</span>
                    <p className="text-xs text-gray-500 truncate">{String(row.description || '')}</p>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            width: 100,
            render: (value: unknown) => {
                const status = String(value);
                return (
                    <Badge variant={status === 'active' ? 'default' : 'secondary'}
                           className={status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {status === 'active' ? <Activity className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {status}
                    </Badge>
                );
            }
        },
{
    key: 'driftsCount',
    label: 'Drifts',
    width: 100,
    minWidth: 80,
    render: (value: unknown, row: Record<string, unknown>) => {
        const count = Number(value) || 0;
        const monitorId = String(row.id);

        if (count === 0) {
            return <span className="text-sm text-gray-500">0</span>;
        }

        return (
            <button
                onClick={() => showDriftsForMonitor(monitorId)}
                className="text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer"
            >
                {count}
            </button>
        );
    }
},
        {
            key: 'latestResult',
            label: 'Last Run',
            width: 150,
            render: (value: unknown) => {
                const result = value as MonitorResult | undefined;
                if (!result) return <span className="text-xs text-gray-500">No runs yet</span>;

                const statusColors = {
                    successful: 'bg-green-500',
                    partiallySuccessful: 'bg-yellow-500',
                    failed: 'bg-red-500'
                };

                return (
                    <div className="space-y-1">
                        <Badge variant="outline" className={`${statusColors[result.runStatus]} text-white`}>
                            {result.runStatus}
                        </Badge>
                        <p className="text-xs text-gray-500">
                            {new Date(result.runCompletionDateTime).toLocaleDateString()}
                        </p>
                    </div>
                );
            }
        },
        {
            key: 'monitorRunFrequencyInHours',
            label: 'Frequency',
            width: 100,
            render: (value: unknown) => (
                <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-gray-500" />
                    Every {String(value)}h
                </div>
            )
        },
        {
            key: 'id',
            label: 'Actions',
            width: 100,
            render: (value: unknown) => (
                <Link href={`/monitor/details/${value}`}>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-yellow-400 hover:text-yellow-500"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                    </Button>
                </Link>
            )
        }
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Drift Monitor Global Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Real-time insights into your configuration monitoring and drift detection
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/monitor/add">
                        <Button variant="default" size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <Shield className="h-4 w-4 mr-2" />
                            Add Monitor
                        </Button>
                    </Link>
                    {monitors.length > 0 ? (
                        <Button onClick={fetchAllData} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    ) : (
                        <>
                            <Button onClick={fetchAllData} disabled={loading} className="flex items-center gap-2">
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Load Overview
                            </Button>
                            {loading && (
                                <Button onClick={handleCancel} variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={fetchAllData} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Welcome Card */}
            {monitors.length === 0 && !loading && !error && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 dark:text-gray-500 mb-6">
                                <Database className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Ready to view your drift monitoring overview
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                                Click the &quot;Load Overview&quot; button to fetch all monitoring data, drifts, and results from your environment.
                            </p>
                            <Button onClick={fetchAllData} className="flex items-center gap-2 mx-auto" size="lg">
                                <Database className="h-5 w-5" />
                                Load Overview
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State with Skeleton */}
            {loading && (
                <GlobalOverviewSkeleton />
            )}

            {/* Cancelled State */}
            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => {
                        setIsCancelled(false);
                        fetchAllData();
                    }}
                    title="Loading Cancelled"
                    description="Monitor data loading was cancelled. Click below to load again."
                    buttonText="Load Overview"
                />
            )}

            {/* Dashboard Content */}
            {monitors.length > 0 && !loading && (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Monitors</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activeMonitors}</p>
                                        <p className="text-xs text-gray-500 mt-1">of {stats.totalMonitors} total</p>
                                    </div>
                                    <Shield className="h-12 w-12 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.successRate}%</p>
                                        <p className="text-xs text-gray-500 mt-1">{stats.successfulRuns} of {stats.totalRuns} runs</p>
                                    </div>
                                    <TrendingUp className="h-12 w-12 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Drifts</p>
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.activeDrifts}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stats.totalDrifts} total detected</p>
                                    </div>
                                    <AlertTriangle className="h-12 w-12 text-orange-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Drifts Fixed</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalDriftsFixed}</p>
                                        <p className="text-xs text-gray-500 mt-1">Auto-remediated</p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-purple-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                            <CardHeader>
                                <CardTitle>Monitor Status Distribution</CardTitle>
                                <CardDescription>Active vs Inactive monitors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.monitorStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            fillOpacity={0.85}
                                        >
                                            {chartData.monitorStatusData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                            <CardHeader>
                                <CardTitle>Run Status Overview</CardTitle>
                                <CardDescription>Monitor execution results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData.runStatusData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="currentColor"
                                            className="stroke-gray-200 dark:stroke-gray-700"
                                            opacity={0.3}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            stroke="currentColor"
                                            className="text-gray-600 dark:text-gray-400"
                                            tick={{ fill: 'currentColor' }}
                                        />
                                        <YAxis
                                            stroke="currentColor"
                                            className="text-gray-600 dark:text-gray-400"
                                            tick={{ fill: 'currentColor' }}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#8884d8"
                                            fillOpacity={0.85}
                                            radius={[6, 6, 0, 0]}
                                        >
                                            {chartData.runStatusData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-2">
                            <CardTitle>Configuration Monitors</CardTitle>
                            <CardDescription>
                                Detailed view of all monitors with drift status and latest results
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <DataTable
                                data={monitorsWithDrifts}
                                columns={columns}
                                showPagination={true}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

        <Dialog open={isDriftDialogOpen} onOpenChange={setIsDriftDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Drifts for Monitor</DialogTitle>
                    <DialogDescription>
                        Viewing {drifts.filter(d => d.monitorId === selectedMonitorForDrifts).length} drifts
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {drifts
                        .filter(drift => drift.monitorId === selectedMonitorForDrifts)
                        .map(drift => (
                            <Card key={drift.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">{drift.baselineResourceDisplayName}</CardTitle>
                                        <Badge variant={drift.status === 'active' ? 'destructive' : 'secondary'}>
                                            {drift.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Type:</span>
                                            <span className="ml-2 text-gray-600">{drift.resourceType}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">First Reported:</span>
                                            <span className="ml-2 text-gray-600">{new Date(drift.firstReportedDateTime).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Drifted Properties */}
                                    {drift.driftedProperties && drift.driftedProperties.length > 0 && (
                                        <div className="space-y-3 mt-4">
                                            <h4 className="font-semibold text-sm">Drifted Properties ({drift.driftedProperties.length})</h4>
                                            {drift.driftedProperties.map((property, index) => (
                                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                                                    <h5 className="font-medium text-sm">{property.propertyName}</h5>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Current Value</p>
                                                            <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block overflow-x-auto">
                                                                {JSON.stringify(property.currentValue, null, 2)}
                                                            </code>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Desired Value</p>
                                                            <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block overflow-x-auto">
                                                                {JSON.stringify(property.desiredValue, null, 2)}
                                                            </code>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}</div>
            </DialogContent>
        </Dialog>


        </div>
    );

}