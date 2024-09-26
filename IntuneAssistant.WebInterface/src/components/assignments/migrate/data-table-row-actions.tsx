import { useState } from 'react';
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type Row } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
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

interface DataTableRowActionsProps<TData extends { id: string, replacementPolicyId: string }> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends { id: string, replacementPolicyId: string }>({
                                                                                                   row,
                                                                                               }: DataTableRowActionsProps<TData>) {
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const task = assignmentMigrationSchema.parse(row.original);

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
                    <button onClick={handleMigrate}>
                        Migrate <ExternalLink className="h-3 w-3 ml-3" />
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}