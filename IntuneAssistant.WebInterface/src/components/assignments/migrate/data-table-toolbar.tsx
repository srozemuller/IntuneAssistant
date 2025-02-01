import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {assignmentAction, migrationNeeded, readyForMigration} from "@/components/assignments/migrate/fixed-values.tsx"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Undo2Icon } from "lucide-react";
import { type Table } from "@tanstack/react-table"
import { useState, useEffect } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx"
import * as Sentry from "@sentry/astro";
import { useUser } from "@/contexts/usercontext.tsx";

import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants";
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_MIGRATE_ENDPOINT,
    ASSIGNMENTS_VALIDATION_ENDPOINT,
    EXPORT_ENDPOINT
} from "@/components/constants/apiUrls";
import { assignmentMigrationSchema } from "@/components/assignments/migrate/schema.tsx";
import {z} from "zod";
import type {policySchema} from "@/components/policies/configuration/schema.tsx";
import { SelectAllButton } from "@/components/button-selectall.tsx";

// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";

interface TData {
    id: string;
    excludeGroupFromSource: boolean;
    policy: z.infer<typeof policySchema> | null;
    assignmentType: string,
    assignmentAction: string,
    filterType: string,
    groupToMigrate: string;
    assignmentId: string;
    filterToMigrate: { displayName: string, id: string } | null,
    isBackuped?: boolean;
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
    const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);
    const [tableData, setTableData] = useState<TData[]>([]);

    const { userClaims } = useUser();
    useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        setSelectedRowCount(selectedRows.length);
        setSelectedIds(selectedRows.map(row => row.original.id));
    }, [table.getSelectedRowModel().rows]);

    // Function to log data to Sentry
    Sentry.captureMessage('This is a custom message from Astro!');
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
                    policy: selectedRow?.original.policy
                };
            });
        console.log("Data to export:", dataToExport); // Log data to export

        const dataCount = dataToExport.length;
        if (dataCount === 0) {
            toast.error("No data to export.");
            return;
        }
        const rowString = dataCount === 1 ? "row" : "rows";

        if (exportOption === "backup") {
            const zip = new JSZip();
            for (const item of dataToExport) {
                if (item.policy?.id) {
                    const policyType = item.policy.policyType;
                    const policyId = item.policy.id;
                    const response = await authDataMiddleware(`${EXPORT_ENDPOINT}/${policyType}/${policyId}`, 'GET');
                    if (response && response.data) {
                        const sourceFileName = `${item.policy.name}_source.json`;
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

            zip.generateAsync({ type: "blob" }).then((content) => {
                saveAs(content, `${source}-backup.zip`);
                toast.success(`Zip file created and downloaded, selected ${dataCount} ${rowString}.`);
            }).catch((err) => {
                console.error("Failed to create zip file:", err);
                toast.error(`Failed to create zip file: ${err.message}`);
            });
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
        const csvContent = "PolicyName;GroupName;AssignmentDirectionAssignmentAction;FilterName,FilterType\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "assignment_migration_template.csv");
    };

    const handleMigrate = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData
            .filter((item: TData) => selectedIds.includes(item.id))
            .map((item: TData) => {
                const selectedRow = selectedRows.find(row => row.original.id === item.id);
                if (selectedRow) {
                    item.excludeGroupFromSource = selectedRow.original.excludeGroupFromSource;
                    item.groupToMigrate = selectedRow.original.groupToMigrate;
                    item.assignmentId = selectedRow.original.assignmentId;
                    item.filterToMigrate = selectedRow.original.filterToMigrate;
                    item.assignmentType = selectedRow.original.assignmentType;
                    item.filterType = selectedRow.original.filterType;
                    assignmentMigrationSchema.parse(item);
                }
                return item;
            });

        if (dataToExport.length === 0) {
            toast.error("No rows selected for migration or rows are not backed up.");
            return;
        }

        const dataString = JSON.stringify(dataToExport, null, 2);

        try {
            setMigrationStatus('pending');
            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', dataString);
            if (response?.status === 200) {
                setMigrationStatus('success');
                toast.success("Selected rows migrated successfully.");

                // Fetch validation data for all selected rows and rows with the same policy ID
                const policyIds = [...new Set(dataToExport.map(item => item.policy?.id))];
                const allRows = table.getRowModel().rows;
                const rowsWithSamePolicyId = allRows.filter(row => policyIds.includes(row.original.policy?.id));
                const validationRequestBody = rowsWithSamePolicyId.map(row => {
                    if (row.original.policy) {
                        return {
                            Id: row.original.id,
                            ResourceType: row.original.policy.policyType,
                            ResourceId: row.original.policy.id,
                            AssignmentId: row.original.assignmentId,
                            AssignmentType: row.original.assignmentType,
                            AssignmentAction: row.original.assignmentAction,
                            FilterId: row.original.filterToMigrate?.id || null,
                            FilterType: row.original.filterType || 'none'
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                const validationResponse = await authDataMiddleware(`${ASSIGNMENTS_VALIDATION_ENDPOINT}`, 'POST', JSON.stringify(validationRequestBody));
                if (validationResponse?.status === 200) {
                    const validationData = validationResponse.data;
                    const updatedData = tableData.map(row => {
                        const validationItem = validationData.find(item => item.id === row.id);
                        if (validationItem) {
                            return {
                                ...row,
                                isMigrated: validationItem.hasCorrectAssignment,
                                policy: {
                                    ...row.policy,
                                    assignments: validationItem.policy.assignments
                                }
                            };
                        }
                        return row;
                    });
                    setTableData(updatedData);
                } else {
                    toast.error('Failed to validate all rows.');
                }

                await fetchData();
            } else {
                setMigrationStatus('failed');
                toast.error("Failed to migrate selected rows.");
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            if (error.consentUri) {
                window.location.href = error.consentUri;
            }
        }
    };

    const handleConfirmMigrate = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const noBackups = selectedIds.some(id => !backupStatus[id]);

        if (noBackups) {
            toast.error("Some selected rows are not backed up.");
        }

        setIsDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        // Capture a custom error
        console.log("Capturing exception with Sentry");
        if (acknowledgeRisk) {
            Sentry.captureException(new Error(`User ${userClaims?.username} acknowledged the risks of migrating rows without backups in tenant ${userClaims?.tenantId}.`));
        }
        setIsDialogOpen(false);
        handleMigrate();
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
                {table.getColumn("isMigrated") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("isMigrated")}
                        title="Migration Status"
                        options={migrationNeeded}
                    />
                )}
                {table.getColumn("isReadyForMigration") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("isReadyForMigration")}
                        title="Ready for Migration"
                        options={readyForMigration}
                    />
                )}
                {table.getColumn("isReadyForMigration") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("assignmentAction")}
                        title="Assignment Action"
                        options={assignmentAction}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <Undo2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
                <Button onClick={handleConfirmMigrate} variant="outline" size="sm">
                    Migrate
                </Button>
                <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                    Migration Template
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Migration</DialogTitle>
                    </DialogHeader>
                    <p>Are you really sure you want to migrate the selected {selectedRowCount} row(s)?</p>
                    <p>This action can not be reverted thereafter. </p>
                    {selectedRowCount > 0 && selectedIds.some(id => !backupStatus[id]) && (
                        <>
                            <p className="text-red-500">Warning: Some selected rows are not backed up.</p>
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="acknowledgeRisk"
                                    checked={acknowledgeRisk}
                                    onChange={(e) => setAcknowledgeRisk(e.target.checked)}
                                    className="mr-2"
                                />
                                <label htmlFor="acknowledgeRisk" className="text-sm">
                                    I acknowledge the risks of migrating rows without backups.
                                </label>
                            </div>
                        </>
                    )}
                    <DialogFooter>
                        <Button onClick={handleDialogCancel} variant="outline">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDialogConfirm}
                            variant="default"
                            disabled={selectedRowCount > 0 && selectedIds.some(id => !backupStatus[id]) && !acknowledgeRisk}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}