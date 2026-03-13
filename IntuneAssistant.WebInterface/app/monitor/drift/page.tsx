'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMonitorContext } from '@/contexts/MonitorContext';
import {
    RefreshCw,
    Database,
    XCircle,
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CancelledCard } from '@/components/CancelledCard';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import {MONITOR_CONFIGURATION_ENDPOINT,
    MONITOR_CONFIGURATION_DRIFTS_ENDPOINT,
} from '@/lib/constants';


interface DriftedProperty {
    propertyName: string;
    currentValue: unknown;
    desiredValue: unknown;
}

interface Drift extends Record<string, unknown> {
    id: string;
    monitorId: string;
    resourceType: string;
    baselineResourceDisplayName: string;
    firstReportedDateTime: string;
    status: string;
    driftedProperties: DriftedProperty[];
}

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export default function DriftsOverviewPage() {
    const { accounts } = useMsal();
    const { request, cancel } = useApiRequest();

    // Use context for shared state
    const { monitors, drifts, setMonitors, setDrifts, hasData, updateLastFetchTime } = useMonitorContext();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);

    const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [resourceTypeFilter, setResourceTypeFilter] = useState<string[]>([]);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [expandedDrifts, setExpandedDrifts] = useState<Set<string>>(new Set());

    // Load data from context on mount if available
    useEffect(() => {
        if (!hasData && accounts.length > 0) {
            // No cached data, show welcome card
        }
    }, [hasData, accounts.length]);

    const fetchData = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);
        setIsCancelled(false);

        try {
            const [monitorsResponse, driftsResponse] = await Promise.all([
                request<ApiResponse<unknown[]>>(MONITOR_CONFIGURATION_ENDPOINT),
                request<ApiResponse<Drift[]>>(MONITOR_CONFIGURATION_DRIFTS_ENDPOINT)
            ]);

            // Unwrap ApiResponseWithCorrelation → response.data is the ApiResponse envelope, response.data.data is the actual data
            if (monitorsResponse?.data?.data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setMonitors(monitorsResponse.data.data as any);
            }

            if (driftsResponse?.data?.data) {
                setDrifts(driftsResponse.data.data);
            }

            updateLastFetchTime();
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        cancel();
        setMonitors([]);
        setDrifts([]);
        setError(null);
        setLoading(false);
        setIsCancelled(true);
    };

    const clearFilters = () => {
        setSelectedMonitors([]);
        setStatusFilter([]);
        setResourceTypeFilter([]);
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

    const filteredDrifts = useMemo(() => {
        let filtered = drifts;

        if (selectedMonitors.length > 0) {
            filtered = filtered.filter(d => selectedMonitors.includes(d.monitorId as string));
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter(d => statusFilter.includes(d.status as string));
        }

        if (resourceTypeFilter.length > 0) {
            filtered = filtered.filter(d => resourceTypeFilter.includes(d.resourceType as string));
        }

        return filtered;
    }, [drifts, selectedMonitors, statusFilter, resourceTypeFilter]);

    // Memoize filter options
    const monitorOptions = useMemo((): Option[] => {
        return monitors.map(m => ({
            label: m.displayName,
            value: m.id
        }));
    }, [monitors]);

    const statusOptions = useMemo((): Option[] => [
        { label: 'Active', value: 'active' },
        { label: 'Fixed', value: 'fixed' }
    ], []);

    const resourceTypeOptions = useMemo((): Option[] => {
        const types = new Set(drifts.map(d => d.resourceType as string));
        return Array.from(types).map(type => ({
            label: type,
            value: type
        }));
    }, [drifts]);

    const getMonitorName = useMemo(() => {
        const monitorMap = new Map(monitors.map(m => [m.id, m.displayName]));
        return (monitorId: string) => monitorMap.get(monitorId) || 'Unknown Monitor';
    }, [monitors]);

    // Memoize stats calculations
    const stats = useMemo(() => ({
        totalDrifts: drifts.length,
        activeDrifts: drifts.filter(d => d.status === 'active').length,
        fixedDrifts: drifts.filter(d => d.status === 'fixed').length,
        totalMonitors: monitors.length,
        monitorsWithDrifts: new Set(drifts.map(d => d.monitorId)).size,
        filteredDrifts: filteredDrifts.length
    }), [drifts, monitors, filteredDrifts]);

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Configuration Drifts Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Monitor and track configuration drifts across your Intune environment
                    </p>
                </div>
                <div className="flex gap-2">
                    {drifts.length > 0 ? (
                        <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    ) : (
                        <>
                            <Button onClick={fetchData} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Load Drifts
                            </Button>
                            {loading && (
                                <Button onClick={handleCancel} variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {error && (
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
            )}

            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => {
                        setIsCancelled(false);
                        fetchData();
                    }}
                    title="Loading Cancelled"
                    description="Drift data loading was cancelled. Click below to load drifts again."
                    buttonText="Load Drifts"
                />
            )}

            {drifts.length === 0 && !loading && !error && !isCancelled && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Ready to view configuration drifts
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Load drifts to see all configuration changes detected by your monitors
                            </p>
                            <Button onClick={fetchData} size="lg">
                                <Database className="h-5 w-5 mr-2" />
                                Load Drifts
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading && drifts.length === 0 && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-400 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Drifts
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching drift data...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {drifts.length > 0 && (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Drifts</p>
                                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalDrifts}</p>
                                    </div>
                                    <AlertTriangle className="h-12 w-12 text-yellow-500 opacity-50" />
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
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Fixed Drifts</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.fixedDrifts}</p>
                                    </div>
                                    <CheckCircle className="h-12 w-12 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Monitors</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMonitors}</p>
                                    </div>
                                    <Database className="h-12 w-12 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Monitors with Drifts</p>
                                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.monitorsWithDrifts}</p>
                                    </div>
                                    <AlertTriangle className="h-12 w-12 text-orange-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between">
                                <button
                                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                    className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                                >
                                    <Filter className="h-5 w-5" />
                                    Filters
                                    {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <div className="flex items-center gap-2">
                                    {!isFiltersExpanded && (
                                        <Badge variant="secondary">
                                            {selectedMonitors.length + statusFilter.length + resourceTypeFilter.length} active
                                        </Badge>
                                    )}
                                    {(selectedMonitors.length > 0 || statusFilter.length > 0 || resourceTypeFilter.length > 0) && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>

                        {isFiltersExpanded && (
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Monitor</label>
                                        <MultiSelect
                                            options={monitorOptions}
                                            selected={selectedMonitors}
                                            onChange={setSelectedMonitors}
                                            placeholder="Select monitors..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <MultiSelect
                                            options={statusOptions}
                                            selected={statusFilter}
                                            onChange={setStatusFilter}
                                            placeholder="Select status..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Resource Type</label>
                                        <MultiSelect
                                            options={resourceTypeOptions}
                                            selected={resourceTypeFilter}
                                            onChange={setResourceTypeFilter}
                                            placeholder="Select types..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Drifts List */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Configuration Drifts</span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Showing {filteredDrifts.length} of {drifts.length} drifts
                                </span>
                            </CardTitle><CardDescription>
                                Detailed view of all configuration drifts detected by your monitors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filteredDrifts.map((drift) => {
                                const isExpanded = expandedDrifts.has(drift.id as string);
                                const isActive = drift.status === 'active';

                                return (
                                    <Card key={drift.id as string} className="overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-base">{drift.baselineResourceDisplayName as string}</h3>
                                                        <Badge variant={isActive ? 'destructive' : 'default'}
                                                               className={`text-xs ${!isActive ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                                            {isActive ? (
                                                                <><AlertTriangle className="h-3 w-3 mr-1" /> Active</>
                                                            ) : (
                                                                <><CheckCircle className="h-3 w-3 mr-1" /> Fixed</>
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        Monitor: {getMonitorName(drift.monitorId as string)}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleDriftExpansion(drift.id as string)}
                                                    className="text-yellow-400 hover:text-yellow-500"
                                                >
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0 space-y-3">
                                            {/* Summary Row */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">Resource Type</span>
                                                    <p className="text-gray-900 dark:text-gray-100">{drift.resourceType as string}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">Properties Changed</span>
                                                    <p className="text-gray-900 dark:text-gray-100">
                                                        {(drift.driftedProperties as DriftedProperty[]).length}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">Detected</span>
                                                    <div className="flex items-center gap-1 text-gray-900 dark:text-gray-100">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(drift.firstReportedDateTime as string).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleDriftExpansion(drift.id as string)}
                                                        className="w-full text-yellow-400 hover:text-yellow-500"
                                                    >
                                                        {isExpanded ? 'Hide' : 'Show'} Details
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (drift.driftedProperties as DriftedProperty[]).length > 0 && (
                                                <div className="space-y-3 pt-3 border-t">
                                                    <h4 className="font-semibold text-sm">Drifted Properties ({(drift.driftedProperties as DriftedProperty[]).length})</h4>
                                                    {(drift.driftedProperties as DriftedProperty[]).map((property, index) => (
                                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                                                            <h5 className="font-medium text-sm flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                                {property.propertyName}
                                                            </h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 mb-1">Current Value</p>
                                                                    <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block overflow-x-auto">
                                                                        {JSON.stringify(property.currentValue, null, 2)}
                                                                    </code>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 mb-1">Desired Value</p>
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
                                );
                            })}
                        </CardContent>
                    </Card></>
            )}
        </div>
    );
}