import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { CONFIGURATION_POLICIES_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/policies/configuration/columns.tsx";
import { z } from "zod";
import { policySchema, type Policy } from "@/components/policies/configuration/schema";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";


export default function DemoPage() {
    const [data, setData] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');


    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(CONFIGURATION_POLICIES_ENDPOINT);

            if (!response) {
                throw new Error('No response received from the server');
            }

            const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

            setRawData(rawData);
            console.log('Raw data:', rawData);

            // Preprocess the data to set default values
            const preprocessedData = JSON.parse(rawData).map((policy: any) => ({
                ...policy,
                assignments: policy.assignments?.map((assignment: any) => ({
                    ...assignment,
                    resourceName: assignment.resourceName ?? 'defaultResourceName',
                    filterId: assignment.filterId ?? 'defaultFilterId',
                    filterType: assignment.filterType ?? 'defaultFilterType',
                    targetId: assignment.targetId ?? 'defaultTargetId'
                })) ?? []
            }));

            // Validate and parse the preprocessed data
            const parsedData: Policy[] = z.array(policySchema).parse(preprocessedData);
            setData(parsedData);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to fetch policies. ${(error as Error).message}`;
            setError(errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        toast.promise(fetchData(), {
            pending: {
                render:  `Searching for configuration  policies...`,
            },
            success: {
                render: `Configuration policies fetched successfully`,
            },
            error:  {
                render: (errorMessage) => `Failed to get configuration policies because: ${errorMessage}`,
            }
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="configuration"  />
        </div>
    );
}