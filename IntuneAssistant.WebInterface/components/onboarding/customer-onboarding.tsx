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
    Users,
    LogIn
} from 'lucide-react';
import { CONSENT_URL_ENDPOINT, CONSENT_CALLBACK } from '@/lib/constants';

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
    message: string;data: {
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
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Form data
    const [customerName, setCustomerName] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [tenantDomainName, setTenantDomainName] = useState('');

    // Consent data
    const [consentData, setConsentData] = useState<ConsentResponse | null>(null);
    const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
    const [consentState, setConsentState] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            setScrollPosition(window.scrollY);
        }
    }, [isOpen]);

    // Check if user is already logged in and extract claims
    useEffect(() => {
        if (accounts && accounts.length > 0) {
            setIsLoggedIn(true);
            const account = accounts[0];

            // Extract tenant ID from account
            if (account.tenantId && !tenantId) {
                setTenantId(account.tenantId);
                console.log('Extracted Tenant ID:', account.tenantId);
            }

            // Extract domain from account username or idTokenClaims
            if (account.username && !tenantDomainName) {
                const domain = account.username.split('@')[1];
                if (domain) {
                    setTenantDomainName(domain);
                    console.log('Extracted Domain:', domain);
                }
            }

            // Try to extract domain from idTokenClaims
            if (!tenantDomainName && account.idTokenClaims) {
                const claims = account.idTokenClaims as Record<string, unknown>;
                if (claims.preferred_username && typeof claims.preferred_username === 'string') {
                    const domain = claims.preferred_username.split('@')[1];
                    if (domain) {
                        setTenantDomainName(domain);
                        console.log('Extracted Domain from claims:', domain);
                    }
                }
            }

            // If already logged in, skip to step 1
            if (currentStep === 0) {
                setCurrentStep(1);
            }
        }
    }, [accounts]);

    // Listen for messages from consent popup window
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('Received message from origin:', event.origin);
            console.log('Message data:', event.data);

            // Accept messages from allowed domains
            const allowedOrigins = [
                'https://intuneassistant.cloud',
                'https://test.intuneassistant.cloud',
                'https://community.intuneassistant.cloud'
            ];

            const isDevelopment = window.location.hostname === 'localhost';
            const isAllowedOrigin = allowedOrigins.some(origin => event.origin.startsWith(origin));

            if (!isDevelopment && !isAllowedOrigin) {
                console.warn('Message from unauthorized origin:', event.origin);
                return;
            }

            if (event.data?.type === 'CONSENT_SUCCESS') {
                console.log('Consent successful, closing popup and continuing...');
                setConsentCompleted(true);

                // Close the popup window
                if (consentWindow && !consentWindow.closed) {
                    consentWindow.close();
                }
                setConsentWindow(null);

                // Call the callback to complete onboarding
                handleConsentCallback();
            } else if (event.data?.type === 'CONSENT_ERROR') {
                console.error('Consent error:', event.data);
                setError(`Consent failed: ${event.data.errorDescription || event.data.error || 'Unknown error'}`);
                setLoading(false);

                // Close the popup window
                if (consentWindow && !consentWindow.closed) {
                    consentWindow.close();
                }
                setConsentWindow(null);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [consentWindow]);

    // Monitor popup window for manual closure
    useEffect(() => {
        if (!consentWindow) return;

        const checkPopupClosed = setInterval(() => {
            if (consentWindow.closed) {
                console.log('Popup window was closed manually');
                clearInterval(checkPopupClosed);
                setConsentWindow(null);

                // Check if consent was completed before closing
                if (!consentCompleted) {
                    console.log('Popup closed without consent completion, attempting to verify...');
                    setLoading(false);

                    // Try to verify if consent was actually granted
                    // The user might have closed after granting but before redirect
                    setTimeout(() => {
                        handleConsentCallback();
                    }, 1000);
                }
            }
        }, 500);

        return () => clearInterval(checkPopupClosed);
    }, [consentWindow, consentCompleted]);

    const steps: OnboardingStep[] = [
        {
            id: 'login',
            title: 'Login',
            description: 'Sign in to continue',
            completed: currentStep > 0
        },
        {
            id: 'customer-info',
            title: 'Customer & Tenant',
            description: 'Enter customer and tenant details',
            completed: currentStep > 1
        },
        {
            id: 'validation',
            title: 'Validation',
            description: 'Verify information',
            completed: currentStep > 2
        },
        {
            id: 'consent',
            title: 'Admin Consent',
            description: 'Grant permissions',
            completed: currentStep > 3
        },
        {
            id: 'completion',
            title: 'Complete',
            description: 'Setup finished',
            completed: currentStep > 4
        }
    ];

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
            // Login step - trigger MSAL login
            handleLogin();
        } else if (currentStep === 1) {
            // Customer info step - validate inputs
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
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validation step - proceed to consent
            setCurrentStep(3);
            initiateOnboarding();
        }
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);

            // Login to the first application (3448bc04-cdbe-4a07-8e24-7e0e6f6980c1)
            const result = await instance.loginPopup({
                scopes: [
                    'openid',
                    'profile',
                    'email',
                    'User.Read' // Request User.Read to get more user information
                ],
                prompt: 'select_account'
            });

            console.log('Login successful:', result);
            console.log('Account info:', result.account);
            console.log('ID Token Claims:', result.idTokenClaims);

            // Extract tenant ID and domain immediately after login
            if (result.account) {
                if (result.account.tenantId) {
                    setTenantId(result.account.tenantId);
                    console.log('Tenant ID extracted:', result.account.tenantId);
                }

                if (result.account.username) {
                    const domain = result.account.username.split('@')[1];
                    if (domain) {
                        setTenantDomainName(domain);
                        console.log('Domain extracted:', domain);
                    }
                }
            }

            setLoading(false);
            setCurrentStep(1); // Move to customer info step
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to sign in. Please try again.');
            setLoading(false);
        }
    };

    const initiateOnboarding = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build consent URL with the new parameters - using assistant license 0
            const consentClientId = 'afe66ddf-67d4-4d61-8a51-beca7b799f52';
            const redirectUrl = window.location.origin + '/onboarding'; // Changed to /onboarding
            const state = `InitialOnboarding`;

            // Build URL with proper parameter order and encoding
            const params = new URLSearchParams({
                tenantid: tenantId,
                clientId: consentClientId,
                assistantLicense: '0', // Changed to '0' as requested
                redirectUrl: redirectUrl,
                tenantName: tenantDomainName,
                tenantDomain: tenantDomainName,
                purpose: state,
                customerName: customerName
            });

            const url = `${CONSENT_URL_ENDPOINT}?${params.toString()}`;

            console.log('Building consent URL for assistant license 0');
            console.log('Consent ClientId:', consentClientId);
            console.log('Tenant ID:', tenantId);
            console.log('Domain:', tenantDomainName);
            console.log('Full consent URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                // Handle 409 Conflict specifically with detailed error message
                if (response.status === 409) {
                    const errorMessage = errorData
                        ? `${errorData.message || 'Customer already exists.'}\n${errorData.details || ''}\n${errorData.data || ''}`.trim()
                        : 'This customer is already onboarded.';
                    throw new Error(errorMessage);
                }

                throw new Error(errorData?.message || `Failed to initiate onboarding: ${response.statusText}`);
            }

            const result: ConsentResponse = await response.json();
            console.log('Consent URL received:', result);

            const stateFromUrl = extractStateFromConsentUrl(result.data.url);
            setConsentState(stateFromUrl || state);
            setConsentData(result);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initiate onboarding');
            setLoading(false);
            setCurrentStep(2);
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

            // The message listener will handle the success/error cases
            console.log('Consent window opened successfully, waiting for message...');
        } else {
            setError('Failed to open consent window. Please allow popups and try again.');
            setLoading(false);
        }
    };


    const handleConsentCallback = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Starting consent callback...');

            // Wait a moment for consent to be processed on the server side
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Call the callback endpoint WITHOUT authentication
            // The server will handle the consent verification using the state parameter
            const response = await fetch(
                `${CONSENT_CALLBACK}${consentState ? `?state=${consentState}` : ''}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                    // No Authorization header needed - the server uses the state parameter
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                // If consent wasn't found, it might not be completed yet
                if (response.status === 404 || response.status === 400) {
                    setError('Consent not completed. Please click "Retry Consent" to try again, or ensure you granted admin consent in the popup window.');
                    setLoading(false);
                    return;
                }

                throw new Error(errorData?.message || `Failed to complete onboarding: ${response.statusText}`);
            }

            // Handle response
            let result = null;
            if (response.status === 204) {
                result = {
                    status: 'success',
                    message: 'Onboarding completed successfully'
                };
            } else {
                try {
                    result = await response.json();
                } catch (parseError) {
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

            setCurrentStep(4);
            console.log('Onboarding completed successfully');

        } catch (err) {
            console.error('Consent callback error:', err);
            setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        if (consentWindow) {
            setConsentWindow(null);
        }

        setCurrentStep(0);
        setCustomerName('');
        setTenantId('');
        setTenantDomainName('');
        setError(null);
        setConsentData(null);
        setOnboardingResult(null);
        setConsentCompleted(false);
        onClose();
    };

    const handleComplete = () => {
        onSuccess();
        handleClose();
    };

    const isFormValid = validateCustomerName(customerName) && validateTenantId(tenantId) && validateDomainName(tenantDomainName);


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-[1400px] max-h-[80vh] overflow-y-auto absolute left-1/2 -translate-x-1/2"
                style={{
                    top: `${scrollPosition + 450}px`,
                    position: 'absolute'
                }}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
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
                <div className="relative flex items-center justify-between mb-6">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative">
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
                                <div
                                    className={`absolute top-4 h-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}
                                    style={{
                                        left: 'calc(50% + 1rem)',
                                        right: 'calc(-50% + 1rem)',
                                        zIndex: -1
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Step 0: Login */}
                    {currentStep === 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Sign In to Continue
                                </CardTitle>
                                <CardDescription>
                                    Sign in with your Microsoft account to consent to the Intune Assistant application
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LogIn className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Step 1: Initial Login & Consent</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Sign in to automatically detect your tenant information and consent to the first application.
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-4 px-4">
                                        After login, we'll automatically extract your <strong>Tenant ID</strong> and <strong>Domain</strong> from your account.
                                    </p>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-left max-w-md mx-auto">
                                        <div className="flex items-start gap-2">
                                            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs text-blue-900 dark:text-blue-100">
                                                <strong>Application ID:</strong> 3448bc04-cdbe-4a07-8e24-7e0e6f6980c1
                                                <br />
                                                <span className="text-blue-700 dark:text-blue-300">This is the primary Intune Assistant application</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="w-full max-w-xs mx-auto"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Sign In with Microsoft
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div className="whitespace-pre-line">{error}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 1: Customer & Tenant Information */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Customer & Tenant Details
                                </CardTitle>
                                <CardDescription>
                                    Enter the customer name and verify tenant information (auto-filled from your login)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoggedIn && tenantId && (
                                    <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4">
                                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong>Auto-detected from login:</strong> Tenant ID and Domain have been pre-filled using your account information.
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="e.g. Acme Corporation"
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter a friendly name for this customer
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="tenantId">Tenant ID *</Label>
                                    <Input
                                        id="tenantId"
                                        value={tenantId}
                                        onChange={(e) => setTenantId(e.target.value)}
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        readOnly={isLoggedIn && !!tenantId}
                                        className={isLoggedIn && tenantId ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}
                                    />
                                    {isLoggedIn && tenantId && (
                                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Automatically detected from your login
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tenantDomainName">Tenant Domain Name *</Label>
                                    <Input
                                        id="tenantDomainName"
                                        value={tenantDomainName}
                                        onChange={(e) => setTenantDomainName(e.target.value)}
                                        placeholder="contoso.onmicrosoft.com"
                                        className={isLoggedIn && tenantDomainName ? "bg-gray-50 dark:bg-gray-900" : ""}
                                    />
                                    {isLoggedIn && tenantDomainName && (
                                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Automatically detected from your login
                                        </p>
                                    )}
                                    {!tenantDomainName && (
                                        <p className="text-xs text-muted-foreground">
                                            If not auto-filled, enter your primary domain (e.g., contoso.onmicrosoft.com)
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div className="whitespace-pre-line">{error}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Validation */}
                    {currentStep === 2 && (
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
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm font-medium">Customer</span>
                                        <span className="text-sm text-muted-foreground">{customerName}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm font-medium">Tenant ID</span>
                                        <span className="text-sm text-muted-foreground font-mono">{tenantId}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm font-medium">Domain</span>
                                        <span className="text-sm text-muted-foreground">{tenantDomainName}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div className="whitespace-pre-line">{error}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Admin Consent */}
                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin Consent Required
                                </CardTitle>
                                <CardDescription>
                                    App iafe66ddf-67d4-4d61-8a51-beca7b799f52
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!consentData ? (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                        <div className="text-center">
                                            <p className="font-medium">Preparing consent...</p>
                                            <p className="text-sm text-muted-foreground">Building consent URL for Assistant License 0</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                                        Step 2: Assistant License Consent
                                                    </h4>
                                                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                                                        Click below to grant admin consent for <strong>Assistant License 0</strong> in a popup window.
                                                    </p>
                                                    <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                                        <p><strong>Application ID:</strong> afe66ddf-67d4-4d61-8a51-beca7b799f52</p>
                                                        <p><strong>License Type:</strong> Assistant License 0 (Basic tier)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={openConsentWindow}
                                            disabled={loading}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Waiting for consent...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    {error ? 'Retry Admin Consent' : 'Open Consent Window'}
                                                </>
                                            )}
                                        </Button>

                                        {loading && !error && (
                                            <div className="text-xs text-center text-muted-foreground">
                                                <p>A popup window should have opened. If not, please allow popups and try again.</p>
                                                <p className="mt-1">After granting consent, this window will automatically continue...</p>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="text-xs text-center text-muted-foreground">
                                                If you closed the popup after granting consent, the process will continue automatically.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 whitespace-pre-line">{error}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Completion */}
                    {currentStep === 4 && (
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
                        {currentStep === 4 ? 'Close' : 'Cancel'}
                    </Button>

                    <div className="flex gap-2">
                        {currentStep < 3 && (
                            <Button
                                onClick={handleNext}
                                disabled={currentStep === 1 && !isFormValid}
                            >
                                {currentStep === 0 ? 'Sign In' : currentStep === 2 ? 'Start Consent' : 'Next'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                        {currentStep === 4 && (
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