import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/ui/pagination"
import { DataTableToolbar } from "@/components/assignments/groups/data-table-group-toolbar.tsx"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import axios from "axios"

interface DataTableProps<TData, TValue> {
    source: string
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    rawData: string
    fetchData: () => Promise<void>
}
interface UserMember {
    id: string;
    name: string;
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             rawData,
                                             fetchData,
                                             source,
                                         }: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
// Update the state and fetch function to use the UserMember type
    const [members, setMembers] = React.useState<UserMember[]>([]);


    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className="space-y-4">
            <DataTableToolbar source={source} table={table} rawData={rawData} fetchData={fetchData} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogTitle>Group Members</DialogTitle>
                    <DialogDescription>
                        {members.length > 0 ? (
                            <ul>
                                {members.map((member) => (
                                    <li key={member.id}>{member.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No members found.</p>
                        )}
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </div>
    )
}