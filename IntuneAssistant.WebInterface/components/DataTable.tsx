// components/DataTable.tsx
'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {ITEMS_PER_PAGE} from "@/lib/constants";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column {
    key: string;
    label: string;
    width?: number;
    minWidth?: number;
    sortable?: boolean;
    searchable?: boolean;
    sortValue?: (row: Record<string, unknown>) => number | string;
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface DataTableProps {
    data: Record<string, unknown>[];
    columns: Column[];
    className?: string;
    onRowClick?: (row: Record<string, unknown>, index: number, event?: React.MouseEvent) => void;
    rowClassName?: (row: Record<string, unknown>) => string;
    currentPage?: number;
    totalPages?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showPagination?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    selectedRows?: string[];
    onSelectionChange?: (rowIds: string[]) => void;
}

// Memoized TableRow component to prevent unnecessary re-renders
const TableRow = React.memo<{
    row: Record<string, unknown>;
    rowIndex: number;
    columns: Column[];
    startIndex: number;
    isSelected: boolean;
    onRowClick?: (e: React.MouseEvent, row: Record<string, unknown>, index: number) => void;
    rowClassName?: (row: Record<string, unknown>) => string;
    getCellValue: (row: Record<string, unknown>, column: Column) => unknown;
}>(({ row, rowIndex, columns, startIndex, isSelected, onRowClick, rowClassName, getCellValue }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onRowClick) {
            onRowClick(e, row, startIndex + rowIndex);
        }
    }, [onRowClick, row, startIndex, rowIndex]);

    return (
        <tr
            className={`
                border-b border-border/10 last:border-b-0
                transition-all duration-200
                ${onRowClick ? 'cursor-pointer' : ''}
                ${isSelected
                    ? 'bg-primary/15 dark:bg-primary/20 text-foreground border-l-4 border-l-primary shadow-lg'
                    : 'hover:bg-white/20 dark:hover:bg-white/5'
                }
                ${rowClassName ? rowClassName(row) : ''}
            `}
            onClick={handleClick}
        >
            {columns.map((column) => (
                <td
                    key={column.key}
                    className="p-3 text-foreground first:pl-6 last:pr-6"
                    style={{ width: `${column.width}px` }}
                >
                    <div className="overflow-hidden">
                        {column.render
                            ? column.render(getCellValue(row, column), row)
                            : String(getCellValue(row, column) || '')
                        }
                    </div>
                </td>
            ))}
        </tr>
    );
});

TableRow.displayName = 'TableRow';

