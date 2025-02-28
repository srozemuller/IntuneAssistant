import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {ASSIGNMENTS_ENDPOINT, GROUPS_ENDPOINT} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/overview/columns.tsx";

import { z } from "zod";
import { assignmentsSchema, type Assignments } from "@/components/assignments/overview/schema";
import {type GroupModel, groupSchema} from "@/schemas/groupSchema";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";


export default function DemoPage() {
    const [data, setData] = useState<Assignments[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [groupData, setGroupData] = useState<GroupModel[]>([]);

    const fetchData = async () => {
        const toastId = toast.loading('Fetching assignments');
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(ASSIGNMENTS_ENDPOINT);
            const rawData = typeof response?.data === 'string' ? response.data : JSON.stringify(response?.data);
            setRawData(rawData);
            console.log('Raw data:', rawData);
            const parsedData: Assignments[] = z.array(assignmentsSchema).parse(JSON.parse(rawData).data);
            setData(parsedData);

            // Filter assignments with assignmentType "EntraID Group" and find unique targetIds
            const uniqueTargetIds = [...new Set(parsedData
                .filter(assignment => assignment.assignmentType === 'Entra ID Group')
                .map(assignment => assignment.targetId))];
            // Send unique targetIds to GROUPS_ENDPOINT
            console.log('Unique targetIds:', uniqueTargetIds);
            const groupResponse = await authDataMiddleware(GROUPS_ENDPOINT, 'POST', uniqueTargetIds);
            const rawGroupData = typeof groupResponse?.data === 'string' ? groupResponse.data : JSON.stringify(groupResponse?.data);
            const parsedGroupData: GroupModel[] = z.array(groupSchema).parse(JSON.parse(rawGroupData));
            setGroupData(parsedGroupData);

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
            toast.update(toastId, { render: errorMessage, type: 'error', isLoading: false, autoClose: toastDuration });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable columns={columns(groupData)} data={data} rawData={rawData} groupData={groupData}  fetchData={fetchData} source="assignments"  />
        </div>
    );
}