// src/components/assignments/migrate/data-table-row-actions.tsx
import {useEffect, useState} from 'react';

import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { assignmentMigrationSchema } from "@/components/assignments/migrate/schema.tsx";
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT } from "@/components/constants/apiUrls.js";
import {MoreHorizontal} from "lucide-react";
import {DropdownMenuLabel, DropdownMenuSeparator} from "@radix-ui/react-dropdown-menu";
import {toast} from "sonner";

interface DataTableRowActionsProps<TData extends {
    id: string,
    isReadyForMigration: boolean,
    isMigrated: boolean,
    groupToMigrate: string,
    migrationCheckResult?: {
        sourcePolicyExists: boolean,
        sourcePolicyIsUnique: boolean,
        destinationPolicyExists: boolean,
        destinationPolicyIsUnique: boolean,
        groupExists: boolean
    },
    sourcePolicy: {
        id: string | null,
        "odataType": string | null,
        policyType: string | null,
        createdDateTime: string,
        creationSource: string | null,
        description: string | null,
        lastModifiedDateTime: string,
        name: string | null,
        settingCount: number | null,
        isAssigned: boolean | null
    } | null,
    destinationPolicy: {
        id: string | null,
        "odataType": string | null,
        policyType: string | null,
        createdDateTime: string,
        creationSource: string | null,
        description: string | null,
        lastModifiedDateTime: string,
        name: string | null,
        settingCount: number | null,
        isAssigned: boolean | null
    } | null
}> {
    row: Row<TData>,
    onAnimationStart: () => void,
    onAnimationEnd: () => void,
}

export function DataTableRowActions<TData extends {
    id: string,
    assignmentId: string,
    isReadyForMigration: boolean,
    isMigrated: boolean,
    groupToMigrate: string,
    migrationCheckResult?: {
        sourcePolicyExists: boolean,
        sourcePolicyIsUnique: boolean,
        destinationPolicyExists: boolean,
        destinationPolicyIsUnique: boolean,
        groupExists: boolean
    },
    sourcePolicy: {
        id: string | null,
        "odataType": string | null,
        policyType: string | null,
        createdDateTime: string,
        creationSource: string | null,
        description: string | null,
        lastModifiedDateTime: string,
        name: string | null,
        settingCount: number | null,
        isAssigned: boolean | null
    } | null,
    destinationPolicy: {
        id: string | null,
        "odataType": string | null,
        policyType: string | null,
        createdDateTime: string,
        creationSource: string | null,
        description: string | null,
        lastModifiedDateTime: string,
        name: string | null,
        settingCount: number | null,
        isAssigned: boolean | null
    } | null
}>({
       row,
                                          onAnimationStart,
                                          onAnimationEnd,
   }: DataTableRowActionsProps<TData>) {
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [refreshStatus, setRefreshStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const task = assignmentMigrationSchema.parse(row.original);
    const isReadyForMigration = row.original.isReadyForMigration;
    const isMigrated = row.original.isMigrated;
    const migrationCheckResult = row.original.migrationCheckResult;
    const [selectedGroup, setSelectedGroup] = useState(row.original.groupToMigrate);
    const [selectedGroupId, setSelectedGroupId] = useState(row.original.assignmentId);

    useEffect(() => {
        setSelectedGroup(row.original.groupToMigrate);
        setSelectedGroupId(row.original.assignmentId);
    }, [row.original.groupToMigrate, row.original.assignmentId]);

    const handleMigrate = async () => {
        try {
            setMigrationStatus('pending');
            toast.info('Migration is pending...'); // Show toast message

            // Retrieve the selected group from the column state
            const selectedGroup = row.original.groupToMigrate;
            const selectedGroupId = row.original.assignmentId;
            console.log('Selected group:', selectedGroup);
            console.log('Selected group ID:', selectedGroupId);
            // Update the task object with the new selected group
            const updatedTask = {
                ...task,
                groupToMigrate: selectedGroup,
                assignmentId: selectedGroupId,
            };

            // Send the updated task object in the JSON payload
            const response = await authDataMiddleware(`${ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT}/${row.original.destinationPolicy?.id}`, 'POST', JSON.stringify(updatedTask));
            if (response?.status === 204) {
                setMigrationStatus('success');
                toast.success('Migration successful!'); // Show success toast message
            } else {
                setMigrationStatus('failed');
                toast.error('Migration failed!'); // Show error toast message
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            toast.error('Migration failed!'); // Show error toast message
            console.log('Migration failed:', error);
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.location.href = error.consentUri; // Redirect to consent URI
            }
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshStatus('pending');
            setIsAnimating(true);
            // Implement the refresh logic here
            // For example, re-fetch the data for this specific row
            const response = await authDataMiddleware(`${ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT}/${row.original.id}`, 'GET');
            if (response?.status === 200) {
                // Update the row data with the new data
                setRefreshStatus('success');
                toast.success('Refreshed'); // Show success toast message
                setTimeout(() => setIsAnimating(false), 1000); // End animation after 1 second
            } else {
                setRefreshStatus('failed');
                setIsAnimating(false);
            }
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
        <div className={isAnimating ? 'fade-to-normal' : ''}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={handleMigrate}
                        className={!isReadyForMigration || isMigrated ? 'text-gray-500' : ''}
                    >
                        Migrate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleRefresh}
                        className={!isReadyForMigration || isMigrated ? 'text-gray-500' : ''}
                    >
                        Refresh
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}