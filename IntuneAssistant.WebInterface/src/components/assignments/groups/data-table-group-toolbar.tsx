import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {
    accountIsEnabled,
    assignmentTypes,
    isAssignedValues,
    memberType
} from "@/components/assignments/overview/fixed-values.tsx"
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

    const handleExport = (rawData: string) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData.filter((item: TData) =>
            selectedIds.includes(item.id)
        );

        const dataCount = dataToExport.length;
        if (dataCount === 0) {
            toast.error("No data to export.");
            return;
        }
        const rowString = dataCount === 1 ? "row" : "rows";

        if (exportOption === "backup") {
            const zip = new JSZip();
            dataToExport.forEach((item: TData, index: number) => {
                const fileName = `${item.displayName}.json`;
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
                {table.getColumn("type") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("type")}
                        title="Member Type"
                        options={memberType}
                    />
                )}
                {table.getColumn("accountEnabled") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("accountEnabled")}
                        title="Is Assigned"
                        options={accountIsEnabled}
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
                                    setExportOption("csv");
                                    handleExport(rawData);
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