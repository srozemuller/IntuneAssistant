'use client';
import { useState, useEffect } from 'react';
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
    Plus,
    Edit,
    Trash2
} from 'lucide-react';
import {CUSTOMER_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";
import TenantOnboardingModal from '@/components/onboarding/tenant-onboarding';

interface TenantUpdateData {
    isActive: boolean;
    isPrimary: boolean;
    isTrial: boolean;
    licenseType: number;
}

interface CustomerTenantLicense {
    id: string;
    createdAt: string;
    expiresAt: string | null;
    isActive: boolean;
    isTrial: boolean;
    licenseType: number;
    activatedBy: string;
    isConsentGranted: boolean;
    consentGrantedAt: string | null;
    consentGrantedBy: string | null;
    isOnboarded: boolean;
    onboardedAt: string | null;
    consentUrl: string | null;
}

interface Tenant {
    id: string;
    tenantId: string;
    displayName: string;
    domainName: string;
    isActive: boolean;
    isPrimary: boolean;
    isGdap: boolean;
    isTrial: boolean;
    lastLogin: string | null;
    licenseType: number;
    licenses?: CustomerTenantLicense[];
}

interface License {
    id: string; // Add this property
    licenseType: number;
    isActive: boolean;
    isTrial: boolean;
    maxTenants: number;
    expiryDate: string | null;
}


export default function CustomerPage() {
    const { accounts, instance } = useMsal();
    const { setSelectedTenant, selectedTenant } = useTenant();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [scrollPosition, setScrollPosition] = useState(0);

    const router = useRouter();
    const { customerData, customerLoading: loading, customerError: error, refetchCustomerData } = useCustomer();

    const [updatingTenants, setUpdatingTenants] = useState<Set<string>>(new Set());
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [showClickOverlay, setShowClickOverlay] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
    const { isActiveCustomer, customerLoading } = useCustomer();

    const currentTenantId = accounts[0]?.tenantId;

    useEffect(() => {
        const handleScroll = () => {
            const position = window.pageYOffset || document.documentElement.scrollTop;
            setScrollPosition(position);
            sessionStorage.setItem('customerPageScrollPosition', position.toString());
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            // Save final position when component unmounts
            sessionStorage.setItem('customerPageScrollPosition', scrollPosition.toString());
        };
    }, [scrollPosition]);

    useEffect(() => {
        if (!loading && customerData) {
            const savedPosition = sessionStorage.getItem('customerPageScrollPosition');
            if (savedPosition) {
                // Use setTimeout to ensure DOM is fully rendered
                setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedPosition),
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }, [loading, customerData]);
    useEffect(() => {
        return () => {
            sessionStorage.removeItem('customerPageScrollPosition');
        };
    }, []);

    const updateTenantStatus = async (tenantId: string, settings: {
        isActive: boolean;
        isPrimary: boolean;
        isTrial: boolean;
        licenseType: number;
    }) => {
        try {
            // Save current scroll position before update
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            sessionStorage.setItem('customerPageScrollPosition', currentScroll.toString());

            setUpdatingTenants(prev => new Set(prev).add(tenantId));
            setUpdateError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: settings.isActive,
                    isPrimary: settings.isPrimary,
                    isTrial: settings.isTrial,
                    licenseType: settings.licenseType
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to update tenant status: ${apiResponse.statusText}`);
            }

            await refetchCustomerData();

            // Restore scroll position after data refresh
            setTimeout(() => {
                const savedPosition = sessionStorage.getItem('customerPageScrollPosition');
                if (savedPosition) {
                    window.scrollTo({
                        top: parseInt(savedPosition),
                        behavior: 'smooth'
                    });
                }
            }, 100);

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

    const [licenseManagement, setLicenseManagement] = useState<{
        isOpen: boolean;
        tenant: Tenant | null;
    } | null>(null);

    const [updatingLicense, setUpdatingLicense] = useState<Set<string>>(new Set());
    const [licenseError, setLicenseError] = useState<string | null>(null);

    const updateTenantLicense = async (tenantId: string, licenseId: string, licenseData: {
        isActive: boolean;
        isPrimary: boolean;
        isTrial: boolean;
        licenseType: number;
    }) => {
        try {
            setUpdatingLicense(prev => new Set(prev).add(`${tenantId}-${licenseId}`));
            setLicenseError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}/license/${licenseId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    IsActive: licenseData.isActive,
                    IsPrimary: licenseData.isPrimary,
                    IsTrial: licenseData.isTrial,
                    LicenseType: licenseData.licenseType
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to update license: ${apiResponse.statusText}`);
            }

            // Parse the API response to get updated license data
            const responseData = await apiResponse.json();
            console.log('License update response:', responseData);

            // Force a complete data refresh
            await refetchCustomerData();

            // Update the local license management state with fresh data
            if (licenseManagement?.tenant) {
                // Find the updated tenant in the fresh data
                const updatedCustomerData = await refetchCustomerData();
                // This will automatically update the UI with the fresh data
            }

        } catch (err) {
            console.error('Failed to update tenant license:', err);
            setLicenseError(err instanceof Error ? err.message : 'Failed to update license');
        } finally {
            setUpdatingLicense(prev => {
                const newSet = new Set(prev);
                newSet.delete(`${tenantId}-${licenseId}`);
                return newSet;
            });
        }
    };

    useEffect(() => {
        if (licenseManagement && customerData) {
            const updatedTenant = customerData.tenants.find(
                (t: Tenant) => t.tenantId === licenseManagement.tenant?.tenantId
            );

            if (updatedTenant && JSON.stringify(updatedTenant) !== JSON.stringify(licenseManagement.tenant)) {
                setLicenseManagement({
                    ...licenseManagement,
                    tenant: updatedTenant
                });
            }
        }
    }, [customerData, licenseManagement?.tenant?.tenantId]); // Stable dependency



    const getLicenseTypeName = (licenseType: number): string => {
        switch (licenseType) {
            case 0:
                return 'Assistant';
            case 1:
                return 'Assignments Manager';
            case 2:
                return 'Historicus';
            default:
                return 'Unknown';
        }
    };

    const getLicenseTypeVariant = (licenseType: number): "default" | "secondary" | "destructive" | "outline" => {
        switch (licenseType) {
            case 0:
                return 'outline';
            case 1:
                return 'secondary';
            case 2:
                return 'default';
            default:
                return 'destructive';
        }
    };

    // Add this state for the add license dialog
    const [addLicenseDialog, setAddLicenseDialog] = useState<{
        isOpen: boolean;
        tenantId: string;
        tenantName: string;
    } | null>(null);

    const [newLicenseData, setNewLicenseData] = useState({
        licenseType: 0,
        isEnabled: true,
        isTrial: false
    });


    const columns = [
        {
            key: "displayName",
            label: "Display Name",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                return (
                    <div className="flex items-center gap-2 text-sm font-medium truncate w-full text-left">
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
            key: "isActive",
            label: "Status",
            render: (value: unknown) => {
                const isActive = value as boolean;
                return (
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        },
        {
            key: "isPrimary",
            label: "Type",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                return (
                    <div className="flex gap-1">
                        {tenant.isPrimary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                        {tenant.isTrial && (
                            <Badge variant="outline" className="text-xs">Trial</Badge>
                        )}
                        {!tenant.isPrimary && !tenant.isTrial && (
                            <Badge variant="secondary" className="text-xs">Standard</Badge>
                        )}
                    </div>
                );
            },
        },
        {
            key: "isGdap",
            label: "GDAP",
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
        // Only include license type column if customer is active
        ...(isActiveCustomer ? [{
            key: "licenseType",
            label: "License Status",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                const licenseType = value as number;

                // Check if any license needs consent
                const hasLicenseNeedingConsent = tenant.licenses?.some(
                    license => !license.isConsentGranted && license.consentUrl
                );

                return (
                    <div className="flex items-center gap-2">
                        {hasLicenseNeedingConsent ? (
                            <div
                                className="relative cursor-help transition-colors duration-200"
                                title="One or more licenses require consent, use action button to manage licenses"
                            >
                                <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 group-hover:text-orange-600" />
                            </div>
                        ) : (
                            <div
                                className="relative cursor-help transition-colors duration-200"
                                title="All licenses are properly configured"
                            >
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 group-hover:text-green-600" />
                            </div>
                        )}
                    </div>
                );
            },
        }] : []),

        {
            key: "actions",
            label: "Actions",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                const isUpdating = updatingTenants.has(tenant.tenantId);

                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditTenant({
                                    isOpen: true,
                                    tenant: tenant
                                });
                            }}
                            disabled={isUpdating}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                    </div>
                );
            },
        },
    ];

