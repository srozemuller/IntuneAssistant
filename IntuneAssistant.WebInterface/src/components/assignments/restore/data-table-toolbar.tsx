// src/components/assignments/restore/data-table-toolbar.tsx

import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import { filterType } from "@/components/assignments/restore/fixed-values.tsx"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { CrossIcon } from "lucide-react";
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState, useEffect } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx"

import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants";
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_RESTORE_ENDPOINT } from "@/components/constants/apiUrls";
import {z} from "zod";
import type {policySchema} from "@/components/policies/configuration/schema.tsx";

interface TData {
    id: string;
    excludeGroupFromSource: boolean;
    sourcePolicy: z.infer<typeof policySchema> | null;
    destinationPolicy: z.infer<typeof policySchema> | null;
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
                                 }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [exportOption, setExportOption] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
    const [consentUri, setConsentUri] = useState<string | null>(null);
    const [jsonString, setJsonString] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRowCount, setSelectedRowCount] = useState(0);

    useEffect(() => {
        const selectedRows = table.getSelectedRowModel().rows;
        setSelectedRowCount(selectedRows.length);
    }, [table.getSelectedRowModel().rows]);


    const handleRefresh = () => {
        toast.promise(fetchData(), {
            loading: `Searching for policies...`,
            success: `Migration plan fetched successfully`,
            error: (err) => `Failed to get migration info because: ${err.message}`,
        });
    };


    const handleRestore = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const combinedData = selectedRows.map(row => row.original);
        const combinedJsonString = JSON.stringify(combinedData, null, 2);
        console.log('Combined JSON Array res:', combinedJsonString);

        if (combinedJsonString.length === 0) {
            toast.error("No rows selected for migration.");
            return;
        }


        try {
            setMigrationStatus('pending');
            const response = await authDataMiddleware(`${ASSIGNMENTS_RESTORE_ENDPOINT}`, 'POST', combinedJsonString);
            if (response?.status === 204) {
                setMigrationStatus('success');
                toast.success("Selected rows migrated successfully.");
            } else {
                setMigrationStatus('failed');
                toast.error("Failed to migrate selected rows.");
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.location.href = error.consentUri;
            }
        }
    };

    const handleConfirmMigrate = () => {
        setIsDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        setIsDialogOpen(false);
        handleRestore();
    };

    const handleDialogCancel = () => {
        setIsDialogOpen(false);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder={FILTER_PLACEHOLDER}
                    value={table.getState().globalFilter ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        table.setGlobalFilter(value);
                    }}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <CrossIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
                <Button onClick={handleConfirmMigrate} variant="outline" size="sm">
                    Restore
                </Button>
                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setDropdownVisible(!dropdownVisible)}>
                        Export
                    </Button>
                    {dropdownVisible && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
                    <p>Are you sure you want to migrate the selected {selectedRowCount} row(s)?</p>
                    <DialogFooter>
                        <Button onClick={handleDialogCancel} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={handleDialogConfirm} variant="default">
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}