'use client';

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApiRequest } from '@/hooks/useApiRequest';

type VerificationStatus = 'checking' | 'customer_exists' | 'needs_onboarding' | 'error';

export default function AuthVerifyPage() {
    const { accounts } = useMsal();
    const router = useRouter();
    const { request } = useApiRequest();
    const [status, setStatus] = useState<VerificationStatus>('checking');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const verifyCustomer = async () => {
            if (accounts.length === 0) {
                // Not authenticated - redirect to login
                console.log('[Auth Verify] No authenticated account found, redirecting to home');
                router.push('/');
                return;
            }

            console.log('[Auth Verify] Verifying customer registration for user:', accounts[0].username);
            console.log('[Auth Verify] Calling /customer/overview...');

            try {
                // Call the customer overview API to check if customer exists
                const response = await request<{
                    status: string;
                    message: string;
                    data: {
                        id: string;
                        isActive: boolean;
                    } | null;
                }>('/customer/overview');

                console.log('[Auth Verify] API Response received:', response);

                // Check if we have valid customer data
                if (response?.data?.data && response.data.data.id) {
                    // Customer exists and is registered
                    console.log('[Auth Verify] ✅ Customer exists with ID:', response.data.data.id);
                    console.log('[Auth Verify] Redirecting to dashboard in 1 second...');
                    setStatus('customer_exists');
                    
                    // Redirect to main page after brief delay
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                } else {
                    // Response received but no customer data
                    console.log('[Auth Verify] ❌ No customer data in response, needs onboarding');
                    console.log('[Auth Verify] Redirecting to onboarding in 1.5 seconds...');
                    setStatus('needs_onboarding');
                    
                    // Auto-redirect to onboarding after brief delay
                    setTimeout(() => {
                        router.push('/onboarding/customer');
                    }, 1500);
                }
            } catch (error) {
                // API call failed - this is expected for non-existent customers (404)
                console.log('[Auth Verify] ❌ API call failed (expected for new customers)');
                console.log('[Auth Verify] Error details:', error);
                
                // Any error when checking customer = customer doesn't exist = needs onboarding
                // This includes: 404, network errors, no response, etc.
                console.log('[Auth Verify] Treating as: Customer not registered');
                console.log('[Auth Verify] Redirecting to onboarding in 1.5 seconds...');
                
                setStatus('needs_onboarding');
                
                // Auto-redirect to onboarding
                setTimeout(() => {
                    console.log('[Auth Verify] Executing redirect to /onboarding/customer');
                    router.push('/onboarding/customer');
                }, 1500);
            }
        };

        verifyCustomer();
    }, [accounts, router, request]);

    const handleStartOnboarding = () => {
        router.push('/onboarding/customer');
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
                                {errorMessage ? 'Unable to verify registration. ' : ''}
                                Redirecting you to complete the registration process...
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
                    {status === 'needs_onboarding' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    You'll be redirected to the registration page in a moment. If you're not redirected automatically,{' '}
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

