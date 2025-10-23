'use client';
import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/contexts/CustomerContext';
import { DataTable } from '@/components/DataTable';

import {
    Building,
    Mail,
    Home,
    Users,
    Shield,
    AlertCircle,
    CheckCircle,
    Loader2,
    Plus
} from 'lucide-react';
import {CUSTOMER_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";
import TenantOnboardingModal from '@/components/onboarding/tenant-onboarding';

interface Tenant {
    id: string;
    tenantId: string;
    displayName: string;
    domainName: string;
    isEnabled: boolean;
    isPrimary: boolean;
    isGdap: boolean;
    lastLogin: string | null;
}

export default function CustomerPage() {
    const { accounts, instance } = useMsal();
    const { setSelectedTenant, selectedTenant } = useTenant();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    const router = useRouter();
    const { customerData, customerLoading: loading, customerError: error, refetchCustomerData } = useCustomer();

    const [updatingTenants, setUpdatingTenants] = useState<Set<string>>(new Set());
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [showClickOverlay, setShowClickOverlay] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

    const currentTenantId = accounts[0]?.tenantId;

    const columns = [
        {
            key: "displayName",
            label: "Display Name",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;

                return (
                    <div className="flex items-center gap-2 text-sm font-medium truncate w-full text-left">
                        <div
                        />
                        <span className="font-medium truncate transition-colors duration-200">
    {tenant.displayName}
</span>

                    </div>
                );
            },
        },
        {
            key: "tenantId",
            label: "Tenant ID",
            render: (value: unknown) => (
                <code className="text-sm font-medium cursor-pointer truncate block w-full text-left">
                    {value as string}
                </code>
            ),
        },
        {
            key: "isEnabled",
            label: "Status",
            render: (value: unknown) => {
                const isEnabled = value as boolean;
                return (
                    <div className="flex items-center gap-2">
                        {isEnabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={isEnabled ? "default" : "secondary"}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                    </div>
                );
            },
        },
        {
            key: "isPrimary",
            label: "Primary",
            render: (value: unknown) => {
                const isPrimary = value as boolean;
                return (
                    <Badge variant={isPrimary ? "default" : "outline"}>
                        {isPrimary ? 'Primary' : 'Secondary'}
                    </Badge>
                );
            },
        },
        {
            key: "isGdap",
            label: "Gdap",
            render: (value: unknown) => {
                const isGdap = value as boolean;
                return (
                    <Badge variant={isGdap ? "default" : "outline"}>
                        {isGdap ? 'Enabled' : 'Disabled'}
                    </Badge>
                );
            },
        },
        {
            key: "domainName",
            label: "Domain",
            render: (value: unknown) => (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-medium">
                    {value as string}
                </code>


            ),
        },
        {
            key: "rolloutEnabled",
            label: "Rollout Enabled",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                return (
                    <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Switch
                            checked={tenant.isEnabled}
                            onCheckedChange={(checked) =>
                                updateTenantStatus(tenant.id, checked)
                            }
                            disabled={updatingTenants.has(tenant.id)}
                        />
                        {updatingTenants.has(tenant.id) && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                    </div>
                );
            },
        },
    ];

    const updateTenantStatus = async (tenantId: string, isEnabled: boolean) => {
        try {
            setUpdatingTenants(prev => new Set(prev).add(tenantId));
            setUpdateError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/${currentTenantId}/tenants/update-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenantId,
                    isEnabled
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to update tenant status: ${apiResponse.statusText}`);
            }

            // Refresh customer data to get updated tenant status
            await refetchCustomerData();

        } catch (err) {
            console.error('Failed to update tenant status:', err);
            setUpdateError(err instanceof Error ? err.message : 'Failed to update tenant status');
        } finally {
            setUpdatingTenants(prev => {
                const newSet = new Set(prev);
                newSet.delete(tenantId);
                return newSet;
            });
        }
    };

    const handleTenantSelect = (tenant: Tenant) => {
        setShowClickOverlay(true);
        setSelectedTenant(tenant);
        setSelectedTenantId(tenant.id);
        setTimeout(() => {
            setShowClickOverlay(false);
        }, 200);
    };

    const handleTenantOnboardingSuccess = async () => {
        setShowOnboardingModal(false);
        await refetchCustomerData();
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading customer information...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <span>Error: {error}</span>
                        </div>
                        <Button onClick={refetchCustomerData} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!customerData) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p>No customer data available</p>
                        <Button onClick={() => router.back()} className="mt-4">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 w-full max-w-none mx-auto px-8">
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    ← Back
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customer Information</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Manage customer details and tenant access</p>
            </div>


            {/* Show update error if any */}
            {updateError && (
                <Card className="border-red-200 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{updateError}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Customer Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Customer Name</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{customerData.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Address</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {customerData.address || 'Not provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Primary Contact</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {customerData.primaryContactEmail || 'Not provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Account Type</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant={customerData.isMsp ? "default" : "secondary"}>
                                            {customerData.isMsp ? 'MSP' : 'Direct'}
                                        </Badge>
                                        <Badge variant={customerData.isActive ? "default" : "destructive"}>
                                            {customerData.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge variant={customerData.isGdap ? "default" : "secondary"}>
                                            {customerData.isGdap ? 'Gdap' : 'No Gdap'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Home Tenant ID</p>
                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                        {customerData.homeTenantId}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {customerData.tenants.length}
                                </div>
                                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Tenants</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {customerData.tenants.filter((t: Tenant) => t.isEnabled).length}
                                </div>
                                <div className="text-sm font-medium text-green-800 dark:text-green-200">Enabled Tenants</div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Tenants Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Tenant Management
                    </CardTitle>
                    {customerData.isMsp && customerData.isActive && (
                        <Button
                            onClick={() => setShowOnboardingModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Tenant
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="relative">
                    {showClickOverlay && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-60 animate-shimmer" />
                    )}

                    <DataTable
                        data={customerData.tenants.map(tenant => tenant as unknown as Record<string, unknown>)}
                        columns={columns}
                        className="text-sm"
                        currentPage={currentPage}
                        totalPages={Math.ceil(customerData.tenants.length / itemsPerPage)}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newItemsPerPage) => {
                            setItemsPerPage(newItemsPerPage);
                            setCurrentPage(1);
                        }}
                        onRowClick={(row) => {
                            const tenant = row as unknown as Tenant;
                            handleTenantSelect(tenant);
                        }}
                        selectedRows={selectedTenantId ? [selectedTenantId] : []} // Pass selected tenant ID
                        showPagination={true}
                    />
                </CardContent>
            </Card>

            <TenantOnboardingModal
                isOpen={showOnboardingModal}
                onClose={() => setShowOnboardingModal(false)}
                customerId={customerData.id}
                customerName={customerData.name}
                onSuccess={handleTenantOnboardingSuccess}
            />
        </div>
    );
}