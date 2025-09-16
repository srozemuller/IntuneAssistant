'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';

interface CustomerData {
    id: string;
    name: string;
    address: string | null;
    iban: string | null;
    isMsp: boolean;
    isActive: boolean;
    primaryContactEmail: string | null;
    homeTenantId: string;
    licenses: string[];
    tenants: any[];
}

interface CustomerContextType {
    customerData: CustomerData | null;
    isActiveCustomer: boolean;
    customerLoading: boolean;
    customerError: string | null;
    refetchCustomerData: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType>({
    customerData: null,
    isActiveCustomer: false,
    customerLoading: true,
    customerError: null,
    refetchCustomerData: async () => {},
});

export const useCustomer = () => useContext(CustomerContext);

interface CustomerProviderProps {
    children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
    const { accounts, instance } = useMsal();
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [customerError, setCustomerError] = useState<string | null>(null);

    const isAuthenticated = accounts && accounts.length > 0;
    const currentTenantId = accounts[0]?.tenantId;

    const fetchCustomerData = async () => {
        if (!isAuthenticated || !currentTenantId) {
            setCustomerLoading(false);
            return;
        }

        try {
            setCustomerLoading(true);
            setCustomerError(null);

            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/${currentTenantId}/overview`, {
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to fetch customer data: ${apiResponse.statusText}`);
            }

            const result = await apiResponse.json();
            setCustomerData(result.data);
        } catch (err) {
            console.error('Error fetching customer data:', err);
            setCustomerError(err instanceof Error ? err.message : 'An error occurred');
            setCustomerData(null);
        } finally {
            setCustomerLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, [isAuthenticated, currentTenantId]);

    const value: CustomerContextType = {
        customerData,
        isActiveCustomer: customerData?.isActive || false,
        customerLoading,
        customerError,
        refetchCustomerData: fetchCustomerData,
    };

    return (
        <CustomerContext.Provider value={value}>
            {children}
        </CustomerContext.Provider>
    );
};
