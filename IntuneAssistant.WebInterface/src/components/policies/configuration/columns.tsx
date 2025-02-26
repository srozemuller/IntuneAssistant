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

import { type Policy } from "@/components/policies/configuration/schema"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/policies/configuration/data-table-row-actions.tsx"
import {isAssignedValues} from "@/components/policies/configuration/fixed-values.tsx";

export const columns: ColumnDef<Policy>[] = [
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
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
        accessorKey: "policySubType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="policySubType" />
        ),
        cell: ({ row }) => <div>{row.getValue("policySubType")}</div>,
    },
    {
        accessorKey: "platforms",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="platforms" />
        ),
        cell: ({ row }) => <div>{row.getValue("platforms")}</div>,
    },
    {
        accessorKey: "settingCount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Setting Count" />
        ),
        cell: ({ row }) => <div>{row.getValue("settingCount")}</div>,
    },
    {
        accessorKey: "isAssigned",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Is Assigned" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isAssigned")
            const status = isAssignedValues.find(
                (status) => status.value === row.original.isAssigned,
            );
            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex w-[100px] items-center">
                                    <CheckCircle/>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Unknown</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
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
                            <p>{status.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "createdDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created Date Time" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdDateTime"));
            const formattedDate = date.toLocaleString();
            return <div>{formattedDate}</div>;
        },
    },
    {
        accessorKey: "lastModifiedDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Last Modified Date Time" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("lastModifiedDateTime"));
            const formattedDate = date.toLocaleString();
            return <div>{formattedDate}</div>;
        },
    },
];