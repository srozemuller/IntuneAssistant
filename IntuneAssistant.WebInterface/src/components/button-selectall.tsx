import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import { type Table, type Row } from "@tanstack/react-table";
import { toast } from 'react-toastify';

interface SelectAllButtonProps<TData> {
    table: Table<TData>;
    filterFn?: () => Row<TData>[];
}

export function SelectAllButton<TData>({ table, filterFn }: SelectAllButtonProps<TData>) {
    const [allSelected, setAllSelected] = useState(false);

    // Recalculate selection state whenever row selection changes
    useEffect(() => {
        const selectableRows = filterFn ? filterFn() : table.getFilteredRowModel().rows;
        const allFilteredRowIds = selectableRows.map(row => row.id);

        // Check if all selectable rows are currently selected
        const allRowsSelected =
            allFilteredRowIds.length > 0 &&
            allFilteredRowIds.every(id => table.getState().rowSelection[id]);

        setAllSelected(allRowsSelected);
    }, [table.getState().rowSelection, table, filterFn]);

    const handleSelectAll = () => {
        const selectableRows = filterFn ? filterFn() : table.getFilteredRowModel().rows;
        const allRows = table.getFilteredRowModel().rows;
        const allFilteredRowIds = selectableRows.map(row => row.id);

        if (allSelected) {
            // Deselect only the selectable rows
            const newSelection = { ...table.getState().rowSelection };
            allFilteredRowIds.forEach(id => {
                delete newSelection[id];
            });
            table.setRowSelection(newSelection);
        } else {
            // Select all selectable rows while preserving other selections
            const newSelection = { ...table.getState().rowSelection };
            allFilteredRowIds.forEach(id => {
                newSelection[id] = true;
            });
            table.setRowSelection(newSelection);

            // Show toast only when selecting AND there are rows that can't be selected
            if (allRows.length > selectableRows.length) {
                const filteredOutCount = allRows.length - selectableRows.length;
                toast.info(`${filteredOutCount} row(s) were not selected because they are not ready for migration.`);
            }
        }
    };

    return (
        <Button onClick={handleSelectAll} variant="outline" size="sm">
            {allSelected ? "Deselect All" : "Select All"}
        </Button>
    );
}