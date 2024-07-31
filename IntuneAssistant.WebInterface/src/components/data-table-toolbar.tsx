"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table-view-options"

import { statuses } from "@/components/policies/ca/fixed-values"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({
                                            table,
                                        }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("displayName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("displayName")?.setFilterValue(event.target.value)
                    }
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
            <DataTableViewOptions table={table} />
        </div>
    )
}