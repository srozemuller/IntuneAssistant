// components/DataTable.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
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
    onRowClick?: (row: Record<string, unknown>) => void;
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
                              className,
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
    const [columns, setColumns] = useState(initialColumns.map(col => ({
        ...col,
        width: col.width || 150,
        minWidth: col.minWidth || 100,
        searchable: col.searchable !== false && col.key !== '_select' // Default to searchable unless explicitly disabled
    })));

    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [resizing, setResizing] = useState<{ columnIndex: number; startX: number; startWidth: number } | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    const isRowSelected = (row: Record<string, unknown>) => {
        if (!selectedRows || selectedRows.length === 0) return false;
        const rowId = String(row.id);
        return selectedRows.includes(rowId);
    };

    const handleRowSelection = (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>, row: Record<string, unknown>) => {
        e.stopPropagation(); // Prevent row click from firing

        // Get the ID or unique identifier from the row
        const rowId = String(row.id);

        // Toggle selection
        if (onSelectionChange) {
            const isCurrentlySelected = isRowSelected(row);
            if (isCurrentlySelected) {
                onSelectionChange(selectedRows.filter(id => id !== rowId));
            } else {
                onSelectionChange([...selectedRows, rowId]);
            }
        }
    };

    // Filter data based on search term
    const filteredData = data.filter(row => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();

        return columns.some(column => {
            if (!column.searchable || column.key === '_select') return false;

            const value = row[column.key];
            if (value === null || value === undefined) return false;

            return String(value).toLowerCase().includes(searchLower);
        });
    });

    // Sort filtered data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Update pagination to work with filtered/sorted data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const totalFilteredPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage)); // Ensure at least 1 page

    const handleSort = (columnKey: string) => {
        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ key: columnKey, direction });
    };

    const getSortIcon = (columnKey: string) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
        }

        return sortConfig.direction === 'asc'
            ? <ChevronUp className="h-4 w-4 text-blue-600" />
            : <ChevronDown className="h-4 w-4 text-blue-600" />;
    };

    const clearSearch = () => {
        setSearchTerm('');
        // Reset to first page when clearing search
        if (onPageChange) {
            onPageChange(1);
        }
    };

    // Reset to first page when search changes
    useEffect(() => {
        if (onPageChange && currentPage > 1) {
            onPageChange(1);
        }
    }, [searchTerm]);

    useEffect(() => {
        // Reset to first page when items per page changes and current page would be invalid
        const maxPage = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
        if (onPageChange && currentPage > maxPage) {
            onPageChange(1);
        }
    }, [itemsPerPage, sortedData.length, currentPage, onPageChange]);

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

    const handleRowClick = (e: React.MouseEvent, row: Record<string, unknown>) => {
        if (resizing) return;

        const target = e.target as HTMLElement;
        const isInteractive = target.closest('input[type="checkbox"], input[type="radio"], button, a, [role="button"], [tabindex="0"]');

        if (!isInteractive && onRowClick) {
            onRowClick(row);
        }
    };

    const getCellValue = (row: Record<string, unknown>, column: Column) => {
        if (column.key === '_select') {
            return null; // The render function will handle this
        }
        return row[column.key];
    };

    // Before rendering the DataTable, add a selection column if onSelectionChange is provided
    useEffect(() => {
        if (onSelectionChange) {
            const hasSelectColumn = columns.some(col => col.key === '_select');

            if (!hasSelectColumn) {
                // Only add the column if it doesn't exist
                setColumns(prevColumns => [
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
                                className="rounded border-gray-300"
                            />
                        )
                    },
                    ...prevColumns
                ]);
            } else {
                // Update existing select column to refresh the render function
                setColumns(prevColumns =>
                    prevColumns.map(col =>
                        col.key === '_select'
                            ? {
                                ...col,
                                render: (_, row) => (
                                    <input
                                        type="checkbox"
                                        checked={isRowSelected(row)}
                                        onChange={(e) => handleRowSelection(e, row)}
                                        className="rounded border-gray-300"
                                    />
                                )
                            }
                            : col
                    )
                );
            }
        }
    }, [onSelectionChange, selectedRows]);


    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Search Bar */}
            {showSearch && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-600">
                            {sortedData.length} of {data.length} results
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-auto max-h-[60vh]">
                <table ref={tableRef} className={`w-full text-sm`}>
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr className="border-b bg-gray-50">
                        {columns.map((column, index) => (
                            <th
                                key={column.key}
                                className="relative text-left p-3 font-medium text-gray-900"
                                style={{ width: `${column.width}px` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex items-center gap-2 flex-1 ${
                                            column.sortable !== false && column.key !== '_select'
                                                ? 'cursor-pointer hover:text-blue-600 transition-colors'
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
                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 group"
                                        onMouseDown={(e) => handleResizeStart(e, index)}
                                    >
                                        <div className="h-full w-px bg-gray-300 group-hover:bg-blue-500 transition-colors" />
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`border-b hover:bg-gray-50 transition-colors ${
                                    onRowClick ? 'cursor-pointer' : ''
                                } ${isRowSelected(row) ? 'bg-blue-50' : ''} ${
                                    rowClassName ? rowClassName(row) : ''
                                }`}
                                onClick={(e) => handleRowClick(e, row)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="p-3 text-sm"
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
                            <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                {searchTerm ? 'No results found for your search.' : 'No data available.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            {showPagination && sortedData.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Showing {Math.min(startIndex + 1, sortedData.length)} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
                            {searchTerm && ` (filtered from ${data.length} total)`}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    const newItemsPerPage = Number(e.target.value);
                                    onItemsPerPageChange?.(newItemsPerPage);
                                    // Reset to page 1 when changing items per page
                                    onPageChange?.(1);
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                                let pageNum;
                                if (totalFilteredPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalFilteredPages - 2) {
                                    pageNum = totalFilteredPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange?.(pageNum)}
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
                            onClick={() => onPageChange?.(Math.min(totalFilteredPages, currentPage + 1))}
                            disabled={currentPage === totalFilteredPages}
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
