// src/components/assignments/migrate/page.tsx
import { useEffect, useState, useMemo } from 'react';
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
    const [tenantId, setTenantId] = useState<string>('');
    const [backupStatus, setBackupStatus] = useState<Record<string, boolean>>({});

    // Add a useMemo to recreate columns when backupStatus changes
    const tableColumns = useMemo(
        () => columns(groups, filters, backupStatus, setData),
        [groups, filters, backupStatus, setData]
    );


    const fetchData = async () => {
        const toastId = toast.loading(`Loading migration config`);
        try {
            setError('');
            setData([]);
            const sanitizedRows = rows.map(row => {
                // Define sanitizedRow with an index signature
                const sanitizedRow: { [key: string]: any } = { ...row };
                for (const key in sanitizedRow) {
                    if (sanitizedRow[key] === '') {
                        sanitizedRow[key] = null;
                    }
                }
                return sanitizedRow;
            });
            const jsonString = JSON.stringify(sanitizedRows);
            const response = await authDataMiddleware(ASSIGNMENTS_COMPARE_ENDPOINT, 'POST', jsonString);

            // Fix the JSON parsing error - handle the response data properly
            let rawData;
            if (response?.data) {
                // Check if data is already an object or a string that needs parsing
                if (typeof response.data === 'string') {
                    rawData = JSON.parse(response.data);
                } else if (response.data.data) {
                    // If response.data.data exists, properly handle it
                    rawData = typeof response.data.data === 'string'
                        ? JSON.parse(response.data.data)
                        : response.data.data;
                } else {
                    // Fallback to the whole response.data object
                    rawData = response.data;
                }
                setRawData(JSON.stringify(rawData, null, 2));
            }

            if (response?.notOnboarded) {
                setTenantId(response.tenantId);
                setShowOnboardingDialog(true);
                setLoading(false);
                return;
            }

            // Make sure we have valid data to process
            if (!rawData || !Array.isArray(rawData)) {
                throw new Error('Invalid response format');
            }

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

            // Extract message and status safely
            let message = 'Operation completed';
            let status = 'success';

            if (rawData.message) {
                message = rawData.message;
            }

            if (rawData.status) {
                status = typeof rawData.status === 'string' ? rawData.status.toLowerCase() : 'success';
            }

            console.log('Status:', status);

            // Show toast message based on the status
            if (status === 'success') {
                toast.update(toastId, { render: message, type: 'success', isLoading: false, autoClose: toastDuration });
            } else if (status === 'error') {
                toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: toastDuration });
            } else if (status === 'warning') {
                toast.update(toastId, { render: message, type: 'warning', isLoading: false, autoClose: toastDuration });
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to load assignments. ${(error as Error).message}`;
            setError(errorMessage);
            toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: toastDuration });
        } finally {
            setLoading(false);
        }
    };

    // Need to fetch all groups because we need to compare the targetIds in the current assignments
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
            const fetchAllData = async () => {
                const toastId = toast.loading('Fetching migration info...');
                try {
                    await fetchGroups(); // Wait for fetchGroups to complete
                    toast.update(toastId, { render: 'Fetching groups completed', type: 'info', isLoading: true });

                    await fetchFilters(); // Wait for fetchFilters to complete
                    toast.update(toastId, { render: 'Fetching filters completed', type: 'info', isLoading: true });

                    await fetchData(); // Fetch migration data
                    toast.update(toastId, { render: 'Fetching migration data completed', type: 'success', isLoading: false, autoClose: toastDuration });
                } catch (error) {
                    console.error('Error fetching data:', error);
                    toast.update(toastId, { render: `Error fetching data: ${(error as Error).message}`, type: 'error', isLoading: false, autoClose: toastDuration });
                }
            };

            fetchAllData();
        }
    }, [rows]);
    return (
        <div className="container max-w-[95%] py-6">
            <CSVUploader setRows={setRows}/>
            <DataTable
                rowClassName={isAnimating ? 'fade-to-normal' : ''}
                columns={tableColumns}
                data={data}
                rawData={rawData}
                fetchData={fetchData}
                source="assignmentsMigration"
                setTableData={setData}
                backupStatus={backupStatus}
                setBackupStatus={setBackupStatus}
            />
        </div>
    );
}
export default withOnboardingCheck(MigrationPage);