'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import {ASSIGNMENTS_ENDPOINT, CUSTOMER_ENDPOINT} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
interface TenantContextType {
    selectedTenant: string | null;
    availableTenants: Array<{ id: string; name: string }>;
    setSelectedTenant: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
    const [availableTenants, setAvailableTenants] = useState<Array<{ id: string; name: string }>>([]);
    const { instance, accounts } = useMsal();

    useEffect(() => {
        if (accounts.length > 0) {
            const account = accounts[0];
            const tenantId = account.tenantId;
            setSelectedTenant(tenantId);

            // Fetch available tenants from your API
            fetchUserTenants(account.tenantId);
        }
    }, [accounts]);

    const fetchUserTenants = async (userId: string) => {
        try {
            // Replace with your API endpoint
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/${userId}/overview`, {
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const tenants = await apiResponse.json();
            setAvailableTenants(tenants);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        }
    };

    return (
        <TenantContext.Provider value={{ selectedTenant, availableTenants, setSelectedTenant }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) throw new Error('useTenant must be used within TenantProvider');
    return context;
};
