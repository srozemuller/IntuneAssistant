import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
import { ASSIGNMENTS_APPS_ENDPOINT, GROUPS_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/apps/columns.tsx";
import { z } from "zod";
import { assignmentSchema, type Assignment } from "@/components/assignments/apps/schema";
import { type GroupModel, groupSchema } from "@/schemas/groupSchema";

import { withOnboardingCheck } from "@/components/with-onboarded-check.tsx";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import { showLoadingToast } from '@/utils/toastUtils';


interface AssignmentsResponse {
    notOnboarded?: boolean;
    tenantId?: string;
    data?: any;
    message?: string;
    status?: string;
}

function AppAssignmentsPage() {
    const [data, setData] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [groupData, setGroupData] = useState<GroupModel[]>([]);
    const [tenantId, setTenantId] = useState<string>('');
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

    const fetchData = async (cancelSource = createCancelTokenSource()) => {
        const toastId = showLoadingToast("Fetching app assignments", () => {
            cancelSource.cancel("User cancelled request");
        });

        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(ASSIGNMENTS_APPS_ENDPOINT, 'GET', {}, cancelSource as any);

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

            const rawData = typeof response?.data?.data === 'string'
                ? response.data.data
                : JSON.stringify(response?.data?.data);

            setRawData(rawData);
            console.log('Raw data:', response);
            const parsedData: Assignment[] = z.array(assignmentSchema).parse(JSON.parse(rawData));
            setData(parsedData);

            // Filter assignments with assignmentType "EntraID Group" and find unique targetIds
            const uniqueTargetIds = [...new Set(parsedData
                .filter(assignment => assignment.assignmentType === 'Entra ID Group')
                .map(assignment => assignment.targetId))];
            // Send unique targetIds to GROUPS_ENDPOINT
            console.log('Unique targetIds:', uniqueTargetIds);
            const groupResponse = await authDataMiddleware(GROUPS_ENDPOINT, 'POST', uniqueTargetIds, cancelSource as any);
            const rawGroupData = typeof groupResponse?.data === 'string'
                ? groupResponse.data
                : JSON.stringify(groupResponse?.data);
            const parsedGroupData: GroupModel[] = z.array(groupSchema).parse(JSON.parse(rawGroupData));
            setGroupData(parsedGroupData);

            // Show toast message based on the status
            const { message, status } = response?.data;
            if (status && typeof status === 'string') {
                const lowerCaseStatus = status.toLowerCase();
                if (lowerCaseStatus === 'success') {
                    toast.update(toastId, { render: message, type: 'success', isLoading: false, autoClose: toastDuration });
                } else if (lowerCaseStatus === 'error') {
                    toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: toastDuration });
                } else if (lowerCaseStatus === 'warning') {
                    toast.update(toastId, { render: message, type: 'warning', isLoading: false, autoClose: toastDuration });
                }
            } else {
                throw new Error('Invalid status in response data');
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to fetch assignments. ${(error as Error).message}`;
            setError(errorMessage);
            toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: toastDuration });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cancelSource = createCancelTokenSource();

        fetchData(cancelSource);

        return () => {
            // Cancel the API call when the component unmounts
            cancelSource.cancel("Component unmounted or user navigated away");
        };
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable
                columns={columns(groupData)}
                data={data}
                rawData={rawData}
                groupData={groupData}
                fetchData={fetchData}
                source="assignments_apps"
            />
        </div>
    );
}

// Export the wrapped component directly
export default withOnboardingCheck(AppAssignmentsPage);