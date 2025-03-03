import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {ASSIGNMENTS_APPS_ENDPOINT, GROUPS_ENDPOINT} from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/apps/columns.tsx";

import { z } from "zod";
import { assignmentSchema, type Assignment } from "@/components/assignments/apps/schema";
import {type GroupModel, groupSchema} from "@/schemas/groupSchema";
// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";


export default function DemoPage() {
    const [data, setData] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [rawData, setRawData] = useState<string>('');
    const [groupData, setGroupData] = useState<GroupModel[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            setData([]); // Clear the table data
            const response = await authDataMiddleware(ASSIGNMENTS_APPS_ENDPOINT);
            const rawData = typeof response?.data.data === 'string' ? (response.data).data : JSON.stringify((response?.data).data);
            setRawData(rawData);
            console.log('Raw data:', rawData);
            const parsedData: Assignment[] = z.array(assignmentSchema).parse(JSON.parse(rawData));
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
        toast.promise(fetchData(), {
            pending: {
                render:  `Searching for assignments ...`,
            },
            success: {
                render: `Assignments fetched successfully`,
            },
            error:  {
                render: (errorMessage) => `Failed to get assignments because: ${errorMessage}`,
            }
        });
    }, []);

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <DataTable columns={columns(groupData)} data={data} rawData={rawData} groupData={groupData}  fetchData={fetchData} source="assignments"  />
        </div>
    );
}