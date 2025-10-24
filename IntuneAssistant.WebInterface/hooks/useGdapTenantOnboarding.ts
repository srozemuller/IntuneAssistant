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
    message: string | { url: string; message: string }; // Updated to handle both cases
    details: string;
    data: PartnerTenant[];
    status: string;
}

export const useGdapTenantOnboarding = (partnerTenantId?: string) => {
    const [partnerTenants, setPartnerTenants] = useState<PartnerTenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<PartnerTenant | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { request } = useApiRequest();

    const fetchPartnerTenants = useCallback(async (): Promise<ApiResponse> => {
        if (!partnerTenantId) {
            setError('Your tenant ID is required to fetch partner tenants');
            throw new Error('Your tenant ID is required to fetch partner tenants');
        }

        setLoading(true);
        setError(null);

        try {
            const data = await request<ApiResponse>(
                PARTNER_TENANTS_ENDPOINT,
                {
                    method: 'GET',
                    headers: {
                        'X-Tenant-ID': partnerTenantId,
                        'Content-Type': 'application/json'
                    }
                },
                fetchPartnerTenants
            );

            // Handle the case where data might be undefined
            if (!data) {
                throw new Error('No data received from API');
            }

            if (data.status === 'Success' && Array.isArray(data.data)) {
                setPartnerTenants(data.data);
                setError(null);
            } else if (data.message) {
                const errorMessage = typeof data.message === 'string'
                    ? data.message
                    : 'Failed to fetch partner tenants';
                setError(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Failed to fetch partner tenants:', error);
            setError('Failed to fetch partner tenants');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [partnerTenantId, request]);



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
