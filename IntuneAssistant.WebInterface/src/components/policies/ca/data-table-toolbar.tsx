import { Input } from "@/components/ui/input.tsx"
import { statuses } from "@/components/policies/ca/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Cross2Icon } from "@radix-ui/react-icons"
import { ToastContainer, toast } from 'react-toastify';
import { type Table } from "@tanstack/react-table"
import {useMemo, useState} from "react"

import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants.js";
import { SelectAllButton } from "@/components/button-selectall.tsx";

import { DataTableExport } from "@/components/data-table-export";
import { DataTableRefresh } from "@/components/data-table-refresh";
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {Copy, ExternalLink} from "lucide-react";


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface TData {
    displayName: string;
    id: string;
    name: string;
}

interface DataTableToolbarProps {
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
                                 }: DataTableToolbarProps) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [exportOption, setExportOption] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    // Add state for the confirmation dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);


    // Modified to show confirmation first
    const handleCopyAndRedirect = () => {
        setShowConfirmDialog(true);
    };

    const confirmCopyAndRedirect = () => {
        try {
            let dataToExport = "";  // Initialize with empty string to avoid undefined

            // Check if rawData is a string containing a JSON object with data property
            if (typeof rawData === 'string') {
                try {
                    const parsed = JSON.parse(rawData);
                    if (parsed && parsed.data) {
                        // Create the properly formatted structure for idpowertoys
                        dataToExport = JSON.stringify({
                            "value": parsed.data
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse JSON:", e);
                    dataToExport = rawData;
                }
            } else {
                dataToExport = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
            }

            // Copy the formatted data to clipboard
            navigator.clipboard.writeText(dataToExport)
                .then(() => {
                    toast.success("Data copied to clipboard");
                    // Close the dialog
                    setShowConfirmDialog(false);
                    // Open external link in new tab
                    window.open("https://idpowertoys.merill.net/ca", "_blank");
                })
                .catch(err => {
                    console.error("Failed to copy: ", err);
                    toast.error("Failed to copy data");
                    // Close the dialog
                    setShowConfirmDialog(false);
                    // Still open the link even if copy fails
                    window.open("https://idpowertoys.merill.net/ca", "_blank");
                });
        } catch (error) {
            console.error("Error handling copy and redirect: ", error);
            toast.error("An error occurred");
            setShowConfirmDialog(false);
        }
    };

    const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
    const parsedRawData = useMemo(() => {
        try {
            if (typeof rawData === 'string') {
                try {
                    const parsed = JSON.parse(rawData);
                    return parsed.data || parsed || [];
                } catch (e) {
                    console.error("Failed to parse JSON:", e);
                    return [];
                }
            } else if (Array.isArray(rawData)) {
                return rawData;
            } else if (rawData && typeof rawData === 'object') {
                return (rawData as any).data || [];
            }
            return [];
        } catch (error) {
            console.error("Failed to parse raw data:", error);
            return [];
        }
    }, [rawData]);

    const prepareExportData = useMemo(() => {
        try {
            const selectedRows = table.getSelectedRowModel().rows;
            let parsedRawData: any[] = [];  // Properly typed as any array

            // Handle different data formats safely
            if (typeof rawData === 'string') {
                try {
                    const parsed = JSON.parse(rawData);
                    // Access the nested data property directly
                    parsedRawData = parsed.data || [];
                } catch (e) {
                    console.error("Failed to parse JSON:", e);
                }
            } else if (Array.isArray(rawData)) {
                parsedRawData = rawData;
            } else if (rawData && typeof rawData === 'object') {
                // If rawData is already an object, extract the data property
                parsedRawData = (rawData as any).data || [];
            }

            // Log for debugging
            console.log("Extracted data array:", parsedRawData);

            // Ensure parsedRawData is an array at this point
            if (!Array.isArray(parsedRawData)) {
                console.error("Raw data is not an array after parsing", parsedRawData);
                return [];
            }

            // Get all rows or filtered rows based on selection
            const dataToProcess = selectedRows.length > 0
                ? parsedRawData.filter(item =>
                    selectedRows.map(row => row.original.id).includes(item.id)
                )
                : parsedRawData;


            // Process and map all the filtered rows in the same way
            return dataToProcess.map((item) => ({
                id: item.id || '',
                displayName: item.displayName || '',
                state: item.state || '',
                createdDateTime: item.createdDateTime || '',
                modifiedDateTime: item.modifiedDateTime || '',
                includedUsers: item.conditions?.users?.includeUsersReadable?.map((group: { displayName: string }) => group.displayName).join('\n') || '',
                excludedUsers: item.conditions?.users?.excludeUsersReadable?.map((group: { displayName: string }) => group.displayName).join('\n') || '',
                includedGroups: item.conditions?.users?.includeGroupsReadable?.map((group: { displayName: string }) => group.displayName).join('\n') || '',
                excludedGroups: item.conditions?.users?.excludeGroupsReadable?.map((group: { displayName: string }) => group.displayName).join('\n') || ''
            }));
        } catch (error) {
            console.error("Failed to prepare export data:", error);
            return [];
        }
    }, [table.getSelectedRowModel().rows, rawData]);

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <SelectAllButton table={table} />
                <Input
                    placeholder={FILTER_PLACEHOLDER}
                    value={table.getState().globalFilter ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        table.setGlobalFilter(value);
                    }}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("state") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("state")}
                        title="State"
                        options={statuses}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redirect to Power Toys</DialogTitle>
                        <DialogDescription>
                            Your data will be copied to clipboard and you will be redirected to Power Toys.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmCopyAndRedirect}>
                            Copy & Open Power Toys
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center space-x-2">
                <DataTableRefresh
                    fetchData={fetchData}
                    resourceName={source ? `${source}` : "data"}
                />
                <DataTableExport
                    data={prepareExportData}
                    fileName={`${source}-data`}
                    rawData={parsedRawData}
                    selectedRows={selectedRows}
                    disabled={!prepareExportData || prepareExportData.length === 0}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAndRedirect}
                    className="h-8 px-2 lg:px-3 flex items-center"
                    title="Copy data and open Power Toys"
                >
                    <ExternalLink className="h-4 w-4" />
                    <span className="ml-1 hidden md:inline">Power Toys</span>
                </Button>
                <DataTableViewOptions table={table}/>
            </div>
        </div>
    );
}