import { useState } from 'react';
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { assignmentMigrationSchema } from "@/components/assignments/migrate/schema.tsx";
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT } from "@/components/constants/apiUrls.js";

interface DataTableRowActionsProps<TData extends { id: string, replacementPolicyId: string, isReadyForMigration: string, isMigrated: string, migrationCheckResult?: { sourcePolicyExists: boolean, sourcePolicyIsUnique: boolean, destinationPolicyExists: boolean, destinationPolicyIsUnique: boolean, groupExists: boolean } }> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends { id: string, replacementPolicyId: string, isReadyForMigration: string, isMigrated: string, migrationCheckResult?: { sourcePolicyExists: boolean, sourcePolicyIsUnique: boolean, destinationPolicyExists: boolean, destinationPolicyIsUnique: boolean, groupExists: boolean } }>({
                                                                                                                                                                                                                                                                                                                                       row,
                                                                                                                                                                                                                                                                                                                                   }: DataTableRowActionsProps<TData>) {
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const task = assignmentMigrationSchema.parse(row.original);
    const isReadyForMigration = row.original.isReadyForMigration === 'yes';
    const isMigrated = row.original.isMigrated === 'true';
    const migrationCheckResult = row.original.migrationCheckResult;

    const handleMigrate = async () => {
        try {
            const response = await authDataMiddleware(`${ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT}/${row.original.replacementPolicyId}`, 'POST', JSON.stringify(task));
            console.log('Migration successful:', response);
        } catch (error: any) {
            console.log('Migration failed:', error);
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.location.href = error.consentUri; // Redirect to consent URI
            }
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
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <DotsHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem asChild>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={handleMigrate}
                                    //disabled={!isReadyForMigration || isMigrated}
                                    className={!isReadyForMigration || isMigrated ? 'text-gray-500' : ''}
                                >
                                    Migrate
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{getTooltipMessage()}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}