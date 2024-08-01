import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import { statuses } from "@/components/policies/configuration/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface TData {
    displayName: string;
    id: string;
    name: string;
    // Add other properties as needed
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

        const dataString = JSON.stringify(dataToExport, null, 2);
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
        } else if (exportOption === "idpowertools") {
            const idPowerToolsData = { value: dataToExport };
            navigator.clipboard.writeText(JSON.stringify(idPowerToolsData)).then(() => {
                toast.success(`Data for IDPowerTools copied to clipboard, selected ${dataCount} ${rowString}.`);
            }).catch((err) => {
                toast.error(`Failed to copy data: ${err.message}`);
            });
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
                <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("policyType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("policyType")}
                        title="policyType"
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
            <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                    Refresh
                </Button>
                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setDropdownVisible(!dropdownVisible)}>
                        Export
                    </Button>
                    {dropdownVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
                        </div>
                    )}
                </div>
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}