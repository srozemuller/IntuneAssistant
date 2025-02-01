import * as React from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type PaginationState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/pagination";
import { DataTableToolbar } from "@/components/assignments/migrate/data-table-toolbar.tsx";
import { useState } from "react";
import { DataTableRowActions } from './data-table-row-actions.tsx';
import authDataMiddleware from "@/components/middleware/fetchData";
import { ASSIGNMENTS_VALIDATION_ENDPOINT } from "@/components/constants/apiUrls.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DataTableProps<TData, TValue> {
    source: string;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    rawData: string;
    rowClassName?: string;
    fetchData: () => Promise<void>;
    setTableData: React.Dispatch<React.SetStateAction<TData[]>>;
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             rawData,
                                             fetchData,
                                             source,
                                             rowClassName,
                                             setTableData,
                                         }: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10); // Default page size
    const [backupStatus, setBackupStatus] = useState<{ [key: string]: boolean }>({});
    const [isBlurring, setIsBlurring] = useState(false);

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
    });

    const validateAndUpdateTable = async (policyId?: string) => {
        try {
            setIsBlurring(true);
            const allRows = table.getRowModel().rows;
            const rowsToValidate = policyId
                ? allRows.filter((r: any) => r.original.policy.id === policyId)
                : allRows;

            const validationRequestBody = rowsToValidate.map((r: any) => ({
                Id: r.original.id,
                ResourceType: r.original.policy.policyType,
                ResourceId: r.original.policy.id,
                AssignmentId: r.original.assignmentId,
                AssignmentType: r.original.assignmentType,
                AssignmentAction: r.original.assignmentAction,
                FilterId: r.original.filterToMigrate?.id || null,
                FilterType: r.original.filterType || 'none'
            }));

            const validationResponse = await authDataMiddleware(`${ASSIGNMENTS_VALIDATION_ENDPOINT}`, 'POST', JSON.stringify(validationRequestBody));
            if (validationResponse?.status === 200) {
                const validationData = validationResponse.data;
                const updatedData = allRows.map((r: any) => {
                    const validationItem = validationData.find((item: any) => item.id === r.original.id);
                    if (validationItem) {
                        return {
                            ...r.original,
                            isMigrated: validationItem.hasCorrectAssignment,
                            policy: {
                                ...r.original.policy,
                                assignments: validationItem.policy.assignments
                            }
                        };
                    }
                    return r.original;
                });
                setTableData(updatedData);
            } else {
                toast.error('Failed to validate all rows.');
            }
        } catch (error: any) {
            console.error('Validation failed:', error);
            toast.error('Validation failed!');
        } finally {
            setIsBlurring(false);
        }
    };

    return (
        <div className={isBlurring ? 'blur' : ''}>
            <DataTableToolbar
                source={source}
                table={table}
                rawData={rawData}
                fetchData={fetchData}
                backupStatus={backupStatus}
                setBackupStatus={setBackupStatus}
                validateAndUpdateTable={validateAndUpdateTable}
            />
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
                            <TableRow key={row.id} className={isAnimating ? rowClassName : ''}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <DataTableRowActions
                                        row={row}
                                        setTableData={setTableData}
                                        backupStatus={backupStatus}
                                        setBackupStatus={setBackupStatus}
                                        table={table}
                                        validateAndUpdateTable={validateAndUpdateTable}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table}/>
        </div>
    );
}