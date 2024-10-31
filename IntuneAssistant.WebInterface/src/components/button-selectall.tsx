// File: src/components/SelectAllButton.tsx

import { Button } from "@/components/ui/button.tsx";
import type { Table } from '@tanstack/react-table';

interface SelectAllButtonProps<TData> {
    table: Table<TData>;
}

export function SelectAllButton<TData>({ table }: SelectAllButtonProps<TData>) {
    const handleSelectAllToggle = () => {
        const allRowsSelected = table.getIsAllRowsSelected();
        table.toggleAllRowsSelected(!allRowsSelected);
    };

    return (
        <Button
            onClick={handleSelectAllToggle}
            className="h-8 px-2 lg:px-3"
            variant="ghost"
        >
            Select All
        </Button>
    );
}