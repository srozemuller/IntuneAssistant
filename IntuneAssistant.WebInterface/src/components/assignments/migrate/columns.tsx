"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { type AssignmentsMigrationModel } from "@/components/assignments/migrate/schema"
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {migrationNeeded, readyForMigration, filterType} from "@/components/assignments/migrate/fixed-values.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircle, TriangleAlert, BicepsFlexed} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {DataTableRowActions} from "@/components/assignments/migrate/data-table-row-actions.tsx";
import {useState} from "react";


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
        cell: ({ row }) => {
            const isReadyForMigration = row.original.isReadyForMigration;
            return (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                    disabled={!isReadyForMigration}
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'sourcePolicy.policyType',
        header: 'Policy Type',
    },
    {
        accessorKey: 'sourcePolicy.name',
        header: 'Source Policy Name',
        cell: ({ row }) => {
            const sourcePolicyName = row.original.sourcePolicy?.name;
            const sourcePolicyId = row.original.sourcePolicy?.id;

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
        accessorKey: 'sourcePolicy.assignments',
        header: 'Source Policy Assignments',
        cell: ({ row }) => {
            const assignments = row.original.sourcePolicyGroups;
            const groupToMigrate = row.original.groupToMigrate;

            if (!assignments || assignments.length === 0) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex w-[100px] items-center">
                                    <TriangleAlert className={`h-5 w-5 text-orange-500`} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>No assignments, is migration needed?</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }

            return (
                <div>
                    {assignments.map((assignment, index) => (
                        <span
                            key={index}
                            className={assignment === groupToMigrate ? 'text-primary' : ''}
                        >
                            {assignment}
                            {index < assignments.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'groupToMigrate',
        header: 'Group to migrate',
    },
    {
        id: "excludeGroupFromSource",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span>Exclude</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Exclude the group from the source policy</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const [isExcluded, setIsExcluded] = useState(true);
            const [isRemoved, setIsRemoved] = useState(false);

            const handleExcludeChange = (value: boolean) => {
                setIsExcluded(value);
                row.original.excludeGroupFromSource = value;
                if (value) {
                    setIsRemoved(false);
                    row.original.removeGroupFromSource = false;
                }
            };

            return (
                <Checkbox
                    checked={isExcluded}
                    onCheckedChange={(value) => handleExcludeChange(!!value)}
                    aria-label="Exclude group from source"
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "removeGroupFromSource",
        header: () => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span>Remove</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Remove the group from the source policy</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
        cell: ({ row }) => {
            const [isExcluded, setIsExcluded] = useState(true);
            const [isRemoved, setIsRemoved] = useState(false);

            const handleRemoveChange = (value: boolean) => {
                setIsRemoved(value);
                row.original.removeGroupFromSource = value;
                if (value) {
                    setIsExcluded(false);
                    row.original.excludeGroupFromSource = false;
                }
            };

            return (
                <Checkbox
                    checked={isRemoved}
                    onCheckedChange={(value) => handleRemoveChange(!!value)}
                    aria-label="Remove group from source"
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'destinationPolicy.name',
        header: 'Destination policy Name',
        cell: ({ row }) => {
            const policyName = row.original.destinationPolicy?.name;
            const policyId = row.original.destinationPolicy?.id;

            if (!policyName) {
                return <em>Policy does not exist</em>;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span>{policyName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{policyId}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'destinationPolicy.assignments',
        header: 'Replacement Policy Assignments',
        cell: ({ row }) => {
            const assignments = row.original.destinationPolicyGroups;
            const groupToMigrate = row.original.groupToMigrate;

            return (
                <div>
                    {assignments?.map((assignment, index) => (
                        <span
                            key={index}
                            className={assignment === groupToMigrate ? 'text-primary' : ''}
                        >
                            {assignment}
                            {index < assignments.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'filterToMigrate.displayName',
        header: 'Filter Name',
        cell: ({ row }) => {
            const filterName = row.original.filterToMigrate?.displayName;
            const filterRule = row.original.filterToMigrate?.rule;

            if (!filterName) {
                return <em>No filter</em>;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span>{filterName}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{filterRule}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'filterType',
        header: 'Filter Type',
        cell: ({ row }) => {
            const type = row.original.filterType;
            const filter = filterType.find(f => f.value === type);

            if (!filter) {
                return <em>Unknown</em>;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex items-center">
                                <filter.icon className={`h-5 w-5 ${filter.color}`} />
                                <span className="ml-2">{filter.label}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{filter.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
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
        accessorKey: "isReadyForMigration",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ready for Migration" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isReadyForMigration");
            const isMigrated = row.original.isMigrated;
            const status = readyForMigration.find(
                (status) => status.value === row.original.isReadyForMigration,
            );
            const migrationCheckResult = row.original.migrationCheckResult;
            const color = isMigrated ? "text-gray-500" : readyForMigration.find(status => status.value === row.original.isReadyForMigration)?.color || "text-default";
            const getTooltipMessage = () => {
                if (!migrationCheckResult) return "Migration check result is missing.";
                const messages = [];
                if (isMigrated) return "Migration is already done.";
                if (!migrationCheckResult.sourcePolicyExists) messages.push("Source policy does not exist.");
                if (!migrationCheckResult.sourcePolicyIsUnique) messages.push("Source policy is not unique.");
                if (!migrationCheckResult.destinationPolicyExists) messages.push("Destination policy does not exist.");
                if (!migrationCheckResult.destinationPolicyIsUnique) messages.push("Destination policy is not unique.");
                if (!migrationCheckResult.groupExists) messages.push("Group does not exist.");
                return messages.join(" ");
            };

            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className={`flex w-[100px] items-center ${isMigrated ? 'text-gray-500' : ''}`}>
                                    <CheckCircle />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{getTooltipMessage()}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className={`flex w-[100px] items-center ${color}`}>
                                <status.icon className={`h-5 w-5 ${color}`}/>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{getTooltipMessage()}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
];