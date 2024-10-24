// src/components/assignments/migrate/page.tsx
import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import CSVUploader from '@/components/csv-uploader.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_COMPARE_ENDPOINT, GROUPS_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/migrate/columns.tsx";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import {
    assignmentMigrationSchema,
    type AssignmentsMigrationModel,
    groupsSchema
} from "@/components/assignments/migrate/schema";

interface MigratePageProps {
    data: any[];
}

export default function DemoPage() {
    const [data, setData] = useState<AssignmentsMigrationModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [jsonString, setJsonString] = useState<string>('');
    const [groups, setGroups] = useState<z.infer<typeof groupsSchema>[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            setData([]);
            const response = await authDataMiddleware(ASSIGNMENTS_COMPARE_ENDPOINT, 'POST', jsonString);
            const rawData = typeof response?.data === 'string' ? JSON.parse(response.data) : response?.data;
            setRawData(JSON.stringify(rawData, null, 2));
            const parsedData: AssignmentsMigrationModel[] = z.array(assignmentMigrationSchema).parse(rawData);
            setData(parsedData);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to assignments. ${(error as Error).message}`;
            setError(errorMessage);
            setLoading(false); // Ensure loading state is set to false on error
            throw error; // Re-throw the error to be caught by toast.promise
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await authDataMiddleware(GROUPS_ENDPOINT, 'GET');
            const groupsData = response?.data || [];
            setGroups(groupsData);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (jsonString) {
            toast.promise(fetchData(), {
                loading: `Searching for assignments ...`,
                success: `Assignments fetched successfully`,
                error: (err) => `Failed to get assignments because: ${err.message}`,
            });
        }
    }, [jsonString]);

    const handleRefresh = () => {
        toast.promise(fetchData(), {
            loading: `Searching for assignments...`,
            success: `Assignments fetched successfully`,
            error: (err) => `Failed to get assignments because: ${err.message}`,
        });
    };

    return (
        <div className="container max-w-[95%] py-6">
            <Toaster />
            <CSVUploader setJsonString={setJsonString} />
            <DataTable columns={columns(groups)} data={data} rawData={rawData} fetchData={fetchData} source="assignmentsMigration" />
            <button onClick={handleRefresh}>Refresh</button>
        </div>
    );
}