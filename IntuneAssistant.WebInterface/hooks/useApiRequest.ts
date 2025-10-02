// hooks/useApiRequest.ts
import { useRef, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useConsent } from "@/contexts/ConsentContext";
import { useTenant } from "@/contexts/TenantContext";
import { apiRequest, UserConsentRequiredError } from "@/lib/apiRequest";
import { apiScope } from '@/lib/msalConfig';

export function useApiRequest() {
    const { instance, accounts } = useMsal();
    const { showConsent } = useConsent();
    const { selectedTenant } = useTenant();
    const abortControllerRef = useRef<AbortController | null>(null);

    const request = useCallback(async function<T>(
        url: string,
        options: RequestInit = {}
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
                showConsent(err.consentUrl);
                return;
            }
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
