'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import {
    RefreshCw,
    ArrowLeft,
    AlertTriangle,
    CheckCircle,
    Clock,
    Shield,
    Database,
    Activity,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    User,
    Calendar,
    Trash2
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CancelledCard } from '@/components/CancelledCard';
import {
    MONITOR_CONFIGURATION_ENDPOINT,
    MONITOR_CONFIGURATION_DRIFTS_ENDPOINT
} from '@/lib/constants';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface User {
    id: string | null;
    displayName: string | null;
}

interface Application {
    id: string | null;
    displayName: string | null;
}

interface Actor {
    user: User | null;
    application: Application | null;
}

interface BaselineResource extends Record<string, unknown> {
    displayName: string;
    resourceType: string;
    properties: Record<string, unknown>;
}

interface Baseline {
    id: string;
    displayName: string;
    description: string;
    parameters: unknown[];
    resources: BaselineResource[];
}

interface MonitorConfiguration {
    id: string;
    displayName: string;
    description: string;
    tenantId: string;
    status: string;
    monitorRunFrequencyInHours: number;
    mode: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    runAsUTCMServicePrincipal: boolean;
    inactivationReason: string | null;
    createdBy: Actor;
    runningOnBehalfOf: Actor;
    lastModifiedBy: Actor;
    parameters: Record<string, unknown>;
    baseline: Baseline;
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
    resourceInstanceIdentifier: Record<string, unknown>;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

export default function MonitorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { accounts } = useMsal();
    const { request, cancel } = useApiRequest();


    const monitorId = params.id as string;

    const [monitor, setMonitor] = useState<MonitorConfiguration | null>(null);
    const [drifts, setDrifts] = useState<Drift[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);

