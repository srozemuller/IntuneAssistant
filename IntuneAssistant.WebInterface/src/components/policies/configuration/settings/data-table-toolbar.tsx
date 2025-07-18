import { Input } from "@/components/ui/input.tsx"
import { statuses } from "@/components/policies/configuration/settings/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import {useMemo, useState} from "react"
import { handleExport } from "@/lib/handle-export";
import {FILTER_PLACEHOLDER} from "@/components/constants/appConstants";
import {SelectAllButton} from "@/components/button-selectall.tsx";

import { DataTableExport } from "@/components/data-table-export";
import { DataTableRefresh } from "@/components/data-table-refresh";
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"


interface TData {
    displayName: string;
    id: string;
    name: string;
    // Add other properties as needed
}

interface DataTableToolbarProps {
    table: Table<TData>;
    rawData: string;
    fetchData: () => Promise<void>;
    source: string;
}

export function DataTableToolbar({
                                     table,
                                     rawData,
                                     fetchData,
                                     source,
                                 }: DataTableToolbarProps) {

    if (!rawData || rawData.trim() === '') {
        return null; // Don't render the toolbar until rawData is available
    }

    const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter !== undefined;
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const prepareExportData = useMemo(() => {
        try {
            const selectedRows = table.getSelectedRowModel().rows;
            let parsedRawData = [];

            try {
                const parsed = JSON.parse(rawData);
                parsedRawData = Array.isArray(parsed) ? parsed : parsed.data || [];
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                return [];
            }

            const dataToProcess = selectedRows.length > 0
                ? parsedRawData.filter(item =>
                    selectedRows.map(row => row.original.id).includes(item.id)
                )
                : parsedRawData;

            return dataToProcess.map((item) => {
                let childSettingsStr = '';
                if (item.childSettingInfo && Array.isArray(item.childSettingInfo)) {
                    childSettingsStr = item.childSettingInfo
                        .map(setting => `${setting.name}: ${setting.value}`)
                        .join('| ');
                }

                return {
                    id: item.id || '',
                    policyId: item.policyId || '',
                    policyName: item.policyName || '',
                    settingName: item.settingName || '',
                    settingValue: item.settingValue || '',
                    childSettings: childSettingsStr,
                };
            });
        } catch (error) {
            console.error("Failed to prepare export data:", error);
            return [];
        }
    }, [table.getSelectedRowModel().rows, rawData]);

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <SelectAllButton table={table} />
                <Input
                    placeholder={FILTER_PLACEHOLDER}
                    value={table.getState().globalFilter ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        table.setGlobalFilter(value);
                    }}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.setGlobalFilter("");
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <DataTableRefresh
                    fetchData={fetchData}
                    resourceName={source ? `${source}` : "data"}
                />
                <DataTableExport
                    data={prepareExportData}
                    fileName={`${source}-data`}
                    disabled={!prepareExportData || prepareExportData.length === 0}
                />
                <DataTableViewOptions table={table}/>
            </div>
        </div>
    );
}