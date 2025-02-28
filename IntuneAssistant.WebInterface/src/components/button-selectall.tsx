import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { type Table } from "@tanstack/react-table";

interface SelectAllButtonProps<TData> {
    table: Table<TData>;
}

export function SelectAllButton<TData>({ table }: SelectAllButtonProps<TData>) {
    const [allSelected, setAllSelected] = useState(() => {
        const filteredRows = table.getFilteredRowModel().rows;
        const allFilteredRowIds = filteredRows.map(row => row.id);
        return allFilteredRowIds.length > 0 && table.getIsAllRowsSelected();
    });

    useEffect(() => {
        const filteredRows = table.getFilteredRowModel().rows;
        const allFilteredRowIds = filteredRows.map(row => row.id);
        const allSelected = allFilteredRowIds.length > 0 && table.getIsAllRowsSelected();
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