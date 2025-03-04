import { Input } from "@/components/ui/input.tsx"
import {isAssignedValues} from "@/components/policies/configuration/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"

import {useState, useEffect, useMemo} from "react"

import type { Table } from '@tanstack/react-table';
import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants.js"
import { policySchema } from "@/components/policies/configuration/schema.tsx";
import {SelectAllButton} from "@/components/button-selectall.tsx";
import {z} from "zod";

// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import authDataMiddleware from "@/components/middleware/fetchData";
import { EXPORT_ENDPOINT } from "@/components/constants/apiUrls.js"
import {CrossIcon, XIcon} from "lucide-react";
import {settingStatus} from "@/components/compare/fixed-values.tsx";
import {platform} from "@/components/constants/fixed-values.tsx";


import { DataTableExport } from "@/components/data-table-export";
import { DataTableRefresh } from "@/components/data-table-refresh";
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"


interface TData {
    id: string;
    isBackuped?: boolean;
    policyType: string;
    name: string;
}

interface DataTableToolbarProps<TData> {
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
                                     backupStatus,
                                     setBackupStatus,
                                 }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [exportOption, setExportOption] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [jsonString, setJsonString] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRowCount, setSelectedRowCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        setSelectedRowCount(selectedRows.length);
        setSelectedIds(selectedRows.map(row => row.original.id));
    }, [table.getSelectedRowModel().rows]);

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

            // Get all rows or filtered rows based on selection
            const dataToProcess = selectedRows.length > 0
                ? parsedRawData.filter(item =>
                    selectedRows.map(row => row.original.id).includes(item.id)
                )
                : parsedRawData;


            // Process and map all the filtered rows in the same way
            return dataToProcess.map((item) => ({
                id: item.id || '',
                name: item.name || '',
                policyType: item.policyType || '',
                policySubType: item.policySubType || '',
                description: item.description || '',
                platforms: item.platforms || '',
                settingCount: item.settingCount || 0,
                isAssigned: item.isAssigned ? 'Yes' : 'No',
                createdDateTime: item.createdDateTime || '',
                lastModifiedDateTime: item.lastModifiedDateTime || ''
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
                {table.getColumn("platforms") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("platforms")}
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
                        <XIcon className="ml-2 h-4 w-4" />
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