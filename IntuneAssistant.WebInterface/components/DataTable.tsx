// components/DataTable.tsx
'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
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

export function DataTable({
                              data,
                              columns: initialColumns,
                              className = '',
                              onRowClick,
                              currentPage = 1,
                              totalPages = 1,
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

    const changePage = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        } else {
            setInternalCurrentPage(page);
        }
    };

    const changeItemsPerPage = (n: number) => {
        if (onItemsPerPageChange) {
            onItemsPerPageChange(n);
        } else {
            setInternalItemsPerPage(n);
        }
    };

    const isRowSelected = (row: Record<string, unknown>) => {
        if (!selectedRows || selectedRows.length === 0) return false;
        const rowId = String(row.id);
        return selectedRows.includes(rowId);
    };

    const handleRowSelection = (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>, row: Record<string, unknown>) => {
        e.stopPropagation();
        const rowId = String(row.id);

        if (onSelectionChange) {
            const isCurrentlySelected = isRowSelected(row);
            if (isCurrentlySelected) {
                onSelectionChange(selectedRows.filter(id => id !== rowId));
            } else {
                onSelectionChange([...selectedRows, rowId]);
            }
        }
    };

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
    }, [onSelectionChange, selectedRows, initialColumns]);

    const [columns, setColumns] = useState(columnsWithSelection.map(col => ({
        ...col,
        width: col.width || 150,
        minWidth: col.minWidth || 100,
        searchable: col.searchable !== false && col.key !== '_select'
    })));

    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [resizing, setResizing] = useState<{ columnIndex: number; startX: number; startWidth: number } | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    useEffect(() => {
        setColumns(columnsWithSelection.map(col => ({
            ...col,
            width: col.width || 150,
            minWidth: col.minWidth || 100,
            searchable: col.searchable !== false && col.key !== '_select'
        })));
    }, [columnsWithSelection]);

    // Filter data based on search term
    const filteredData = data.filter(row => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();

        // Search through ALL properties in the row, not just the column keys
        return Object.entries(row).some(([key, value]) => {
            if (value === null || value === undefined) return false;
            const stringValue = String(value).toLowerCase();
            return stringValue.includes(searchLower);
        });
    });

    // Sort filtered data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

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

    // Update pagination to work with filtered/sorted data
    const startIndex = (effectiveCurrentPage - 1) * effectiveItemsPerPage;
    const endIndex = startIndex + effectiveItemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const totalFilteredPages = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));

    const handleSort = (columnKey: string) => {
        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ key: columnKey, direction });
    };

    const getSortIcon = (columnKey: string) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUp className="h-4 w-4 text-foreground" />
            : <ChevronDown className="h-4 w-4 text-foreground" />;
    };


    const clearSearch = () => {
        setSearchTerm('');
        changePage(1);
    };

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

    const handleResizeStart = (e: React.MouseEvent, columnIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        setResizing({
            columnIndex,
            startX: e.clientX,
            startWidth: columns[columnIndex].width || 150
        });
    };

    const handleRowClick = (e: React.MouseEvent, row: Record<string, unknown>, index: number) => {
        if (resizing) return;

        const target = e.target as HTMLElement;
        const isInteractive = target.closest('input[type="checkbox"], input[type="radio"], button, a, [role="button"], [tabindex="0"]');

        if (!isInteractive && onRowClick) {
            onRowClick(row, index, e);
        }
    };


    const getCellValue = (row: Record<string, unknown>, column: Column) => {
        if (column.key === '_select') {
            return null;
        }
        return row[column.key];
    };

    return (
        <div className={`bg-background border rounded-lg overflow-hidden shadow-sm ${className}`}>
            {showSearch && (
                <div className="p-4 bg-muted border-b">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

            <div className="overflow-auto">
                <table ref={tableRef} className="w-full text-sm">
                    <thead className="bg-background sticky top-0 z-10 border-b">

                    <tr className="border-b">
                        {columns.map((column, index) => (
                            <th
                                key={column.key}
                                className="relative text-left p-3 font-medium text-foreground"
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

                                {column.key !== '_select' && (
                                    <div
                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary group"
                                        onMouseDown={(e) => handleResizeStart(e, index)}
                                    >
                                        <div className="h-full w-px bg-border group-hover:bg-primary transition-colors" />
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`
                transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
                ${isRowSelected(row)
                                    ? 'bg-yellow-400 dark:bg-yellow-400/80 text-foreground border-l-4 border-l-yellow-600 dark:border-l-yellow-400 shadow-md ring-1 ring-yellow-500/30'
                                    : 'hover:bg-muted/50'
                                }
                ${rowClassName ? rowClassName(row) : ''}
            `}
                                onClick={(e) => handleRowClick(e, row, startIndex + rowIndex)}
                            >

                            {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="p-3 text-foreground"
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
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="p-8 text-center text-muted-foreground bg-muted/50"
                            >
                                {searchTerm ? 'No results found for your search.' : 'No data available.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {showPagination && sortedData.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t bg-muted">
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
                                className="border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
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

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={effectiveCurrentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => changePage(pageNum)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(Math.min(totalFilteredPages, effectiveCurrentPage + 1))}
                            disabled={effectiveCurrentPage === totalFilteredPages}
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
