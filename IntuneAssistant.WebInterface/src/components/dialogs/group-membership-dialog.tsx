
// Define the UserMember interface
import authDataMiddleware from "@/components/middleware/fetchData";
import {GROUPS_ENDPOINT} from "@/components/constants/apiUrls";
import type {ColumnDef} from "@tanstack/react-table";
import {DataTableColumnHeader} from "@/components/data-table-column-header.tsx";
import {accountIsEnabled, memberType} from "@/components/assignments/overview/fixed-values.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

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

export {fetchGroupMembers, memberColumns};
export type { UserMember };
