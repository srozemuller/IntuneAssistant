// hooks/useApiRequest.ts
import { useRef, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useConsent } from "@/contexts/ConsentContext";
import { useTenant } from "@/contexts/TenantContext";
import { apiRequest } from "@/lib/apiRequest";
import { apiScope } from '@/lib/msalConfig';
import { UserConsentRequiredError } from '@/lib/errors';

export function useApiRequest() {
    const { instance, accounts } = useMsal();
    const { showConsent } = useConsent();
    const { selectedTenant } = useTenant();
    const abortControllerRef = useRef<AbortController | null>(null);

    const request = useCallback(async function<T>(
        url: string,
        options: RequestInit = {},
        onConsentComplete?: () => Promise<T>
    ): Promise<T | undefined> {
        // Cancel previous request if still running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
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
                });
                accessToken = response.accessToken;
            }

            // Add tenant header and signal to options
            const requestOptions = {
                ...options,
                signal: abortControllerRef.current.signal,
                headers: {
                    ...options.headers,
                    ...(selectedTenant && { 'X-Tenant-ID': selectedTenant.tenantId })
                }
            };

            return await apiRequest<T>(url, requestOptions, accessToken);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            if (err instanceof UserConsentRequiredError) {
                console.log("Consent required, showing consent dialog with URL:", err.consentUrl);
                // Pass the callback to be executed after consent is complete
                showConsent(err.consentUrl, onConsentComplete ?
                    async () => {
                        try {
                            // Re-attempt the request after consent is given
                            if (onConsentComplete) {
                                return await onConsentComplete();
                            }
                        } catch (retryError) {
                            console.error("Error retrying request after consent:", retryError);
                            throw retryError;
                        }
                    } : undefined
                );
                return;
            }

            // Rethrow all other errors
            throw err;
        }
    }, [instance, accounts, showConsent, selectedTenant]);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    return { request, cancel };
}
