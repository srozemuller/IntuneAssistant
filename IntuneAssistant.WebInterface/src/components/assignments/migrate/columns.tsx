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
import {CheckCircle, TriangleAlert, BicepsFlexed, CircleX} from "lucide-react";
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
export const columns = (
    groupData: z.infer<typeof groupsSchema>[],
    filters: z.infer<typeof filterSchema>[],
    backupStatus: Record<string, boolean>,
    setTableData: React.Dispatch<React.SetStateAction<AssignmentsMigrationModel[]>>
): ColumnDef<AssignmentsMigrationModel>[] => {
    console.log("Columns received backupStatus:", backupStatus);
    return [

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
                const providedPolicyName = row.original.providedPolicyName;

                if (!policyName) {
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="text-red-500 cursor-default"><em>{providedPolicyName || "Policy does not exist"}</em></span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Policy does not exist</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
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

                const includedGroups = assignments.filter(assignment => !assignment?.target?.["@odata.type"].includes("exclusion"));
                const excludedGroups = assignments.filter(assignment => assignment?.target?.["@odata.type"].includes("exclusion"));

                return (
                    <div>
                        {[...includedGroups, ...excludedGroups].map((assignment, index) => {
                            const groupId = assignment?.target?.groupId;
                            const odataType = assignment?.target?.["@odata.type"];
                            const isExcluded = assignment?.target?.["@odata.type"].includes("exclusion");

                            if (odataType === "#microsoft.graph.allDevicesAssignmentTarget") {
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>All Devices</span>
                                    </div>
                                );
                            } else if (odataType === "#microsoft.graph.allLicensedUsersAssignmentTarget") {
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>All Licensed Users</span>
                                    </div>
                                );
                            } else if (groupId) {
                                const groupInfo = groupData.find(group => group.id === groupId) || null;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => { if (groupId) handleGroupClick(groupId); }}
                                    >
                                        {isExcluded ?
                                            <CircleX className="h-4 w-4 text-red-500" /> :
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        }
                                        <span className="text-primary group-hover:text-secondary">{groupInfo?.displayName || groupId}</span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <TriangleAlert className="h-4 w-4 text-orange-500" />
                                        <span className="text-red-500 cursor-default"><em>Group not found</em></span>
                                    </div>
                                );
                            }
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
                        {groupInfo || groupName === "All Devices" ? (
                            <span
                                className={groupName === "All Devices" ? "" : "text-primary cursor-pointer group-hover:text-secondary "}
                                onClick={groupInfo && groupName !== "All Devices" ? handleGroupClick : undefined}
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
                        {groupInfo && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent className="container max-w-[60%] py-6">
                                    <DialogTitle>Group members</DialogTitle>
                                    <DialogDescription>
                                        These are the members of the selected group.
                                    </DialogDescription>
                                    <div className="container max-w-[95%] py-6">
                                        <DataTable
                                            columns={memberColumns}
                                            data={members}
                                            source="group-members"
                                            rawData={members}
                                            fetchData={() => Promise.resolve()}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'assignmentDirection',
            header: 'Include/Exclude',
            cell: ({row}) => {
                const assignmentDirection = row.getValue('assignmentDirection') as string;
                return <span>{assignmentDirection}</span>;
            },
        },
        {
            accessorKey: 'assignmentAction',
            header: 'Action',
            cell: ({row}) => {
                const action = row.getValue('assignmentAction') as string;
                const getColorClass = (action: string) => {
                    switch(action?.toLowerCase()) {
                        case 'add': return 'text-green-500';
                        case 'replace': return 'text-orange-500';
                        case 'remove': return 'text-red-500';
                        default: return '';
                    }
                };

                return <span className={getColorClass(action)}>{action}</span>;
            },
        },
        {
            accessorKey: 'filterToMigrate',
            header: 'Filter',
            cell: ({row}) => {
                const filterToMigrate = row.original.filterToMigrate;
                const filterExist = row.original.migrationCheckResult?.filterExist;
                const filterName = row.original.filterName;
                if (filterToMigrate && filterToMigrate.id) {
                    return <FilterCell row={row} filters={filters}/>;
                }
                if (!filterName) {
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
                const isMigrated = row.original.isMigrated;
                const isReadyForMigration = row.original.isReadyForMigration;
                const migrationCheckResult = row.original.migrationCheckResult;
                const color = isMigrated ? "text-gray-500" : readyForMigration.find(status => status.value === isReadyForMigration)?.color || "text-default";

                const getTooltipMessage = () => {
                    if (!migrationCheckResult) return "Migration check result is missing.";
                    const messages = [];
                    if (isMigrated) return "Migration is already done.";
                    if (isReadyForMigration) return "Ready for migration.";
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

                if (isMigrated) {
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={`flex w-[100px] items-center ${isMigrated ? 'text-gray-500' : ''}`}>
                                        <CheckCircle className={`h-5 w-5 ${color}`}/>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{getTooltipMessage()}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                }

                const status = readyForMigration.find(status => status.value === isReadyForMigration);
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
                                    <status.icon className={`h-5 w-5 ${color}`} />
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
            accessorKey: "backupStatus",
            accessorFn: (row) => {
                const status = row.isBackedUp;
                if (status === undefined) return "unknown";
                return status ? "backed-up" : "not-backed-up";
            },
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Backup Status" />
            ),
            cell: ({ row }) => {
                const status = row.original.isBackedUp;

                if (status === undefined) {
                    return <TriangleAlert className="h-5 w-5 text-orange-500" />;
                } else if (status) {
                    return <CheckCircle className="h-5 w-5 text-green-500" />;
                } else {
                    return <CircleX className="h-5 w-5 text-red-500" />;
                }
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        }
    ];
}