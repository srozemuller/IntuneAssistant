// components/onboarding/customer-onboarding.tsx
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
    Shield,
    Users
} from 'lucide-react';
import { CONSENT_URL_ENDPOINT, CONSENT_CALLBACK } from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";

interface CustomerOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

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
    data?: object;
}

export default function CustomerOnboardingModal({
                                                    isOpen,
                                                    onClose,
                                                    onSuccess
                                                }: CustomerOnboardingModalProps) {
    const { accounts, instance } = useMsal();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [consentCompleted, setConsentCompleted] = useState(false);
    const [consentWindow, setConsentWindow] = useState<Window | null>(null);

    // Form data
    const [customerName, setCustomerName] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [tenantDomainName, setTenantDomainName] = useState('');

    // Consent data
    const [consentData, setConsentData] = useState<ConsentResponse | null>(null);
    const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
    const [consentState, setConsentState] = useState<string | null>(null);

    const steps: OnboardingStep[] = [
        {
            id: 'customer-info',
            title: 'Customer & Tenant',
            description: 'Enter customer and tenant details',
            completed: currentStep > 0
        },
        {
            id: 'validation',
            title: 'Validation',
            description: 'Verify information',
            completed: currentStep > 1
        },
        {
            id: 'consent',
            title: 'Admin Consent',
            description: 'Grant permissions',
            completed: currentStep > 2
        },
        {
            id: 'completion',
            title: 'Complete',
            description: 'Setup finished',
            completed: currentStep > 3
        }
    ];

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data.type === 'CONSENT_SUCCESS') {
                setConsentCompleted(true);
                setLoading(false);

                if (consentWindow) {
                    consentWindow.close();
                    setConsentWindow(null);
                }

                handleConsentCallback();
            } else if (event.data.type === 'CONSENT_ERROR') {
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

    useEffect(() => {
        if (!consentWindow) return;

        const checkClosed = setInterval(() => {
            if (consentWindow.closed && !consentCompleted) {
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

    const validateCustomerName = (name: string) => {
        return name.trim().length >= 2;
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!validateCustomerName(customerName)) {
                setError('Please enter a valid customer name (minimum 2 characters)');
                return;
            }
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

            const token = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const url = `${CONSENT_URL_ENDPOINT}?customerName=${encodeURIComponent(customerName)}&tenantid=${tenantId}&tenantName=${encodeURIComponent(tenantDomainName)}&assistantLicense=1`;

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
            const state = extractStateFromConsentUrl(result.data.url);
            setConsentState(state);
            setConsentData(result);
            setLoading(false);
        } catch (err) {
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
        if (!consentData?.data?.url) {
            setError('No consent URL available. Please try again.');
            return;
        }

        setLoading(true);
        setError(null);
        setConsentCompleted(false);

        const popup = window.open(
            consentData.data.url,
            'consent',
            'width=600,height=700,scrollbars=yes,resizable=yes,location=yes,toolbar=yes'
        );

        if (popup) {
            setConsentWindow(popup);
            popup.focus();

            setTimeout(() => {
                if (popup.closed) {
                    setError('Popup was blocked. Please allow popups and try again.');
                    setLoading(false);
                }
            }, 1000);
        } else {
            setError('Failed to open consent window. Please allow popups and try again.');
            setLoading(false);
        }
    };

    const handleConsentCallback = async () => {
        try {
            setLoading(true);
            setError(null);

            // Wait a moment for the consent to be processed
            await new Promise(resolve => setTimeout(resolve, 1000));

            const token = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Call the callback endpoint to update the database
            const callbackUrl = `${CONSENT_URL_ENDPOINT}/callback`; // or your specific callback endpoint
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

            // Handle 204 No Content response
            let result = null;
            if (response.status === 204) {
                // 204 means success with no content
                result = {
                    status: 'success',
                    message: 'Onboarding completed successfully'
                };
            } else {
                // Try to parse JSON response for other success status codes
                try {
                    result = await response.json();
                } catch (parseError) {
                    // If JSON parsing fails, assume success
                    result = {
                        status: 'success',
                        message: 'Onboarding completed successfully'
                    };
                }
            }

            setOnboardingResult({
                status: 'success',
                message: result?.message || 'Customer and tenant onboarded successfully',
                data: {
                    customerName,
                    tenantId,
                    tenantDomainName,
                    onboardingCompleted: true,
                    timestamp: new Date().toISOString(),
                    ...result?.data
                }
            });

            setCurrentStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        if (consentWindow && !consentWindow.closed) {
            consentWindow.close();
        }

        setCurrentStep(0);
        setCustomerName('');
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

    const isFormValid = validateCustomerName(customerName) && validateTenantId(tenantId) && validateDomainName(tenantDomainName);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Onboard New Customer
                    </DialogTitle>
                    <DialogDescription>
                        Add a new customer with their Microsoft tenant to your management portal
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                step.completed
                                    ? 'bg-green-500 text-white'
                                    : currentStep === index
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-600'
                            }`}>
                                {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <div className="mt-2 text-xs text-center">
                                <div className="font-medium">{step.title}</div>
                                <div className="text-muted-foreground">{step.description}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`absolute top-4 w-full h-0.5 ${
                                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                                }`} style={{ left: '50%', width: 'calc(100% - 2rem)', zIndex: -1 }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Step 0: Customer & Tenant Information */}
                    {currentStep === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Customer & Tenant Details
                                </CardTitle>
                                <CardDescription>
                                    Enter the customer name and their Microsoft tenant information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="e.g. Acme Corporation"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="tenantId">Tenant ID</Label>
                                    <Input
                                        id="tenantId"
                                        value={tenantId}
                                        onChange={(e) => setTenantId(e.target.value)}
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tenantDomainName">Tenant Domain Name</Label>
                                    <Input
                                        id="tenantDomainName"
                                        value={tenantDomainName}
                                        onChange={(e) => setTenantDomainName(e.target.value)}
                                        placeholder="contoso.onmicrosoft.com"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
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
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Information Validated
                                </CardTitle>
                                <CardDescription>
                                    Ready to proceed with admin consent
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium">Customer</span>
                                        <span className="text-sm text-muted-foreground">{customerName}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium">Tenant ID</span>
                                        <span className="text-sm text-muted-foreground font-mono">{tenantId}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium">Domain</span>
                                        <span className="text-sm text-muted-foreground">{tenantDomainName}</span>
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
                                    Grant permissions to manage this tenant
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!consentData ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        <span className="ml-2">Preparing consent...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Key className="h-4 w-4" />
                                            Click below to grant admin consent in a new window
                                        </div>
                                        <Button
                                            onClick={openConsentWindow}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Open Consent Window
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
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
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Onboarding Complete!
                                </CardTitle>
                                <CardDescription>
                                    Customer and tenant have been successfully added
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Welcome, {customerName}!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You can now manage their Microsoft Intune environment through our platform.
                                    </p>
                                </div>

                                {onboardingResult && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="text-sm text-green-800">
                                            {onboardingResult.message}
                                        </div>
                                    </div>
                                )}
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
                    >
                        {currentStep === 3 ? 'Close' : 'Cancel'}
                    </Button>

                    <div className="flex gap-2">
                        {currentStep < 2 && (
                            <Button
                                onClick={handleNext}
                                disabled={currentStep === 0 && !isFormValid}
                            >
                                {currentStep === 1 ? 'Start Consent' : 'Next'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                        {currentStep === 3 && (
                            <Button onClick={handleComplete}>
                                Continue to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
