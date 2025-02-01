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
import Papa from "papaparse";

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
                                     validateAndUpdateTable
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

    const handleBackupExport = async (rawData: string) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const parsedRawData = JSON.parse(rawData);

        const uniquePolicies = [...new Map(selectedRows.map(row => [row.original.policy?.id, { id: row.original.policy?.id, type: row.original.policy?.policyType }])).values()];

        if (uniquePolicies.length === 0) {
            toast.error("No data to export.");
            return;
        }

        const zip = new JSZip();
        for (const policy of uniquePolicies) {
            if (policy.id && policy.type) {
                const response = await authDataMiddleware(`${EXPORT_ENDPOINT}/${policy.type}/${policy.id}`, 'GET');
                if (response && response.data) {
                    const sourceFileName = `${policy.id}_source.json`;
                    const sourceFileContent = JSON.stringify(response.data, null, 2);
                    zip.file(sourceFileName, sourceFileContent);
                    setBackupStatus((prevStatus: Record<string, boolean>) => ({ ...prevStatus, [policy.id]: true })); // Update backup status
                } else {
                    toast.error(`Backup failed for policy ${policy.id}!`);
                }
            }
        }

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, `backup.zip`);
            toast.success(`Zip file created and downloaded.`);
        }).catch((err) => {
            console.error("Failed to create zip file:", err);
            toast.error(`Failed to create zip file: ${err.message}`);
        });
    };

    const handleCsvExport = async (rawData: string) => {
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

        try {
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'export.csv');
            toast.success("CSV export successful!");
        } catch (err) {
            console.error("CSV export failed:", err);
            toast.error("CSV export failed!");
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
        try {
            setMigrationStatus('pending');
            const selectedRows = table.getSelectedRowModel().rows;
            const dataToExport = selectedRows.map(row => row.original);
            const dataString = JSON.stringify(dataToExport);

            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', dataString);
            if (response?.status === 200) {
                setMigrationStatus('success');
                toast.success("Selected rows migrated successfully.");

                // Group selected rows by policy ID
                const policyGroups = selectedRows.reduce((groups, row) => {
                    const policyId = row.original.policy.id;
                    if (!groups[policyId]) {
                        groups[policyId] = [];
                    }
                    groups[policyId].push(row);
                    return groups;
                }, {});

                // Validate and update table for each policy group
                for (const policyId in policyGroups) {
                    await validateAndUpdateTable(policyId);
                }
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
                                    handleBackupExport(rawData);
                                    setDropdownVisible(false);
                                }}
                            >
                                Export for Backup
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    handleCsvExport(rawData);
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