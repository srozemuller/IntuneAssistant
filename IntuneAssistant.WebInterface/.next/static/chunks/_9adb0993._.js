(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
                lineNumber: 86,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/components/DataTable.tsx",
        lineNumber: 70,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
}, "PRIOWs9bezaAbp8UlGmbaZMoYYA="));
_c = TableRow;
TableRow.displayName = 'TableRow';
function DataTableComponent(props) {
    _s1();
    const { data, columns: initialColumns, className: _className = '', onRowClick, currentPage = 1, totalPages: _totalPages = 1, itemsPerPage = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ITEMS_PER_PAGE"], rowClassName, onPageChange, onItemsPerPageChange, showPagination = true, showSearch = true, searchPlaceholder = "Search...", onSelectionChange, selectedRows = [] } = props;
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
                                    lineNumber: 191,
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
                }
            }["DataTableComponent.useEffect.timer"], 300);
            return ({
                "DataTableComponent.useEffect": ()=>clearTimeout(timer)
            })["DataTableComponent.useEffect"];
        }
    }["DataTableComponent.useEffect"], [
        searchTerm
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
                    lineNumber: 440,
                    columnNumber: 20
                }, this);
            }
            return sortConfig.direction === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                className: "h-4 w-4 text-foreground"
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 444,
                columnNumber: 15
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                className: "h-4 w-4 text-foreground"
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 445,
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
                                lineNumber: 561,
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
                                lineNumber: 562,
                                columnNumber: 25
                            }, this),
                            searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearSearch,
                                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 574,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 570,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 560,
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
                                            lineNumber: 583,
                                            columnNumber: 33
                                        }, this),
                                        "Columns"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 582,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 581,
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
                                        lineNumber: 588,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {}, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 589,
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
                                                        lineNumber: 600,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DataTable.tsx",
                                                        lineNumber: 602,
                                                        columnNumber: 49
                                                    }, this),
                                                    column.label
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 598,
                                                columnNumber: 41
                                            }, this)
                                        }, column.key, false, {
                                            fileName: "[project]/components/DataTable.tsx",
                                            lineNumber: 593,
                                            columnNumber: 37
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 587,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 580,
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
                        lineNumber: 612,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 559,
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
                                                            lineNumber: 674,
                                                            columnNumber: 49
                                                        }, this),
                                                        column.sortable !== false && column.key !== '_select' && getSortIcon(column.key)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DataTable.tsx",
                                                    lineNumber: 662,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 661,
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
                                                    lineNumber: 688,
                                                    columnNumber: 49
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 683,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, column.key, true, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 653,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 647,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DataTable.tsx",
                            lineNumber: 646,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "bg-transparent",
                            children: hasData ? paginatedData.map((row, rowIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableRow, {
                                    row: row,
                                    rowIndex: rowIndex,
                                    visibleColumns: visibleColumns,
                                    startIndex: startIndex,
                                    isSelected: isRowSelected(row),
                                    onRowClick: onRowClick ? handleRowClick : undefined,
                                    rowClassName: rowClassName,
                                    getCellValue: getCellValue
                                }, row.id ? "".concat(String(row.id), "-").concat(rowIndex) : rowIndex, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 699,
                                    columnNumber: 33
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: visibleColumns.length,
                                    className: "p-8 text-center text-muted-foreground",
                                    children: searchTerm ? 'No results found for your search.' : 'No data available.'
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 713,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 712,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DataTable.tsx",
                            lineNumber: 696,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DataTable.tsx",
                    lineNumber: 634,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 620,
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
                                lineNumber: 729,
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
                                        lineNumber: 734,
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
                                                lineNumber: 744,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 25,
                                                children: "25"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 745,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 50,
                                                children: "50"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 746,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 100,
                                                children: "100"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 747,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 735,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 733,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 728,
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
                                        lineNumber: 758,
                                        columnNumber: 29
                                    }, this),
                                    "Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 752,
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
                                        lineNumber: 764,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 762,
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
                                        lineNumber: 783,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 776,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 751,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 727,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DataTable.tsx",
        lineNumber: 556,
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
"[project]/components/ui/dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as XIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function Dialog(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "dialog",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Dialog;
function DialogTrigger(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "dialog-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = DialogTrigger;
function DialogPortal(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "dialog-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = DialogPortal;
function DialogClose(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
        "data-slot": "dialog-close",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 30,
        columnNumber: 10
    }, this);
}
_c3 = DialogClose;
function DialogOverlay(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        "data-slot": "dialog-overlay",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50  bg-black/50 backdrop-blur-lg", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c4 = DialogOverlay;
const DialogContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c5 = (param, ref)=>{
    let { className, children, showCloseButton = true, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/components/ui/dialog.tsx",
                lineNumber: 55,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
                ...props,
                children: [
                    children,
                    showCloseButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XIcon$3e$__["XIcon"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/dialog.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/dialog.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/dialog.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/dialog.tsx",
                lineNumber: 56,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 54,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c6 = DialogContent;
DialogContent.displayName = "DialogContent";
function DialogHeader(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 79,
        columnNumber: 5
    }, this);
}
_c7 = DialogHeader;
function DialogFooter(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "dialog-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_c8 = DialogFooter;
function DialogTitle(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        "data-slot": "dialog-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_c9 = DialogTitle;
function DialogDescription(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        "data-slot": "dialog-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/dialog.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_c10 = DialogDescription;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10;
__turbopack_context__.k.register(_c, "Dialog");
__turbopack_context__.k.register(_c1, "DialogTrigger");
__turbopack_context__.k.register(_c2, "DialogPortal");
__turbopack_context__.k.register(_c3, "DialogClose");
__turbopack_context__.k.register(_c4, "DialogOverlay");
__turbopack_context__.k.register(_c5, "DialogContent$React.forwardRef");
__turbopack_context__.k.register(_c6, "DialogContent");
__turbopack_context__.k.register(_c7, "DialogHeader");
__turbopack_context__.k.register(_c8, "DialogFooter");
__turbopack_context__.k.register(_c9, "DialogTitle");
__turbopack_context__.k.register(_c10, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/command.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Command",
    ()=>Command,
    "CommandDialog",
    ()=>CommandDialog,
    "CommandEmpty",
    ()=>CommandEmpty,
    "CommandGroup",
    ()=>CommandGroup,
    "CommandInput",
    ()=>CommandInput,
    "CommandItem",
    ()=>CommandItem,
    "CommandList",
    ()=>CommandList,
    "CommandSeparator",
    ()=>CommandSeparator,
    "CommandShortcut",
    ()=>CommandShortcut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cmdk/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SearchIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as SearchIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function Command(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"], {
        "data-slot": "command",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = Command;
function CommandDialog(param) {
    let { title = "Command Palette", description = "Search for a command to run...", children, className, showCloseButton = true, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                className: "sr-only",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/ui/command.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/ui/command.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/command.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("overflow-hidden p-0", className),
                showCloseButton: showCloseButton,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Command, {
                    className: "[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
                    children: children
                }, void 0, false, {
                    fileName: "[project]/components/ui/command.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/command.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_c1 = CommandDialog;
function CommandInput(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "command-input-wrapper",
        className: "flex h-9 items-center gap-2 border-b px-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SearchIcon$3e$__["SearchIcon"], {
                className: "size-4 shrink-0 opacity-50"
            }, void 0, false, {
                fileName: "[project]/components/ui/command.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Input, {
                "data-slot": "command-input",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className),
                ...props
            }, void 0, false, {
                fileName: "[project]/components/ui/command.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c2 = CommandInput;
function CommandList(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].List, {
        "data-slot": "command-list",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_c3 = CommandList;
function CommandEmpty(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Empty, {
        "data-slot": "command-empty",
        className: "py-6 text-center text-sm",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
_c4 = CommandEmpty;
function CommandGroup(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Group, {
        "data-slot": "command-group",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_c5 = CommandGroup;
function CommandSeparator(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Separator, {
        "data-slot": "command-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-border -mx-1 h-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, this);
}
_c6 = CommandSeparator;
function CommandItem(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cmdk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"].Item, {
        "data-slot": "command-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
_c7 = CommandItem;
function CommandShortcut(param) {
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "data-slot": "command-shortcut",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground ml-auto text-xs tracking-widest", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/command.tsx",
        lineNumber: 163,
        columnNumber: 5
    }, this);
}
_c8 = CommandShortcut;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "Command");
__turbopack_context__.k.register(_c1, "CommandDialog");
__turbopack_context__.k.register(_c2, "CommandInput");
__turbopack_context__.k.register(_c3, "CommandList");
__turbopack_context__.k.register(_c4, "CommandEmpty");
__turbopack_context__.k.register(_c5, "CommandGroup");
__turbopack_context__.k.register(_c6, "CommandSeparator");
__turbopack_context__.k.register(_c7, "CommandItem");
__turbopack_context__.k.register(_c8, "CommandShortcut");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/popover.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Popover",
    ()=>Popover,
    "PopoverAnchor",
    ()=>PopoverAnchor,
    "PopoverContent",
    ()=>PopoverContent,
    "PopoverTrigger",
    ()=>PopoverTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-popover/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Popover(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "popover",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/popover.tsx",
        lineNumber: 11,
        columnNumber: 10
    }, this);
}
_c = Popover;
function PopoverTrigger(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "popover-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/popover.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
_c1 = PopoverTrigger;
function PopoverContent(param) {
    let { className, align = "center", sideOffset = 4, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "popover-content",
            align: align,
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/popover.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/popover.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c2 = PopoverContent;
function PopoverAnchor(param) {
    let { ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Anchor"], {
        "data-slot": "popover-anchor",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/popover.tsx",
        lineNumber: 45,
        columnNumber: 10
    }, this);
}
_c3 = PopoverAnchor;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Popover");
__turbopack_context__.k.register(_c1, "PopoverTrigger");
__turbopack_context__.k.register(_c2, "PopoverContent");
__turbopack_context__.k.register(_c3, "PopoverAnchor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/multi-select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MultiSelect",
    ()=>MultiSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$command$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/command.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/popover.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function MultiSelect(param) {
    let { options, selected, onChange, placeholder = "Select items...", className } = param;
    _s();
    const [open, setOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const handleUnselect = (item)=>{
        onChange(selected.filter((i)=>i !== item));
    };
    const handleSelect = (item)=>{
        if (selected.includes(item)) {
            onChange(selected.filter((i)=>i !== item));
        } else {
            onChange([
                ...selected,
                item
            ]);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popover"], {
        open: open,
        onOpenChange: setOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PopoverTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    role: "combobox",
                    "aria-expanded": open,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full justify-between", className),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-1 flex-wrap",
                            children: [
                                selected.length === 0 && placeholder,
                                selected.map((item)=>{
                                    const option = options.find((opt)=>opt.value === item);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "mr-1 mb-1",
                                        onClick: (e)=>e.stopPropagation(),
                                        children: [
                                            option === null || option === void 0 ? void 0 : option.label,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-destructive/10",
                                                onKeyDown: (e)=>{
                                                    if (e.key === "Enter") {
                                                        handleUnselect(item);
                                                    }
                                                },
                                                onMouseDown: (e)=>{
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                },
                                                onClick: (e)=>{
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleUnselect(item);
                                                },
                                                tabIndex: 0,
                                                role: "button",
                                                "aria-label": "Remove ".concat(option === null || option === void 0 ? void 0 : option.label),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    className: "h-3 w-3 text-gray-500 hover:text-gray-700"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/multi-select.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/ui/multi-select.tsx",
                                                lineNumber: 76,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, item, true, {
                                        fileName: "[project]/components/ui/multi-select.tsx",
                                        lineNumber: 69,
                                        columnNumber: 33
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/multi-select.tsx",
                            lineNumber: 64,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "h-4 w-4 shrink-0 opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/multi-select.tsx",
                            lineNumber: 102,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/multi-select.tsx",
                    lineNumber: 58,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/multi-select.tsx",
                lineNumber: 57,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PopoverContent"], {
                className: "w-full p-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$command$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Command"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$command$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandInput"], {
                            placeholder: "Search..."
                        }, void 0, false, {
                            fileName: "[project]/components/ui/multi-select.tsx",
                            lineNumber: 107,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$command$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandEmpty"], {
                            children: "No item found."
                        }, void 0, false, {
                            fileName: "[project]/components/ui/multi-select.tsx",
                            lineNumber: 108,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$command$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandGroup"], {
                            className: "max-h-64 overflow-auto",
                            children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$command$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandItem"], {
                                    onSelect: ()=>handleSelect(option.value),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/multi-select.tsx",
                                            lineNumber: 115,
                                            columnNumber: 33
                                        }, this),
                                        option.label
                                    ]
                                }, option.value, true, {
                                    fileName: "[project]/components/ui/multi-select.tsx",
                                    lineNumber: 111,
                                    columnNumber: 29
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/ui/multi-select.tsx",
                            lineNumber: 109,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/multi-select.tsx",
                    lineNumber: 106,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/multi-select.tsx",
                lineNumber: 105,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/multi-select.tsx",
        lineNumber: 56,
        columnNumber: 9
    }, this);
}
_s(MultiSelect, "xG1TONbKtDWtdOTrXaTAsNhPg/Q=");
_c = MultiSelect;
var _c;
__turbopack_context__.k.register(_c, "MultiSelect");
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
"[project]/hooks/useGroupDetails.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGroupDetails",
    ()=>useGroupDetails
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/hooks/useMsal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useApiRequest.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
const useGroupDetails = ()=>{
    _s();
    const { instance, accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const [selectedGroup, setSelectedGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [groupLoading, setGroupLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [groupError, setGroupError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isDialogOpen, setIsDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { request } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"])();
    const [showConsentDialog, setShowConsentDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [consentUrl, setConsentUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const handleConsentCheck = (response)=>{
        if (response.status === 'Error' && response.message === 'User challenge required' && typeof response.data === 'object' && response.data !== null && 'url' in response.data) {
            setConsentUrl(response.data.url);
            setShowConsentDialog(true);
            setGroupLoading(false);
            return true;
        }
        return false;
    };
    const fetchGroupDetails = async (resourceId)=>{
        if (!accounts.length) return;
        // Open dialog immediately with loading state
        setSelectedGroup({
            id: resourceId,
            displayName: 'Loading...',
            description: null,
            membershipRule: null,
            createdDateTime: '',
            groupCount: null,
            members: null
        });
        setIsDialogOpen(true);
        setGroupLoading(true);
        setGroupError(null);
        try {
            const [groupData, membersArray] = await Promise.all([
                request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GROUPS_ENDPOINT"], "?groupId=").concat(resourceId), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }),
                request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GROUPS_ENDPOINT"], "/").concat(resourceId, "/members"), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ]);
            // Check for consent requirements
            if (handleConsentCheck(groupData) || handleConsentCheck(membersArray)) {
                return;
            }
            if (!groupData || !membersArray) {
                throw new Error('Failed to fetch group data or members');
            }
            // Extract group details from the API response structure
            const group = groupData.data;
            // Process members data
            const processedMembers = membersArray.map((member)=>{
                var _member_odatatype, _member_odatatype1;
                return {
                    id: member.id || '',
                    displayName: member.displayName || member.userPrincipalName || 'Unknown',
                    type: member.type || (((_member_odatatype = member['@odata.type']) === null || _member_odatatype === void 0 ? void 0 : _member_odatatype.includes('.user')) ? 'User' : ((_member_odatatype1 = member['@odata.type']) === null || _member_odatatype1 === void 0 ? void 0 : _member_odatatype1.includes('.group')) ? 'Group' : 'Device'),
                    accountEnabled: member.accountEnabled !== undefined ? member.accountEnabled : true,
                    userPrincipalName: member.userPrincipalName || null
                };
            });
            // Merge group details with members
            const groupWithMembers = {
                id: group.id,
                displayName: group.displayName,
                description: group.description,
                membershipRule: group.membershipRule,
                createdDateTime: group.createdDateTime,
                groupCount: group.groupCount,
                members: processedMembers
            };
            setSelectedGroup(groupWithMembers);
        } catch (error) {
            console.error('Failed to fetch group details:', error);
            setGroupError(error instanceof Error ? error.message : 'Failed to fetch group details');
        } finally{
            setGroupLoading(false);
        }
    };
    const handleConsentComplete = ()=>{
        setShowConsentDialog(false);
        setConsentUrl('');
    // Optionally retry fetching the group details
    };
    const closeDialog = ()=>{
        setIsDialogOpen(false);
        setSelectedGroup(null);
        setGroupError(null);
    };
    return {
        selectedGroup,
        groupLoading,
        groupError,
        isDialogOpen,
        showConsentDialog,
        consentUrl,
        fetchGroupDetails,
        closeDialog,
        handleConsentComplete
    };
};
_s(useGroupDetails, "xV4AtFT3abD6HlOtcu3CUdC9cik=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GroupDetailsDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GroupDetailsDialog",
    ()=>GroupDetailsDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DataTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useGroupDetails$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useGroupDetails.ts [app-client] (ecmascript)");
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
const groupMemberColumns = [
    {
        key: 'displayName',
        label: 'Display Name',
        render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-medium",
                children: String(value)
            }, void 0, false, {
                fileName: "[project]/components/GroupDetailsDialog.tsx",
                lineNumber: 21,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
    },
    {
        key: 'type',
        label: 'Type',
        render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                variant: "outline",
                className: "text-xs",
                children: String(value)
            }, void 0, false, {
                fileName: "[project]/components/GroupDetailsDialog.tsx",
                lineNumber: 28,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
    },
    {
        key: 'accountEnabled',
        label: 'Account Status',
        render: (value, row)=>{
            const type = String(row.type).toLowerCase();
            if (type === 'group') {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-gray-500 dark:text-gray-400",
                    children: "N/A"
                }, void 0, false, {
                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                    lineNumber: 40,
                    columnNumber: 24
                }, ("TURBOPACK compile-time value", void 0));
            }
            const isEnabled = Boolean(value);
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                variant: isEnabled ? 'default' : 'secondary',
                className: isEnabled ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700' : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
                children: isEnabled ? 'Enabled' : 'Disabled'
            }, void 0, false, {
                fileName: "[project]/components/GroupDetailsDialog.tsx",
                lineNumber: 45,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0));
        }
    },
    {
        key: 'id',
        label: 'ID',
        render: (value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-mono text-xs text-gray-500 dark:text-gray-400",
                children: String(value)
            }, void 0, false, {
                fileName: "[project]/components/GroupDetailsDialog.tsx",
                lineNumber: 56,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
    }
];
function GroupDetailsDialog(param) {
    let { groupId, isOpen, onClose } = param;
    _s();
    const [scrollPosition, setScrollPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupDetailsDialog.useEffect": ()=>{
            if (isOpen && "object" !== 'undefined') {
                setScrollPosition(window.scrollY);
            }
        }
    }["GroupDetailsDialog.useEffect"], [
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupDetailsDialog.useEffect": ()=>{
            if (isOpen) {
                const handleScroll = {
                    "GroupDetailsDialog.useEffect.handleScroll": ()=>{
                        const dialog = document.querySelector('[role="dialog"]');
                        if (dialog) {
                            const scrollY = window.scrollY;
                            const viewportHeight = window.innerHeight;
                            dialog.style.position = 'fixed';
                            dialog.style.top = "".concat(viewportHeight / 2, "px");
                            dialog.style.left = '50%';
                            dialog.style.transform = 'translate(-50%, -50%)';
                        }
                    }
                }["GroupDetailsDialog.useEffect.handleScroll"];
                handleScroll();
                window.addEventListener('scroll', handleScroll, true);
                return ({
                    "GroupDetailsDialog.useEffect": ()=>{
                        window.removeEventListener('scroll', handleScroll, true);
                    }
                })["GroupDetailsDialog.useEffect"];
            }
        }
    }["GroupDetailsDialog.useEffect"], [
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupDetailsDialog.useEffect": ()=>{
            if (isOpen) {
                const mainContent = document.querySelector('main');
                const sidebar = document.querySelector('[class*="sidebar"]');
                if (mainContent) {
                    mainContent.style.filter = 'blur(8px)';
                    mainContent.style.transition = 'filter 0.2s';
                }
                return ({
                    "GroupDetailsDialog.useEffect": ()=>{
                        if (mainContent) {
                            mainContent.style.filter = '';
                        }
                    }
                })["GroupDetailsDialog.useEffect"];
            }
        }
    }["GroupDetailsDialog.useEffect"], [
        isOpen
    ]);
    const { selectedGroup, groupLoading, groupError, fetchGroupDetails } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useGroupDetails$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupDetails"])();
    const lastFetchedGroupId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupDetailsDialog.useEffect": ()=>{
            if (isOpen && groupId && groupId !== lastFetchedGroupId.current) {
                lastFetchedGroupId.current = groupId;
                fetchGroupDetails(groupId);
            }
        }
    }["GroupDetailsDialog.useEffect"], [
        isOpen,
        groupId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GroupDetailsDialog.useEffect": ()=>{
            if (!isOpen) {
                lastFetchedGroupId.current = null;
            }
        }
    }["GroupDetailsDialog.useEffect"], [
        isOpen
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: isOpen,
        onOpenChange: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "max-w-[1400px] max-h-[80vh] overflow-y-auto absolute left-1/2 -translate-x-1/2",
            style: {
                top: "".concat(scrollPosition + 450, "px"),
                position: 'absolute'
            },
            onOpenAutoFocus: (e)=>e.preventDefault(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 145,
                                    columnNumber: 25
                                }, this),
                                (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.displayName) || 'Group Details'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 144,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            children: (selectedGroup === null || selectedGroup === void 0 ? void 0 : selectedGroup.description) || 'Group information and members'
                        }, void 0, false, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 148,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                    lineNumber: 143,
                    columnNumber: 17
                }, this),
                groupLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center h-64",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                className: "h-5 w-5 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                lineNumber: 156,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Loading group details..."
                            }, void 0, false, {
                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                lineNumber: 157,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/GroupDetailsDialog.tsx",
                        lineNumber: 155,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                    lineNumber: 154,
                    columnNumber: 21
                }, this) : groupError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-md border dark:border-red-800",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium",
                            children: "Error:"
                        }, void 0, false, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 162,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: groupError
                        }, void 0, false, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 163,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                    lineNumber: 161,
                    columnNumber: 21
                }, this) : selectedGroup ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                            children: "Group ID"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                                            lineNumber: 170,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-sm text-gray-900 dark:text-gray-100",
                                            children: selectedGroup.id
                                        }, void 0, false, {
                                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                                            lineNumber: 171,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 169,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                            children: "Created"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                                            lineNumber: 174,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-900 dark:text-gray-100",
                                            children: selectedGroup.createdDateTime ? new Date(selectedGroup.createdDateTime).toLocaleDateString() : 'N/A'
                                        }, void 0, false, {
                                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                                            lineNumber: 175,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 173,
                                    columnNumber: 29
                                }, this),
                                selectedGroup.membershipRule && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "md:col-span-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                            children: "Membership Rule"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                                            lineNumber: 179,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-gray-900 dark:text-gray-100 border dark:border-gray-600",
                                            children: selectedGroup.membershipRule
                                        }, void 0, false, {
                                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                                            lineNumber: 180,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 178,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 168,
                            columnNumber: 25
                        }, this),
                        selectedGroup.groupCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-3 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "pt-6 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-blue-600 dark:text-blue-400",
                                                children: selectedGroup.groupCount.userCount
                                            }, void 0, false, {
                                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                                lineNumber: 190,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600 dark:text-gray-400",
                                                children: "Users"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                                lineNumber: 191,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GroupDetailsDialog.tsx",
                                        lineNumber: 189,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 188,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "pt-6 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-green-600 dark:text-green-400",
                                                children: selectedGroup.groupCount.deviceCount
                                            }, void 0, false, {
                                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                                lineNumber: 196,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600 dark:text-gray-400",
                                                children: "Devices"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                                lineNumber: 197,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GroupDetailsDialog.tsx",
                                        lineNumber: 195,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 194,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "pt-6 text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-purple-600 dark:text-purple-400",
                                                children: selectedGroup.groupCount.groupCount
                                            }, void 0, false, {
                                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                                lineNumber: 202,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-600 dark:text-gray-400",
                                                children: "Groups"
                                            }, void 0, false, {
                                                fileName: "[project]/components/GroupDetailsDialog.tsx",
                                                lineNumber: 203,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/GroupDetailsDialog.tsx",
                                        lineNumber: 201,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 200,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 187,
                            columnNumber: 29
                        }, this),
                        selectedGroup.members && selectedGroup.members.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-lg font-medium mb-4 text-gray-900 dark:text-gray-100",
                                    children: "Group Members"
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 212,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                                    data: selectedGroup.members,
                                    columns: groupMemberColumns
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 213,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 211,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-8 text-gray-500 dark:text-gray-400",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    className: "h-12 w-12 mx-auto mb-4 opacity-50"
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 220,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "No members found or unable to load member details."
                                }, void 0, false, {
                                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                                    lineNumber: 221,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GroupDetailsDialog.tsx",
                            lineNumber: 219,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GroupDetailsDialog.tsx",
                    lineNumber: 166,
                    columnNumber: 21
                }, this) : null
            ]
        }, void 0, true, {
            fileName: "[project]/components/GroupDetailsDialog.tsx",
            lineNumber: 135,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/GroupDetailsDialog.tsx",
        lineNumber: 134,
        columnNumber: 9
    }, this);
}
_s(GroupDetailsDialog, "X1mQYfdfP/23unOL/sAeRtHb+jE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useGroupDetails$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupDetails"]
    ];
});
_c = GroupDetailsDialog;
var _c;
__turbopack_context__.k.register(_c, "GroupDetailsDialog");
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
"[project]/components/FilterDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FilterDetailsDialog",
    ()=>FilterDetailsDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$computer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Computer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/computer.js [app-client] (ecmascript) <export default as Computer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/blocks.js [app-client] (ecmascript) <export default as Blocks>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function FilterDetailsDialog(param) {
    let { filter, isOpen, onClose } = param;
    _s();
    const [scrollPosition, setScrollPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FilterDetailsDialog.useEffect": ()=>{
            if (isOpen && "object" !== 'undefined') {
                setScrollPosition(window.scrollY);
            }
        }
    }["FilterDetailsDialog.useEffect"], [
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FilterDetailsDialog.useEffect": ()=>{
            if (isOpen) {
                const handleScroll = {
                    "FilterDetailsDialog.useEffect.handleScroll": ()=>{
                        const dialog = document.querySelector('[role="dialog"]');
                        if (dialog) {
                            const scrollY = window.scrollY;
                            const viewportHeight = window.innerHeight;
                            dialog.style.position = 'fixed';
                            dialog.style.top = "".concat(viewportHeight / 2, "px");
                            dialog.style.left = '50%';
                            dialog.style.transform = 'translate(-50%, -50%)';
                        }
                    }
                }["FilterDetailsDialog.useEffect.handleScroll"];
                handleScroll();
                window.addEventListener('scroll', handleScroll, true);
                return ({
                    "FilterDetailsDialog.useEffect": ()=>{
                        window.removeEventListener('scroll', handleScroll, true);
                    }
                })["FilterDetailsDialog.useEffect"];
            }
        }
    }["FilterDetailsDialog.useEffect"], [
        isOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FilterDetailsDialog.useEffect": ()=>{
            if (isOpen) {
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.style.filter = 'blur(8px)';
                    mainContent.style.transition = 'filter 0.2s';
                }
                return ({
                    "FilterDetailsDialog.useEffect": ()=>{
                        if (mainContent) {
                            mainContent.style.filter = '';
                        }
                    }
                })["FilterDetailsDialog.useEffect"];
            }
        }
    }["FilterDetailsDialog.useEffect"], [
        isOpen
    ]);
    const getManagementTypeBadge = (managementType)=>{
        const isDevices = (managementType === null || managementType === void 0 ? void 0 : managementType.toLowerCase()) === 'devices';
        return isDevices ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
            variant: "default",
            className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$computer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Computer$3e$__["Computer"], {
                    className: "h-3 w-3 mr-1"
                }, void 0, false, {
                    fileName: "[project]/components/FilterDialog.tsx",
                    lineNumber: 68,
                    columnNumber: 17
                }, this),
                "Devices"
            ]
        }, void 0, true, {
            fileName: "[project]/components/FilterDialog.tsx",
            lineNumber: 67,
            columnNumber: 13
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
            variant: "default",
            className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__["Blocks"], {
                    className: "h-3 w-3 mr-1"
                }, void 0, false, {
                    fileName: "[project]/components/FilterDialog.tsx",
                    lineNumber: 73,
                    columnNumber: 17
                }, this),
                managementType || 'Apps'
            ]
        }, void 0, true, {
            fileName: "[project]/components/FilterDialog.tsx",
            lineNumber: 72,
            columnNumber: 13
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: isOpen,
        onOpenChange: onClose,
        modal: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "max-w-[1400px] max-h-[80vh] overflow-y-auto absolute left-1/2 -translate-x-1/2",
            style: {
                top: "".concat(scrollPosition + 450, "px"),
                position: 'absolute'
            },
            onOpenAutoFocus: (e)=>e.preventDefault(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 91,
                                    columnNumber: 25
                                }, this),
                                (filter === null || filter === void 0 ? void 0 : filter.displayName) || 'Filter Details'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FilterDialog.tsx",
                            lineNumber: 90,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            className: "text-gray-600 dark:text-gray-300",
                            children: (filter === null || filter === void 0 ? void 0 : filter.description) || 'Assignment filter information and rules'
                        }, void 0, false, {
                            fileName: "[project]/components/FilterDialog.tsx",
                            lineNumber: 94,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/FilterDialog.tsx",
                    lineNumber: 89,
                    columnNumber: 17
                }, this),
                filter ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                            children: "Filter ID"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 103,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-sm break-all text-gray-900 dark:text-gray-100",
                                            children: filter.id
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 104,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 102,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                            children: "Management Type"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 107,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: getManagementTypeBadge(filter.assignmentFilterManagementType)
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 108,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 106,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                            children: "Platform"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 113,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-900 dark:text-gray-100",
                                            children: filter.platform || 'All'
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 114,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 112,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FilterDialog.tsx",
                            lineNumber: 101,
                            columnNumber: 25
                        }, this),
                        filter.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2",
                                    children: "Description"
                                }, void 0, false, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 122,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "whitespace-pre-wrap break-all",
                                        children: filter.description
                                    }, void 0, false, {
                                        fileName: "[project]/components/FilterDialog.tsx",
                                        lineNumber: 124,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 123,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FilterDialog.tsx",
                            lineNumber: 121,
                            columnNumber: 29
                        }, this),
                        filter.rule && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2",
                                    children: "Filter Rule"
                                }, void 0, false, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 133,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "whitespace-pre-wrap break-all",
                                        children: filter.rule
                                    }, void 0, false, {
                                        fileName: "[project]/components/FilterDialog.tsx",
                                        lineNumber: 135,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 134,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FilterDialog.tsx",
                            lineNumber: 132,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                                    children: "Created"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FilterDialog.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-900 dark:text-gray-100",
                                                    children: new Date(filter.createdDateTime).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FilterDialog.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 142,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-gray-600 dark:text-gray-300",
                                                    children: "Last Modified"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FilterDialog.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-900 dark:text-gray-100",
                                                    children: new Date(filter.lastModifiedDateTime).toLocaleString()
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FilterDialog.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 148,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 141,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2",
                                            children: "Role Scope Tags"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 157,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: filter.roleScopeTags && filter.roleScopeTags.length > 0 ? filter.roleScopeTags.map((tag, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: tag
                                                }, index, false, {
                                                    fileName: "[project]/components/FilterDialog.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 45
                                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-gray-500 dark:text-gray-400",
                                                children: "No role scope tags"
                                            }, void 0, false, {
                                                fileName: "[project]/components/FilterDialog.tsx",
                                                lineNumber: 166,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/FilterDialog.tsx",
                                            lineNumber: 158,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FilterDialog.tsx",
                                    lineNumber: 156,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FilterDialog.tsx",
                            lineNumber: 140,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/FilterDialog.tsx",
                    lineNumber: 100,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 dark:text-gray-400",
                        children: "Filter not found"
                    }, void 0, false, {
                        fileName: "[project]/components/FilterDialog.tsx",
                        lineNumber: 174,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/FilterDialog.tsx",
                    lineNumber: 173,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/FilterDialog.tsx",
            lineNumber: 81,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/FilterDialog.tsx",
        lineNumber: 80,
        columnNumber: 9
    }, this);
}
_s(FilterDetailsDialog, "dsxX1dOu8Yhy1nZDP7IKtnemq1w=");
_c = FilterDetailsDialog;
var _c;
__turbopack_context__.k.register(_c, "FilterDetailsDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AssignmentsTableSkeleton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// components/AssignmentsTableSkeleton.tsx
__turbopack_context__.s([
    "AssignmentsTableSkeleton",
    ()=>AssignmentsTableSkeleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
'use client';
;
;
function AssignmentsTableSkeleton(param) {
    let { showStats = true, statsCount = 4, showFilters = true, tableRows = 10, tableColumns = 8 } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6 animate-pulse",
        children: [
            showStats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-".concat(Math.min(statsCount, 4), " gap-4"),
                children: [
                    ...Array(statsCount)
                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "bg-white dark:bg-gray-800",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"
                                            }, void 0, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 32,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"
                                            }, void 0, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 33,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                        lineNumber: 31,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                        lineNumber: 35,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                lineNumber: 30,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                            lineNumber: 29,
                            columnNumber: 29
                        }, this)
                    }, i, false, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 28,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                lineNumber: 26,
                columnNumber: 17
            }, this),
            showFilters && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "bg-white dark:bg-gray-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 49,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 50,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                    lineNumber: 48,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"
                                }, void 0, false, {
                                    fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                    lineNumber: 52,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                            lineNumber: 47,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 46,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4",
                            children: [
                                ...Array(4)
                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 59,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-10 bg-gray-200 dark:bg-gray-700 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 60,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                    lineNumber: 58,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                            lineNumber: 56,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 55,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                lineNumber: 45,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-10 bg-gray-200 dark:bg-gray-700 rounded"
                        }, void 0, false, {
                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                            lineNumber: 71,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 70,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"
                    }, void 0, false, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 73,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                lineNumber: 69,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "bg-white dark:bg-gray-800",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 81,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 82,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                    lineNumber: 80,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 85,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 86,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                    lineNumber: 84,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                            lineNumber: 79,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 78,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-".concat(tableColumns, " gap-4 pb-3 border-b border-gray-200 dark:border-gray-700"),
                                        children: [
                                            ...Array(tableColumns)
                                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 bg-gray-200 dark:bg-gray-700 rounded"
                                            }, i, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 95,
                                                columnNumber: 33
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                        lineNumber: 93,
                                        columnNumber: 25
                                    }, this),
                                    [
                                        ...Array(tableRows)
                                    ].map((_, rowIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-".concat(tableColumns, " gap-4 py-3 border-b border-gray-100 dark:border-gray-800"),
                                            children: [
                                                ...Array(tableColumns)
                                            ].map((_, colIndex)=>{
                                                // Vary the widths for more realistic look
                                                const widths = [
                                                    'w-32',
                                                    'w-40',
                                                    'w-24',
                                                    'w-28',
                                                    'w-20',
                                                    'w-36',
                                                    'w-16',
                                                    'w-24'
                                                ];
                                                const width = widths[colIndex % widths.length];
                                                // First column - make it look like a resource name
                                                if (colIndex === 0) {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-4 bg-gray-200 dark:bg-gray-700 rounded ".concat(width)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                                lineNumber: 111,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                                lineNumber: 112,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, colIndex, true, {
                                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 45
                                                    }, this);
                                                }
                                                // Some columns as badges
                                                if (colIndex === 1 || colIndex === 3 || colIndex === 4) {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                            lineNumber: 121,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, colIndex, false, {
                                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 45
                                                    }, this);
                                                }
                                                // Regular cells
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-4 bg-gray-200 dark:bg-gray-700 rounded ".concat(width)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                        lineNumber: 129,
                                                        columnNumber: 45
                                                    }, this)
                                                }, colIndex, false, {
                                                    fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                    lineNumber: 128,
                                                    columnNumber: 41
                                                }, this);
                                            })
                                        }, rowIndex, false, {
                                            fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                            lineNumber: 101,
                                            columnNumber: 29
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                lineNumber: 91,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                        lineNumber: 139,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"
                                            }, void 0, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 141,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 142,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"
                                            }, void 0, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 143,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"
                                            }, void 0, false, {
                                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                                lineNumber: 144,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                        lineNumber: 140,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                                lineNumber: 138,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                        lineNumber: 90,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
                lineNumber: 77,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AssignmentsTableSkeleton.tsx",
        lineNumber: 23,
        columnNumber: 9
    }, this);
}
_c = AssignmentsTableSkeleton;
var _c;
__turbopack_context__.k.register(_c, "AssignmentsTableSkeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/assistant/group-assignments/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AssignmentsOverview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/hooks/useMsal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DataTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/funnel.js [app-client] (ecmascript) <export default as Filter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$group$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Group$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/group.js [app-client] (ecmascript) <export default as Group>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/blocks.js [app-client] (ecmascript) <export default as Blocks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$multi$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/multi-select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ExportButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GroupDetailsDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GroupDetailsDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useApiRequest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CancelledCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CancelledCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FilterDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FilterDialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AssignmentsTableSkeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AssignmentsTableSkeleton.tsx [app-client] (ecmascript)");
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
;
;
;
function AssignmentsOverview() {
    var _instance_getActiveAccount, _accounts_;
    _s();
    const { instance, accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const [showConsentDialog, setShowConsentDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [consentUrl, setConsentUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const { request, cancel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"])();
    const [isCancelled, setIsCancelled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [assignments, setAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [groupLoading, setGroupLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [groupError, setGroupError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedGroup, setSelectedGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filterTypeFilter, setFilterTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [groupSearchResults, setGroupSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [groupSearchInput, setGroupSearchInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchedGroup, setSearchedGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [groupSearchLoading, setGroupSearchLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [groupSearchError, setGroupSearchError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [groupResultsSearch, setGroupResultsSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const isValidGuid = (str)=>{
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(str);
    };
    // Group details dialog states
    const [selectedGroupId, setSelectedGroupId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Filter dialog states
    const [isFilterDialogOpen, setIsFilterDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFilter, setSelectedFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filterLoading, setFilterLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [filterError, setFilterError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Filter states
    const [assignmentTypeFilter, setAssignmentTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [resourceTypeFilter, setResourceTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [platformFilter, setPlatformFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [filterIdFilter, setFilterIdFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isFiltersExpanded, setIsFiltersExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [itemsPerPage, setItemsPerPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ITEMS_PER_PAGE"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AssignmentsOverview.useEffect": ()=>{
            setCurrentPage(1);
        }
    }["AssignmentsOverview.useEffect"], [
        assignmentTypeFilter,
        statusFilter,
        platformFilter,
        searchQuery,
        resourceTypeFilter,
        filterTypeFilter
    ]);
    const filteredGroupResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[filteredGroupResults]": ()=>{
            if (!groupResultsSearch.trim()) return groupSearchResults;
            const search = groupResultsSearch.toLowerCase();
            return groupSearchResults.filter({
                "AssignmentsOverview.useMemo[filteredGroupResults]": (group)=>{
                    var _group_description;
                    return group.displayName.toLowerCase().includes(search) || ((_group_description = group.description) === null || _group_description === void 0 ? void 0 : _group_description.toLowerCase().includes(search)) || group.id.toLowerCase().includes(search);
                }
            }["AssignmentsOverview.useMemo[filteredGroupResults]"]);
        }
    }["AssignmentsOverview.useMemo[filteredGroupResults]"], [
        groupSearchResults,
        groupResultsSearch
    ]);
    const handleConsentCheck = (response)=>{
        if (response.status === 'Error' && response.message === 'User challenge required' && typeof response.data === 'object' && response.data !== null && 'url' in response.data) {
            setConsentUrl(response.data.url);
            setShowConsentDialog(true);
            setGroupSearchLoading(false);
            return true;
        }
        return false;
    };
    const searchGroup = async ()=>{
        if (!accounts.length || !groupSearchInput.trim()) return;
        setGroupSearchLoading(true);
        setGroupSearchError(null);
        setSearchedGroup(null);
        setGroupSearchResults([]);
        try {
            const queryParam = isValidGuid(groupSearchInput.trim()) ? "groupId=".concat(groupSearchInput.trim()) : "search=".concat(encodeURIComponent(groupSearchInput.trim()));
            const responseData = await request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GROUPS_ENDPOINT"], "?").concat(queryParam), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // Check if response exists
            if (!responseData) {
                throw new Error('No response received from API');
            }
            // Unwrap ApiResponseWithCorrelation: responseData.data is the GroupApiResponse envelope
            const envelope = responseData.data;
            // Check for consent requirements
            if (handleConsentCheck(envelope)) {
                return;
            }
            const groupData = envelope.data;
            if (Array.isArray(groupData)) {
                if (groupData.length > 0) {
                    // Multiple groups found - show selection
                    setGroupSearchResults(groupData);
                } else {
                    // No groups found - show message
                    setGroupSearchError('No groups found matching "'.concat(groupSearchInput.trim(), '"'));
                }
            } else if (groupData) {
                // Single group found - set as selected
                setSearchedGroup(groupData);
            } else {
                setGroupSearchError('No groups found matching "'.concat(groupSearchInput.trim(), '"'));
            }
        } catch (error) {
            console.error('Failed to search groups:', error);
            setGroupSearchError(error instanceof Error ? error.message : 'Failed to search groups');
        } finally{
            setGroupSearchLoading(false);
        }
    };
    const fetchGroupAssignments = async (groupId)=>{
        if (!accounts.length) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch both group assignments and filters in parallel
            const [assignmentsData, filtersData] = await Promise.all([
                request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_ENDPOINT"], "/groups/").concat(groupId), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }),
                request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_FILTERS_ENDPOINT"], {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            ]);
            // Check if assignments response exists
            if (!assignmentsData) {
                throw new Error('No response received from assignments API');
            }
            // Unwrap ApiResponseWithCorrelation for filters
            if (!filtersData) {
                console.warn('No response received from filters API, continuing with assignments only');
                setFilters([]);
            } else if (Array.isArray(filtersData.data.data)) {
                setFilters(filtersData.data.data);
            }
            // Unwrap ApiResponseWithCorrelation: assignmentsData.data is the ApiResponse envelope
            const assignmentsEnvelope = assignmentsData.data;
            if (assignmentsEnvelope.status === 'Success' && assignmentsEnvelope.data) {
                const assignments = assignmentsEnvelope.data;
                if (Array.isArray(assignments)) {
                    setAssignments(assignments);
                } else {
                    console.error('API response data is not an array:', assignments);
                    setAssignments([]);
                    throw new Error('Invalid data format received from API');
                }
            } else {
                throw new Error(assignmentsEnvelope.message || 'Failed to fetch group assignments');
            }
        } catch (error) {
            console.error('Failed to fetch group assignments:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch group assignments');
        } finally{
            setLoading(false);
        }
    };
    const getFilterInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentsOverview.useCallback[getFilterInfo]": (filterId, filterType)=>{
            var _filter_assignmentFilterManagementType;
            if (!filterId || filterId === 'None' || filterType === 'None') {
                return {
                    displayName: 'None',
                    managementType: null,
                    platform: null
                };
            }
            const filter = filters.find({
                "AssignmentsOverview.useCallback[getFilterInfo].filter": (f)=>f.id === filterId
            }["AssignmentsOverview.useCallback[getFilterInfo].filter"]);
            return {
                displayName: (filter === null || filter === void 0 ? void 0 : filter.displayName) || 'Unknown Filter',
                managementType: (filter === null || filter === void 0 ? void 0 : (_filter_assignmentFilterManagementType = filter.assignmentFilterManagementType) === null || _filter_assignmentFilterManagementType === void 0 ? void 0 : _filter_assignmentFilterManagementType.toLowerCase()) || null,
                platform: (filter === null || filter === void 0 ? void 0 : filter.platform) || null
            };
        }
    }["AssignmentsOverview.useCallback[getFilterInfo]"], [
        filters
    ]);
    // Derived filtered assignments — replaces the setFilteredAssignments useEffect
    const filteredAssignments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[filteredAssignments]": ()=>{
            let filtered = assignments;
            if (resourceTypeFilter.length > 0) {
                filtered = filtered.filter({
                    "AssignmentsOverview.useMemo[filteredAssignments]": (assignment)=>resourceTypeFilter.includes(assignment.resourceType)
                }["AssignmentsOverview.useMemo[filteredAssignments]"]);
            }
            if (assignmentTypeFilter.length > 0) {
                filtered = filtered.filter({
                    "AssignmentsOverview.useMemo[filteredAssignments]": (assignment)=>{
                        if (assignmentTypeFilter.includes('Not Assigned')) {
                            return !assignment.isAssigned || assignmentTypeFilter.includes(assignment.assignmentType);
                        }
                        return assignment.isAssigned && assignmentTypeFilter.includes(assignment.assignmentType);
                    }
                }["AssignmentsOverview.useMemo[filteredAssignments]"]);
            }
            if (statusFilter.length > 0) {
                filtered = filtered.filter({
                    "AssignmentsOverview.useMemo[filteredAssignments]": (assignment)=>{
                        if (statusFilter.includes('Assigned') && statusFilter.includes('Not Assigned')) {
                            return true;
                        }
                        if (statusFilter.includes('Assigned')) return assignment.isAssigned;
                        if (statusFilter.includes('Not Assigned')) return !assignment.isAssigned;
                        return false;
                    }
                }["AssignmentsOverview.useMemo[filteredAssignments]"]);
            }
            if (platformFilter.length > 0) {
                filtered = filtered.filter({
                    "AssignmentsOverview.useMemo[filteredAssignments]": (assignment)=>{
                        const platform = assignment.platform || 'All';
                        return platformFilter.includes(platform);
                    }
                }["AssignmentsOverview.useMemo[filteredAssignments]"]);
            }
            if (filterTypeFilter.length > 0) {
                filtered = filtered.filter({
                    "AssignmentsOverview.useMemo[filteredAssignments]": (assignment)=>{
                        const filterType = assignment.filterType;
                        if (filterTypeFilter.includes('None') && (!filterType || filterType === 'None')) return true;
                        if (filterTypeFilter.includes('include') && filterType === 'Include') return true;
                        if (filterTypeFilter.includes('exclude') && filterType === 'Exclude') return true;
                        return false;
                    }
                }["AssignmentsOverview.useMemo[filteredAssignments]"]);
            }
            return filtered;
        }
    }["AssignmentsOverview.useMemo[filteredAssignments]"], [
        assignments,
        resourceTypeFilter,
        assignmentTypeFilter,
        statusFilter,
        platformFilter,
        filterTypeFilter
    ]);
    const fetchAssignments = async ()=>{
        if (!accounts.length) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch both assignments and filters
            await Promise.all([
                fetchAssignmentsData(),
                fetchFilters()
            ]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally{
            setLoading(false);
        }
    };
    const rolloutExportData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[rolloutExportData]": ()=>{
            const exportColumns = [
                {
                    key: 'resourceName',
                    label: 'PolicyName',
                    width: 30,
                    getValue: {
                        "AssignmentsOverview.useMemo[rolloutExportData]": (row)=>String(row.resourceName || 'N/A')
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]
                },
                {
                    key: 'targetName',
                    label: 'GroupName',
                    width: 30,
                    getValue: {
                        "AssignmentsOverview.useMemo[rolloutExportData]": (row)=>String(row.targetName || 'N/A')
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]
                },
                {
                    key: 'assignmentType',
                    label: 'AssignmentDirection',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[rolloutExportData]": (row)=>String(row.assignmentDirection || '')
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]
                },
                {
                    key: '',
                    label: 'AssignmentAction',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[rolloutExportData]": ()=>String('Add') // or whatever default action you want
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]
                },
                {
                    key: 'filterId',
                    label: 'Filter',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[rolloutExportData]": (row)=>{
                            const filterId = row.filterId;
                            if (!filterId || filterId === 'None') return 'None';
                            const filterInfo = getFilterInfo(filterId, String(row.filterType));
                            return filterInfo.displayName;
                        }
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]
                },
                {
                    key: 'filterType',
                    label: 'Filter Type',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[rolloutExportData]": (row)=>String(row.filterType || '')
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]
                }
            ];
            const rolloutStats = [
                {
                    label: 'Total Rollouts',
                    value: filteredAssignments.length
                },
                {
                    label: 'Assigned Policies',
                    value: filteredAssignments.filter({
                        "AssignmentsOverview.useMemo[rolloutExportData]": (a)=>a.isAssigned
                    }["AssignmentsOverview.useMemo[rolloutExportData]"]).length
                },
                {
                    label: 'Groups Targeted',
                    value: new Set(filteredAssignments.map({
                        "AssignmentsOverview.useMemo[rolloutExportData]": (a)=>a.targetName
                    }["AssignmentsOverview.useMemo[rolloutExportData]"])).size
                },
                {
                    label: 'Resource Types',
                    value: new Set(filteredAssignments.map({
                        "AssignmentsOverview.useMemo[rolloutExportData]": (a)=>a.resourceType
                    }["AssignmentsOverview.useMemo[rolloutExportData]"])).size
                }
            ];
            return {
                data: filteredAssignments,
                columns: exportColumns,
                filename: 'rollouts-overview',
                title: 'Rollouts Overview',
                description: 'Detailed view of all Intune rollouts across your organization',
                stats: rolloutStats
            };
        }
    }["AssignmentsOverview.useMemo[rolloutExportData]"], [
        filteredAssignments,
        getFilterInfo
    ]);
    const exportData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[exportData]": ()=>{
            const exportColumns = [
                {
                    key: 'resourceType',
                    label: 'Type',
                    width: 20,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>String(row.resourceType || '')
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'resourceName',
                    label: 'Resource',
                    width: 30,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>String(row.resourceName || 'N/A')
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'assignmentType',
                    label: 'Assignment',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>String(row.assignmentType || '')
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'targetName',
                    label: 'Target',
                    width: 30,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>String(row.targetName || '')
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'platform',
                    label: 'Platform',
                    width: 15,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>String(row.platform || 'All')
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'isAssigned',
                    label: 'Status',
                    width: 15,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>row.isAssigned ? 'Assigned' : 'Not Assigned'
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'filterId',
                    label: 'Filter',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>{
                            const filterId = row.filterId;
                            if (!filterId || filterId === 'None') return 'None';
                            const filterInfo = getFilterInfo(filterId, String(row.filterType));
                            return filterInfo.displayName;
                        }
                    }["AssignmentsOverview.useMemo[exportData]"]
                },
                {
                    key: 'filterType',
                    label: 'Filter Type',
                    width: 25,
                    getValue: {
                        "AssignmentsOverview.useMemo[exportData]": (row)=>String(row.filterType || '')
                    }["AssignmentsOverview.useMemo[exportData]"]
                }
            ];
            const stats = [
                {
                    label: 'Total Assignments',
                    value: filteredAssignments.length
                },
                {
                    label: 'Assigned',
                    value: filteredAssignments.filter({
                        "AssignmentsOverview.useMemo[exportData]": (a)=>a.isAssigned
                    }["AssignmentsOverview.useMemo[exportData]"]).length
                },
                {
                    label: 'Not Assigned',
                    value: filteredAssignments.filter({
                        "AssignmentsOverview.useMemo[exportData]": (a)=>!a.isAssigned
                    }["AssignmentsOverview.useMemo[exportData]"]).length
                },
                {
                    label: 'Resource Types',
                    value: new Set(filteredAssignments.map({
                        "AssignmentsOverview.useMemo[exportData]": (a)=>a.resourceType
                    }["AssignmentsOverview.useMemo[exportData]"])).size
                },
                {
                    label: 'Platforms',
                    value: new Set(filteredAssignments.map({
                        "AssignmentsOverview.useMemo[exportData]": (a)=>a.platform
                    }["AssignmentsOverview.useMemo[exportData]"])).size
                }
            ];
            return {
                data: filteredAssignments,
                columns: exportColumns,
                filename: 'assignments-overview',
                title: 'Assignments Overview',
                description: 'Detailed view of all Intune assignments across your organization',
                stats
            };
        }
    }["AssignmentsOverview.useMemo[exportData]"], [
        filteredAssignments,
        getFilterInfo
    ]);
    const fetchAssignmentsData = async ()=>{
        if (!accounts.length) return;
        try {
            const response = await request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_ENDPOINT"], {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response) {
                throw new Error('No response received from API');
            }
            // Unwrap ApiResponseWithCorrelation: response.data is ApiResponse envelope
            const assignmentsData = response.data.data;
            if (Array.isArray(assignmentsData)) {
                setAssignments(assignmentsData);
            } else {
                console.error('API response data is not an array:', assignmentsData);
                setAssignments([]);
                throw new Error('Invalid data format received from API');
            }
        } catch (error) {
            // Don't set error state for abort errors
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Request was cancelled');
                return;
            }
            throw error; // Re-throw other errors
        }
    };
    const fetchFilters = async ()=>{
        if (!accounts.length) return;
        try {
            const responseData = await request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_FILTERS_ENDPOINT"], {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!responseData) {
                console.error('No response received from filters API');
                setFilters([]);
                return;
            }
            // Unwrap ApiResponseWithCorrelation → .data.data is the AssignmentFilter array
            if (Array.isArray(responseData.data.data)) {
                setFilters(responseData.data.data);
            } else {
                console.error('Filters API response is not an array:', responseData);
                setFilters([]);
            }
        } catch (error) {
            console.error('Failed to fetch filters:', error);
            setFilters([]);
        }
    };
    // Pagination — depends on filteredAssignments
    const totalPages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[totalPages]": ()=>Math.ceil(filteredAssignments.length / itemsPerPage)
    }["AssignmentsOverview.useMemo[totalPages]"], [
        filteredAssignments.length,
        itemsPerPage
    ]);
    // Group dialog handlers
    const handleResourceClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentsOverview.useCallback[handleResourceClick]": (resourceId, assignmentType)=>{
            if ((assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude' || assignmentType === 'GroupAssignment') && resourceId) {
                setSelectedGroupId(resourceId);
                setIsGroupDialogOpen(true);
            }
        }
    }["AssignmentsOverview.useCallback[handleResourceClick]"], []);
    const handleFilterClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentsOverview.useCallback[handleFilterClick]": (filterId)=>{
            if (filterId && filterId !== 'None') {
                const filter = filters.find({
                    "AssignmentsOverview.useCallback[handleFilterClick].filter": (f)=>f.id === filterId
                }["AssignmentsOverview.useCallback[handleFilterClick].filter"]);
                if (filter) {
                    setSelectedFilter(filter);
                    setIsFilterDialogOpen(true);
                }
            }
        }
    }["AssignmentsOverview.useCallback[handleFilterClick]"], [
        filters
    ]);
    // For dynamic group search
    const searchGroupInAssignments = async (searchTerm)=>{
        if (!accounts.length || !searchTerm.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const queryParam = isValidGuid(searchTerm.trim()) ? "groupId=".concat(searchTerm.trim()) : "groupName=".concat(encodeURIComponent(searchTerm.trim()));
            const responseData = await request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GROUPS_ENDPOINT"], "?").concat(queryParam), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // Check if response exists
            if (!responseData) {
                throw new Error('No response received from API');
            }
            // Unwrap ApiResponseWithCorrelation
            const envelope = responseData.data;
            // Check for consent requirements
            if (handleConsentCheck(envelope)) {
                return;
            }
            if (envelope.status === 'Success' && envelope.data) {
                // Check if data is consent URL object
                if (typeof envelope.data === 'object' && !Array.isArray(envelope.data) && 'url' in envelope.data) {
                    setConsentUrl(envelope.data.url);
                    setShowConsentDialog(true);
                    return;
                }
                const groupData = envelope.data;
                // Found group, now fetch its assignments
                await fetchGroupAssignments(groupData.id);
            } else {
                // No group found, fall back to regular search
                setSearchQuery(searchTerm);
            }
        } catch (error) {
            console.error('Failed to search group:', error);
            // Fall back to regular search
            setSearchQuery(searchTerm);
        } finally{
            setLoading(false);
        }
    };
    // Get unique values for filters
    const uniqueAssignmentTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[uniqueAssignmentTypes]": ()=>{
            const types = new Set();
            assignments.forEach({
                "AssignmentsOverview.useMemo[uniqueAssignmentTypes]": (assignment)=>{
                    if (assignment.isAssigned) {
                        types.add(assignment.assignmentType);
                    } else {
                        types.add('Not Assigned');
                    }
                }
            }["AssignmentsOverview.useMemo[uniqueAssignmentTypes]"]);
            return Array.from(types).sort().map({
                "AssignmentsOverview.useMemo[uniqueAssignmentTypes]": (type)=>({
                        label: type,
                        value: type
                    })
            }["AssignmentsOverview.useMemo[uniqueAssignmentTypes]"]);
        }
    }["AssignmentsOverview.useMemo[uniqueAssignmentTypes]"], [
        assignments
    ]);
    const uniqueResourceTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[uniqueResourceTypes]": ()=>{
            const types = new Set();
            assignments.forEach({
                "AssignmentsOverview.useMemo[uniqueResourceTypes]": (assignment)=>{
                    types.add(assignment.resourceType);
                }
            }["AssignmentsOverview.useMemo[uniqueResourceTypes]"]);
            return Array.from(types).sort().map({
                "AssignmentsOverview.useMemo[uniqueResourceTypes]": (type)=>({
                        label: type,
                        value: type
                    })
            }["AssignmentsOverview.useMemo[uniqueResourceTypes]"]);
        }
    }["AssignmentsOverview.useMemo[uniqueResourceTypes]"], [
        assignments
    ]);
    const uniqueStatuses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[uniqueStatuses]": ()=>[
                {
                    label: 'Assigned',
                    value: 'Assigned'
                },
                {
                    label: 'Not Assigned',
                    value: 'Not Assigned'
                }
            ]
    }["AssignmentsOverview.useMemo[uniqueStatuses]"], []);
    const uniquePlatforms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[uniquePlatforms]": ()=>{
            const platforms = new Set();
            assignments.forEach({
                "AssignmentsOverview.useMemo[uniquePlatforms]": (assignment)=>{
                    platforms.add(assignment.platform || 'All');
                }
            }["AssignmentsOverview.useMemo[uniquePlatforms]"]);
            return Array.from(platforms).sort().map({
                "AssignmentsOverview.useMemo[uniquePlatforms]": (platform)=>({
                        label: platform,
                        value: platform
                    })
            }["AssignmentsOverview.useMemo[uniquePlatforms]"]);
        }
    }["AssignmentsOverview.useMemo[uniquePlatforms]"], [
        assignments
    ]);
    const uniqueFilterTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[uniqueFilterTypes]": ()=>[
                {
                    label: 'No Filter',
                    value: 'None'
                },
                {
                    label: 'Include Filter',
                    value: 'include'
                },
                {
                    label: 'Exclude Filter',
                    value: 'exclude'
                }
            ]
    }["AssignmentsOverview.useMemo[uniqueFilterTypes]"], []);
    const clearFilters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentsOverview.useCallback[clearFilters]": ()=>{
            setAssignmentTypeFilter([]);
            setResourceTypeFilter([]);
            setStatusFilter([]);
            setPlatformFilter([]);
            setSearchQuery('');
            setFilterTypeFilter([]);
        }
    }["AssignmentsOverview.useCallback[clearFilters]"], []);
    const clearSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentsOverview.useCallback[clearSearch]": ()=>{
            setSearchQuery('');
        }
    }["AssignmentsOverview.useCallback[clearSearch]"], []);
    const clearAssignments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentsOverview.useCallback[clearAssignments]": ()=>{
            setAssignments([]);
            setSearchedGroup(null);
            setGroupSearchInput('');
            setGroupSearchError(null);
            setError(null);
            setGroupSearchResults([]);
            setAssignmentTypeFilter([]);
            setResourceTypeFilter([]);
            setStatusFilter([]);
            setPlatformFilter([]);
            setSearchQuery('');
            setFilterTypeFilter([]);
            setGroupResultsSearch('');
        }
    }["AssignmentsOverview.useCallback[clearAssignments]"], []);
    const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AssignmentsOverview.useMemo[columns]": ()=>[
                {
                    key: 'resourceName',
                    label: 'Resource',
                    width: 200,
                    minWidth: 150,
                    render: {
                        "AssignmentsOverview.useMemo[columns]": (value, row)=>{
                            const resourceName = value ? String(value) : 'N/A';
                            const resourceType = String(row.resourceType);
                            const resourceId = String(row.resourceId);
                            if (resourceType === 'Group' && resourceId && resourceName !== 'N/A') {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: {
                                        "AssignmentsOverview.useMemo[columns]": ()=>handleResourceClick(resourceId, String(row.assignmentType))
                                    }["AssignmentsOverview.useMemo[columns]"],
                                    className: "text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer truncate block w-full text-left",
                                    title: resourceName,
                                    children: resourceName
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 748,
                                    columnNumber: 25
                                }, this);
                            }
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-0.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium text-sm truncate block w-full",
                                        title: resourceName,
                                        children: resourceName
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 760,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-gray-400 block",
                                        children: resourceType
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 763,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 759,
                                columnNumber: 21
                            }, this);
                        }
                    }["AssignmentsOverview.useMemo[columns]"]
                },
                {
                    key: 'assignmentType',
                    label: 'Assignment',
                    width: 160,
                    minWidth: 110,
                    render: {
                        "AssignmentsOverview.useMemo[columns]": (value, row)=>{
                            const isAssigned = Boolean(row.isAssigned);
                            const isNestedAssignment = Boolean(row.isNestedAssignment);
                            if (!isAssigned) {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "secondary",
                                    className: "text-xs whitespace-nowrap",
                                    children: "Not Assigned"
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 779,
                                    columnNumber: 25
                                }, this);
                            }
                            const assignmentType = String(value);
                            const isExclude = assignmentType.includes('Exclude');
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: isExclude ? "destructive" : "default",
                                        className: "text-xs whitespace-nowrap",
                                        children: assignmentType
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 790,
                                        columnNumber: 25
                                    }, this),
                                    isNestedAssignment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "outline",
                                        className: "text-xs bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 px-1.5 py-0.5",
                                        title: "Nested assignment - inherited from parent group",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$group$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Group$3e$__["Group"], {
                                            className: "h-2.5 w-2.5 mr-0.5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 802,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 797,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 789,
                                columnNumber: 21
                            }, this);
                        }
                    }["AssignmentsOverview.useMemo[columns]"]
                },
                {
                    key: 'targetName',
                    label: 'Target',
                    width: 180,
                    minWidth: 120,
                    render: {
                        "AssignmentsOverview.useMemo[columns]": (value, row)=>{
                            const targetName = String(value);
                            const assignmentType = String(row.assignmentType);
                            const isAssigned = Boolean(row.isAssigned);
                            const targetId = row.targetId;
                            const group = row.group;
                            if (isAssigned && (assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude') && targetId) {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: {
                                                        "AssignmentsOverview.useMemo[columns]": ()=>handleResourceClick(targetId, assignmentType)
                                                    }["AssignmentsOverview.useMemo[columns]"],
                                                    className: "text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer truncate flex-1 text-left",
                                                    title: targetName,
                                                    children: targetName
                                                }, void 0, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 831,
                                                    columnNumber: 33
                                                }, this),
                                                (group === null || group === void 0 ? void 0 : group.membershipRule) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    title: "Dynamic Group",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__["Blocks"], {
                                                        className: "h-3 w-3 text-purple-500 flex-shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 840,
                                                        columnNumber: 13
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 839,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 830,
                                            columnNumber: 29
                                        }, this),
                                        (group === null || group === void 0 ? void 0 : group.groupCount) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1 text-xs text-gray-500",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        group.groupCount.userCount,
                                                        " ",
                                                        group.groupCount.userCount === 1 ? 'user' : 'users'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 846,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        group.groupCount.deviceCount,
                                                        " ",
                                                        group.groupCount.deviceCount === 1 ? 'device' : 'devices'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 847,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        group.groupCount.groupCount,
                                                        " ",
                                                        group.groupCount.groupCount === 1 ? 'group' : 'groups'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 848,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 845,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 829,
                                    columnNumber: 25
                                }, this);
                            }
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm truncate block w-full",
                                title: targetName,
                                children: targetName
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 858,
                                columnNumber: 21
                            }, this);
                        }
                    }["AssignmentsOverview.useMemo[columns]"]
                },
                {
                    key: 'platform',
                    label: 'Platform',
                    width: 100,
                    minWidth: 80,
                    render: {
                        "AssignmentsOverview.useMemo[columns]": (value)=>{
                            const platform = value ? String(value) : 'All';
                            const platformColors = {
                                'Windows': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
                                'iOS': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
                                'Android': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
                                'macOS': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
                                'Linux': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
                                'All': 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                            };
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "outline",
                                className: "text-xs whitespace-nowrap ".concat(platformColors[platform] || platformColors['All']),
                                children: platform
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 880,
                                columnNumber: 21
                            }, this);
                        }
                    }["AssignmentsOverview.useMemo[columns]"]
                },
                {
                    key: 'isAssigned',
                    label: 'Status',
                    width: 120,
                    minWidth: 90,
                    render: {
                        "AssignmentsOverview.useMemo[columns]": (value)=>{
                            const isAssigned = Boolean(value);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: isAssigned ? 'default' : 'secondary',
                                className: "text-xs whitespace-nowrap ".concat(isAssigned ? 'bg-green-500 hover:bg-green-600' : ''),
                                children: isAssigned ? 'Assigned' : 'Not Assigned'
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 897,
                                columnNumber: 21
                            }, this);
                        }
                    }["AssignmentsOverview.useMemo[columns]"]
                },
                {
                    key: 'filterId',
                    label: 'Filter',
                    width: 160,
                    minWidth: 120,
                    render: {
                        "AssignmentsOverview.useMemo[columns]": (value, row)=>{
                            const filterId = value;
                            const filterType = String(row.filterType);
                            const filterInfo = getFilterInfo(filterId, filterType);
                            if (!filterId || filterId === 'None' || filterType === 'None') {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-gray-500",
                                    children: "None"
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 915,
                                    columnNumber: 28
                                }, this);
                            }
                            const isInclude = filterType === 'include';
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: {
                                            "AssignmentsOverview.useMemo[columns]": ()=>handleFilterClick(filterId)
                                        }["AssignmentsOverview.useMemo[columns]"],
                                        className: "text-yellow-400 hover:text-yellow-500 underline text-xs font-medium cursor-pointer truncate block w-full text-left",
                                        title: filterInfo.displayName,
                                        children: filterInfo.displayName
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 922,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center",
                                        children: isInclude ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            variant: "default",
                                            className: "text-xs bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white border-green-400 dark:border-green-500 px-1 py-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                    className: "h-2 w-2 mr-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 932,
                                                    columnNumber: 37
                                                }, this),
                                                "Inc"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 931,
                                            columnNumber: 33
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            variant: "destructive",
                                            className: "text-xs bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-400 dark:border-red-500 px-1 py-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                    className: "h-2 w-2 mr-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 937,
                                                    columnNumber: 37
                                                }, this),
                                                "Exc"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 936,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 929,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 921,
                                columnNumber: 21
                            }, this);
                        }
                    }["AssignmentsOverview.useMemo[columns]"]
                }
            ]
    }["AssignmentsOverview.useMemo[columns]"], [
        getFilterInfo,
        handleFilterClick,
        handleResourceClick
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 lg:p-8 space-y-6 w-full max-w-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100",
                                children: "Group assignments Overview"
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 952,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 dark:text-gray-300 mt-2",
                                children: "View all Intune assignments across your organization for a specific group. Search for a group or load all assignments to get started."
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 953,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 951,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: assignments.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: fetchAssignments,
                                    variant: "outline",
                                    size: "sm",
                                    disabled: loading,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 mr-2 ".concat(loading ? 'animate-spin' : '')
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 962,
                                            columnNumber: 33
                                        }, this),
                                        "Refresh"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 961,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ExportButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ExportButton"], {
                                    exportOptions: [
                                        {
                                            label: "Standard Export",
                                            data: exportData,
                                            formats: [
                                                'csv',
                                                'pdf',
                                                'html'
                                            ]
                                        },
                                        {
                                            label: "Export for bulk assignments",
                                            data: rolloutExportData,
                                            formats: [
                                                'csv'
                                            ]
                                        }
                                    ],
                                    variant: "outline",
                                    size: "sm",
                                    tenantId: ((_instance_getActiveAccount = instance.getActiveAccount()) === null || _instance_getActiveAccount === void 0 ? void 0 : _instance_getActiveAccount.tenantId) || ((_accounts_ = accounts[0]) === null || _accounts_ === void 0 ? void 0 : _accounts_.tenantId) || ''
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 965,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: fetchAssignments,
                                    disabled: loading,
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 ".concat(loading ? 'animate-spin' : '')
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 990,
                                            columnNumber: 33
                                        }, this),
                                        "Load Assignments"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 985,
                                    columnNumber: 29
                                }, this),
                                loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>{
                                        cancel();
                                        setAssignments([]);
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
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1006,
                                            columnNumber: 37
                                        }, this),
                                        "Cancel"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 994,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 958,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 950,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-red-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-red-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 1020,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Error:"
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 1021,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 1022,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                            lineNumber: 1019,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 dark:text-gray-300 mt-2",
                            children: "Error occurred while fetching assignments. Please try again."
                        }, void 0, false, {
                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                            lineNumber: 1024,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: fetchAssignments,
                            className: "mt-4",
                            variant: "outline",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 1028,
                                    columnNumber: 29
                                }, this),
                                "Try Again"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                            lineNumber: 1027,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                    lineNumber: 1018,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 1017,
                columnNumber: 17
            }, this),
            assignments.length === 0 && !loading && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "text-center pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                className: "h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1039,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                className: "text-xl",
                                children: "Group Assignments"
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1040,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                className: "text-gray-600 dark:text-gray-300 max-w-md mx-auto",
                                children: "Search for a specific group to view its assignments, or load all assignments to get a comprehensive overview."
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1041,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 1038,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold mb-2",
                                                children: "Search for a Group"
                                            }, void 0, false, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1049,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-600 dark:text-gray-300 mb-4",
                                                children: "Enter the exact group name or GUID to find and view its assignments"
                                            }, void 0, false, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1048,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2 max-w-md mx-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1057,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: groupSearchInput,
                                                        onChange: (e)=>setGroupSearchInput(e.target.value),
                                                        placeholder: "Enter group name or GUID",
                                                        className: "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent",
                                                        onKeyPress: (e)=>{
                                                            if (e.key === 'Enter') {
                                                                searchGroup();
                                                            }
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1058,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1056,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: searchGroup,
                                                disabled: !groupSearchInput.trim() || groupSearchLoading,
                                                className: "px-6",
                                                children: groupSearchLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                    className: "h-4 w-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1077,
                                                    columnNumber: 41
                                                }, this) : 'Search'
                                            }, void 0, false, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1071,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1055,
                                        columnNumber: 29
                                    }, this),
                                    groupSearchError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-md mx-auto p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-red-600 dark:text-red-300 text-sm",
                                            children: groupSearchError
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1087,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1086,
                                        columnNumber: 33
                                    }, this),
                                    groupSearchResults.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-4xl mx-auto space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-lg font-semibold",
                                                        children: [
                                                            "Found ",
                                                            groupSearchResults.length,
                                                            " groups"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1095,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-gray-600 dark:text-gray-300",
                                                        children: "Search and click on a group to view its assignments"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1096,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1094,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative max-w-md mx-auto",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1101,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: groupResultsSearch,
                                                        onChange: (e)=>setGroupResultsSearch(e.target.value),
                                                        placeholder: "Search within results...",
                                                        className: "w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1102,
                                                        columnNumber: 41
                                                    }, this),
                                                    groupResultsSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setGroupResultsSearch(''),
                                                        className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1114,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1110,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1100,
                                                columnNumber: 37
                                            }, this),
                                            groupResultsSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center text-sm text-gray-600 dark:text-gray-300",
                                                children: [
                                                    "Showing ",
                                                    filteredGroupResults.length,
                                                    " of ",
                                                    groupSearchResults.length,
                                                    " groups"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1121,
                                                columnNumber: 41
                                            }, this),
                                            filteredGroupResults.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                                    className: "border hover:border-blue-300 transition-colors cursor-pointer",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                                        className: "p-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-start justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-2 mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                                    className: "h-4 w-4 text-yellow-400"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                                    lineNumber: 1132,
                                                                                    columnNumber: 61
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                    className: "font-semibold text-lg",
                                                                                    children: group.displayName
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                                    lineNumber: 1133,
                                                                                    columnNumber: 61
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                            lineNumber: 1131,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-gray-600 text-sm mb-3",
                                                                            children: group.description || 'No description available'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                            lineNumber: 1135,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-xs text-gray-500 font-mono break-all mb-3",
                                                                            children: [
                                                                                "ID: ",
                                                                                group.id
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                            lineNumber: 1154,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                    lineNumber: 1130,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-col gap-2 ml-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                            onClick: ()=>{
                                                                                setSearchedGroup(group);
                                                                                setGroupSearchResults([]);
                                                                                setGroupResultsSearch('');
                                                                            },
                                                                            variant: "outline",
                                                                            size: "sm",
                                                                            className: "whitespace-nowrap",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                                    className: "h-3 w-3 mr-1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                                    lineNumber: 1170,
                                                                                    columnNumber: 61
                                                                                }, this),
                                                                                "Select"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                            lineNumber: 1160,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                            onClick: ()=>fetchGroupAssignments(group.id),
                                                                            size: "sm",
                                                                            className: "whitespace-nowrap",
                                                                            disabled: loading,
                                                                            children: [
                                                                                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                                    className: "h-3 w-3 animate-spin mr-1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                                    lineNumber: 1180,
                                                                                    columnNumber: 65
                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                                                                    className: "h-3 w-3 mr-1"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                                    lineNumber: 1182,
                                                                                    columnNumber: 65
                                                                                }, this),
                                                                                "Load"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                            lineNumber: 1173,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                    lineNumber: 1159,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1129,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1128,
                                                        columnNumber: 45
                                                    }, this)
                                                }, group.id, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1126,
                                                    columnNumber: 41
                                                }, this)),
                                            groupResultsSearch && filteredGroupResults.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center py-8 text-gray-500 dark:text-gray-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                        className: "h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1195,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            'No groups found matching "',
                                                            groupResultsSearch,
                                                            '"'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1196,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1194,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center pt-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    onClick: ()=>{
                                                        setGroupSearchResults([]);
                                                        setGroupSearchInput('');
                                                        setGroupSearchError(null);
                                                        setGroupResultsSearch('');
                                                    },
                                                    children: "Clear Results"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1202,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1201,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1093,
                                        columnNumber: 33
                                    }, this),
                                    searchedGroup && groupSearchResults.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                        className: "border-2 border-blue-300 bg-blue-50 dark:bg-blue-950",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                            className: "p-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 mb-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                        className: "h-4 w-4 text-yellow-400 dark:text-yellow-400"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                        lineNumber: 1225,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "font-semibold text-lg",
                                                                        children: searchedGroup.displayName
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                        lineNumber: 1226,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1224,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-gray-600 dark:text-gray-300 text-sm mb-3",
                                                                children: searchedGroup.description || 'No description available'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1228,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-500 dark:text-gray-400 font-mono break-all",
                                                                children: [
                                                                    "ID: ",
                                                                    searchedGroup.id
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1249,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1223,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-2 ml-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            onClick: ()=>fetchGroupAssignments(searchedGroup.id),
                                                            size: "sm",
                                                            disabled: loading,
                                                            children: [
                                                                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                    className: "h-4 w-4 animate-spin mr-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                    lineNumber: 1261,
                                                                    columnNumber: 57
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                                                    className: "h-4 w-4 mr-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                    lineNumber: 1263,
                                                                    columnNumber: 57
                                                                }, this),
                                                                "Load Assignments"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1255,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1254,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1222,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1221,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1220,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1047,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 flex items-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full border-t border-gray-300 dark:border-gray-600"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1278,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1277,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative flex justify-center text-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400",
                                            children: "or"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1281,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1280,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1276,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: fetchAssignments,
                                        className: "inline-flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1287,
                                                columnNumber: 33
                                            }, this),
                                            "Load All Assignments"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1286,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-500 dark:text-gray-400 mt-2",
                                        children: "Load all group assignments in your organization"
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1290,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1285,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 1046,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 1037,
                columnNumber: 17
            }, this),
            isCancelled && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CancelledCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CancelledCard"], {
                onRetry: ()=>{
                    setIsCancelled(false);
                    fetchAssignments();
                },
                title: "Loading Cancelled",
                description: "Assignment data loading was cancelled. Click below to load assignments again.",
                buttonText: "Load Assignments"
            }, void 0, false, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 1299,
                columnNumber: 17
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AssignmentsTableSkeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AssignmentsTableSkeleton"], {
                showStats: true,
                statsCount: 4,
                showFilters: true,
                tableRows: 10,
                tableColumns: 7
            }, void 0, false, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 1312,
                columnNumber: 17
            }, this),
            assignments.length > 0 && !loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setIsFiltersExpanded(!isFiltersExpanded),
                                                className: "flex items-center gap-2 hover:text-yellow-400 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                                        className: "h-5 w-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1332,
                                                        columnNumber: 37
                                                    }, this),
                                                    "Filters",
                                                    isFiltersExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1335,
                                                        columnNumber: 41
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1337,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1328,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    !isFiltersExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        variant: "secondary",
                                                        className: "text-xs",
                                                        children: [
                                                            resourceTypeFilter.length + assignmentTypeFilter.length + statusFilter.length + platformFilter.length + filterTypeFilter.length,
                                                            " active"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1343,
                                                        columnNumber: 41
                                                    }, this),
                                                    (resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "sm",
                                                        onClick: clearFilters,
                                                        children: "Clear All"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1348,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1340,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1327,
                                        columnNumber: 29
                                    }, this),
                                    !isFiltersExpanded && (resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1 pt-2",
                                        children: [
                                            resourceTypeFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: [
                                                        "Resource: ",
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setResourceTypeFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            className: "ml-1 hover:text-red-600",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1364,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1360,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1358,
                                                    columnNumber: 41
                                                }, this)),
                                            assignmentTypeFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: [
                                                        "Assignment: ",
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setAssignmentTypeFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            className: "ml-1 hover:text-red-600",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1375,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1371,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1369,
                                                    columnNumber: 41
                                                }, this)),
                                            statusFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: [
                                                        "Status: ",
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setStatusFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            className: "ml-1 hover:text-red-600",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1386,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1382,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1380,
                                                    columnNumber: 41
                                                }, this)),
                                            platformFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: [
                                                        "Platform: ",
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setPlatformFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            className: "ml-1 hover:text-red-600",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1397,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1393,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1391,
                                                    columnNumber: 41
                                                }, this)),
                                            filterTypeFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: [
                                                        "Filter: ",
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setFilterTypeFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            className: "ml-1 hover:text-red-600",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1408,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1404,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1402,
                                                    columnNumber: 41
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1356,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1326,
                                columnNumber: 25
                            }, this),
                            isFiltersExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-sm font-medium",
                                                        children: "Resource Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1422,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$multi$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultiSelect"], {
                                                        options: uniqueResourceTypes,
                                                        selected: resourceTypeFilter,
                                                        onChange: setResourceTypeFilter,
                                                        placeholder: "Select resource types..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1423,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1421,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-sm font-medium",
                                                        children: "Assignment Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1432,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$multi$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultiSelect"], {
                                                        options: uniqueAssignmentTypes,
                                                        selected: assignmentTypeFilter,
                                                        onChange: setAssignmentTypeFilter,
                                                        placeholder: "Select assignment types..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1433,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1431,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-sm font-medium",
                                                        children: "Status"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1443,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$multi$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultiSelect"], {
                                                        options: uniqueStatuses,
                                                        selected: statusFilter,
                                                        onChange: setStatusFilter,
                                                        placeholder: "Select status..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1444,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1442,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-sm font-medium",
                                                        children: "Platform"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1454,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$multi$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultiSelect"], {
                                                        options: uniquePlatforms,
                                                        selected: platformFilter,
                                                        onChange: setPlatformFilter,
                                                        placeholder: "Select platforms..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1455,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1453,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-sm font-medium",
                                                        children: "Filter Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1465,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$multi$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MultiSelect"], {
                                                        options: uniqueFilterTypes,
                                                        selected: filterTypeFilter,
                                                        onChange: setFilterTypeFilter,
                                                        placeholder: "Select filter types..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                        lineNumber: 1466,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1464,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1419,
                                        columnNumber: 33
                                    }, this),
                                    (assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2 pt-2 border-t",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-gray-600",
                                                children: "Active filters:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                lineNumber: 1478,
                                                columnNumber: 41
                                            }, this),
                                            resourceTypeFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "secondary",
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setResourceTypeFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1484,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1482,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1480,
                                                    columnNumber: 45
                                                }, this)),
                                            assignmentTypeFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "secondary",
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setAssignmentTypeFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1493,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1491,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1489,
                                                    columnNumber: 45
                                                }, this)),
                                            statusFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "secondary",
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setStatusFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1502,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1500,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1498,
                                                    columnNumber: 45
                                                }, this)),
                                            platformFilter.map((filter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "secondary",
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        filter,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setPlatformFilter((prev)=>prev.filter((f)=>f !== filter)),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                                lineNumber: 1511,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                            lineNumber: 1509,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, filter, true, {
                                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                                    lineNumber: 1507,
                                                    columnNumber: 45
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1477,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1418,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 1325,
                        columnNumber: 21
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-red-200 bg-red-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "pt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-red-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: "Error:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1525,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1526,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1524,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                            lineNumber: 1523,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 1522,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 w-full overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "pb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Assignment Details"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1536,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1535,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                        className: "text-gray-600 dark:text-gray-300",
                                        children: "Detailed view of all assignments with their targets and configurations"
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1538,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1534,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "p-0",
                                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center h-32",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-6 w-6 animate-spin text-yellow-400"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1545,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-2 text-gray-600 dark:text-gray-300",
                                            children: "Loading assignments..."
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1546,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 1544,
                                    columnNumber: 33
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                                    data: filteredAssignments,
                                    columns: columns,
                                    className: "min-w-full",
                                    showPagination: true,
                                    currentPage: currentPage,
                                    itemsPerPage: itemsPerPage,
                                    onPageChange: setCurrentPage,
                                    onItemsPerPageChange: setItemsPerPage
                                }, void 0, false, {
                                    fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                    lineNumber: 1549,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1542,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 1533,
                        columnNumber: 21
                    }, this),
                    filteredAssignments.length === 0 && !loading && !error && assignments.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "pt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-12",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-400 dark:text-gray-500 mb-4",
                                        children: searchQuery ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            className: "h-12 w-12 mx-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1569,
                                            columnNumber: 56
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                            className: "h-12 w-12 mx-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                            lineNumber: 1570,
                                            columnNumber: 45
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1568,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2",
                                        children: searchQuery ? 'No assignments match your search' : 'No assignments match your filters'
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1572,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 dark:text-gray-300 mb-4",
                                        children: searchQuery ? 'Try adjusting your search terms or clearing filters.' : 'Try adjusting your filter criteria or clear all filters to see more results.'
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1575,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: clearFilters,
                                        variant: "outline",
                                        children: searchQuery ? 'Clear Search & Filters' : 'Clear All Filters'
                                    }, void 0, false, {
                                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                        lineNumber: 1580,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                                lineNumber: 1567,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/assistant/group-assignments/page.tsx",
                            lineNumber: 1566,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/assistant/group-assignments/page.tsx",
                        lineNumber: 1565,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GroupDetailsDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GroupDetailsDialog"], {
                groupId: selectedGroupId,
                isOpen: isGroupDialogOpen,
                onClose: ()=>{
                    setIsGroupDialogOpen(false);
                    setSelectedGroupId(null);
                }
            }, void 0, false, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 1590,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FilterDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilterDetailsDialog"], {
                filter: selectedFilter,
                isOpen: isFilterDialogOpen,
                onClose: ()=>{
                    setIsFilterDialogOpen(false);
                    setSelectedFilter(null);
                }
            }, void 0, false, {
                fileName: "[project]/app/assistant/group-assignments/page.tsx",
                lineNumber: 1599,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/assistant/group-assignments/page.tsx",
        lineNumber: 949,
        columnNumber: 9
    }, this);
}
_s(AssignmentsOverview, "xdUW0VEC5eo9a/DlNLz+b8H7XC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"]
    ];
});
_c = AssignmentsOverview;
var _c;
__turbopack_context__.k.register(_c, "AssignmentsOverview");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_9adb0993._.js.map