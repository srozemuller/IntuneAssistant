'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';
import { useRouter } from 'next/navigation';

interface License {
    licenseType: number;
    isActive: boolean;
    isTrial: boolean;
    expiryDate: string | null;
    maxTenants: number;
}
interface CustomerTenantLicense {
    id: string;
    createdAt: string;
    expiresAt: string | null;
    isActive: boolean;
    isTrial: boolean;
    licenseType: number;
    activatedBy: string;
    isConsentGranted: boolean;
    consentGrantedAt: string | null;
    consentGrantedBy: string | null;
    isOnboarded: boolean;
    onboardedAt: string | null;
    consentUrl: string | null;
}
interface Tenant {
    id: string;
    tenantId: string;
    displayName: string;
    domainName: string;
    isActive: boolean;
    isGdap: boolean;
    isPrimary: boolean;
    isTrial: boolean;
    lastLogin: string | null;
    licenseType: number;
    licenses?: CustomerTenantLicense[];
}

interface CustomerData {
    id: string;
    name: string;
    address: string | null;
    iban: string | null;
    isMsp: boolean;
    isActive: boolean;
    isGdap: boolean;
    primaryContactEmail: string | null;
    homeTenantId: string;
    licenses: License[];
    tenants: Tenant[];
}

interface CustomerContextType {
    customerData: CustomerData | null;
    isActiveCustomer: boolean;
    customerLoading: boolean;
    customerError: string | null;
    refetchCustomerData: () => Promise<void>;
    selectedTenant: Tenant | null;
    setSelectedTenant: (tenant: Tenant | null) => void;
    clearTenantSelection: () => void;
}

const CustomerContext = createContext<CustomerContextType>({
    customerData: null,
    isActiveCustomer: false,
    customerLoading: true,
    customerError: null,
    refetchCustomerData: async () => {},
    selectedTenant: null,
    setSelectedTenant: () => {},
    clearTenantSelection: () => {},
});

export const useCustomer = () => useContext(CustomerContext);

interface CustomerProviderProps {
    children: ReactNode;
}

// In your CustomerContext file, add this helper function
export const hasTenantsNeedingConsent = (customerData: any): boolean => {
    if (!customerData?.licenses || !customerData?.tenants) return false;

    // Check if customer has only community licenses (licenseType 0)
    const hasOnlyCommunityLicense = customerData.licenses.every((license: any) => license.licenseType === 0);

    if (!hasOnlyCommunityLicense) return false;

    return customerData.tenants.some((tenant: any) => {
        const communityLicense = tenant.licenses?.find((license: any) => license.licenseType === 0);
        return communityLicense && !communityLicense.isConsentGranted;
    });
};


export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
    const { accounts, instance } = useMsal();
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [customerLoading, setCustomerLoading] = useState(true);
    const [customerError, setCustomerError] = useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

    const router = useRouter();

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

            const apiResponse = await fetch(`${CUSTOMER_ENDPOINT}/overview`, {
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

    const clearTenantSelection = () => {
        setSelectedTenant(null);
    };

    const handleSetSelectedTenant = (tenant: Tenant | null) => {
        // Only allow selection of enabled tenants
        if (tenant && !tenant.isActive) {
            console.warn('Cannot select disabled tenant:', tenant.displayName);
            return;
        }
        setSelectedTenant(tenant);
    };

    // Replace your current tenant selection useEffect with these two:
    useEffect(() => {
        // Only auto-select if we have tenants and no current selection
        if (customerData?.tenants && customerData.tenants.length > 0 && !selectedTenant) {
            console.log('Auto-selecting tenant...');

            const primaryTenant = customerData.tenants.find(tenant =>
                tenant.isPrimary && tenant.isActive
            );

            const defaultTenant = primaryTenant ||
                customerData.tenants.find(tenant => tenant.isActive) ||
                customerData.tenants[0];

            if (defaultTenant) {
                setSelectedTenant(defaultTenant);
            }
        }
        // If no tenants available, ensure selectedTenant is null
        else if (customerData?.tenants && customerData.tenants.length === 0 && selectedTenant) {
            console.log('No tenants available, clearing selection');
            setSelectedTenant(null);
        }
    }, [customerData?.tenants]);

    useEffect(() => {
        if (customerData?.tenants && selectedTenant) {
            const isCurrentTenantValid = customerData.tenants.some(tenant =>
                tenant.id === selectedTenant.id && tenant.isActive
            );

            if (!isCurrentTenantValid) {
                console.log('Clearing invalid tenant selection');
                setSelectedTenant(null);
            }
        }
    }, [customerData?.tenants, selectedTenant?.id]);



    // Clear tenant selection when customer data is cleared or user changes
    useEffect(() => {
        if (!customerData || !isAuthenticated) {
            setSelectedTenant(null);
        }
    }, [customerData, isAuthenticated]);

    useEffect(() => {
        fetchCustomerData();
    }, [isAuthenticated, currentTenantId]);

    const value: CustomerContextType = {
        customerData,
        isActiveCustomer: customerData?.isActive || false,
        customerLoading,
        customerError,
        refetchCustomerData: fetchCustomerData,
        selectedTenant,
        setSelectedTenant: handleSetSelectedTenant,
        clearTenantSelection,
    };

    return (
        <CustomerContext.Provider value={value}>
            {children}
        </CustomerContext.Provider>
    );
};
