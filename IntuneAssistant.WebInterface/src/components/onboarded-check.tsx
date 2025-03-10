import axios from 'axios';
import { msalInstance } from '@/components/auth';
import { toast } from 'sonner';
import { INTUNEASSISTANT_TENANT_INFO } from '@/components/constants/apiUrls.js';

export interface OnboardingStatus {
    isOnboarded: boolean;
    tenantId: string;
    tenantName?: string;
    error?: string;
}

export async function checkTenantOnboardingStatus(): Promise<OnboardingStatus> {
    try {
        // Ensure MSAL is initialized
        await msalInstance.initialize();

        // Check if user is authenticated
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts found. Please log in.');
        }

        const account = accounts[0];
        const tenantId = account.tenantId;

        // Get access token
        const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['api://6317a049-4e55-464f-80a1-0896b8309fec/access_as_user'],
            account,
        });

        // Check onboarding status
        const response = await axios.get(`${INTUNEASSISTANT_TENANT_INFO}?tenantId=${tenantId}`, {
            headers: { Authorization: `Bearer ${tokenResponse.accessToken}` }
        });

        const data = response.data;
        const isOnboarded = data.status === "Onboarded" && data.data.enabled;

        return {
            isOnboarded,
            tenantId,
            tenantName: data.data?.tenantName
        };
    } catch (error: any) {
        console.error('Failed to check tenant onboard status:', error);
        toast.error('Failed to verify tenant status');

        // Try to get tenantId even if there's an error
        const tenantId = msalInstance.getAllAccounts()[0]?.tenantId || '';

        return {
            isOnboarded: false,
            tenantId,
            error: error.message
        };
    }
}