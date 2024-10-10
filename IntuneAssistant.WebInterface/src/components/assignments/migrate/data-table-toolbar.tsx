import { Input } from "@/components/ui/input.tsx"
import { DataTableViewOptions } from "@/components/data-table-view-options.tsx"
import {migrationNeeded, readyForMigration} from "@/components/assignments/migrate/fixed-values.tsx"
import { DataTableFacetedFilter } from "./data-table-faceted-filter.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Cross2Icon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { FILTER_PLACEHOLDER } from "@/components/constants/appConstants";
import authDataMiddleware from "@/components/middleware/fetchData";
import {ASSIGNMENTS_MIGRATE_ENDPOINT} from "@/components/constants/apiUrls";
import {assignmentMigrationSchema} from "@/components/assignments/migrate/schema.tsx";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    rawData: string;
    fetchData: () => Promise<void>;
    source: string;
}

interface ExportData {
    id: string;
    displayName: string;
}


export function DataTableToolbar<TData>({
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

    const handleExport = (rawData: string) => {
        const selectedRows = table.getSelectedRowModel().rows as Array<{ original: ExportData }>;
        const selectedIds = selectedRows.map(row => row.original.id);
        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData
            .map((item: ExportData) => assignmentMigrationSchema.parse(item))
            .filter((item: ExportData) => selectedIds.includes(item.id));

        const dataString = JSON.stringify(dataToExport, null, 2);
        const dataCount = dataToExport.length;
        if (dataCount === 0) {
            toast.error("No data to export.");
            return;
        }
        const rowString = dataCount === 1 ? "row" : "rows";

        if (exportOption === "backup") {
            const zip = new JSZip();
            dataToExport.forEach((item: ExportData, index: number) => {
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
            loading: `Searching for policies...`,
            success: `Migration plan fetched successfully`,
            error: (err) => `Failed to get migration info because: ${err.message}`,
        });
    };

    // Define the jsonString state variable
    const handleMigrate = async () => {
        const selectedRows = table.getSelectedRowModel().rows as Array<{ original: ExportData }>;
        console.log('Selected rows:', selectedRows); // Log the selected rows to verify their structure

        const selectedIds = selectedRows.map(row => row.original.id);
        console.log('Selected IDs:', selectedIds); // Log the selected IDs to verify the mapping

        const parsedRawData = JSON.parse(rawData);

        const dataToExport = parsedRawData
            .filter((item: ExportData) => selectedIds.includes(item.id))
            .map((item: ExportData) => {
                const selectedRow = selectedRows.find(row => row.original.id === item.id);
                return selectedRow ? selectedRow.original : item;
            });

        if (dataToExport.length === 0) {
            toast.error("No rows selected for migration.");
            return;
        }

        const dataString = JSON.stringify(dataToExport, null, 2);
        console.log('Data to migrate:', dataString);

        try {
            setMigrationStatus('pending');
            const response = await authDataMiddleware(`${ASSIGNMENTS_MIGRATE_ENDPOINT}`, 'POST', dataString);
            if (response?.status === 204) {
                setMigrationStatus('success');
                toast.success("Selected rows migrated successfully.");
            } else {
                setMigrationStatus('failed');
                toast.error("Failed to migrate selected rows.");
            }
        } catch (error: any) {
            setMigrationStatus('failed');
            console.log('Migration failed:', error);
            if (error.consentUri) {
                setConsentUri(error.consentUri);
                window.location.href = error.consentUri; // Redirect to consent URI
            }
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
                {table.getColumn("isMigrated") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("isMigrated")}
                        title="Migration Status"
                        options={migrationNeeded}
                    />
                )}
                {table.getColumn("isReadyForMigration") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("isReadyForMigration")}
                        title="Ready for Migration"
                        options={readyForMigration}
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
                <Button onClick={handleMigrate} variant="outline" size="sm">
                    Migrate
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
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}