// src/components/assignments/migrate/data-table-row-actions.tsx
import { useEffect, useState, useRef } from 'react';
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
    ASSIGNMENTS_MIGRATE_ENDPOINT, ASSIGNMENTS_VALIDATION_ENDPOINT,
    EXPORT_ENDPOINT,
} from "@/components/constants/apiUrls.js";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";

// Define the interface with the required properties
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
}
export function DataTableRowActions({
                                        row,
                                        setTableData,
                                        table,
                                        backupStatus,
                                        setBackupStatus
                                    }: DataTableRowActionsProps) {
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [refreshStatus, setRefreshStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const task = assignmentMigrationSchema.parse(row.original);
    const isReadyForMigration = row.original.isReadyForMigration;
    const isMigrated = row.original.isMigrated;
    const migrationCheckResult = row.original.migrationCheckResult;
    const [selectedGroup, setSelectedGroup] = useState(row.original.groupToMigrate);
    const [selectedGroupId, setSelectedGroupId] = useState(row.original.assignmentId);
    const [selectedFilter, setSelectedFilter] = useState(row.original.filterToMigrate);
    const [selectedAssignmentType, setSelectedAssignmentType] = useState(row.original.assignmentType);
    const [selectedFilterType, setSelectedFilterType] = useState(row.original.filterType);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);

    useEffect(() => {
        setSelectedGroup(row.original.groupToMigrate);
        setSelectedGroupId(row.original.assignmentId);
        setSelectedFilter(row.original.filterToMigrate);
        setSelectedAssignmentType(row.original.assignmentType);
        setSelectedFilterType(row.original.filterType);
    }, [row.original]);

    const validateAndUpdateRow = async () => {
        try {
            const policyId = row.original.policy.id;
            if (table?.getRowModel) {
                const allRows = table.getRowModel().rows;
                const rowsWithSamePolicyId = allRows.filter((r: any) => r.original.policy.id === policyId);
                const validationRequestBody = rowsWithSamePolicyId.map((r: any) => ({
                    Id: r.original.id,
                    ResourceType: r.original.policy.policyType,
                    ResourceId: r.original.policy.id,
                    AssignmentId: r.original.assignmentId,
                    AssignmentType: r.original.assignmentType,
                    AssignmentAction: r.original.assignmentAction,
                    FilterId: r.original.filterToMigrate?.id || null,
                    FilterType: r.original.filterType || 'none'
                }));

                const validationResponse = await authDataMiddleware(`${ASSIGNMENTS_VALIDATION_ENDPOINT}`, 'POST', JSON.stringify(validationRequestBody));
                if (validationResponse?.status === 200) {
                    const validationData = validationResponse.data;
                    const updatedData = allRows.map((r: any) => {
                        const validationItem = validationData.find((item: any) => item.id === r.original.id);
                        if (validationItem) {
                            return {
                                ...r.original,
                                isMigrated: validationItem.hasCorrectAssignment,
                                policy: {
                                    ...r.original.policy,
                                    assignments: validationItem.policy.assignments
                                }
                            };
                        }
                        return r.original;
                    });
                    setTableData(updatedData);
                } else {
                    toast.error('Failed to validate all rows.');
                }
            } else {
                console.error('table.getRowModel is not a function or table is undefined');
            }
        } catch (error: any) {
            console.log('Validation failed:', error);
            toast.error('Validation failed!');
        }
    };

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
                filterType: selectedFilterType
            };

            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', JSON.stringify([updatedTask]));
            if (response?.status === 200) {
                setMigrationStatus('success');
                toast.success('Migration successful!');
                await validateAndUpdateRow();

                // Send all rows with the same policyId to the validation endpoint
                const policyId = row.original.policy.id;
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

    const handleBackup = async () => {
        try {
            const policyType = row.original.policy.policyType;
            const policyId = row.original.policy.id;
            const response = await authDataMiddleware(`${EXPORT_ENDPOINT}/${policyType}/${policyId}`, 'GET');

            if (response?.status === 200) {
                const jsonString = JSON.stringify(response.data);
                const blob = new Blob([jsonString], { type: 'application/json' });
                saveAs(blob, `${policyType}_${policyId}.json`);
                toast.success('Backup successful!');
                setBackupStatus(prevStatus => ({ ...prevStatus, [row.original.id]: true })); // Update backup status
            } else {
                toast.error('Backup failed!');
            }
        } catch (error: any) {
            console.error('Backup failed:', error);
            toast.error('Backup failed!');
        }
    };


    const handleRefresh = async () => {
        try {
            setRefreshStatus('pending');
            console.log('Row settings before refresh:', row.original);

            const requestBody = {
                Id: row.original.id,
                ResourceType: "ConfigurationPolicy",
                ResourceId: row.original.policy.id,
                AssignmentId: selectedGroupId,
                AssignmentType: selectedAssignmentType,
                AssignmentAction: row.original.assignmentAction,
                FilterId: selectedFilter?.id || null,
                FilterType: selectedFilterType ||  'none'
            };

            const response = await authDataMiddleware(`${ASSIGNMENTS_VALIDATION_ENDPOINT}`, 'POST', JSON.stringify([requestBody]));
            if (response?.status === 200) {
                const responseData = response.data[0];
                if (!responseData.hasCorrectAssignment) {
                    row.original.isMigrated = false;
                    row.original.isReadyForMigration = true;
                }
                else {
                    row.original.isMigrated = true;
                    row.original.isReadyForMigration = false
                }
                setMigrationStatus('success');
                toast.success('Validation successful!');
            } else {
                setMigrationStatus('failed');
                toast.error('Validation failed!');
            }

            console.log('API response:', response.data);
            console.log('Row settings after refresh:', requestBody);
            // Store the current page index
            const currentPage = table.getState().pagination.pageIndex;

            setTableData(prevData => prevData.map(r => r.id === row.original.id ? { ...row.original } : r));
            // Restore the page index
            table.setPageIndex(currentPage);
            setRefreshStatus('success');
            toast.success('Row refreshed successfully!');

        } catch (error: any) {
            setRefreshStatus('failed');
            console.log('Refresh failed:', error);
        }
    };

    const handleDialogCancel = () => {
        setIsDialogOpen(false);
    };
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
                    onClick={handleBackup}
                >
                    Backup
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleMigrate}
                    disabled={!isReadyForMigration || isMigrated}
                    className={!isReadyForMigration || isMigrated ? 'text-gray-500' : ''}
                >
                    Migrate
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleRefresh}
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
                    <p>Are you sure you want to migrate this row?</p>
                    {!backupStatus[row.original.id] && (
                        <p className="text-red-500">Warning: This row is not backed up.</p>
                    )}
                    <DialogFooter>
                        <Button onClick={handleDialogCancel} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleDialogConfirm} variant="default">
                            Confirm
                        </Button>
                        {!backupStatus[row.original.id] && (
                            <Button onClick={handleBackup} variant="default">
                                Make Backup
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}