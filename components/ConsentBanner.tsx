// components/ConsentBanner.tsx
'use client';

import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useConsent } from '@/contexts/ConsentContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, LogIn, Copy, Minimize2, Maximize2, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { IA_VERIFY_ENDPOINT } from '@/lib/constants';

interface ConsentVerifyResponse {
    status: number;
    message: string;
    details: { consentUrl: string };
    data: { hasAllPermissions: boolean; requiredPermissions: string[]; missingPermissions: string[] };
}

export function ConsentBanner() {
    const { needsConsent, consentUrl, requiredPermissions, isMinimized, minimize, maximize, setConsentNeeded, clearConsent } = useConsent();
    const { request } = useApiRequest();
    const { instance, accounts } = useMsal();
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [consentDone, setConsentDone] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Don't show consent banner on auth/onboarding pages - let users complete registration first!
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path === '/auth/verify' || path.startsWith('/onboarding')) {
            console.log('[ConsentBanner] Hidden on auth/onboarding page:', path);
            return null;
        }
    }

    if (!needsConsent || !consentUrl) {
        return null;
    }

    const handleConsentReturn = async () => {
        setVerifying(true);
        setVerifyError(null);
        try {
            // Re-verify with the backend, forcing a fresh token so new permissions are included
            const response = await request<ConsentVerifyResponse>(
                IA_VERIFY_ENDPOINT,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } },
                true  // forceTokenRefresh — ensures post-consent token carries new scopes
            );

            const payload = response?.data;

            if (payload?.status === 0) {
                // All permissions granted — mark session as verified so VerifyConsentOnMount won't re-run
                sessionStorage.setItem('ia_consent_verified', 'true');
                setConsentDone(true);
                setTimeout(() => clearConsent(), 1500);
            } else if (payload?.status === 3) {
                // Still missing permissions — show only the ones that are actually missing
                const missing = payload.data?.missingPermissions?.length
                    ? payload.data.missingPermissions
                    : payload.data?.requiredPermissions || [];
                setConsentNeeded(payload.details?.consentUrl || consentUrl, missing);
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

    // Self-service: re-authenticate this browser session with the missing scopes. Works only if
    // the signed-in account has rights to consent — if not, Entra shows its own "ask your admin"
    // screen and this fails gracefully, pointing the user at the copy-link fallback below.
    const handleReAuthenticate = async () => {
        if (!accounts.length) return;
        setVerifying(true);
        setVerifyError(null);
        try {
            await instance.acquireTokenPopup({
                scopes: requiredPermissions,
                account: accounts[0],
            });
            // Popup completed — re-verify with the backend to confirm and clear the banner
            await handleConsentReturn();
        } catch (err) {
            console.error('Re-authentication failed', err);
            setVerifyError(
                err instanceof InteractionRequiredAuthError
                    ? 'Your account can\'t grant these permissions. Use "Copy link for your admin" below to send this to someone who can.'
                    : 'Re-authentication was cancelled or failed. You can try again, or use "Copy link for your admin" below.'
            );
            setVerifying(false);
        }
    };

    // Hand-off: the consent URL can be opened by anyone with the right Entra role, even someone
    // who has never signed into IntuneAssistant — useful when the signed-in user relies on a
    // separate security/IT team to grant admin consent.
    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(consentUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
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
                                        IntuneAssistant needs a few more read-only permissions to show your data. Ask a Global Administrator to approve them.
                                        If an admin already granted consent elsewhere, use &quot;Check again&quot;.
                                    </p>

                                    {requiredPermissions.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">Missing permissions:</p>
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
                                            onClick={handleReAuthenticate}
                                            disabled={verifying}
                                        >
                                            {verifying ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Verifying…
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    Re-authenticate
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                                            onClick={handleConsentReturn}
                                            disabled={verifying}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${verifying ? 'animate-spin' : ''}`} />
                                            Check again
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                                            onClick={handleCopyLink}
                                            disabled={verifying}
                                        >
                                            {linkCopied ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy link for your admin
                                                </>
                                            )}
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

