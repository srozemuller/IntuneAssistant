// src/components/with-onboarded-check.tsx
import React, { useEffect, useState } from 'react';
import { checkTenantOnboardingStatus } from './onboarded-check';
import authService from '../auth/msalservice';
import type { OnboardingStatus } from './onboarded-check';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function withOnboardingCheck<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return (props: P) => {
        const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
        const [needsMigration, setNeedsMigration] = useState(false);
        const [showDialog, setShowDialog] = useState(false);
        const [showConsentDialog, setShowConsentDialog] = useState(false);
        const [loading, setLoading] = useState(true);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);

        useEffect(() => {
            const checkAuthAndOnboarding = async () => {
                try {
                    // Check authentication first
                    const isLoggedIn = authService.isLoggedIn();
                    console.log("logged in: ", isLoggedIn);
                    setIsAuthenticated(isLoggedIn);

                    // Only check onboarding status if authenticated
                    if (isLoggedIn) {
                        const status = await checkTenantOnboardingStatus();
                        setOnboardingStatus(status);
                        console.log("needsMigration", status);
                        if (status.needsMigration) {
                            setNeedsMigration(true);
                            setShowConsentDialog(true);

                        }
                        else {
                            // Only show onboarding dialog for authenticated users who aren't onboarded
                            setShowDialog(!status.isOnboarded);
                        }
                    }
                } catch (error) {
                    console.error('Error checking status:', error);

                    // Check if the error contains the specific migration message
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    setErrorMessage(errorMsg);
                    toast.error('Failed to verify status');
                } finally {
                    setLoading(false);
                }
            };

            checkAuthAndOnboarding();
        }, []);

        const handleOnboarding = () => {
            if (onboardingStatus?.tenantId) {
                window.location.href = `/onboarding?tenantId=${onboardingStatus.tenantId}`;
            } else {
                window.location.href = '/onboarding';
            }
        };

        const handleLogin = () => {
            authService.login();
        };

        const handleConsent = () => {
            // Redirect to the consent URL

            const currentDomain = window.location.hostname;
            const protocol = window.location.protocol;
            const port = window.location.port ? `:${window.location.port}` : '';
            window.location.href = `${protocol}//${currentDomain}${port}/onboarding?status=migrate`;
        };

        // Show loading while checking
        if (loading) {
            return <div className="flex items-center justify-center h-screen">Loading...</div>;
        }

        // First check: Is the user authenticated?
        if (!isAuthenticated) {
            return (
                <div className="container max-w-[95%] py-6">
                    <div className="border border-blue-300 bg-blue-50 p-4 rounded-md mb-4">
                        <h3 className="text-lg font-medium text-blue-800">Authentication Required</h3>
                        <p className="text-blue-700">
                            Please sign in to access this feature.
                        </p>
                        <Button onClick={handleLogin} className="mt-2">
                            Sign In
                        </Button>
                    </div>
                </div>
            );
        }

        // // Show consent dialog if the tenant needs new consent
        // if (isAuthenticated && needsMigration) {
        //     return (
        //         <>
        //             <div className="container max-w-[95%] py-6">
        //                 <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-md mb-4">
        //                     <h3 className="text-lg font-medium text-yellow-800">Application Update Required</h3>
        //                     <p className="text-yellow-700">
        //                         Your tenant needs to walk through to the updated application.
        //                     </p>
        //                     <Button onClick={handleConsent} className="mt-2">
        //                         Go to migration page
        //                     </Button>
        //                 </div>
        //             </div>
        //             {showConsentDialog && (
        //             <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        //                 <DialogTitle>Application Update Required</DialogTitle>
        //                 <DialogContent>
        //                     <p>This tenant needs to provide consent to the updated application before you can proceed.</p>
        //                     {errorMessage && (
        //                         <p className="text-sm text-gray-500 mt-2">
        //                             Error details: {errorMessage}
        //                         </p>
        //                     )}
        //                 </DialogContent>
        //                 <DialogFooter>
        //                     <Button variant="secondary" onClick={() => setShowConsentDialog(false)}>
        //                         Cancel
        //                     </Button>
        //                     <Button onClick={handleConsent}>
        //                         Go to migration page
        //                     </Button>
        //                 </DialogFooter>
        //             </Dialog>
        //                 )}
        //             <Component {...props} />
        //         </>
        //     );
        // }

        // Second check: Is the tenant onboarded? (Only runs if authenticated)
        if (isAuthenticated && onboardingStatus && !onboardingStatus.isOnboarded) {
            return (
                <>
                    <div className="container max-w-[95%] py-6">
                        <div className="border border-red-300 bg-red-50 p-4 rounded-md mb-4">
                            <h3 className="text-lg font-medium text-red-800">Tenant Not Onboarded</h3>
                            <p className="text-red-700">
                                Your tenant needs to be onboarded before you can use this feature.
                            </p>
                            <Button onClick={handleOnboarding} className="mt-2">
                                Go to Onboarding
                            </Button>
                        </div>
                    </div>

                    {showDialog && (
                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                            <DialogTitle>Tenant Not Onboarded</DialogTitle>
                            <DialogContent>
                                <p>This tenant needs to be onboarded before you can use this feature.</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Tenant ID: {onboardingStatus.tenantId}
                                    {onboardingStatus.tenantName && <span> ({onboardingStatus.tenantName})</span>}
                                </p>
                            </DialogContent>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setShowDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleOnboarding}>
                                    Go to Onboarding
                                </Button>
                            </DialogFooter>
                        </Dialog>
                    )}
                </>
            );
        }

        // User is authenticated and tenant is onboarded - render the protected component
        return <Component {...props} />;
    };
}