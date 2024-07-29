// src/components/policies/ca/columns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

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

export const columns: ColumnDef<Policy>[] = [
    {
        header: 'Display Name',
        accessorKey: 'displayName',
        enableColumnFilter: true,
    },
    {
        header: 'State',
        accessorKey: 'state',
        enableColumnFilter: true,
        cell: ({ getValue }) => {
            const state = getValue<string>();
            if (state === 'enabled') {
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            } else if (state === 'disabled') {
                return <XCircle className="h-5 w-5 text-red-500" />;
            } else {
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            }
        },
    },
    {
        header: 'Included Users',
        accessorKey: 'includedUsersReadable',
        enableColumnFilter: true,
    },
    {
        header: 'Excluded Users',
        accessorKey: 'excludedUsersReadable',
        enableColumnFilter: true,
    },
    {
        header: 'Last Modified',
        accessorKey: 'modifiedDateTime',
        enableColumnFilter: true,
    },
    {
        header: 'Creation Date',
        accessorKey: 'createdDateTime',
        enableColumnFilter: true,
    },
];