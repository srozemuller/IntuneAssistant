// components/ExportButton.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, ChevronDown, FileText, FileSpreadsheet, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
    key: string;
    label: string;
    width?: number;
    getValue?: (row: Record<string, unknown>) => string;
}

export interface ExportData {
    data: Record<string, unknown>[];
    columns: ExportColumn[];
    filename: string;
    title: string;
    description?: string;
    stats?: Array<{ label: string; value: string | number }>;
}

interface ExportButtonProps {
    exportData: ExportData;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export function ExportButton({ exportData, variant = 'outline', size = 'default', className }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const exportToCSV = async () => {
        setIsExporting(true);
        try {
            const headers = exportData.columns.map(col => col.label);
            const csvData = exportData.data.map(row =>
                exportData.columns.map(col => {
                    const value = col.getValue ? col.getValue(row) : row[col.key];
                    return String(value || '');
                })
            );

            const csvContent = [headers, ...csvData]
                .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${exportData.filename}-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(20);
            doc.text(exportData.title, 14, 22);

            // Add export date and stats
            doc.setFontSize(10);
            doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 32);
            doc.text(`Total records: ${exportData.data.length}`, 14, 38);

            if (exportData.description) {
                doc.text(exportData.description, 14, 44);
            }

            // Add stats if provided
            let startY = exportData.description ? 50 : 44;
            if (exportData.stats && exportData.stats.length > 0) {
                doc.setFontSize(12);
                doc.text('Summary:', 14, startY);
                startY += 6;

                exportData.stats.forEach((stat, index) => {
                    doc.setFontSize(10);
                    doc.text(`${stat.label}: ${stat.value}`, 14, startY + (index * 6));
                });
                startY += (exportData.stats.length * 6) + 6;
            }

            // Prepare table data
            const tableHeaders = exportData.columns.map(col => col.label);
            const tableData = exportData.data.map(row =>
                exportData.columns.map(col => {
                    const value = col.getValue ? col.getValue(row) : row[col.key];
                    return String(value || '');
                })
            );

            // Calculate column widths
            const totalWidth = 180; // Available width
            const columnWidths = exportData.columns.map(col => {
                if (col.width) return col.width;
                return totalWidth / exportData.columns.length;
            });

            // Add table
            autoTable(doc, {
                head: [tableHeaders],
                body: tableData,
                startY: startY,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: Object.fromEntries(
                    columnWidths.map((width, index) => [index, { cellWidth: width }])
                ),
                margin: { top: startY, right: 14, bottom: 20, left: 14 },
                didDrawPage: (data) => {
                    const pageCount = doc.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
                }
            });

            doc.save(`${exportData.filename}-${new Date().toISOString().split('T')[0]}.pdf`);
        } finally {
            setIsExporting(false);
        }
    };

    const exportToHTML = async () => {
        setIsExporting(true);
        try {
            const statsHtml = exportData.stats ? `
                <div class="stats">
                    ${exportData.stats.map(stat => `
                        <div class="stat-card">
                            <div class="stat-number">${stat.value}</div>
                            <div class="stat-label">${stat.label}</div>
                        </div>
                    `).join('')}
                </div>
            ` : '';

            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${exportData.title} Export</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f9fafb;
        }
        .header {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.8;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
        }
        .stat-label {
            color: #6b7280;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th {
            background-color: #3b82f6;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        td {
            padding: 12px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        tr:hover {
            background-color: #f3f4f6;
        }
        .truncate {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .footer {
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${exportData.title}</h1>
        ${exportData.description ? `<p>${exportData.description}</p>` : ''}
        <p>Exported on: ${new Date().toLocaleString()}</p>
        <p>Total records: ${exportData.data.length}</p>
    </div>

    ${statsHtml}

    <table>
        <thead>
            <tr>
                ${exportData.columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${exportData.data.map(row => `
                <tr>
                    ${exportData.columns.map(col => {
                const value = col.getValue ? col.getValue(row) : row[col.key];
                return `<td class="truncate" title="${String(value || '')}">${String(value || '')}</td>`;
            }).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        Generated by Export Tool
    </div>
</body>
</html>`;

            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${exportData.filename}-${new Date().toISOString().split('T')[0]}.html`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={`flex items-center gap-2 ${className || ''}`} disabled={isExporting}>
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export'}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV} className="flex items-center gap-2" disabled={isExporting}>
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="flex items-center gap-2" disabled={isExporting}>
                    <FileText className="h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToHTML} className="flex items-center gap-2" disabled={isExporting}>
                    <Globe className="h-4 w-4" />
                    Export as HTML
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
