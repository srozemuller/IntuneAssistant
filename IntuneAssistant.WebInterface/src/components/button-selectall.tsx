import { Button } from "@/components/ui/button.tsx";
import { type Table } from "@tanstack/react-table";

interface SelectAllButtonProps<TData> {
    table: Table<TData>;
}

export function SelectAllButton<TData>({ table }: SelectAllButtonProps<TData>) {
    const handleSelectAll = () => {
        const filteredRows = table.getFilteredRowModel().rows;
        const allFilteredRowIds = filteredRows.map(row => row.id);
        table.setRowSelection(allFilteredRowIds.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {}));
    };

    return (
        <Button onClick={handleSelectAll} variant="outline" size="sm">
            Select All
        </Button>
    );
}