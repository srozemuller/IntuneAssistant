// components/DataTable.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Column {
    key: string;
    label: string | React.ReactElement;
    width?: number;
    minWidth?: number;
    render?: (value: unknown, row: Record<string, unknown>) => React.ReactElement;
}

interface DataTableProps {
    data: any[];
    columns: any[];
    className?: string;
    onRowClick?: (row: any) => void;
}

export function DataTable({
                              data,
                              columns: initialColumns,
                              className,
                              onRowClick
                          }: DataTableProps) {
    const [columns, setColumns] = useState(initialColumns.map(col => ({
        ...col,
        width: col.width || 150,
        minWidth: col.minWidth || 100
    })));
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
                                <span className="truncate pr-2">
                                    {React.isValidElement(column.label) ? column.label : column.label}
                                </span>
                            </div>

                            {/* Resize handle */}
                            <div
                                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 group"
                                onMouseDown={(e) => handleResizeStart(e, index)}
                            >
                                <div className="h-full w-px bg-gray-300 group-hover:bg-blue-500 transition-colors" />
                            </div>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, i) => (
                    <tr
                        key={i}
                        onClick={(e) => {
                            // Don't select row when clicking on checkboxes
                            if (!(e.target as HTMLElement).closest('.checkbox-cell')) {
                                onRowClick?.(row);
                            }
                        }}
                    >
                        {columns.map((column, j) => (
                            <td key={j}>
                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
