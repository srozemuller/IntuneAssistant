import axios from 'axios';
import { msalInstance } from '@/authconfig';
import { toast } from 'sonner';
import { INTUNEASSISTANT_TENANT_INFO } from '@/components/constants/apiUrls.js';
import authDataMiddleware from "@/components/middleware/fetchData";

export interface OnboardingStatus {
    isOnboarded: boolean;
    tenantId: string;
    needsMigration: boolean;
    tenantName?: string;
    error?: string;
}

export async function checkTenantOnboardingStatus(): Promise<OnboardingStatus> {
    let data: any;
    let isOnboarded = false;
    let needsMigration = false;
    let tenantId: string = '';
    let tenantName: string = '';

    try {
        // Ensure MSAL is initialized
        await msalInstance.initialize();

        // Check if user is authenticated
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            throw new Error('No accounts found. Please log in.');
        }

        const account = accounts[0];
        tenantId = msalInstance.getAllAccounts()[0]?.tenantId || '';
        const response = await authDataMiddleware(`${INTUNEASSISTANT_TENANT_INFO}?tenantId=${tenantId}`);
        const responseData = typeof response?.data === 'string' ? JSON.parse(response.data) : response?.data;
        console.log("tenantInfo: ",responseData.status);

        data = responseData.data;
        tenantName = data.tenantName;
        isOnboarded = responseData.status == "Onboarded";
        needsMigration = data.needsMigration;

    } catch (error: any) {
        console.error('Failed to check tenant onboard status:', error);
        toast.error('Failed to verify tenant status');

    } finally {
        return {
            isOnboarded,
            needsMigration,
            tenantId,
            tenantName: tenantName
        }
    }
}