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
                ? allRows.filter((r) => r.original.policy.id === policyId)
                : allRows;

            const validationRequestBody = rowsToValidate.map((r) => ({
                Id: r.original.id,
                ResourceType: r.original.policy.policyType,
                ResourceId: r.original.policy.id,
                AssignmentId: r.original.assignmentId,
                AssignmentType: r.original.assignmentType,
                AssignmentAction: r.original.assignmentAction,
                FilterId: r.original.filterToMigrate?.id || null,
                FilterType: r.original.filterType || 'none'
            }));

            const validationResponse = await authDataMiddleware(
                `${ASSIGNMENTS_VALIDATION_ENDPOINT}`,
                'POST',
                JSON.stringify(validationRequestBody)
            );

            // Safely handle the response data
            let validationData: any[] = [];

            if (validationResponse?.data) {
                // Parse string data if needed
                if (typeof validationResponse.data === 'string') {
                    try {
                        validationData = JSON.parse(validationResponse.data);
                    } catch (e) {
                        console.error('Failed to parse validation data:', e);
                        toast.error('Failed to parse validation data');
                        return;
                    }
                }
                // Handle nested data structure
                else if (validationResponse.data.data) {
                    if (typeof validationResponse.data.data === 'string') {
                        try {
                            validationData = JSON.parse(validationResponse.data.data);
                        } catch (e) {
                            console.error('Failed to parse nested validation data:', e);
                            toast.error('Failed to parse validation data');
                            return;
                        }
                    } else {
                        validationData = validationResponse.data.data;
                    }
                }
                // Direct object assignment
                else {
                    validationData = validationResponse.data;
                }
            }

            // Ensure validationData is an array
            if (!Array.isArray(validationData)) {
                console.error('Validation data is not an array:', validationData);
                toast.error('Invalid validation data format received');
                return;
            }

            // Update the data with validation results
            const updatedData = allRows.map((r) => {
                // Find matching validation item
                const validationItem = validationData.find((item) => item && item.id === r.original.id);

                if (validationItem) {
                    return {
                        ...r.original,
                        isMigrated: validationItem.hasCorrectAssignment,
                        policy: {
                            ...r.original.policy,
                            assignments: validationItem.policy?.assignments || r.original.policy.assignments
                        }
                    };
                }
                return r.original;
            });

            setTableData(updatedData);
        } catch (error) {
            console.error('Validation failed:', error);
            toast.error(`Validation failed: ${(error as Error).message}`);
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