'use client';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Info, Users, Building, Lock, AlertCircle, Loader2, CheckCircle,
    Shield, ExternalLink, X
} from 'lucide-react';
import { useGdapTenantOnboarding, type PartnerTenant } from '@/hooks/useGdapTenantOnboarding';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {CONSENT_URL_ENDPOINT, CONSENT_CALLBACK, CUSTOMER_ENDPOINT} from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';

interface TenantOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    onSuccess: () => void;
    gdapTenant?: PartnerTenant;
    type?: 'regular' | 'gdap';
}

interface OnboardingResult {
    status: string;
    message: string;
    data?: string;
}

const TenantOnboardingModal: React.FC<TenantOnboardingModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         customerId,
                                                                         customerName,
                                                                         onSuccess,
                                                                         gdapTenant,
                                                                         type = 'regular'
                                                                     }) => {
    // State management
    const {instance, accounts} = useMsal();
    const [consentState, setConsentState] = useState<string | null>(null);
    const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);

    const [currentStep, setCurrentStep] = useState(0);
    const [isGdapMode, setIsGdapMode] = useState(true);
    const [tenantId, setTenantId] = useState(gdapTenant?.tenantId || '');
    const [tenantDomainName, setTenantDomainName] = useState(gdapTenant?.domain || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [consentWindow, setConsentWindow] = useState<Window | null>(null);
    const [consentCompleted, setConsentCompleted] = useState(false);

    const loggedInUserTenantId = accounts[0]?.tenantId || accounts[0]?.homeAccountId?.split('.')[1];

    const {
        partnerTenants,
        selectedTenant,
        setSelectedTenant,
        loading: gdapLoading,
        error: gdapError,
        fetchPartnerTenants,
        resetSelection
    } = useGdapTenantOnboarding(loggedInUserTenantId);

    // Initialize component when opening
    useEffect(() => {
        if (isOpen) {
            if (gdapTenant) {
                setIsGdapMode(true);
                setTenantId(gdapTenant.tenantId);
                setTenantDomainName(gdapTenant.domain);
                setCurrentStep(1); // Skip step 0 for pre-selected GDAP tenant
            } else {
                setCurrentStep(0);
                setIsGdapMode(true); // Always default to GDAP
                setTenantId('');
                setTenantDomainName('');
            }
            setError(null);
            setConsentCompleted(false);
            resetSelection();
        }
    }, [isOpen, gdapTenant, type, resetSelection]);

    // Handle consent window messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                console.log('Message from different origin ignored:', event.origin);
                return;
            }
            if (event.data.type === 'CONSENT_SUCCESS') {
                console.log('Consent success received');
                setConsentCompleted(true);
                setLoading(false);

                if (consentWindow) {
                    consentWindow.close();
                    setConsentWindow(null);
                }
                handleConsentCallback();

            } else if (event.data.type === 'CONSENT_ERROR') {
                console.log('Consent error received:', event.data);
                setError(`Consent failed: ${event.data.errorDescription || event.data.error || 'Unknown error'}`);
                setLoading(false);

                if (consentWindow) {
                    consentWindow.close();
                    setConsentWindow(null);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [consentWindow]);

    // Monitor consent window closure
    useEffect(() => {
        if (!consentWindow) return;

        const checkClosed = setInterval(() => {
            if (consentWindow.closed && !consentCompleted) {
                console.log('Consent window closed without completion');
                setError('Consent window was closed. Please try again.');
                setLoading(false);
                setConsentWindow(null);
            }
        }, 1000);

        return () => clearInterval(checkClosed);
    }, [consentWindow, consentCompleted]);

    const linkExistingTenant = async () => {
        try {
            setLoading(true);
            setError(null);

            const finalTenantId = isGdapMode ? selectedTenant?.tenantId : tenantId;

            if (!finalTenantId) {
                throw new Error('Missing tenant ID');
            }

            const token = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const response = await fetch(
                `${CUSTOMER_ENDPOINT}/${customerId}/tenants/add-link`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        isEnabled: true,
                        isGdap: isGdapMode,
                        tenantId: finalTenantId
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to link tenant: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Tenant linked successfully:', result);

            setOnboardingResult({
                status: 'success',
                message: 'Tenant linked successfully'
            });
            setCurrentStep(3);
        } catch (err) {
            console.error('Error linking tenant:', err);
            setError(err instanceof Error ? err.message : 'Failed to link tenant');
        } finally {
            setLoading(false);
        }
    };


    const handleConsentCallback = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Processing consent callback...');

            // Wait a moment for the consent to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));

            const token = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Check onboarding status or complete the process
            const response = await fetch(
                `${CONSENT_CALLBACK}${consentState ? `?state=${consentState}` : ''}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token.accessToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to complete onboarding: ${response.statusText}`);
            }

            let result = null;
            if (response.status === 204) {
                console.log('Onboarding completed (204 No Content)');
                result = { status: 'success', message: 'Onboarding completed successfully' };
            } else {
                result = await response.json();
                console.log('Onboarding completed:', result);
            }

            setOnboardingResult(result);
            setCurrentStep(3);
        } catch (err) {
            console.error('Error completing onboarding:', err);
            setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };


    // Step navigation
    const handleNext = () => {
        setError(null);

        if (currentStep === 0) {
            // Step 1: Method selection and data entry
            if (isGdapMode && !selectedTenant) {
                setError('Please select a partner tenant for GDAP onboarding');
                return;
            }
            if (!isGdapMode && (!tenantId || !tenantDomainName)) {
                setError('Please enter tenant ID and domain name');
                return;
            }
            setCurrentStep(1);
        } else if (currentStep === 1) {
            // Check if tenant is already onboarded but not linked
            const isOnboardedNotLinked = isGdapMode
                ? selectedTenant?.isOnboarded && !selectedTenant?.isLinked
                : false; // For manual entry, we can't determine this easily

            if (isOnboardedNotLinked) {
                // Skip consent step and go directly to linking
                linkExistingTenant();
            } else {
                // Step 2: Validation -> Admin Consent
                setCurrentStep(2);
                initiateConsent();
            }
        } else if (currentStep === 2) {
            // This step is handled by consent completion
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const initiateConsent = async () => {
        try {
            setLoading(true);
            setError(null);

            const finalTenantId = isGdapMode ? selectedTenant?.tenantId : tenantId;
            const finalDomainName = isGdapMode ? selectedTenant?.domain : tenantDomainName;
            const finalDisplayName = isGdapMode ? selectedTenant?.displayName : undefined;

            console.log('Initiating consent for tenant:', {
                tenantId: finalTenantId,
                domainName: finalDomainName,
                displayName: finalDisplayName,
                isGdap: isGdapMode
            });

            if (!finalTenantId || !finalDomainName) {
                throw new Error('Missing tenant information');
            }
            const tokenResponse = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Build API URL to get consent URL
            const apiUrl = `${CUSTOMER_ENDPOINT}/${customerId}/tenants/onboarding?tenantid=${finalTenantId}&tenantName=${finalDisplayName}&domainName=${encodeURIComponent(finalDomainName)}&isGdap=${isGdapMode}`;
            console.log('🔵 API URL:', apiUrl);

            // Make API call to get consent URL
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to get consent URL: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('🔵 API Response:', result);

            // Extract consent URL from API response
            const consentUrl = result.data?.url || result.url;
            if (!consentUrl) {
                throw new Error('No consent URL received from API');
            }
            const state = extractStateFromConsentUrl(result.data.url);
            setConsentState(state);
            console.log('🔵 Opening consent URL:', consentUrl);

            // Open consent window with the URL from API
            const popup = window.open(
                consentUrl,
                'consentWindow',
                'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
            );

            if (popup) {
                setConsentWindow(popup);
                popup.focus();
            } else {
                throw new Error('Failed to open consent window. Please check your popup blocker settings.');
            }

        } catch (err) {
            console.error('Error initiating consent:', err);
            setError(err instanceof Error ? err.message : 'Failed to initiate consent');
            setLoading(false);
        }
    };

    const extractStateFromConsentUrl = (url: string): string | null => {
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('state');
        } catch (error) {
            console.error('Failed to parse consent URL:', error);
            return null;
        }
    };

    const handleComplete = () => {
        onSuccess();
        onClose();
    };

    // Step content rendering
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Choose Onboarding Method</CardTitle>
                            <CardDescription>Select how you want to onboard this tenant</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Method Selection */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium">Authentication Method</h4>
                                        <Info className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={isGdapMode}
                                                onCheckedChange={(checked) => {
                                                    setIsGdapMode(checked);
                                                    setError(null);
                                                    // Reset selections when switching modes
                                                    if (!checked) {
                                                        setSelectedTenant(null);
                                                        resetSelection();
                                                    }
                                                    setTenantId('');
                                                    setTenantDomainName('');
                                                }}
                                                disabled={true}
                                            />

                                            <span className="font-medium">
                    {isGdapMode ? 'GDAP (Recommended)' : 'Interactive Authentication'}
                </span>
                                        </div>
                                        <div className="text-sm text-gray-600 ml-8">
                                            {isGdapMode ? (
                                                <span>
                        Use Granular Delegated Admin Privileges for secure partner access.
                        Select from your existing GDAP relationships.
                    </span>
                                            ) : (
                                                <span>
                        Traditional interactive authentication requiring customer admin consent.
                        Enter tenant details manually.
                    </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* GDAP Tenant Selection */}
                            {isGdapMode && (
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Shield className="h-5 w-5" />
                                                    Select Partner Tenant
                                                </CardTitle>
                                                <CardDescription>
                                                    Choose from your available GDAP partner tenants
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchPartnerTenants}
                                                disabled={gdapLoading}
                                            >
                                                {gdapLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Refresh'
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {partnerTenants.length === 0 && !gdapLoading && !gdapError && (
                                            <Button onClick={fetchPartnerTenants} >
                                                Load Partner Tenants
                                            </Button>
                                        )}

                                        {gdapLoading && (
                                            <div className="text-center py-4">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">Loading partner tenants...</p>
                                            </div>
                                        )}

                                        {gdapError && (
                                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                                <AlertCircle className="h-4 w-4" />
                                                {gdapError}
                                            </div>
                                        )}

                                        {!gdapLoading && !gdapError && partnerTenants.length > 0 && (
                                            <Command className="rounded-lg border shadow-md">
                                                <CommandInput placeholder="Search tenants..." />
                                                <CommandList className="max-h-[300px]">
                                                    <CommandEmpty>No tenants found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {partnerTenants.map((tenant) => (
                                                            <CommandItem
                                                                key={tenant.tenantId}
                                                                value={`${tenant.domain} ${tenant.displayName || ''}`}
                                                                onSelect={() => {
                                                                    setSelectedTenant(tenant);
                                                                    setTenantId(tenant.tenantId);
                                                                    setTenantDomainName(tenant.domain);
                                                                }}
                                                                disabled={tenant.isLinked}
                                                                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                                                                    tenant.isLinked ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
                                                                }`}
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-medium">{tenant.domain}</p>
                                                                        {tenant.displayName && (
                                                                            <span className="text-sm text-gray-500">
                        ({tenant.displayName})
                    </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-400 font-mono">
                                                                        {tenant.tenantId}
                                                                    </p>
                                                                    <div className="flex gap-1 mt-1">
                                                                        <Badge
                                                                            variant={tenant.isOnboarded ? "default" : "secondary"}
                                                                            className="text-xs"
                                                                        >
                                                                            {tenant.isOnboarded ? 'Onboarded' : 'Not Onboarded'}
                                                                        </Badge>
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className={`text-xs ${tenant.isLinked ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}`}
                                                                        >
                                                                            {tenant.isLinked ? 'Linked' : 'Not Linked'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                {selectedTenant?.tenantId === tenant.tenantId && (
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                )}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        )}

                                        {selectedTenant && (
                                            <Card className="bg-green-50 border-green-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-green-800">
                                                                Selected: {selectedTenant.domain}
                                                            </p>
                                                            <p className="text-sm text-green-600">
                                                                {selectedTenant.displayName || 'No display name'}
                                                            </p>
                                                            <p className="text-xs text-green-500 font-mono">
                                                                {selectedTenant.tenantId}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedTenant(null);
                                                                setTenantId('');
                                                                setTenantDomainName('');
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Manual Entry for Interactive Mode */}
                            {!isGdapMode && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="tenantId">Tenant ID</Label>
                                        <Input
                                            id="tenantId"
                                            value={tenantId}
                                            onChange={(e) => setTenantId(e.target.value)}
                                            placeholder="Enter tenant ID (UUID format)"
                                            className="font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            The Azure AD tenant ID in UUID format
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="domain">Domain Name</Label>
                                        <Input
                                            id="domain"
                                            value={tenantDomainName}
                                            onChange={(e) => setTenantDomainName(e.target.value)}
                                            placeholder="Enter domain name (e.g., contoso.onmicrosoft.com)"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            The primary domain name of the tenant
                                        </p>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                );

            case 1:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Validation</CardTitle>
                            <CardDescription>Verify and confirm information</CardDescription>
                        </CardHeader>
                         {/*Validation step display*/}
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Customer:</span>
                                    <span>{customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Method:</span>
                                    <Badge variant={isGdapMode ? "default" : "secondary"}>
                                        {isGdapMode ? 'GDAP' : 'Interactive'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Tenant ID:</span>
                                    <span className="font-mono text-sm">
            {isGdapMode ? selectedTenant?.tenantId : tenantId}
        </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Domain:</span>
                                    <span>{isGdapMode ? selectedTenant?.domain : tenantDomainName}</span>
                                </div>
                                {isGdapMode && selectedTenant?.displayName && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Display Name:</span>
                                        <span>{selectedTenant.displayName}</span>
                                    </div>
                                )}
                                {isGdapMode && selectedTenant && (
                                    <div className="flex justify-between">
                                        <span className="font-medium">Status:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {selectedTenant.isOnboarded ? 'Previously Onboarded' : 'New Tenant'}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Next Step:</p>
                                        {isGdapMode && selectedTenant?.isOnboarded && !selectedTenant?.isLinked ? (
                                            <p>This tenant is already onboarded. We will link it to your customer account.</p>
                                        ) : (
                                            <>
                                                <p>Admin consent will be initiated to grant necessary permissions for monitoring and management.</p>
                                                {isGdapMode && (
                                                    <p className="mt-1">Using GDAP relationship for secure delegated access.</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 3: Admin Consent</CardTitle>
                            <CardDescription>Grant necessary permissions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loading && (
                                <div className="text-center py-6">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                    <p className="font-medium">Initiating consent process...</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        A popup window will open for admin consent
                                    </p>
                                </div>
                            )}

                            {consentWindow && !consentCompleted && (
                                <div className="text-center py-6">
                                    <ExternalLink className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                                    <p className="font-medium">Consent window is open</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Please complete the consent process in the popup window
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (consentWindow) {
                                                consentWindow.focus();
                                            }
                                        }}
                                        className="mt-4"
                                    >
                                        Focus Consent Window
                                    </Button>
                                </div>
                            )}

                            {!loading && !consentWindow && !consentCompleted && (
                                <div className="text-center py-6">
                                    <Shield className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600">Consent process will start automatically</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 3:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 4: Complete</CardTitle>
                            <CardDescription>Onboarding completed successfully</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-6">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                                <p className="text-lg font-medium mb-2">Onboarding Complete!</p>
                                <p className="text-gray-600">
                                    {customerName} has been successfully onboarded and is ready for monitoring.
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-green-800">
                                    <p className="font-medium mb-1">What happens next:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Tenant monitoring will begin shortly</li>
                                        <li>Security alerts and reports will be available</li>
                                        <li>Customer will appear in your dashboard</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
            <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Tenant Onboarding - {customerName}
                    </DialogTitle>
                </DialogHeader>

                {/* Process Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Onboarding Process</CardTitle>
                        <CardDescription>4-step process to onboard your customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className={`text-center p-4 ${currentStep >= 0 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100'
                                }`}>
                                    <Building className={`h-6 w-6 ${currentStep >= 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                                </div>

                                <h4 className="font-semibold mb-2">1. Method Selection</h4>
                                <p className="text-sm text-muted-foreground">Choose onboarding method</p>
                            </div>
                            <div className={`text-center p-4 ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 1 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100'
                                }`}>
                                    <CheckCircle className={`h-6 w-6 ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`} />
                                </div>

                                <h4 className="font-semibold mb-2">2. Validation</h4>
                                <p className="text-sm text-muted-foreground">Verify information</p>
                            </div>
                            <div className={`text-center p-4 ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 2 ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100'
                                }`}>
                                    <Lock className={`h-6 w-6 ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>

                                <h4 className="font-semibold mb-2">3. Admin Consent</h4>
                                <p className="text-sm text-muted-foreground">Grant permissions</p>
                            </div>
                            <div className={`text-center p-4 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 3 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100'
                                }`}>
                                    <Users className={`h-6 w-6 ${currentStep >= 3 ? 'text-yellow-600' : 'text-gray-400'}`} />
                                </div>

                                <h4 className="font-semibold mb-2">4. Complete</h4>
                                <p className="text-sm text-muted-foreground">Ready for monitoring</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Step Content */}
                {renderStepContent()}

                {/* Error Display */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                    {currentStep > 0 && currentStep < 3 && (
                        <Button variant="outline" onClick={handleBack} disabled={loading}>
                            Back
                        </Button>
                    )}

                    {currentStep < 2 && (
                        <Button onClick={handleNext} disabled={loading}>
                            {currentStep === 1 && isGdapMode && selectedTenant?.isOnboarded && !selectedTenant?.isLinked
                                ? 'Link Customer'
                                : currentStep === 1
                                    ? 'Start Consent'
                                    : 'Next'
                            }
                        </Button>
                    )}

                    {currentStep === 3 && (
                        <Button onClick={handleComplete} >
                            Complete Onboarding
                        </Button>
                    )}

                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {currentStep === 3 ? 'Close' : 'Cancel'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TenantOnboardingModal;
