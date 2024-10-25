import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import { migrationNeeded, readyForMigration } from "@/components/assignments/migrate/fixed-values.tsx"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { CrossIcon } from "lucide-react";
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState, useEffect } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx"

import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants";
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_MIGRATE_ENDPOINT } from "@/components/constants/apiUrls";
import { assignmentMigrationSchema } from "@/components/assignments/migrate/schema.tsx";
import {z} from "zod";
import type {policySchema} from "@/components/policies/configuration/schema.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

interface TData {
    id: string;
    excludeGroupFromSource: boolean;
    sourcePolicy: z.infer<typeof policySchema> | null;
    destinationPolicy: z.infer<typeof policySchema> | null;
    assignmentType: string,
    filterType: string,
    groupToMigrate: string;
    assignmentId: string;
    filterToMigrate: { displayName: string, id: string } | null,
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
                                 }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [exportOption, setExportOption] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [jsonString, setJsonString] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRowCount, setSelectedRowCount] = useState(0);

    useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        setSelectedRowCount(selectedRows.length);
    }, [table.getSelectedRowModel().rows]);

    const handleExport = (rawData: string) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);


        const dataToExport = parsedRawData
            .filter((item: TData) => selectedIds.includes(item.id))
            .map((item: TData) => {
                const selectedRow = selectedRows.find(row => row.original.id === item.id);
                return {
                    id: selectedRow?.original.id,
                    sourcePolicy: {
                        id: selectedRow?.original.sourcePolicy?.id,
                        name: selectedRow?.original.sourcePolicy?.name,
                        policyType: selectedRow?.original.sourcePolicy?.policyType,
                        assignments: selectedRow?.original.sourcePolicy?.assignments || []
                    },
                    destinationPolicy: {
                        id: selectedRow?.original.destinationPolicy?.id,
                        name: selectedRow?.original.destinationPolicy?.name,
                        policyType: selectedRow?.original.destinationPolicy?.policyType,
                        assignments: selectedRow?.original.destinationPolicy?.assignments || []
                    },
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
            dataToExport.forEach((item: TData) => {
                if (item.sourcePolicy?.id) {
                    const sourceFileName = `${item.sourcePolicy.name}_source.json`;
                    const sourceFileContent = JSON.stringify({
                        itemId: item.id,
                        id: item.sourcePolicy.id,
                        name: item.sourcePolicy.name,
                        policyType: item.sourcePolicy.policyType,
                        assignments: item.sourcePolicy.assignments
                    }, null, 2);
                    console.log("Adding file to zip:", sourceFileName, sourceFileContent); // Log file details
                    zip.file(sourceFileName, sourceFileContent);
                } else {
                    console.warn(`No source assignments found for item with id: ${item.id}`);
                }
                if (item.destinationPolicy?.id) {
                    const sourceFileName = `${item.destinationPolicy.name}_destination.json`;
                    const sourceFileContent = JSON.stringify({
                        itemId: item.id,
                        id: item.destinationPolicy.id,
                        name: item.destinationPolicy.name,
                        policyType: item.destinationPolicy.policyType,
                        assignments: item.destinationPolicy.assignments
                    }, null, 2);
                    console.log("Adding file to zip:", sourceFileName, sourceFileContent); // Log file details
                    zip.file(sourceFileName, sourceFileContent);
                } else {
                    console.warn(`No destination assignments found for item with id: ${item.id}`);
                }
            });

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
            loading: `Searching for policies...`,
            success: `Migration plan fetched successfully`,
            error: (err) => `Failed to get migration info because: ${err.message.errors.csvContent}`,
        });
    };

    const handleDownloadTemplate = () => {
        const csvContent = "CurrentPolicyName,ReplacementPolicyName,GroupName,AssignmentType,FilterName,FilterType\n";
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
                    item.assignmentType = selectedRow.original.assignmentType; // Ensure assignmentType is set
                    item.filterType = selectedRow.original.filterType;
                    assignmentMigrationSchema.parse(item); // Validate the updated item
                }
                return item;
            });

        if (dataToExport.length === 0) {
            toast.error("No rows selected for migration.");
            return;
        }

        const dataString = JSON.stringify(dataToExport, null, 2);

        try {
            setMigrationStatus('pending');
            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', dataString);
            if (response?.status === 204) {
                setMigrationStatus('success');
                toast.success("Selected rows migrated successfully.");
            } else {
                setMigrationStatus('failed');
                toast.error("Failed to migrate selected rows.");
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.location.href = error.consentUri;
            }
        }
    };

    const handleConfirmMigrate = () => {
        setIsDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        setIsDialogOpen(false);
        handleMigrate();
    };

    const handleDialogCancel = () => {
        setIsDialogOpen(false);
    };

    return (
        <div className="flex items-center justify-between">
            <Toaster />
            <div className="flex flex-1 items-center space-x-2">
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
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <CrossIcon className="ml-2 h-4 w-4" />
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
                    <p>Are you sure you want to migrate the selected {selectedRowCount} row(s)?</p>
                    <DialogFooter>
                        <Button onClick={handleDialogCancel} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleDialogConfirm} variant="default">
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}