"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { CheckCircle, XCircle, TriangleAlert } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { DeviceFilter } from "./device-filter";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { type Task } from "@/components/policies/ca/schema"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/policies/ca/data-table-row-actions.tsx"
import { statuses } from "@/components/policies/ca/fixed-values"

// Add a helper function to determine if a policy has device compliance settings
const hasDeviceComplianceRequirement = (task: any): string[] => {
    const deviceFilter = task.conditions?.devices?.deviceFilter?.rule;
    const result: string[] = [];

    if (!deviceFilter) return result;

    if (deviceFilter.includes("device.isCompliant -eq True")) {
        result.push("compliant");
    }
    if (deviceFilter.includes("device.isCompliant -eq False") ||
        deviceFilter.includes("device.isCompliant -ne True")) {
        result.push("non-compliant");
    }
    if (deviceFilter.includes("device.trustType -eq \"ServerAD\"") ||
        deviceFilter.includes("device.trustType -eq 'ServerAD'")) {
        result.push("hybrid-joined");
    }

    return result;
};

export const columns: ColumnDef<Task>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "displayName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Display Name" />
        ),
        cell: ({ row }) => <div className="w-[150px]">{row.getValue("displayName")}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'state',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = statuses.find(
                (status) => status.value === row.getValue('state'),
            );
            if (!status) {
                return undefined;
            }
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                        <div className="flex w-[100px] items-center">
                            <status.icon className={`h-5 w-5 ${status.color}`}/>
                        </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{row.getValue("state")}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "includeUsersReadable",
        accessorKey: 'includeUsersReadable',
        accessorFn: (row) => row.conditions?.users.includeUsersReadable?.map(user => user.displayName).join(", ") || "N/A",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Included Users" />
        ),
        cell: ({ row }) => {
            const includedUsers = row.original.conditions?.users?.includeUsersReadable;
            return includedUsers?.map(user => user.displayName).join(", ") || "N/A";
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: "excludeUsersReadable",
        accessorKey: 'excludeUsersReadable',
        accessorFn: (row) => row.conditions?.users.excludeUsersReadable?.map(user => user.displayName).join(", ") || "N/A",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Excluded Users" />
        ),
        cell: ({ row }) => {
            const excludedUsers = row.original.conditions?.users?.excludeUsersReadable;
            return excludedUsers?.map(user => user.displayName).join(", ") || "N/A";
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: "includeGroupsReadable",
        accessorKey: 'includeGroupsReadable',
        accessorFn: (row) => row.conditions?.users.includeGroupsReadable?.map(user => user.displayName).join(", ") || "N/A",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Included Groups" />
        ),
        cell: ({ row }) => {
            const includedGroups = row.original.conditions?.users?.includeGroupsReadable;
            return includedGroups?.map(group => group.displayName).join(", ") || "N/A";
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: "excludeGroupsReadable",
        accessorKey: 'excludeGroupsReadable',
        accessorFn: (row) => row.conditions?.users.excludeGroupsReadable?.map(user => user.displayName).join(", ") || "N/A",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Excluded Groups" />
        ),
        cell: ({ row }) => {
            const excludedGroups = row.original.conditions?.users?.excludeGroupsReadable;
            return excludedGroups?.map(group => group.displayName).join(", ") || "N/A";
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "createdDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdDateTime"));
            const formattedDate = date.toLocaleString();
            return <div>{formattedDate}</div>;
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "modifiedDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Modified At" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("modifiedDateTime"));
            const formattedDate = date.toLocaleString();
            return <div>{formattedDate}</div>;
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: "deviceCompliance",
        header: ({ column }) => (
            <DeviceFilter column={column} title="Device Filter" />
        ),
        cell: ({ row }) => {
            const complianceTypes = hasDeviceComplianceRequirement(row.original);
            return (
                <div className="space-x-1">
                    {complianceTypes.map(type => (
                        <span key={type} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {type === 'compliant' ? 'Compliant Device' :
                  type === 'non-compliant' ? 'Non-Compliant Device' :
                      'Hybrid Joined'}
            </span>
                    ))}
                    {complianceTypes.length === 0 && (
                        <span className="text-gray-500">None</span>
                    )}
                </div>
            );
        },
        accessorFn: (row) => {
            return hasDeviceComplianceRequirement(row).join(",");
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const complianceTypes = hasDeviceComplianceRequirement(row.original);
            return filterValue.some((filter: string) => complianceTypes.includes(filter));
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    }
]