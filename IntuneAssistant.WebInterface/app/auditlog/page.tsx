'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import {
    RefreshCw,
    ScrollText,
    Clock,
    User,
    Activity,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { AUDITLOG_ENDPOINT } from '@/lib/constants';
import { CancelledCard } from '@/components/CancelledCard';

interface AuditLog extends Record<string, unknown> {
    id: string;
    customerId: string;
    tenantId: string;
    action: string;
    performedBy: string | null;
    performedByName: string | null;
    reason: string;
    createdAt: string;
    metadata: Record<string, unknown> | null;
}

interface AuditLogResponse {
    status: string;
    message: string;
    details: unknown[];
    data: {
        logs: AuditLog[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    };
}

export default function AuditLogPage() {
    const { accounts } = useMsal();
    const { request, cancel } = useApiRequest();

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (accounts.length > 0) {
            fetchAuditLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    const fetchAuditLogs = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);
        setIsCancelled(false);

        try {
            const response = await request<AuditLogResponse>(AUDITLOG_ENDPOINT, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            // Unwrap ApiResponseWithCorrelation → response.data is the envelope, response.data.data.logs is the logs array
            const envelope = response?.data;
            if (envelope?.data?.logs) {
                setLogs(envelope.data.logs);
                setTotalCount(envelope.data.totalCount);
            } else {
                setError('Invalid response format');
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        cancel();
        setLoading(false);
        setIsCancelled(true);
    };

    const toggleRowExpansion = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getActionBadge = (action: string) => {
        if (action.includes('Started')) {
            return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                <Activity className="h-3 w-3 mr-1" />
                Started
            </Badge>;
        }
        if (action.includes('Completed')) {
            return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
            </Badge>;
        }
        if (action.includes('Failed') || action.includes('Deletion')) {
            return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                {action.includes('Deletion') ? 'Deleted' : 'Failed'}
            </Badge>;
        }
        if (action.includes('Enabled')) {
            return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
            </Badge>;
        }
        if (action.includes('Disabled')) {
            return <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                Disabled
            </Badge>;
        }
        return <Badge variant="outline">{action}</Badge>;
    };

    const stats = useMemo(() => {
        const actionCounts = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalLogs: totalCount,
            uniqueActions: Object.keys(actionCounts).length,
            recentActions: logs.slice(0, 5).map(l => l.action),
            startedActions: logs.filter(l => l.action.includes('Started')).length,
            completedActions: logs.filter(l => l.action.includes('Completed')).length,
        };
    }, [logs, totalCount]);

    const columns = [
        {
            key: 'expand',
            label: '',
            width: 50,
            render: (_value: unknown, row: Record<string, unknown>) => {
                const log = row as unknown as AuditLog;
                const isExpanded = expandedRows.has(log.id);
                return log.metadata ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(log.id)}
                        className="p-1"
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                ) : null;
            }
        },
        {
            key: 'createdAt',
            label: 'Timestamp',
            width: 180,
            render: (value: unknown) => {
                const date = new Date(String(value));
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-gray-500" />
                            {date.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                            {date.toLocaleTimeString()}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'action',
            label: 'Action',
            width: 250,
            render: (value: unknown, row: Record<string, unknown>) => {
                const log = row as unknown as AuditLog;
                const isExpanded = expandedRows.has(log.id);
                return (
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {String(value)}
                            </div>
                            <div>{getActionBadge(log.action)}</div>
                        </div>
                        {isExpanded && log.metadata && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-xs mb-2 text-gray-900 dark:text-gray-100">
                                    Metadata
                                </h4>
                                <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-48 overflow-y-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'reason',
            label: 'Reason',
            width: 300,
            render: (value: unknown) => (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    {String(value)}
                </div>
            )
        },
        {
            key: 'performedByName',
            label: 'Performed By',
            width: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const log = row as unknown as AuditLog;
                return (
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-gray-500" />
                        {log.performedByName || log.performedBy || (
                            <span className="text-gray-500 italic">System</span>
                        )}
                    </div>
                );
            }
        }
    ];

    if (loading && logs.length === 0) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="relative overflow-hidden bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-400 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Audit Logs
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching audit log data...
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

    if (error && !loading) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={fetchAuditLogs} className="mt-4" variant="outline">
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
                <CancelledCard
                    onRetry={() => {
                        setIsCancelled(false);
                        fetchAuditLogs();
                    }}
                    title="Loading Cancelled"
                    description="Audit log loading was cancelled. Click below to load again."
                    buttonText="Load Audit Logs"
                />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <ScrollText className="h-8 w-8 text-blue-500" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        View all activity and changes in your environment
                    </p>
                </div>
                <Button onClick={fetchAuditLogs} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Logs</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalLogs}</p>
                            </div>
                            <ScrollText className="h-12 w-12 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedActions}</p>
                            </div>
                            <CheckCircle className="h-12 w-12 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Started</p>
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.startedActions}</p>
                            </div>
                            <Activity className="h-12 w-12 text-yellow-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Unique Actions</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.uniqueActions}</p>
                            </div>
                            <Activity className="h-12 w-12 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Logs Table */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                        All actions and events recorded in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={logs}
                        columns={columns}
                        showPagination={true}
                        showSearch={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
