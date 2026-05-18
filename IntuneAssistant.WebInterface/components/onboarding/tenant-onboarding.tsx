'use client';
import { useState, useEffect, useRef } from 'react';
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
import {CUSTOMER_ENDPOINT, CUSTOMER_TENANTS_ENDPOINT} from '@/lib/constants';
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

    // Capture the original logged-in account once when the modal opens.
    // After the consent popup for a customer tenant MSAL may add new accounts to its
    // cache (or lose the active account), so we must hold a stable reference here.
    const originAccountRef = useRef(accounts[0] ?? null);
    useEffect(() => {
        if (isOpen && accounts.length > 0) {
            originAccountRef.current = accounts[0];
        }
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Helper: always acquire a token for OUR account, never the customer's
    const acquireToken = async () => {
        const account = originAccountRef.current ?? accounts[0];
        if (!account) throw new Error('No authenticated account found. Please log in again.');
        return instance.acquireTokenSilent({ scopes: [apiScope], account });
    };
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
    // New customer provisioning fields (for non-onboarded GDAP tenants)
    const [newCustomerDisplayName, setNewCustomerDisplayName] = useState('');
    const [newCustomerIsGdap, setNewCustomerIsGdap] = useState(true);

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
                setNewCustomerIsGdap(true);
                setNewCustomerDisplayName('');
                // Non-onboarded: go to customer details step; onboarded: skip to validation
                setCurrentStep(gdapTenant.isOnboarded ? 2 : 1);
            } else {
                setCurrentStep(0);
                setIsGdapMode(true);
                setTenantId('');
                setTenantDomainName('');
                setNewCustomerDisplayName('');
                setNewCustomerIsGdap(true);
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

            const token = await acquireToken();

            const response = await fetch(
                `${CUSTOMER_ENDPOINT}/tenants`,
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
            setCurrentStep(4);
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

            // For tenant onboarding the consent just grants permissions — there is no
            // separate callback to process (that endpoint is for initial MSP onboarding only).
            // We simply link the tenant directly after consent succeeds.
            const token = await acquireToken();

            const finalTenantId = isGdapMode ? selectedTenant?.tenantId : tenantId;
            if (!finalTenantId) {
                throw new Error('Missing tenant ID for linking');
            }

            console.log('Linking tenant after consent:', finalTenantId);
            const linkResponse = await fetch(
                `${CUSTOMER_ENDPOINT}/tenants`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        isEnabled: true,
                        isGdap: isGdapMode,
                        tenantId: finalTenantId,
                    })
                }
            );

            if (!linkResponse.ok) {
                const errorData = await linkResponse.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to link tenant: ${linkResponse.statusText}`);
            }

            console.log('Tenant linked successfully after consent');
            setCurrentStep(4);
        } catch (err) {
            console.error('Error linking tenant after consent:', err);
            setError(err instanceof Error ? err.message : 'Failed to link tenant');
        } finally {
            setLoading(false);
        }
    };


    // Step navigation
    const handleNext = () => {
        setError(null);

        if (currentStep === 0) {
            if (isGdapMode && !selectedTenant) {
                setError('Please select a partner tenant for GDAP onboarding');
                return;
            }
            if (!isGdapMode && (!tenantId || !tenantDomainName)) {
                setError('Please enter tenant ID and domain name');
                return;
            }
            // Non-onboarded GDAP tenant → customer details step
            const isNewCustomer = isGdapMode && selectedTenant && !selectedTenant.isOnboarded;
            if (isNewCustomer) {
                // Pre-fill GDAP toggle from selected tenant
                setNewCustomerIsGdap(true);
                setCurrentStep(1);
            } else {
                setCurrentStep(2);
            }
        } else if (currentStep === 1) {
            // Customer details step — validate then provision
            if (!newCustomerDisplayName.trim()) {
                setError('Please enter a customer name');
                return;
            }
            provisionNewCustomer();
        } else if (currentStep === 2) {
            const isOnboardedNotLinked = isGdapMode
                ? selectedTenant?.isOnboarded && !selectedTenant?.isLinked
                : false;

            if (isOnboardedNotLinked) {
                linkExistingTenant();
            } else {
                setCurrentStep(3);
                initiateConsent();
            }
        } else if (currentStep === 3) {
            setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (currentStep === 2) {
            // Go back to customer details if it was a new customer, else back to method selection
            const isNewCustomer = isGdapMode && selectedTenant && !selectedTenant.isOnboarded;
            setCurrentStep(isNewCustomer ? 1 : 0);
        } else if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const provisionNewCustomer = async () => {
        try {
            setLoading(true);
            setError(null);

            const finalTenantId = selectedTenant?.tenantId || tenantId;
            const finalDomain = selectedTenant?.domain || tenantDomainName;

            const token = await acquireToken();

            const response = await fetch(
                `${CUSTOMER_TENANTS_ENDPOINT}/${finalTenantId}/provision`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        displayName: newCustomerDisplayName.trim(),
                        domain: finalDomain,
                        gdap: newCustomerIsGdap,
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to provision customer: ${response.statusText}`);
            }

            console.log('Customer provisioned successfully');
            setCurrentStep(2);
        } catch (err) {
            console.error('Error provisioning customer:', err);
            setError(err instanceof Error ? err.message : 'Failed to provision customer');
        } finally {
            setLoading(false);
        }
    };

    const initiateConsent = async () => {
        // Open popup SYNCHRONOUSLY first — browsers block popups opened after an await.
        const popup = window.open(
            'about:blank',
            'consentWindow',
            'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
        );

        if (!popup) {
            setError('Failed to open consent window. Please allow popups for this site and try again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const finalTenantId = isGdapMode ? selectedTenant?.tenantId : tenantId;
            const finalDomainName = isGdapMode ? selectedTenant?.domain : tenantDomainName;
            const finalDisplayName = newCustomerDisplayName.trim() || (isGdapMode ? selectedTenant?.displayName : undefined);

            if (!finalTenantId || !finalDomainName) {
                popup.close();
                throw new Error('Missing tenant information');
            }

            const tokenResponse = await acquireToken();

            const apiUrl = `${CUSTOMER_ENDPOINT}/tenants/onboarding?tenantid=${finalTenantId}&tenantName=${encodeURIComponent(finalDisplayName || '')}&domainName=${encodeURIComponent(finalDomainName)}&isGdap=${isGdapMode}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                popup.close();
                throw new Error(errorData?.message || `Failed to get consent URL: ${response.statusText}`);
            }

            const result = await response.json();
            const consentUrl = result.data?.url || result.url;
            if (!consentUrl) {
                popup.close();
                throw new Error('No consent URL received from API');
            }

            const state = extractStateFromConsentUrl(result.data?.url || consentUrl);
            setConsentState(state);

            // Navigate the already-open popup to the consent URL
            popup.location.href = consentUrl;
            setConsentWindow(popup);
            popup.focus();
            setLoading(false);

        } catch (err) {
            console.error('Error initiating consent:', err);
            if (popup && !popup.closed) popup.close();
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

            case 1: {
                // New customer provisioning — enter display name, GDAP toggle; tenant id + domain pre-filled
                const provTenantId = selectedTenant?.tenantId || tenantId;
                const provDomain = selectedTenant?.domain || tenantDomainName;
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: New Customer Details</CardTitle>
                            <CardDescription>This tenant is not yet onboarded. Provide a customer name to create the record.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Customer Name */}
                            <div className="space-y-1">
                                <Label htmlFor="newCustomerDisplayName">Customer Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="newCustomerDisplayName"
                                    value={newCustomerDisplayName}
                                    onChange={(e) => setNewCustomerDisplayName(e.target.value)}
                                    placeholder="e.g. Contoso Ltd"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500">The friendly display name for this customer</p>
                            </div>

                            {/* Pre-filled read-only info */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tenant ID</span>
                                    <span className="font-mono text-xs text-gray-800 dark:text-gray-200">{provTenantId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Domain</span>
                                    <span className="text-sm text-gray-800 dark:text-gray-200">{provDomain}</span>
                                </div>
                                {selectedTenant?.displayName && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Azure Display Name</span>
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{selectedTenant.displayName}</span>
                                    </div>
                                )}
                            </div>

                            {/* GDAP toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">GDAP Access</p>
                                    <p className="text-sm text-gray-500">Use Granular Delegated Admin Privileges for this tenant</p>
                                </div>
                                <Switch
                                    checked={newCustomerIsGdap}
                                    onCheckedChange={setNewCustomerIsGdap}
                                />
                            </div>

                            {loading && (
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Provisioning customer record…
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            }

            case 2:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step {newCustomerDisplayName ? '3' : '2'}: Validation</CardTitle>
                            <CardDescription>Verify and confirm information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{newCustomerDisplayName || customerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span>
                                    <Badge variant={isGdapMode ? "default" : "secondary"}>
                                        {isGdapMode ? 'GDAP' : 'Interactive'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Tenant ID:</span>
                                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                        {isGdapMode ? selectedTenant?.tenantId : tenantId}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Domain:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{isGdapMode ? selectedTenant?.domain : tenantDomainName}</span>
                                </div>
                                {isGdapMode && selectedTenant?.displayName && (
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Display Name:</span>
                                        <span className="text-gray-900 dark:text-gray-100">{selectedTenant.displayName}</span>
                                    </div>
                                )}
                                {isGdapMode && selectedTenant && (
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {selectedTenant.isOnboarded ? 'Previously Onboarded' : 'New Customer'}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="text-sm text-blue-800 dark:text-blue-200">
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

            case 3:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step {newCustomerDisplayName ? '4' : '3'}: Admin Consent</CardTitle>
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
                                        onClick={() => consentWindow?.focus()}
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

            case 4:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step {newCustomerDisplayName ? '5' : '4'}: Complete</CardTitle>
                            <CardDescription>Onboarding completed successfully</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-6">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                                <p className="text-lg font-medium mb-2">Onboarding Complete!</p>
                                <p className="text-gray-600">
                                    {newCustomerDisplayName || customerName} has been successfully onboarded and is ready for monitoring.
                                </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                                <div className="text-sm text-green-800 dark:text-green-200">
                                    <p className="font-medium mb-1">What happens next:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Tenant becomes available in the tenants list</li>
                                        <li>If needed, add the additional license</li>
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

    const isNewCustomer = isGdapMode && selectedTenant && !selectedTenant.isOnboarded;
    const totalSteps = isNewCustomer ? 5 : 4;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
            <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Tenant Onboarding - {newCustomerDisplayName || customerName}
                    </DialogTitle>
                </DialogHeader>

                {/* Process Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Onboarding Process</CardTitle>
                        <CardDescription>{totalSteps}-step process to onboard your customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`grid grid-cols-1 md:grid-cols-${totalSteps} gap-4`}>
                            <div className={`text-center p-4 ${currentStep >= 0 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 0 ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100'
                                }`}>
                                    <Building className={`h-6 w-6 ${currentStep >= 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                                </div>
                                <h4 className="font-semibold mb-2">1. Select Tenant</h4>
                                <p className="text-sm text-muted-foreground">Choose GDAP tenant</p>
                            </div>

                            {isNewCustomer && (
                                <div className={`text-center p-4 ${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                        currentStep >= 1 ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-100'
                                    }`}>
                                        <Users className={`h-6 w-6 ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`} />
                                    </div>
                                    <h4 className="font-semibold mb-2">2. Customer Details</h4>
                                    <p className="text-sm text-muted-foreground">Create customer record</p>
                                </div>
                            )}

                            <div className={`text-center p-4 ${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 2 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100'
                                }`}>
                                    <CheckCircle className={`h-6 w-6 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`} />
                                </div>
                                <h4 className="font-semibold mb-2">{isNewCustomer ? '3' : '2'}. Validation</h4>
                                <p className="text-sm text-muted-foreground">Verify information</p>
                            </div>

                            <div className={`text-center p-4 ${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 3 ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100'
                                }`}>
                                    <Lock className={`h-6 w-6 ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <h4 className="font-semibold mb-2">{isNewCustomer ? '4' : '3'}. Admin Consent</h4>
                                <p className="text-sm text-muted-foreground">Grant permissions</p>
                            </div>

                            <div className={`text-center p-4 ${currentStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                                    currentStep >= 4 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100'
                                }`}>
                                    <CheckCircle className={`h-6 w-6 ${currentStep >= 4 ? 'text-yellow-600' : 'text-gray-400'}`} />
                                </div>
                                <h4 className="font-semibold mb-2">{isNewCustomer ? '5' : '4'}. Complete</h4>
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
                    {currentStep > 0 && currentStep < 4 && (
                        <Button variant="outline" onClick={handleBack} disabled={loading}>
                            Back
                        </Button>
                    )}

                    {currentStep < 3 && (
                        <Button onClick={handleNext} disabled={loading}>
                            {loading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing…</>
                            ) : currentStep === 2 && isGdapMode && selectedTenant?.isOnboarded && !selectedTenant?.isLinked
                                ? 'Link Customer'
                                : currentStep === 2
                                    ? 'Start Consent'
                                    : currentStep === 1
                                        ? 'Provision & Continue'
                                        : 'Next'
                            }
                        </Button>
                    )}

                    {currentStep === 4 && (
                        <Button onClick={handleComplete}>
                            Complete Onboarding
                        </Button>
                    )}

                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {currentStep === 4 ? 'Close' : 'Cancel'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TenantOnboardingModal;
