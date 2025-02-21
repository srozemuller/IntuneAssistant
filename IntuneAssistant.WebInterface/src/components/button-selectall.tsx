import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { type Table } from "@tanstack/react-table";

interface SelectAllButtonProps<TData> {
    table: Table<TData>;
}

export function SelectAllButton<TData>({ table }: SelectAllButtonProps<TData>) {
    const [allSelected, setAllSelected] = useState(false);

    useEffect(() => {
        const filteredRows = table.getFilteredRowModel().rows;
        const allFilteredRowIds = filteredRows.map(row => row.id);
        const allSelected = allFilteredRowIds.every(id => table.getIsAllRowsSelected(id));
        setAllSelected(allSelected);
    }, [table]);

    const handleSelectAll = () => {
        const filteredRows = table.getFilteredRowModel().rows;
        const allFilteredRowIds = filteredRows.map(row => row.id);

        if (allSelected) {
            table.setRowSelection({});
        } else {
            table.setRowSelection(allFilteredRowIds.reduce((acc, id) => {
                acc[id] = true;
                return acc;
            }, {} as Record<string, boolean>));
        }
        setAllSelected(!allSelected);
    };

    return (
        <Button onClick={handleSelectAll} variant="outline" size="sm">
            {allSelected ? "Deselect All" : "Select All"}
        </Button>
    );
}