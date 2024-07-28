import { useEffect, useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { CA_POLICIES_ENDPOINT } from "@/components/constants/apiUrls.js";
import {columns} from "@/components/policies/ca/columns.tsx";
import {toast} from "sonner";

interface User {
    displayName: string;
}

interface Policy {
    id: string;
    displayName: string;
    state: string;
    conditions: {
        users: {
            includeUsersReadable: User[];
            excludeUsersReadable: User[];
        };
    };
    grantControls?: {
        builtInControls?: string[];
    };
    includedUsersReadable?: string;
    excludedUsersReadable?: string;
    modifiedDateTime: string;
    createdDateTime: string;
}

export default function DemoPage() {
    const [data, setData] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset the error state to clear previous errors
            const rawData: string = await authDataMiddleware(CA_POLICIES_ENDPOINT);
            const parsedData: Policy[] = JSON.parse(rawData);
            const transformedData = parsedData.map((policy: Policy) => ({
                ...policy,
                includedUsersReadable: policy.conditions.users.includeUsersReadable.map((user: User) => user.displayName).join(', '),
                excludedUsersReadable: policy.conditions.users.excludeUsersReadable.map((user: User) => user.displayName).join(', '),
            }));
            setData(transformedData);
        } catch (error) {
            console.error('Error:', error);
            setError(`Failed to fetch policies. ${(error as Error).message}`);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        toast.promise(fetchData(), {
            loading: `Updating alerting status for`,
            success: `Alerts "enabled" : "disabled"} for . Reload the page to see the changes.`,
            error: `Failed to update alerting status for ${error} `,
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}