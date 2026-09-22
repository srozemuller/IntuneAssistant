'use client';

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';

type VerificationStatus = 'checking' | 'customer_exists' | 'needs_onboarding' | 'needs_tenant' | 'error';

export default function AuthVerifyPage() {
    const { instance, accounts, inProgress } = useMsal();
    const router = useRouter();
    const [status, setStatus] = useState<VerificationStatus>('checking');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const verifyCustomer = async () => {
            // MSAL is still processing the redirect response — accounts are not populated yet.
            if (inProgress !== InteractionStatus.None) return;

            if (accounts.length === 0) {
                // Not authenticated - redirect to login
                console.log('[Auth Verify] No authenticated account found, redirecting to home');
                router.push('/');
                return;
            }

            console.log('[Auth Verify] Verifying customer registration for user:', accounts[0].username);

            // Same call and shape as CustomerContext.fetchCustomerData: a plain fetch against the
            // API (not useApiRequest) so a 404 for a not-yet-registered customer is handled here
            // instead of surfacing in the global error banner.
            try {
                const token = await instance.acquireTokenSilent({ scopes: [apiScope], account: accounts[0] });
                const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/overview`, {
                    headers: {
                        Authorization: `Bearer ${token.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (apiResponse.status === 404) {
                    setStatus('needs_onboarding');
                    setTimeout(() => router.push('/onboarding/register'), 1500);
                    return;
                }
                if (!apiResponse.ok) {
                    throw new Error(`Failed to verify registration: ${apiResponse.status} ${apiResponse.statusText}`);
                }

                const result: { data?: { id?: string; tenants?: { id: string }[] } | null } = await apiResponse.json();
                if (result.data?.id) {
                    const hasTenants = (result.data.tenants?.length ?? 0) > 0;
                    if (hasTenants) {
                        setStatus('customer_exists');
                        setTimeout(() => router.push('/'), 1000);
                    } else {
                        setStatus('needs_tenant');
                        setTimeout(() => router.push('/onboarding/tenant'), 1500);
                    }
                } else {
                    setStatus('needs_onboarding');
                    setTimeout(() => router.push('/onboarding/register'), 1500);
                }
            } catch (err) {
                if (err instanceof InteractionRequiredAuthError) {
                    // SessionExpiredDialog handles this centrally (see AGENTS.md).
                    return;
                }
                console.error('[Auth Verify] Verification failed:', err);
                setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
                setStatus('error');
            }
        };

        verifyCustomer();
    }, [accounts, inProgress, instance, router]);

    const handleStartOnboarding = () => {
        router.push(status === 'needs_tenant' ? '/onboarding/tenant' : '/onboarding/register');
    };

    const handleRetry = () => {
        setStatus('checking');
        window.location.reload();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    {status === 'checking' && (
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
                            <CardTitle>Verifying Registration</CardTitle>
                            <CardDescription>
                                Checking your registration status...
                            </CardDescription>
                        </div>
                    )}

                    {status === 'customer_exists' && (
                        <div className="text-center">
                            <div className="h-12 w-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                                <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
                            </div>
                            <CardTitle>Welcome Back!</CardTitle>
                            <CardDescription>
                                Redirecting you to the dashboard...
                            </CardDescription>
                        </div>
                    )}

                    {status === 'needs_onboarding' && (
                        <div className="text-center">
                            <div className="h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                            </div>
                            <CardTitle>Registration Required</CardTitle>
                            <CardDescription>
                                Redirecting you to create your account...
                            </CardDescription>
                        </div>
                    )}

                    {status === 'needs_tenant' && (
                        <div className="text-center">
                            <div className="h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                            </div>
                            <CardTitle>Connect Your Tenant</CardTitle>
                            <CardDescription>
                                Account found. Redirecting you to connect your Microsoft tenant...
                            </CardDescription>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="h-12 w-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle>Verification Failed</CardTitle>
                            <CardDescription>
                                We encountered an issue while verifying your registration.
                            </CardDescription>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {(status === 'needs_onboarding' || status === 'needs_tenant') && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    You&apos;ll be redirected in a moment. If you&apos;re not redirected automatically,{' '}
                                    <button
                                        onClick={handleStartOnboarding}
                                        className="text-blue-600 hover:underline font-semibold"
                                    >
                                        click here
                                    </button>.
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    {errorMessage}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Button 
                                    onClick={handleRetry}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                                
                                <Button 
                                    onClick={handleStartOnboarding}
                                    className="w-full"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Proceed to Onboarding
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

