import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware, { createCancelTokenSource } from '@/components/middleware/fetchData';

import { ASSIGNMENTS_ENDPOINT, GROUPS_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/overview/columns.tsx";

import { z } from "zod";
import { assignmentsSchema, type Assignments } from "@/components/assignments/overview/schema";
import { type GroupModel, groupSchema } from "@/schemas/groupSchema";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import { showLoadingToast } from '@/utils/toastUtils';

import { withOnboardingCheck } from "@/components/with-onboarded-check.tsx";

function AssignmentsPage() {
    const [data, setData] = useState<Assignments[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [groupData, setGroupData] = useState<GroupModel[]>([]);
    const [tenantId, setTenantId] = useState<string>('');
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

    const fetchData = async (cancelSource = createCancelTokenSource()) => {
        let toastId: ReturnType<typeof toast.loading> = null as any;
        try {
            const toastId = showLoadingToast("Fetching assignments", () => {
                cancelSource.cancel("User cancelled request");
            });

            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data

            // Properly pass the cancellation token source
            const response = await authDataMiddleware(ASSIGNMENTS_ENDPOINT, 'GET', {}, cancelSource as any);

            // Check if response exists and has custom properties
            const responseData = response?.data;

            // Handle custom properties that might be in the response data
            if (responseData && responseData.notOnboarded) {
                setTenantId(responseData.tenantId || '');
                setShowOnboardingDialog(true);
                setLoading(false);
                toast.update(toastId, {
                    render: 'Tenant not onboarded',
                    type: 'warning',
                    isLoading: false,
                    autoClose: toastDuration
                });
                return;
            }

            if (response && responseData) {
                const rawDataStr = typeof responseData === 'string'
                    ? responseData
                    : JSON.stringify(responseData);

                setRawData(rawDataStr);
                console.log('Raw data:', rawDataStr);

                const parsedJson = JSON.parse(rawDataStr);
                const parsedData: Assignments[] = z.array(assignmentsSchema).parse(parsedJson.data);
                setData(parsedData);

                // Show toast message based on the status
                const { message } = parsedJson;
                const status = parsedJson.status.toLowerCase();
                console.log('Status:', status);

                // Always update the existing toast instead of creating a new one
                toast.update(toastId, {
                    render: message,
                    type: status === 'success' ? 'success' :
                        status === 'warning' ? 'warning' : 'error',
                    isLoading: false,
                    autoClose: toastDuration
                });
            }
        } catch (error) {
            console.error('Error:', error);
            // Check if the request was cancelled
            if (error && typeof error === 'object' && 'isCancelled' in error) {
                // Only update if not already updated by the cancel button
                if (toast.isActive(toastId)) {
                    toast.update(toastId, {
                        render: 'Request was cancelled',
                        type: 'info',
                        isLoading: false,
                        autoClose: toastDuration
                    });
                }
            } else {
                const errorMessage = `Failed to fetch assignments. ${(error as Error).message}`;
                setError(errorMessage);
                toast.update(toastId, {
                    render: errorMessage,
                    type: 'error',
                    isLoading: false,
                    autoClose: toastDuration
                });
                throw new Error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupData = async (cancelSource = createCancelTokenSource()) => {
        const toastId = showLoadingToast("Fetching groups", () => {
            cancelSource.cancel("User cancelled request");
        });

        try {
            setLoading(true);
            const response = await authDataMiddleware(GROUPS_ENDPOINT, 'GET', {}, cancelSource as any);

            if (response && response.data) {
                // Directly use response.data if it's already an array, otherwise parse it
                const groupsData = Array.isArray(response.data)
                    ? response.data
                    : (typeof response.data === 'string'
                        ? JSON.parse(response.data)
                        : response.data.data || response.data);

                // Parse using schema
                const parsedGroups = z.array(groupSchema).parse(groupsData);
                setGroupData(parsedGroups);

                toast.update(toastId, {
                    render: "Groups fetched successfully",
                    type: 'success',
                    isLoading: false,
                    autoClose: toastDuration
                });
            } else {
                toast.update(toastId, {
                    render: "No groups found",
                    type: 'warning',
                    isLoading: false,
                    autoClose: toastDuration
                });
            }
        } catch (error) {
            console.error('Error fetching group data:', error);

            if (error && typeof error === 'object' && 'isCancelled' in error) {
                toast.update(toastId, {
                    render: 'Group data request was cancelled',
                    type: 'info',
                    isLoading: false,
                    autoClose: toastDuration
                });
            } else {
                const errorMessage = `Failed to fetch groups. ${(error as Error).message}`;
                toast.update(toastId, {
                    render: errorMessage,
                    type: 'error',
                    isLoading: false,
                    autoClose: toastDuration
                });
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
            const assignmentsSource = createCancelTokenSource();
            const groupsSource = createCancelTokenSource();

            // Call fetch functions immediately (don't use nested functions)
            fetchData(assignmentsSource);
            fetchGroupData(groupsSource);

            return () => {
                assignmentsSource.cancel('Component unmounted');
                groupsSource.cancel('Component unmounted');
                console.log('Requests cancelled due to component unmount');
            };
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable
                columns={columns}
                data={data}
                rawData={rawData}
                fetchData={fetchData}
                source="assignments"
                groupData={groupData}
            />
        </div>
    );
}

export default withOnboardingCheck(AssignmentsPage);