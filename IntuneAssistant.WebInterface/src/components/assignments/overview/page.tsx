import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/overview/columns.tsx";
import { toast } from "sonner";
import { z } from "zod";
import { assignmentsSchema, type Assignments } from "@/components/assignments/overview/schema";

export default function DemoPage() {
    const [data, setData] = useState<Assignments[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const rawData: string = await authDataMiddleware(ASSIGNMENTS_ENDPOINT);
            setRawData(rawData);
            console.log('Raw data:', rawData);
            const parsedData: Assignments[] = z.array(assignmentsSchema).parse(JSON.parse(rawData));
            setData(parsedData);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to assignments. ${(error as Error).message}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            toast.info('Waiting for data to load...');
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetchData();
        toast.promise(fetchData(), {
            loading: `Searching for assignments ...`,
            success: `Assignments fetched successfully`,
            error: (err) => `Failed to get assignments because: ${err.message}`,
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="assignments"  />
        </div>
    );
}