export function DataTable({
                              data,
                              columns: initialColumns,
                              className: _className = '',
                              onRowClick,
                              currentPage = 1,
                              totalPages: _totalPages = 1,
                              itemsPerPage = ITEMS_PER_PAGE,
                              onPageChange,
                              rowClassName,
                              onItemsPerPageChange,
                              showPagination = false,
                              showSearch = true,
                              searchPlaceholder = "Search...",
                              onSelectionChange,
                              selectedRows = [],
                          }: DataTableProps) {

    // Local pagination state to support uncontrolled usage
    const [internalCurrentPage, setInternalCurrentPage] = useState<number>(currentPage);
    const [internalItemsPerPage, setInternalItemsPerPage] = useState<number>(itemsPerPage);

    // Sync internal state when parent updates props
    useEffect(() => setInternalCurrentPage(currentPage), [currentPage]);
    useEffect(() => setInternalItemsPerPage(itemsPerPage), [itemsPerPage]);

    // Effective values: prefer controller (props) when callbacks are provided
    const effectiveCurrentPage = onPageChange ? currentPage : internalCurrentPage;
    const effectiveItemsPerPage = onItemsPerPageChange ? itemsPerPage : internalItemsPerPage;

    // Memoize change handlers (defined early to use in clearSearch)
    const changePage = useCallback((page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            setInternalCurrentPage(page);
        }
    }, [onPageChange]);

    const changeItemsPerPage = useCallback((n: number) => {
        if (onItemsPerPageChange) {
            onItemsPerPageChange(n);
        } else {
            setInternalItemsPerPage(n);
        }
    }, [onItemsPerPageChange]);

    // Memoize selected rows as a Set for O(1) lookup
    const selectedRowsSet = useMemo(() => new Set(selectedRows), [selectedRows]);

    const isRowSelected = useCallback((row: Record<string, unknown>) => {
        if (selectedRowsSet.size === 0) return false;
        const rowId = String(row.id);
        return selectedRowsSet.has(rowId);
    }, [selectedRowsSet]);

    const handleRowSelection = useCallback((e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>, row: Record<string, unknown>) => {
        e.stopPropagation();
        const rowId = String(row.id);

        if (onSelectionChange) {
            const isCurrentlySelected = selectedRowsSet.has(rowId);
            if (isCurrentlySelected) {
                onSelectionChange(selectedRows.filter(id => id !== rowId));
            } else {
                onSelectionChange([...selectedRows, rowId]);
            }
        }
    }, [onSelectionChange, selectedRowsSet, selectedRows]);

    const columnsWithSelection = useMemo(() => {
        if (onSelectionChange && !initialColumns.some(col => col.key === '_select')) {
            return [
                {
                    key: '_select',
                    label: '',
                    width: 50,
                    minWidth: 40,
                    sortable: false,
                    searchable: false,
                    sortValue: undefined,
                    render: (_, row) => (
                        <input
                            type="checkbox"
                            checked={isRowSelected(row)}
                            onChange={(e) => handleRowSelection(e, row)}
                            className="rounded border-input text-primary focus:ring-ring"
                        />
                    )

                },
                ...initialColumns
            ];
        }
        return initialColumns;
    }, [onSelectionChange, initialColumns, isRowSelected, handleRowSelection]);

    const [columns, setColumns] = useState(columnsWithSelection.map(col => ({
        ...col,
        width: col.width || 150,
        minWidth: col.minWidth || 100,
        searchable: col.searchable !== false && col.key !== '_select',
        sortValue: col.sortValue
    })));

    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [resizing, setResizing] = useState<{ columnIndex: number; startX: number; startWidth: number } | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    // Debounce search term to improve performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setColumns(columnsWithSelection.map(col => ({
            ...col,
            width: col.width || 150,
            minWidth: col.minWidth || 100,
            searchable: col.searchable !== false && col.key !== '_select',
            sortValue: col.sortValue
        })));
    }, [columnsWithSelection]);

    // Memoize filtered data to prevent unnecessary recalculations
    const filteredData = useMemo(() => {
        if (!debouncedSearchTerm.trim()) return data;

        const searchLower = debouncedSearchTerm.toLowerCase();

        return data.filter(row => {
            // Search through ALL properties in the row, not just the column keys
            return Object.entries(row).some(([_key, value]) => {
                if (value === null || value === undefined) return false;
                const stringValue = String(value).toLowerCase();
                return stringValue.includes(searchLower);
            });
        });
    }, [data, debouncedSearchTerm]);

    // Memoize sorted data to prevent unnecessary recalculations
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;

        // Find the column configuration to check for custom sortValue
        const column = columns.find(col => col.key === sortConfig.key);

        return [...filteredData].sort((a, b) => {
            // Use sortValue function if provided, otherwise fall back to direct value
            const aValue = column?.sortValue ? column.sortValue(a) : a[sortConfig.key];
            const bValue = column?.sortValue ? column.sortValue(b) : b[sortConfig.key];

            if (aValue === undefined && bValue === undefined) {
                return 0;
            }

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            const aDate = new Date(aValue as string);
            const bDate = new Date(bValue as string);
            if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                return sortConfig.direction === 'asc'
                    ? aDate.getTime() - bDate.getTime()
                    : bDate.getTime() - aDate.getTime();
            }

            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();

            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig, columns]);

    // Memoize pagination to avoid recalculation on every render
    const paginationData = useMemo(() => {
        const startIndex = (effectiveCurrentPage - 1) * effectiveItemsPerPage;
        const endIndex = startIndex + effectiveItemsPerPage;
        const paginatedData = sortedData.slice(startIndex, endIndex);
        const totalFilteredPages = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));

        return { paginatedData, startIndex, endIndex, totalFilteredPages };
    }, [sortedData, effectiveCurrentPage, effectiveItemsPerPage]);
    const { paginatedData, startIndex, endIndex, totalFilteredPages } = paginationData;

    const handleSort = useCallback((columnKey: string) => {
        setSortConfig(prev => {
            if (prev && prev.key === columnKey && prev.direction === 'asc') {
                return { key: columnKey, direction: 'desc' };
            }
            return { key: columnKey, direction: 'asc' };
        });
    }, []);

    const getSortIcon = useCallback((columnKey: string) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUp className="h-4 w-4 text-foreground" />
            : <ChevronDown className="h-4 w-4 text-foreground" />;
    }, [sortConfig]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        changePage(1);
    }, [changePage]);

    useEffect(() => {
        if (effectiveCurrentPage > 1) {
            changePage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));
        if (effectiveCurrentPage > maxPage) {
            changePage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveItemsPerPage, sortedData.length, effectiveCurrentPage]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizing) return;

            const diff = e.clientX - resizing.startX;
            const newWidth = Math.max(resizing.startWidth + diff, columns[resizing.columnIndex].minWidth || 100);

            setColumns(prev => prev.map((col, index) =>
                index === resizing.columnIndex ? { ...col, width: newWidth } : col
            ));
        };

        const handleMouseUp = () => {
            setResizing(null);
        };

        if (resizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing, columns]);

    const handleResizeStart = useCallback((e: React.MouseEvent, columnIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing({
            columnIndex,
            startX: e.clientX,
            startWidth: columns[columnIndex].width || 150
        });
    }, [columns]);

    const handleRowClick = useCallback((e: React.MouseEvent, row: Record<string, unknown>, index: number) => {
        if (resizing) return;

        const target = e.target as HTMLElement;
        const isInteractive = target.closest('input[type="checkbox"], input[type="radio"], button, a, [role="button"], [tabindex="0"]');

        if (!isInteractive && onRowClick) {
            onRowClick(row, index, e);
        }
    }, [resizing, onRowClick]);


    const getCellValue = useCallback((row: Record<string, unknown>, column: Column) => {
        if (column.key === '_select') {
            return null;
        }
        return row[column.key];
    }, []);

    // Memoize pagination page numbers for better performance
    const paginationPageNumbers = useMemo(() => {
        const pageCount = Math.min(5, totalFilteredPages);
        const pages: number[] = [];

        for (let i = 0; i < pageCount; i++) {
            let pageNum;
            if (totalFilteredPages <= 5) {
                pageNum = i + 1;
            } else if (effectiveCurrentPage <= 3) {
                pageNum = i + 1;
            } else if (effectiveCurrentPage >= totalFilteredPages - 2) {
                pageNum = totalFilteredPages - 4 + i;
            } else {
                pageNum = effectiveCurrentPage - 2 + i;
            }
            pages.push(pageNum);
        }

        return pages;
    }, [totalFilteredPages, effectiveCurrentPage]);

    return (
        <div>
            {/* Search Section */}
            {showSearch && (
                <div className="p-4 ">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border-0 shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            {sortedData.length} of {data.length} results
                        </div>
                    )}
                </div>
            )}

            {/* Table Section */}
            <div className="overflow-auto custom-scrollbar bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
            <table ref={tableRef} className="w-full text-sm">
                    <thead className="bg-gradient-to-b from-white/30 to-white/20 dark:from-white/10 dark:to-white/5 backdrop-blur-md sticky top-0 z-10">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={column.key}
                                    className="relative text-left p-3 font-medium text-foreground first:pl-6 last:pr-6"
                                    style={{ width: `${column.width}px` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            className={`flex items-center gap-2 flex-1 ${
                                                column.sortable !== false && column.key !== '_select'
                                                    ? 'cursor-pointer hover:text-primary transition-colors'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                if (column.sortable !== false && column.key !== '_select') {
                                                    handleSort(column.key);
                                                }
                                            }}
                                        >
                                            <span className="truncate pr-2">{column.label}</span>
                                            {column.sortable !== false && column.key !== '_select' && (
                                                getSortIcon(column.key)
                                            )}
                                        </div>
                                    </div>

                                    {column.key !== '_select' && index < columns.length - 1 && (
                                        <div
                                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 group"
                                            onMouseDown={(e) => handleResizeStart(e, index)}
                                        >
                                            <div className="h-full w-px bg-border/20 group-hover:bg-primary transition-colors" />
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-transparent">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id ? String(row.id) : rowIndex}
                                    row={row}
                                    rowIndex={rowIndex}
                                    columns={columns}
                                    startIndex={startIndex}
                                    isSelected={isRowSelected(row)}
                                    onRowClick={onRowClick ? handleRowClick : undefined}
                                    rowClassName={rowClassName}
                                    getCellValue={getCellValue}
                                />
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-8 text-center text-muted-foreground"
                                >
                                    {searchTerm ? 'No results found for your search.' : 'No data available.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            {showPagination && sortedData.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-t from-white/20 to-transparent dark:from-white/5">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {Math.min(startIndex + 1, sortedData.length)} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
                            {searchTerm && ` (filtered from ${data.length} total)`}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Items per page:</span>
                            <select
                                value={effectiveItemsPerPage}
                                onChange={(e) => {
                                    const newItemsPerPage = Number(e.target.value);
                                    changeItemsPerPage(newItemsPerPage);
                                    changePage(1);
                                }}
                                className="rounded-lg px-3 py-1.5 text-sm bg-white/60 dark:bg-white/10 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border-0 shadow-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(Math.max(1, effectiveCurrentPage - 1))}
                            disabled={effectiveCurrentPage === 1}
                            className="backdrop-blur-sm border-border/20 bg-white/40 dark:bg-white/5"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {paginationPageNumbers.map((pageNum) => (
                                <Button
                                    key={pageNum}
                                    variant={effectiveCurrentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => changePage(pageNum)}
                                    className={`w-8 h-8 p-0 backdrop-blur-sm ${effectiveCurrentPage !== pageNum ? 'border-border/20 bg-white/40 dark:bg-white/5' : ''}`}
                                >
                                    {pageNum}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(Math.min(totalFilteredPages, effectiveCurrentPage + 1))}
                            disabled={effectiveCurrentPage === totalFilteredPages}
                            className="backdrop-blur-sm border-border/20 bg-white/40 dark:bg-white/5"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
