// src/components/assignments/restore/data-table-row-actions.tsx
import { useState } from 'react';
import { type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { policyRestoreSchema, type policyRestoreModel } from '@/components/assignments/restore/schema.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import {
    ASSIGNMENTS_CONFIGURATION_POLICY_ENDPOINT,
    ASSIGNMENTS_RESTORE_ENDPOINT
} from "@/components/constants/apiUrls.js";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";

interface DataTableRowActionsProps {
    row: Row<policyRestoreModel>,
    onAnimationStart: () => void,
    onAnimationEnd: () => void,
}

export function DataTableRowActions({
                                        row,
                                        onAnimationStart,
                                        onAnimationEnd,
                                    }: DataTableRowActionsProps) {
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [refreshStatus, setRefreshStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const task = policyRestoreSchema.parse(row.original);

    const handleRestore = async () => {
        try {
            setMigrationStatus('pending');
            toast.info('Restore is pending...');
            const response = await authDataMiddleware(`${ASSIGNMENTS_RESTORE_ENDPOINT}`, 'POST', JSON.stringify(task));
            if (response?.status === 204) {
                setMigrationStatus('success');
                toast.success('Restore successful!');
            } else {
                setMigrationStatus('failed');
                toast.error('Restore failed!');
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            toast.error('Restore failed!');
            console.log('Restore failed:', error);
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.location.href = error.consentUri;
            }
        }
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
                        onClick={handleRestore}
                        className='text-gray-500'
                    >
                        Migrate
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}