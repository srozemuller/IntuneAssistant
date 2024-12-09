import { Input } from "@/components/ui/input.tsx"
import { toast } from "sonner"
import { type Table } from "@tanstack/react-table"
import { useState } from "react"
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { FILTER_PLACEHOLDER } from "@/constants/appConstants.js";

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
    const [dropdownVisible, setDropdownVisible] = useState(false);

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
            </div>
        </div>
    );
}