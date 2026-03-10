// components/ConsentBanner.tsx
'use client';

import { useState } from 'react';
import { useConsent } from '@/contexts/ConsentContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ExternalLink, Minimize2, Maximize2, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { apiScope } from '@/lib/msalConfig';
import { IA_VERIFY_ENDPOINT } from '@/lib/constants';

interface ConsentVerifyResponse {
    status: number;
    message: string;
    details: { consentUrl: string };
    data: { hasAllPermissions: boolean; requiredPermissions: string[]; missingPermissions: string[] };
}

export function ConsentBanner() {
    const { needsConsent, consentUrl, requiredPermissions, isMinimized, minimize, maximize, setConsentNeeded, clearConsent } = useConsent();
    const { instance, accounts } = useMsal();
    const { request } = useApiRequest();
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [consentDone, setConsentDone] = useState(false);

    if (!needsConsent || !consentUrl) {
        return null;
    }

    const handleConsentReturn = async () => {
        setVerifying(true);
        setVerifyError(null);
        try {
            // Force-refresh the MSAL token so new permissions are picked up
            await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0],
                forceRefresh: true,
            });

            // Re-verify with the backend
            const response = await request<ConsentVerifyResponse>(
                IA_VERIFY_ENDPOINT,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            const payload = response?.data;

            if (payload?.status === 0) {
                // All permissions granted — clear session flag and hide banner
                sessionStorage.removeItem('ia_consent_verified');
                setConsentDone(true);
                setTimeout(() => clearConsent(), 1500);
            } else if (payload?.status === 3) {
                // Still missing permissions
                setConsentNeeded(
                    payload.details?.consentUrl || consentUrl,
                    payload.data?.requiredPermissions || []
                );
                setVerifyError('Some permissions are still missing. Please try granting consent again.');
            } else {
                setVerifyError('Could not verify consent status. Please refresh the page.');
            }
        } catch {
            setVerifyError('Failed to verify permissions. Please refresh the page.');
        } finally {
            setVerifying(false);
        }
    };

    const handleGrantConsent = () => {
        setVerifyError(null);
        const popup = window.open(
            consentUrl,
            'consent',
            'width=600,height=700,scrollbars=yes,resizable=yes,location=yes,toolbar=yes'
        );

        if (popup) {
            popup.focus();
            // Poll until popup closes, then re-verify
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    handleConsentReturn();
                }
            }, 1000);
        } else {
            alert('Please allow popups for this site to grant consent.');
        }
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
                <button
                    onClick={maximize}
                    className="flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm hover:bg-amber-600/90 text-white px-4 py-3 rounded-lg shadow-lg border border-amber-400/20 transition-all hover:scale-105"
                >
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Admin Consent Required</span>
                    <Maximize2 className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 md:left-64 right-0 z-40 animate-in slide-in-from-top-2 transition-all duration-300 sidebar-collapsed:md:left-16">
            <div className="bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-amber-50/95 dark:from-amber-950/95 dark:via-orange-950/95 dark:to-amber-950/95 backdrop-blur-md border-b border-amber-200/50 dark:border-amber-800/50 shadow-lg">
                <div className="px-4 py-4">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 mt-1">
                            <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-2 border border-amber-200 dark:border-amber-800">
                                <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            {consentDone ? (
                                <div className="flex items-center gap-2 py-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-green-800 dark:text-green-200 font-medium">
                                        Permissions granted successfully! Closing…
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Admin Consent Required</h3>
                                        <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">Action Required</Badge>
                                    </div>

                                    <p className="text-amber-800 dark:text-amber-200 mb-3">
                                        Intune Assistant needs additional permissions to function properly. Please grant admin consent to continue using the application.
                                    </p>

                                    {requiredPermissions.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">Required Permissions:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {requiredPermissions.slice(0, 5).map((permission) => (
                                                    <Badge
                                                        key={permission}
                                                        variant="outline"
                                                        className="text-xs bg-white/50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                                                    >
                                                        {permission}
                                                    </Badge>
                                                ))}
                                                {requiredPermissions.length > 5 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs bg-white/50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                                                    >
                                                        +{requiredPermissions.length - 5} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {verifyError && (
                                        <p className="text-sm text-red-700 dark:text-red-400 mb-3">{verifyError}</p>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md"
                                            onClick={handleGrantConsent}
                                            disabled={verifying}
                                        >
                                            {verifying ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Verifying…
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Grant Consent
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                                            onClick={() => navigator.clipboard.writeText(consentUrl)}
                                            disabled={verifying}
                                        >
                                            Copy URL
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 h-8 w-8 p-0"
                                onClick={minimize}
                                title="Minimize"
                                disabled={verifying}
                            >
                                <Minimize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

