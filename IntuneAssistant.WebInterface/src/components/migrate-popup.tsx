import React, { useState, useEffect } from 'react';
import { legacyRequest, legacyMsalInstance } from '../authconfig';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

const MigrationPopup = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    useEffect(() => {
        const initializeMsal = async () => {
            await legacyMsalInstance.initialize();
        };
        initializeMsal();

        const hasOnboarded = sessionStorage.getItem('onboarded') === 'true';
        const isOnboardingPage = window.location.pathname.includes('/onboarding');
        const isFaqPage = window.location.pathname.includes('/faq');
        const isLegacy = sessionStorage.getItem('useLegacy') === 'true';
        const skipMigrate = sessionStorage.getItem('skipMigrate') === 'true';

        // Only show popup if:
        // 1. User is using legacy OR
        // 2. User is NOT using legacy but has NOT onboarded yet
        // AND in both cases:
        // - Not on onboarding or FAQ pages
        // - Not explicitly skipped with skipMigrate flag
        if (!hasOnboarded &&
            !isOnboardingPage &&
            !isFaqPage &&
            !skipMigrate) {
            setShowPopup(true);
        }

    }, []);

    const handleLogin = async () => {
        try {
            const loginResponse = await legacyMsalInstance.loginPopup(legacyRequest);
            const account = loginResponse.account;
            if (account) {
                const tokenResponse = await legacyMsalInstance.acquireTokenSilent({
                    ...legacyRequest,
                    account,
                });
                localStorage.setItem('accessToken', tokenResponse.accessToken);
                sessionStorage.setItem('isMigrating', true.toString());
                window.location.href = '/onboarding?status=migrate';
            }
            localStorage.setItem('isOnboarding', true.toString());
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleRedirect = () => {
        sessionStorage.setItem('isOnboarding', true.toString());
        window.location.href = '/onboarding';
    };

    const handleClose = () => {
        if (!acknowledged) {
            alert('Please acknowledge to close the popup.');
            return;
        }
        setShowPopup(false);
    };

    return (
        showPopup && (
            <Dialog open={showPopup} onOpenChange={handleClose}>
                <DialogTitle>New Application Update</DialogTitle>
                <DialogContent>
                    <div className="text-center">
                        <img src='/yellowblocks.png' alt="Assistant Icon" className="mx-auto mb-4" width="150" height="150" />
                        <p className="text-lg font-semibold">Intune Assistant is moving to a new enterprise app that is officially verified.</p>
                        <p className="text-md mt-2">Please walk through the onboarding process to onboard the new application</p>
                        <p className="text-md mt-4">
                            <a
                                href={`${window.location.origin}/docs/web/getting-started/migrate/`}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Read more about migration
                            </a>
                        </p>
                    </div>
                    <div className="mt-4">
                        <input
                            type="checkbox"
                            id="acknowledge"
                            checked={acknowledged}
                            onChange={(e) => {
                                setAcknowledged(e.target.checked);
                                if (e.target.checked) {
                                    sessionStorage.setItem('onboarded', 'true');
                                } else {
                                    sessionStorage.setItem('onboarded', 'false');
                                }
                            }}
                        />
                        <label htmlFor="acknowledge" className="ml-2">Check if you are already onboarded and close the popup</label>
                    </div>
                    <Button onClick={handleRedirect}>
                        Go to onboarding page
                    </Button>
                </DialogContent>
            </Dialog>
        )
    );
};

export default MigrationPopup;