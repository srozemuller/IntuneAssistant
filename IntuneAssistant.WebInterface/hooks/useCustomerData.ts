// hooks/useCustomerData.ts
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";

interface Tenant {
    id: string;
    tenantId: string;
    displayName: string;
    isEnabled: boolean;
    isPrimary: boolean;
    lastLogin: string | null;
}

interface CustomerData {
    id: string;
    name: string;
    address: string | null;
    iban: string | null;
    isMsp: boolean;
    isActive: boolean;
    primaryContactEmail: string | null;
    homeTenantId: string;
    licenses: any[];
    tenants: Tenant[];
}

interface ApiResponse {
    status: string;
    message: string;
    details: any[];
    data: CustomerData;
}

export function useCustomerData() {
    const { accounts, instance } = useMsal();
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentTenantId = accounts[0]?.tenantId;

    const getAccessToken = async () => {
        try {
            const response = await instance.acquireTokenSilent({
                scopes: ['User.Read'],
                account: accounts[0],
            });
            return response.accessToken;
        } catch (error) {
            console.error('Failed to acquire token:', error);
            throw error;
        }
    };

    const fetchCustomerData = async () => {
        if (!currentTenantId) return;

        try {
            setLoading(true);
            setError(null);

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

            const result: ApiResponse = await apiResponse.json();
            setCustomerData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Failed to fetch customer data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentTenantId) {
            fetchCustomerData();
        }
    }, [currentTenantId]);

    return { customerData, loading, error, refetch: fetchCustomerData };
}
