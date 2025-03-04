import { useState, useContext } from "react";
import { DataTableColumnHeader } from "@/components/data-table-column-header.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import authDataMiddleware from "@/components/middleware/fetchData";
import { CheckCircle } from "lucide-react";
import { DataTable } from "./data-table-groups.tsx"; // Ensure you have a DataTable component
import type { ColumnDef } from "@tanstack/react-table";
import type { Assignments } from "@/components/assignments/apps/schema.tsx";
import { accountIsEnabled, isAssignedValues, memberType } from "@/components/assignments/apps/fixed-values.tsx";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GROUPS_ENDPOINT } from "@/components/constants/apiUrls"; // Ensure you have a Dialog component
import type { GroupModel } from "@/schemas/groupSchema";

// Define the UserMember interface
interface UserMember {
    id: string;
    displayName: string;
    accountEnabled: boolean;
    type: string;
}

const fetchGroupMembers = async (id: string, setMembers: React.Dispatch<React.SetStateAction<UserMember[]>>, setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
        const response = await authDataMiddleware(`${GROUPS_ENDPOINT}/${id}/members`);
        if (response?.data) {
            setMembers(response.data);
            console.log("Group members:", response.data);
            setIsDialogOpen(true);
        } else {
            console.error("No data received from the server.");
        }
    } catch (error) {
        console.error("Failed to fetch group members:", error);
    }
};

// Define columns for the DataTable in the dialog
const memberColumns: ColumnDef<UserMember>[] = [
    {
        accessorKey: "displayName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Display Name" />
        ),
        cell: ({ row }) => <div>{row.getValue("displayName")}</div>,
    },
    {
        accessorKey: "accountEnabled",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Enabled" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("accountEnabled");
            const status = accountIsEnabled.find(
                (status) => status.value === row.original.accountEnabled,
            );
            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>

                            </TooltipTrigger>
                            <TooltipContent>
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
                                <status.icon className={`h-5 w-5 ${status.color}`} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{status.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
            const state = row.getValue("isAssigned");
            const status = memberType.find(
                (status) => status.value === row.original.type,
            );
            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex w-[100px] items-center">
                                    [...]
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
                                <status.icon className={`h-5 w-5 ${status.color}`} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{status.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    }
];

export const columns = (groupData: GroupModel[]): ColumnDef<Assignments>[] => [
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
            const state = row.getValue("isAssigned");
            const status = isAssignedValues.find(
                (status) => status.value === row.original.isAssigned,
            );
            if (!status) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex w-[100px] items-center">
                                    <CheckCircle />
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
                                <status.icon className={`h-5 w-5 ${status.color}`} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{status.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
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
        accessorKey: "enrollmentType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Install Type" />
        ),
        cell: ({ row }) => <div>{row.getValue("enrollmentType")}</div>,
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "targetName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Group" />
        ),
        cell: ({ row }) => {
            const assignmentType = row.getValue("assignmentType");
            const targetId: string = row.original.targetId;
            const [members, setMembers] = useState<UserMember[]>([]);
            const [isDialogOpen, setIsDialogOpen] = useState(false);
            const group = groupData.find(group => group.id === targetId);
            let userCount = 0;
            let deviceCount = 0;
            let groupCount = 0;

            if (group) {
                // Check if the group exists and has valid members
                if (group.members) {
                    userCount = group.members.filter(member => member.type === "User").length;
                    deviceCount = group.members.filter(member => member.type === "Device").length;
                    groupCount = group.members.filter(member => member.type === "Group").length;
                }
            }

            // Determine if group is deleted - targetId exists but group is not found
            const isGroupDeleted = targetId && targetId.trim() !== "" && !group;
            if ((!isGroupDeleted) && assignmentType === "Entra ID Group" || assignmentType === "Entra ID Group Exclude") {
                return (
                    <>
                        <div
                            className="text-yellow-500 cursor-pointer"
                            onClick={() => fetchGroupMembers(targetId, setMembers, setIsDialogOpen)}
                        >
                            {row.getValue("targetName")}
                        </div>
                        <div className="italic text-sm">
                            {group ? `(${userCount} users / ${deviceCount} devices / ${groupCount} groups)` : ""}
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className="container max-w-[60%] py-6">
                                <DialogTitle>Group members</DialogTitle>
                                <DialogDescription>
                                    These are the members of the group {row.getValue("targetName")}
                                </DialogDescription>
                                <div className="container max-w-[95%] py-6">
                                    <DataTable columns={memberColumns} data={members}/>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                );
            }
            if (isGroupDeleted) {
                return (
                    <div className="text-red-500">
                        {row.getValue("targetName")} (Group deleted but assignment remains)
                    </div>
                );
            }
            return (
                <div>
                    {row.getValue("targetName")}
                </div>
            );
        },
    },
    {
        accessorKey: "filter.displayName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Filter" />
        ),
        cell: ({ row }) => {
            const displayName = row.original.filter?.displayName || "No Filter";
            const rule = row.original.filter?.rule || "No Rule";
            const [isDialogOpen, setIsDialogOpen] = useState(false);

            return (
                <>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                {displayName !== "No Filter" ? (
                                    <a
                                        className="text-yellow-500 cursor-pointer"
                                        onClick={() => setIsDialogOpen(true)}
                                    >
                                        {displayName}
                                    </a>
                                ) : (
                                    <div className="text-gray-500"><i>{displayName}</i></div>
                                )}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{rule}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogTitle>Filter Information</DialogTitle>
                            <DialogDescription>
                                <p>Display Name: {displayName}</p>
                                <p>Rule: {rule}</p>
                            </DialogDescription>
                        </DialogContent>
                    </Dialog>
                </>
            );
        },
    },
    {
        accessorKey: "filterType",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Filter Type"/>
        ),
        cell: ({ row }) => {
            const filterType = row.getValue("filterType");
            return filterType !== "None" ? (
                <div>{filterType}</div>
            ) : (
                <div className="text-gray-500"><i>{filterType}</i></div>
            );
        }
    }
];