import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {CONFIGURATION_POLICIES_ENDPOINT, POLICY_SETTINGS_ENDPOINT} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/policies/configuration/settings/columns.tsx";
import { toast } from "sonner";
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
            const policyData = await authDataMiddleware(CONFIGURATION_POLICIES_ENDPOINT);
            const parsedPolicyData = JSON.parse(policyData);
            const ids = parsedPolicyData.map((policy: { id: string, name: string }) => ({ id: policy.id, name: policy.name }));
            const idsJson = JSON.stringify(ids);
            console.log('Policy IDs:', idsJson);
            const rawData: string = await authDataMiddleware(POLICY_SETTINGS_ENDPOINT, 'POST', idsJson);
            setRawData(rawData);
            console.log('Raw data:', rawData);
            const parsedData: PolicySettings[] = z.array(settingSchema).parse(JSON.parse(rawData));
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
        const timer = setTimeout(() => {
            toast.info('Waiting for data to load...');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetchData();
        toast.promise(fetchData(), {
            loading: `Searching for configuration settings ...`,
            success: `Configuration policies settings fetched successfully`,
            error: (err) => `Failed to get configuration policies settings because: ${err.message}`,
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="configuration-settings"  />
        </div>
    );
}