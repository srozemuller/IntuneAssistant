// src/components/assignments/migrate/page.tsx
import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import CSVUploader from '@/components/csv-uploader.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_MIGRATION_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/migrate/columns.tsx";
import { toast } from "sonner";
import { z } from "zod";
import {
    assignmentMigrationSchema,
    type AssignmentsMigrationModel
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

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            setData([]);
            const response = await authDataMiddleware(ASSIGNMENTS_MIGRATION_ENDPOINT, 'POST', jsonString);
            const rawData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data); // Ensure rawData is a string
            setRawData(rawData);
            console.log('Raw data:', rawData);
            const parsedData: AssignmentsMigrationModel[] = z.array(assignmentMigrationSchema).parse(JSON.parse(rawData));
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
        if (jsonString) {
            toast.promise(fetchData(), {
                loading: `Searching for assignments ...`,
                success: `Assignments fetched successfully`,
                error: (err) => `Failed to get assignments because: ${err.message}`,
            });
        }
    }, [jsonString]);

    return (
        <div className="container max-w-[95%] py-6">
            <CSVUploader setJsonString={setJsonString} />
            <DataTable columns={columns} data={data} rawData={rawData} fetchData={fetchData} source="assignmentsMigration" />
        </div>
    );
}