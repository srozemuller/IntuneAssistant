// components/MonitorLandingPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MonitorCheck,
    AlertTriangle,
    ArrowRight,
    Shield,
    CheckCircle,
    RefreshCw,
    Loader2,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CONSENT_UTCM_VERIFY } from '@/lib/constants';

interface UTCMPermissionResponse {
    status: number;
    message: string;
    details: unknown[];
    data: {
        id: string;
        appId: string;
        displayName: string | null;
        servicePrincipalType: string | null;
        assignedPermissions: string[];
        newlyAddedPermissions: string[] | null;
        existingPermissions: string[] | null;
    } | null;
}

const REQUIRED_PERMISSIONS = [
    "DeviceManagementManagedDevices.Read.All",
    "DeviceManagementServiceConfig.Read.All",
    "DeviceManagementScripts.Read.All",
    "DeviceManagementRBAC.Read.All",
    "DeviceManagementConfiguration.Read.All",
    "DeviceManagementApps.Read.All",
    "Group.Read.All",
    "User.Read.All",
    "GroupMember.Read.All"
];

export function MonitorLandingPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<{
        configured: boolean;
        missingPermissions: string[];
    } | null>(null);

    // Check UTCM permissions on mount
    useEffect(() => {
        if (accounts.length > 0) {
            checkUTCMPermissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    const checkUTCMPermissions = async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError(null);

            const response = await request<UTCMPermissionResponse>(CONSENT_UTCM_VERIFY, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            // Unwrap ApiResponseWithCorrelation → response.data is the envelope, response.data.data is the actual data
            const envelope = response?.data;
            if (!envelope?.data) {
                // UTCM service principal doesn't exist
                setPermissionStatus({
                    configured: false,
                    missingPermissions: REQUIRED_PERMISSIONS
                });
                return;
            }

            const assignedPermissions = envelope.data.assignedPermissions || [];
            const missingPermissions = REQUIRED_PERMISSIONS.filter(
                perm => !assignedPermissions.includes(perm)
            );

            setPermissionStatus({
                configured: missingPermissions.length === 0,
                missingPermissions
            });
        } catch (err) {
            console.error('Failed to verify UTCM permissions:', err);
            setError(err instanceof Error ? err.message : 'Failed to verify UTCM permissions');
            setPermissionStatus({
                configured: false,
                missingPermissions: REQUIRED_PERMISSIONS
            });
        } finally {
            setLoading(false);
        }
    };

    const monitorBlocks = [
        {
            title: "Global Overview",
            description: "Comprehensive view of configuration drift across all your Intune policies and settings.",
            href: "/monitor/global-overview",
            icon: MonitorCheck,
            gradient: "from-green-500 to-emerald-500",
            bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
            borderColor: "border-green-200 dark:border-green-800",
            features: [
                "Global drift detection",
                "Cross-policy monitoring",
                "Drift severity indicators"
            ],
            badge: "OVERVIEW"
        },
        {
            title: "All Monitors",
            description: "View and manage all your configuration monitors with detailed status information.",
            href: "/monitor/monitors",
            icon: Shield,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
            features: [
                "Monitor status tracking",
                "Performance metrics",
                "Quick actions"
            ],
            badge: "MONITORS"
        },
        {
            title: "Drift Alerts",
            description: "Active alerts and notifications for detected configuration drift events.",
            href: "/monitor/drift",
            icon: AlertTriangle,
            gradient: "from-orange-500 to-red-500",
            bgGradient: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
            borderColor: "border-orange-200 dark:border-orange-800",
            features: [
                "Priority-based alerts",
                "Alert information"
            ],
            badge: "ALERTS"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <MonitorCheck className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Drift Monitoring
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Intune Drift Monitor
                    </h1>
                    <p className="text-xl text-green-100 max-w-2xl">
                        Detect, track, and remediate configuration drift across your Microsoft Intune environment
                        with real-time monitoring and automated alerts.
                    </p>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-gradient-to-br from-teal-400 to-green-400 blur-2xl"></div>
                </div>
            </div>

            {/* UTCM Permission Status Card */}
            {loading && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            <span className="text-gray-900 dark:text-gray-100">Verifying UTCM permissions...</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && !loading && (
                <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <span className="text-red-900 dark:text-red-100">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!loading && permissionStatus && (
                <Card className={`${
                    permissionStatus.configured
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-4 flex-1">
                                {permissionStatus.configured ? (
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`text-lg font-semibold mb-2 ${
                                        permissionStatus.configured
                                            ? 'text-green-900 dark:text-green-100'
                                            : 'text-red-900 dark:text-red-100'
                                    }`}>
                                        {permissionStatus.configured
                                            ? 'UTCM Service Principal Configured ✓'
                                            : 'UTCM Service Principal Not Configured'
                                        }
                                    </h3>
                                    <p className={`text-sm ${
                                        permissionStatus.configured
                                            ? 'text-green-700 dark:text-green-200'
                                            : 'text-red-700 dark:text-red-200'
                                    }`}>
                                        {permissionStatus.configured
                                            ? 'The Unified Tenant Configuration Management (UTCM) service principal is properly configured with all required permissions.'
                                            : 'The UTCM service principal is missing or does not have all required permissions.'
                                        }
                                    </p>
                                </div>
                            </div>
                            {accounts.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={checkUTCMPermissions}
                                    disabled={false}
                                    className={`flex-shrink-0 ${
                                        permissionStatus.configured
                                            ? 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                                            : 'border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
                                    }`}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Recheck
                                </Button>
                            )}
                        </div>

                        {!permissionStatus.configured && permissionStatus.missingPermissions.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium mb-3 text-red-900 dark:text-red-100">Missing Permissions:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                                    {permissionStatus.missingPermissions.map(perm => (
                                        <div key={perm} className="flex items-center gap-2 text-red-800 dark:text-red-200">
                                            <XCircle className="h-4 w-4 flex-shrink-0" />
                                            <span className="font-mono text-xs">{perm}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                                    asChild
                                >
                                    <a
                                        href="https://rozemuller.com/use-utcm-to-monitor-intune-compliance-policy-desired-state/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Learn How to Configure UTCM
                                        <ExternalLink className="h-3 w-3 ml-2" />
                                    </a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Monitor Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {monitorBlocks.map((block, index) => (
                    <Card key={index} className={`relative overflow-hidden hover:shadow-xl hover:scale-105 ${block.borderColor}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${block.bgGradient}`}></div>

                        <CardHeader className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${block.gradient} text-white shadow-lg`}>
                                    <block.icon className="h-6 w-6" />
                                </div>
                                <Badge variant="outline" className="font-medium">
                                    {block.badge}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold">{block.title}</CardTitle>
                            <CardDescription className="text-base">
                                {block.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="relative z-10 pt-0">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    {block.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <Link href={block.href}>
                                        <Button size="sm" className={`bg-gradient-to-r ${block.gradient} text-white shadow-md hover:shadow-lg`}>
                                            Explore
                                            <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Additional Actions */}
            <Card className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Stay Ahead of Configuration Drift</h3>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Proactively monitor your Intune environment for configuration changes and drift.
                            Get instant alerts and take action before issues impact your users.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" asChild>
                                <a href="https://docs.intuneassistant.cloud" target="_blank" rel="noopener noreferrer">
                                    View Documentation
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500">
                                Go to GitHub
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}