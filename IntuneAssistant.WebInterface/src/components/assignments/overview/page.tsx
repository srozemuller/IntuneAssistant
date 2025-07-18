import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware, { createCancelTokenSource } from '@/components/middleware/fetchData';

import {ASSIGNMENTS_ENDPOINT, GROUPS_ENDPOINT, GROUPS_LIST_ENDPOINT} from "@/components/constants/apiUrls.js";
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
        // Don't create and reassign toastId - declare once
        const toastId = showLoadingToast("Fetching assignments", () => {
            cancelSource.cancel("User cancelled request");
        });

        try {
            setLoading(true);
            setError('');
            setData([]);

            const response = await authDataMiddleware(ASSIGNMENTS_ENDPOINT, 'GET', {}, cancelSource as any);

            // Check if response exists and has custom properties
            const responseData = response?.data;

            // Handle custom properties that might be in the response data
            if (responseData && responseData.notOnboarded) {
                setTenantId(responseData.tenantId || '');
                setShowOnboardingDialog(true);
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

                try {
                    const parsedJson = JSON.parse(rawDataStr);
                    const parsedData: Assignments[] = z.array(assignmentsSchema).parse(parsedJson.data);
                    setData(parsedData);

                    // Show toast message based on the status
                    const { message } = parsedJson;
                    const status = parsedJson.status?.toLowerCase() || 'success';

                    toast.update(toastId, {
                        render: message || "Data fetched successfully",
                        type: status === 'success' ? 'success' :
                            status === 'warning' ? 'warning' : 'error',
                        isLoading: false,
                        autoClose: toastDuration
                    });
                } catch (parseError) {
                    console.error('Error parsing data:', parseError);
                    toast.update(toastId, {
                        render: `Failed to parse assignments: ${(parseError as Error).message}`,
                        type: 'error',
                        isLoading: false,
                        autoClose: toastDuration
                    });
                }
            } else {
                toast.update(toastId, {
                    render: "No data received",
                    type: 'warning',
                    isLoading: false,
                    autoClose: toastDuration
                });
            }
        } catch (error) {
            console.error('Error:', error);

            if (error && typeof error === 'object' && 'isCancelled' in error) {
                toast.update(toastId, {
                    render: 'Request was cancelled',
                    type: 'info',
                    isLoading: false,
                    autoClose: toastDuration
                });
            } else {
                const errorMessage = `Failed to fetch assignments. ${(error as Error).message || 'Server error'}`;
                setError(errorMessage);
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

    const fetchGroupData = async (cancelSource = createCancelTokenSource()) => {
        const toastId = showLoadingToast("Fetching groups", () => {
            cancelSource.cancel("User cancelled request");
        });

        try {
            setLoading(true);
            const response = await authDataMiddleware(GROUPS_LIST_ENDPOINT, 'GET', {}, cancelSource as any);

            if (response && response.data) {
                // Handle different response data formats
                let groupsData;

                if (typeof response.data === 'string') {
                    groupsData = JSON.parse(response.data);
                    groupsData = groupsData.data || groupsData;
                } else {
                    groupsData = response.data.data || response.data;
                }

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
                    render: "No group data received",
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
                toast.update(toastId, {
                    render: `Failed to fetch groups: ${(error as Error).message || 'Unknown error'}`,
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