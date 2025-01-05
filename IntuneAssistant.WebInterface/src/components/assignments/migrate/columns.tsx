"use client"

import { type ColumnDef } from "@tanstack/react-table"
import {
    assignmentMigrationSchema,
    type AssignmentsMigrationModel,
    groupsSchema,
    assignmentFilterSchema
} from "@/components/assignments/migrate/schema"
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {migrationNeeded, readyForMigration, filterType} from "@/components/assignments/migrate/fixed-values.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {CheckCircle, TriangleAlert, BicepsFlexed} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {useEffect, useState} from "react";
import {z} from "zod";
import type {filterSchema} from "@/schemas/filters.tsx";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {type UserMember, fetchGroupMembers, memberColumns} from "@/components/dialogs/group-membership-dialog.tsx"
import {DataTable} from "@/components/assignments/overview/data-table-groups.tsx";

const FilterCell = ({ row, filters }: { row: any, filters: z.infer<typeof filterSchema>[] }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const filterToMigrate = row.original.filterToMigrate;
    const hasFilterProvided = row.original.filterName;
    const filterExist = row.original.migrationCheckResult?.filterExist;

    const handleFilterClick = () => {
        setIsDialogOpen(true);
    };

    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span
                            onClick={hasFilterProvided ? handleFilterClick : undefined}
                            className={`cursor-pointer ${!hasFilterProvided ? 'text-gray-500 italic' : filterExist === false ? 'text-red-500 italic' : 'text-primary'}`}
                        >
                            {!hasFilterProvided ? <em>No filter provided</em> : filterToMigrate.displayName}
                        </span>
                    </TooltipTrigger>
                    {!hasFilterProvided && (
                        <TooltipContent>
                            <p>No filter found</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
            {isDialogOpen && hasFilterProvided && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogTitle>{filterToMigrate.displayName}</DialogTitle>
                        <DialogDescription>
                            <p>ID: {filterToMigrate.id}</p>
                            <p>Description: {filterToMigrate.description}</p>
                            <p>Platform: {filterToMigrate.platform}</p>
                            <p>Rule: {filterToMigrate.rule}</p>
                            <p>Assignment Filter Management Type: {filterToMigrate.assignmentFilterManagementType}</p>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
export const columns = (groupData: z.infer<typeof groupsSchema>[], filters: z.infer<typeof filterSchema>[], setTableData: React.Dispatch<React.SetStateAction<AssignmentsMigrationModel[]>>): ColumnDef<AssignmentsMigrationModel>[] => [
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
        accessorKey: 'policy.name',
        header: 'Policy Name',
        cell: ({ row }) => {
            const policyName = row.original.policy?.name;
            const policyId = row.original.policy?.id;

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
        accessorKey: 'policy.assignments',
        header: 'Current Assignments',
        cell: ({ row }) => {
            const [assignments, setAssignments] = useState(row.original.policy?.assignments || []);
            const [members, setMembers] = useState<UserMember[]>([]);
            const [isDialogOpen, setIsDialogOpen] = useState(false);

            useEffect(() => {
                setAssignments(row.original.policy?.assignments || []);
            }, [row.original.policy]);

            const handleGroupClick = (groupId: string) => {
                fetchGroupMembers(groupId, setMembers, setIsDialogOpen);
            };

            return (
                <div>
                    {assignments.map((assignment, index) => {
                        const groupId = assignment.target.groupId;
                        const groupInfo = groupData.find(group => group.id === groupId) || null;

                        return (
                            <span
                                key={index}
                                className="text-primary cursor-pointer"
                                onClick={() => handleGroupClick(groupId)}
                            >
                            {groupInfo?.displayName || groupId}
                                {index < assignments.length - 1 && ', '}
                        </span>
                        );
                    })}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="container max-w-[60%] py-6">
                            <DialogTitle>Group members</DialogTitle>
                            <DialogDescription>
                                These are the members of the selected group.
                            </DialogDescription>
                            <div className="container max-w-[95%] py-6">
                                <DataTable columns={memberColumns} data={members} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        },
    },
    {
        accessorKey: 'groupToMigrate',
        header: 'Group to Migrate',
        cell: ({ row }) => {
            const groupName = row.getValue('groupToMigrate') as React.ReactNode;
            const groupInfo = groupData.find(group => group.displayName === groupName) || null;
            const [members, setMembers] = useState<UserMember[]>([]);
            const [isDialogOpen, setIsDialogOpen] = useState(false);

            const handleGroupClick = () => {
                if (groupInfo) {
                    fetchGroupMembers(groupInfo.id, setMembers, setIsDialogOpen);
                }
            };

            return (
                <div>
                    {groupInfo ? (
                        <span
                            className="text-primary cursor-pointer"
                            onClick={handleGroupClick}
                        >
                        {groupName}
                    </span>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="text-red-500 cursor-default"><em>{groupName}</em></span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Group not found</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="container max-w-[60%] py-6">
                            <DialogTitle>Group members</DialogTitle>
                            <DialogDescription>
                                These are the members of the selected group.
                            </DialogDescription>
                            <div className="container max-w-[95%] py-6">
                                <DataTable columns={memberColumns} data={members} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        },
    },
    {
        accessorKey: 'assignmentType',
        header: 'Include/Exclude',
        cell: ({ row }) => {
            const assignmentType = row.getValue('assignmentType') as string;
            return <span>{assignmentType}</span>;
        },
    },
    {
        accessorKey: 'filterToMigrate',
        header: 'Filter',
        cell: ({ row }) => {
            const filterToMigrate = row.original.filterToMigrate;
            const filterExist = row.original.migrationCheckResult?.filterExist;
            const filterName = row.original.filterName;
            if (filterToMigrate && filterToMigrate.id) {
                return <FilterCell row={row} filters={filters} />;
            }
            if (!filterName){
                return <span className="text-gray-500 italic"><em>No filter provided</em></span>;
            }
            if (filterExist === false) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-red-500 italic"><em>{filterName}</em></span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Filter does not exist.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }

        },
    },
    {
        accessorKey: 'filterType',
        header: 'Type',
        cell: ({ row }) => {
            const filterType = row.getValue('filterType') as string;
            const filterName = row.original.filterName;
            if (!filterName) {
                return <span className="text-gray-500 italic"><em>{filterType}</em></span>;
            }
            return <span>{filterType}</span>;
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
               // if (isMigrated) return "Migration is already done.";
                if (!migrationCheckResult.policyExists) messages.push("Destination policy does not exist.");
                if (!migrationCheckResult.policyIsUnique) messages.push("Destination policy is not unique.");
                if (!migrationCheckResult.groupExists) messages.push("Group does not exist.");
                if (!migrationCheckResult.correctAssignmentTypeProvided) messages.push("Incorrect assignment type provided (must be included or excluded).");
                if (!migrationCheckResult.filterExist) messages.push("Filter does not exist.");
                if (!migrationCheckResult.filterIsUnique) messages.push("Filter is not unique.");
                if (!migrationCheckResult.correctFilterTypeProvided) messages.push("Incorrect filter type provided (must be included or excluded).");
                if (!migrationCheckResult.correctFilterPlatform) messages.push("Policy platform does not fit filter platform.");
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

];