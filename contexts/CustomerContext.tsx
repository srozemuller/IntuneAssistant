'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { usePathname } from 'next/navigation';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';

interface ConnectedTenant {
    id: string;
    tenantId: string;
    displayName: string;
    domainName: string;
    isActive: boolean;
}

interface CustomerData {
    id: string;
    name: string;
    isActive: boolean;
    tenants: ConnectedTenant[];
}

interface CustomerContextType {
    customerData: CustomerData | null;
    /** The account exists and is allowed to use the tool. */
    isActiveCustomer: boolean;
    /** The user's own tenant is connected (consent granted). */
    hasConnectedTenant: boolean;
    customerLoading: boolean;
    customerError: string | null;
    refetchCustomerData: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType>({
    customerData: null,
    isActiveCustomer: false,
    hasConnectedTenant: false,
    customerLoading: true,
    customerError: null,
    refetchCustomerData: async () => {},
});

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { accounts, instance } = useMsal();
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [customerError, setCustomerError] = useState<string | null>(null);

    const pathname = usePathname();
    // The auth check and onboarding screens load the account themselves; fetch again once the user leaves them.
    const onOnboardingScreen = pathname === '/auth/verify' || pathname.startsWith('/onboarding');

    const isAuthenticated = accounts.length > 0;
    const currentTenantId = accounts[0]?.tenantId;

    const fetchCustomerData = useCallback(async () => {
        if (!isAuthenticated || !currentTenantId) {
            setCustomerData(null);
            setCustomerLoading(false);
            return;
        }

        try {
            setCustomerLoading(true);
            setCustomerError(null);

            const token = await instance.acquireTokenSilent({ scopes: [apiScope], account: accounts[0] });
            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/overview`, {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (apiResponse.status === 404) {
                // Brand-new user: no account yet. The home page walks them through onboarding.
                setCustomerData(null);
                return;
            }
            if (!apiResponse.ok) {
                throw new Error(`Failed to load your account: ${apiResponse.statusText}`);
            }

            const result = await apiResponse.json();
            setCustomerData(result.data ?? null);
        } catch (err) {
            console.error('[CustomerContext] Error fetching customer data:', err);
            setCustomerError(err instanceof Error ? err.message : 'Something went wrong');
            setCustomerData(null);
        } finally {
            setCustomerLoading(false);
        }
    }, [isAuthenticated, currentTenantId, instance, accounts]);

    useEffect(() => {
        if (onOnboardingScreen) {
            setCustomerLoading(false);
            return;
        }
        fetchCustomerData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, currentTenantId, onOnboardingScreen]);

    const value: CustomerContextType = {
        customerData,
        isActiveCustomer: customerData?.isActive ?? false,
        hasConnectedTenant: (customerData?.tenants?.length ?? 0) > 0,
        customerLoading,
        customerError,
        refetchCustomerData: fetchCustomerData,
    };

    return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};
