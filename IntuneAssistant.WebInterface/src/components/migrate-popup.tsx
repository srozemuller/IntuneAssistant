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

        const hasOnboarded = localStorage.getItem('onboarded') === 'true';
        const isOnboardingPage = window.location.pathname.includes('/onboarding');

        if (!hasOnboarded && !localStorage.getItem('isOnboarding') && !isOnboardingPage) {
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
                window.location.href = '/onboarding?status=migrate';
            }
            localStorage.setItem('isOnboarding', true.toString());
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleRedirect = () => {
        localStorage.setItem('isOnboarding', true.toString());
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
                        <p className="text-md mt-2">If you are here for the first time, use the onboarding process.</p>
                        <p className="text-md mt-2">If you have onboarded earlier, go to the migration page.</p>
                        <div className="mt-4">
                            <input
                                type="checkbox"
                                id="acknowledge"
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                            />
                            <label htmlFor="acknowledge" className="ml-2">Skip for now</label>
                        </div>
                    </div>
                    <Button onClick={handleLogin}>
                        Go to migration page
                    </Button>
                    <Button onClick={handleRedirect}>
                        Go to onboarding page
                    </Button>
                </DialogContent>
                <DialogFooter>
                    <Button onClick={handleClose}>
                        Close
                    </Button>
                </DialogFooter>
            </Dialog>
        )
    );
};

export default MigrationPopup;