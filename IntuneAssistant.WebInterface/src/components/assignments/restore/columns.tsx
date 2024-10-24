"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type policyRestoreModel} from "@/components/assignments/restore/schema"
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {migrationNeeded, readyForMigration, filterType} from "@/components/assignments/migrate/fixed-values.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircle, TriangleAlert, BicepsFlexed} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {DataTableRowActions} from "@/components/assignments/restore/data-table-row-actions.tsx";
import {useState} from "react";
import {GroupedRow} from "@/components/data-table-group-row.tsx";

export const columns: ColumnDef<policyRestoreModel>[] = [
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
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'policyType',
        header: 'Type',
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
            const sourcePolicyName = row.original.name;
            const sourcePolicyId = row.original?.id;

            if (!sourcePolicyName) {
                return <em>Policy does not exist</em>;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span>{sourcePolicyName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{sourcePolicyId}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'assignments',
        header: 'Assignments',
        cell: ({ row }) => {
            const assignments = row.original.assignments;
            return <GroupedRow assignments={assignments} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
];