import { type ColumnDef } from "@tanstack/react-table";

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
    },
    {
        header: 'State',
        accessorKey: 'state',
    },
    {
        header: 'Included Users',
        accessorKey: 'includedUsersReadable',
    },
    {
        header: 'Excluded Users',
        accessorKey: 'excludedUsersReadable',
    },
    {
        header: 'Last Modified',
        accessorKey: 'modifiedDateTime',
    },
    {
        header: 'Creation Date',
        accessorKey: 'createdDateTime',
    },
];