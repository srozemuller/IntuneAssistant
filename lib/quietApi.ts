import type { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { apiRequest } from '@/lib/apiRequest';
import { apiScope } from '@/lib/msalConfig';

/**
 * A GET for something that decorates a page that has its own job. It does not go through useApiRequest, whose error path shows the global
 * error banner and whose every call clears the banner the page is showing. Any failure (the endpoint does not exist yet because the
 * frontend was deployed before the API, a missing role, a missing consent, a network error) resolves to null and the caller shows nothing.
 */
export async function quietGet<T>(
    instance: IPublicClientApplication,
    account: AccountInfo,
    url: string,
    tenantId?: string,
): Promise<T | null> {
    try {
        const token = await instance.acquireTokenSilent({ scopes: [apiScope], account });
        const response = await apiRequest<{ data?: T }>(url, { headers: tenantId ? { 'X-Tenant-ID': tenantId } : {} }, token.accessToken);
        return response.data?.data ?? null;
    } catch {
        return null;
    }
}
