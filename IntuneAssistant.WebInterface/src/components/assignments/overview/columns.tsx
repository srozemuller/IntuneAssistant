"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { CheckCircle, TriangleAlert } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"


import { type Assignments } from "@/components/assignments/overview/schema"
import { DataTableColumnHeader } from "@/components/data-table-column-header"


export const columns: ColumnDef<Assignments>[] = [
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
        accessorKey: "resourceType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => <div>{row.getValue("resourceType")}</div>,
    },
    {
        accessorKey: "resourceName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Resource Name" />
        ),
        cell: ({ row }) => <div>{row.getValue("resourceName")}</div>,
    },
    {
        accessorKey: "isAssigned",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Is Assigned" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isAssigned")
            const isAssigned = row.original.isAssigned
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
        accessorKey: "assignmentType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Assignment Type" />
        ),
        cell: ({ row }) => <div>{row.getValue("assignmentType")}</div>,
    },
    {
        accessorKey: "targetName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Group" />
        ),
        cell: ({ row }) => <div>{row.getValue("targetName")}</div>,
    },
    {
        accessorKey: "filterId",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Filter ID" />
        ),
        cell: ({ row }) => <div>{row.getValue("filterId")}</div>,
    },
    {
        accessorKey: "filterType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Filter Type" />
        ),
        cell: ({ row }) => <div>{row.getValue("filterType")}</div>,
    }
];