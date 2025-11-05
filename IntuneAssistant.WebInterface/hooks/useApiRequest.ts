// hooks/useApiRequest.ts
import { useRef, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useConsent } from "@/contexts/ConsentContext";
import { useTenant } from "@/contexts/TenantContext";
import { apiRequest, ApiError } from "@/lib/apiRequest";
import { apiScope } from '@/lib/msalConfig';
import { UserConsentRequiredError } from '@/lib/errors';
import { useError } from '@/contexts/ErrorContext';

export function useApiRequest() {
    const { instance, accounts } = useMsal();
    const { showConsent } = useConsent();
    const { showError, clearError } = useError();
    const { selectedTenant } = useTenant();
    const abortControllerRef = useRef<AbortController | null>(null);

    const request = useCallback(async function<T>(
        url: string,
        options: RequestInit = {},
        onConsentComplete?: () => Promise<T>
    ): Promise<T | undefined> {
        // Cancel previous request if still running
        clearError();

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
                showConsent(err.consentUrl, onConsentComplete ?
                    async () => {
                        try {
                            return await onConsentComplete();
                        } catch (retryError) {
                            console.error("Error retrying request after consent:", retryError);
                            const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Retry failed';
                            showError(retryErrorMessage);
                        }
                    } : undefined
                );
                return;
            }

            // Handle ApiError with correlation ID
            let errorMessage = err instanceof Error ? err.message : 'An error occurred';

            if (err instanceof ApiError && err.correlationId) {
                errorMessage = `${errorMessage} (Correlation ID: ${err.correlationId})`;
                console.log('Error with correlation ID:', err.correlationId);
            }

            // Show error through global error handler
            showError(errorMessage, onConsentComplete ? async () => {
                try {
                    return await onConsentComplete();
                } catch (retryError) {
                    console.error("Error retrying request after consent:", retryError);
                    const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Retry failed';
                    showError(retryErrorMessage);
                }
            } : undefined);

            return;
        }
    }, [instance, accounts, showConsent, selectedTenant, showError, clearError]);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    return { request, cancel };
}
