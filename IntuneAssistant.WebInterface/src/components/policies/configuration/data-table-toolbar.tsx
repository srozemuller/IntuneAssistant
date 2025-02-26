import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {isAssignedValues} from "@/components/policies/configuration/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"

import { useState, useEffect } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
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

    const handleExport = async (rawData: string) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData
            .filter((item: TData) => selectedIds.includes(item.id))
            .map((item: TData) => {
                const selectedRow = selectedRows.find(row => row.original.id === item.id);
                return {
                    id: selectedRow?.original.id,
                    policyType: selectedRow?.original.policyType,
                    name: selectedRow?.original.name
                };
            });
        console.log("Data to export:", dataToExport);

        const dataCount = dataToExport.length;
        if (dataCount === 0) {
            toast.error("No data to export.");
            return;
        }
        const rowString = dataCount === 1 ? "row" : "rows";

        if (exportOption === "backup") {
            toast.promise(
                (async () => {
                    const zip = new JSZip();
                    for (const item of dataToExport) {
                        if (item?.id) {
                            const policyType = item.policyType;
                            const policyId = item.id;
                            const response = await authDataMiddleware(`${EXPORT_ENDPOINT}/${policyType}/${policyId}`, 'GET');
                            if (response && response.data) {
                                const sourceFileName = `${item.name}_source.json`;
                                const sourceFileContent = JSON.stringify(response.data, null, 2);
                                zip.file(sourceFileName, sourceFileContent);
                                setBackupStatus(prevStatus => ({ ...prevStatus, [item.id]: true })); // Update backup status
                            } else {
                                toast.error(`Backup failed for policy ${policyId}!`);
                            }
                        } else {
                            console.warn(`No source assignments found for item with id: ${item.id}`);
                        }
                    }

                    await zip.generateAsync({ type: "blob" }).then((content) => {
                        saveAs(content, `${source}-backup.zip`);
                    }).catch((err) => {
                        console.error("Failed to create zip file:", err);
                        throw new Error(`Failed to create zip file: ${err.message}`);
                    });
                })(),
                {
                    pending: `Creating backup file for ${dataCount} ${rowString}...`,
                    success: `Zip file created and downloaded, selected ${dataCount} ${rowString}.`,
                    error: {
                        render({ data }) {
                            return `Failed to create zip file: ${data.message}`;
                        }
                    }
                }
            );
        }
    };
    const handleRefresh = () => {
        toast.promise(fetchData(), {
            pending: {
                render:  `Searching for policies...`,
            },
            success: {
                render: `Policies fetched successfully`,
            },
            error:  {
                render: (errorMessage) => `Failed to get policies because: ${errorMessage}`,
            }
        });
    };

    const handleDownloadTemplate = () => {
        const csvContent = "PolicyName,GroupName,AssignmentType,FilterName,FilterType\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "assignment_migration_template.csv");
    };



    const handleDialogCancel = () => {
        setIsDialogOpen(false);
    };

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
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setDropdownVisible(!dropdownVisible)}>
                        Export
                    </Button>
                    {dropdownVisible && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setExportOption("backup");
                                    handleExport(rawData);
                                    setDropdownVisible(false);
                                }}
                            >
                                Export for Backup
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setExportOption("csv");
                                    handleExport(rawData);
                                    setDropdownVisible(false);
                                }}
                            >
                                Export to CSV
                            </button>
                        </div>
                    )}
                </div>
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}