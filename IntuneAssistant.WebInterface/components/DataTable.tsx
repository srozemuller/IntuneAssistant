// components/DataTable.tsx
'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {ITEMS_PER_PAGE} from "@/lib/constants";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Search, X, Settings2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    visibleColumns: Column[];
    startIndex: number;
    isSelected: boolean;
    onRowClick?: (e: React.MouseEvent, row: Record<string, unknown>, index: number) => void;
    rowClassName?: (row: Record<string, unknown>) => string;
    getCellValue: (row: Record<string, unknown>, column: Column) => unknown;
}>(({ row, rowIndex, visibleColumns, startIndex, isSelected, onRowClick, rowClassName, getCellValue }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (onRowClick) {
            onRowClick(e, row, startIndex + rowIndex);
        }
    }, [onRowClick, row, startIndex, rowIndex]);

    return (
        <tr
            className={`
                border-b border-gray-100 dark:border-gray-800 last:border-b-0
                ${onRowClick ? 'cursor-pointer' : ''}
                ${isSelected
                    ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-l-primary'
                    : rowIndex % 2 === 0
                        ? 'bg-white dark:bg-gray-900 hover:bg-gray-500/70 dark:hover:bg-gray-800/80'
                        : 'bg-gray-50/30 dark:bg-gray-900/70 hover:bg-gray-50/70 dark:hover:bg-gray-800/40'
                }
                ${rowClassName ? rowClassName(row) : ''}
                transition-colors duration-200 ease-in-out
            `}
            onClick={handleClick}
        >
            {visibleColumns.map((column) => (
                <td
                    key={column.key}
                    className="p-3 text-gray-900 dark:text-gray-100 first:pl-6 last:pr-6"
                    style={{
                        width: `${column.width}px`,
                        minWidth: `${column.minWidth}px`
                    }}
                >
                    {column.render
                        ? column.render(getCellValue(row, column), row)
                        : String(getCellValue(row, column) || '')
                    }
                </td>
            ))}
        </tr>
    );
});

TableRow.displayName = 'TableRow';

