'use client';

import React, { useState } from 'react';
import {
    Shield,
    Lock,
    Eye,
    Users,
    Database,
    CheckCircle,
    AlertCircle,
    FileText,
    Key,
    Zap,
    ExternalLink,
    ChevronRight,
    Globe,
    UserCheck,
    Settings,
    Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Permission {
    name: string;
    description: string;
    type: 'read' | 'write' | 'partner';
}

const readPermissions: Permission[] = [
    {
        name: 'DeviceManagementConfiguration.Read.All',
        description: 'Read Intune configuration profiles and baselines',
        type: 'read'
    },
    {
        name: 'DeviceManagementApps.Read.All',
        description: 'Read managed applications',
        type: 'read'
    },
    {
        name: 'DeviceManagementServiceConfig.Read.All',
        description: 'Read device management service configuration',
        type: 'read'
    },
    {
        name: 'DeviceManagementScripts.Read.All',
        description: 'Read management scripts',
        type: 'read'
    },
    {
        name: 'Group.Read.All',
        description: 'Read group memberships',
        type: 'read'
    },
    {
        name: 'Directory.AccessAsUser.All',
        description: 'Access directory data on behalf of the user',
        type: 'read'
    },
    {
        name: 'Policy.Read.ConditionalAccess',
        description: 'Read Conditional Access policies',
        type: 'read'
    }
];

const writePermissions: Permission[] = [
    {
        name: 'DeviceManagementConfiguration.ReadWrite.All',
        description: 'Modify configuration profiles',
        type: 'write'
    },
    {
        name: 'DeviceManagementApps.ReadWrite.All',
        description: 'Create or update applications',
        type: 'write'
    },
    {
        name: 'DeviceManagementServiceConfig.ReadWrite.All',
        description: 'Modify service configuration',
        type: 'write'
    },
    {
        name: 'DeviceManagementScripts.ReadWrite.All',
        description: 'Upload or edit scripts',
        type: 'write'
    },
    {
        name: 'Group.ReadWrite.All',
        description: 'Manage group memberships',
        type: 'write'
    }
];

const partnerPermissions: Permission[] = [
    {
        name: 'DelegatedAdminRelationship.Read.All',
        description: 'Read Partner Center relationships to onboard customer tenants',
        type: 'partner'
    }
];

const dataTable = [
    {
        type: 'Tenant ID',
        stored: true,
        purpose: 'Identify tenant and enforce fair-usage licensing',
        retention: 'Persistent'
    },
    {
        type: 'Tenant Domain',
        stored: true,
        purpose: 'Display and licensing identification',
        retention: 'Persistent'
    },
    {
        type: 'Session Data (tokens, settings)',
        stored: false,
        purpose: 'Stored only in the browser session',
        retention: 'Temporary'
    },
    {
        type: 'Intune / Graph Data',
        stored: false,
        purpose: 'Processed in memory only, never persisted',
        retention: 'N/A'
    }
];

const securityFeatures = [
    {
        icon: Shield,
        title: 'Zero-Trust Architecture',
        description: 'All authentication via Microsoft Entra ID with delegated permissions only'
    },
    {
        icon: Lock,
        title: 'No Application Permissions',
        description: 'No system accounts or application-only permissions - all actions on behalf of user'
    },
    {
        icon: Eye,
        title: 'Minimal Data Storage',
        description: 'Only tenant ID and domain stored - no user or configuration data'
    },
    {
        icon: UserCheck,
        title: 'Role-Based Access',
        description: 'Respects existing Intune and Entra ID role assignments'
    },
    {
        icon: Key,
        title: 'Short-Lived Tokens',
        description: 'Delegated tokens with automatic expiration and refresh'
    },
    {
        icon: Settings,
        title: 'Customer Control',
        description: 'Full control over consent, access restrictions, and revocation'
    }
];

const complianceItems = [
    'OAuth 2.0 / OpenID Connect compliant',
    'Uses only Microsoft Graph API',
    'No application-only access',
    'No data exfiltration',
    'Customer-controlled access & consent',
    'Revocable at any time in Entra ID',
    'Microsoft-compliant multi-tenant model',
    'All actions appear in audit logs under user context'
];

export default function SecurityPage() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="inline-flex p-4 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                            <Shield className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Security & Compliance
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto">
                            Technical and security background of Intune Assistant to support internal review,
                            onboarding, and approval by security and compliance teams
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Enterprise Grade Security
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 px-4 py-2">
                                <Lock className="h-4 w-4 mr-2" />
                                Zero-Trust Architecture
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-100 border-purple-400/30 px-4 py-2">
                                <Eye className="h-4 w-4 mr-2" />
                                Minimal Data Storage
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-3">
                            <Shield className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="architecture" className="flex items-center gap-2 px-4 py-3">
                            <Settings className="h-4 w-4" />
                            Architecture
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2 px-4 py-3">
                            <Key className="h-4 w-4" />
                            Permissions
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-2 px-4 py-3">
                            <Database className="h-4 w-4" />
                            Data & Privacy
                        </TabsTrigger>
                        <TabsTrigger value="compliance" className="flex items-center gap-2 px-4 py-3">
                            <CheckCircle className="h-4 w-4" />
                            Compliance
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Enterprise-Grade Security by Design
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                                Intune Assistant follows Microsoft&apos;s Zero-Trust and Least-Privilege principles,
                                ensuring your organization&apos;s security posture remains uncompromised.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {securityFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Key Benefits */}
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <CheckCircle className="h-6 w-6" />
                                    Key Security Benefits
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">No privileged access required</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Customer retains full control</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">All actions are auditable</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Microsoft-compliant architecture</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Revocable access anytime</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium">Minimal attack surface</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Architecture Tab */}
                    <TabsContent value="architecture" className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-6 w-6 text-blue-600" />
                                    Multi-Tier Authentication Model
                                </CardTitle>
                                <CardDescription>
                                    Intune Assistant uses a secure two-application architecture with Microsoft Entra ID
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Application</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Permissions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">App 1 – Frontend</TableCell>
                                            <TableCell>Handles user login using OpenID Connect</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">None (sign-in only)</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">App 2 – Downstream API</TableCell>
                                            <TableCell>Communicates with Microsoft Graph API via On-Behalf-Of (OBO) flow</TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800">Delegated permissions</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-green-600" />
                                        Security Highlights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">No system accounts or application-only permissions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">All actions performed on behalf of authenticated user</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Tokens are short-lived and delegated</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">Customer admins can revoke access anytime</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCheck className="h-5 w-5 text-purple-600" />
                                        Access Control
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm">Restrict via Enterprise Applications → Users & Groups</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm">Control consent using Admin Consent workflows</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm">Use PIM for time-bound access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm">Role-based access enforcement</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Read Permissions */}
                            <Card className="border-blue-200 dark:border-blue-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                        <Eye className="h-5 w-5" />
                                        Read Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        Default permissions for documentation, reporting, and baseline comparison
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {readPermissions.map((permission, index) => (
                                        <div key={index} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                            <div className="font-mono text-xs text-blue-800 dark:text-blue-200 mb-1">
                                                {permission.name}
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                                {permission.description}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Write Permissions */}
                            <Card className="border-amber-200 dark:border-amber-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                        <Zap className="h-5 w-5" />
                                        Write Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        Required only for paid modules that modify Intune resources
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {writePermissions.map((permission, index) => (
                                        <div key={index} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                            <div className="font-mono text-xs text-amber-800 dark:text-amber-200 mb-1">
                                                {permission.name}
                                            </div>
                                            <div className="text-xs text-amber-600 dark:text-amber-400">
                                                {permission.description}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-950/50 rounded-lg border border-amber-300 dark:border-amber-700">
                                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-xs font-medium">Requested only when activated by customer</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Partner Permissions */}
                            <Card className="border-purple-200 dark:border-purple-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                        <Globe className="h-5 w-5" />
                                        Partner Permissions
                                    </CardTitle>
                                    <CardDescription>
                                        For GDAP / Partner Center integration scenarios
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {partnerPermissions.map((permission, index) => (
                                        <div key={index} className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                                            <div className="font-mono text-xs text-purple-800 dark:text-purple-200 mb-1">
                                                {permission.name}
                                            </div>
                                            <div className="text-xs text-purple-600 dark:text-purple-400">
                                                {permission.description}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-950/50 rounded-lg border border-purple-300 dark:border-purple-700">
                                        <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-xs font-medium">Used only to identify Partner Center tenants during onboarding</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Data & Privacy Tab */}
                    <TabsContent value="data" className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-6 w-6 text-green-600" />
                                    Data Storage & Privacy Policy
                                </CardTitle>
                                <CardDescription>
                                    Minimal data storage approach with transparent data handling
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data Type</TableHead>
                                            <TableHead>Stored</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead>Retention</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dataTable.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{row.type}</TableCell>
                                                <TableCell>
                                                    {row.stored ? (
                                                        <Badge className="bg-yellow-100 text-yellow-800">✅ Yes</Badge>
                                                    ) : (
                                                        <Badge className="bg-green-100 text-green-800">❌ No</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">{row.purpose}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{row.retention}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                        <Shield className="h-5 w-5" />
                                        What We DON&apos;T Store
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">No user personal data</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">No device information</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">No configuration data</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">No authentication tokens</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                                        <Eye className="h-5 w-5" />
                                        Data Processing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Data processed in memory only</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Browser session storage only</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Data cleared on logout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">No persistent caching</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Compliance Tab */}
                    <TabsContent value="compliance" className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                    Security Posture Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Authentication</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Microsoft Entra ID (OpenID Connect + OAuth 2.0 OBO)</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Authorization</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Delegated Microsoft Graph permissions</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Data Residency</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Minimal (tenant ID and domain only)</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Token Handling</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Short-lived, delegated, never stored</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Least Privilege</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Default to read-only</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Auditability</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">All actions appear under signed-in user in audit logs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                    <CheckCircle className="h-6 w-6" />
                                    Compliance Checklist
                                </CardTitle>
                                <CardDescription className="text-green-700 dark:text-green-300">
                                    Intune Assistant meets enterprise security and compliance requirements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {complianceItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <span className="text-sm text-green-800 dark:text-green-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Documentation & Resources
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" asChild className="w-full justify-start">
                                        <a href="/docs/authentication" target="_blank" rel="noopener noreferrer">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Authentication Overview
                                            <ExternalLink className="h-3 w-3 ml-auto" />
                                        </a>
                                    </Button>
                                    <Button variant="outline" asChild className="w-full justify-start">
                                        <a href="/docs/permissions" target="_blank" rel="noopener noreferrer">
                                            <Key className="h-4 w-4 mr-2" />
                                            Detailed Permissions List
                                            <ExternalLink className="h-3 w-3 ml-auto" />
                                        </a>
                                    </Button>
                                    <Button variant="outline" asChild className="w-full justify-start">
                                        <a href="/docs/architecture" target="_blank" rel="noopener noreferrer">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Technical Architecture
                                            <ExternalLink className="h-3 w-3 ml-auto" />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/*<Card>*/}
                            {/*    <CardHeader>*/}
                            {/*        <CardTitle className="flex items-center gap-2">*/}
                            {/*            <Download className="h-5 w-5 text-purple-600" />*/}
                            {/*            For Security Teams*/}
                            {/*        </CardTitle>*/}
                            {/*    </CardHeader>*/}
                            {/*    <CardContent className="space-y-3">*/}
                            {/*        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">*/}
                            {/*            <Download className="h-4 w-4 mr-2" />*/}
                            {/*            Download Security Assessment*/}
                            {/*        </Button>*/}
                            {/*        <Button variant="outline" className="w-full">*/}
                            {/*            <Users className="h-4 w-4 mr-2" />*/}
                            {/*            Schedule Security Review Call*/}
                            {/*        </Button>*/}
                            {/*        <Button variant="outline" className="w-full">*/}
                            {/*            <Shield className="h-4 w-4 mr-2" />*/}
                            {/*            Request Penetration Test Report*/}
                            {/*        </Button>*/}
                            {/*    </CardContent>*/}
                            {/*</Card>*/}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
