import { useCustomer } from '@/contexts/CustomerContext';
import { useMsal } from '@azure/msal-react';
import { apiScope } from '@/lib/msalConfig';

export const useGdapContext = () => {
    const { selectedTenant } = useCustomer();
    const { accounts, instance } = useMsal();

    const getGdapHeaders = async () => {
        if (!accounts.length) return {};

        const response = await instance.acquireTokenSilent({
            scopes: [apiScope],
            account: accounts[0]
        });

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${response.accessToken}`,
            'Content-Type': 'application/json'
        };

        // Add GDAP tenant context if selected
        if (selectedTenant) {
            headers['X-Tenant-Id'] = selectedTenant.tenantId;
            headers['X-Customer-Tenant'] = selectedTenant.tenantId;
        }

        return headers;
    };

    return {
        selectedTenant,
        hasSelectedTenant: !!selectedTenant,
        getGdapHeaders,
        isGdapMode: !!selectedTenant
    };
};
