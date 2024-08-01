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

import { labels, statuses } from "@/components/policies/ca/fixed-values"
import { type Policy } from "@/components/policies/configuration/schema"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/policies/configuration/data-table-row-actions.tsx"

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
            const isAssigned = row.original.assignments.length > 0
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            {isAssigned ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <TriangleAlert className="h-5 w-5 text-yellow-500" />
                            )}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isAssigned}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
    {
        accessorKey: "createdDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created Date Time" />
        ),
        cell: ({ row }) => <div>{row.getValue("createdDateTime")}</div>,
    },
    {
        accessorKey: "lastModifiedDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Last Modified Date Time" />
        ),
        cell: ({ row }) => <div>{row.getValue("lastModifiedDateTime")}</div>,
    },
];