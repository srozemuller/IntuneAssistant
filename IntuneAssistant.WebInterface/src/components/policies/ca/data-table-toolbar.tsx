import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import { statuses } from "@/components/policies/ca/fixed-values.tsx"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Cross2Icon } from "@radix-ui/react-icons"
import { ToastContainer, toast } from 'react-toastify';
import { type Table } from "@tanstack/react-table"
import { useState } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants.js";
import { SelectAllButton } from "@/components/button-selectall.tsx";
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
        } else if (exportOption === "idpowertoys") {
            const idPowerToolsData = { value: dataToExport };
            navigator.clipboard.writeText(JSON.stringify(idPowerToolsData)).then(() => {
                toast.success(
                    <div>
                        Data for IDPowerTools copied to clipboard, selected {dataCount} {rowString}.
                        <a href="https://idpowertoys.merill.net/ca" target="_blank" style={{ color: 'text-yellow-500', textDecoration: 'underline' }}>
                             Go to IDPowerTools
                        </a>  and paste the data in manual generation.
                    </div>,
                { autoClose: false }
                );
            }).catch((err) => {
                toast.error(`Failed to copy data: ${err.message}`);
            });
        }
    };

    const handleRefresh = () => {
        toast.promise(fetchData(), {
            pending: {
                render:  `Searching for conditional access policies ...`,
            },
            success: {
                render: `Conditional access policies fetched successfully`,
            },
            error:  {
                render: (errorMessage) => `Failed to get conditional access policies because: ${errorMessage}`,
            }
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
                            {source === "ca" && (
                                <button
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setExportOption("idpowertoys");
                                        handleExport(rawData);
                                        setDropdownVisible(false);
                                    }}
                                >
                                    Export for IDPowerTools
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <DataTableViewOptions table={table}/>
            </div>
        </div>
    );
}