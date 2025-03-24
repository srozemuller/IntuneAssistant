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

interface DataTableProps<TData extends AssignmentRow, TValue> {
    source: string;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    rawData: string;
    rowClassName?: string;
    fetchData: () => Promise<void>;
    setTableData: React.Dispatch<React.SetStateAction<TData[]>>;
    backupStatus: Record<string, boolean>
    setBackupStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

interface AssignmentRow {
    id: string;
    policy: {
        id: string;
        policyType: string;
        assignments: any[];
    };
    assignmentId: string;
    assignmentType: string;
    assignmentAction: string;
    filterType?: string;
    filterToMigrate?: {
        id: string | null;
    } | null;
    isMigrated?: boolean;
}


export function DataTable<TData extends AssignmentRow, TValue>({
                                                                   columns,
                                                                   data,
                                                                   rawData,
                                                                   fetchData,
                                                                   source,
                                                                   rowClassName,
                                                                   setTableData,
                                                                   backupStatus,
                                                                   setBackupStatus,
                                                               }: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10); // Default page size

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

    // In data-table.tsx
    const validateAndUpdateTable = async (policyId?: string): Promise<boolean> => {
        try {
            // Find rows to validate based on policy ID
            const rowsToValidate = policyId
                ? data.filter(row => row.policy?.id === policyId)
                : data;

            if (rowsToValidate.length === 0) {
                return true; // Nothing to validate
            }

            const validationRequestBody = rowsToValidate.map(row => ({
                Id: row.id,
                ResourceType: row.policy?.policyType,
                ResourceId: row.policy?.id,
                AssignmentId: row.assignmentId,
                AssignmentType: row.assignmentType,
                AssignmentAction: row.assignmentAction,
                FilterId: row.filterToMigrate?.id || null,
                FilterType: row.filterType || 'none'
            }));

            const validationResponse = await authDataMiddleware(
                `${ASSIGNMENTS_VALIDATION_ENDPOINT}`,
                'POST',
                JSON.stringify(validationRequestBody)
            );

            // Parse validation data
            let validationData: any[] = [];
            if (validationResponse?.data) {
                if (typeof validationResponse.data === 'string') {
                    validationData = JSON.parse(validationResponse.data);
                } else if (validationResponse.data.data) {
                    validationData = Array.isArray(validationResponse.data.data)
                        ? validationResponse.data.data
                        : JSON.parse(validationResponse.data.data);
                } else {
                    validationData = validationResponse.data;
                }
            }

            // Update data in-place without refreshing the entire table
            setTableData(prevData => {
                const newData = [...prevData];

                validationData.forEach(validationItem => {
                    if (!validationItem || !validationItem.id) return;

                    const rowIndex = newData.findIndex(row => row.id === validationItem.id);
                    if (rowIndex >= 0) {
                        newData[rowIndex] = {
                            ...newData[rowIndex],
                            isMigrated: validationItem.hasCorrectAssignment,
                            policy: {
                                ...newData[rowIndex].policy,
                                assignments: validationItem.policy?.assignments || newData[rowIndex].policy?.assignments
                            }
                        };
                    }
                });

                return newData;
            });

            return true;
        } catch (error) {
            console.error('Validation failed:', error);
            toast.error(`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return false;
        }
    };

    return (
        <div>
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
                                        table={table}
                                        backupStatus={backupStatus}
                                        setBackupStatus={setBackupStatus}
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