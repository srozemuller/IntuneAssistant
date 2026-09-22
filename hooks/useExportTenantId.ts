'use client';
import { useMsal } from '@azure/msal-react';

/**
 * Tenant ID stamped on export/download filenames: the signed-in user's own tenant.
 */
export function useExportTenantId(): string | null {
    const { accounts } = useMsal();
    return accounts[0]?.tenantId || (accounts[0]?.idTokenClaims?.tid as string | undefined) || null;
}
