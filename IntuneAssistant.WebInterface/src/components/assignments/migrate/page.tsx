// src/components/assignments/migrate/page.tsx
import { useEffect, useState, useMemo } from 'react';
import { DataTable } from './data-table.tsx';
import CSVUploader from "@/components/csv-uploader.tsx";
import authDataMiddleware, { createCancelTokenSource } from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_COMPARE_ENDPOINT,
    ASSIGNMENTS_FILTERS_ENDPOINT,
    GROUPS_ENDPOINT, GROUPS_LIST_ENDPOINT
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
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import { showLoadingToast } from '@/utils/toastUtils';


import { withOnboardingCheck } from "@/components/with-onboarded-check.tsx";


function MigrationPage() {
    const [data, setData] = useState<AssignmentsMigrationModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [rows, setRows] = useState<object[]>([]);
    const [groups, setGroups] = useState<z.infer<typeof groupsSchema>[]>([]);
    const [filters, setFilters] = useState<z.infer<typeof filterSchema>[]>([]);
    const [backupStatus, setBackupStatus] = useState<Record<string, boolean>>({});

    const tableColumns = useMemo(
        () => columns(groups, filters, backupStatus, setData),
        [groups, filters, backupStatus, setData]
    );

    const clearAllData = () => {
        setData([]);
        setRawData('');
        setBackupStatus({});
        setRows([]);
    };

    const fetchGroups = async (cancelSource: any) => {
        const response = await authDataMiddleware(GROUPS_LIST_ENDPOINT, 'GET', {}, cancelSource);
        return response?.data || [];
    };

    const fetchFilters = async (cancelSource: any) => {
        const response = await authDataMiddleware(ASSIGNMENTS_FILTERS_ENDPOINT, 'GET', {}, cancelSource);
        return response?.data || [];
    };

    const fetchData = async (cancelSource: any) => {
        const sanitizedRows = rows.map(row => {
            const sanitizedRow: { [key: string]: any } = { ...row };
            for (const key in sanitizedRow) {
                if (sanitizedRow[key] === '') {
                    sanitizedRow[key] = null;
                } else if (typeof sanitizedRow[key] === 'string') {
                    sanitizedRow[key] = sanitizedRow[key].trim().replace(/\n$/, '');
                }
            }
            return sanitizedRow;
        });
        const jsonString = JSON.stringify(sanitizedRows);
        const response = await authDataMiddleware(ASSIGNMENTS_COMPARE_ENDPOINT, 'POST', jsonString, cancelSource);
        if (response?.status === 401) {
            const errorData = response;
            toast.error(
                <div>
                    <strong>{errorData.message}</strong>
                    <br />
                    {errorData.details}
                </div>
            );
            return [];
        }
        return response?.data || [];

    };

    useEffect(() => {
        if (rows.length > 0) {
            const cancelSource = createCancelTokenSource();
            const toastId = showLoadingToast('Fetching migration information', () => {
                cancelSource.cancel('User canceled all requests');
            });

            const fetchAllData = async () => {
                try {
                    const [groupsData, filtersData, migrationResponse] = await Promise.all([
                        fetchGroups(cancelSource),
                        fetchFilters(cancelSource),
                        fetchData(cancelSource)
                    ]);

                    // Extract the `data` key from the API response
                    const migrationData = migrationResponse || [];
                    console.log('Migration data:', migrationData);
                    // Parse the extracted data
                    const parsedMigrationData = z.array(assignmentMigrationSchema).parse(migrationData);

                    setGroups(groupsData);
                    setFilters(filtersData);
                    setData(parsedMigrationData);

                    toast.update(toastId, {
                        render: 'Fetching migration data completed',
                        type: 'success',
                        isLoading: false,
                        autoClose: toastDuration
                    });
                } catch (error) {
                    if (error.message === 'User canceled all requests') {
                        console.log('All requests canceled by user');
                        toast.update(toastId, {
                            render: 'Fetching canceled by user',
                            type: 'warning',
                            isLoading: false,
                            autoClose: toastDuration
                        });
                    } else {
                        console.error('Error fetching data:', error);
                        toast.update(toastId, {
                            render: `Error fetching data: ${(error as Error).message}`,
                            type: 'error',
                            isLoading: false,
                            autoClose: toastDuration
                        });
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchAllData();

            return () => {
                cancelSource.cancel('Component unmounted or user navigated away');
            };
        }
    }, [rows]);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <CSVUploader
                setRows={setRows}
                clearParentData={clearAllData}
            />
            <DataTable
                columns={tableColumns}
                data={data}
                rawData={rawData}
                fetchData={fetchData}
                source="assignmentsMigration"
                setTableData={setData}
                backupStatus={backupStatus}
                setBackupStatus={setBackupStatus}
                groupData={groups || []}
                filters={filters || []}
            />
        </div>
    );
}

export default withOnboardingCheck(MigrationPage);