function DataTableComponent(props: DataTableProps) {
    const {
        data,
        columns: initialColumns,
        className: _className = '',
        onRowClick,
        currentPage = 1,
        totalPages: _totalPages = 1,
        itemsPerPage = ITEMS_PER_PAGE,
        rowClassName,
        onPageChange,
        onItemsPerPageChange,
        showPagination = false,
        showSearch = true,
        searchPlaceholder = "Search...",
        onSelectionChange,
        selectedRows = [],
    } = props;

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
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
        // Initialize all columns as visible
        const visibility: Record<string, boolean> = {};
        columnsWithSelection.forEach(col => {
            visibility[col.key] = true;
        });
        return visibility;
    });
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [initialWidthsCalculated, setInitialWidthsCalculated] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Debounce search term to improve performance
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Passive listener - browser can optimize
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);


    useEffect(() => {
        setColumns(columnsWithSelection.map(col => ({
            ...col,
            width: col.width || 150,
            minWidth: col.minWidth || 100,
            searchable: col.searchable !== false && col.key !== '_select',
            sortValue: col.sortValue
        })));

        // Update visibility for any new columns
        setColumnVisibility(prev => {
            const newVisibility = { ...prev };
            columnsWithSelection.forEach(col => {
                if (!(col.key in newVisibility)) {
                    newVisibility[col.key] = true;
                }
            });
            return newVisibility;
        });

        // Reset width calculation flag when columns change
        setInitialWidthsCalculated(false);
    }, [columnsWithSelection]);

    // Measure container width and calculate initial column widths to fill 100%
    useEffect(() => {
        if (!tableContainerRef.current || initialWidthsCalculated || columns.length === 0) return;

        const updateColumnWidths = () => {
            const containerEl = tableContainerRef.current;
            if (!containerEl) return;

            const availableWidth = containerEl.clientWidth;
            if (availableWidth === 0) return;

            console.log('📐 Container width:', availableWidth, 'px');

            setContainerWidth(availableWidth);

            // Calculate total width - separate fixed columns from data columns
            // Fixed columns: _select key OR columns where minWidth === width (locked)
            const fixedColumns = columns.filter(col => col.key === '_select' || (col.minWidth && col.width && col.minWidth === col.width));
            const dataColumns = columns.filter(col => col.key !== '_select' && !(col.minWidth && col.width && col.minWidth === col.width));

            const fixedColumnsWidth = fixedColumns.reduce((sum, col) => sum + (col.width || 0), 0);
            const totalDataColumnWidth = dataColumns.reduce((sum, col) => sum + (col.width || 150), 0);
            const totalCurrentWidth = fixedColumnsWidth + totalDataColumnWidth;

            console.log('📊 Total column width:', totalCurrentWidth, 'px', 'Available:', availableWidth, 'px');

            // If total is less than available width, distribute the extra space proportionally
            // BUT only to data columns, not the _select column
            if (totalCurrentWidth < availableWidth) {
                const extraSpace = availableWidth - totalCurrentWidth;

                console.log('✨ Distributing extra space:', extraSpace, 'px proportionally across data columns - excluding fixed columns');

                setColumns(prev => prev.map(col => {
                    // Keep fixed columns at their original width
                    if (col.key === '_select' || (col.minWidth && col.width && col.minWidth === col.width)) {
                        return col;
                    }
                    // Distribute extra space proportionally based on each column's current width
                    const colWidth = col.width || 150;
                    const proportion = totalDataColumnWidth > 0 ? colWidth / totalDataColumnWidth : 1 / dataColumns.length;
                    return {
                        ...col,
                        width: Math.max(colWidth + extraSpace * proportion, col.minWidth || 100)
                    };
                }));
            }

            setInitialWidthsCalculated(true);
        };

        // Use ResizeObserver for reliable measurement
        const resizeObserver = new ResizeObserver(() => {
            if (!initialWidthsCalculated) {
                updateColumnWidths();
            }
        });

        if (tableContainerRef.current) {
            resizeObserver.observe(tableContainerRef.current);
        }

        // Also try immediate calculation
        updateColumnWidths();

        return () => {
            resizeObserver.disconnect();
        };
    }, [columns.length, initialWidthsCalculated]);

    // Memoize visible columns
    const visibleColumns = useMemo(() => {
        return columns.filter(col => columnVisibility[col.key] !== false);
    }, [columns, columnVisibility]);

    // Calculate total table width based on visible column widths
    const totalTableWidth = useMemo(() => {
        const total = visibleColumns.reduce((sum, col) => sum + (col.width || 150), 0);
        console.log('📏 Total table width calculated:', total, 'px');
        console.log('📊 Visible columns:', visibleColumns.map(c => ({ key: c.key, width: c.width })));
        return total;
    }, [visibleColumns]);

    // Toggle column visibility
    const toggleColumnVisibility = useCallback((columnKey: string) => {
        setColumnVisibility(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    }, []);

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
        if (!resizing) return;

        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
                const diff = e.clientX - resizing.startX;
                const newWidth = Math.max(resizing.startWidth + diff, columns[resizing.columnIndex].minWidth || 100);

                console.log('🔄 Resizing column:', resizing.columnIndex, 'New width:', newWidth, 'Diff:', diff);

                setColumns(prev => prev.map((col, index) =>
                    index === resizing.columnIndex ? { ...col, width: newWidth } : col
                ));
            });
        };

        const handleMouseUp = () => {
            if (rafId) cancelAnimationFrame(rafId);
            setResizing(null);
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
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

    // Memoize hasData check
    const hasData = useMemo(() => paginatedData.length > 0, [paginatedData.length]);

    return (
        <div>
            {/* Search Section */}
            {showSearch && (
                <div className="p-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Column Visibility Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Settings2 className="h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {columns
                                .filter(col => col.key !== '_select') // Don't allow hiding selection column
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.key}
                                        checked={columnVisibility[column.key] !== false}
                                        onCheckedChange={() => toggleColumnVisibility(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {columnVisibility[column.key] !== false ? (
                                                <Eye className="h-4 w-4" />
                                            ) : (
                                                <EyeOff className="h-4 w-4" />
                                            )}
                                            {column.label}
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {searchTerm && (
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {sortedData.length} of {data.length} results
                        </div>
                    )}
                </div>
            )}

            {/* Table Section */}
            <div
                ref={tableContainerRef}
                className="overflow-x-auto overflow-y-auto bg-white dark:bg-gray-900"
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    willChange: 'scroll-position',
                    transform: 'translateZ(0)',
                    WebkitOverflowScrolling: 'touch',
                    // Custom scrollbar styling
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgb(203 213 225) transparent',
                }}
            >
            <table
                ref={tableRef}
                className="text-sm"
                style={{
                    width: `${totalTableWidth}px`,
                    minWidth: '100%',
                    tableLayout: 'fixed'
                }}
            >
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 border-b-2 border-gray-200 dark:border-gray-700">
                        <tr>
                            {visibleColumns.map((column, visibleIndex) => {
                                // Find the original index in the full columns array for resizing
                                const originalIndex = columns.findIndex(col => col.key === column.key);

                                return (
                                    <th
                                        key={column.key}
                                        className="relative text-left p-3 font-medium text-foreground first:pl-6 last:pr-6"
                                        style={{
                                            width: `${column.width}px`,
                                            minWidth: `${column.minWidth}px`
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={`flex items-center gap-2 flex-1 ${
                                                    column.sortable !== false && column.key !== '_select'
                                                        ? 'cursor-pointer select-none'
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

                                        {/* Resize handle - show for all columns except selection column */}
                                        {column.key !== '_select' && (
                                            <div
                                                className="absolute right-0 top-0 h-full w-3 cursor-col-resize hover:bg-primary/10 active:bg-primary/20 group z-20"
                                                onMouseDown={(e) => handleResizeStart(e, originalIndex)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="absolute right-0 top-0 h-full w-px bg-transparent group-hover:bg-primary/50 group-active:bg-primary transition-colors" />
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="bg-transparent">
                        {hasData ? (
                            paginatedData.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id ? String(row.id) : rowIndex}
                                    row={row}
                                    rowIndex={rowIndex}
                                    visibleColumns={visibleColumns}
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
                                    colSpan={visibleColumns.length}
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
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {Math.min(startIndex + 1, sortedData.length)} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
                            {searchTerm && ` (filtered from ${data.length} total)`}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Items per page:</span>
                            <select
                                value={effectiveItemsPerPage}
                                onChange={(e) => {
                                    const newItemsPerPage = Number(e.target.value);
                                    changeItemsPerPage(newItemsPerPage);
                                    changePage(1);
                                }}
                                className="rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
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
                            {paginationPageNumbers.map((pageNum) => (
                                <Button
                                    key={pageNum}
                                    variant={effectiveCurrentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => changePage(pageNum)}
                                    className="w-8 h-8 p-0"
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

export const DataTable = React.memo(DataTableComponent);
