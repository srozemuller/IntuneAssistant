import * as React from "react"
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table"
import {
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
import { DataTableToolbar } from "@/components/assignments/overview/data-table-group-toolbar.tsx"
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
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [members, setMembers] = useState<UserMember[]>([])


    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: { pageIndex: currentPage, pageSize },
        },
        enableColumnResizing: true,
        columnResizeMode: "onChange",
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function' ? updater({ pageIndex: currentPage, pageSize }) : updater;
            setCurrentPage(newState.pageIndex);
            setPageSize(newState.pageSize);
        },
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
            <DataTablePagination table={table} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead
                                        key={header.id}
                                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                        style={{ width: header.getSize() }}
                                    >
                                        <div className="flex items-center justify-between">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: " 🔼",
                                                desc: " 🔽",
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`resizer ${
                                                    header.column.getIsResizing() ? "isResizing" : ""
                                                }`}
                                            ></div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
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

            <style jsx>{`
                .resizer {
                    position: absolute;
                    right: 0;
                    top: 0;
                    height: 100%;
                    width: 5px;
                    background: rgba(0, 0, 0, 0.1);
                    cursor: col-resize;
                    user-select: none;
                    touch-action: none;
                }

                .resizer.isResizing {
                    background: rgba(0, 0, 0, 0.3);
                }
            `}</style>
        </div>
    )
}