import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {ASSIGNMENTS_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/overview/columns.tsx";
import {toast, Toaster} from "sonner";
import { z } from "zod";
import { assignmentsSchema, type Assignments } from "@/components/assignments/overview/schema";

export default function DemoPage() {
    const [data, setData] = useState<Assignments[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [rawDataFilters, setRawDataFilters] = useState<string>('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(ASSIGNMENTS_ENDPOINT);
            const rawData = typeof response?.data === 'string' ? response.data : JSON.stringify(response?.data); // Ensure rawData is a string

            const responseFilters = await authDataMiddleware(ASSIGNMENTS_FILTERS_ENDPOINT);
            const rawDataFilters = typeof responseFilters?.data === 'string' ? responseFilters.data : JSON.stringify(responseFilters?.data); // Ensure rawData is a string

            setRawData(rawData);
            setRawDataFilters(rawDataFilters);
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
        fetchData();
        toast.promise(fetchData(), {
            loading: `Searching for assignments ...`,
            success: `Assignments fetched successfully`,
            error: (err) => `Failed to get assignments because: ${err.message}`,
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <Toaster />
            <DataTable columns={columns} data={data} rawData={rawData} rawDataFilters={rawDataFilters} fetchData={fetchData} source="assignments"  />
        </div>
    );
}