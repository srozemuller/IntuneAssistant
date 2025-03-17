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
    validateAndUpdateTable: () => Promise<void>;
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

    useEffect(() => {
        setSelectedGroup(row.original.groupToMigrate);
        setSelectedGroupId(row.original.assignmentId);
        setSelectedFilter(row.original.filterToMigrate);
        setSelectedAssignmentType(row.original.assignmentType);
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
                setBackupStatus(prevStatus => ({ ...prevStatus, [row.original.id]: true }));
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
            toast.info('Refreshing data...');

            await validateAndUpdateTable(row.original.policy.id); // Pass the policy ID

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
                    <DropdownMenuItem onClick={handleBackup}>
                        Backup
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleMigrate}
                        disabled={!isReadyForMigration || isMigrated}
                        className={!isReadyForMigration || isMigrated ? 'text-gray-500' : ''}
                    >
                        Migrate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRefresh}>
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