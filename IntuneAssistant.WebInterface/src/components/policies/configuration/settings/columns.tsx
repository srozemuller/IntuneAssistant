"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { type PolicySettings } from "@/components/policies/configuration/settings/schema"
import { DataTableColumnHeader } from "@/components/data-table-column-header"


export const columns: ColumnDef<PolicySettings>[] = [
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
        accessorKey: "policyName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Policy Name" />
        ),
        cell: ({ row }) => <div>{row.getValue("policyName")}</div>,
    },
    {
        accessorKey: "settingName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Setting Name" />
        ),
        cell: ({ row }) => <div>{row.getValue("settingName")}</div>,
    },
    {
        accessorKey: "settingValue",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Setting Value" />
        ),
        cell: ({ row }) => <div>{row.getValue("settingValue")}</div>,
    },
    {
        accessorKey: "childSettingInfo",
        accessorFn: (row) => Array.isArray(row.childSettingInfo) ? row.childSettingInfo.map(setting => `${setting.name}: ${setting.value}`).join(", ") : "",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Child Settings" />
        ),
        cell: ({ row }) => {
            const childSettingsStr = row.getValue("childSettingInfo");
            if (!childSettingsStr) {
                return <div>~</div>;
            }
            const childSettings = childSettingsStr.split(", ").map(setting => {
                const [name, value] = setting.split(": ");
                return { name, value };
            });
            return (
                <ul className="list-none pl-0">
                    {childSettings.map((setting, index) => (
                        <li key={index}>
                            <strong>- {setting.name}:</strong> {setting.value}
                        </li>
                    ))}
                </ul>
            );
        },
        enableGlobalFilter: true,
        enableColumnFilter: true
    }
];