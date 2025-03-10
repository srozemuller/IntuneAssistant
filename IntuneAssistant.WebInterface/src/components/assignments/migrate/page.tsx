// src/components/assignments/migrate/page.tsx
import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import CSVUploader from "@/components/csv-uploader.tsx";
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_COMPARE_ENDPOINT,
    ASSIGNMENTS_FILTERS_ENDPOINT,
    GROUPS_ENDPOINT
} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/migrate/columns.tsx";
import { z } from "zod";
import {
    assignmentMigrationSchema,
    type AssignmentsMigrationModel,
    groupsSchema
} from "@/components/assignments/migrate/schema";
import type { filterSchema } from "@/schemas/filters.tsx";

// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { withOnboardingCheck } from "@/components/with-onboarded-check.tsx";
import {toastDuration} from "@/config/toastConfig.ts";


function MigrationPage() {
    const [data, setData] = useState<AssignmentsMigrationModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [rows, setRows] = useState<object[]>([]);
    const [jsonString, setJsonString] = useState<string>('');
    const [groups, setGroups] = useState<z.infer<typeof groupsSchema>[]>([]);
    const [filters, setFilters] = useState<z.infer<typeof filterSchema>[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            fetchGroups();
            fetchFilters();
            setData([]);
            const sanitizedRows = rows.map(row => {
                const sanitizedRow = { ...row };
                for (const key in sanitizedRow) {
                    if (sanitizedRow[key] === '') {
                        sanitizedRow[key] = null;
                    }
                }
                return sanitizedRow;
            });
            const jsonString = JSON.stringify(sanitizedRows);
            const response = await authDataMiddleware(ASSIGNMENTS_COMPARE_ENDPOINT, 'POST', jsonString);

            if (response.notOnboarded) {
                // Show dialog instead of auto-redirecting
                setTenantId(response.tenantId);
                setShowOnboardingDialog(true);
                setLoading(false);
                return;
            }


            const rawData = typeof response?.data.data === 'string' ? JSON.parse((response.data).data) : (response?.data).data;
            setRawData(JSON.stringify((rawData).data, null, 2));

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
            setLoading(false); // Ensure loading state is set to false on error
            toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: toastDuration });

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
        if (rows.length > 0) {
            fetchData();
        }
    }, [rows]);
    return (
        <div className="container max-w-[95%] py-6">
            <CSVUploader setRows={setRows}/>
            <DataTable
                rowClassName={isAnimating ? 'fade-to-normal' : ''}
                columns={columns(groups, filters, setData)}
                data={data}
                rawData={rawData}
                fetchData={fetchData}
                source="assignmentsMigration"
                setTableData={setData}
            />
        </div>
    );
}
export default withOnboardingCheck(MigrationPage);