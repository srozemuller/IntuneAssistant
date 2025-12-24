'use client';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    Trash2,
    ExternalLink,
    Lock, Grid2X2Check
} from 'lucide-react';
import {CONSENT_CALLBACK, CUSTOMER_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
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

    // Add these state variables at the top of your component
    const [consentWindow, setConsentWindow] = useState<Window | null>(null);
    const [consentLoading, setConsentLoading] = useState<Set<string>>(new Set());
    const [consentError, setConsentError] = useState<string | null>(null);

    // Add useEffect for handling consent messages
    useEffect(() => {
        const handleConsentMessage = (event: MessageEvent) => {
            console.log('Received consent message from origin:', event.origin);
            console.log('Current window origin:', window.location.origin);

            if (event.data?.type === 'CONSENT_SUCCESS' || event.data?.type === 'CONSENT_ERROR') {
                console.log('Processing consent message:', event.data);

                if (event.data.type === 'CONSENT_SUCCESS') {
                    setConsentLoading(new Set());
                    if (consentWindow) {
                        setConsentWindow(null);
                    }
                    handleConsentCallback(event.data.state);
                } else if (event.data.type === 'CONSENT_ERROR') {
                    setConsentError(`Consent failed: ${event.data.errorDescription || event.data.error || 'Unknown error'}`);
                    setConsentLoading(new Set());
                    if (consentWindow) {
                        setConsentWindow(null);
                    }
                }
            }
        };

        window.addEventListener('message', handleConsentMessage);
        return () => window.removeEventListener('message', handleConsentMessage);
    }, [consentWindow]);

    // Add consent callback handler
    const handleConsentCallback = async (state?: string) => {
        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const callbackResponse = await fetch(
                `${CONSENT_CALLBACK}${state ? `?state=${state}` : ''}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${response.accessToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!callbackResponse.ok) {
                const errorData = await callbackResponse.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to complete consent: ${callbackResponse.statusText}`);
            }

            // Refresh customer data to reflect consent status
            await refetchCustomerData();
            setConsentError(null);

        } catch (err) {
            console.error('Consent callback error:', err);
            setConsentError(err instanceof Error ? err.message : 'Failed to complete consent');
        }
    };

    // Add function to open consent popup
    const openConsentPopup = (consentUrl: string, licenseId: string) => {
        setConsentLoading(prev => new Set(prev).add(licenseId));
        setConsentError(null);

        const popup = window.open(
            consentUrl,
            'consent',
            'width=600,height=700,scrollbars=yes,resizable=yes,location=yes,toolbar=yes'
        );

        if (popup) {
            setConsentWindow(popup);
            popup.focus();
        } else {
            setConsentError('Failed to open consent window. Please allow popups and try again.');
            setConsentLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(licenseId);
                return newSet;
            });
        }
    };


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
        if (editTenant && customerData && editTenant.tenant) {
            const updatedTenant = customerData.tenants.find(
                (t: Tenant) => t.tenantId === editTenant.tenant!.tenantId
            );

            if (updatedTenant) {
                setEditTenant({
                    ...editTenant,
                    tenant: updatedTenant
                });
            }
        }
    }, [customerData]);


    const getLicenseTypeName = (licenseType: number): string => {
        switch (licenseType) {
            case 0:
                return 'Assistant';
            case 1:
                return 'Assignments Manager';
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


    const hasOnlyCommunityLicense = (): boolean => {
        if (!customerData?.licenses || customerData.licenses.length === 0) {
            return true; // No licenses means community only
        }

        return customerData.licenses.every(license => license.licenseType === 0);
    };


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
            key: "domainName",
            label: "Domain",
            render: (value: unknown) => (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-medium">
                    {value as string}
                </code>
            ),
        },
        // Show consent status for community licenses
        ...(hasOnlyCommunityLicense() ? [{
            key: "consentStatus",
            label: "Consent Status",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                const communityLicense = tenant.licenses?.find(license => license.licenseType === 0);

                if (!communityLicense) {
                    return <Badge variant="destructive">No License</Badge>;
                }

                if (!communityLicense.isConsentGranted) {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Consent Required
                            </Badge>
                            {communityLicense.consentUrl && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        if (communityLicense.consentUrl) {
                                            openConsentPopup(communityLicense.consentUrl, communityLicense.id);
                                        }
                                    }}
                                    disabled={consentLoading.has(communityLicense.id)}
                                    className="h-6 px-2 text-xs"
                                >
                                    {consentLoading.has(communityLicense.id) ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Grant Consent'
                                    )}
                                </Button>

                            )}
                        </div>
                    );
                }

                if (!communityLicense.isOnboarded) {
                    return (
                        <Badge variant="outline">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Onboarding Required
                        </Badge>
                    );
                }

                return (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                    </Badge>
                );
            },
        }] : []),
        // Type and GDAP columns for non-community licenses
        ...(!hasOnlyCommunityLicense() ? [{
            key: "isPrimary",
            label: "Type",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                return (
                    <div className="flex gap-1">
                        {tenant.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                        {tenant.isTrial && <Badge variant="outline" className="text-xs">Trial</Badge>}
                        {!tenant.isPrimary && !tenant.isTrial && <Badge variant="secondary" className="text-xs">Standard</Badge>}
                    </div>
                );
            },
        }] : []),
        ...(!hasOnlyCommunityLicense() ? [{
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
        }] : []),
        // License Status for non-community licenses
        ...(isActiveCustomer && !hasOnlyCommunityLicense() ? [{
            key: "licenseType",
            label: "License Status",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                const licenseCount = tenant.licenses?.length || 0;
                const hasLicenseNeedingConsent = tenant.licenses?.some(
                    license => !license.isConsentGranted && license.consentUrl
                );

                return (
                    <div className="flex items-center gap-2">
                        {hasLicenseNeedingConsent ? (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                        license count: {licenseCount}
                    </span>
                    </div>
                );
            },
        }] : []),
        ...(isActiveCustomer && !hasOnlyCommunityLicense() ? [{
            key: "actions",
            label: "Actions",
            render: (value: unknown, row: Record<string, unknown>) => {
                const tenant = row as unknown as Tenant;
                const isUpdating = updatingTenants.has(tenant.tenantId);

                return (
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
                );
            },
        }] : []),
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

    // Add new state for license onboarding wizard
    const [licenseOnboardingWizard, setLicenseOnboardingWizard] = useState<{
        isOpen: boolean;
        tenantId: string;
        tenantName: string;
        licenseType: number;
        currentStep: number;
        consentWindow: Window | null;
        consentCompleted: boolean;
        loading: boolean;
        error: string | null;
        consentState?: string | null;
    } | null>(null);

// Replace the existing add license dialog with this new wizard
    const openLicenseOnboardingWizard = (tenantId: string, tenantName: string) => {
        setLicenseOnboardingWizard({
            isOpen: true,
            tenantId,
            tenantName,
            licenseType: 0,
            currentStep: 0, // 0: Select license, 1: Consent, 2: Complete
            consentWindow: null,
            consentCompleted: false,
            loading: false,
            error: null
        });
    };

// Handle consent window messages for license wizard
    useEffect(() => {
        const handleLicenseConsentMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || !licenseOnboardingWizard?.consentWindow) {
                return;
            }

            if (event.data.type === 'CONSENT_SUCCESS') {
                console.log('License consent success received');
                setLicenseOnboardingWizard(prev => prev ? {
                    ...prev,
                    consentCompleted: true,
                    loading: false
                } : null);

                if (licenseOnboardingWizard.consentWindow) {
                    licenseOnboardingWizard.consentWindow.close();
                    setLicenseOnboardingWizard(prev => prev ? {
                        ...prev,
                        consentWindow: null
                    } : null);
                }

                // Complete the license creation process
                completeLicenseCreation();

            } else if (event.data.type === 'CONSENT_ERROR') {
                console.log('License consent error received:', event.data);
                setLicenseOnboardingWizard(prev => prev ? {
                    ...prev,
                    error: `Consent failed: ${event.data.errorDescription || event.data.error || 'Unknown error'}`,
                    loading: false
                } : null);

                if (licenseOnboardingWizard.consentWindow) {
                    licenseOnboardingWizard.consentWindow.close();
                    setLicenseOnboardingWizard(prev => prev ? {
                        ...prev,
                        consentWindow: null
                    } : null);
                }
            }
        };

        window.addEventListener('message', handleLicenseConsentMessage);
        return () => window.removeEventListener('message', handleLicenseConsentMessage);
    }, [licenseOnboardingWizard]);

    const extractStateFromConsentUrl = (url: string): string | null => {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('state');
        } catch (error) {
            console.error('Failed to parse consent URL:', error);
            return null;
        }
    };
    const initiateLicenseConsent = async () => {
        if (!licenseOnboardingWizard) return;

        try {
            setLicenseOnboardingWizard(prev => prev ? {
                ...prev,
                loading: true,
                error: null
            } : null);

            const tokenResponse = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // First create the license
            const createLicenseResponse = await fetch(`${CUSTOMER_ENDPOINT}/tenants/${licenseOnboardingWizard.tenantId}/license`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isEnabled: true,
                    LicenseType: licenseOnboardingWizard.licenseType
                }),
            });

            if (!createLicenseResponse.ok) {
                const errorData = await createLicenseResponse.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to create license: ${createLicenseResponse.statusText}`);
            }

            const licenseResult = await createLicenseResponse.json();

            // Get consent URL from the license creation response
            const consentUrl = licenseResult.data?.consentUrl || licenseResult.consentUrl;

            if (!consentUrl) {
                throw new Error('No consent URL received from license creation');
            }

            const extractedState = extractStateFromConsentUrl(consentUrl);
            setLicenseOnboardingWizard(prev => prev ? {
                ...prev,
                consentState: extractedState
            } : null);


            // Open consent window with the URL from license creation
            const popup = window.open(
                consentUrl,
                'licenseConsentWindow',
                'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
            );

            if (popup) {
                setLicenseOnboardingWizard(prev => prev ? {
                    ...prev,
                    consentWindow: popup,
                    currentStep: 1
                } : null);
                popup.focus();
            } else {
                throw new Error('Failed to open consent window. Please check your popup blocker settings.');
            }

        } catch (err) {
            console.error('Error initiating license consent:', err);
            setLicenseOnboardingWizard(prev => prev ? {
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to initiate consent',
                loading: false
            } : null);
        }
    };


// Complete license creation after consent
    const completeLicenseCreation = async () => {
        if (!licenseOnboardingWizard) return;

        try {
            setLicenseOnboardingWizard(prev => prev ? {
                ...prev,
                loading: true,
                error: null
            } : null);

            const tokenResponse = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Use the consent state in the callback URL

            const response = await fetch(`${CONSENT_CALLBACK}?state=${licenseOnboardingWizard.consentState}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.accessToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to complete consent callback: ${response.statusText}`);
            }

            await refetchCustomerData();

            setLicenseOnboardingWizard(prev => prev ? {
                ...prev,
                currentStep: 2,
                loading: false
            } : null);

        } catch (err) {
            console.error('Failed to complete license creation:', err);
            setLicenseOnboardingWizard(prev => prev ? {
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to complete license creation',
                loading: false
            } : null);
        }
    };


// Wizard navigation
    const handleLicenseWizardNext = () => {
        if (!licenseOnboardingWizard) return;

        if (licenseOnboardingWizard.currentStep === 0) {
            // Start consent process
            initiateLicenseConsent();
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

            {consentError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
                    <AlertCircle className="h-4 w-4" />
                    {consentError}
                </div>
            )}


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
                    {customerData.licenses && customerData.licenses.length > 0 && !hasOnlyCommunityLicense() && (
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
                        showPagination={true}
                    />

                </CardContent>
            </Card>

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

            {editTenant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Tenant Management - {editTenant.tenant?.displayName}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Manage tenant settings, licenses, and permissions in one place.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(editError || licenseError) && (
                                <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{editError || licenseError}</span>
                                    </div>
                                </div>
                            )}

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Tenant Settings */}
                                <div className="space-y-6">
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="font-medium mb-4 flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Tenant Settings
                                        </h3>

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

                                            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <div className="text-sm font-medium mb-3">Tenant Information</div>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Tenant ID:</span>
                                                        <code className="text-gray-800 dark:text-gray-200">{editTenant.tenant?.tenantId}</code>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Domain:</span>
                                                        <code className="text-gray-800 dark:text-gray-200">{editTenant.tenant?.domainName}</code>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Status:</span>
                                                        <Badge variant={editTenant.tenant?.isActive ? "default" : "secondary"}>
                                                            {editTenant.tenant?.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">GDAP:</span>
                                                        <Badge variant={editTenant.tenant?.isGdap ? "default" : "outline"}>
                                                            {editTenant.tenant?.isGdap ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={editingTenant}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                {editingTenant ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    'Save Settings'
                                                )}
                                            </Button>
                                        </form>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="font-medium mb-4 flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Quick Actions
                                        </h3>
                                        <div className="space-y-2">
                                            <Button
                                                variant={selectedTenant?.tenantId === editTenant.tenant?.tenantId ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    if (editTenant.tenant) {
                                                        handleTenantSelect(editTenant.tenant);
                                                    }
                                                }}
                                                className={`w-full justify-start ${
                                                    selectedTenant?.tenantId === editTenant.tenant?.tenantId
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : ""
                                                }`}
                                            >
                                                {selectedTenant?.tenantId === editTenant.tenant?.tenantId ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Active Context
                                                    </>
                                                ) : (
                                                    <>
                                                        <Grid2X2Check className="h-4 w-4 mr-2" />
                                                        Set as Context
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => openLicenseOnboardingWizard(editTenant.tenant!.tenantId, editTenant.tenant!.displayName)}

                                                className="w-full justify-start"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add New License
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
                                                className="w-full justify-start"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Tenant
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - License Management */}
                                <div className="space-y-6">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                License Management
                                            </h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {editTenant.tenant?.licenses?.length || 0} licenses
                                            </span>
                                        </div>

                                        {editTenant.tenant?.licenses && editTenant.tenant.licenses.length > 0 ? (
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                                {editTenant.tenant.licenses.map((license) => {
                                                    const licenseKey = `${editTenant.tenant?.tenantId}-${license.id}`;
                                                    const isUpdating = updatingLicense.has(licenseKey);

                                                    return (
                                                        <div key={license.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <Badge variant={getLicenseTypeVariant(license.licenseType)}>
                                                                    {getLicenseTypeName(license.licenseType)}
                                                                </Badge>
                                                                <div className="flex items-center gap-2">
                                                                    {isUpdating && (
                                                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                                                    )}
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => deleteTenantLicense(editTenant.tenant!.tenantId, license.id)}
                                                                        disabled={isUpdating}
                                                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* License Status */}
                                                            <div className="flex items-center gap-2 mb-3">
                                                                {license.isConsentGranted ? (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                        <span className="text-xs text-green-700 dark:text-green-400">
                                                                            Consented & {license.isOnboarded ? 'Onboarded' : 'Pending'}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                                                        <span className="text-xs text-orange-700 dark:text-orange-400">
                                                                            Consent Required
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Consent Button */}
                                                            {!license.isConsentGranted && license.consentUrl && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(license.consentUrl!, '_blank')}
                                                                    className="w-full mb-3 text-xs h-7 text-blue-600 hover:text-blue-800"
                                                                >
                                                                    Grant Consent
                                                                </Button>
                                                            )}

                                                            {/* Toggle Controls */}
                                                            <div className="flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span>Active:</span>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={license.isActive}
                                                                            onChange={(e) => {
                                                                                updateTenantLicense(editTenant.tenant!.tenantId, license.id, {
                                                                                    isActive: e.target.checked,
                                                                                    isPrimary: false,
                                                                                    isTrial: license.isTrial,
                                                                                    licenseType: license.licenseType
                                                                                });
                                                                            }}
                                                                            disabled={isUpdating}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span>Trial:</span>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={license.isTrial}
                                                                            onChange={(e) => {
                                                                                updateTenantLicense(editTenant.tenant!.tenantId, license.id, {
                                                                                    isActive: license.isActive,
                                                                                    isPrimary: false,
                                                                                    isTrial: e.target.checked,
                                                                                    licenseType: license.licenseType
                                                                                });
                                                                            }}
                                                                            disabled={isUpdating}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {/* Dates */}
                                                            <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t">
                                                                <span>Created: {new Date(license.createdAt).toLocaleDateString()}</span>
                                                                <span>Expires: {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Never'}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-900">
                                                <Shield className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No licenses assigned</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditTenant(null);
                                        setEditError(null);
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
            {/* License Onboarding Wizard */}
            {licenseOnboardingWizard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Add License - {licenseOnboardingWizard.tenantName}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                Step {licenseOnboardingWizard.currentStep + 1} of 3
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress Steps */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`text-center p-3 ${licenseOnboardingWizard.currentStep >= 0 ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                        licenseOnboardingWizard.currentStep >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100'
                                    }`}>
                                        <Plus className={`h-5 w-5 ${licenseOnboardingWizard.currentStep >= 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                    <h4 className="font-semibold text-sm">Select License</h4>
                                </div>
                                <div className={`text-center p-3 ${licenseOnboardingWizard.currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                        licenseOnboardingWizard.currentStep >= 1 ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100'
                                    }`}>
                                        <Lock className={`h-5 w-5 ${licenseOnboardingWizard.currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`} />
                                    </div>
                                    <h4 className="font-semibold text-sm">Grant Consent</h4>
                                </div>
                                <div className={`text-center p-3 ${licenseOnboardingWizard.currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                                        licenseOnboardingWizard.currentStep >= 2 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100'
                                    }`}>
                                        <CheckCircle className={`h-5 w-5 ${licenseOnboardingWizard.currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                    <h4 className="font-semibold text-sm">Complete</h4>
                                </div>
                            </div>

                            {/* Step Content */}
                            {licenseOnboardingWizard.currentStep === 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Select License Type</CardTitle>
                                        <CardDescription>Choose which license type to add to this tenant</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <select
                                            value={licenseOnboardingWizard.licenseType}
                                            onChange={(e) => setLicenseOnboardingWizard(prev => prev ? {
                                                ...prev,
                                                licenseType: parseInt(e.target.value)
                                            } : null)}
                                            className="w-full p-3 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option
                                                value={0}
                                                disabled={customerData?.tenants
                                                    .find(t => t.tenantId === licenseOnboardingWizard.tenantId)
                                                    ?.licenses?.some(license => license.licenseType === 0)
                                                }
                                            >
                                                Assistant {customerData?.tenants
                                                .find(t => t.tenantId === licenseOnboardingWizard.tenantId)
                                                ?.licenses?.some(license => license.licenseType === 0)
                                                ? '(Already assigned)' : ''
                                            }
                                            </option>
                                            <option
                                                value={1}
                                                disabled={customerData?.tenants
                                                    .find(t => t.tenantId === licenseOnboardingWizard.tenantId)
                                                    ?.licenses?.some(license => license.licenseType === 1)
                                                }
                                            >
                                                Assignments Manager {customerData?.tenants
                                                .find(t => t.tenantId === licenseOnboardingWizard.tenantId)
                                                ?.licenses?.some(license => license.licenseType === 1)
                                                ? '(Already assigned)' : ''
                                            }
                                            </option>
                                            <option
                                                value={2}
                                                disabled={customerData?.tenants
                                                    .find(t => t.tenantId === licenseOnboardingWizard.tenantId)
                                                    ?.licenses?.some(license => license.licenseType === 2)
                                                }
                                            >
                                                Historicus {customerData?.tenants
                                                .find(t => t.tenantId === licenseOnboardingWizard.tenantId)
                                                ?.licenses?.some(license => license.licenseType === 2)
                                                ? '(Already assigned)' : ''
                                            }
                                            </option>
                                        </select>
                                        <p className="text-xs text-gray-500">
                                            License types already assigned to this tenant are disabled.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {licenseOnboardingWizard.currentStep === 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Grant Admin Consent</CardTitle>
                                        <CardDescription>Admin consent is required for the new license</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {licenseOnboardingWizard.loading && (
                                            <div className="text-center py-6">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                                <p className="font-medium">Processing consent...</p>
                                            </div>
                                        )}

                                        {licenseOnboardingWizard.consentWindow && !licenseOnboardingWizard.consentCompleted && (
                                            <div className="text-center py-6">
                                                <ExternalLink className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                                                <p className="font-medium">Consent window is open</p>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Please complete the consent process in the popup window
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {licenseOnboardingWizard.currentStep === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>License Added Successfully</CardTitle>
                                        <CardDescription>The license has been added to the tenant</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center py-6">
                                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                                            <p className="text-lg font-medium mb-2">License Added!</p>
                                            <p className="text-gray-600">
                                                {getLicenseTypeName(licenseOnboardingWizard.licenseType)} license has been successfully added to {licenseOnboardingWizard.tenantName}.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Error Display */}
                            {licenseOnboardingWizard.error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    <AlertCircle className="h-4 w-4" />
                                    {licenseOnboardingWizard.error}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                {licenseOnboardingWizard.currentStep === 0 && (
                                    <Button
                                        onClick={handleLicenseWizardNext}
                                        disabled={licenseOnboardingWizard.loading}
                                    >
                                        Start Consent Process
                                    </Button>
                                )}

                                {licenseOnboardingWizard.currentStep === 2 && (
                                    <Button onClick={() => setLicenseOnboardingWizard(null)}>
                                        Complete
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => setLicenseOnboardingWizard(null)}
                                    disabled={licenseOnboardingWizard.loading}
                                >
                                    {licenseOnboardingWizard.currentStep === 2 ? 'Close' : 'Cancel'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {showOnboardingModal && (
                <TenantOnboardingModal
                    isOpen={showOnboardingModal}
                    onClose={() => setShowOnboardingModal(false)}
                    onSuccess={handleTenantOnboardingSuccess}
                    customerId={customerData.id}
                    customerName={customerData.name}
                />
            )}
        </div>
    );

}