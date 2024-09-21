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
import {isAssignedValues} from "@/components/assignments/overview/fixed-values.tsx";


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
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
        accessorKey: "assignmentType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Assignment Type" />
        ),
        cell: ({ row }) => <div>{row.getValue("assignmentType")}</div>,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
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