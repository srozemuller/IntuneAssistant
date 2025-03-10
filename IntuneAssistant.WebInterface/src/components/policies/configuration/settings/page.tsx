import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    CONFIGURATION_POLICIES_ENDPOINT,
    GROUP_POLICY_SETTINGS_ENDPOINT,
    POLICY_SETTINGS_ENDPOINT
} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/policies/configuration/settings/columns.tsx";
import { z } from "zod";
import { settingSchema, type PolicySettings } from "@/components/policies/configuration/settings/schema";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import {withOnboardingCheck} from "@/components/with-onboarded-check.tsx";

function ConfigPolicySettingsPage() {
    const [data, setData] = useState<PolicySettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

    const fetchData = async () => {
        const toastId = toast.loading('Fetching configuration policy settings');
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data

            const [policyResponse, groupPolicyResponse] = await Promise.all([
                authDataMiddleware(POLICY_SETTINGS_ENDPOINT, 'GET'),
                authDataMiddleware(GROUP_POLICY_SETTINGS_ENDPOINT, 'GET')
            ]);

            if (!policyResponse || !groupPolicyResponse) {
                throw new Error('One or both responses are undefined');
            }
            console.log(policyResponse)

            if (policyResponse.notOnboarded) {
                // Show dialog instead of auto-redirecting
                setTenantId(response.tenantId);
                setShowOnboardingDialog(true);
                setLoading(false);
                return;
            }

            const policyData = typeof policyResponse.data.data === 'string' ? JSON.parse((policyResponse.data).data) : (policyResponse.data).data;
            const groupPolicyData = typeof groupPolicyResponse.data.data === 'string' ? JSON.parse((groupPolicyResponse.data).data) : (groupPolicyResponse.data).data;

            const combinedData = [...policyData, ...groupPolicyData];
            setRawData(JSON.stringify(combinedData));

            const parsedData: PolicySettings[] = z.array(settingSchema).parse(combinedData);

            setData(parsedData);

            // Show toast message based on the status
            const { message } = JSON.parse(rawData);
            const status = JSON.parse(rawData).status.toLowerCase();
            console.log('Status:', status);
            if (status === 'success') {
                toast.update(toastId, { render: message, type: 'success', isLoading: false, autoClose: toastDuration });
            } else if (status === 'error') {
                toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: toastDuration });
            } else if (status === 'warning') {
                toast.update(toastId, { render: message, type: 'warning', isLoading: false, autoClose: toastDuration });
            }


        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to fetch policies. ${(error as Error).message}`;
            setError(errorMessage);
            toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: toastDuration });

            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="configuration-settings" />
        </div>
    );
}

export default withOnboardingCheck(ConfigPolicySettingsPage);