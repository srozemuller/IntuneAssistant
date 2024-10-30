import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    CONFIGURATION_POLICIES_ENDPOINT,
    GROUP_POLICY_SETTINGS_ENDPOINT,
    POLICY_SETTINGS_ENDPOINT
} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/policies/configuration/settings/columns.tsx";
import { Toaster, toast } from 'sonner';
import { z } from "zod";
import { settingSchema, type PolicySettings } from "@/components/policies/configuration/settings/schema";

export default function DemoPage() {
    const [data, setData] = useState<PolicySettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');

    const fetchData = async () => {
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

            const policyData = typeof policyResponse.data === 'string' ? JSON.parse(policyResponse.data) : policyResponse.data;
            const groupPolicyData = typeof groupPolicyResponse.data === 'string' ? JSON.parse(groupPolicyResponse.data) : groupPolicyResponse.data;

            const combinedData = [...policyData, ...groupPolicyData];
            setRawData(JSON.stringify(combinedData));

            const parsedData: PolicySettings[] = z.array(settingSchema).parse(combinedData);

            setData(parsedData);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to fetch policies. ${(error as Error).message}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        toast.promise(fetchData(), {
            loading: `Searching for configuration settings ...`,
            success: `Configuration policies settings fetched successfully`,
            error: (err) => `Failed to get configuration policies settings because: ${err.message}`,
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <Toaster />
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="configuration-settings" />
        </div>
    );
}