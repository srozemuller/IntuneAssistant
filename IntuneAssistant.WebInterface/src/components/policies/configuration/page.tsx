import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
import { CONFIGURATION_POLICIES_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/policies/configuration/columns.tsx";
import { z } from "zod";
import { policySchema, type Policy } from "@/components/policies/configuration/schema";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import {withOnboardingCheck} from "@/components/with-onboarded-check.tsx";
import { showLoadingToast } from '@/utils/toastUtils';

function ConfigPoliciesPage() {
    const [data, setData] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [tenantId, setTenantId] = useState<string>('');

    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
    const [backupStatus, setBackupStatus] = useState<Record<string, boolean>>({});
    const source = 'Configuration Policies';

    const fetchData = async (cancelSource = createCancelTokenSource()) => {
        const toastId = showLoadingToast(`Fetching ${source}`, () => {
            cancelSource.cancel("User cancelled request");
        });
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(CONFIGURATION_POLICIES_ENDPOINT, 'GET', {}, cancelSource as any);

            // Check if response exists and has custom properties
            const responseData = response?.data;

            if (responseData && responseData.notOnboarded) {
                setTenantId(responseData.tenantId || '');
                setShowOnboardingDialog(true);
                setLoading(false);
                toast.update(toastId, {
                    render: 'Tenant not onboarded',
                    type: 'warning',
                    isLoading: false,
                    autoClose: toastDuration
                });
                return;
            }


            if (!response) {
                throw new Error('No response received from the server');
            }

            const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            setRawData(rawData);
            console.log('Raw data:', rawData);

            // Parse the raw data string into an array
            const parsedArray = JSON.parse(rawData).data;

            // Validate and parse the preprocessed data
            const parsedData: Policy[] = z.array(policySchema).parse(parsedArray);
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
            const errorMessage = `Failed to assignments. ${(error as Error).message}`;
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

        return () => {
            // Cancel the API call when the component unmounts
            cancelSource.cancel("Component unmounted or user navigated away");
        };
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable
                columns={columns}
                data={data}
                rawData={rawData}
                fetchData={fetchData}
                source={source}
                setTableData={setData}
                backupStatus={backupStatus}
                setBackupStatus={setBackupStatus}
            />
        </div>
    );
}
export default withOnboardingCheck(ConfigPoliciesPage);