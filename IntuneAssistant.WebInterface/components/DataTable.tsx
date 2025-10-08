// components/DataTable.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import {ITEMS_PER_PAGE} from "@/lib/constants";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column {
    key: string;
    label: string;
    width?: number;
    minWidth?: number;
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
    data: Record<string, unknown>[];
    columns: Column[];
    className?: string;
    onRowClick?: (row: Record<string, unknown>) => void;
    currentPage?: number;
    totalPages?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    showPagination?: boolean;
}

export function DataTable({     data,
                              columns: initialColumns,
                              className,
                              onRowClick,
                              currentPage = 1,
                              totalPages = 1,
                              itemsPerPage = ITEMS_PER_PAGE,
                              onPageChange,
                              onItemsPerPageChange,
                              showPagination = false}: DataTableProps) {
    const [columns, setColumns] = useState(initialColumns.map(col => ({
        ...col,
        width: col.width || 150,
        minWidth: col.minWidth || 100
    })));
    // Add pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    const [resizing, setResizing] = useState<{ columnIndex: number; startX: number; startWidth: number } | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

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
        setResizing({
            columnIndex,
            startX: e.clientX,
            startWidth: columns[columnIndex].width || 150
        });
    };

    const handleRowClick = (e: React.MouseEvent, row: Record<string, unknown>) => {
        if (resizing) return;

        const target = e.target as HTMLElement;
        // Check for interactive elements including checkboxes, buttons, and links
        const isInteractive = target.closest('input[type="checkbox"], input[type="radio"], button, a, [role="button"], [tabindex="0"]');

        if (!isInteractive && onRowClick) {
            onRowClick(row);
        }
    };

    const getCellValue = (row: Record<string, unknown>, column: Column) => {
        // For the selection column, we don't need to get a value from the row data
        if (column.key === '_select') {
            return null;
        }
        return row[column.key];
    };

    return (
        <div className="overflow-x-auto">
            <table ref={tableRef} className={`w-full table-fixed ${className || ''}`}>
                <thead>
                <tr className="border-b bg-gray-50">
                    {columns.map((column, index) => (
                        <th
                            key={column.key}
                            className="relative text-left p-3 font-medium text-gray-900"
                            style={{ width: `${column.width}px` }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="truncate pr-2">{column.label}</span>
                            </div>

                            {/* Only show resize handle for non-selection columns */}
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
                {paginatedData.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        className={`border-b hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
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
                ))}
                </tbody>

            </table>
            {/* Add pagination controls */}
            {showPagination && totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
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
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
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
                            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
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
