// components/ConsentDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { apiScope } from '@/lib/msalConfig';

interface ConsentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    consentUrl: string;
    onConsentComplete: () => void;
    clearError?: boolean; // New prop to clear error from parent
}

export function ConsentDialog({ isOpen, onClose, consentUrl, onConsentComplete, clearError = false }: ConsentDialogProps) {
    const { instance, accounts } = useMsal();
    const [isWaiting, setIsWaiting] = useState(false);
    const [consentCompleted, setConsentCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when dialog opens or consent URL changes
    useEffect(() => {
        if (isOpen) {
            setIsWaiting(false);
            setConsentCompleted(false);
            setError(null);
        }
    }, [isOpen, consentUrl]);

    // Clear error when parent indicates success
    useEffect(() => {
        if (clearError) {
            setError(null);
        }
    }, [clearError]);

    const handleConsentClick = () => {
        setError(null);
        setIsWaiting(true);

        const popup = window.open(consentUrl, 'consent', 'width=600,height=700,scrollbars=yes,resizable=yes');

        const checkClosed = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkClosed);
                handleConsentReturn();
            }
        }, 1000);
    };

    const handleConsentReturn = async () => {
        try {
            setIsWaiting(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const tokenResponse = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0],
                forceRefresh: true
            });

            if (tokenResponse.accessToken) {
                setConsentCompleted(true);
                setTimeout(() => {
                    setIsWaiting(false);
                    onConsentComplete();
                    onClose();
                }, 2000);
            } else {
                throw new Error('Failed to obtain fresh token');
            }

        } catch (error) {
            console.error('Consent verification failed:', error);
            setIsWaiting(false);
            setConsentCompleted(false);
            setError('Consent was not completed successfully. Please try again or contact support if the issue persists.');
        }
    };

    const handleClose = () => {
        if (!isWaiting) {
            setIsWaiting(false);
            setConsentCompleted(false);
            setError(null);
            onClose();
        }
    };

    const handleRetry = () => {
        setError(null);
        handleConsentClick();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Additional Permissions Required
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {error ? (
                        <>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800">
                                        <p className="font-medium mb-1">Consent Failed</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={handleRetry}
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    ) : !consentCompleted ? (
                        <>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Admin consent required</p>
                                        <p>To perform this migration, additional permissions are needed. An administrator must grant these permissions.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Required permissions:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• DeviceManagementConfiguration.ReadWrite.All</li>
                                    <li>• DeviceManagementApps.ReadWrite.All</li>
                                    <li>• DeviceManagementServiceConfig.ReadWrite.All</li>
                                    <li>• DeviceManagementScripts.ReadWrite.All</li>
                                </ul>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={handleConsentClick}
                                    disabled={isWaiting}
                                    className="flex-1"
                                >
                                    {isWaiting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Waiting for consent...
                                        </div>
                                    ) : (
                                        <>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Grant Permissions
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isWaiting}
                                >
                                    Cancel
                                </Button>
                            </div>

                            {isWaiting && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        Please complete the consent process in the popup window. This dialog will automatically close when done.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="font-medium text-green-800 mb-2">Consent Completed!</h3>
                            <p className="text-sm text-green-600">Permissions granted successfully. Returning to migration...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
