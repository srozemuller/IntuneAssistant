// hooks/useApiRequest.ts
import { useConsent } from "@/contexts/ConsentContext";
import { apiRequest, UserConsentRequiredError } from "@/lib/apiRequest";

export function useApiRequest() {
    const { showConsent } = useConsent();

    return async function<T>(...args: Parameters<typeof apiRequest<T>>): Promise<T | undefined> {
        try {
            return await apiRequest<T>(...args);
        } catch (err) {
            if (err instanceof UserConsentRequiredError) {
                showConsent(err.consentUrl);
                return;
            }
            throw err;
        }
    };
}