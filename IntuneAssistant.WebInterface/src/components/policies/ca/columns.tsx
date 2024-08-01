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

import { type Task } from "@/components/policies/ca/schema"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/policies/ca/data-table-row-actions.tsx"

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
        accessorKey: "state",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="State" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("state")
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            {state === "enabled" ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : state === "enabledForReportingButNotEnforced" ? (
                                <TriangleAlert className="h-5 w-5 text-yellow-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{row.getValue("state")}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
    {
        accessorKey: "conditions.users.includeUsersReadable",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Included Users" />
        ),
        cell: ({ row }) => {
            const includedUsers = row.original.conditions?.users?.includeUsersReadable
            return includedUsers?.map(user => user.displayName).join(", ") || "N/A"
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "conditions.users.excludeUsersReadable",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Excluded Users" />
        ),
        cell: ({ row }) => {
            const includedUsers = row.original.conditions?.users?.excludeUsersReadable
            return includedUsers?.map(user => user.displayName).join(", ") || "N/A"
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "conditions.users.includeGroupsReadable",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Included Groups" />
        ),
        cell: ({ row }) => {
            const includedUsers = row.original.conditions?.users?.includeGroupsReadable
            return includedUsers?.map(user => user.displayName).join(", ") || "N/A"
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "conditions.users.excludeGroupsReadable",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Excluded Groups" />
        ),
        cell: ({ row }) => {
            const includedUsers = row.original.conditions?.users?.excludeGroupsReadable
            return includedUsers?.map(user => user.displayName).join(", ") || "N/A"
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "createdDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => <div className="w-[100]">{row.getValue("createdDateTime")}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: "modifiedDateTime",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Modified At" />
        ),
        cell: ({ row }) => <div className="w-[100]">{row.getValue("modifiedDateTime")}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]