// Add this helper function to calculate max tenants from all active licenses
    const getMaxAllowedTenants = (): number => {
        if (!customerData?.licenses || customerData.licenses.length === 0) {
            return 0;
        }

        return customerData.licenses
            .filter(license => license.isActive)
            .reduce((total, license) => total + license.maxTenants, 0);
    };

// Add this helper to check if tenant limit is reached
    const isTenantLimitReached = (): boolean => {
        const maxTenants = getMaxAllowedTenants();
        const currentTenantCount = customerData?.tenants?.length || 0;
        return maxTenants > 0 && currentTenantCount >= maxTenants;
    };

    const [deletingTenants, setDeletingTenants] = useState<Set<string>>(new Set());
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const deleteTenant = async (tenantId: string) => {
        try {
            // Save current scroll position before delete
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            sessionStorage.setItem('customerPageScrollPosition', currentScroll.toString());

            setDeletingTenants(prev => new Set(prev).add(tenantId));
            setDeleteError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                },
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to delete tenant: ${apiResponse.statusText}`);
            }

            // Refresh customer data after successful deletion
            await refetchCustomerData();

            // Restore scroll position after data refresh
            setTimeout(() => {
                const savedPosition = sessionStorage.getItem('customerPageScrollPosition');
                if (savedPosition) {
                    window.scrollTo({
                        top: parseInt(savedPosition),
                        behavior: 'smooth'
                    });
                }
            }, 100);

        } catch (err) {
            console.error('Failed to delete tenant:', err);
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete tenant');
        } finally {
            setDeletingTenants(prev => {
                const newSet = new Set(prev);
                newSet.delete(tenantId);
                return newSet;
            });
        }
    };
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        tenantId: string;
        tenantName: string;
    } | null>(null);

    const [editTenant, setEditTenant] = useState<{
        isOpen: boolean;
        tenant: Tenant | null;
    } | null>(null);

    const [editingTenant, setEditingTenant] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const updateTenantSettings = async (tenantId: string, settings: {
        displayName: string;
        isActive: boolean;
        isPrimary: boolean;
        isTrial: boolean;
        licenseType: number;
    }) => {
        try {
            setEditingTenant(true);
            setEditError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}/settings`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    displayName: settings.displayName,
                    isActive: settings.isActive,
                    isPrimary: settings.isPrimary,
                    isTrial: settings.isTrial,
                    licenseType: settings.licenseType
                }),
            });


            if (!apiResponse.ok) {
                throw new Error(`Failed to update tenant settings: ${apiResponse.statusText}`);
            }

            await refetchCustomerData();
            setEditTenant(null);

        } catch (err) {
            console.error('Failed to update tenant settings:', err);
            setEditError(err instanceof Error ? err.message : 'Failed to update tenant settings');
        } finally {
            setEditingTenant(false);
        }
    };

    const deleteTenantLicense = async (tenantId: string, licenseId: string) => {
        try {
            setUpdatingLicense(prev => new Set(prev).add(`${tenantId}-${licenseId}`));
            setLicenseError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}/license/${licenseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                },
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to delete license: ${apiResponse.statusText}`);
            }

            await refetchCustomerData();

        } catch (err) {
            console.error('Failed to delete tenant license:', err);
            setLicenseError(err instanceof Error ? err.message : 'Failed to delete license');
        } finally {
            setUpdatingLicense(prev => {
                const newSet = new Set(prev);
                newSet.delete(`${tenantId}-${licenseId}`);
                return newSet;
            });
        }
    };


    const assignNewLicense = async (tenantId: string, licenseType: number, licenseData: {
        isActive: boolean;
        isPrimary: boolean;
        isTrial: boolean;
        licenseType: number;
    }) => {
        try {
            setUpdatingLicense(prev => new Set(prev).add(`${tenantId}-assign-${licenseType}`));
            setLicenseError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}/license`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: licenseData.isActive,
                    IsPrimary: licenseData.isPrimary,
                    IsTrial: licenseData.isTrial,
                    LicenseType: licenseData.licenseType
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to assign license: ${apiResponse.statusText}`);
            }

            await refetchCustomerData();
            setLicenseManagement(null);

        } catch (err) {
            console.error('Failed to assign license:', err);
            setLicenseError(err instanceof Error ? err.message : 'Failed to assign license');
        } finally {
            setUpdatingLicense(prev => {
                const newSet = new Set(prev);
                newSet.delete(`${tenantId}-assign-${licenseType}`);
                return newSet;
            });
        }
    };


    const getCustomerLicenseTypeName = (licenseType: number): string => {
        switch (licenseType) {
            case 0:
                return 'Community';
            case 1:
                return 'Standard';
            case 2:
                return 'Enterprise';
            default:
                return 'Unknown';
        }
    };

    const getCustomerLicenseVariant = (licenseType: number): "default" | "secondary" | "destructive" | "outline" => {
        switch (licenseType) {
            case 0:
                return 'outline';
            case 1:
                return 'secondary';
            case 2:
                return 'default';
            default:
                return 'destructive';
        }
    };
    const createNewLicense = async (tenantId: string, licenseData: {
        isEnabled: boolean;
        LicenseType: number;
    }) => {
        try {
            setUpdatingLicense(prev => new Set(prev).add(`${tenantId}-new`));
            setLicenseError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${tenantId}/license`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isEnabled: licenseData.isEnabled,
                    LicenseType: licenseData.LicenseType
                }),
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to create license: ${apiResponse.statusText}`);
            }

            const responseData = await apiResponse.json();
            console.log('License creation response:', responseData);

            // Show success message with consent link if needed
            if (responseData.data?.consentUrl && !responseData.data?.isConsentGranted) {
                // You could show a toast notification here
                console.log('Consent required for new license:', responseData.data.consentUrl);
            }

            await refetchCustomerData();
            setAddLicenseDialog(null);

        } catch (err) {
            console.error('Failed to create license:', err);
            setLicenseError(err instanceof Error ? err.message : 'Failed to create license');
        } finally {
            setUpdatingLicense(prev => {
                const newSet = new Set(prev);
                newSet.delete(`${tenantId}-new`);
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
            {/* Show delete error if any */}
            {deleteError && (
                <Card className="border-red-200 mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{deleteError}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col xl:flex-row gap-6 mb-6">
                {/* Customer Basic Information */}
                <div className="xl:w-1/2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Customer Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information */}
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
                                            <Badge variant={customerData.isActive ? "default" : "outline"}>
                                                {customerData.isActive ? 'Active' : 'Community'}
                                            </Badge>
                                            <Badge variant={customerData.isGdap ? "default" : "secondary"}>
                                                {customerData.isGdap ? 'GDAP' : 'No GDAP'}
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
                </div>

                {/* Right side - License Info and Summary */}
                <div className="xl:w-1/2 flex flex-col gap-6">
                    {/* License Information */}
                    {customerData.licenses && customerData.licenses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    License Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Tenant Limit Warning */}
                                {isTenantLimitReached() && (
                                    <div className="mb-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 rounded-lg">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                Maximum tenant limit reached ({customerData.tenants.length}/{getMaxAllowedTenants()} tenants)
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                                            Contact support to increase your tenant limit or upgrade your license.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {customerData.licenses.map((license, index) => (
                                        <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border">
                                            <div className="flex items-center justify-between mb-3">
                                                <Badge variant={getCustomerLicenseVariant(license.licenseType)} className="text-xs">
                                                    {getCustomerLicenseTypeName(license.licenseType)}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant={license.isActive ? "default" : "secondary"} className="text-xs">
                                                        {license.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    {license.isTrial && (
                                                        <Badge variant="outline" className="text-xs">Trial</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500 dark:text-gray-400">Max Tenants:</span>
                                                    <span className="font-medium">{license.maxTenants}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                                                    <span className="font-medium">
                                                        {license.expiryDate
                                                            ? new Date(license.expiryDate).toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                        {customerData.tenants.filter((t: Tenant) => t.isActive).length}
                                    </div>
                                    <div className="text-sm font-medium text-green-800 dark:text-green-200">Enabled Tenants</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tenants Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Tenant Management
                    </CardTitle>
                    {customerData.isMsp && customerData.isActive && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setShowOnboardingModal(true)}
                                disabled={isTenantLimitReached()}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Tenant
                            </Button>
                            {isTenantLimitReached() && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                ({customerData.tenants.length}/{getMaxAllowedTenants()} tenants)
            </span>
                            )}
                        </div>
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
            {/* Delete Confirmation Dialog */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                Confirm Delete
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Are you sure you want to delete <span className="font-semibold">&quot;{deleteConfirmation.tenantName}&quot;</span>?
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                This action cannot be undone and will permanently remove the tenant from the system.
                            </p>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteConfirmation(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (deleteConfirmation) {
                                            deleteTenant(deleteConfirmation.tenantId);
                                            setDeleteConfirmation(null);
                                        }
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Delete Tenant
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Tenant Edit Dialog */}
            {editTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Tenant Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editError && (
                                <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{editError}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const settings = {
                                    displayName: formData.get('displayName') as string,
                                    isActive: editTenant.tenant!.isActive,
                                    isPrimary: editTenant.tenant!.isPrimary,
                                    isTrial: editTenant.tenant!.isTrial,
                                    licenseType: parseInt(formData.get('licenseType') as string)
                                };
                                updateTenantSettings(editTenant.tenant!.tenantId, settings);
                            }} className="space-y-4">

                                {/* Display Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Display Name</label>
                                    <input
                                        name="displayName"
                                        type="text"
                                        defaultValue={editTenant.tenant?.displayName}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                                        required
                                    />
                                </div>

                                {/* Tenant Information */}
                                <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="text-sm font-medium mb-3">Tenant Information</div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Tenant ID:</span>
                                            <code className="text-sm text-gray-800 dark:text-gray-200">{editTenant.tenant?.tenantId}</code>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Domain:</span>
                                            <code className="text-sm text-gray-800 dark:text-gray-200">{editTenant.tenant?.domainName}</code>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Status:</span>
                                            <Badge variant={editTenant.tenant?.isActive ? "default" : "secondary"}>
                                                {editTenant.tenant?.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">Type:</span>
                                            <div className="flex gap-1">
                                                {editTenant.tenant?.isPrimary && (
                                                    <Badge variant="default" className="text-xs">Primary</Badge>
                                                )}
                                                {editTenant.tenant?.isTrial && (
                                                    <Badge variant="outline" className="text-xs">Trial</Badge>
                                                )}
                                                {!editTenant.tenant?.isPrimary && !editTenant.tenant?.isTrial && (
                                                    <Badge variant="secondary" className="text-xs">Standard</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">GDAP:</span>
                                            <Badge variant={editTenant.tenant?.isGdap ? "default" : "outline"} className="text-xs">
                                                {editTenant.tenant?.isGdap ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-4 border-t">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setLicenseManagement({
                                                    isOpen: true,
                                                    tenant: editTenant.tenant
                                                });
                                                setEditTenant(null);
                                            }}
                                            disabled={editingTenant}
                                            className="flex items-center gap-2"
                                        >
                                            <Shield className="h-4 w-4" />
                                            Manage Licenses
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => {
                                                setDeleteConfirmation({
                                                    isOpen: true,
                                                    tenantId: editTenant.tenant!.tenantId,
                                                    tenantName: editTenant.tenant!.displayName
                                                });
                                                setEditTenant(null);
                                            }}
                                            disabled={editingTenant}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Tenant
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditTenant(null);
                                                setEditError(null);
                                            }}
                                            disabled={editingTenant}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={editingTenant}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {editingTenant ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* License Management Dialog */}
            {licenseManagement && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                License Management - {licenseManagement.tenant?.displayName}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Manage individual licenses for this tenant. Each license can be configured independently.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {licenseError && (
                                <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{licenseError}</span>
                                    </div>
                                </div>
                            )}

                            {/* Tenant Info Summary */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium">Tenant Information</h3>
                                    <Badge variant={licenseManagement.tenant?.isActive ? "default" : "secondary"}>
                                        {licenseManagement.tenant?.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Tenant ID:</span>
                                        <code className="ml-2 text-gray-800 dark:text-gray-200">{licenseManagement.tenant?.tenantId}</code>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Domain:</span>
                                        <code className="ml-2 text-gray-800 dark:text-gray-200">{licenseManagement.tenant?.domainName}</code>
                                    </div>
                                </div>
                            </div>

                            {/* License Management Table */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Current Licenses</h3>
                                    <Button
                                        onClick={() => {
                                            setAddLicenseDialog({
                                                isOpen: true,
                                                tenantId: licenseManagement.tenant!.tenantId,
                                                tenantName: licenseManagement.tenant!.displayName
                                            });
                                            setNewLicenseData({
                                                licenseType: 0,
                                                isEnabled: true,
                                                isTrial: false
                                            });
                                        }}
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add License
                                    </Button>
                                </div>

                                {/* License Table */}
                                {licenseManagement.tenant?.licenses && licenseManagement.tenant.licenses.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr className="border-b">
                                                <th className="text-left p-3 text-sm font-medium">License Type</th>
                                                <th className="text-left p-3 text-sm font-medium">Status</th>
                                                <th className="text-left p-3 text-sm font-medium">Active</th>
                                                <th className="text-left p-3 text-sm font-medium">Trial</th>
                                                <th className="text-left p-3 text-sm font-medium">Created</th>
                                                <th className="text-left p-3 text-sm font-medium">Expires</th>
                                                <th className="text-left p-3 text-sm font-medium">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {licenseManagement.tenant.licenses.map((license, index) => {
                                                const licenseKey = `${licenseManagement.tenant?.tenantId}-${license.id}`;
                                                const isUpdating = updatingLicense.has(licenseKey);

                                                return (
                                                    <tr key={license.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="p-3">
                                                            <Badge variant={getLicenseTypeVariant(license.licenseType)}>
                                                                {getLicenseTypeName(license.licenseType)}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    {license.isConsentGranted ? (
                                                                        <>
                                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                                            <span className="text-sm text-green-700 dark:text-green-400">
                        Consented & {license.isOnboarded ? 'Onboarded' : 'Pending Onboarding'}
                    </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <AlertCircle className="h-4 w-4 text-orange-500" />
                                                                            <span className="text-sm text-orange-700 dark:text-orange-400">
                        Consent Required
                    </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {/* Show consent link if consent is required */}
                                                                {!license.isConsentGranted && license.consentUrl && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => window.open(license.consentUrl!, '_blank')}
                                                                        className="text-xs h-7 px-2 py-1 text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                                                                    >
                                                                        Grant Consent
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="p-3">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={license.isActive}
                                                                    onChange={(e) => {
                                                                        updateTenantLicense(licenseManagement.tenant!.tenantId, license.id, {
                                                                            isActive: e.target.checked,
                                                                            isPrimary: false,
                                                                            isTrial: license.isTrial,
                                                                            licenseType: license.licenseType
                                                                        });
                                                                    }}
                                                                    disabled={isUpdating}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                                            </label>
                                                        </td>
                                                        <td className="p-3">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={license.isTrial}
                                                                    onChange={(e) => {
                                                                        updateTenantLicense(licenseManagement.tenant!.tenantId, license.id, {
                                                                            isActive: license.isActive,
                                                                            isPrimary: false,
                                                                            isTrial: e.target.checked,
                                                                            licenseType: license.licenseType
                                                                        });
                                                                    }}
                                                                    disabled={isUpdating}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                                            </label>
                                                        </td>
                                                        <td className="p-3 text-sm text-gray-600">
                                                            {new Date(license.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-3 text-sm text-gray-600">
                                                            {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Never'}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2">
                                                                {isUpdating && (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        deleteTenantLicense(licenseManagement.tenant!.tenantId, license.id);
                                                                    }}
                                                                    disabled={isUpdating}
                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-900">
                                        <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="font-medium">No licenses assigned</p>
                                        <p className="text-sm">Click &quote;Add License&quote; to assign a license to this tenant</p>
                                    </div>
                                )}

                            </div>

                            {/* Available License Types for Adding */}
                            {customerData?.licenses && customerData.licenses.length > 0 && (
                                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Available Customer License Types</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {customerData.licenses.map((customerLicense, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <Badge variant={getCustomerLicenseVariant(customerLicense.licenseType)}>
                                                    {getCustomerLicenseTypeName(customerLicense.licenseType)}
                                                </Badge>
                                                <span className="text-blue-700 dark:text-blue-300">
                                        (Max: {customerLicense.maxTenants} tenants)
                                    </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setLicenseManagement(null);
                                        setLicenseError(null);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Add License Dialog */}
            {addLicenseDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Add New License
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Add a new license to {addLicenseDialog.tenantName}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {licenseError && (
                                <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{licenseError}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                await createNewLicense(addLicenseDialog.tenantId, {
                                    isEnabled: newLicenseData.isEnabled,
                                    LicenseType: newLicenseData.licenseType
                                });
                            }} className="space-y-4">
                                {/* License Type Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">License Type</label>
                                    <select
                                        value={newLicenseData.licenseType}
                                        onChange={(e) => setNewLicenseData(prev => ({
                                            ...prev,
                                            licenseType: parseInt(e.target.value)
                                        }))}
                                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                                    >
                                        <option value={0}>Assistant</option>
                                        <option value={1}>Assignments Manager</option>
                                        <option value={2}>Historicus</option>
                                    </select>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Active</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newLicenseData.isEnabled}
                                            onChange={(e) => setNewLicenseData(prev => ({
                                                ...prev,
                                                isEnabled: e.target.checked
                                            }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                    </label>
                                </div>

                                {/* Trial Toggle */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Trial</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newLicenseData.isTrial}
                                            onChange={(e) => setNewLicenseData(prev => ({
                                                ...prev,
                                                isTrial: e.target.checked
                                            }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setAddLicenseDialog(null);
                                            setLicenseError(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={updatingLicense.has(`${addLicenseDialog.tenantId}-new`)}
                                        className="flex items-center gap-2"
                                    >
                                        {updatingLicense.has(`${addLicenseDialog.tenantId}-new`) && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        Create License
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

        </div>
    );

}