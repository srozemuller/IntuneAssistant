// src/components/assignments/migrate/page.tsx
import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import CSVUploader from '@/components/csv-uploader.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_COMPARE_ENDPOINT,
    ASSIGNMENTS_FILTERS_ENDPOINT,
    GROUPS_ENDPOINT
} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/migrate/columns.tsx";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import {
    assignmentMigrationSchema,
    type AssignmentsMigrationModel,
    groupsSchema
} from "@/components/assignments/migrate/schema";
import type {filterSchema} from "@/schemas/filters.tsx";

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
    const [filters, setFilters] = useState<z.infer<typeof filterSchema>[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            setData([]);
            const response = await authDataMiddleware(ASSIGNMENTS_COMPARE_ENDPOINT, 'POST', jsonString);
            const rawData = typeof response?.data === 'string' ? JSON.parse(response.data) : response?.data;
            setRawData(JSON.stringify(rawData, null, 2));

            // Ensure filterToMigrate properties are not null
            const sanitizedData = rawData.map((item: any) => {
                if (item.filterToMigrate) {
                    item.filterToMigrate.displayName = item.filterToMigrate.displayName ?? '';
                    item.filterToMigrate.description = item.filterToMigrate.description ?? '';
                    item.filterToMigrate.platform = item.filterToMigrate.platform ?? '';
                    item.filterToMigrate.rule = item.filterToMigrate.rule ?? '';
                    item.filterToMigrate.assignmentFilterManagementType = item.filterToMigrate.assignmentFilterManagementType ?? '';
                }
                return item;
            });

            const parsedData: AssignmentsMigrationModel[] = z.array(assignmentMigrationSchema).parse(sanitizedData);
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

    const fetchFilters = async () => {
        try {
            const response = await authDataMiddleware(ASSIGNMENTS_FILTERS_ENDPOINT, 'GET');
            const filtersData = response?.data || [];
            setFilters(filtersData);
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
        fetchFilters();
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
            <DataTable columns={columns(groups, filters)} data={data} rawData={rawData} fetchData={fetchData} source="assignmentsMigration" />
        </div>
    );
}