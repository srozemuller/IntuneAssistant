import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {assignmentAction, migrationNeeded, readyForMigration, backupStatusValues} from "@/components/assignments/migrate/fixed-values.tsx"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Undo2Icon } from "lucide-react";
import { type Table } from "@tanstack/react-table"
import React, { useState, useEffect } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx"
import * as Sentry from "@sentry/astro";
import { useUser } from "@/contexts/usercontext.tsx";
import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants";
import authDataMiddleware, {createCancelTokenSource} from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_MIGRATE_ENDPOINT,
    EXPORT_ENDPOINT
} from "@/components/constants/apiUrls";
import {assignmentMigrationSchema, groupsSchema} from "@/components/assignments/migrate/schema.tsx";
import {z} from "zod";
import type {policySchema} from "@/components/policies/configuration/schema.tsx";
import { SelectAllButton } from "@/components/button-selectall.tsx";
import { Progress } from "@/components/ui/progress";

import { showLoadingToast } from '@/utils/toastUtils';

// Toast configuration
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import Papa from "papaparse";
import type {filterSchema} from "@/schemas/filters.tsx";

interface ValidateAndUpdateTableFn {
    (policyId?: string): Promise<boolean>;
}

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
}

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    rawData: string;
    fetchData: () => Promise<void>;
    source: string;
    validateAndUpdateTable: ValidateAndUpdateTableFn;
    backupStatus: Record<string, boolean>;
    setBackupStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    groupData: z.infer<typeof groupsSchema>[];
    filters: z.infer<typeof filterSchema>[];
}