    const [selectedResource, setSelectedResource] = useState<BaselineResource | null>(null);
    const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
    const [expandedDrifts, setExpandedDrifts] = useState<Set<string>>(new Set());
    const [isBaselineExpanded, setIsBaselineExpanded] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    const fetchData = async () => {
        if (!accounts.length || !monitorId) return;

        setLoading(true);
        setError(null);
        setIsCancelled(false);

        try {
            // Always fetch both monitor details and drifts for this specific monitor
            const [monitorResponse, driftsResponse] = await Promise.all([
                request<ApiResponse<MonitorConfiguration>>(
                    `${MONITOR_CONFIGURATION_ENDPOINT}/${monitorId}`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }
                ),
                request<ApiResponse<Drift[]>>(
                    `${MONITOR_CONFIGURATION_DRIFTS_ENDPOINT}?monitorId=${monitorId}`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            ]);

            if (monitorResponse?.data) {
                setMonitor(monitorResponse.data);
            }

            if (driftsResponse?.data) {
                // Filter drifts to only show those for this monitor
                const monitorSpecificDrifts = Array.isArray(driftsResponse.data)
                    ? driftsResponse.data.filter(d => d.monitorId === monitorId)
                    : [];
                setDrifts(monitorSpecificDrifts);
            }
        } catch (err) {
            console.error('Failed to fetch monitor details:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monitorId, accounts.length]);

    const handleCancel = () => {
        cancel();
        setMonitor(null);
        setDrifts([]);
        setError(null);
        setLoading(false);
        setIsCancelled(true);
    };

    const toggleDriftExpansion = (driftId: string) => {
        const newExpanded = new Set(expandedDrifts);
        if (newExpanded.has(driftId)) {
            newExpanded.delete(driftId);
        } else {
            newExpanded.add(driftId);
        }
        setExpandedDrifts(newExpanded);
    };

    const viewResourceDetails = (resource: BaselineResource) => {
        setSelectedResource(resource);
        setIsResourceDialogOpen(true);
    };

    const handleDeleteMonitor = async () => {
        if (!monitorId) return;

        setIsDeleting(true);
        try {
            await request(
                `${MONITOR_CONFIGURATION_ENDPOINT}/${monitorId}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            // Close dialog and navigate back to overview
            setIsDeleteDialogOpen(false);
            router.push('/monitor/global-overview');
        } catch (err) {
            console.error('Failed to delete monitor:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete monitor');
            setIsDeleteDialogOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const baselineColumns = [
        {
            key: 'displayName',
            label: 'Resource Name',
            width: 300,
            render: (value: unknown) => (
                <span className="font-medium text-sm">{String(value)}</span>
            )
        },
        {
            key: 'resourceType',
            label: 'Type',
            width: 250,
            render: (value: unknown) => (
                <Badge variant="outline" className="text-xs">
                    {String(value)}
                </Badge>
            )
        },
        {
            key: 'properties',
            label: 'Properties',
            width: 120,
            render: (value: unknown) => {
                const props = value as Record<string, unknown>;
                const propCount = Object.keys(props).length;
                return (
                    <Badge variant="secondary" className="text-xs">
                        {propCount} {propCount === 1 ? 'property' : 'properties'}
                    </Badge>
                );
            }
        },
        {
            key: 'drift',
            label: 'Drift Status',
            width: 120,
            render: (_: unknown, row: Record<string, unknown>) => {
                const hasDrift = drifts.some(d => 
                    d.baselineResourceDisplayName === row.displayName
                );
                return hasDrift ? (
                    <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Has Drift
                    </Badge>
                ) : (
                    <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compliant
                    </Badge>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            width: 100,
            render: (_: unknown, row: Record<string, unknown>) => (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => viewResourceDetails(row as BaselineResource)}
                    className="text-yellow-400 hover:text-yellow-500"
                >
                    View Details
                </Button>
            )
        }
    ];

    const stats = useMemo(() => ({
        totalResources: monitor?.baseline?.resources?.length || 0,
        totalDrifts: drifts.length,
        activeDrifts: drifts.filter(d => d.status === 'active').length,
        resourcesWithDrifts: new Set(drifts.map(d => d.baselineResourceDisplayName)).size,
        compliantResources: (monitor?.baseline?.resources?.length || 0) - new Set(drifts.map(d => d.baselineResourceDisplayName)).size
    }), [monitor, drifts]);

    if (loading && !monitor) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-400 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Monitor Details
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching monitor configuration and drifts...
                            </p>
                            <Button onClick={handleCancel} variant="destructive" className="mt-4">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Button onClick={() => router.back()} variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={fetchData} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isCancelled) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Button onClick={() => router.back()} variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <CancelledCard
                    onRetry={() => {
                        setIsCancelled(false);
                        fetchData();
                    }}
                    title="Loading Cancelled"
                    description="Monitor details loading was cancelled. Click below to load again."
                    buttonText="Load Details"
                />
            </div>
        );
    }

    if (!monitor) return null;

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={() => router.back()} variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {monitor.displayName}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {monitor.description}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        variant="destructive"
                        size="sm"
                        disabled={loading || isDeleting}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Monitor
                    </Button>
                </div>
            </div>

            {/* Monitor Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</p>
                                <Badge variant={monitor.status === 'active' ? 'default' : 'secondary'} 
                                       className={`mt-2 ${monitor.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                    {monitor.status === 'active' ? (
                                        <><Activity className="h-3 w-3 mr-1" /> Active</>
                                    ) : (
                                        <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                                    )}
                                </Badge>
                            </div>
                            <Shield className="h-12 w-12 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Run Frequency</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {monitor.monitorRunFrequencyInHours}h
                                </p>
                            </div>
                            <Clock className="h-12 w-12 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Mode</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {monitor.mode}
                                </p>
                            </div>
                            <Database className="h-12 w-12 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Run As Service Principal</p>
                                <Badge variant={monitor.runAsUTCMServicePrincipal ? 'default' : 'secondary'} className="mt-2">
                                    {monitor.runAsUTCMServicePrincipal ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <User className="h-12 w-12 text-orange-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Resources</p>
                                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.totalResources}</p>
                            </div>
                            <Database className="h-12 w-12 text-gray-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Drifts</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.activeDrifts}</p>
                            </div>
                            <AlertTriangle className="h-12 w-12 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Resources with Drifts</p>
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.resourcesWithDrifts}</p>
                            </div>
                            <AlertTriangle className="h-12 w-12 text-yellow-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Compliant Resources</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.compliantResources}</p>
                            </div>
                            <CheckCircle className="h-12 w-12 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monitor Metadata */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <CardTitle>Monitor Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-medium text-gray-600 dark:text-gray-400">Monitor ID</p>
                        <p className="text-gray-900 dark:text-gray-100 font-mono text-xs">{monitor.id}</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-600 dark:text-gray-400">Tenant ID</p>
                        <p className="text-gray-900 dark:text-gray-100 font-mono text-xs">{monitor.tenantId}</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-600 dark:text-gray-400">Created</p>
                        <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100">
                            <Calendar className="h-3 w-3" />
                            {new Date(monitor.createdDateTime).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            By: {monitor.createdBy.user?.displayName || monitor.createdBy.application?.displayName || 'Unknown'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-600 dark:text-gray-400">Last Modified</p>
                        <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100">
                            <Calendar className="h-3 w-3" />
                            {new Date(monitor.lastModifiedDateTime).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            By: {monitor.lastModifiedBy.user?.displayName || monitor.lastModifiedBy.application?.displayName || 'Unknown'}
                        </p>
                    </div>
                    {monitor.runningOnBehalfOf.application && (
                        <div className="md:col-span-2">
                            <p className="font-medium text-gray-600 dark:text-gray-400">Running On Behalf Of</p>
                            <p className="text-gray-900 dark:text-gray-100">
                                {monitor.runningOnBehalfOf.application.displayName}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Baseline Resources */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Baseline Configuration: {monitor.baseline.displayName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {monitor.baseline.description}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBaselineExpanded(!isBaselineExpanded)}
                        >
                            {isBaselineExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Hide Resources
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Show All {stats.totalResources} Resources
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!isBaselineExpanded ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Resources</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalResources}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Compliant</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.compliantResources}</p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">With Drifts</span>
                                    </div>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.resourcesWithDrifts}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                Click &quot;Show All Resources&quot; to view the complete baseline configuration
                            </p>
                        </div>
                    ) : (
                        <div className="p-0">
                            <DataTable
                                data={monitor.baseline.resources}
                                columns={baselineColumns}
                                showPagination={true}
                                showSearch={true}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Drifts */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Detected Drifts
                                <Badge variant="destructive" className="ml-2">
                                    {drifts.length} drift{drifts.length !== 1 ? 's' : ''}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Configuration items that have drifted from the baseline
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {drifts.length === 0 ? (
                        <div className="text-center py-12 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No Drifts Detected
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                All monitored resources are compliant with the baseline configuration
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {drifts.map((drift) => {
                                const isExpanded = expandedDrifts.has(drift.id);
                                const isActive = drift.status === 'active';

                                return (
                                    <Card
                                        key={drift.id}
                                        className={`overflow-hidden border-l-4 ${
                                            isActive 
                                                ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' 
                                                : 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10'
                                        }`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                                            {drift.baselineResourceDisplayName}
                                                        </h3>
                                                        <Badge
                                                            variant={isActive ? 'destructive' : 'default'}
                                                            className={`text-xs ${!isActive ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                                        >
                                                            {isActive ? (
                                                                <><AlertTriangle className="h-3 w-3 mr-1" /> Active</>
                                                            ) : (
                                                                <><CheckCircle className="h-3 w-3 mr-1" /> Fixed</>
                                                            )}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {drift.driftedProperties.length} {drift.driftedProperties.length === 1 ? 'property' : 'properties'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {drift.resourceType}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        First reported: {new Date(drift.firstReportedDateTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleDriftExpansion(drift.id)}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="h-5 w-5 mr-1" />
                                                            Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-5 w-5 mr-1" />
                                                            Details
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        {isExpanded && drift.driftedProperties.length > 0 && (
                                            <CardContent className="pt-0 border-t">
                                                <div className="space-y-3 pt-4">
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                        Drifted Properties
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {drift.driftedProperties.map((property, index) => (
                                                            <div
                                                                key={index}
                                                                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                                            >
                                                                <h5 className="font-medium text-sm flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100">
                                                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                                    {property.propertyName}
                                                                </h5>
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                                            Current Value
                                                                        </p>
                                                                        <code className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded block overflow-x-auto border border-gray-200 dark:border-gray-700">
                                                                            {JSON.stringify(property.currentValue, null, 2)}
                                                                        </code>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                                            Desired Value (Baseline)
                                                                        </p>
                                                                        <code className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded block overflow-x-auto border border-gray-200 dark:border-gray-700">
                                                                            {JSON.stringify(property.desiredValue, null, 2)}
                                                                        </code>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resource Details Dialog */}
            <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedResource?.displayName}</DialogTitle>
                        <DialogDescription>
                            Resource Type: {selectedResource?.resourceType}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedResource && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Properties</h4>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                                    <pre className="text-xs overflow-x-auto">
                                        {JSON.stringify(selectedResource.properties, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Monitor
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this monitor? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Monitor: {monitor?.displayName}
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                {monitor?.description}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteMonitor}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Monitor
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
