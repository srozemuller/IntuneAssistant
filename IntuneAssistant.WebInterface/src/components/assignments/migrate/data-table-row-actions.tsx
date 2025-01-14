// src/components/assignments/migrate/data-table-row-actions.tsx
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
    ASSIGNMENTS_MIGRATE_ENDPOINT, ASSIGNMENTS_VALIDATION_ENDPOINT,
    EXPORT_ENDPOINT,
} from "@/components/constants/apiUrls.js";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";

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
    filterType: string;
    policy: {
        id: string
        policyType: string
    };
}

interface DataTableRowActionsProps {
    row: Row<AssignmentRow>;
    setTableData: React.Dispatch<React.SetStateAction<AssignmentRow[]>>;
}
export function DataTableRowActions({
                                        row,
                                        setTableData,
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
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setSelectedGroup(row.original.groupToMigrate);
        setSelectedGroupId(row.original.assignmentId);
        setSelectedFilter(row.original.filterToMigrate);
        setSelectedAssignmentType(row.original.assignmentType);
        setSelectedFilterType(row.original.filterType);
    }, [row.original]);

    useEffect(() => {
        const updateRowInBackground = async () => {
            try {
                const updatedTask = {
                    ...task,
                    groupToMigrate: selectedGroup,
                    assignmentId: selectedGroupId,
                    filterToMigrate: selectedFilter,
                    assignmentType: selectedAssignmentType,
                    filterType: selectedFilterType
                };
            } catch (error: any) {
                console.error('Error updating row in background:', error);
            }
        };

        updateRowInBackground();
    }, [selectedGroup, selectedGroupId, selectedFilter, selectedAssignmentType, selectedFilterType]);

    const handleMigrate = async () => {
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
            setIsAnimating(true);
            console.log('Row settings before refresh:', row.original);

            const requestBody = {
                Id: row.original.id,
                ResourceType: "ConfigurationPolicy",
                ResourceId: row.original.policy.id,
                AssignmentId: selectedGroupId,
                AssignmentType: selectedAssignmentType,
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

            setTableData(prevData => prevData.map(r => r.id === row.original.id ? { ...row.original } : r));

            setRefreshStatus('success');
            toast.success('Row refreshed successfully!');
            setTimeout(() => setIsAnimating(false), 1000);
        } catch (error: any) {
            setRefreshStatus('failed');
            setIsAnimating(false);
            console.log('Refresh failed:', error);
        }
    };

    const getTooltipMessage = () => {
        if (!migrationCheckResult) return "Migration check result is missing.";
        const messages = [];
        if (!migrationCheckResult.sourcePolicyExists) messages.push("Source policy does not exist.");
        if (!migrationCheckResult.sourcePolicyIsUnique) messages.push("Source policy is not unique.");
        if (!migrationCheckResult.destinationPolicyExists) messages.push("Destination policy does not exist.");
        if (!migrationCheckResult.destinationPolicyIsUnique) messages.push("Destination policy is not unique.");
        if (!migrationCheckResult.groupExists) messages.push("Group does not exist.");
        return messages.join(" ");
    };

    return (
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
                    disabled={!isReadyForMigration || isMigrated || !backupStatus[row.original.id]}
                    className={!isReadyForMigration || isMigrated || !backupStatus[row.original.id] ? 'text-gray-500' : ''}
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
    );
}