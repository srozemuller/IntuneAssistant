import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
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
import { showLoadingToast } from '@/utils/toastUtils';

function ConfigPolicySettingsPage() {
    const [data, setData] = useState<PolicySettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
    const [tenantId, setTenantId] = useState<string>('');

    const source = 'Configuration Policy settings';

    const fetchData = async (cancelSource = createCancelTokenSource()) => {
        const toastId = showLoadingToast(`Fetching ${source}`, () => {
            cancelSource.cancel("User cancelled request");
        });
        try {
            setLoading(true);
            setError('');
            setData([]);

            const [policyResponse, groupPolicyResponse] = await Promise.all([
                authDataMiddleware(POLICY_SETTINGS_ENDPOINT, 'GET', {}, cancelSource as any),
                authDataMiddleware(GROUP_POLICY_SETTINGS_ENDPOINT, 'GET', {}, cancelSource as any)
            ]);

            if (!policyResponse || !groupPolicyResponse) {
                throw new Error('One or both responses are undefined');
            }

            const parseResponseData = (response: any) => {
                if (!response?.data?.data) {
                    throw new Error('Response data is empty or invalid');
                }
                return typeof response.data.data === 'string'
                    ? JSON.parse(response.data.data)
                    : response.data.data;
            };

            const policyData = parseResponseData(policyResponse);
            const groupPolicyData = parseResponseData(groupPolicyResponse);

            const combinedData = [...policyData, ...groupPolicyData];
            setRawData(JSON.stringify(combinedData));

            const parsedData: PolicySettings[] = z.array(settingSchema).parse(combinedData);
            setData(parsedData);

            // Extract message and status from the API response if they exist
            const { message, status } = policyResponse.data || {};
            if (status?.toLowerCase() === 'success') {
                toast.update(toastId, { render: message, type: 'success', isLoading: false, autoClose: toastDuration });
            } else if (status?.toLowerCase() === 'error') {
                toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: toastDuration });
            } else if (status?.toLowerCase() === 'warning') {
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
        const cancelSource = createCancelTokenSource();

        fetchData(cancelSource);
        if (rawData) {
            console.log('Raw data page:', rawData);
        }
        return () => {
            // Cancel the API call when the component unmounts
            cancelSource.cancel("Component unmounted or user navigated away");
        };
    }, []);


    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="configuration-settings" />
        </div>
    );
}

export default withOnboardingCheck(ConfigPolicySettingsPage);