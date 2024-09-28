import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { CA_POLICIES_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/policies/ca/columns.tsx";
import { toast } from 'sonner';
import { z } from "zod";
import { taskSchema, type Task } from "@/components/policies/ca/schema";

export default function DemoPage() {
    const [data, setData] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(CA_POLICIES_ENDPOINT);
            const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data); // Ensure rawData is a string

            setRawData(rawData);
            console.log('Raw data:', rawData);
            const parsedData: Task[] = z.array(taskSchema).parse(JSON.parse(rawData));
            setData(parsedData);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to fetch policies. ${(error as Error).message}`;
            setError(`${errorMessage}`);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        toast.promise(fetchData(), {
            loading: `Searching for conditional access policies...`,
            success: `Conditional access policies fetched successfully`,
            error: (err) => `Failed to get conditional access policies because: ${err.message}`,
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="ca"  />
        </div>
    );
}
