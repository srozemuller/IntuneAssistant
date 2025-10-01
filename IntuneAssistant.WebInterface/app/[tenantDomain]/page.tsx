'use client';
import { useState, useEffect, use } from 'react';
import { useMsal } from '@azure/msal-react';
import { useTenant } from '@/contexts/TenantContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
    Building,
    ArrowLeft,
    Users,
    Shield,
    Calendar,
    AlertCircle,
    CheckCircle,
    Loader2,
    Activity,
    Settings,
    BarChart3
} from 'lucide-react';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';
interface TenantDetails {
    id: string;
    tenantId: string;
    displayName: string;
    domainName: string;
    isEnabled: boolean;
    isPrimary: boolean;
    lastLogin: string | null;
    // Additional tenant-specific data
    userCount?: number;
    appCount?: number;
    securityScore?: number;
    complianceStatus?: string;
}

interface TenantPageProps {
    params: Promise<{
        tenantDomain: string;
    }>;
}


export default function TenantPage({ params }: TenantPageProps) {
    const { accounts, instance } = useMsal();
    const { selectedTenant, setSelectedTenant } = useTenant();
    const { customerData } = useCustomer();
    const router = useRouter();

    const resolvedParams = use(params) as { tenantDomain: string };

    const [tenantDetails, setTenantDetails] = useState<TenantDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentTenantId = accounts[0]?.tenantId;

    // Find tenant from customer data or fetch by domain
    useEffect(() => {
        const findAndSetTenant = async () => {
            try {
                setLoading(true);
                setError(null);

                if (customerData?.tenants) {
                    const foundTenant = customerData.tenants.find(
                        (tenant: TenantDetails) => tenant.domainName === resolvedParams.tenantDomain
                    );

                    if (foundTenant) {
                        setSelectedTenant(foundTenant);
                        setTenantDetails(foundTenant);
                        setLoading(false);
                        return;
                    }
                }

                if (currentTenantId && !selectedTenant) {
                    const response = await instance.acquireTokenSilent({
                        scopes: [apiScope],
                        account: accounts[0]
                    });

                    const apiResponse = await fetch(
                        `${CUSTOMER_ENDPOINT}/${currentTenantId}/tenants/by-domain/${resolvedParams.tenantDomain}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${response.accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (!apiResponse.ok) {
                        if (apiResponse.status === 404) {
                            throw new Error('Tenant not found');
                        }
                        throw new Error(`Failed to fetch tenant: ${apiResponse.statusText}`);
                    }

                    const tenantData = await apiResponse.json();
                    setSelectedTenant(tenantData);
                    setTenantDetails(tenantData);
                }
            } catch (err) {
                console.error('Failed to load tenant:', err);
                setError(err instanceof Error ? err.message : 'Failed to load tenant');
            } finally {
                setLoading(false);
            }
        };

        findAndSetTenant();
    }, [resolvedParams.tenantDomain, customerData, currentTenantId]);


    const handleBack = () => {
        setSelectedTenant(null);
    };

    if (!tenantDetails) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p>Tenant not found: {resolvedParams.tenantDomain}</p>
                        <Button onClick={handleBack} className="mt-4">
                            Back to Customer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading tenant information...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600 mb-4">
                            <AlertCircle className="h-5 w-5" />
                            <span>Error: {error}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => router.back()} variant="outline">
                                Go Back
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!tenantDetails) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p>Tenant not found: {resolvedParams.tenantDomain}</p>
                        <Button onClick={handleBack} className="mt-4">
                            Back to Customer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Customer
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Building className="h-8 w-8" />
                            {tenantDetails.displayName}
                        </h1>
                        <p className="text-gray-600 mt-2 flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                {tenantDetails.domainName}
                            </code>
                            <Badge variant={tenantDetails.isEnabled ? "default" : "secondary"}>
                                {tenantDetails.isEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            {tenantDetails.isPrimary && (
                                <Badge variant="outline">Primary</Badge>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                        <Button className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Monitor
                        </Button>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${tenantDetails.isEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                                {tenantDetails.isEnabled ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">Status</p>
                                <p className={`text-lg font-semibold ${
                                    tenantDetails.isEnabled ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {tenantDetails.isEnabled ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Users</p>
                                <p className="text-lg font-semibold">
                                    {tenantDetails.userCount ?? 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-purple-100">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Security Score</p>
                                <p className="text-lg font-semibold">
                                    {tenantDetails.securityScore ?? 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-100">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Last Login</p>
                                <p className="text-sm font-medium">
                                    {tenantDetails.lastLogin ?
                                        new Date(tenantDetails.lastLogin).toLocaleDateString() :
                                        'Never'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tenant Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Tenant Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Display Name</label>
                                <p className="text-lg font-medium">{tenantDetails.displayName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Domain Name</label>
                                <p className="text-lg font-mono bg-gray-50 p-2 rounded">
                                    {tenantDetails.domainName}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tenant ID</label>
                                <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                                    {tenantDetails.tenantId}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant={tenantDetails.isPrimary ? "default" : "outline"}>
                                        {tenantDetails.isPrimary ? 'Primary' : 'Secondary'}
                                    </Badge>
                                    <Badge variant={tenantDetails.isEnabled ? "default" : "secondary"}>
                                        {tenantDetails.isEnabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start" disabled>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Users (Coming Soon)
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            <Shield className="h-4 w-4 mr-2" />
                            Security Overview (Coming Soon)
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            <Activity className="h-4 w-4 mr-2" />
                            Activity Logs (Coming Soon)
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            <Settings className="h-4 w-4 mr-2" />
                            Tenant Settings (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
