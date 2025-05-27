import { useEffect, useState } from 'react';
import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { saveAs } from 'file-saver';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { assignmentMigrationSchema } from "@/components/assignments/migrate/schema.tsx";
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_MIGRATE_ENDPOINT, EXPORT_ENDPOINT, ASSIGNMENTS_VALIDATION_ENDPOINT
} from "@/components/constants/apiUrls.js";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import JSZip from "jszip";

interface AssignmentRow {
    id: string;
    isReadyForMigration: boolean;
    isMigrated: boolean;
    migrationCheckResult: any;
    groupToMigrate: any;
    assignmentId: string;
    filterToMigrate: any;
    assignmentType: string;
    assignmentAction: string;
    assignmentDirection: string;
    filterType: string;
    policy: {
        id: string
        policyType: string
    };
}

interface DataTableRowActionsProps {
    row: Row<AssignmentRow>;
    setTableData: React.Dispatch<React.SetStateAction<AssignmentRow[]>>;
    table: any;
    backupStatus: Record<string, boolean>;
    setBackupStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    validateAndUpdateTable: (policyId?: string) => Promise<void>;
}

export function DataTableRowActions({
                                        row,
                                        setTableData,
                                        table,
                                        backupStatus,
                                        setBackupStatus,
                                        validateAndUpdateTable
                                    }: DataTableRowActionsProps) {
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [refreshStatus, setRefreshStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);

    const task = assignmentMigrationSchema.parse(row.original);
    const isReadyForMigration = row.original.isReadyForMigration;
    const isMigrated = row.original.isMigrated;
    const migrationCheckResult = row.original.migrationCheckResult;
    const [selectedGroup, setSelectedGroup] = useState(row.original.groupToMigrate);
    const [selectedGroupId, setSelectedGroupId] = useState(row.original.assignmentId);
    const [selectedFilter, setSelectedFilter] = useState(row.original.filterToMigrate);
    const [selectedAssignmentType, setSelectedAssignmentType] = useState(row.original.assignmentType);
    const [selectedFilterType, setSelectedFilterType] = useState(row.original.filterType);
    const [selectedAssignmentDirection, setSelectedAssignmentDirection] = useState(row.original.assignmentDirection);
    const [dialogWarningState, setDialogWarningState] = useState(false);

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasReplaceWithNoAssignments = selectedRows.some((selectedRow: Row<AssignmentRow>) => {
        // Check with more flexible matching
        const action = String(selectedRow.original.assignmentAction);
        const type = String(selectedRow.original.assignmentType);
        return action.includes("Replace") && type.includes("NoAssignment");
    });
    useEffect(() => {
        setSelectedGroup(row.original.groupToMigrate);
        setSelectedGroupId(row.original.assignmentId);
        setSelectedFilter(row.original.filterToMigrate);
        setSelectedAssignmentType(row.original.assignmentType);
        setSelectedAssignmentDirection(row.original.assignmentDirection);
        setSelectedFilterType(row.original.filterType);
    }, [row.original]);

    const handleMigrate = () => {
        setIsDialogOpen(true);
    };

    const handleDialogConfirm = async () => {
        setIsDialogOpen(false);
        try {
            setMigrationStatus('pending');
            toast.info('Migration is pending...');

            const updatedTask = {
                ...task,
                groupToMigrate: selectedGroup,
                assignmentId: selectedGroupId,
                filterToMigrate: selectedFilter,
                assignmentType: selectedAssignmentType,
                assignmentDirection: selectedAssignmentDirection,
                filterType: selectedFilterType
            };

            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', JSON.stringify([updatedTask]));
            if (response?.status === 200) {
                setMigrationStatus('success');
                toast.success('Migration successful!');
                const policyId = row.original.policy.id;
                await validateAndUpdateTable(policyId);
                console.log('Policy ID:', policyId);
            } else {
                setMigrationStatus('failed');
                toast.error('Migration failed!');
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            toast.error('Migration failed!');
            console.log('Migration failed:', error);
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.open(error.consentUri, '_blank');
            }
        }
    };

    const handleRowBackup = async () => {
        const policy = row.original.policy;
        if (policy?.id && policy?.policyType) {
            try {
                const response = await authDataMiddleware(`${EXPORT_ENDPOINT}/${policy.policyType}/${policy.id}`, 'GET');
                if (response && response.data) {
                    const sourceFileName = `${policy.id}_source.json`;
                    const sourceFileContent = JSON.stringify(response.data, null, 2);

                    const zip = new JSZip();
                    zip.file(sourceFileName, sourceFileContent);

                    const blob = await zip.generateAsync({ type: "blob" });
                    saveAs(blob, `backup_${policy.id}.zip`);

                    // Update the state in a single operation
                    const newStatus = { ...backupStatus, [policy.id]: true };
                    setBackupStatus(newStatus);

                    // Update the parent component about the change
                    toast.success(`Backup successful for policy ${policy.id}.`);
                    console.log("Backup status updated:", newStatus);
                } else {
                    setBackupStatus({ ...backupStatus, [policy.id]: false });
                    toast.error(`Backup failed for policy ${policy.id}!`);
                }
            } catch (error) {
                console.error("Backup failed:", error);
                setBackupStatus({ ...backupStatus, [policy.id]: false });
                toast.error(`Backup failed for policy ${policy.id}!`);
            }
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshStatus('pending');
            toast.info('Refreshing data...');

            if (row.original.policy?.id) {
                await validateAndUpdateTable(row.original.policy.id); // Pass the policy ID
            } else {
                await validateAndUpdateTable(); // Call without policy ID
            }

            setRefreshStatus('success');
            toast.success('Data refreshed and validated successfully!');
        } catch (error: any) {
            setRefreshStatus('failed');
            console.error('Refresh failed:', error);
            toast.error('Refresh and validation failed!');
        }
    };

    const handleDialogCancel = () => {
        setIsDialogOpen(false);
    };

    useEffect(() => {
        if (isDialogOpen) {
            const warningState = selectedRows.some((selectedRow: Row<AssignmentRow>) => {
                const action = String(selectedRow.original.assignmentAction || "");
                const type = String(selectedRow.original.assignmentType || "");
                return action.includes("Replace") && type.includes("NoAssignment");
            });
            console.log("Dialog opened, setting warning state to:", warningState);
            setDialogWarningState(warningState);
        }
    }, [isDialogOpen, selectedRows]);
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={handleRowBackup}
                        disabled={!row.original.policy}
                        className={!row.original.policy ? 'text-gray-500' : ''}
                    >
                        Backup
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleMigrate}
                        disabled={!row.original.policy || !isReadyForMigration || isMigrated}
                        className={!row.original.policy || !isReadyForMigration || isMigrated ? 'text-gray-500' : ''}
                    >
                        Migrate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleRefresh}
                        disabled={!row.original.policy}
                        className={!row.original.policy ? 'text-gray-500' : ''}
                    >
                        Refresh
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Migration</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to migrate {selectedRows.length > 1 ? 'these rows' : 'this row'}?</p>
                    {/* Force the warning to display unconditionally to test */}
                    <p className="text-amber-500 font-semibold">
                        Warning: This operation includes replacing assignments with no assignments,
                        effectively removing those assignments.
                    </p>

                    {row.original.policy && !backupStatus[row.original.policy?.id] && (
                        <p className="text-red-500">Warning: This row is not backed up.</p>
                    )}

                    <DialogFooter>
                        <Button onClick={handleDialogCancel} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleDialogConfirm} variant="default">
                            Confirm
                        </Button>
                        {row.original.policy ? (
                            !backupStatus[row.original.policy?.id] && (
                                <p className="text-red-500">Warning: This row is not backed up.</p>
                            )
                        ) : (
                            <p className="text-amber-500">Warning: No policy information available.</p>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}