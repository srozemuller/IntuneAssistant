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
            console.log('Raw data:', rawData);
            const parsedData: Policy[] = JSON.parse(rawData);
            const transformedData = parsedData.map((policy: Policy) => ({
                ...policy,
                includedUsersReadable: policy.conditions.users.includeUsersReadable.map((user: User) => user.displayName).join(', '),
                excludedUsersReadable: policy.conditions.users.excludeUsersReadable.map((user: User) => user.displayName).join(', '),
            }));
            setData(transformedData);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = `Failed to fetch policies. ${(error as Error).message}`;
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        toast.promise(fetchData(), {
            loading: `Searching for conditional access policies...`,
            success: `Conditional access policies fetched successfully`,
            error: (err) => `Failed to get conditional access policies because: ${err.message}`,
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