(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/progress.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Progress",
    ()=>Progress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-progress/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Progress(param) {
    let { className, value, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "progress",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            "data-slot": "progress-indicator",
            className: "bg-primary h-full w-full flex-1 transition-all",
            style: {
                transform: "translateX(-".concat(100 - (value || 0), "%)")
            }
        }, void 0, false, {
            fileName: "[project]/components/ui/progress.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/progress.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = Progress;
;
var _c;
__turbopack_context__.k.register(_c, "Progress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ExportButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/ExportButton.tsx
__turbopack_context__.s([
    "ExportButton",
    ()=>ExportButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-spreadsheet.js [app-client] (ecmascript) <export default as FileSpreadsheet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function ExportButton(param) {
    let { data, exportOptions, variant = "default", size = "default", className, tenantId } = param;
    _s();
    const [isExporting, setIsExporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Helper function to generate filename with tenant ID
    const generateFilename = (baseFilename, extension)=>{
        const tenantPrefix = tenantId ? "".concat(tenantId, "-") : '';
        const timestamp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        return "".concat(tenantPrefix).concat(baseFilename, "_").concat(timestamp, ".").concat(extension);
    };
    const exportToCSV = async (dataToExport)=>{
        const exportData = dataToExport || data || (exportOptions && exportOptions.length === 1 ? exportOptions[0].data : null);
        if (!exportData) return;
        setIsExporting(true);
        try {
            const headers = exportData.columns.map((col)=>col.label);
            const csvData = exportData.data.map((row)=>exportData.columns.map((col)=>{
                    const value = col.getValue ? col.getValue(row) : row[col.key];
                    return String(value || '');
                }));
            const separator = ';';
            const csvContent = [
                headers,
                ...csvData
            ].map((row)=>row.map((field)=>String(field)).join(separator)).join('\n');
            const blob = new Blob([
                csvContent
            ], {
                type: 'text/csv;charset=utf-8;'
            });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', generateFilename(exportData.filename, 'csv'));
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally{
            setIsExporting(false);
        }
    };
    const exportToPDF = async (dataToExport)=>{
        const exportData = dataToExport || data || (exportOptions && exportOptions.length === 1 ? exportOptions[0].data : null);
        if (!exportData) return;
        setIsExporting(true);
        try {
            const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]();
            // Add title
            doc.setFontSize(20);
            doc.text(exportData.title, 14, 22);
            // Add export date and stats
            doc.setFontSize(10);
            doc.text("Exported on: ".concat(new Date().toLocaleString()), 14, 32);
            doc.text("Total records: ".concat(exportData.data.length), 14, 38);
            if (exportData.description) {
                doc.text(exportData.description, 14, 44);
            }
            // Add stats if provided
            let startY = exportData.description ? 50 : 44;
            if (exportData.stats && exportData.stats.length > 0) {
                doc.setFontSize(12);
                doc.text('Summary:', 14, startY);
                startY += 6;
                exportData.stats.forEach((stat, index)=>{
                    doc.setFontSize(10);
                    doc.text("".concat(stat.label, ": ").concat(stat.value), 14, startY + index * 6);
                });
                startY += exportData.stats.length * 6 + 6;
            }
            // Prepare table data
            const tableHeaders = exportData.columns.map((col)=>col.label);
            const tableData = exportData.data.map((row)=>exportData.columns.map((col)=>{
                    const value = col.getValue ? col.getValue(row) : row[col.key];
                    return String(value || '');
                }));
            // Calculate column widths
            const totalWidth = 180; // Available width
            const columnWidths = exportData.columns.map((col)=>{
                if (col.width) return col.width;
                return totalWidth / exportData.columns.length;
            });
            // Add table
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
                head: [
                    tableHeaders
                ],
                body: tableData,
                startY: startY,
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [
                        59,
                        130,
                        246
                    ],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [
                        248,
                        250,
                        252
                    ]
                },
                columnStyles: Object.fromEntries(columnWidths.map((width, index)=>[
                        index,
                        {
                            cellWidth: width
                        }
                    ])),
                margin: {
                    top: startY,
                    right: 14,
                    bottom: 20,
                    left: 14
                },
                didDrawPage: (data)=>{
                    const pageCount = doc.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.text("Page ".concat(data.pageNumber, " of ").concat(pageCount), data.settings.margin.left, doc.internal.pageSize.height - 10);
                }
            });
            doc.save(generateFilename(exportData.filename, 'pdf'));
        } finally{
            setIsExporting(false);
        }
    };
    const exportToHTML = async (dataToExport)=>{
        const exportData = dataToExport || data || (exportOptions && exportOptions.length === 1 ? exportOptions[0].data : null);
        if (!exportData) return;
        setIsExporting(true);
        try {
            const statsHtml = exportData.stats ? '\n                <div class="stats">\n                    '.concat(exportData.stats.map((stat)=>'\n                        <div class="stat-card">\n                            <div class="stat-number">'.concat(stat.value, '</div>\n                            <div class="stat-label">').concat(stat.label, "</div>\n                        </div>\n                    ")).join(''), "\n                </div>\n            ") : '';
            const htmlContent = '\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>'.concat(exportData.title, ' Export</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 20px;\n            background-color: #f9fafb;\n        }\n        .header {\n            background-color: #1f2937;\n            color: white;\n            padding: 20px;\n            border-radius: 8px;\n            margin-bottom: 20px;\n        }\n        .header h1 {\n            margin: 0 0 10px 0;\n            font-size: 24px;\n        }\n        .header p {\n            margin: 5px 0;\n            opacity: 0.8;\n        }\n        .stats {\n            display: grid;\n            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n            gap: 15px;\n            margin-bottom: 20px;\n        }\n        .stat-card {\n            background: white;\n            padding: 15px;\n            border-radius: 8px;\n            box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n        }\n        .stat-number {\n            font-size: 24px;\n            font-weight: bold;\n            color: #1f2937;\n        }\n        .stat-label {\n            color: #6b7280;\n            font-size: 14px;\n        }\n        table {\n            width: 100%;\n            border-collapse: collapse;\n            background: white;\n            border-radius: 8px;\n            overflow: hidden;\n            box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n        }\n        th {\n            background-color: #3b82f6;\n            color: white;\n            padding: 12px 8px;\n            text-align: left;\n            font-weight: 600;\n            font-size: 14px;\n        }\n        td {\n            padding: 12px 8px;\n            border-bottom: 1px solid #e5e7eb;\n            font-size: 13px;\n        }\n        tr:nth-child(even) {\n            background-color: #f9fafb;\n        }\n        tr:hover {\n            background-color: #f3f4f6;\n        }\n        .truncate {\n            max-width: 200px;\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n        }\n        .footer {\n            margin-top: 20px;\n            padding: 15px;\n            background: white;\n            border-radius: 8px;\n            text-align: center;\n            color: #6b7280;\n            font-size: 12px;\n        }\n    </style>\n</head>\n<body>\n    <div class="header">\n        <h1>').concat(exportData.title, "</h1>\n        ").concat(exportData.description ? "<p>".concat(exportData.description, "</p>") : '', "\n        <p>Exported on: ").concat(new Date().toLocaleString(), "</p>\n        <p>Total records: ").concat(exportData.data.length, "</p>\n    </div>\n\n    ").concat(statsHtml, "\n\n    <table>\n        <thead>\n            <tr>\n                ").concat(exportData.columns.map((col)=>"<th>".concat(col.label, "</th>")).join(''), "\n            </tr>\n        </thead>\n        <tbody>\n            ").concat(exportData.data.map((row)=>"\n                <tr>\n                    ".concat(exportData.columns.map((col)=>{
                    const value = col.getValue ? col.getValue(row) : row[col.key];
                    return '<td class="truncate" title="'.concat(String(value || ''), '">').concat(String(value || ''), "</td>");
                }).join(''), "\n                </tr>\n            ")).join(''), '\n        </tbody>\n    </table>\n\n    <div class="footer">\n        Generated by Export Tool\n    </div>\n</body>\n</html>');
            const blob = new Blob([
                htmlContent
            ], {
                type: 'text/html;charset=utf-8;'
            });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', generateFilename(exportData.filename, 'html'));
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally{
            setIsExporting(false);
        }
    };
    // Show export options with format sub-menus when multiple export options exist
    if (exportOptions && exportOptions.length > 1) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                    asChild: true,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: variant,
                        size: size,
                        className: "flex items-center gap-2 ".concat(className || ''),
                        disabled: isExporting,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ExportButton.tsx",
                                lineNumber: 335,
                                columnNumber: 25
                            }, this),
                            isExporting ? 'Exporting...' : 'Export',
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ExportButton.tsx",
                                lineNumber: 337,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ExportButton.tsx",
                        lineNumber: 334,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ExportButton.tsx",
                    lineNumber: 333,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                    align: "end",
                    className: "w-56",
                    children: exportOptions.map((option, index)=>{
                        const allowedFormats = option.formats || [
                            'csv',
                            'pdf',
                            'html'
                        ];
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700",
                                    children: option.label
                                }, void 0, false, {
                                    fileName: "[project]/components/ExportButton.tsx",
                                    lineNumber: 346,
                                    columnNumber: 33
                                }, this),
                                allowedFormats.includes('csv') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                    onClick: ()=>exportToCSV(option.data),
                                    className: "flex items-center gap-2 pl-4",
                                    disabled: isExporting,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__["FileSpreadsheet"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ExportButton.tsx",
                                            lineNumber: 355,
                                            columnNumber: 41
                                        }, this),
                                        "Export as CSV"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ExportButton.tsx",
                                    lineNumber: 350,
                                    columnNumber: 37
                                }, this),
                                allowedFormats.includes('pdf') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                    onClick: ()=>exportToPDF(option.data),
                                    className: "flex items-center gap-2 pl-4",
                                    disabled: isExporting,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ExportButton.tsx",
                                            lineNumber: 365,
                                            columnNumber: 41
                                        }, this),
                                        "Export as PDF"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ExportButton.tsx",
                                    lineNumber: 360,
                                    columnNumber: 37
                                }, this),
                                allowedFormats.includes('html') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                                    onClick: ()=>exportToHTML(option.data),
                                    className: "flex items-center gap-2 pl-4",
                                    disabled: isExporting,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ExportButton.tsx",
                                            lineNumber: 375,
                                            columnNumber: 41
                                        }, this),
                                        "Export as HTML"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ExportButton.tsx",
                                    lineNumber: 370,
                                    columnNumber: 37
                                }, this),
                                index < exportOptions.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-gray-200 dark:border-gray-700 my-1"
                                }, void 0, false, {
                                    fileName: "[project]/components/ExportButton.tsx",
                                    lineNumber: 380,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/components/ExportButton.tsx",
                            lineNumber: 345,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/ExportButton.tsx",
                    lineNumber: 340,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ExportButton.tsx",
            lineNumber: 332,
            columnNumber: 13
        }, this);
    }
    // Single export option or backward compatibility
    const exportData = data || (exportOptions && exportOptions.length === 1 ? exportOptions[0].data : null);
    if (!exportData) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: variant,
                    size: size,
                    className: "flex items-center gap-2 ".concat(className || ''),
                    disabled: isExporting,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/components/ExportButton.tsx",
                            lineNumber: 399,
                            columnNumber: 21
                        }, this),
                        isExporting ? 'Exporting...' : 'Export',
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/components/ExportButton.tsx",
                            lineNumber: 401,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ExportButton.tsx",
                    lineNumber: 398,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ExportButton.tsx",
                lineNumber: 397,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                align: "end",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                        onClick: ()=>exportToCSV(),
                        className: "flex items-center gap-2",
                        disabled: isExporting,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$spreadsheet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileSpreadsheet$3e$__["FileSpreadsheet"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ExportButton.tsx",
                                lineNumber: 406,
                                columnNumber: 21
                            }, this),
                            "Export as CSV"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ExportButton.tsx",
                        lineNumber: 405,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                        onClick: ()=>exportToPDF(),
                        className: "flex items-center gap-2",
                        disabled: isExporting,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ExportButton.tsx",
                                lineNumber: 410,
                                columnNumber: 21
                            }, this),
                            "Export as PDF"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ExportButton.tsx",
                        lineNumber: 409,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                        onClick: ()=>exportToHTML(),
                        className: "flex items-center gap-2",
                        disabled: isExporting,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ExportButton.tsx",
                                lineNumber: 414,
                                columnNumber: 21
                            }, this),
                            "Export as HTML"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ExportButton.tsx",
                        lineNumber: 413,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ExportButton.tsx",
                lineNumber: 404,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ExportButton.tsx",
        lineNumber: 396,
        columnNumber: 9
    }, this);
}
_s(ExportButton, "XQ7fG7pvVdpe4/5dD4LeZqiOLo4=");
_c = ExportButton;
var _c;
__turbopack_context__.k.register(_c, "ExportButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DataTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/DataTable.tsx
__turbopack_context__.s([
    "DataTable",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUpDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-up-down.js [app-client] (ecmascript) <export default as ChevronsUpDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-client] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
// Memoized TableRow component to prevent unnecessary re-renders
const TableRow = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].memo(_s((param)=>{
    let { row, rowIndex, visibleColumns, startIndex, isSelected, onRowClick, rowClassName, getCellValue } = param;
    _s();
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TableRow.useCallback[handleClick]": (e)=>{
            if (onRowClick) {
                onRowClick(e, row, startIndex + rowIndex);
            }
        }
    }["TableRow.useCallback[handleClick]"], [
        onRowClick,
        row,
        startIndex,
        rowIndex
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        className: "\n                border-b border-gray-100 dark:border-gray-800 last:border-b-0\n                ".concat(onRowClick ? 'cursor-pointer' : '', "\n                ").concat(isSelected ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-l-primary' : rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900 hover:bg-gray-500/70 dark:hover:bg-gray-800/80' : 'bg-gray-50/30 dark:bg-gray-900/70 hover:bg-gray-50/70 dark:hover:bg-gray-800/40', "\n                ").concat(rowClassName ? rowClassName(row) : '', "\n                transition-colors duration-200 ease-in-out\n            "),
        onClick: handleClick,
        children: visibleColumns.map((column)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "p-3 text-gray-900 dark:text-gray-100 first:pl-6 last:pr-6",
                style: {
                    width: "".concat(column.width, "px"),
                    minWidth: "".concat(column.minWidth, "px")
                },
                children: column.render ? column.render(getCellValue(row, column), row) : String(getCellValue(row, column) || '')
            }, column.key, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 88,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/components/DataTable.tsx",
        lineNumber: 72,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
}, "PRIOWs9bezaAbp8UlGmbaZMoYYA="));
_c = TableRow;
TableRow.displayName = 'TableRow';
function DataTableComponent(props) {
    _s1();
    const { data, columns: initialColumns, className: _className = '', onRowClick, currentPage = 1, totalPages: _totalPages = 1, itemsPerPage = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ITEMS_PER_PAGE"], rowClassName, onPageChange, onItemsPerPageChange, showPagination = true, showSearch = true, searchPlaceholder = "Search...", onSelectionChange, selectedRows = [], expandedRowRender, onSearchChange } = props;
    // Local pagination state to support uncontrolled usage
    const [internalCurrentPage, setInternalCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentPage);
    const [internalItemsPerPage, setInternalItemsPerPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(itemsPerPage);
    // Sync internal state when parent updates props
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>setInternalCurrentPage(currentPage)
    }["DataTableComponent.useEffect"], [
        currentPage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>setInternalItemsPerPage(itemsPerPage)
    }["DataTableComponent.useEffect"], [
        itemsPerPage
    ]);
    // Effective values: prefer controller (props) when callbacks are provided
    const effectiveCurrentPage = onPageChange ? currentPage : internalCurrentPage;
    const effectiveItemsPerPage = onItemsPerPageChange ? itemsPerPage : internalItemsPerPage;
    // Memoize change handlers (defined early to use in clearSearch)
    const changePage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[changePage]": (page)=>{
            if (onPageChange) {
                onPageChange(page);
            } else {
                setInternalCurrentPage(page);
            }
        }
    }["DataTableComponent.useCallback[changePage]"], [
        onPageChange
    ]);
    const changeItemsPerPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[changeItemsPerPage]": (n)=>{
            if (onItemsPerPageChange) {
                onItemsPerPageChange(n);
            } else {
                setInternalItemsPerPage(n);
            }
        }
    }["DataTableComponent.useCallback[changeItemsPerPage]"], [
        onItemsPerPageChange
    ]);
    // Memoize selected rows as a Set for O(1) lookup
    const selectedRowsSet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[selectedRowsSet]": ()=>new Set(selectedRows)
    }["DataTableComponent.useMemo[selectedRowsSet]"], [
        selectedRows
    ]);
    const isRowSelected = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[isRowSelected]": (row)=>{
            if (selectedRowsSet.size === 0) return false;
            const rowId = String(row.id);
            return selectedRowsSet.has(rowId);
        }
    }["DataTableComponent.useCallback[isRowSelected]"], [
        selectedRowsSet
    ]);
    const handleRowSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[handleRowSelection]": (e, row)=>{
            e.stopPropagation();
            const rowId = String(row.id);
            if (onSelectionChange) {
                const isCurrentlySelected = selectedRowsSet.has(rowId);
                if (isCurrentlySelected) {
                    onSelectionChange(selectedRows.filter({
                        "DataTableComponent.useCallback[handleRowSelection]": (id)=>id !== rowId
                    }["DataTableComponent.useCallback[handleRowSelection]"]));
                } else {
                    onSelectionChange([
                        ...selectedRows,
                        rowId
                    ]);
                }
            }
        }
    }["DataTableComponent.useCallback[handleRowSelection]"], [
        onSelectionChange,
        selectedRowsSet,
        selectedRows
    ]);
    const columnsWithSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[columnsWithSelection]": ()=>{
            if (onSelectionChange && !initialColumns.some({
                "DataTableComponent.useMemo[columnsWithSelection]": (col)=>col.key === '_select'
            }["DataTableComponent.useMemo[columnsWithSelection]"])) {
                return [
                    {
                        key: '_select',
                        label: '',
                        width: 50,
                        minWidth: 40,
                        hasExplicitWidth: true,
                        sortable: false,
                        searchable: false,
                        sortValue: undefined,
                        render: {
                            "DataTableComponent.useMemo[columnsWithSelection]": (_, row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: isRowSelected(row),
                                    onChange: {
                                        "DataTableComponent.useMemo[columnsWithSelection]": (e)=>handleRowSelection(e, row)
                                    }["DataTableComponent.useMemo[columnsWithSelection]"],
                                    className: "rounded border-input text-primary focus:ring-ring"
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 195,
                                    columnNumber: 25
                                }, this)
                        }["DataTableComponent.useMemo[columnsWithSelection]"]
                    },
                    ...initialColumns
                ];
            }
            return initialColumns;
        }
    }["DataTableComponent.useMemo[columnsWithSelection]"], [
        onSelectionChange,
        initialColumns,
        isRowSelected,
        handleRowSelection
    ]);
    const [columns, setColumns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(columnsWithSelection.map({
        "DataTableComponent.useState": (col)=>({
                ...col,
                hasExplicitWidth: col.key === '_select' ? true : col.width !== undefined,
                width: col.width || 150,
                minWidth: col.minWidth || 100,
                searchable: col.searchable !== false && col.key !== '_select',
                sortValue: col.sortValue
            })
    }["DataTableComponent.useState"]));
    const [widthsReady, setWidthsReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [resizing, setResizing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [columnVisibility, setColumnVisibility] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "DataTableComponent.useState": ()=>{
            // Initialize columns: visible by default unless marked as defaultHidden
            const visibility = {};
            columnsWithSelection.forEach({
                "DataTableComponent.useState": (col)=>{
                    visibility[col.key] = col.defaultHidden !== true;
                }
            }["DataTableComponent.useState"]);
            return visibility;
        }
    }["DataTableComponent.useState"]);
    const [containerWidth, setContainerWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const initialWidthsCalculatedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const tableRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const tableContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Debounce search term to improve performance
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            const timer = setTimeout({
                "DataTableComponent.useEffect.timer": ()=>{
                    setDebouncedSearchTerm(searchTerm);
                    onSearchChange === null || onSearchChange === void 0 ? void 0 : onSearchChange(searchTerm);
                }
            }["DataTableComponent.useEffect.timer"], 300);
            return ({
                "DataTableComponent.useEffect": ()=>clearTimeout(timer)
            })["DataTableComponent.useEffect"];
        }
    }["DataTableComponent.useEffect"], [
        searchTerm,
        onSearchChange
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            const container = tableContainerRef.current;
            if (!container) return;
            const handleScroll = {
                "DataTableComponent.useEffect.handleScroll": ()=>{
                // Passive listener - browser can optimize
                }
            }["DataTableComponent.useEffect.handleScroll"];
            container.addEventListener('scroll', handleScroll, {
                passive: true
            });
            return ({
                "DataTableComponent.useEffect": ()=>container.removeEventListener('scroll', handleScroll)
            })["DataTableComponent.useEffect"];
        }
    }["DataTableComponent.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            setColumns(columnsWithSelection.map({
                "DataTableComponent.useEffect": (col)=>({
                        ...col,
                        hasExplicitWidth: col.key === '_select' ? true : col.width !== undefined,
                        width: col.width || 150,
                        minWidth: col.minWidth || 100,
                        searchable: col.searchable !== false && col.key !== '_select',
                        sortValue: col.sortValue
                    })
            }["DataTableComponent.useEffect"]));
            setWidthsReady(false);
            // Update visibility for any new columns
            setColumnVisibility({
                "DataTableComponent.useEffect": (prev)=>{
                    const newVisibility = {
                        ...prev
                    };
                    columnsWithSelection.forEach({
                        "DataTableComponent.useEffect": (col)=>{
                            if (!(col.key in newVisibility)) {
                                newVisibility[col.key] = true;
                            }
                        }
                    }["DataTableComponent.useEffect"]);
                    return newVisibility;
                }
            }["DataTableComponent.useEffect"]);
            // Reset width calculation flag when columns change
            initialWidthsCalculatedRef.current = false;
        }
    }["DataTableComponent.useEffect"], [
        columnsWithSelection
    ]);
    // Measure container width and calculate initial column widths to fill 100%
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            if (!tableContainerRef.current || initialWidthsCalculatedRef.current || columns.length === 0) return;
            const updateColumnWidths = {
                "DataTableComponent.useEffect.updateColumnWidths": ()=>{
                    const containerEl = tableContainerRef.current;
                    if (!containerEl) return;
                    const availableWidth = containerEl.clientWidth;
                    if (availableWidth === 0) return;
                    setContainerWidth(availableWidth);
                    // Fixed columns: _select or any column where the caller provided an explicit width
                    const fixedCols = columns.filter({
                        "DataTableComponent.useEffect.updateColumnWidths.fixedCols": (col)=>col.hasExplicitWidth
                    }["DataTableComponent.useEffect.updateColumnWidths.fixedCols"]);
                    const autoCols = columns.filter({
                        "DataTableComponent.useEffect.updateColumnWidths.autoCols": (col)=>!col.hasExplicitWidth
                    }["DataTableComponent.useEffect.updateColumnWidths.autoCols"]);
                    const fixedWidth = fixedCols.reduce({
                        "DataTableComponent.useEffect.updateColumnWidths.fixedWidth": (sum, col)=>sum + (col.width || 0)
                    }["DataTableComponent.useEffect.updateColumnWidths.fixedWidth"], 0);
                    const availableForAuto = availableWidth - fixedWidth;
                    if (availableForAuto > 0 && autoCols.length > 0) {
                        // Equal share for every auto column, respecting its minWidth
                        const equalShare = Math.floor(availableForAuto / autoCols.length);
                        setColumns({
                            "DataTableComponent.useEffect.updateColumnWidths": (prev)=>prev.map({
                                    "DataTableComponent.useEffect.updateColumnWidths": (col)=>{
                                        if (col.hasExplicitWidth) return col; // keep fixed columns untouched
                                        return {
                                            ...col,
                                            width: Math.max(equalShare, col.minWidth || 80)
                                        };
                                    }
                                }["DataTableComponent.useEffect.updateColumnWidths"])
                        }["DataTableComponent.useEffect.updateColumnWidths"]);
                    }
                    initialWidthsCalculatedRef.current = true;
                    setWidthsReady(true);
                }
            }["DataTableComponent.useEffect.updateColumnWidths"];
            // Use ResizeObserver for reliable measurement
            const resizeObserver = new ResizeObserver({
                "DataTableComponent.useEffect": ()=>{
                    if (!initialWidthsCalculatedRef.current) {
                        updateColumnWidths();
                    }
                }
            }["DataTableComponent.useEffect"]);
            if (tableContainerRef.current) {
                resizeObserver.observe(tableContainerRef.current);
            }
            // Also try immediate calculation after a short delay to ensure DOM is ready
            const timer = setTimeout({
                "DataTableComponent.useEffect.timer": ()=>{
                    updateColumnWidths();
                }
            }["DataTableComponent.useEffect.timer"], 100);
            return ({
                "DataTableComponent.useEffect": ()=>{
                    resizeObserver.disconnect();
                    clearTimeout(timer);
                }
            })["DataTableComponent.useEffect"];
        }
    }["DataTableComponent.useEffect"], [
        columns.length
    ]);
    // Memoize visible columns
    const visibleColumns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[visibleColumns]": ()=>{
            return columns.filter({
                "DataTableComponent.useMemo[visibleColumns]": (col)=>columnVisibility[col.key] !== false
            }["DataTableComponent.useMemo[visibleColumns]"]);
        }
    }["DataTableComponent.useMemo[visibleColumns]"], [
        columns,
        columnVisibility
    ]);
    // Calculate total table width based on visible column widths
    const totalTableWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[totalTableWidth]": ()=>{
            return visibleColumns.reduce({
                "DataTableComponent.useMemo[totalTableWidth]": (sum, col)=>sum + (col.width || 150)
            }["DataTableComponent.useMemo[totalTableWidth]"], 0);
        }
    }["DataTableComponent.useMemo[totalTableWidth]"], [
        visibleColumns
    ]);
    // Toggle column visibility
    const toggleColumnVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[toggleColumnVisibility]": (columnKey)=>{
            setColumnVisibility({
                "DataTableComponent.useCallback[toggleColumnVisibility]": (prev)=>({
                        ...prev,
                        [columnKey]: !prev[columnKey]
                    })
            }["DataTableComponent.useCallback[toggleColumnVisibility]"]);
        }
    }["DataTableComponent.useCallback[toggleColumnVisibility]"], []);
    // Memoize filtered data to prevent unnecessary recalculations
    const filteredData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[filteredData]": ()=>{
            if (!debouncedSearchTerm.trim()) return data;
            const searchLower = debouncedSearchTerm.toLowerCase();
            return data.filter({
                "DataTableComponent.useMemo[filteredData]": (row)=>{
                    // Search through ALL properties in the row, not just the column keys
                    return Object.entries(row).some({
                        "DataTableComponent.useMemo[filteredData]": (param)=>{
                            let [_key, value] = param;
                            if (value === null || value === undefined) return false;
                            const stringValue = String(value).toLowerCase();
                            return stringValue.includes(searchLower);
                        }
                    }["DataTableComponent.useMemo[filteredData]"]);
                }
            }["DataTableComponent.useMemo[filteredData]"]);
        }
    }["DataTableComponent.useMemo[filteredData]"], [
        data,
        debouncedSearchTerm
    ]);
    // Memoize sorted data to prevent unnecessary recalculations
    const sortedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[sortedData]": ()=>{
            if (!sortConfig) return filteredData;
            // Find the column configuration to check for custom sortValue
            const column = columns.find({
                "DataTableComponent.useMemo[sortedData].column": (col)=>col.key === sortConfig.key
            }["DataTableComponent.useMemo[sortedData].column"]);
            return [
                ...filteredData
            ].sort({
                "DataTableComponent.useMemo[sortedData]": (a, b)=>{
                    // Use sortValue function if provided, otherwise fall back to direct value
                    const aValue = (column === null || column === void 0 ? void 0 : column.sortValue) ? column.sortValue(a) : a[sortConfig.key];
                    const bValue = (column === null || column === void 0 ? void 0 : column.sortValue) ? column.sortValue(b) : b[sortConfig.key];
                    if (aValue === undefined && bValue === undefined) {
                        return 0;
                    }
                    if (aValue === null || aValue === undefined) return 1;
                    if (bValue === null || bValue === undefined) return -1;
                    if (typeof aValue === 'number' && typeof bValue === 'number') {
                        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                    }
                    const aDate = new Date(aValue);
                    const bDate = new Date(bValue);
                    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                        return sortConfig.direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
                    }
                    const aStr = String(aValue).toLowerCase();
                    const bStr = String(bValue).toLowerCase();
                    if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
            }["DataTableComponent.useMemo[sortedData]"]);
        }
    }["DataTableComponent.useMemo[sortedData]"], [
        filteredData,
        sortConfig,
        columns
    ]);
    // Memoize pagination to avoid recalculation on every render
    const paginationData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[paginationData]": ()=>{
            const startIndex = (effectiveCurrentPage - 1) * effectiveItemsPerPage;
            const endIndex = startIndex + effectiveItemsPerPage;
            const paginatedData = sortedData.slice(startIndex, endIndex);
            const totalFilteredPages = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));
            return {
                paginatedData,
                startIndex,
                endIndex,
                totalFilteredPages
            };
        }
    }["DataTableComponent.useMemo[paginationData]"], [
        sortedData,
        effectiveCurrentPage,
        effectiveItemsPerPage
    ]);
    const { paginatedData, startIndex, endIndex, totalFilteredPages } = paginationData;
    const handleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[handleSort]": (columnKey)=>{
            setSortConfig({
                "DataTableComponent.useCallback[handleSort]": (prev)=>{
                    if (prev && prev.key === columnKey && prev.direction === 'asc') {
                        return {
                            key: columnKey,
                            direction: 'desc'
                        };
                    }
                    return {
                        key: columnKey,
                        direction: 'asc'
                    };
                }
            }["DataTableComponent.useCallback[handleSort]"]);
        }
    }["DataTableComponent.useCallback[handleSort]"], []);
    const getSortIcon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[getSortIcon]": (columnKey)=>{
            if (!sortConfig || sortConfig.key !== columnKey) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUpDown$3e$__["ChevronsUpDown"], {
                    className: "h-4 w-4 text-muted-foreground"
                }, void 0, false, {
                    fileName: "[project]/components/DataTable.tsx",
                    lineNumber: 445,
                    columnNumber: 20
                }, this);
            }
            return sortConfig.direction === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                className: "h-4 w-4 text-foreground"
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 449,
                columnNumber: 15
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                className: "h-4 w-4 text-foreground"
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 450,
                columnNumber: 15
            }, this);
        }
    }["DataTableComponent.useCallback[getSortIcon]"], [
        sortConfig
    ]);
    const clearSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[clearSearch]": ()=>{
            setSearchTerm('');
            changePage(1);
        }
    }["DataTableComponent.useCallback[clearSearch]"], [
        changePage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            if (effectiveCurrentPage > 1) {
                changePage(1);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DataTableComponent.useEffect"], [
        searchTerm
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            const maxPage = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));
            if (effectiveCurrentPage > maxPage) {
                changePage(1);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DataTableComponent.useEffect"], [
        effectiveItemsPerPage,
        sortedData.length,
        effectiveCurrentPage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTableComponent.useEffect": ()=>{
            if (!resizing) return;
            let rafId;
            const handleMouseMove = {
                "DataTableComponent.useEffect.handleMouseMove": (e)=>{
                    if (rafId) cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame({
                        "DataTableComponent.useEffect.handleMouseMove": ()=>{
                            const diff = e.clientX - resizing.startX;
                            const newWidth = Math.max(resizing.startWidth + diff, columns[resizing.columnIndex].minWidth || 100);
                            setColumns({
                                "DataTableComponent.useEffect.handleMouseMove": (prev)=>prev.map({
                                        "DataTableComponent.useEffect.handleMouseMove": (col, index)=>index === resizing.columnIndex ? {
                                                ...col,
                                                width: newWidth
                                            } : col
                                    }["DataTableComponent.useEffect.handleMouseMove"])
                            }["DataTableComponent.useEffect.handleMouseMove"]);
                        }
                    }["DataTableComponent.useEffect.handleMouseMove"]);
                }
            }["DataTableComponent.useEffect.handleMouseMove"];
            const handleMouseUp = {
                "DataTableComponent.useEffect.handleMouseUp": ()=>{
                    if (rafId) cancelAnimationFrame(rafId);
                    setResizing(null);
                }
            }["DataTableComponent.useEffect.handleMouseUp"];
            document.addEventListener('mousemove', handleMouseMove, {
                passive: true
            });
            document.addEventListener('mouseup', handleMouseUp);
            return ({
                "DataTableComponent.useEffect": ()=>{
                    if (rafId) cancelAnimationFrame(rafId);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
            })["DataTableComponent.useEffect"];
        }
    }["DataTableComponent.useEffect"], [
        resizing,
        columns
    ]);
    const handleResizeStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[handleResizeStart]": (e, columnIndex)=>{
            e.preventDefault();
            e.stopPropagation();
            setResizing({
                columnIndex,
                startX: e.clientX,
                startWidth: columns[columnIndex].width || 150
            });
        }
    }["DataTableComponent.useCallback[handleResizeStart]"], [
        columns
    ]);
    const handleRowClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[handleRowClick]": (e, row, index)=>{
            if (resizing) return;
            const target = e.target;
            const isInteractive = target.closest('input[type="checkbox"], input[type="radio"], button, a, [role="button"], [tabindex="0"]');
            if (!isInteractive && onRowClick) {
                onRowClick(row, index, e);
            }
        }
    }["DataTableComponent.useCallback[handleRowClick]"], [
        resizing,
        onRowClick
    ]);
    const getCellValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataTableComponent.useCallback[getCellValue]": (row, column)=>{
            if (column.key === '_select') {
                return null;
            }
            return row[column.key];
        }
    }["DataTableComponent.useCallback[getCellValue]"], []);
    // Memoize pagination page numbers for better performance
    const paginationPageNumbers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[paginationPageNumbers]": ()=>{
            const pageCount = Math.min(5, totalFilteredPages);
            const pages = [];
            for(let i = 0; i < pageCount; i++){
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
        }
    }["DataTableComponent.useMemo[paginationPageNumbers]"], [
        totalFilteredPages,
        effectiveCurrentPage
    ]);
    // Memoize hasData check
    const hasData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTableComponent.useMemo[hasData]": ()=>paginatedData.length > 0
    }["DataTableComponent.useMemo[hasData]"], [
        paginatedData.length
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            showSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex-1 max-w-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 566,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: searchPlaceholder,
                                value: searchTerm,
                                onChange: (e)=>setSearchTerm(e.target.value),
                                className: "w-full pl-10 pr-10 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 567,
                                columnNumber: 25
                            }, this),
                            searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearSearch,
                                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 579,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 575,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 565,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                asChild: true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    size: "sm",
                                    className: "gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DataTable.tsx",
                                            lineNumber: 588,
                                            columnNumber: 33
                                        }, this),
                                        "Columns"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 587,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 586,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                align: "end",
                                className: "w-[200px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuLabel"], {
                                        children: "Toggle columns"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 593,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {}, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 594,
                                        columnNumber: 29
                                    }, this),
                                    columns.filter((col)=>col.key !== '_select') // Don't allow hiding selection column
                                    .map((column)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuCheckboxItem"], {
                                            checked: columnVisibility[column.key] !== false,
                                            onCheckedChange: ()=>toggleColumnVisibility(column.key),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    columnVisibility[column.key] !== false ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DataTable.tsx",
                                                        lineNumber: 605,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DataTable.tsx",
                                                        lineNumber: 607,
                                                        columnNumber: 49
                                                    }, this),
                                                    column.label
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 603,
                                                columnNumber: 41
                                            }, this)
                                        }, column.key, false, {
                                            fileName: "[project]/components/DataTable.tsx",
                                            lineNumber: 598,
                                            columnNumber: 37
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 592,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 585,
                        columnNumber: 21
                    }, this),
                    searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-muted-foreground whitespace-nowrap",
                        children: [
                            sortedData.length,
                            " of ",
                            data.length,
                            " results"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 617,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 564,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: tableContainerRef,
                className: "overflow-x-auto overflow-y-auto bg-white dark:bg-gray-900",
                style: {
                    width: '100%',
                    maxWidth: '100%',
                    willChange: 'scroll-position',
                    transform: 'translateZ(0)',
                    WebkitOverflowScrolling: 'touch',
                    // Custom scrollbar styling
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgb(203 213 225) transparent'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    ref: tableRef,
                    className: "text-sm",
                    style: widthsReady ? {
                        width: "".concat(totalTableWidth, "px"),
                        minWidth: '100%',
                        tableLayout: 'fixed'
                    } : {
                        width: '100%',
                        tableLayout: 'auto'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 border-b-2 border-gray-200 dark:border-gray-700",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: visibleColumns.map((column, visibleIndex)=>{
                                    // Find the original index in the full columns array for resizing
                                    const originalIndex = columns.findIndex((col)=>col.key === column.key);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "relative text-left p-3 font-medium text-foreground first:pl-6 last:pr-6",
                                        style: {
                                            width: "".concat(column.width, "px"),
                                            minWidth: "".concat(column.minWidth, "px")
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 flex-1 ".concat(column.sortable !== false && column.key !== '_select' ? 'cursor-pointer select-none' : ''),
                                                    onClick: ()=>{
                                                        if (column.sortable !== false && column.key !== '_select') {
                                                            handleSort(column.key);
                                                        }
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate pr-2",
                                                            children: column.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/DataTable.tsx",
                                                            lineNumber: 679,
                                                            columnNumber: 49
                                                        }, this),
                                                        column.sortable !== false && column.key !== '_select' && getSortIcon(column.key)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DataTable.tsx",
                                                    lineNumber: 667,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 666,
                                                columnNumber: 41
                                            }, this),
                                            column.key !== '_select' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute right-0 top-0 h-full w-3 cursor-col-resize hover:bg-primary/10 active:bg-primary/20 group z-20",
                                                onMouseDown: (e)=>handleResizeStart(e, originalIndex),
                                                onClick: (e)=>e.stopPropagation(),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute right-0 top-0 h-full w-px bg-transparent group-hover:bg-primary/50 group-active:bg-primary transition-colors"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/DataTable.tsx",
                                                    lineNumber: 693,
                                                    columnNumber: 49
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 688,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, column.key, true, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 658,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 652,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DataTable.tsx",
                            lineNumber: 651,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "bg-transparent",
                            children: hasData ? paginatedData.map((row, rowIndex)=>{
                                const expandedContent = expandedRowRender ? expandedRowRender(row) : null;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableRow, {
                                            row: row,
                                            rowIndex: rowIndex,
                                            visibleColumns: visibleColumns,
                                            startIndex: startIndex,
                                            isSelected: isRowSelected(row),
                                            onRowClick: onRowClick ? handleRowClick : undefined,
                                            rowClassName: rowClassName,
                                            getCellValue: getCellValue
                                        }, void 0, false, {
                                            fileName: "[project]/components/DataTable.tsx",
                                            lineNumber: 707,
                                            columnNumber: 41
                                        }, this),
                                        expandedContent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: visibleColumns.length,
                                                className: "p-0 bg-blue-50/40 dark:bg-blue-900/10 border-b border-blue-200 dark:border-blue-800",
                                                children: expandedContent
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 719,
                                                columnNumber: 49
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/DataTable.tsx",
                                            lineNumber: 718,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, row.id ? "".concat(String(row.id), "-").concat(rowIndex) : rowIndex, true, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 706,
                                    columnNumber: 37
                                }, this);
                            }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: visibleColumns.length,
                                    className: "p-8 text-center text-muted-foreground",
                                    children: searchTerm ? 'No results found for your search.' : 'No data available.'
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 732,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 731,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DataTable.tsx",
                            lineNumber: 701,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DataTable.tsx",
                    lineNumber: 639,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 625,
                columnNumber: 13
            }, this),
            showPagination && sortedData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-gray-600 dark:text-gray-400",
                                children: [
                                    "Showing ",
                                    Math.min(startIndex + 1, sortedData.length),
                                    " to ",
                                    Math.min(endIndex, sortedData.length),
                                    " of ",
                                    sortedData.length,
                                    " results",
                                    searchTerm && " (filtered from ".concat(data.length, " total)")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 748,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-gray-600 dark:text-gray-400",
                                        children: "Items per page:"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 753,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: effectiveItemsPerPage,
                                        onChange: (e)=>{
                                            const newItemsPerPage = Number(e.target.value);
                                            changeItemsPerPage(newItemsPerPage);
                                            changePage(1);
                                        },
                                        className: "rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 10,
                                                children: "10"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 763,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 25,
                                                children: "25"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 764,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 50,
                                                children: "50"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 765,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 100,
                                                children: "100"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 766,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 754,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 752,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 747,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>changePage(Math.max(1, effectiveCurrentPage - 1)),
                                disabled: effectiveCurrentPage === 1,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 777,
                                        columnNumber: 29
                                    }, this),
                                    "Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 771,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: paginationPageNumbers.map((pageNum)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: effectiveCurrentPage === pageNum ? "default" : "outline",
                                        size: "sm",
                                        onClick: ()=>changePage(pageNum),
                                        className: "w-8 h-8 p-0",
                                        children: pageNum
                                    }, pageNum, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 783,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 781,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>changePage(Math.min(totalFilteredPages, effectiveCurrentPage + 1)),
                                disabled: effectiveCurrentPage === totalFilteredPages,
                                children: [
                                    "Next",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 802,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 795,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 770,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 746,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DataTable.tsx",
        lineNumber: 561,
        columnNumber: 9
    }, this);
}
_s1(DataTableComponent, "LMcTzNfJZ2gNk3Xnrpq3+eYjD8w=");
_c1 = DataTableComponent;
const DataTable = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].memo(DataTableComponent);
_c2 = DataTable;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "TableRow");
__turbopack_context__.k.register(_c1, "DataTableComponent");
__turbopack_context__.k.register(_c2, "DataTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CancelledCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CancelledCard",
    ()=>CancelledCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
;
;
;
;
function CancelledCard(param) {
    let { onRetry, title = "Request Cancelled", description = "The data loading request was cancelled. Click below to try again.", buttonText = "Retry" } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
            className: "pt-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-orange-400 mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                            className: "h-16 w-16 mx-auto"
                        }, void 0, false, {
                            fileName: "[project]/components/CancelledCard.tsx",
                            lineNumber: 24,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/CancelledCard.tsx",
                        lineNumber: 23,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-medium text-gray-900 dark:text-white mb-4",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/CancelledCard.tsx",
                        lineNumber: 26,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/CancelledCard.tsx",
                        lineNumber: 29,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: onRetry,
                        className: "flex items-center gap-2 mx-auto",
                        size: "lg",
                        children: buttonText
                    }, void 0, false, {
                        fileName: "[project]/components/CancelledCard.tsx",
                        lineNumber: 32,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CancelledCard.tsx",
                lineNumber: 22,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/CancelledCard.tsx",
            lineNumber: 21,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/CancelledCard.tsx",
        lineNumber: 20,
        columnNumber: 9
    }, this);
}
_c = CancelledCard;
var _c;
__turbopack_context__.k.register(_c, "CancelledCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/configuration/settings/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PolicySettingsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/hooks/useMsal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/progress.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExportButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useApiRequest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DataTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CancelledCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CancelledCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
// ── Helpers ────────────────────────────────────────────────────────────────────
function flattenPolicies(policies, source) {
    const rows = [];
    for (const policy of policies){
        if (source === 'catalog' && policy.settings) {
            for (const s of policy.settings){
                var _policy_name, _policy_policyType, _policy_platform, _s_settingName, _s_settingValue, _s_childSettingInfo;
                rows.push({
                    _id: "".concat(source, "-").concat(policy.id, "-").concat(s.id),
                    policyId: policy.id,
                    policyName: (_policy_name = policy.name) !== null && _policy_name !== void 0 ? _policy_name : '',
                    policyType: (_policy_policyType = policy.policyType) !== null && _policy_policyType !== void 0 ? _policy_policyType : '',
                    platform: (_policy_platform = policy.platform) !== null && _policy_platform !== void 0 ? _policy_platform : '',
                    settingName: (_s_settingName = s.settingName) !== null && _s_settingName !== void 0 ? _s_settingName : '',
                    settingValue: (_s_settingValue = s.settingValue) !== null && _s_settingValue !== void 0 ? _s_settingValue : '',
                    source,
                    childSettingInfo: (_s_childSettingInfo = s.childSettingInfo) !== null && _s_childSettingInfo !== void 0 ? _s_childSettingInfo : null,
                    status: 'ok'
                });
            }
        } else if (source === 'deviceconfig' && policy.deviceConfigSettings) {
            for (const s of policy.deviceConfigSettings){
                var _s_omaUri, _policy_name1, _policy_policyType1, _policy_platform1, _s_name, _s_value;
                rows.push({
                    _id: "".concat(source, "-").concat(policy.id, "-").concat((_s_omaUri = s.omaUri) !== null && _s_omaUri !== void 0 ? _s_omaUri : s.name),
                    policyId: policy.id,
                    policyName: (_policy_name1 = policy.name) !== null && _policy_name1 !== void 0 ? _policy_name1 : '',
                    policyType: (_policy_policyType1 = policy.policyType) !== null && _policy_policyType1 !== void 0 ? _policy_policyType1 : '',
                    platform: (_policy_platform1 = policy.platform) !== null && _policy_platform1 !== void 0 ? _policy_platform1 : '',
                    settingName: (_s_name = s.name) !== null && _s_name !== void 0 ? _s_name : '',
                    settingValue: (_s_value = s.value) !== null && _s_value !== void 0 ? _s_value : '',
                    omaUri: s.omaUri,
                    source,
                    childSettingInfo: null,
                    status: 'ok'
                });
            }
        } else if (source === 'grouppolicy' && policy.groupPolicySettings) {
            for (const s of policy.groupPolicySettings){
                var _s_definition;
                var _policy_name2, _policy_policyType2, _policy_platform2, _s_definition_displayName, _ref;
                rows.push({
                    _id: "".concat(source, "-").concat(policy.id, "-").concat(s.id),
                    policyId: policy.id,
                    policyName: (_policy_name2 = policy.name) !== null && _policy_name2 !== void 0 ? _policy_name2 : '',
                    policyType: (_policy_policyType2 = policy.policyType) !== null && _policy_policyType2 !== void 0 ? _policy_policyType2 : '',
                    platform: (_policy_platform2 = policy.platform) !== null && _policy_platform2 !== void 0 ? _policy_platform2 : '',
                    settingName: (_ref = (_s_definition_displayName = (_s_definition = s.definition) === null || _s_definition === void 0 ? void 0 : _s_definition.displayName) !== null && _s_definition_displayName !== void 0 ? _s_definition_displayName : s.id) !== null && _ref !== void 0 ? _ref : '',
                    settingValue: s.enabled ? 'Enabled' : 'Disabled',
                    source,
                    childSettingInfo: null,
                    status: 'ok'
                });
            }
        }
    }
    return rows;
}
function markDuplicatesAndConflicts(rows) {
    const byName = new Map();
    for (const row of rows){
        var _row_settingName;
        const key = ((_row_settingName = row.settingName) !== null && _row_settingName !== void 0 ? _row_settingName : '').toLowerCase();
        if (!key) continue;
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key).push(row);
    }
    return rows.map((row)=>{
        var _row_settingName;
        const key = ((_row_settingName = row.settingName) !== null && _row_settingName !== void 0 ? _row_settingName : '').toLowerCase();
        if (!key) return row;
        const siblings = byName.get(key);
        if (!siblings || siblings.length <= 1) return row;
        const values = new Set(siblings.map((s)=>{
            var _s_settingValue;
            return ((_s_settingValue = s.settingValue) !== null && _s_settingValue !== void 0 ? _s_settingValue : '').toLowerCase();
        }));
        return {
            ...row,
            status: values.size > 1 ? 'conflict' : 'duplicate'
        };
    });
}
const FETCH_STEPS = [
    {
        label: 'Settings Catalog',
        endpoint: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POLICY_SETTINGS_CATALOG_ENDPOINT"],
        source: 'catalog'
    },
    {
        label: 'Device Configuration',
        endpoint: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POLICY_SETTINGS_DEVICECONFIG_ENDPOINT"],
        source: 'deviceconfig'
    },
    {
        label: 'Group Policy',
        endpoint: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["POLICY_SETTINGS_GROUPPOLICY_ENDPOINT"],
        source: 'grouppolicy'
    }
];
function PolicySettingsPage() {
    var _instance_getActiveAccount, _accounts_;
    _s();
    const { instance, accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const { request, cancel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"])();
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isCancelled, setIsCancelled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expandedRows, setExpandedRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [activeSearch, setActiveSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [progressLabel, setProgressLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [completedSteps, setCompletedSteps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const toggleRowExpansion = (id)=>{
        setExpandedRows((prev)=>{
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const fetchSettings = async ()=>{
        if (!accounts.length) return;
        setLoading(true);
        setError(null);
        setIsCancelled(false);
        setSettings([]);
        setProgress(0);
        setCompletedSteps(0);
        const allRows = [];
        try {
            for(let i = 0; i < FETCH_STEPS.length; i++){
                var _response_data;
                const step = FETCH_STEPS[i];
                setProgressLabel("Fetching ".concat(step.label, "…"));
                setProgress(Math.round(i / FETCH_STEPS.length * 100));
                const response = await request(step.endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                var _response_data_data;
                const policies = (_response_data_data = response === null || response === void 0 ? void 0 : (_response_data = response.data) === null || _response_data === void 0 ? void 0 : _response_data.data) !== null && _response_data_data !== void 0 ? _response_data_data : [];
                allRows.push(...flattenPolicies(policies, step.source));
                setCompletedSteps(i + 1);
                setProgress(Math.round((i + 1) / FETCH_STEPS.length * 100));
            }
            setSettings(markDuplicatesAndConflicts(allRows));
            setProgressLabel('Done');
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to fetch settings');
        } finally{
            setLoading(false);
        }
    };
    const prepareExportData = ()=>{
        const exportColumns = [
            {
                key: 'policyName',
                label: 'Policy Name',
                width: 30,
                getValue: (row)=>{
                    var _row_policyName;
                    return String((_row_policyName = row.policyName) !== null && _row_policyName !== void 0 ? _row_policyName : '');
                }
            },
            {
                key: 'settingName',
                label: 'Setting Name',
                width: 30,
                getValue: (row)=>{
                    var _row_settingName;
                    return String((_row_settingName = row.settingName) !== null && _row_settingName !== void 0 ? _row_settingName : '');
                }
            },
            {
                key: 'settingValue',
                label: 'Setting Value',
                width: 25,
                getValue: (row)=>{
                    var _row_settingValue;
                    return String((_row_settingValue = row.settingValue) !== null && _row_settingValue !== void 0 ? _row_settingValue : '');
                }
            },
            {
                key: 'omaUri',
                label: 'OMA-URI',
                width: 30,
                getValue: (row)=>{
                    var _row_omaUri;
                    return String((_row_omaUri = row.omaUri) !== null && _row_omaUri !== void 0 ? _row_omaUri : '');
                }
            },
            {
                key: 'source',
                label: 'Source',
                width: 15,
                getValue: (row)=>{
                    var _row_source;
                    return String((_row_source = row.source) !== null && _row_source !== void 0 ? _row_source : '');
                }
            },
            {
                key: 'platform',
                label: 'Platform',
                width: 12,
                getValue: (row)=>{
                    var _row_platform;
                    return String((_row_platform = row.platform) !== null && _row_platform !== void 0 ? _row_platform : '');
                }
            },
            {
                key: 'status',
                label: 'Status',
                width: 12,
                getValue: (row)=>{
                    var _row_status;
                    return String((_row_status = row.status) !== null && _row_status !== void 0 ? _row_status : 'ok');
                }
            }
        ];
        return {
            data: settings,
            columns: exportColumns,
            filename: 'policy-settings',
            title: 'Policy Settings',
            description: 'Overview of all policy settings',
            stats: [
                {
                    label: 'Total',
                    value: settings.length
                },
                {
                    label: 'Catalog',
                    value: settings.filter((s)=>s.source === 'catalog').length
                },
                {
                    label: 'Device Config',
                    value: settings.filter((s)=>s.source === 'deviceconfig').length
                },
                {
                    label: 'Group Policy',
                    value: settings.filter((s)=>s.source === 'grouppolicy').length
                },
                {
                    label: 'Duplicates',
                    value: settings.filter((s)=>s.status === 'duplicate').length
                },
                {
                    label: 'Conflicts',
                    value: settings.filter((s)=>s.status === 'conflict').length
                }
            ]
        };
    };
    const sourceLabel = {
        catalog: 'Settings Catalog',
        deviceconfig: 'Device Config',
        grouppolicy: 'Group Policy'
    };
    const sourceBadgeClass = {
        catalog: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        deviceconfig: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        grouppolicy: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
    const columns = [
        {
            key: 'policyName',
            label: 'Policy Name',
            width: 260,
            minWidth: 180,
            render: (value, row)=>{
                const src = row.source;
                const status = row.status;
                var _sourceBadgeClass_src, _sourceLabel_src;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-medium text-foreground truncate",
                            children: String(value !== null && value !== void 0 ? value : 'N/A')
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 273,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    className: "text-xs ".concat((_sourceBadgeClass_src = sourceBadgeClass[src]) !== null && _sourceBadgeClass_src !== void 0 ? _sourceBadgeClass_src : ''),
                                    children: (_sourceLabel_src = sourceLabel[src]) !== null && _sourceLabel_src !== void 0 ? _sourceLabel_src : src
                                }, void 0, false, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 275,
                                    columnNumber: 29
                                }, this),
                                status === 'duplicate' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    className: "text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                            className: "h-3 w-3"
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 280,
                                            columnNumber: 37
                                        }, this),
                                        " Duplicate"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 279,
                                    columnNumber: 33
                                }, this),
                                status === 'conflict' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    className: "text-xs bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                            className: "h-3 w-3"
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 285,
                                            columnNumber: 37
                                        }, this),
                                        " Conflict"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 284,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 274,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 272,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'settingName',
            label: 'Setting Name',
            width: 240,
            minWidth: 160,
            render: (value, row)=>{
                const omaUri = row.omaUri;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "font-medium text-foreground",
                            children: String(value !== null && value !== void 0 ? value : '')
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 302,
                            columnNumber: 25
                        }, this),
                        omaUri && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-muted-foreground truncate",
                            title: omaUri,
                            children: omaUri
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 303,
                            columnNumber: 36
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 301,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'settingValue',
            label: 'Setting Value',
            width: 180,
            minWidth: 120,
            render: (value, row)=>{
                const str = String(value !== null && value !== void 0 ? value : '');
                const status = row.status;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm ".concat(status === 'conflict' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'),
                    title: str,
                    children: str.length > 50 ? "".concat(str.slice(0, 50), "…") : str
                }, void 0, false, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 317,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'platform',
            label: 'Platform',
            width: 110,
            minWidth: 90,
            render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-muted-foreground",
                    children: String(value !== null && value !== void 0 ? value : 'N/A')
                }, void 0, false, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 329,
                    columnNumber: 17
                }, this)
        },
        {
            key: 'childSettingInfo',
            label: 'Child Settings',
            width: 160,
            minWidth: 120,
            render: (value, row)=>{
                const children = value;
                var _row__id;
                const rowId = String((_row__id = row._id) !== null && _row__id !== void 0 ? _row__id : '');
                if (!children || children.length === 0) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-muted-foreground",
                        children: "—"
                    }, void 0, false, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 341,
                        columnNumber: 28
                    }, this);
                }
                const searchLower = activeSearch.toLowerCase().trim();
                const matching = searchLower ? children.filter((c)=>c.name.toLowerCase().includes(searchLower) || c.value.toLowerCase().includes(searchLower)) : [];
                const isExpanded = expandedRows.has(rowId) || matching.length > 0;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                toggleRowExpansion(rowId);
                            },
                            className: "flex items-center gap-1 text-xs text-primary hover:underline",
                            children: [
                                isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                    className: "h-3 w-3"
                                }, void 0, false, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 354,
                                    columnNumber: 43
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    className: "h-3 w-3"
                                }, void 0, false, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 354,
                                    columnNumber: 81
                                }, this),
                                children.length,
                                " child settings",
                                matching.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-amber-600 font-semibold",
                                    children: [
                                        "(",
                                        matching.length,
                                        " match)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 356,
                                    columnNumber: 53
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 350,
                            columnNumber: 25
                        }, this),
                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ml-4 space-y-1 border-l-2 border-gray-200 pl-2",
                            children: children.map((c, i)=>{
                                const isMatch = !!(searchLower && (c.name.toLowerCase().includes(searchLower) || c.value.toLowerCase().includes(searchLower)));
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs rounded px-1 ".concat(isMatch ? 'bg-amber-50 dark:bg-amber-900/20' : ''),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-medium ".concat(isMatch ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'),
                                            children: c.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 364,
                                            columnNumber: 45
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-gray-500 truncate",
                                            title: c.value,
                                            children: c.value.length > 30 ? "".concat(c.value.slice(0, 30), "…") : c.value
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 365,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 363,
                                    columnNumber: 41
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 359,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 349,
                    columnNumber: 21
                }, this);
            }
        }
    ];
    const dupCount = settings.filter((s)=>s.status === 'duplicate').length;
    const conflictCount = settings.filter((s)=>s.status === 'conflict').length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 lg:p-8 space-y-6 w-full max-w-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl lg:text-3xl font-bold text-gray-600 dark:text-white",
                                children: "Policy Settings"
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 385,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 dark:text-gray-300 mt-2",
                                children: "View all settings across Settings Catalog, Device Configuration and Group Policy"
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 386,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 384,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: settings.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: fetchSettings,
                                    variant: "outline",
                                    size: "sm",
                                    disabled: loading,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 mr-2 ".concat(loading ? 'animate-spin' : '')
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 394,
                                            columnNumber: 33
                                        }, this),
                                        "Refresh"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 393,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportButton"], {
                                    exportOptions: [
                                        {
                                            label: "Export",
                                            data: prepareExportData(),
                                            formats: [
                                                'csv',
                                                'pdf',
                                                'html'
                                            ]
                                        }
                                    ],
                                    variant: "outline",
                                    size: "sm",
                                    tenantId: ((_instance_getActiveAccount = instance.getActiveAccount()) === null || _instance_getActiveAccount === void 0 ? void 0 : _instance_getActiveAccount.tenantId) || ((_accounts_ = accounts[0]) === null || _accounts_ === void 0 ? void 0 : _accounts_.tenantId) || ''
                                }, void 0, false, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 397,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: fetchSettings,
                                    disabled: loading,
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 ".concat(loading ? 'animate-spin' : '')
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 407,
                                            columnNumber: 33
                                        }, this),
                                        "Load Settings"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 406,
                                    columnNumber: 29
                                }, this),
                                loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>{
                                        cancel();
                                        setSettings([]);
                                        setError(null);
                                        setLoading(false);
                                        setIsCancelled(true);
                                    },
                                    variant: "destructive",
                                    size: "sm",
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/configuration/settings/page.tsx",
                                            lineNumber: 423,
                                            columnNumber: 37
                                        }, this),
                                        "Cancel"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 411,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 390,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 383,
                columnNumber: 13
            }, this),
            settings.length === 0 && !loading && !error && !isCancelled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-400 mb-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                    className: "h-16 w-16 mx-auto"
                                }, void 0, false, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 438,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 437,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-medium text-gray-900 dark:text-white mb-4",
                                children: "Ready to view your policy settings"
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 440,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto",
                                children: 'Click "Load Settings" to fetch all settings across Settings Catalog, Device Configuration and Group Policy.'
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 443,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: fetchSettings,
                                className: "flex items-center gap-2 mx-auto",
                                size: "lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/configuration/settings/page.tsx",
                                        lineNumber: 447,
                                        columnNumber: 33
                                    }, this),
                                    "Load Settings"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 446,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 436,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 435,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 434,
                columnNumber: 17
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-4 space-y-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-muted-foreground",
                                    children: progressLabel
                                }, void 0, false, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 460,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-muted-foreground font-mono",
                                    children: [
                                        completedSteps,
                                        "/",
                                        FETCH_STEPS.length
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 461,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 459,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                            value: progress,
                            className: "h-2"
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 463,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-6",
                            children: FETCH_STEPS.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1 text-xs ".concat(i < completedSteps ? 'text-green-600 dark:text-green-400' : i === completedSteps ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-muted-foreground'),
                                    children: [
                                        i < completedSteps ? '✓' : i === completedSteps ? '⟳' : '○',
                                        " ",
                                        step.label
                                    ]
                                }, step.source, true, {
                                    fileName: "[project]/app/configuration/settings/page.tsx",
                                    lineNumber: 466,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 464,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 458,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 457,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-red-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-4 flex items-center gap-2 text-red-600",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "h-5 w-5"
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 479,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium",
                            children: "Error:"
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 480,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/app/configuration/settings/page.tsx",
                            lineNumber: 481,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/configuration/settings/page.tsx",
                    lineNumber: 478,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 477,
                columnNumber: 17
            }, this),
            isCancelled && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CancelledCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CancelledCard"], {
                onRetry: ()=>{
                    setIsCancelled(false);
                    fetchSettings();
                },
                title: "Loading Cancelled",
                description: "Settings loading was cancelled. Click below to load settings again.",
                buttonText: "Load Settings"
            }, void 0, false, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 488,
                columnNumber: 17
            }, this),
            settings.length > 0 && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-3 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "secondary",
                        children: [
                            settings.length,
                            " total settings"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 499,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                        children: [
                            settings.filter((s)=>s.source === 'catalog').length,
                            " Settings Catalog"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 500,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                        children: [
                            settings.filter((s)=>s.source === 'deviceconfig').length,
                            " Device Config"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 503,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                        children: [
                            settings.filter((s)=>s.source === 'grouppolicy').length,
                            " Group Policy"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 506,
                        columnNumber: 21
                    }, this),
                    dupCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                className: "h-3 w-3"
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 511,
                                columnNumber: 29
                            }, this),
                            " ",
                            dupCount,
                            " duplicate",
                            dupCount !== 1 ? 's' : ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 510,
                        columnNumber: 25
                    }, this),
                    conflictCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "h-3 w-3"
                            }, void 0, false, {
                                fileName: "[project]/app/configuration/settings/page.tsx",
                                lineNumber: 516,
                                columnNumber: 29
                            }, this),
                            " ",
                            conflictCount,
                            " conflict",
                            conflictCount !== 1 ? 's' : ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/configuration/settings/page.tsx",
                        lineNumber: 515,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 498,
                columnNumber: 17
            }, this),
            settings.length > 0 && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                data: settings,
                columns: columns,
                showPagination: true,
                showSearch: true,
                searchPlaceholder: "Search settings, policies, values…",
                onSearchChange: setActiveSearch,
                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10"
            }, void 0, false, {
                fileName: "[project]/app/configuration/settings/page.tsx",
                lineNumber: 524,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/configuration/settings/page.tsx",
        lineNumber: 381,
        columnNumber: 9
    }, this);
}
_s(PolicySettingsPage, "Gw4VfCqmQr+0OFB99q3inIGChBg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"]
    ];
});
_c = PolicySettingsPage;
var _c;
__turbopack_context__.k.register(_c, "PolicySettingsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_92c947db._.js.map