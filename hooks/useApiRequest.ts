// hooks/useApiRequest.ts
'use client';

import { useRef, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { apiRequest, ApiError, ApiResponseWithCorrelation } from "@/lib/apiRequest";
import { apiScope } from '@/lib/msalConfig';
import { UserConsentRequiredError } from '@/lib/errors';
import { useError } from '@/contexts/ErrorContext';
import { useConsent } from '@/contexts/ConsentContext';

// Consent URLs carry the missing scopes as a space-separated `scope` query param —
// pull them out so the ConsentBanner can list what's actually missing.
function extractScopesFromConsentUrl(url: string): string[] {
    try {
        const scope = new URL(url).searchParams.get('scope');
        return scope ? scope.split(' ').filter(Boolean) : [];
    } catch {
        return [];
    }
}

export function useApiRequest() {
    const { instance, accounts } = useMsal();
    const { showError, clearError } = useError();
    const { setConsentNeeded } = useConsent();
    const abortControllerRef = useRef<AbortController | null>(null);

    const request = useCallback(async function<T>(
        url: string,
        options: RequestInit = {},
        forceTokenRefresh = false
    ): Promise<ApiResponseWithCorrelation<T> | undefined> {
        // Cancel previous request if still running
        clearError();

        if (abortControllerRef.current) {
            abortControllerRef.current.abort(new DOMException('Superseded by newer request', 'AbortError'));
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
            // Get access token
            let accessToken: string | undefined;
            if (accounts.length > 0) {
                const response = await instance.acquireTokenSilent({
                    scopes: [apiScope],
                    account: accounts[0],
                    forceRefresh: forceTokenRefresh,
                });
                accessToken = response.accessToken;
            }

            const requestOptions = {
                ...options,
                signal: abortControllerRef.current.signal,
            };

            return await apiRequest<T>(url, requestOptions, accessToken);
        } catch (err) {
            if ((err as { name?: string })?.name === 'AbortError') {
                return;
            }

            if (err instanceof InteractionRequiredAuthError) {
                // Expired Entra session (e.g. AADSTS160021). SessionExpiredDialog listens to MSAL's
                // acquireTokenFailure event and takes over with a "Sign in again" prompt — don't
                // also dump the raw MSAL error into the global error banner.
                return;
            }

            if (err instanceof UserConsentRequiredError) {
                console.log("Consent required, showing consent banner with URL:", err.consentUrl);
                // Route through the same banner as the login-time verify check, instead of a
                // dead-end toast — gives the user the actual missing scopes and a way to act on them.
                setConsentNeeded(err.consentUrl, extractScopesFromConsentUrl(err.consentUrl));
                return;
            }

            // Handle ApiError with correlation ID
            let errorMessage = err instanceof Error ? err.message : 'An error occurred';

            if (err instanceof ApiError && err.correlationId) {
                errorMessage = `${errorMessage} (Correlation ID: ${err.correlationId})`;
                console.log('Error with correlation ID:', err.correlationId);
            }

            // Show error through global error handler
            showError(errorMessage);

            return;
        }
    }, [instance, accounts, showError, clearError, setConsentNeeded]);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    return { request, cancel };
}
