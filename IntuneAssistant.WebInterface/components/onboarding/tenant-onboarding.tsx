// components/onboarding/tenant-onboarding.tsx
'use client';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    Loader2,
    Building,
    Key,
    ArrowRight,
    AlertCircle,
    ExternalLink,
    Shield
} from 'lucide-react';
import { CUSTOMER_ENDPOINT, CONSENT_CALLBACK } from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";

interface TenantOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
    onSuccess: () => void;
}

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

// Updated interface to match your API response
interface ConsentResponse {
    status: number;
    message: string;
    data: {
        url: string;
        message: string;
    };
}

interface OnboardingResult {
    status: string;
    message: string;
    data?: object; // You can make this more specific based on your API response
}

export default function TenantOnboardingModal({
                                                  isOpen,
                                                  onClose,
                                                  customerId,
                                                  customerName,
                                                  onSuccess
                                              }: TenantOnboardingModalProps) {
    const { accounts, instance } = useMsal();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [consentCompleted, setConsentCompleted] = useState(false);
    const [consentWindow, setConsentWindow] = useState<Window | null>(null);

    // Form data
    const [tenantId, setTenantId] = useState('');
    const [tenantDomainName, setTenantDomainName] = useState('');

    // Consent data
    const [consentData, setConsentData] = useState<ConsentResponse | null>(null);
    const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
    const [consentState, setConsentState] = useState<string | null>(null);


    const steps: OnboardingStep[] = [
        {
            id: 'tenant-info',
            title: 'Tenant Information',
            description: 'Enter the new tenant details',
            completed: currentStep > 0
        },
        {
            id: 'validation',
            title: 'Validation',
            description: 'Verify tenant information',
            completed: currentStep > 1
        },
        {
            id: 'consent',
            title: 'Admin Consent',
            description: 'Grant required permissions',
            completed: currentStep > 2
        },
        {
            id: 'completion',
            title: 'Completion',
            description: 'Setup complete',
            completed: currentStep > 3
        }
    ];

    // Update the useEffect in your TenantOnboardingModal component
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Only accept messages from same origin
            if (event.origin !== window.location.origin) {
                console.log('❌ Message from different origin ignored:', event.origin);
                return;
            }

            console.log('🔵 Message received:', event.data);

            if (event.data.type === 'CONSENT_SUCCESS') {
                console.log('✅ Consent success received');
                setConsentCompleted(true);
                setLoading(false);

                if (consentWindow) {
                    consentWindow.close();
                    setConsentWindow(null);
                }

                // Proceed to handle the callback
                handleConsentCallback();
            } else if (event.data.type === 'CONSENT_ERROR') {
                console.log('❌ Consent error received:', event.data);
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


    // Check if consent window is closed without completion
    useEffect(() => {
        if (!consentWindow) return;

        const checkClosed = setInterval(() => {
            if (consentWindow.closed && !consentCompleted) {
                console.log('⚠️ Consent window closed without completion');
                setError('Consent window was closed. Please try again.');
                setLoading(false);
                setConsentWindow(null);
            }
        }, 1000);

        return () => clearInterval(checkClosed);
    }, [consentWindow, consentCompleted]);

    const validateTenantId = (id: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(id);
    };

    const validateDomainName = (domain: string) => {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain) && domain.length > 0;
    };

    const handleNext = () => {
        if (currentStep === 0) {
            // Validate form inputs
            if (!validateTenantId(tenantId)) {
                setError('Please enter a valid Tenant ID (UUID format)');
                return;
            }
            if (!validateDomainName(tenantDomainName)) {
                setError('Please enter a valid domain name');
                return;
            }
            setError(null);
            setCurrentStep(1);
        } else if (currentStep === 1) {
            setCurrentStep(2);
            initiateOnboarding();
        }
    };

    const initiateOnboarding = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔵 Initiating onboarding...');

            const token = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const url = `${CUSTOMER_ENDPOINT}/${customerId}/tenants/onboarding?tenantid=${tenantId}&tenantName=${tenantDomainName}`;
            console.log('🔵 API URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to initiate onboarding: ${response.statusText}`);
            }

            const result: ConsentResponse = await response.json();
            console.log('🔵 API Response:', result);

            const state = extractStateFromConsentUrl(result.data.url);
            setConsentState(state);
            console.log('🔵 Extracted state:', state);

            setConsentData(result);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error initiating onboarding:', err);
            setError(err instanceof Error ? err.message : 'Failed to initiate onboarding');
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


    const openConsentWindow = () => {
        console.log('🔵 openConsentWindow called');
        console.log('🔵 consentData:', consentData);

        if (!consentData?.data?.url) {
            console.log('❌ No consent URL available');
            setError('No consent URL available. Please try again.');
            return;
        }

        setLoading(true);
        setError(null);
        setConsentCompleted(false);

        // Use the URL directly from the API response
        const consentUrl = consentData.data.url;
        console.log('🔵 Opening consent URL:', consentUrl);

        const popup = window.open(
            consentUrl,
            'consent',
            'width=600,height=700,scrollbars=yes,resizable=yes,location=yes,toolbar=yes'
        );

        if (popup) {
            console.log('✅ Popup opened successfully');
            setConsentWindow(popup);
            popup.focus();

            // Test if popup is blocked
            setTimeout(() => {
                if (popup.closed) {
                    console.log('❌ Popup was immediately closed - likely blocked');
                    setError('Popup was blocked. Please allow popups for this site and try again.');
                    setLoading(false);
                }
            }, 100);
        } else {
            console.log('❌ Failed to open popup');
            setError('Failed to open consent window. Please allow popups and try again.');
            setLoading(false);
        }
    };

    const handleConsentCallback = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔵 Processing consent callback...');

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
                console.log('✅ Onboarding completed (204 No Content)');
                result = { status: 'success', message: 'Onboarding completed successfully' };
            } else {
                result = await response.json();
                console.log('✅ Onboarding completed:', result);
            }
            setOnboardingResult(result);
            setCurrentStep(3);
        } catch (err) {
            console.error('❌ Error completing onboarding:', err);
            setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };



    const handleClose = () => {
        // Close consent window if open
        if (consentWindow && !consentWindow.closed) {
            consentWindow.close();
        }

        // Reset state
        setCurrentStep(0);
        setTenantId('');
        setTenantDomainName('');
        setError(null);
        setConsentData(null);
        setOnboardingResult(null);
        setConsentCompleted(false);
        setConsentWindow(null);
        onClose();
    };

    const handleComplete = () => {
        onSuccess();
        handleClose();
    };

    const isFormValid = validateTenantId(tenantId) && validateDomainName(tenantDomainName);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Tenant Onboarding
                    </DialogTitle>
                    <DialogDescription>
                        Add a new tenant to {customerName}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                                index <= currentStep
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-300 text-gray-400'
                            }`}>
                                {step.completed ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-0.5 mx-2 transition-colors ${
                                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="space-y-6">
                    {/* Step 0: Tenant Information */}
                    {currentStep === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-4 w-4" />
                                    Tenant Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the tenant ID and domain name for the new tenant
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tenantId">Tenant ID</Label>
                                    <Input
                                        id="tenantId"
                                        placeholder="e.g., 12345678-1234-1234-1234-123456789abc"
                                        value={tenantId}
                                        onChange={(e) => setTenantId(e.target.value)}
                                        className={!tenantId ? '' : validateTenantId(tenantId) ? 'border-green-500' : 'border-red-500'}
                                    />
                                    <p className="text-xs text-gray-600">
                                        The unique identifier for the tenant (UUID format)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tenantDomain">Domain Name</Label>
                                    <Input
                                        id="tenantDomain"
                                        placeholder="e.g., contoso.onmicrosoft.com"
                                        value={tenantDomainName}
                                        onChange={(e) => setTenantDomainName(e.target.value)}
                                        className={!tenantDomainName ? '' : validateDomainName(tenantDomainName) ? 'border-green-500' : 'border-red-500'}
                                    />
                                    <p className="text-xs text-gray-600">
                                        The primary domain name for the tenant
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 1: Validation */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Validation
                                </CardTitle>
                                <CardDescription>
                                    Please verify the tenant information before proceeding
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3">Tenant Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Customer:</span>
                                            <span className="font-medium">{customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tenant ID:</span>
                                            <code className="bg-white px-2 py-1 rounded text-sm">{tenantId}</code>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Domain:</span>
                                            <span className="font-medium">{tenantDomainName}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-medium">Important:</p>
                                            <p>Make sure the tenant information is correct. The next step will require admin consent from the target tenant.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Admin Consent */}
                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin Consent Required
                                </CardTitle>
                                <CardDescription>
                                    Grant the required permissions to manage this tenant
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading && !consentData ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-600">Preparing consent request...</p>
                                        </div>
                                    </div>
                                ) : consentData ? (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-blue-900 mb-2">Admin Consent Required</h4>
                                                    <p className="text-sm text-blue-800 mb-3">
                                                        {consentData.data.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center py-4 space-y-2">
                                            <Button
                                                onClick={openConsentWindow}
                                                disabled={loading}
                                                className="flex items-center gap-2"
                                                size="lg"
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ExternalLink className="h-4 w-4" />
                                                )}
                                                {loading ? 'Processing...' : 'Open Consent Window'}
                                            </Button>
                                            <p className="text-xs text-gray-600 mt-2">
                                                A popup window will open for admin consent
                                            </p>
                                        </div>

                                        {consentCompleted && (
                                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">
                                                        Consent granted! Completing onboarding...
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Completion */}
                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Onboarding Complete
                                </CardTitle>
                                <CardDescription>
                                    The tenant has been successfully onboarded
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-800">Success!</span>
                                    </div>
                                    <p className="text-green-700">
                                        {tenantDomainName} has been successfully added to {customerName}.
                                    </p>
                                </div>

                                {onboardingResult && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Connection Details:</h4>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span>Status:</span>
                                                <Badge variant="default">Connected</Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Next steps:</strong> The tenant is now available in your customer management dashboard.
                                        You can configure policies and manage devices for this tenant.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Footer Actions */}
                <Separator />
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        {currentStep === 3 ? 'Close' : 'Cancel'}
                    </Button>

                    <div className="flex gap-2">
                        {currentStep > 0 && currentStep < 2 && (
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                disabled={loading}
                            >
                                Back
                            </Button>
                        )}

                        {currentStep < 2 && (
                            <Button
                                onClick={handleNext}
                                disabled={currentStep === 0 ? !isFormValid : loading}
                                className="flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}

                        {currentStep === 3 && (
                            <Button
                                onClick={handleComplete}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Complete
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
