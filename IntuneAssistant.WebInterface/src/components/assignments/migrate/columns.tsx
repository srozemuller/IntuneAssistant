"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type AssignmentsMigrationModel } from "@/components/assignments/migrate/schema"
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {migrationNeeded} from "@/components/assignments/migrate/fixed-values.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircle} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {DataTableRowActions} from "@/components/assignments/migrate/data-table-row-actions.tsx";



export const columns: ColumnDef<AssignmentsMigrationModel>[] = [
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
        accessorKey: 'resourceType',
        header: 'Policy Type',
    },
    {
        accessorKey: 'currentPolicyId',
        header: 'Current Policy ID',
    },
    {
        accessorKey: 'currentPolicyName',
        header: 'Current Policy Name',
    },
    {
        accessorKey: 'currentPolicyAssignments',
        header: 'Current Policy Assignments',
    },
    {
        accessorKey: 'replacementPolicyId',
        header: 'Replacement Policy ID',
    },
    {
        accessorKey: 'replacementPolicyName',
        header: 'Replacement Policy Name',
    },
    {
        accessorKey: 'replacementPolicyAssignments',
        header: 'Replacement Policy Assignments',
        cell: ({ getValue }) => {
            const assignments = getValue() as (string | null)[];
            return assignments.join(', ');
        },
    },
    {
        accessorKey: "isMigrated",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Is Migrated" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isMigrated")
            const status = migrationNeeded.find(
                (status) => status.value === row.original.isMigrated,
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
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
];