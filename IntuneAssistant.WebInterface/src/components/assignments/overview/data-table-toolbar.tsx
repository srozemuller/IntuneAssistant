import { Input } from "@/components/ui/input.tsx"
import {accountIsEnabled, assignmentTypes, isAssignedValues, platform} from "@/components/assignments/overview/fixed-values.tsx"
import {configurationTypes} from "@/components/constants/policyTypes.ts"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import {Cross2Icon, MixerHorizontalIcon} from "@radix-ui/react-icons"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState, useMemo, useEffect } from "react"
import {FILTER_PLACEHOLDER} from "@/components/constants/appConstants";
import { SelectAllButton } from "@/components/button-selectall.tsx";

import { DataTableExport } from "@/components/data-table-export";
import { DataTableRefresh } from "@/components/data-table-refresh";
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"

interface TData {
    id: string;
    resourceType: string;
    assignmentType: string;
    isExcluded: boolean;
    isAssigned: boolean;
    platform: string;
    targetId: string;
    targetName: string;
    resourceId: string;
    resourceName: string;
    filterId: string;
    filterType:string;
    filterDisplayName: string;
    filterRule: string;
    filter?: {
        displayName: string;
        rule: string;
    };
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
    const isFiltered = table.getState().columnFilters.length > 0;

    const prepareExportData = useMemo(() => {
        try {
            const selectedRows = table.getSelectedRowModel().rows;
            let parsedRawData = [];

            // Handle different data formats safely
            if (typeof rawData === 'string') {
                try {
                    const parsed = JSON.parse(rawData);
                    // Access the nested data property directly
                    parsedRawData = parsed.data || [];
                } catch (e) {
                    console.error("Failed to parse JSON:", e);
                }
            } else if (Array.isArray(rawData)) {
                parsedRawData = rawData;
            } else if (rawData && typeof rawData === 'object') {
                // If rawData is already an object, extract the data property
                parsedRawData = rawData.data || [];
            }

            // Log for debugging
            console.log("Extracted data array:", parsedRawData);

            // Ensure parsedRawData is an array at this point
            if (!Array.isArray(parsedRawData)) {
                console.error("Raw data is not an array after parsing", parsedRawData);
                return [];
            }

            // Process the data (rest of the logic remains the same)
            if (selectedRows.length > 0) {
                const selectedIds = selectedRows.map(row => row.original.id);
                return parsedRawData.filter((item) =>
                    selectedIds.includes(item.id)
                ).map((item) => ({
                    resourceType: item.resourceType || '',
                    assignmentType: item.assignmentType || '',
                    isExcluded: item.isExcluded ? "Yes" : "No",
                    isAssigned: item.isAssigned ? "Yes" : "No",
                    platform: item.platform || '',
                    targetId: item.targetId || '',
                    targetName: item.targetName || '',
                    resourceId: item.resourceId || '',
                    resourceName: item.resourceName || '',
                    filterId: item.filterId || '',
                    filterType: item.filterType || '',
                    filterDisplayName: item.filter?.displayName || '',
                    filterRule: item.filter?.rule || '',
                }));
            }

            // Return all data if no rows selected
            return parsedRawData.map((item) => ({
                resourceType: item.resourceType || '',
                assignmentType: item.assignmentType || '',
                isExcluded: item.isExcluded ? "Yes" : "No",
                isAssigned: item.isAssigned ? "Yes" : "No",
                platform: item.platform || '',
                targetId: item.targetId || '',
                targetName: item.targetName || '',
                resourceId: item.resourceId || '',
                resourceName: item.resourceName || '',
                filterId: item.filterId || '',
                filterType: item.filterType || '',
                filterDisplayName: item.filter?.displayName || '',
                filterRule: item.filter?.rule || '',
            }));
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
                {table.getColumn("resourceType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("resourceType")}
                        title="Type"
                        options={configurationTypes}
                    />
                )}
                {table.getColumn("isAssigned") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("isAssigned")}
                        title="Is Assigned"
                        options={isAssignedValues}
                    />
                )}
                {table.getColumn("assignmentType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("assignmentType")}
                        title="Assignment Type"
                        options={assignmentTypes}
                    />
                )}
                {table.getColumn("platform") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("platform")}
                        title="Platform"
                        options={platform}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
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