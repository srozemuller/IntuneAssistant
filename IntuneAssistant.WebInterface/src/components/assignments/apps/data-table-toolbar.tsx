import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {accountIsEnabled, assignmentTypes, isAssignedValues, installType} from "@/components/assignments/apps/fixed-values.tsx"
import {configurationTypes} from "@/components/constants/policyTypes.ts"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import {FILTER_PLACEHOLDER} from "@/components/constants/appConstants";
import { SelectAllButton } from "@/components/button-selectall.tsx";

interface TData {
    id: string;
    resourceType: string;
    assignmentType: string;
    isExcluded: boolean;
    isAssigned: boolean;
    enrollmentType: string;
    platform: string;
    targetId: string;
    targetName: string;
    resourceId: string;
    resourceName: string;
    filterId: string;
    filterType:string;
    filterDisplayName: string;
    filterRule: string;
    filter?: {
        displayName: string;
        rule: string;
    };
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

    const handleExport = (rawData: string) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData.filter((item: TData) =>
            selectedIds.includes(item.id)
        ).map((item: TData) => {
            return {
                resourceType: item.resourceType,
                assignmentType: item.assignmentType,
                isExcluded: item.isExcluded,
                isAssigned: item.isAssigned,
                enrollmentType: item.enrollmentType,
                targetId: item.targetId,
                targetName: item.targetName,
                resourceId: item.resourceId,
                resourceName: item.resourceName,
                filterId: item.filterId,
                filterType: item.filterType,
                filterDisplayName: item.filter?.displayName,
                filterRule: item.filter?.rule,
            };
        });
        const dataCount = dataToExport.length;
        if (dataCount === 0) {
            toast.error("No data to export.");
            return;
        }
        const rowString = dataCount === 1 ? "row" : "rows";

        if (exportOption === "backup") {
            const zip = new JSZip();
            dataToExport.forEach((item: TData, index: number) => {
                const fileName = `${item.resourceName}.json`;
                const fileContent = JSON.stringify(item, null, 2);
                zip.file(fileName, fileContent);
            });

            zip.generateAsync({ type: "blob" }).then((content) => {
                saveAs(content, `${source}-backup.zip`);
                toast.success(`Zip file created and downloaded, selected ${dataCount} ${rowString}.`);
            }).catch((err) => {
                toast.error(`Failed to create zip file: ${err.message}`);
            });
        }  else if (exportOption === "csv") {
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `${source}-data.csv`);
            toast.success(`CSV file created and downloaded, selected ${dataCount} ${rowString}.`);
        }
    };

    const handleCsvExport = async (rawData: string) => {
        const filteredRows = table.getFilteredRowModel().rows;
        const selectedRows = filteredRows.length > 0 ? filteredRows : table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData
            .filter((item: TData) => selectedIds.includes(item.id))
            .map((item: TData) => {
                return {
                    id: item.id,
                    resourceName: item.resourceName,
                    resourceId: item.resourceId,
                    platform: item.platform,
                    enrollmentType: item.enrollmentType,
                    isAssigned: item.isAssigned,
                    targetName: item.targetName,
                    targetId: item.targetId,
                    assignmentType: item.assignmentType,
                    filterDisplayName: item.filter?.displayName,
                    filterRule: item.filter?.rule
                };
            });

        try {
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'export.csv');
            toast.success("CSV export successful!");
        } catch (err) {
            console.error("CSV export failed:", err);
            toast.error("CSV export failed!");
        }
    };

    const handleRefresh = () => {
        toast.promise(fetchData(), {
            loading: `Searching for conditional access policies...`,
            success: `Conditional access policies fetched successfully`,
            error: (err) => `Failed to get conditional access policies because: ${err.message}`,
        });
    };

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
                {table.getColumn("resourceType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("resourceType")}
                        title="Type"
                        options={configurationTypes}
                    />
                )}
                {table.getColumn("isAssigned") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("isAssigned")}
                        title="Is Assigned"
                        options={isAssignedValues}
                    />
                )}
                {table.getColumn("assignmentType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("assignmentType")}
                        title="Assignment Type"
                        options={assignmentTypes}
                    />
                )}
                {table.getColumn("enrollmentType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("enrollmentType")}
                        title="Install Type"
                        options={installType}
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
            <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setDropdownVisible(!dropdownVisible)}>
                        Export
                    </Button>
                    {dropdownVisible && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setExportOption("backup");
                                    handleExport(rawData);
                                    setDropdownVisible(false);
                                }}
                            >
                                Export for Backup
                            </button>
                            <button
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    handleCsvExport(rawData);
                                    setDropdownVisible(false);
                                }}
                            >
                                Export to CSV
                            </button>
                        </div>
                    )}
                </div>
                <DataTableViewOptions table={table}/>
            </div>
        </div>
    );
}