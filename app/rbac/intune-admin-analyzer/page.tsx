'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import {
    Shield,
    Users,
    AlertTriangle,
    RefreshCw,
    Loader2,
    CheckCircle,
    XCircle,
    Calendar,
    Activity,
    ChevronLeft,
    Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApiRequest } from '@/hooks/useApiRequest';
import { RBAC_ANALYSIS_ENDPOINT } from '@/lib/constants';
import { RbacAnalysisResponse, UserAnalysis } from '@/types/rbac';
import { format } from 'date-fns';

export default function IntuneAdminAnalyzerPage() {
    const router = useRouter();
    const { request } = useApiRequest();
    
    const [daysToAnalyze, setDaysToAnalyze] = useState<number>(60);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<RbacAnalysisResponse | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserAnalysis | null>(null);

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        setSelectedUser(null);

        try {
            const response = await request<RbacAnalysisResponse>(
                `${RBAC_ANALYSIS_ENDPOINT}?daysToAnalyze=${daysToAnalyze}`,
                { method: 'GET' }
            );

            if (response?.data) {
                setAnalysisData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to run analysis');
            console.error('Analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMembershipBadgeColor = (membership: string) => {
        switch (membership.toLowerCase()) {
            case 'direct':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'group':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'nested':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getActivityLevel = (summary: UserAnalysis['activitySummary']) => {
        const { readActions, writeActions, deleteActions } = summary;
        
        if (deleteActions > 0) return { level: 'High', color: 'text-red-600 dark:text-red-400' };
        if (writeActions > 0) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
        if (readActions > 0) return { level: 'Low', color: 'text-green-600 dark:text-green-400' };
        return { level: 'None', color: 'text-gray-600 dark:text-gray-400' };
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/rbac')}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to RBAC
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Intune Admin Analyzer</h1>
                    <p className="text-muted-foreground mt-2">
                        Analyze Intune Administrator role members and identify over-privileged accounts
                    </p>
                </div>
            </div>

            {/* Configuration Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Analysis Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure the analysis period (maximum 90 days)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 max-w-xs">
                            <Label htmlFor="days">Days to Analyze</Label>
                            <Input
                                id="days"
                                type="number"
                                min="1"
                                max="90"
                                value={daysToAnalyze}
                                onChange={(e) => setDaysToAnalyze(Math.min(90, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Number of days to look back in audit logs
                            </p>
                        </div>
                        <Button
                            onClick={runAnalysis}
                            disabled={loading}
                            className="w-full md:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {analysisData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Role Analyzed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="text-2xl font-bold">{analysisData.data.roleName}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ID: {analysisData.data.roleId.substring(0, 8)}...
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <div className="text-2xl font-bold">{analysisData.data.totalUsers}</div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Role members analyzed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Over-Privileged Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <div className="text-2xl font-bold">{analysisData.data.overPrivilegedUsers}</div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {analysisData.data.overPrivilegedUsers === 0 ? 'All users active' : 'Require review'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Intune Event Analysis Period
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    <div className="text-2xl font-bold">{daysToAnalyze}</div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {format(new Date(analysisData.data.analysisStartDate), 'MMM d')} - {format(new Date(analysisData.data.analysisEndDate), 'MMM d, yyyy')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* User Analysis Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Analysis Results
                            </CardTitle>
                            <CardDescription>
                                Detailed breakdown of role members and their activity levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                data={analysisData.data.userAnalyses.map(user => ({
                                    id: user.userId,
                                    ...user
                                }))}
                                columns={[
                                    {
                                        key: 'isOverPrivileged',
                                        label: 'Status',
                                        width: 80,
                                        sortable: true,
                                        searchable: false,
                                        render: (value) => (
                                            value ? (
                                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )
                                        )
                                    },
                                    {
                                        key: 'displayName',
                                        label: 'User',
                                        width: 250,
                                        sortable: true,
                                        searchable: true,
                                        render: (value, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return (
                                                <div className="space-y-1">
                                                    <div className="font-medium">{value as string}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {user.userPrincipalName}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    },
                                    {
                                        key: 'roleMembership',
                                        label: 'Membership',
                                        width: 150,
                                        sortable: true,
                                        searchable: true,
                                        render: (value, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return (
                                                <div>
                                                    <Badge className={getMembershipBadgeColor(value as string)}>
                                                        {value as string}
                                                    </Badge>
                                                    {user.sourceGroupName && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            via {user.sourceGroupName}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    },
                                    {
                                        key: 'activityLevel',
                                        label: 'Activity Level',
                                        width: 130,
                                        sortable: true,
                                        searchable: false,
                                        sortValue: (row) => {
                                            const user = row as unknown as UserAnalysis;
                                            const { readActions, writeActions, deleteActions } = user.activitySummary;
                                            if (deleteActions > 0) return 3;
                                            if (writeActions > 0) return 2;
                                            if (readActions > 0) return 1;
                                            return 0;
                                        },
                                        render: (_, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            const activityLevel = getActivityLevel(user.activitySummary);
                                            return (
                                                <span className={`font-medium ${activityLevel.color}`}>
                                                    {activityLevel.level}
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        key: 'totalActions',
                                        label: 'Total Actions',
                                        width: 120,
                                        sortable: true,
                                        searchable: false,
                                        sortValue: (row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return user.activitySummary.totalActions;
                                        },
                                        render: (_, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return (
                                                <span className="font-mono">
                                                    {user.activitySummary.totalActions}
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        key: 'readActions',
                                        label: 'Read',
                                        width: 100,
                                        sortable: true,
                                        searchable: false,
                                        sortValue: (row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return user.activitySummary.readActions;
                                        },
                                        render: (_, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return (
                                                <span className="font-mono text-green-600">
                                                    {user.activitySummary.readActions}
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        key: 'writeActions',
                                        label: 'Write',
                                        width: 100,
                                        sortable: true,
                                        searchable: false,
                                        sortValue: (row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return user.activitySummary.writeActions;
                                        },
                                        render: (_, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return (
                                                <span className="font-mono text-yellow-600">
                                                    {user.activitySummary.writeActions}
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        key: 'deleteActions',
                                        label: 'Delete',
                                        width: 100,
                                        sortable: true,
                                        searchable: false,
                                        sortValue: (row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return user.activitySummary.deleteActions;
                                        },
                                        render: (_, row) => {
                                            const user = row as unknown as UserAnalysis;
                                            return (
                                                <span className="font-mono text-red-600">
                                                    {user.activitySummary.deleteActions}
                                                </span>
                                            );
                                        }
                                    },
                                    {
                                        key: 'actions',
                                        label: 'Details',
                                        width: 100,
                                        sortable: false,
                                        searchable: false,
                                        render: (_, row) => (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(row as unknown as UserAnalysis);
                                                }}
                                            >
                                                <Info className="h-4 w-4" />
                                            </Button>
                                        )
                                    }
                                ]}
                                onRowClick={(row) => setSelectedUser(row as unknown as UserAnalysis)}
                                showPagination={true}
                                showSearch={true}
                                searchPlaceholder="Search users..."
                                rowClassName={(row) => {
                                    const user = row as unknown as UserAnalysis;
                                    return user.isOverPrivileged ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : '';
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* User Detail Panel */}
                    {selectedUser && (
                        <Card className="border-primary/20">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        User Details: {selectedUser.displayName}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">User Principal Name</Label>
                                        <p className="font-mono text-sm mt-1">{selectedUser.userPrincipalName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">User ID</Label>
                                        <p className="font-mono text-sm mt-1">{selectedUser.userId}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Privilege Status</Label>
                                    <div className={`p-3 rounded-lg ${selectedUser.isOverPrivileged ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                                        <p className="text-sm">{selectedUser.overPrivilegeReason}</p>
                                    </div>
                                </div>

                                {selectedUser.activitySummary.uniqueActionsPerformed.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Unique Actions Performed</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.activitySummary.uniqueActionsPerformed.map((action, idx) => (
                                                <Badge key={idx} variant="outline">
                                                    {action}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedUser.activitySummary.unusedPermissions.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Unused Permissions</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.activitySummary.unusedPermissions.map((permission, idx) => (
                                                <Badge key={idx} variant="secondary">
                                                    {permission}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Instructions when no results */}
            {!analysisData && !loading && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This tool analyzes Intune Administrator role assignments by:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Identifying all members (direct, group, and nested group members)</li>
                            <li>Analyzing Intune audit events for the specified time period</li>
                            <li>Categorizing user activity into read, write, and delete operations</li>
                            <li>Identifying over-privileged users with no activity or read-only usage</li>
                        </ol>
                        <p className="text-sm text-muted-foreground">
                            Click <strong>Run Analysis</strong> to start analyzing your Intune Administrator role assignments.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

