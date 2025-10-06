import { useState, useCallback } from 'react';
import {PARTNER_TENANTS_ENDPOINT, CONSENT_URL_ENDPOINT} from '@/lib/constants';
import {useApiRequest} from "@/hooks/useApiRequest";
import {apiScope} from "@/lib/msalConfig";
import {useMsal} from "@azure/msal-react";

export interface PartnerTenant {
    tenantId: string;
    displayName: string;
    domain: string;
    country: string;
    createdDateTime: string | null;
    isOnboarded: boolean;
}

interface ApiResponse {
    message: string;
    details: string;
    data: PartnerTenant[];
    status: string;
}

export const useGdapTenantOnboarding = (partnerTenantId?: string) => {
    const [partnerTenants, setPartnerTenants] = useState<PartnerTenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<PartnerTenant | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { instance, accounts } = useMsal();

    const fetchPartnerTenants = useCallback(async () => {
        if (!partnerTenantId) {
            setError('Your tenant ID is required to fetch partner tenants');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let accessToken: string | undefined;
            if (accounts.length > 0) {
                const response = await instance.acquireTokenSilent({
                    scopes: [apiScope],
                    account: accounts[0],
                });
                accessToken = response.accessToken;
            }

            // Using fetch directly here instead of useApiRequest to have more control over headers
            // and to avoid adding the X-Tenant-ID header automatically
            // since we need to set it to the partnerTenantId
            const response = await fetch(PARTNER_TENANTS_ENDPOINT, {
                method: 'GET',
                headers: {
                    'X-Tenant-ID': partnerTenantId,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json() as ApiResponse;

            if (data?.status === 'Success' && Array.isArray(data?.data)) {
                setPartnerTenants(data.data);
            } else {
                setError(data?.message || 'Failed to fetch partner tenants');
            }
        } catch (error) {
            console.error('Failed to fetch partner tenants:', error);
            setError('Failed to fetch partner tenants');
        } finally {
            setLoading(false);
        }
    }, [partnerTenantId]);


    const resetSelection = useCallback(() => {
        setSelectedTenant(null);
        setPartnerTenants([]);
        setError(null);
    }, []);

    return {
        partnerTenants,
        selectedTenant,
        setSelectedTenant,
        loading,
        error,
        fetchPartnerTenants,
        resetSelection
    };
};