export function DataTableToolbar({
                                     table,
                                     rawData,
                                     fetchData,
                                     source,
                                     validateAndUpdateTable,
                                     backupStatus,
                                     setBackupStatus,
                                     groupData,
                                     filters,
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

    const [backupProgress, setBackupProgress] = useState(0);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [totalPolicies, setTotalPolicies] = useState(0);
    const [processedPolicies, setProcessedPolicies] = useState(0);

    // Add these state variables alongside your other state variables
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationProgress, setMigrationProgress] = useState(0);
    const [totalMigrations, setTotalMigrations] = useState(0);
    const [completedMigrations, setCompletedMigrations] = useState(0);

    const { userClaims } = useUser();

    const [cancelSource, setCancelSource] = useState<ReturnType<typeof createCancelTokenSource> | null>(null);

    const hasReplaceWithNoAssignments = table.getFilteredSelectedRowModel().rows.some(
        (selectedRow) => {
            const action = String(selectedRow.original.assignmentAction || "");
            const type = String(selectedRow.original.assignmentType || "");
            return action.includes("Replace") && type.includes("NoAssignment");
        }
    );

    useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        setSelectedRowCount(selectedRows.length);

        // Use a type guard to filter out undefined values
        const ids = selectedRows
            .map(row => row.original.policy?.id)
            .filter((id): id is string => Boolean(id));

        setSelectedIds(ids);
    }, [table.getSelectedRowModel().rows]);


    const handleBackup = () => {
        const selectedRows = table.getSelectedRowModel().rows;

        if (selectedRows.length === 0) {
            toast.error("No rows selected for backup.");
            return;
        }

        let accountInfo = null;
        try {
            const accountInfoStr = sessionStorage.getItem("accountInfo");
            if (accountInfoStr) {
                accountInfo = JSON.parse(accountInfoStr);
            }
        } catch (error) {
            console.error("Error parsing account info:", error);
        }

        const tenantName = accountInfo?.username?.includes('@') ?
            accountInfo?.username.split('@')[1] :
            (userClaims?.username || "unknown");

        const metadata = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            purpose: "backup",
            tenantId: accountInfo?.tenantId || "unknown",
            tenant: tenantName,
            exportedBy: accountInfo?.name || userClaims?.username || "unknown",
            totalPolicies: 0, // Will be updated later
            totalAssignments: 0, // Will be updated later
        };

        // Create a map to store unique assignments
        const backupRows: Record<string, any>[] = [];
        // Track policies we've already seen to determine first vs subsequent assignments
        const seenPolicies: Record<string, boolean> = {};
        // Track which policies are included in this backup
        const backedUpPolicyIds = new Set<string>();
        // Track which policies we've already processed to avoid duplications
        const processedPolicyIds = new Set<string>();

        // Process all selected rows
        selectedRows.forEach((row: any) => {
            const policy = row.original.policy || {};
            const policyName = policy.name || "Unknown Policy";
            const policyId = policy.id || "";

            // Skip if we've already processed this policy
            if (processedPolicyIds.has(policyId)) {
                return;
            }

            // Mark this policy as processed
            processedPolicyIds.add(policyId);

            // Add policy ID to the set of backed up policies
            if (policyId) {
                backedUpPolicyIds.add(policyId);
            }

            // Get assignments array from the policy
            const assignments = policy.assignments || [];

            // If there are no assignments, create one placeholder row for this policy
            if (assignments.length === 0) {
                backupRows.push({
                    PolicyId: policyId,
                    PolicyName: policyName,
                    GroupId: "",
                    GroupName: "",
                    AssignmentDirection: "",
                    AssignmentAction: "Replace", // Default for first/only assignment
                    FilterName: "",
                    FilterType: "none",
                    NoAssignments: true
                });
            } else {
                // Determine if this is the first time we're seeing this policy
                let isFirstAssignmentForPolicy = !seenPolicies[policyId];
                if (isFirstAssignmentForPolicy) {
                    seenPolicies[policyId] = true;
                }

                // Process each assignment for this policy
                assignments.forEach((assignment: any) => {
                    const isAllDevices = assignment?.target?.["@odata.type"]?.includes("allDevicesAssignmentTarget");
                    const isAllUsers = assignment?.target?.["@odata.type"]?.includes("allUsersAssignmentTarget");

                    // Handle group name based on assignment type
                    let groupName = "Unknown Group";
                    let groupId = "";

                    if (isAllDevices) {
                        groupName = "All Devices";
                    } else if (isAllUsers) {
                        groupName = "All Users";
                    } else {
                        groupId = assignment?.target?.groupId || "";
                        // Only look up group name if we have a groupId
                        const group = groupData?.find((g) => g.id === groupId);
                        groupName = group?.displayName || "Unknown Group";
                    }

                    const assignmentDirection = assignment?.target?.["@odata.type"]?.includes("exclusion")
                        ? "Exclude"
                        : "Include";

                    const filterId = assignment?.target?.deviceAndAppManagementAssignmentFilterId || "";
                    const filter = filters?.find((f) => f.id === filterId);
                    const filterName = filter?.displayName || "";
                    const filterType = assignment?.target?.deviceAndAppManagementAssignmentFilterType || "none";

                    // Create a row for this assignment
                    backupRows.push({
                        PolicyId: policyId,
                        PolicyName: policyName,
                        GroupId: groupId,
                        GroupName: groupName,
                        AssignmentDirection: assignmentDirection,
                        AssignmentAction: isFirstAssignmentForPolicy ? "Replace" : "Add",
                        FilterName: filterName,
                        FilterType: filterType
                    });

                    // After the first assignment for a policy, subsequent ones should be "Add"
                    if (isFirstAssignmentForPolicy) {
                        isFirstAssignmentForPolicy = false;
                    }
                });
            }
        });

        // Update metadata with counts
        metadata.totalPolicies = backedUpPolicyIds.size;
        metadata.totalAssignments = backupRows.length;

        // Create a CSV string for metadata
        const metadataRows = Object.entries(metadata).map(([key, value]) => {
            return { MetadataKey: key, MetadataValue: value };
        });

        // Create CSV content with metadata section followed by a divider and then data
        const metadataCsv = Papa.unparse(metadataRows, {
            delimiter: ";"
        });
        const dataCsv = Papa.unparse(backupRows, {
            delimiter: ";"
        });

        const fullCsvContent = `# METADATA\n${metadataCsv}\n# DATA\n${dataCsv}`;

        // Create Blob and download the file
        const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
        const filename = `${tenantName}_assignments_backup_${new Date().toISOString().slice(0, 10)}.csv`;
        saveAs(blob, filename);

        // Update backup status for all policies included in this backup
        const newBackupStatus = { ...backupStatus };
        backedUpPolicyIds.forEach(policyId => {
            newBackupStatus[policyId] = true;
        });
        setBackupStatus(newBackupStatus);

        toast.success(`Backup created with ${backupRows.length} entries for ${backedUpPolicyIds.size} policies`);
    };

    const handleBackupExport = async (cancelSource = createCancelTokenSource()) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const uniquePolicies = [...new Map(selectedRows.map(row =>
            [row.original.policy?.id, { id: row.original.policy?.id, type: row.original.policy?.policyType }]
        )).values()];

        if (uniquePolicies.length === 0) {
            toast.error("No data to export.");
            return;
        }

        // Initialize progress state
        setIsBackingUp(true);
        setBackupProgress(0);
        setTotalPolicies(uniquePolicies.length);
        setProcessedPolicies(0);

        const zip = new JSZip();
        let hasError = false;
        const newBackupStatus = { ...backupStatus };

        for (const [index, policy] of uniquePolicies.entries()) {
            if (policy.id && policy.type) {
                try {
                    const response = await authDataMiddleware(`${EXPORT_ENDPOINT}/${policy.type}/${policy.id}`, 'GET', {}, cancelSource as any);
                    if (response && response.data) {
                        const sourceFileName = `${policy.id}_source.json`;
                        const sourceFileContent = JSON.stringify(response.data, null, 2);
                        zip.file(sourceFileName, sourceFileContent);
                        newBackupStatus[policy.id] = true;
                    } else {
                        newBackupStatus[policy.id] = false;
                        hasError = true;
                    }
                } catch (error) {
                    console.error(`Failed to backup policy ${policy.id}:`, error);
                    newBackupStatus[policy.id] = false;
                    hasError = true;
                }

                // Update progress after each policy is processed
                setProcessedPolicies(index + 1);
                setBackupProgress(Math.round(((index + 1) / uniquePolicies.length) * 100));
            }
        }

        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `backup.zip`);

            setBackupStatus(newBackupStatus);
            toast.success(`Zip file created and downloaded.`);

            if (hasError) {
                toast.error("Some policies failed to backup. Check the status indicators.");
            }
        } catch (err: unknown) {
            console.error("Failed to create zip file:", err);
            toast.error(`Failed to create zip file: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            // Reset progress state
            setIsBackingUp(false);
        }
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
        const csvContent = "PolicyName;GroupName;AssignmentDirection;AssignmentAction;FilterName;FilterType\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "assignment_migration_template.csv");
    };

    const handleMigrate = async (cancelSource = createCancelTokenSource()) => {
        const source = createCancelTokenSource();
        setCancelSource(source); // Set the cancelSource state
        const toastId = showLoadingToast("Migrating assignments...", () => {
            cancelSource.cancel("Migration canceled by user");
        });

        try {
            const selectedRows = table.getSelectedRowModel().rows;
            if (selectedRows.length === 0) {
                toast.update(toastId, {
                    render: "Please select rows to migrate",
                    type: "warning",
                    isLoading: false,
                    autoClose: toastDuration,
                });
                return;
            }

            const dataToExport = selectedRows.map(row => row.original);
            const totalRows = selectedRows.length;

            setIsMigrating(true);
            setMigrationProgress(0);
            setTotalMigrations(totalRows);
            setCompletedMigrations(0);

            const dataString = JSON.stringify(dataToExport);
            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', dataString, cancelSource as any);

            if (response?.status === 200) {
                setMigrationProgress(100);
                setCompletedMigrations(totalRows);
                setMigrationStatus('success');
                toast.update(toastId, {
                    render: "Migration completed successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: toastDuration,
                });
            } else {
                setMigrationStatus('failed');
                toast.update(toastId, {
                    render: "Failed to migrate selected rows",
                    type: "error",
                    isLoading: false,
                    autoClose: toastDuration,
                });
            }
        } catch (error: unknown) {
            setMigrationStatus('failed');
            if (cancelSource.token.reason?.message === "Migration canceled by user") {
                toast.update(toastId, {
                    render: "Migration canceled by user",
                    type: "warning",
                    isLoading: false,
                    autoClose: toastDuration,
                });
            } else {
                toast.update(toastId, {
                    render: `Migration error: ${error instanceof Error ? error.message : "Unknown error"}`,
                    type: "error",
                    isLoading: false,
                    autoClose: toastDuration,
                });
            }
        } finally {
            setIsMigrating(false);
            setCancelSource(null); // Clear the cancelSource after migration
        }
    };

    const handleConfirmMigrate = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const nonBackedUpRows = selectedRows.filter(row => !backupStatus[row.original.policy?.id]);

        if (nonBackedUpRows.length > 0) {
            toast.warning("Some selected rows are not backed up. Please back them up first.");
            return;
        }

        setIsDialogOpen(true);
    };

    const handleDialogConfirm = () => {
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
                <SelectAllButton
                    table={table}
                    filterFn={() => table.getFilteredRowModel().rows.filter(row =>
                        row.original.isReadyForMigration === true
                    )}
                />
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
                {table.getColumn("backupStatus") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("backupStatus")}
                        title="Backup Status"
                        options={backupStatusValues}
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
                <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    disabled={table.getRowModel().rows.length === 0}>
                    Refresh
                </Button>
                <Button
                    onClick={handleBackup}
                    variant="outline"
                    size="sm"
                    disabled={table.getRowModel().rows.length === 0}>
                    Backup
                </Button>
                <Button
                    onClick={handleConfirmMigrate}
                    variant="outline"
                    size="sm"
                    disabled={table.getRowModel().rows.length === 0}>
                    Migrate
                </Button>
                <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                    Migration Template
                </Button>
                <DataTableViewOptions table={table} />
            </div>
            {isBackingUp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h3 className="text-lg font-medium mb-2">
                            Backing up policies
                        </h3>
                        <div className="mb-2">
                            <Progress value={backupProgress} className="h-2 mb-1" />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{processedPolicies} of {totalPolicies} policies</span>
                                <span>{backupProgress}%</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Please wait while your policies are being backed up...
                        </p>
                    </div>
                </div>
            )}
            {isMigrating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h3 className="text-lg font-medium mb-2">
                            {migrationProgress <= 50 ? "Migrating assignments" : "Validating assignments"}
                        </h3>
                        <div className="mb-2">
                            <Progress value={migrationProgress} className="h-2 mb-1" />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{completedMigrations} of {totalMigrations} assignments</span>
                                <span>{migrationProgress}%</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            {migrationProgress <= 50
                                ? "Please wait while your assignments are being migrated..."
                                : "Please wait while your assignments are being validated..."}
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => cancelSource?.cancel("Migration canceled by user")}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Migration</DialogTitle>
                    </DialogHeader>
                    <p>Are you really sure you want to migrate the selected {selectedRowCount} row(s)?</p>
                    <p>This action can not be reverted thereafter. </p>

                    {/* Warning about replacing assignments with no assignments */}
                    {hasReplaceWithNoAssignments && (
                        <p className="text-amber-500 font-semibold">
                            Warning: This operation includes replacing assignments with no assignments,
                            effectively removing those assignments.
                        </p>
                    )}

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