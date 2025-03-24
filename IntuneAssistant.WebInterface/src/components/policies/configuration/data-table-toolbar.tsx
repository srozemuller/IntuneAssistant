import { Input } from "@/components/ui/input.tsx"
import { isAssignedValues } from "@/components/policies/configuration/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useMemo } from "react"
import type { Table } from '@tanstack/react-table';
import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants.js"
import { SelectAllButton } from "@/components/button-selectall.tsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import authDataMiddleware from "@/components/middleware/fetchData";
import { EXPORT_ENDPOINT } from "@/components/constants/apiUrls.js"
import { XIcon, DownloadCloudIcon, UploadCloudIcon } from "lucide-react";
import { platform } from "@/components/constants/fixed-values.tsx";
import { DataTableExport } from "@/components/data-table-export";
import { DataTableRefresh } from "@/components/data-table-refresh";
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


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
    backupStatus: Record<string, boolean>;
    setBackupStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    validateAndUpdateTable?: (policyId?: string) => Promise<boolean>;
}

export function DataTableToolbar({
                                     table,
                                     rawData,
                                     fetchData,
                                     source,
                                     backupStatus,
                                     setBackupStatus,
                                     validateAndUpdateTable
                                 }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [exportOption, setExportOption] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedRowCount, setSelectedRowCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Backup status states
    const [isBackuping, setIsBackuping] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [totalBackups, setTotalBackups] = useState(0);
    const [completedBackups, setCompletedBackups] = useState(0);
    const [backupProcessStatus, setBackupProcessStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

    useEffect(() => {
        const selectedRowsFlat = Object.values(table.getSelectedRowModel().rowsById);
        setSelectedRowCount(selectedRowsFlat.length);

        // Use a type guard to filter out undefined values
        const ids = selectedRowsFlat
            .map((row: any) => row.original.id)
            .filter((id): id is string => Boolean(id));

        setSelectedIds(ids);
    }, [table.getSelectedRowModel().rowsById]);
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

            // Ensure parsedRawData is an array at this point
            if (!Array.isArray(parsedRawData)) {
                console.error("Raw data is not an array after parsing", parsedRawData);
                return [];
            }

            // Get all rows or filtered rows based on selection
            const dataToProcess = selectedRows.length > 0
                ? parsedRawData.filter((item: any) =>
                    selectedRows.map((row: any) => row.original.id).includes(item.id)
                )
                : parsedRawData;

            // Process and map all the filtered rows in the same way
            return dataToProcess.map((item: any) => ({
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

    const handleBackupExport = async () => {
        try {
            // Get all selected rows across all pages
            const selectedRowsModel = table.getSelectedRowModel();
            const selectedRowsFlat = Object.values(selectedRowsModel.rowsById);

            if (selectedRowsFlat.length === 0) {
                toast.warning("Please select rows to backup");
                return;
            }

            // Save table state for restoring after operation
            const tableState = {
                pagination: { ...table.getState().pagination },
                sorting: [...table.getState().sorting],
                columnFilters: [...table.getState().columnFilters],
                globalFilter: table.getState().globalFilter
            };

            const dataToExport = selectedRowsFlat.map((row: any) => row.original);
            const totalRows = dataToExport.length;

            // Initialize progress tracking
            setIsBackuping(true);
            setBackupProgress(0);
            setTotalBackups(totalRows);
            setCompletedBackups(0);

            // Track backup status for each row
            const newBackupStatus = { ...backupStatus };

            // Create a zip file for all backups
            const zip = new JSZip();

            // Create folders for each platform type
            const platformFolders: Record<string, JSZip> = {};

            for (let i = 0; i < dataToExport.length; i++) {
                const item = dataToExport[i];

                // Calculate progress percentage
                const progress = Math.round(((i + 1) / totalRows) * 100);
                setBackupProgress(progress);
                setCompletedBackups(i + 1);

                try {
                    // Access the policy type, ID and platform from the current item
                    const policyType = item.policyType;
                    const policyId = item.id;
                    const policyName = item.name || `policy_${policyId}`;
                    // Get platform (could be a string or array)
                    const platformValue = item.platforms || 'unknown';

                    // Handle platforms as an array or string
                    let platformFolder;
                    if (Array.isArray(platformValue)) {
                        // If platform is an array, use the first value
                        platformFolder = platformValue[0] || 'unknown';
                    } else {
                        platformFolder = platformValue;
                    }

                    // Normalize platform folder name
                    platformFolder = String(platformFolder).trim() || 'unknown';

                    // Create safe filename by removing invalid characters
                    const safeFileName = policyName
                        .replace(/[^\w\s-]/g, '')  // Remove invalid chars
                        .replace(/\s+/g, '_');     // Replace spaces with underscores

                    if (!policyType || !policyId) {
                        console.error(`Missing policyType or id for item`, item);
                        newBackupStatus[item.id] = false;
                        continue;
                    }

                    const response = await authDataMiddleware(
                        `${EXPORT_ENDPOINT}/${policyType}/${policyId}`,
                        'GET'
                    );

                    if (response && response.data) {
                        // Create or get the platform folder
                        if (!platformFolders[platformFolder]) {
                            platformFolders[platformFolder] = zip.folder(platformFolder) as JSZip;
                        }

                        const folder = platformFolders[platformFolder];

                        // Add the file to the appropriate platform folder
                        const sourceFileContent = JSON.stringify(response.data, null, 2);
                        folder.file(`${safeFileName}.json`, sourceFileContent);

                        // Update backup status for this item
                        newBackupStatus[item.id] = true;

                        // Update the state
                        setBackupStatus(prev => ({
                            ...prev,
                            [item.id]: true
                        }));
                    } else {
                        newBackupStatus[item.id] = false;
                    }
                } catch (error) {
                    console.error(`Failed to backup item ${item.id}:`, error);
                    newBackupStatus[item.id] = false;
                }

                // Short delay to prevent UI freezing
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Generate the zip file and trigger download
            if (Object.values(newBackupStatus).some(status => status === true)) {
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, `backup_policies_${new Date().toISOString().slice(0, 10)}.zip`);
            }

            // Restore table state
            if (tableState.globalFilter) {
                table.setGlobalFilter(tableState.globalFilter);
            }
            table.setColumnFilters(tableState.columnFilters);
            table.setSorting(tableState.sorting);
            table.setPagination(tableState.pagination);

            setBackupProcessStatus('success');
            toast.success("Backup completed successfully");
        } catch (error: unknown) {
            setBackupProcessStatus('failed');
            toast.error(`Backup error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsBackuping(false);
        }
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
                {selectedRowCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackupExport}
                        disabled={isBackuping}
                        className="h-8"
                    >
                        <DownloadCloudIcon className="mr-2 h-4 w-4" />
                        Backup ({selectedRowCount})
                    </Button>
                )}
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

            {/* Progress Modal for Backup */}
            {isBackuping && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h3 className="text-lg font-medium mb-2">
                            Backing up policies
                        </h3>
                        <div className="mb-2">
                            <Progress value={backupProgress} className="h-2 mb-1" />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{completedBackups} of {totalBackups} policies</span>
                                <span>{backupProgress}%</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Please wait while your policies are being backed up...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}