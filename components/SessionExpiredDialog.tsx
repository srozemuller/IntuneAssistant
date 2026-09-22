// components/SessionExpiredDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import {
    EventMessage,
    EventType,
    InteractionRequiredAuthError,
    InteractionType,
} from '@azure/msal-browser';
import { Clock, LogIn } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiScope } from '@/lib/msalConfig';

/**
 * Central recovery for an expired Entra session.
 *
 * Every `acquireTokenSilent` call in the app (useApiRequest and the handful of direct callers)
 * throws `InteractionRequiredAuthError` once the Microsoft session behind the cached refresh
 * token is gone (e.g. AADSTS160021 the morning after). Instead of each caller surfacing the raw
 * MSAL error and leaving the user to figure out "log out, log in", we listen to MSAL's own
 * `acquireTokenFailure` event — emitted for every silent failure regardless of call site — and
 * show one blocking dialog with a single "Sign in again" action that redirects through Entra
 * and lands the user back on the page they were on.
 */
export function SessionExpiredDialog() {
    const { instance, accounts } = useMsal();
    const [expired, setExpired] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        const callbackId = instance.addEventCallback((event: EventMessage) => {
            if (event.eventType !== EventType.ACQUIRE_TOKEN_FAILURE) return;
            // Only silent renewals. Popup/redirect failures are user-initiated flows (e.g. the
            // consent banner's re-authenticate popup) that handle their own errors.
            if (event.interactionType !== InteractionType.Silent) return;
            if (!(event.error instanceof InteractionRequiredAuthError)) return;

            console.warn('[SessionExpired] Silent token renewal requires interaction:', event.error.errorCode);
            setExpired(true);
        });

        return () => {
            if (callbackId) instance.removeEventCallback(callbackId);
        };
    }, [instance]);

    // Interactive re-login straight from the dialog — no trip to the sidebar's sign-out/sign-in.
    // Entra prompts for the same account (hinted) and MSAL brings the user back to the page
    // they were on. If the token redirect is refused (e.g. an interaction is already pending),
    // fall back to a full login redirect so the user is never stuck on the dialog.
    const handleSignInAgain = async () => {
        setRedirecting(true);
        const account = accounts[0];
        const redirectStartPage = window.location.href;
        try {
            await instance.acquireTokenRedirect({
                scopes: [apiScope],
                account,
                loginHint: account?.username,
                redirectStartPage,
            });
        } catch (err) {
            console.warn('[SessionExpired] acquireTokenRedirect failed, falling back to loginRedirect', err);
            try {
                await instance.loginRedirect({
                    scopes: [apiScope],
                    loginHint: account?.username,
                    redirectStartPage,
                });
            } catch (loginErr) {
                console.error('[SessionExpired] Redirect to sign-in failed', loginErr);
                setRedirecting(false);
            }
        }
    };

    return (
        <AlertDialog open={expired}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <AlertDialogTitle>Your session has expired</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        For security, Microsoft signs you out after a period of inactivity.
                        Sign in again to continue where you left off.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleSignInAgain} disabled={redirecting}>
                        <LogIn className="h-4 w-4 mr-2" />
                        {redirecting ? 'Redirecting…' : 'Sign in again'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
