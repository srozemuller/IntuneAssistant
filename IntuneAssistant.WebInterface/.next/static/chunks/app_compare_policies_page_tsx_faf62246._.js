(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/compare/policies/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PolicyComparison
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/hooks/useMsal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-compare.js [app-client] (ecmascript) <export default as GitCompare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-alert.js [app-client] (ecmascript) <export default as ShieldAlert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-minus.js [app-client] (ecmascript) <export default as MinusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useApiRequest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiRequest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$msalConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/msalConfig.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
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
// Normalize API status strings or numeric enum values → SetAnalysisStatus
function normalizeSetAnalysisStatus(raw) {
    // Numeric enum: 0=Overlap,1=Conflict,2=Duplicate,3=MissingInRight,4=MissingInLeft,5=Match,6=NewInLeft,7=NewInRight
    const numericMap = {
        0: 'Overlap',
        1: 'Conflict',
        2: 'Duplicate',
        3: 'MissingInRight',
        4: 'MissingInLeft',
        5: 'Match',
        6: 'NewInLeft',
        7: 'NewInRight'
    };
    var _numericMap_raw;
    if (typeof raw === 'number') return (_numericMap_raw = numericMap[raw]) !== null && _numericMap_raw !== void 0 ? _numericMap_raw : 'Match';
    if (!raw || typeof raw !== 'string') return 'Match';
    const map = {
        'match': 'Match',
        'duplicate': 'Duplicate',
        'conflict': 'Conflict',
        'missinginleft': 'MissingInLeft',
        'missing in left': 'MissingInLeft',
        'missinginright': 'MissingInRight',
        'missing in right': 'MissingInRight',
        'newinleft': 'NewInLeft',
        'new in left': 'NewInLeft',
        'newinright': 'NewInRight',
        'new in right': 'NewInRight',
        'overlap': 'Overlap'
    };
    var _map_raw_toLowerCase;
    return (_map_raw_toLowerCase = map[raw.toLowerCase()]) !== null && _map_raw_toLowerCase !== void 0 ? _map_raw_toLowerCase : raw;
}
/** How each state reads from the perspective of "should I enable this new policy?" */ const stateLabel = {
    InBothTheSame: 'Already covered',
    InBothDifferent: 'Conflict',
    InSource: 'New — not elsewhere',
    InChecked: 'Only in existing'
};
const stateDescription = {
    InBothTheSame: 'Same value in an existing policy — enabling is safe, no change in enforcement.',
    InBothDifferent: 'Different value in an existing policy — enabling may cause conflict or override.',
    InSource: 'Only in your new policy — no existing policy covers this setting.',
    InChecked: 'Only in the existing policy — your new policy does not configure this.'
};
const stateBadgeClass = {
    InBothTheSame: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    InBothDifferent: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    InSource: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    InChecked: 'bg-muted text-muted-foreground border-border'
};
const stateIcon = {
    InBothTheSame: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 193,
        columnNumber: 22
    }, ("TURBOPACK compile-time value", void 0)),
    InBothDifferent: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 194,
        columnNumber: 22
    }, ("TURBOPACK compile-time value", void 0)),
    InSource: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 195,
        columnNumber: 22
    }, ("TURBOPACK compile-time value", void 0)),
    InChecked: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusCircle$3e$__["MinusCircle"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 196,
        columnNumber: 22
    }, ("TURBOPACK compile-time value", void 0))
};
function StatusBadge(param) {
    let { state } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ".concat(stateBadgeClass[state]),
        children: [
            stateIcon[state],
            stateLabel[state]
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 201,
        columnNumber: 9
    }, this);
}
_c = StatusBadge;
function ProgressBar(param) {
    let { value, color } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full bg-muted rounded-full h-2 overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-2 rounded-full transition-all ".concat(color),
            style: {
                width: "".concat(Math.min(value, 100), "%")
            }
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 210,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 209,
        columnNumber: 9
    }, this);
}
_c1 = ProgressBar;
/** Show percentage with smart precision:
 *  - If count > 0 but rounds to 0, show "<1%" so it's never misleadingly 0%
 *  - Otherwise show whole number */ function smartPct(count, total) {
    if (total === 0) return '0%';
    if (count === 0) return '0%';
    const pct = count / total * 100;
    if (pct < 1) return '<1%';
    return "".concat(Math.round(pct), "%");
}
function LoadingBanner(param) {
    let { onCancel, batchProgress } = param;
    const pct = batchProgress ? Math.round(batchProgress.done / batchProgress.total * 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "border overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
            className: "p-4 space-y-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold",
                                    children: "Analysing policy overlap…"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 233,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground mt-0.5",
                                    children: batchProgress ? batchProgress.total === 1 ? 'Running comparison…' : "Type group ".concat(batchProgress.done, " of ").concat(batchProgress.total, " — comparing policies of the same type") : 'Preparing…'
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 234,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 232,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            size: "sm",
                            onClick: onCancel,
                            className: "flex-shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 245,
                                    columnNumber: 25
                                }, this),
                                "Cancel"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 243,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 231,
                    columnNumber: 17
                }, this),
                batchProgress && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full bg-muted rounded-full h-2 overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-2 rounded-full bg-primary transition-all duration-500",
                                style: {
                                    width: "".concat(pct, "%")
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 252,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 251,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between text-[10px] text-muted-foreground",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        batchProgress.done,
                                        " / ",
                                        batchProgress.total,
                                        " batches"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 258,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        pct,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 259,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 257,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 250,
                    columnNumber: 21
                }, this),
                [
                    1,
                    0.65,
                    0.4,
                    0.2
                ].map((opacity, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3 items-center px-1",
                        style: {
                            opacity
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-8 w-8 rounded bg-muted animate-pulse flex-shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 266,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 space-y-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-2.5 rounded bg-muted animate-pulse",
                                        style: {
                                            width: "".concat(60 + i * 7 % 25, "%")
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 268,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-2 rounded bg-muted/60 animate-pulse",
                                        style: {
                                            width: "".concat(35 + i * 11 % 20, "%")
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 269,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 267,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-5 w-24 rounded-full bg-muted animate-pulse flex-shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 271,
                                columnNumber: 25
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 265,
                        columnNumber: 21
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 230,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 229,
        columnNumber: 9
    }, this);
}
_c2 = LoadingBanner;
// ── ValueCell ──────────────────────────────────────────────────────────────────
/** Resolve a raw value (may be an option item ID) to a friendly display string.
 *  Returns { primary, raw } where primary is the human-readable label and
 *  raw is the original value (shown underneath when different). */ function resolveValue(raw, definitionId, resolvedMap) {
    var _def_options;
    if (!raw) return {
        primary: '',
        raw: ''
    };
    const rawLower = raw.toLowerCase();
    const def = resolvedMap.get(definitionId.toLowerCase());
    if (def === null || def === void 0 ? void 0 : (_def_options = def.options) === null || _def_options === void 0 ? void 0 : _def_options.length) {
        // 1. Exact match: value IS the full option item ID
        const exactMatch = def.options.find((o)=>o.itemId.toLowerCase() === rawLower);
        if (exactMatch) return {
            primary: exactMatch.displayName,
            raw
        };
        // 2. Value starts with definitionId + '_' — strip prefix and look up
        const prefix = definitionId.toLowerCase() + '_';
        if (rawLower.startsWith(prefix)) {
            const suffix = raw.slice(prefix.length);
            const suffixMatch = def.options.find((o)=>o.itemId.toLowerCase() === rawLower || o.itemId.toLowerCase().endsWith('_' + suffix.toLowerCase()));
            if (suffixMatch) return {
                primary: suffixMatch.displayName,
                raw
            };
            // At least show the bare suffix rather than the full ID
            return {
                primary: suffix,
                raw
            };
        }
    }
    // 3. No definition or no match — if value looks like a full option ID (contains the definitionId as prefix),
    //    strip down to just the suffix so it's less noisy
    const prefix = definitionId.toLowerCase() + '_';
    if (rawLower.startsWith(prefix)) {
        const suffix = raw.slice(prefix.length);
        return {
            primary: suffix,
            raw
        };
    }
    return {
        primary: raw,
        raw
    };
}
function ValueCell(param) {
    let { value, definitionId = '', resolvedMap } = param;
    _s();
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!value) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "italic text-muted-foreground/60 text-xs",
        children: "—"
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 322,
        columnNumber: 24
    }, this);
    // Resolve friendly value
    const { primary, raw } = resolvedMap && definitionId ? resolveValue(value, definitionId, resolvedMap) : {
        primary: value,
        raw: value
    };
    const lines = primary.split(/\r?\n/).map((l)=>l.trim()).filter(Boolean);
    if (lines.length > 1) {
        const visible = expanded ? lines : lines.slice(0, 2);
        const hidden = lines.length - 2;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-w-0 space-y-0.5",
            children: [
                visible.map((line, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs font-mono bg-muted/40 rounded px-1.5 py-0.5 break-all",
                        children: line
                    }, i, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 336,
                        columnNumber: 43
                    }, this)),
                !expanded && hidden > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: (e)=>{
                        e.stopPropagation();
                        setExpanded(true);
                    },
                    className: "text-[10px] text-primary hover:underline",
                    children: [
                        "+",
                        hidden,
                        " more"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 337,
                    columnNumber: 45
                }, this),
                expanded && hidden > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: (e)=>{
                        e.stopPropagation();
                        setExpanded(false);
                    },
                    className: "text-[10px] text-primary hover:underline",
                    children: "show less"
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 338,
                    columnNumber: 44
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 335,
            columnNumber: 13
        }, this);
    }
    const MAX = 80;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-w-0",
        children: primary.length > MAX && !expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs break-all",
                    children: [
                        primary.slice(0, MAX),
                        "…"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 349,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: (e)=>{
                        e.stopPropagation();
                        setExpanded(true);
                    },
                    className: "ml-1 text-[10px] text-primary hover:underline",
                    children: "more"
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 350,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs break-all",
            children: primary
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 353,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 346,
        columnNumber: 9
    }, this);
}
_s(ValueCell, "DuL5jiiQQFgbn7gBKAyxwS/H4Ek=");
_c3 = ValueCell;
// ── Multi-select ───────────────────────────────────────────────────────────────
function MultiPolicySelect(param) {
    let { selectedIds, onChange, options, disabled, label, placeholder } = param;
    _s1();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const filtered = options.filter((p)=>p.name.toLowerCase().includes(search.toLowerCase()) || p.platform.toLowerCase().includes(search.toLowerCase()));
    const selected = options.filter((p)=>selectedIds.includes(p.id));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MultiPolicySelect.useEffect": ()=>{
            const h = {
                "MultiPolicySelect.useEffect.h": (e)=>{
                    if (ref.current && !ref.current.contains(e.target)) {
                        setOpen(false);
                        setSearch('');
                    }
                }
            }["MultiPolicySelect.useEffect.h"];
            document.addEventListener('mousedown', h);
            return ({
                "MultiPolicySelect.useEffect": ()=>document.removeEventListener('mousedown', h)
            })["MultiPolicySelect.useEffect"];
        }
    }["MultiPolicySelect.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MultiPolicySelect.useEffect": ()=>{
            var _inputRef_current;
            if (open) (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.focus();
        }
    }["MultiPolicySelect.useEffect"], [
        open
    ]);
    const toggle = (id)=>onChange(selectedIds.includes(id) ? selectedIds.filter((x)=>x !== id) : [
            ...selectedIds,
            id
        ]);
    const allFilteredIds = filtered.map((p)=>p.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id)=>selectedIds.includes(id));
    const someSelected = !allSelected && allFilteredIds.some((id)=>selectedIds.includes(id));
    const toggleAll = ()=>{
        if (allSelected) {
            onChange(selectedIds.filter((id)=>!allFilteredIds.includes(id)));
        } else {
            const merged = [
                ...new Set([
                    ...selectedIds,
                    ...allFilteredIds
                ])
            ];
            onChange(merged);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: ref,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium mb-2",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 390,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full min-h-11 px-3 py-2 rounded-lg border bg-background cursor-pointer flex items-start gap-2 flex-wrap transition-all ".concat(disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50', " ").concat(open ? 'ring-2 ring-primary/50 border-primary' : ''),
                onClick: ()=>!disabled && setOpen((o)=>!o),
                children: [
                    selected.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-muted-foreground text-sm self-center",
                        children: placeholder
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 394,
                        columnNumber: 23
                    }, this) : selected.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 text-xs",
                            children: [
                                p.name,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        toggle(p.id);
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 398,
                                        columnNumber: 91
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 398,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, p.id, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 396,
                            columnNumber: 25
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: "h-4 w-4 text-muted-foreground ml-auto self-center flex-shrink-0 transition-transform ".concat(open ? 'rotate-180' : '')
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 401,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 391,
                columnNumber: 13
            }, this),
            open && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-0 right-0 top-full mt-1 z-50 bg-popover border rounded-lg shadow-xl overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-2 border-b",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 407,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    ref: inputRef,
                                    type: "text",
                                    placeholder: "Search policies…",
                                    value: search,
                                    onChange: (e)=>setSearch(e.target.value),
                                    className: "w-full pl-9 pr-3 py-2 text-sm bg-background rounded border-0 outline-none focus:ring-1 focus:ring-primary/50"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 408,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 406,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 405,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-64 overflow-y-auto",
                        children: [
                            filtered.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-muted/50 border-b bg-muted/10 sticky top-0",
                                onClick: toggleAll,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ".concat(allSelected ? 'bg-primary border-primary' : someSelected ? 'bg-primary/40 border-primary' : 'border-muted-foreground/30'),
                                        children: [
                                            allSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                className: "h-3 w-3 text-primary-foreground"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 420,
                                                columnNumber: 53
                                            }, this),
                                            someSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block w-2 h-0.5 bg-primary-foreground rounded"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 421,
                                                columnNumber: 54
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 419,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-foreground",
                                        children: allSelected ? 'Deselect all' : "Select all (".concat(filtered.length, ")")
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 423,
                                        columnNumber: 33
                                    }, this),
                                    selected.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            onChange([]);
                                        },
                                        className: "ml-auto text-xs text-destructive hover:underline",
                                        children: "Clear"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 427,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 415,
                                columnNumber: 29
                            }, this),
                            filtered.length > 0 ? filtered.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-3 py-2.5 flex items-start gap-2 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ".concat(selectedIds.includes(p.id) ? 'bg-primary/5' : ''),
                                    onClick: ()=>toggle(p.id),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ".concat(selectedIds.includes(p.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'),
                                            children: selectedIds.includes(p.id) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                className: "h-3 w-3 text-primary-foreground"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 439,
                                                columnNumber: 68
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 438,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium leading-tight",
                                                    children: p.name
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 442,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: p.policyType
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 444,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "·"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 444,
                                                            columnNumber: 68
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: p.platform
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 444,
                                                            columnNumber: 82
                                                        }, this),
                                                        p.isAssigned && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            className: "text-[10px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20",
                                                            children: "Assigned"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 445,
                                                            columnNumber: 58
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 443,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 441,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, p.id, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 437,
                                    columnNumber: 29
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 text-center text-sm text-muted-foreground",
                                children: "No policies found"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 449,
                                columnNumber: 30
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 412,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 404,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 389,
        columnNumber: 9
    }, this);
}
_s1(MultiPolicySelect, "F/bIKzrrYX0LFINMG3sEIkLcBtY=");
_c4 = MultiPolicySelect;
// ── Decision helper ────────────────────────────────────────────────────────────
function DecisionCard(param) {
    let { results } = param;
    const allResults = results.flatMap((r)=>{
        var _r_checkResults;
        return (_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : [];
    });
    const total = allResults.length;
    if (total === 0) return null;
    const same = allResults.filter((c)=>c.settingCheckState === 'InBothTheSame').length;
    const conflicts = allResults.filter((c)=>c.settingCheckState === 'InBothDifferent').length;
    const newOnly = allResults.filter((c)=>c.settingCheckState === 'InSource').length;
    const conflictPolicies = [
        ...new Set(results.flatMap((r)=>{
            var _r_checkResults;
            return ((_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : []).filter((c)=>c.settingCheckState === 'InBothDifferent').map(()=>r.checkedPolicyName);
        }))
    ];
    let verdict;
    let title;
    let description;
    if (conflicts === 0 && newOnly === 0) {
        verdict = 'safe';
        title = 'Safe to enable — fully covered';
        description = 'All settings in your new policy already exist with the same values in existing policies. Enabling it adds no new enforcement.';
    } else if (conflicts === 0) {
        verdict = 'safe';
        title = 'Likely safe — no conflicts';
        description = "No conflicting settings found. ".concat(newOnly, " setting").concat(newOnly !== 1 ? 's' : '', " are unique to your new policy and would add new enforcement.");
    } else if (conflicts <= total * 0.2) {
        verdict = 'caution';
        title = 'Review before enabling — some conflicts';
        description = "".concat(conflicts, " setting").concat(conflicts !== 1 ? 's' : '', " conflict with existing policies. These may override each other depending on policy precedence.");
    } else {
        verdict = 'risk';
        title = 'High conflict — careful consideration needed';
        description = "".concat(conflicts, " out of ").concat(total, " settings conflict with existing policies. Enabling this policy will likely override or be overridden by existing configuration.");
    }
    const colors = {
        safe: {
            bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                className: "h-6 w-6 text-green-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 494,
                columnNumber: 105
            }, this),
            text: 'text-green-800 dark:text-green-200',
            sub: 'text-green-700 dark:text-green-300'
        },
        caution: {
            bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                className: "h-6 w-6 text-amber-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 495,
                columnNumber: 105
            }, this),
            text: 'text-amber-800 dark:text-amber-200',
            sub: 'text-amber-700 dark:text-amber-300'
        },
        risk: {
            bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                className: "h-6 w-6 text-red-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 496,
                columnNumber: 105
            }, this),
            text: 'text-red-800 dark:text-red-200',
            sub: 'text-red-700 dark:text-red-300'
        }
    }[verdict];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "border-2 ".concat(colors.bg),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
            className: "pt-4 pb-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 mt-0.5",
                        children: colors.icon
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 503,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-bold ".concat(colors.text),
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 505,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs mt-0.5 ".concat(colors.sub),
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 506,
                                columnNumber: 25
                            }, this),
                            conflictPolicies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex flex-wrap gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground mr-1",
                                        children: "Conflicts with:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 509,
                                        columnNumber: 33
                                    }, this),
                                    conflictPolicies.map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs px-1.5 py-0.5 rounded border bg-background",
                                            children: name
                                        }, name, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 511,
                                            columnNumber: 37
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 508,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 504,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 flex flex-col gap-1 text-right text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-green-600 font-medium",
                                children: [
                                    same,
                                    " covered"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 518,
                                columnNumber: 25
                            }, this),
                            conflicts > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-600 font-medium",
                                children: [
                                    conflicts,
                                    " conflict",
                                    conflicts !== 1 ? 's' : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 519,
                                columnNumber: 43
                            }, this),
                            newOnly > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-blue-600 font-medium",
                                children: [
                                    newOnly,
                                    " new"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 520,
                                columnNumber: 41
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 517,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 502,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 501,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 500,
        columnNumber: 9
    }, this);
}
_c5 = DecisionCard;
const coverageStatusConfig = {
    covered: {
        label: 'Covered',
        bg: 'bg-green-50/60 dark:bg-green-900/10',
        text: 'text-green-700 dark:text-green-300',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
            className: "h-4 w-4 text-green-600"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 542,
            columnNumber: 140
        }, ("TURBOPACK compile-time value", void 0))
    },
    conflict: {
        label: 'Conflict',
        bg: 'bg-red-50/60 dark:bg-red-900/10',
        text: 'text-red-700 dark:text-red-300',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
            className: "h-4 w-4 text-red-500"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 543,
            columnNumber: 141
        }, ("TURBOPACK compile-time value", void 0))
    },
    notInTenant: {
        label: 'Not in tenant',
        bg: 'bg-blue-50/40 dark:bg-blue-900/10',
        text: 'text-blue-700 dark:text-blue-300',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
            className: "h-4 w-4 text-blue-500"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 544,
            columnNumber: 141
        }, ("TURBOPACK compile-time value", void 0))
    }
};
function CoverageTab(param) {
    let { rows, summary, resolvedMap } = param;
    _s2();
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CoverageTab.useMemo[filtered]": ()=>rows.filter({
                "CoverageTab.useMemo[filtered]": (r)=>{
                    if (filter !== 'all' && r.status !== filter) return false;
                    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
                    return true;
                }
            }["CoverageTab.useMemo[filtered]"])
    }["CoverageTab.useMemo[filtered]"], [
        rows,
        filter,
        search
    ]);
    const toggle = (id)=>setExpanded((prev)=>{
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    // Coverage bar widths
    const covPct = summary.total === 0 ? 0 : Math.round(summary.covered / summary.total * 100);
    const confPct = summary.total === 0 ? 0 : Math.round(summary.conflict / summary.total * 100);
    const notPct = summary.total === 0 ? 0 : Math.round(summary.notInTenant / summary.total * 100);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-5 pb-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-end justify-between mb-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold",
                                            children: "Overall setting coverage across all compared policies"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 580,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground mt-0.5",
                                            children: "Each setting in your new policy — is it covered by at least one existing policy?"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 581,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 579,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-3xl font-bold ".concat(covPct >= 80 ? 'text-green-600' : covPct >= 50 ? 'text-amber-600' : 'text-red-600'),
                                    children: [
                                        covPct,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 585,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 578,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex h-4 w-full rounded-full overflow-hidden bg-muted gap-0.5",
                            children: [
                                covPct > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-green-500 h-full transition-all",
                                    style: {
                                        width: "".concat(covPct, "%")
                                    },
                                    title: "".concat(summary.covered, " covered")
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 588,
                                    columnNumber: 41
                                }, this),
                                confPct > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-red-400 h-full transition-all",
                                    style: {
                                        width: "".concat(confPct, "%")
                                    },
                                    title: "".concat(summary.conflict, " conflict")
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 589,
                                    columnNumber: 41
                                }, this),
                                notPct > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-blue-400 h-full transition-all",
                                    style: {
                                        width: "".concat(notPct, "%")
                                    },
                                    title: "".concat(summary.notInTenant, " not in tenant")
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 590,
                                    columnNumber: 41
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 587,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4 mt-3 text-xs flex-wrap",
                            children: [
                                {
                                    label: 'Covered',
                                    n: summary.covered,
                                    pct: covPct,
                                    color: 'bg-green-500'
                                },
                                {
                                    label: 'Conflict only',
                                    n: summary.conflict,
                                    pct: confPct,
                                    color: 'bg-red-400'
                                },
                                {
                                    label: 'Not in tenant',
                                    n: summary.notInTenant,
                                    pct: notPct,
                                    color: 'bg-blue-400'
                                }
                            ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-block w-2.5 h-2.5 rounded-sm ".concat(k.color)
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 599,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-muted-foreground",
                                            children: k.label
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 600,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: k.n
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-muted-foreground/60",
                                            children: [
                                                "(",
                                                k.pct,
                                                "%)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 602,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, k.label, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 598,
                                    columnNumber: 29
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 592,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 577,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 576,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-wrap",
                children: [
                    [
                        'all',
                        'covered',
                        'conflict',
                        'notInTenant'
                    ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setFilter(f),
                            className: "px-3 py-1.5 rounded text-xs font-medium border transition-colors ".concat(filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'),
                            children: f === 'all' ? "All (".concat(rows.length, ")") : f === 'covered' ? "Covered (".concat(summary.covered, ")") : f === 'conflict' ? "Conflict (".concat(summary.conflict, ")") : "Not in tenant (".concat(summary.notInTenant, ")")
                        }, f, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 612,
                            columnNumber: 21
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5 ml-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "h-3.5 w-3.5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 621,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search settings…",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                className: "border rounded px-2 py-1 text-xs bg-background w-48 focus:ring-1 focus:ring-primary/50 outline-none"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 622,
                                columnNumber: 21
                            }, this),
                            search && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSearch(''),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-3.5 w-3.5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 624,
                                    columnNumber: 70
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 624,
                                columnNumber: 32
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 620,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 610,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[2fr_1fr_auto] gap-3 px-4 py-2.5 bg-muted/20 border-b text-xs font-medium text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Setting"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 632,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Value in new policy"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 633,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-36 text-right",
                                children: "Overall status"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 634,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 631,
                        columnNumber: 17
                    }, this),
                    filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center text-sm text-muted-foreground",
                        children: "No settings match the current filter."
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 638,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divide-y",
                        children: filtered.map((row)=>{
                            const cfg = coverageStatusConfig[row.status];
                            const isExpanded = expanded.has(row.id);
                            const hasDetail = row.matchedIn.length > 0 || row.conflictedIn.length > 0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: cfg.bg,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-[2fr_1fr_auto] gap-3 px-4 py-3 items-center text-sm ".concat(hasDetail ? 'cursor-pointer hover:brightness-95' : ''),
                                        onClick: ()=>hasDetail && toggle(row.id),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 min-w-0",
                                                children: [
                                                    hasDetail ? isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                        className: "h-3.5 w-3.5 text-muted-foreground shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 655,
                                                        columnNumber: 55
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        className: "h-3.5 w-3.5 text-muted-foreground shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 55
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 657,
                                                        columnNumber: 51
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs font-semibold truncate",
                                                                children: row.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 660,
                                                                columnNumber: 49
                                                            }, this),
                                                            hasDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-muted-foreground mt-0.5",
                                                                children: [
                                                                    row.matchedIn.length > 0 && "".concat(row.matchedIn.length, " polic").concat(row.matchedIn.length !== 1 ? 'ies' : 'y', " match"),
                                                                    row.matchedIn.length > 0 && row.conflictedIn.length > 0 && ' · ',
                                                                    row.conflictedIn.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-600",
                                                                        children: [
                                                                            row.conflictedIn.length,
                                                                            " conflict",
                                                                            row.conflictedIn.length !== 1 ? 's' : ''
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 665,
                                                                        columnNumber: 89
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 662,
                                                                columnNumber: 53
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 659,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 652,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                value: row.sourceValue,
                                                definitionId: row.definitionId,
                                                resolvedMap: resolvedMap
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 670,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-36 flex justify-end",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ".concat(row.status === 'covered' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : row.status === 'conflict' ? 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300' : 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'),
                                                    children: [
                                                        cfg.icon,
                                                        cfg.label
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 672,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 671,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 648,
                                        columnNumber: 37
                                    }, this),
                                    isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-4 pb-3 pt-0 space-y-3 border-t bg-background/50",
                                        children: [
                                            row.matchedIn.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "pt-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-semibold uppercase text-green-700 dark:text-green-400 mb-1.5 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 688,
                                                                columnNumber: 57
                                                            }, this),
                                                            "Matched in ",
                                                            row.matchedIn.length,
                                                            " polic",
                                                            row.matchedIn.length !== 1 ? 'ies' : 'y'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 687,
                                                        columnNumber: 53
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: row.matchedIn.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 rounded px-2.5 py-1.5 border border-green-100 dark:border-green-800",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-medium truncate mr-3",
                                                                        children: m.policyName
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 693,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                                        value: m.value,
                                                                        definitionId: row.definitionId,
                                                                        resolvedMap: resolvedMap
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 694,
                                                                        columnNumber: 65
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 692,
                                                                columnNumber: 61
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 690,
                                                        columnNumber: 53
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 686,
                                                columnNumber: 49
                                            }, this),
                                            row.conflictedIn.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: row.matchedIn.length === 0 ? 'pt-3' : '',
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-semibold uppercase text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 703,
                                                                columnNumber: 57
                                                            }, this),
                                                            "Different value in ",
                                                            row.conflictedIn.length,
                                                            " polic",
                                                            row.conflictedIn.length !== 1 ? 'ies' : 'y'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 702,
                                                        columnNumber: 53
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1",
                                                        children: row.conflictedIn.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/20 rounded px-2.5 py-1.5 border border-red-100 dark:border-red-800",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-medium truncate mr-3",
                                                                        children: c.policyName
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 708,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                                        value: c.value,
                                                                        definitionId: row.definitionId,
                                                                        resolvedMap: resolvedMap
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 709,
                                                                        columnNumber: 65
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 707,
                                                                columnNumber: 61
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 705,
                                                        columnNumber: 53
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 701,
                                                columnNumber: 49
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 684,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, row.id, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 646,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 640,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 629,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 574,
        columnNumber: 9
    }, this);
}
_s2(CoverageTab, "T/WrRqvKYyhY0KiVXyCvEW5h5AU=");
_c6 = CoverageTab;
// ── Per-result card ────────────────────────────────────────────────────────────
const ResultCard = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].memo(_s3(function ResultCard(param) {
    let { result, resolvedMap } = param;
    _s3();
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedSettings, setExpandedSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Start collapsed for performance — 250+ cards can't all be open
    const [isExpanded, setIsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    var _result_checkResults;
    const cr = (_result_checkResults = result.checkResults) !== null && _result_checkResults !== void 0 ? _result_checkResults : [];
    const total = cr.length;
    const same = cr.filter((r)=>r.settingCheckState === 'InBothTheSame').length;
    const conflicts = cr.filter((r)=>r.settingCheckState === 'InBothDifferent').length;
    const newOnly = cr.filter((r)=>r.settingCheckState === 'InSource').length;
    const existOnly = cr.filter((r)=>r.settingCheckState === 'InChecked').length;
    const safePercent = total === 0 ? 0 : Math.round(same / total * 100);
    const conflictPercent = total === 0 ? 0 : Math.round(conflicts / total * 100);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ResultCard.ResultCard.useMemo[filtered]": ()=>cr.filter({
                "ResultCard.ResultCard.useMemo[filtered]": (r)=>{
                    if (statusFilter !== 'all' && r.settingCheckState !== statusFilter) return false;
                    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
                    return true;
                }
            }["ResultCard.ResultCard.useMemo[filtered]"])
    }["ResultCard.ResultCard.useMemo[filtered]"], [
        cr,
        statusFilter,
        search
    ]);
    const toggleSetting = (key)=>setExpandedSettings((prev)=>{
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    const scoreColor = safePercent >= 80 ? 'text-green-600' : safePercent >= 50 ? 'text-amber-600' : 'text-red-600';
    const conflictColor = conflictPercent > 30 ? 'text-red-600' : conflictPercent > 0 ? 'text-amber-600' : 'text-muted-foreground';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors border-b",
                onClick: ()=>setIsExpanded((e)=>!e),
                children: [
                    isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: "h-4 w-4 text-muted-foreground flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 761,
                        columnNumber: 31
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                        className: "h-4 w-4 text-muted-foreground flex-shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 761,
                        columnNumber: 105
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-semibold text-sm truncate",
                                children: result.checkedPolicyName
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 763,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground mt-0.5",
                                children: [
                                    total,
                                    " settings compared ·",
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium ".concat(scoreColor),
                                        children: [
                                            safePercent,
                                            "% covered"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 766,
                                        columnNumber: 25
                                    }, this),
                                    conflicts > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 font-medium ".concat(conflictColor),
                                        children: [
                                            "· ",
                                            conflicts,
                                            " conflict",
                                            conflicts !== 1 ? 's' : ''
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 767,
                                        columnNumber: 43
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 764,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 762,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3 text-xs flex-shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1 text-green-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 771,
                                        columnNumber: 78
                                    }, this),
                                    same
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 771,
                                columnNumber: 21
                            }, this),
                            conflicts > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1 text-red-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 772,
                                        columnNumber: 94
                                    }, this),
                                    conflicts
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 772,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1 text-blue-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 773,
                                        columnNumber: 77
                                    }, this),
                                    newOnly
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 773,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 770,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 760,
                columnNumber: 13
            }, this),
            isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "pt-0 pb-4 px-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-b",
                        children: [
                            {
                                label: 'Already covered',
                                count: same,
                                pct: smartPct(same, total),
                                bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                                cls: 'text-green-600 dark:text-green-400',
                                help: 'Same value in existing policy'
                            },
                            {
                                label: 'Conflicts',
                                count: conflicts,
                                pct: smartPct(conflicts, total),
                                bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                                cls: 'text-red-600 dark:text-red-400',
                                help: 'Different value — may override'
                            },
                            {
                                label: 'New (unique)',
                                count: newOnly,
                                pct: smartPct(newOnly, total),
                                bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                                cls: 'text-blue-600 dark:text-blue-400',
                                help: 'Only in your new policy'
                            },
                            {
                                label: 'Existing only',
                                count: existOnly,
                                pct: smartPct(existOnly, total),
                                bg: 'bg-muted border-border',
                                cls: 'text-muted-foreground',
                                help: 'Not in your new policy'
                            }
                        ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border px-3 py-2 text-center ".concat(k.bg),
                                title: k.help,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold ".concat(k.cls),
                                        children: k.count
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 788,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-medium ".concat(k.cls),
                                        children: k.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 789,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: k.pct
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 790,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, k.label, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 787,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 780,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-2 border-b space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-2.5 w-full rounded-full overflow-hidden bg-muted",
                                children: [
                                    safePercent > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-green-500 h-full",
                                        style: {
                                            width: "".concat(safePercent, "%")
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 798,
                                        columnNumber: 53
                                    }, this),
                                    conflictPercent > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-red-400 h-full",
                                        style: {
                                            width: "".concat(conflictPercent, "%")
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 799,
                                        columnNumber: 53
                                    }, this),
                                    newOnly > 0 && total > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-blue-400 h-full",
                                        style: {
                                            width: "".concat(Math.round(newOnly / total * 100), "%")
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 800,
                                        columnNumber: 58
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 797,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3 text-[10px] text-muted-foreground flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block w-2 h-2 rounded-sm bg-green-500"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 803,
                                                columnNumber: 71
                                            }, this),
                                            "Covered ",
                                            safePercent,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 803,
                                        columnNumber: 29
                                    }, this),
                                    conflictPercent > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-block w-2 h-2 rounded-sm bg-red-400"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 804,
                                                columnNumber: 95
                                            }, this),
                                            "Conflict ",
                                            conflictPercent,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 804,
                                        columnNumber: 53
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 802,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 796,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 grid grid-cols-2 gap-3 border-b",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded border-l-4 border-blue-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-blue-600 font-medium uppercase",
                                        children: "New policy (evaluating)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 811,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-medium text-blue-900 dark:text-blue-200 mt-0.5",
                                        children: result.sourcePolicyName
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 812,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 810,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-muted p-2.5 rounded border-l-4 border-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-muted-foreground font-medium uppercase",
                                        children: "Existing policy"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 815,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-medium mt-0.5",
                                        children: result.checkedPolicyName
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 816,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 814,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 809,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 flex items-center gap-2 flex-wrap border-b",
                        children: [
                            [
                                'all',
                                'InBothTheSame',
                                'InBothDifferent',
                                'InSource',
                                'InChecked'
                            ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setStatusFilter(f),
                                    className: "px-2.5 py-1 rounded text-xs font-medium border transition-colors ".concat(statusFilter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'),
                                    children: f === 'all' ? 'All' : stateLabel[f]
                                }, f, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 823,
                                    columnNumber: 29
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 ml-auto",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        className: "h-3.5 w-3.5 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 829,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search settings…",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        className: "border rounded px-2 py-1 text-xs bg-background w-44 focus:ring-1 focus:ring-primary/50 outline-none"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 830,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 828,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 821,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-muted/10 text-xs font-medium text-muted-foreground border-b",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Setting"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 837,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "New Policy Value"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 837,
                                columnNumber: 45
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Existing Policy Value"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 837,
                                columnNumber: 74
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-32 text-right",
                                children: "Decision Signal"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 837,
                                columnNumber: 108
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 836,
                        columnNumber: 21
                    }, this),
                    filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6 text-center text-sm text-muted-foreground",
                        children: "No settings match current filter."
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 841,
                        columnNumber: 27
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divide-y",
                        children: filtered.map((r, i)=>{
                            var _r_childSettings, _r_keywords, _r_keywords1;
                            const key = r.id + i;
                            const expanded = expandedSettings.has(key);
                            var _r_childSettings_length;
                            const hasChildren = ((_r_childSettings_length = (_r_childSettings = r.childSettings) === null || _r_childSettings === void 0 ? void 0 : _r_childSettings.length) !== null && _r_childSettings_length !== void 0 ? _r_childSettings_length : 0) > 0;
                            var _r_keywords_length;
                            const hasDetail = !!(r.description && r.description !== r.name) || ((_r_keywords_length = (_r_keywords = r.keywords) === null || _r_keywords === void 0 ? void 0 : _r_keywords.length) !== null && _r_keywords_length !== void 0 ? _r_keywords_length : 0) > 0 || hasChildren;
                            const rowBg = r.settingCheckState === 'InBothTheSame' ? 'bg-green-50/30 dark:bg-green-900/10' : r.settingCheckState === 'InBothDifferent' ? 'bg-red-50/30 dark:bg-red-900/10' : r.settingCheckState === 'InSource' ? 'bg-blue-50/30 dark:bg-blue-900/10' : '';
                            var _r_definitionId, _r_definitionId1;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2.5 text-sm items-start cursor-pointer hover:bg-muted/10 ".concat(rowBg),
                                        onClick: ()=>toggleSetting(key),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start gap-2 min-w-0",
                                                children: [
                                                    expanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                        className: "h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 861,
                                                        columnNumber: 59
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        className: "h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 862,
                                                        columnNumber: 59
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium break-words",
                                                        children: r.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 864,
                                                        columnNumber: 53
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 859,
                                                columnNumber: 49
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                value: r.values.sourceValue,
                                                definitionId: (_r_definitionId = r.definitionId) !== null && _r_definitionId !== void 0 ? _r_definitionId : r.id,
                                                resolvedMap: resolvedMap
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 866,
                                                columnNumber: 49
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                value: r.values.checkedValue,
                                                definitionId: (_r_definitionId1 = r.definitionId) !== null && _r_definitionId1 !== void 0 ? _r_definitionId1 : r.id,
                                                resolvedMap: resolvedMap
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 867,
                                                columnNumber: 49
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-32 flex justify-end",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                    state: r.settingCheckState
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 869,
                                                    columnNumber: 53
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 868,
                                                columnNumber: 49
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 857,
                                        columnNumber: 45
                                    }, this),
                                    expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t ".concat(rowBg),
                                        children: [
                                            hasDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-9 py-3 space-y-2 border-b bg-muted/10",
                                                children: [
                                                    r.description && r.description !== r.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground leading-relaxed",
                                                        children: r.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 880,
                                                        columnNumber: 65
                                                    }, this),
                                                    ((_r_keywords1 = r.keywords) === null || _r_keywords1 === void 0 ? void 0 : _r_keywords1.length) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-1",
                                                        children: r.keywords.map((k, ki)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[10px] px-1.5 py-0.5 rounded-full border bg-background text-muted-foreground",
                                                                children: k
                                                            }, ki, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 885,
                                                                columnNumber: 73
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 883,
                                                        columnNumber: 65
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 878,
                                                columnNumber: 57
                                            }, this),
                                            hasChildren && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-muted/5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-9 py-1.5 text-[10px] font-medium text-muted-foreground bg-muted/20 border-b",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Child Setting"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 896,
                                                                columnNumber: 65
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "New Policy"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 896,
                                                                columnNumber: 91
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Existing Policy"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 896,
                                                                columnNumber: 114
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-32"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 896,
                                                                columnNumber: 142
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 895,
                                                        columnNumber: 61
                                                    }, this),
                                                    r.childSettings.map((child, ci)=>{
                                                        const isDiff = child.sourceValue !== child.targetValue;
                                                        var _r_definitionId, _r_definitionId1;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-9 py-2 text-xs items-start border-b last:border-b-0 ".concat(isDiff ? 'bg-red-50/20 dark:bg-red-900/5' : 'bg-green-50/20 dark:bg-green-900/5'),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: child.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 902,
                                                                    columnNumber: 73
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                                    value: child.sourceValue,
                                                                    definitionId: (_r_definitionId = r.definitionId) !== null && _r_definitionId !== void 0 ? _r_definitionId : r.id,
                                                                    resolvedMap: resolvedMap
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 903,
                                                                    columnNumber: 73
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValueCell, {
                                                                    value: child.targetValue,
                                                                    definitionId: (_r_definitionId1 = r.definitionId) !== null && _r_definitionId1 !== void 0 ? _r_definitionId1 : r.id,
                                                                    resolvedMap: resolvedMap
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 904,
                                                                    columnNumber: 73
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-32 flex justify-end",
                                                                    children: isDiff ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inline-flex items-center gap-1 text-red-600 text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                                                className: "h-3 w-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 907,
                                                                                columnNumber: 153
                                                                            }, this),
                                                                            "Conflict"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 907,
                                                                        columnNumber: 83
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inline-flex items-center gap-1 text-green-600 text-xs",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                className: "h-3 w-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 908,
                                                                                columnNumber: 155
                                                                            }, this),
                                                                            "Same"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 908,
                                                                        columnNumber: 83
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 905,
                                                                    columnNumber: 73
                                                                }, this)
                                                            ]
                                                        }, ci, true, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 901,
                                                            columnNumber: 69
                                                        }, this);
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 894,
                                                columnNumber: 57
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 875,
                                        columnNumber: 49
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 855,
                                columnNumber: 41
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 843,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 778,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 759,
        columnNumber: 9
    }, this);
}, "Hkjt/lCsmOOUnDXcnccuxXqLJ2c="));
_c7 = ResultCard;
// ── Set-analysis status config ─────────────────────────────────────────────────
const setAnalysisStatusConfig = {
    Match: {
        label: 'Match',
        badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300',
        row: 'bg-green-50/20 dark:bg-green-900/5',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 931,
            columnNumber: 198
        }, ("TURBOPACK compile-time value", void 0))
    },
    Duplicate: {
        label: 'Duplicate',
        badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
        row: 'bg-amber-50/20 dark:bg-amber-900/5',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 932,
            columnNumber: 199
        }, ("TURBOPACK compile-time value", void 0))
    },
    Conflict: {
        label: 'Conflict',
        badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300',
        row: 'bg-red-50/30 dark:bg-red-900/10',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 933,
            columnNumber: 199
        }, ("TURBOPACK compile-time value", void 0))
    },
    MissingInLeft: {
        label: 'Missing in left',
        badge: 'bg-muted text-muted-foreground border-border',
        row: '',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusCircle$3e$__["MinusCircle"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 934,
            columnNumber: 200
        }, ("TURBOPACK compile-time value", void 0))
    },
    MissingInRight: {
        label: 'Missing in right',
        badge: 'bg-muted text-muted-foreground border-border',
        row: '',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusCircle$3e$__["MinusCircle"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 935,
            columnNumber: 200
        }, ("TURBOPACK compile-time value", void 0))
    },
    NewInLeft: {
        label: 'New in left',
        badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
        row: 'bg-blue-50/20 dark:bg-blue-900/5',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 936,
            columnNumber: 199
        }, ("TURBOPACK compile-time value", void 0))
    },
    NewInRight: {
        label: 'New in right',
        badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
        row: 'bg-purple-50/20 dark:bg-purple-900/5',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 937,
            columnNumber: 203
        }, ("TURBOPACK compile-time value", void 0))
    },
    Overlap: {
        label: 'Overlap',
        badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
        row: 'bg-orange-50/20 dark:bg-orange-900/5',
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
            className: "h-3 w-3"
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 938,
            columnNumber: 206
        }, ("TURBOPACK compile-time value", void 0))
    }
};
function SetAnalysisStatusBadge(param) {
    let { status } = param;
    var _setAnalysisStatusConfig_status;
    const c = (_setAnalysisStatusConfig_status = setAnalysisStatusConfig[status]) !== null && _setAnalysisStatusConfig_status !== void 0 ? _setAnalysisStatusConfig_status : {
        label: status,
        badge: 'bg-muted text-muted-foreground border-border',
        icon: null
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ".concat(c.badge),
        children: [
            c.icon,
            c.label
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 944,
        columnNumber: 9
    }, this);
}
_c8 = SetAnalysisStatusBadge;
// ── SetAnalysisView ────────────────────────────────────────────────────────────
function SetAnalysisView(param) {
    let { items, summary, resolvedMap } = param;
    _s4();
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [expandedIds, setExpandedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SetAnalysisView.useMemo[filtered]": ()=>items.filter({
                "SetAnalysisView.useMemo[filtered]": (s)=>{
                    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
                    if (search && !s.settingName.toLowerCase().includes(search.toLowerCase()) && !s.settingDefinitionId.toLowerCase().includes(search.toLowerCase())) return false;
                    return true;
                }
            }["SetAnalysisView.useMemo[filtered]"])
    }["SetAnalysisView.useMemo[filtered]"], [
        items,
        statusFilter,
        search
    ]);
    const toggle = (id)=>setExpandedIds((prev)=>{
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    const total = summary.totalSettings;
    const pct = (n)=>total === 0 ? '0%' : "".concat(Math.round(n / total * 100), "%");
    const kpis = [
        {
            label: 'Total settings',
            count: total,
            color: 'bg-muted',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                className: "h-5 w-5 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 978,
                columnNumber: 108
            }, this)
        },
        {
            label: 'Match',
            count: summary.matchCount,
            color: 'bg-green-500/10',
            status: 'Match',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-5 w-5 text-green-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 979,
                columnNumber: 134
            }, this)
        },
        {
            label: 'Duplicate',
            count: summary.duplicateCount,
            color: 'bg-amber-500/10',
            status: 'Duplicate',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                className: "h-5 w-5 text-amber-500"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 980,
                columnNumber: 134
            }, this)
        },
        {
            label: 'Conflict',
            count: summary.conflictCount,
            color: 'bg-red-500/10',
            status: 'Conflict',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                className: "h-5 w-5 text-red-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 981,
                columnNumber: 134
            }, this)
        },
        {
            label: 'New in left',
            count: summary.newInLeftCount,
            color: 'bg-blue-500/10',
            status: 'NewInLeft',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                className: "h-5 w-5 text-blue-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 982,
                columnNumber: 134
            }, this)
        },
        {
            label: 'New in right',
            count: summary.newInRightCount,
            color: 'bg-purple-500/10',
            status: 'NewInRight',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                className: "h-5 w-5 text-purple-600"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 983,
                columnNumber: 134
            }, this)
        },
        {
            label: 'Missing in left',
            count: summary.missingInLeftCount,
            color: 'bg-muted',
            status: 'MissingInLeft',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusCircle$3e$__["MinusCircle"], {
                className: "h-5 w-5 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 984,
                columnNumber: 134
            }, this)
        },
        {
            label: 'Missing in right',
            count: summary.missingInRightCount,
            color: 'bg-muted',
            status: 'MissingInRight',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$minus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MinusCircle$3e$__["MinusCircle"], {
                className: "h-5 w-5 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 985,
                columnNumber: 134
            }, this)
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
                children: kpis.map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "cursor-pointer hover:border-primary/40 transition-colors ".concat(statusFilter === k.status ? 'border-primary ring-1 ring-primary/30' : ''),
                        onClick: ()=>{
                            var _k_status;
                            return setStatusFilter(k.status === statusFilter ? 'all' : (_k_status = k.status) !== null && _k_status !== void 0 ? _k_status : 'all');
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "pt-4 pb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-1.5 rounded-lg ".concat(k.color),
                                        children: k.icon
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 998,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground leading-tight",
                                                children: k.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1000,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xl font-bold leading-tight",
                                                children: k.count
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1001,
                                                columnNumber: 37
                                            }, this),
                                            k.status && k.status !== 'all' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-muted-foreground",
                                                children: pct(k.count)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1003,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 999,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 997,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 996,
                            columnNumber: 25
                        }, this)
                    }, k.label, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 993,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 991,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-3 w-full rounded-full overflow-hidden bg-muted gap-px",
                children: [
                    summary.matchCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-green-500 h-full",
                        style: {
                            width: pct(summary.matchCount)
                        },
                        title: "Match: ".concat(summary.matchCount)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1014,
                        columnNumber: 48
                    }, this),
                    summary.duplicateCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-amber-400 h-full",
                        style: {
                            width: pct(summary.duplicateCount)
                        },
                        title: "Duplicate: ".concat(summary.duplicateCount)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1015,
                        columnNumber: 48
                    }, this),
                    summary.conflictCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-400 h-full",
                        style: {
                            width: pct(summary.conflictCount)
                        },
                        title: "Conflict: ".concat(summary.conflictCount)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1016,
                        columnNumber: 48
                    }, this),
                    summary.newInLeftCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-blue-400 h-full",
                        style: {
                            width: pct(summary.newInLeftCount)
                        },
                        title: "New in left: ".concat(summary.newInLeftCount)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1017,
                        columnNumber: 48
                    }, this),
                    summary.newInRightCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-purple-400 h-full",
                        style: {
                            width: pct(summary.newInRightCount)
                        },
                        title: "New in right: ".concat(summary.newInRightCount)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1018,
                        columnNumber: 49
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1013,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: statusFilter === 'all' ? 'default' : 'outline',
                        size: "sm",
                        onClick: ()=>setStatusFilter('all'),
                        className: "text-xs h-7 px-2.5",
                        children: [
                            "All (",
                            total,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1023,
                        columnNumber: 17
                    }, this),
                    [
                        'Match',
                        'Duplicate',
                        'Conflict',
                        'NewInLeft',
                        'NewInRight',
                        'MissingInLeft',
                        'MissingInRight'
                    ].map((s)=>{
                        const c = kpis.find((k)=>k.status === s);
                        if (!c || c.count === 0) return null;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: statusFilter === s ? 'default' : 'outline',
                            size: "sm",
                            onClick: ()=>setStatusFilter(statusFilter === s ? 'all' : s),
                            className: "text-xs h-7 px-2.5",
                            children: [
                                setAnalysisStatusConfig[s].label,
                                " (",
                                c.count,
                                ")"
                            ]
                        }, s, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 1031,
                            columnNumber: 25
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 ml-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "h-3.5 w-3.5 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1038,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search settings…",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                className: "border rounded px-2 py-1 text-xs bg-background w-48 outline-none focus:ring-1 focus:ring-primary/50"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1039,
                                columnNumber: 21
                            }, this),
                            search && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSearch(''),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-3.5 w-3.5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1042,
                                    columnNumber: 70
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1042,
                                columnNumber: 32
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1037,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1022,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[2fr_2fr_2fr_auto] gap-3 px-4 py-2.5 bg-muted/10 border-b text-xs font-medium text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Setting"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1049,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-blue-700 dark:text-blue-300",
                                children: "← Left policies"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1050,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-purple-700 dark:text-purple-300",
                                children: "Right policies →"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1051,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-32 text-right",
                                children: "Status"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1052,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1048,
                        columnNumber: 17
                    }, this),
                    filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center text-sm text-muted-foreground",
                        children: "No settings match the current filter."
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1055,
                        columnNumber: 23
                    }, this) : filtered.map((item)=>{
                        var _setAnalysisStatusConfig_item_status;
                        const cfg = (_setAnalysisStatusConfig_item_status = setAnalysisStatusConfig[item.status]) !== null && _setAnalysisStatusConfig_item_status !== void 0 ? _setAnalysisStatusConfig_item_status : {
                            label: item.status,
                            badge: 'bg-muted text-muted-foreground border-border',
                            row: '',
                            icon: null
                        };
                        const isExpanded = expandedIds.has(item.settingDefinitionId);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-b last:border-b-0 ".concat(cfg.row),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-[2fr_2fr_2fr_auto] gap-3 px-4 py-2.5 items-start cursor-pointer hover:bg-muted/10",
                                    onClick: ()=>toggle(item.settingDefinitionId),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-1.5 min-w-0",
                                            children: [
                                                isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    className: "h-3 w-3 text-muted-foreground shrink-0 mt-0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1067,
                                                    columnNumber: 47
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    className: "h-3 w-3 text-muted-foreground shrink-0 mt-0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1068,
                                                    columnNumber: 47
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-medium break-words",
                                                            children: item.settingName
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1070,
                                                            columnNumber: 45
                                                        }, this),
                                                        item.settingName !== item.settingDefinitionId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block font-mono text-[10px] text-muted-foreground/50 break-all",
                                                            children: item.settingDefinitionId
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1072,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1069,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1065,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 space-y-0.5",
                                            onClick: (e)=>e.stopPropagation(),
                                            children: [
                                                item.leftOccurrences.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "italic text-muted-foreground/50 text-xs",
                                                    children: "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1079,
                                                    columnNumber: 47
                                                }, this) : (()=>{
                                                    const uniqueVals = [
                                                        ...new Map(item.leftOccurrences.map((o)=>[
                                                                o.value,
                                                                o
                                                            ])).values()
                                                    ];
                                                    return uniqueVals.map((o, i)=>{
                                                        const friendly = resolvedMap.size > 0 ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary : o.value;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-blue-800 dark:text-blue-200",
                                                            children: friendly
                                                        }, i, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1086,
                                                            columnNumber: 60
                                                        }, this);
                                                    });
                                                })(),
                                                item.leftOccurrences.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-muted-foreground",
                                                    children: [
                                                        item.leftOccurrences.length,
                                                        " ",
                                                        item.leftOccurrences.length === 1 ? 'policy' : 'policies'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1091,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1077,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 space-y-0.5",
                                            onClick: (e)=>e.stopPropagation(),
                                            children: [
                                                item.rightOccurrences.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "italic text-muted-foreground/50 text-xs",
                                                    children: "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1097,
                                                    columnNumber: 47
                                                }, this) : (()=>{
                                                    const uniqueVals = [
                                                        ...new Map(item.rightOccurrences.map((o)=>[
                                                                o.value,
                                                                o
                                                            ])).values()
                                                    ];
                                                    return uniqueVals.map((o, i)=>{
                                                        const friendly = resolvedMap.size > 0 ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary : o.value;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-purple-800 dark:text-purple-200",
                                                            children: friendly
                                                        }, i, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1104,
                                                            columnNumber: 60
                                                        }, this);
                                                    });
                                                })(),
                                                item.rightOccurrences.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] text-muted-foreground",
                                                    children: [
                                                        item.rightOccurrences.length,
                                                        " ",
                                                        item.rightOccurrences.length === 1 ? 'policy' : 'policies'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1109,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1095,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "shrink-0 w-32 flex justify-end",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SetAnalysisStatusBadge, {
                                                status: item.status
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1113,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1112,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1062,
                                    columnNumber: 33
                                }, this),
                                isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-4 pb-4 pt-2 border-t bg-muted/5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2",
                                                        children: [
                                                            "Left — ",
                                                            item.leftOccurrences.length,
                                                            " ",
                                                            item.leftOccurrences.length === 1 ? 'policy' : 'policies'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1122,
                                                        columnNumber: 49
                                                    }, this),
                                                    item.leftOccurrences.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "italic text-xs text-muted-foreground/50",
                                                        children: "Not present"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1126,
                                                        columnNumber: 55
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1.5",
                                                        children: item.leftOccurrences.map((o, i)=>{
                                                            const friendly = resolvedMap.size > 0 ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary : o.value;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs space-y-0.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "font-medium text-blue-700 dark:text-blue-300 truncate",
                                                                        title: o.policyName,
                                                                        children: o.policyName
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1134,
                                                                        columnNumber: 69
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-muted-foreground",
                                                                        children: friendly
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1135,
                                                                        columnNumber: 69
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1133,
                                                                columnNumber: 65
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1127,
                                                        columnNumber: 55
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1121,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2",
                                                        children: [
                                                            "Right — ",
                                                            item.rightOccurrences.length,
                                                            " ",
                                                            item.rightOccurrences.length === 1 ? 'policy' : 'policies'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1143,
                                                        columnNumber: 49
                                                    }, this),
                                                    item.rightOccurrences.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "italic text-xs text-muted-foreground/50",
                                                        children: "Not present"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1147,
                                                        columnNumber: 55
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1.5",
                                                        children: item.rightOccurrences.map((o, i)=>{
                                                            const friendly = resolvedMap.size > 0 ? resolveValue(o.value, item.settingDefinitionId, resolvedMap).primary : o.value;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs space-y-0.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "font-medium text-purple-700 dark:text-purple-300 truncate",
                                                                        title: o.policyName,
                                                                        children: o.policyName
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1155,
                                                                        columnNumber: 69
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-muted-foreground",
                                                                        children: friendly
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1156,
                                                                        columnNumber: 69
                                                                    }, this)
                                                                ]
                                                            }, i, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1154,
                                                                columnNumber: 65
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1148,
                                                        columnNumber: 55
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1142,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1120,
                                        columnNumber: 41
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1119,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, item.settingDefinitionId, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 1060,
                            columnNumber: 29
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1047,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-muted-foreground text-right",
                children: [
                    "Showing ",
                    filtered.length,
                    " of ",
                    total,
                    " settings"
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1171,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 989,
        columnNumber: 9
    }, this);
}
_s4(SetAnalysisView, "L6PbSk+JYQkFb6N9zlFItWbM+tk=");
_c9 = SetAnalysisView;
// ── Scope tag filter ───────────────────────────────────────────────────────────
function ScopeTagFilter(param) {
    let { scopeTags, value, onChange, label } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "text-xs text-muted-foreground whitespace-nowrap",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1186,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: value,
                onChange: (e)=>onChange(e.target.value),
                className: "flex-1 rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        children: "All scope tags"
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1189,
                        columnNumber: 17
                    }, this),
                    scopeTags.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: t.id,
                            children: t.displayName
                        }, t.id, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 1190,
                            columnNumber: 37
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1187,
                columnNumber: 13
            }, this),
            value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onChange(''),
                className: "text-muted-foreground hover:text-foreground",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "h-3.5 w-3.5"
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 1194,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1193,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 1185,
        columnNumber: 9
    }, this);
}
_c10 = ScopeTagFilter;
function PolicyComparison() {
    _s5();
    const { accounts, instance } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const { request } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"])();
    const [policies, setPolicies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [scopeTags, setScopeTags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingScopeTags, setLoadingScopeTags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sourcePolicyIds, setSourcePolicyIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [leftScopeTagFilter, setLeftScopeTagFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [existingPolicyIds, setExistingPolicyIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [rightScopeTagFilter, setRightScopeTagFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [setAnalysisItems, setSetAnalysisItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [setAnalysisSummary, setSetAnalysisSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [resolvedMap, setResolvedMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [loadingPolicies, setLoadingPolicies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [comparing, setComparing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectionCollapsed, setSelectionCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('coverage');
    const [batchProgress, setBatchProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [detailFilter, setDetailFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [pageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(10);
    const abortRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const BATCH_SIZE = 25;
    const fetchScopeTags = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PolicyComparison.useCallback[fetchScopeTags]": async ()=>{
            if (!accounts.length) return;
            setLoadingScopeTags(true);
            try {
                var _resp_data;
                const resp = await request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_SCOPETAGS_ENDPOINT"], {
                    method: 'GET'
                });
                const raw = resp === null || resp === void 0 ? void 0 : (_resp_data = resp.data) === null || _resp_data === void 0 ? void 0 : _resp_data.data;
                setScopeTags(Array.isArray(raw) ? raw : []);
            } catch (e) {} finally{
                setLoadingScopeTags(false);
            }
        }
    }["PolicyComparison.useCallback[fetchScopeTags]"], [
        accounts,
        request
    ]);
    const fetchPolicies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PolicyComparison.useCallback[fetchPolicies]": async ()=>{
            if (!accounts.length) return;
            setLoadingPolicies(true);
            setError(null);
            try {
                var _data, _this, _this1;
                const response = await request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONFIGURATION_POLICIES_ENDPOINT"]);
                var _data_data;
                const data = (_data_data = (_this = response === null || response === void 0 ? void 0 : response.data) === null || _this === void 0 ? void 0 : (_data = _this.data) === null || _data === void 0 ? void 0 : _data.data) !== null && _data_data !== void 0 ? _data_data : (_this1 = response === null || response === void 0 ? void 0 : response.data) === null || _this1 === void 0 ? void 0 : _this1.data;
                if (Array.isArray(data)) setPolicies(data);
                else throw new Error('Unexpected response format');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch policies');
            } finally{
                setLoadingPolicies(false);
            }
        }
    }["PolicyComparison.useCallback[fetchPolicies]"], [
        accounts.length,
        request
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PolicyComparison.useEffect": ()=>{
            if (accounts.length) fetchScopeTags();
        }
    }["PolicyComparison.useEffect"], [
        accounts.length
    ]);
    /** Helper: does a policy have a given scope tag ID */ const policyHasTag = (p, tagId)=>{
        var _p_roleScopeTags, _p_roleScopeTagIds;
        return ((_p_roleScopeTags = p.roleScopeTags) === null || _p_roleScopeTags === void 0 ? void 0 : _p_roleScopeTags.includes(tagId)) || ((_p_roleScopeTagIds = p.roleScopeTagIds) === null || _p_roleScopeTagIds === void 0 ? void 0 : _p_roleScopeTagIds.includes(tagId)) || false;
    };
    /** Left-side options: filtered by left scope tag */ const leftPolicyOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[leftPolicyOptions]": ()=>leftScopeTagFilter ? policies.filter({
                "PolicyComparison.useMemo[leftPolicyOptions]": (p)=>policyHasTag(p, leftScopeTagFilter)
            }["PolicyComparison.useMemo[leftPolicyOptions]"]) : policies
    }["PolicyComparison.useMemo[leftPolicyOptions]"], [
        policies,
        leftScopeTagFilter
    ]);
    /** Right-side options: filtered by right scope tag, and optionally narrowed
     *  to platform/type that at least one left policy shares */ const existingPolicyOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[existingPolicyOptions]": ()=>{
            let opts = policies.filter({
                "PolicyComparison.useMemo[existingPolicyOptions].opts": (p)=>!sourcePolicyIds.includes(p.id)
            }["PolicyComparison.useMemo[existingPolicyOptions].opts"]);
            // Scope tag filter
            if (rightScopeTagFilter) opts = opts.filter({
                "PolicyComparison.useMemo[existingPolicyOptions]": (p)=>policyHasTag(p, rightScopeTagFilter)
            }["PolicyComparison.useMemo[existingPolicyOptions]"]);
            // If left policies selected, optionally limit to matching platform/type combos
            if (sourcePolicyIds.length > 0) {
                const sourcePolicies = policies.filter({
                    "PolicyComparison.useMemo[existingPolicyOptions].sourcePolicies": (p)=>sourcePolicyIds.includes(p.id)
                }["PolicyComparison.useMemo[existingPolicyOptions].sourcePolicies"]);
                const combos = new Set(sourcePolicies.map({
                    "PolicyComparison.useMemo[existingPolicyOptions]": (p)=>"".concat(p.platform, "|").concat(p.policyType)
                }["PolicyComparison.useMemo[existingPolicyOptions]"]));
                opts = opts.filter({
                    "PolicyComparison.useMemo[existingPolicyOptions]": (p)=>combos.has("".concat(p.platform, "|").concat(p.policyType))
                }["PolicyComparison.useMemo[existingPolicyOptions]"]);
            }
            return opts;
        }
    }["PolicyComparison.useMemo[existingPolicyOptions]"], [
        policies,
        sourcePolicyIds,
        rightScopeTagFilter
    ]);
    const cancelCompare = ()=>{
        var _abortRef_current;
        (_abortRef_current = abortRef.current) === null || _abortRef_current === void 0 ? void 0 : _abortRef_current.abort();
        abortRef.current = null;
        setComparing(false);
        setBatchProgress(null);
    };
    const runCompare = async ()=>{
        var _abortRef_current;
        if (sourcePolicyIds.length === 0 || existingPolicyIds.length === 0 || !accounts.length) return;
        (_abortRef_current = abortRef.current) === null || _abortRef_current === void 0 ? void 0 : _abortRef_current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setComparing(true);
        setError(null);
        setResolvedMap(new Map());
        setResults([]);
        setSetAnalysisItems(null);
        setSetAnalysisSummary(null);
        setPage(0);
        try {
            const tokenResp = await instance.acquireTokenSilent({
                scopes: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$msalConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiScope"]
                ],
                account: accounts[0]
            });
            const accessToken = tokenResp.accessToken;
            const allResults = [];
            const sourcePolicies = policies.filter((p)=>sourcePolicyIds.includes(p.id));
            const existingPolicies = policies.filter((p)=>existingPolicyIds.includes(p.id));
            if (sourcePolicyIds.length === 1) {
                // ── Single source: group right-side by type and send a request per type ──
                const sourcePolicy = sourcePolicies[0];
                var _sourcePolicy_policyType;
                const policyType = (_sourcePolicy_policyType = sourcePolicy === null || sourcePolicy === void 0 ? void 0 : sourcePolicy.policyType) !== null && _sourcePolicy_policyType !== void 0 ? _sourcePolicy_policyType : 'SettingsCatalog';
                // Only compare right-side policies of the same type
                const matchingRight = existingPolicies.filter((p)=>p.policyType === policyType).map((p)=>p.id);
                if (matchingRight.length === 0) {
                    setError('No existing policies of the same type as the selected source policy.');
                    setComparing(false);
                    return;
                }
                const batches = [];
                for(let i = 0; i < matchingRight.length; i += BATCH_SIZE)batches.push(matchingRight.slice(i, i + BATCH_SIZE));
                setBatchProgress({
                    done: 0,
                    total: batches.length
                });
                for(let b = 0; b < batches.length; b++){
                    var _response_data;
                    if (controller.signal.aborted) return;
                    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMPARE_ENDPOINT"], "/").concat(policyType), {
                        method: 'POST',
                        body: JSON.stringify({
                            SourcePolicyId: sourcePolicyIds[0],
                            ComparePolicyIds: batches[b]
                        }),
                        signal: controller.signal
                    }, accessToken);
                    if (controller.signal.aborted) return;
                    const raw = response === null || response === void 0 ? void 0 : (_response_data = response.data) === null || _response_data === void 0 ? void 0 : _response_data.data;
                    if (raw) {
                        const batchArr = Array.isArray(raw) ? raw : [
                            raw
                        ];
                        allResults.push(...batchArr);
                        setResults([
                            ...allResults
                        ]);
                    }
                    setBatchProgress({
                        done: b + 1,
                        total: batches.length
                    });
                }
            } else {
                // ── Multiple sources: group by policyType and send one set-analysis request per type ──
                // Build a map: policyType → { leftIds, rightIds }
                const typeGroups = new Map();
                for (const p of sourcePolicies){
                    if (!typeGroups.has(p.policyType)) typeGroups.set(p.policyType, {
                        leftIds: [],
                        rightIds: []
                    });
                    typeGroups.get(p.policyType).leftIds.push(p.id);
                }
                for (const p of existingPolicies){
                    if (typeGroups.has(p.policyType)) {
                        typeGroups.get(p.policyType).rightIds.push(p.id);
                    }
                // Silently skip right-side policies whose type has no left-side counterpart
                }
                const typeEntries = [
                    ...typeGroups.entries()
                ].filter((param)=>{
                    let [, g] = param;
                    return g.leftIds.length > 0 && g.rightIds.length > 0;
                });
                if (typeEntries.length === 0) {
                    setError('No matching policy types between left and right selections. Please compare policies of the same type.');
                    setComparing(false);
                    return;
                }
                setBatchProgress({
                    done: 0,
                    total: typeEntries.length
                });
                const allSetItems = [];
                let mergedSummary = null;
                for(let t = 0; t < typeEntries.length; t++){
                    var _this, _this1;
                    if (controller.signal.aborted) return;
                    const [policyType, group] = typeEntries[t];
                    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMPARE_SET_ANALYSIS_ENDPOINT"])(policyType), {
                        method: 'POST',
                        body: JSON.stringify({
                            leftPolicyIds: group.leftIds,
                            rightPolicyIds: group.rightIds
                        }),
                        signal: controller.signal
                    }, accessToken);
                    if (controller.signal.aborted) return;
                    const rawResp = response === null || response === void 0 ? void 0 : response.data;
                    const saResp = (rawResp === null || rawResp === void 0 ? void 0 : rawResp.summary) !== undefined && Array.isArray(rawResp === null || rawResp === void 0 ? void 0 : rawResp.data) ? rawResp : ((_this = rawResp === null || rawResp === void 0 ? void 0 : rawResp.data) === null || _this === void 0 ? void 0 : _this.summary) !== undefined && Array.isArray((_this1 = rawResp === null || rawResp === void 0 ? void 0 : rawResp.data) === null || _this1 === void 0 ? void 0 : _this1.data) ? rawResp.data : null;
                    if (saResp === null || saResp === void 0 ? void 0 : saResp.data) {
                        allSetItems.push(...saResp.data.map((item)=>({
                                ...item,
                                status: normalizeSetAnalysisStatus(item.status)
                            })));
                        if (!mergedSummary) {
                            mergedSummary = {
                                ...saResp.summary
                            };
                        } else {
                            // Merge summaries across types
                            const s = saResp.summary;
                            mergedSummary.leftPolicyCount += s.leftPolicyCount;
                            mergedSummary.rightPolicyCount += s.rightPolicyCount;
                            mergedSummary.matchCount += s.matchCount;
                            mergedSummary.overlapCount += s.overlapCount;
                            mergedSummary.conflictCount += s.conflictCount;
                            mergedSummary.duplicateCount += s.duplicateCount;
                            mergedSummary.missingInRightCount += s.missingInRightCount;
                            mergedSummary.missingInLeftCount += s.missingInLeftCount;
                            mergedSummary.totalSettings += s.totalSettings;
                            mergedSummary.newInLeftCount += s.newInLeftCount;
                            mergedSummary.newInRightCount += s.newInRightCount;
                        }
                    }
                    setBatchProgress({
                        done: t + 1,
                        total: typeEntries.length
                    });
                }
                if (allSetItems.length > 0 && mergedSummary) {
                    setSetAnalysisItems(allSetItems);
                    setSetAnalysisSummary(mergedSummary);
                    // Resolve definitions for friendly values
                    const ids = [
                        ...new Set(allSetItems.map((i)=>i.settingDefinitionId))
                    ];
                    if (ids.length > 0) {
                        try {
                            var _resolveResp_data;
                            const resolveResp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT"], {
                                method: 'POST',
                                body: JSON.stringify(ids)
                            }, accessToken);
                            var _resolveResp_data_data;
                            const defs = (_resolveResp_data_data = resolveResp === null || resolveResp === void 0 ? void 0 : (_resolveResp_data = resolveResp.data) === null || _resolveResp_data === void 0 ? void 0 : _resolveResp_data.data) !== null && _resolveResp_data_data !== void 0 ? _resolveResp_data_data : [];
                            const map = new Map();
                            defs.forEach((d)=>map.set(d.id.toLowerCase(), d));
                            setResolvedMap(map);
                        } catch (e) {}
                    }
                }
            }
            setSelectionCollapsed(true);
            setActiveTab('coverage');
            // Resolve setting definitions for friendly value display
            try {
                const settingIds = [
                    ...new Set(allResults.flatMap((r)=>{
                        var _r_checkResults;
                        return ((_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : []).map((c)=>{
                            var _c_definitionId;
                            return (_c_definitionId = c.definitionId) !== null && _c_definitionId !== void 0 ? _c_definitionId : c.id;
                        }).filter(Boolean);
                    }))
                ];
                if (settingIds.length > 0) {
                    var _resolveResp_data1;
                    const resolveResp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT"], {
                        method: 'POST',
                        body: JSON.stringify(settingIds)
                    }, accessToken);
                    var _resolveResp_data_data1;
                    const defs = (_resolveResp_data_data1 = resolveResp === null || resolveResp === void 0 ? void 0 : (_resolveResp_data1 = resolveResp.data) === null || _resolveResp_data1 === void 0 ? void 0 : _resolveResp_data1.data) !== null && _resolveResp_data_data1 !== void 0 ? _resolveResp_data_data1 : [];
                    const map = new Map();
                    defs.forEach((d)=>map.set(d.id.toLowerCase(), d));
                    setResolvedMap(map);
                }
            } catch (e) {}
        } catch (err) {
            var _this2;
            if (((_this2 = err) === null || _this2 === void 0 ? void 0 : _this2.name) !== 'AbortError') setError(err instanceof Error ? err.message : 'Comparison failed');
        } finally{
            if (!controller.signal.aborted) {
                abortRef.current = null;
                setComparing(false);
                setBatchProgress(null);
            }
        }
    };
    const globalSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[globalSummary]": ()=>{
            if (!results.length) return null;
            let total = 0, same = 0, conflicts = 0, newOnly = 0, existOnly = 0;
            for (const r of results){
                var _r_checkResults;
                const cr = (_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : [];
                total += cr.length;
                same += cr.filter({
                    "PolicyComparison.useMemo[globalSummary]": (c)=>c.settingCheckState === 'InBothTheSame'
                }["PolicyComparison.useMemo[globalSummary]"]).length;
                conflicts += cr.filter({
                    "PolicyComparison.useMemo[globalSummary]": (c)=>c.settingCheckState === 'InBothDifferent'
                }["PolicyComparison.useMemo[globalSummary]"]).length;
                newOnly += cr.filter({
                    "PolicyComparison.useMemo[globalSummary]": (c)=>c.settingCheckState === 'InSource'
                }["PolicyComparison.useMemo[globalSummary]"]).length;
                existOnly += cr.filter({
                    "PolicyComparison.useMemo[globalSummary]": (c)=>c.settingCheckState === 'InChecked'
                }["PolicyComparison.useMemo[globalSummary]"]).length;
            }
            return {
                total,
                same,
                conflicts,
                newOnly,
                existOnly,
                policies: results.length,
                coveredPercent: total === 0 ? 0 : Math.round(same / total * 100),
                conflictPercent: total === 0 ? 0 : Math.round(conflicts / total * 100),
                newPercent: total === 0 ? 0 : Math.round(newOnly / total * 100)
            };
        }
    }["PolicyComparison.useMemo[globalSummary]"], [
        results
    ]);
    /** Per-setting aggregate across ALL compared policies.
     *  Priority: InBothTheSame > InBothDifferent > InSource (not in any policy) */ const settingCoverage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[settingCoverage]": ()=>{
            if (!results.length) return [];
            // Collect all settings that come from the source (new) policy
            // i.e. InSource, InBothTheSame, InBothDifferent — anything the new policy *has*
            const map = new Map();
            for (const r of results){
                var _r_checkResults;
                for (const c of (_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : []){
                    if (c.settingCheckState === 'InChecked') continue; // only in existing, not in new policy
                    const key = c.id;
                    if (!map.has(key)) {
                        var _c_values;
                        var _c_definitionId, _c_values_sourceValue;
                        map.set(key, {
                            id: c.id,
                            definitionId: (_c_definitionId = c.definitionId) !== null && _c_definitionId !== void 0 ? _c_definitionId : c.id,
                            name: c.name,
                            sourceValue: (_c_values_sourceValue = (_c_values = c.values) === null || _c_values === void 0 ? void 0 : _c_values.sourceValue) !== null && _c_values_sourceValue !== void 0 ? _c_values_sourceValue : '',
                            status: 'notInTenant',
                            matchedIn: [],
                            conflictedIn: []
                        });
                    }
                    const row = map.get(key);
                    if (c.settingCheckState === 'InBothTheSame') {
                        var _c_values1;
                        var _c_values_checkedValue;
                        row.matchedIn.push({
                            policyName: r.checkedPolicyName,
                            value: (_c_values_checkedValue = (_c_values1 = c.values) === null || _c_values1 === void 0 ? void 0 : _c_values1.checkedValue) !== null && _c_values_checkedValue !== void 0 ? _c_values_checkedValue : ''
                        });
                    } else if (c.settingCheckState === 'InBothDifferent') {
                        var _c_values2;
                        var _c_values_checkedValue1;
                        row.conflictedIn.push({
                            policyName: r.checkedPolicyName,
                            value: (_c_values_checkedValue1 = (_c_values2 = c.values) === null || _c_values2 === void 0 ? void 0 : _c_values2.checkedValue) !== null && _c_values_checkedValue1 !== void 0 ? _c_values_checkedValue1 : ''
                        });
                    }
                    // Re-derive status from accumulated data
                    if (row.matchedIn.length > 0) {
                        row.status = 'covered';
                    } else if (row.conflictedIn.length > 0) {
                        row.status = 'conflict';
                    }
                }
            }
            // Sort: notInTenant first, then conflict, then covered
            const order = {
                notInTenant: 0,
                conflict: 1,
                covered: 2
            };
            return [
                ...map.values()
            ].sort({
                "PolicyComparison.useMemo[settingCoverage]": (a, b)=>order[a.status] - order[b.status]
            }["PolicyComparison.useMemo[settingCoverage]"]);
        }
    }["PolicyComparison.useMemo[settingCoverage]"], [
        results
    ]);
    const coverageSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[coverageSummary]": ()=>{
            if (!settingCoverage.length) return null;
            const total = settingCoverage.length;
            const covered = settingCoverage.filter({
                "PolicyComparison.useMemo[coverageSummary]": (s)=>s.status === 'covered'
            }["PolicyComparison.useMemo[coverageSummary]"]).length;
            const conflict = settingCoverage.filter({
                "PolicyComparison.useMemo[coverageSummary]": (s)=>s.status === 'conflict'
            }["PolicyComparison.useMemo[coverageSummary]"]).length;
            const notInTenant = settingCoverage.filter({
                "PolicyComparison.useMemo[coverageSummary]": (s)=>s.status === 'notInTenant'
            }["PolicyComparison.useMemo[coverageSummary]"]).length;
            return {
                total,
                covered,
                conflict,
                notInTenant
            };
        }
    }["PolicyComparison.useMemo[coverageSummary]"], [
        settingCoverage
    ]);
    const exportCSV = ()=>{
        if (!results.length) return;
        const rows = results.flatMap((r)=>{
            var _r_checkResults;
            return ((_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : []).map((c)=>({
                    'New Policy': r.sourcePolicyName,
                    'Existing Policy': r.checkedPolicyName,
                    'Setting': c.name,
                    'Setting ID': c.id,
                    'New Policy Value': c.values.sourceValue,
                    'Existing Policy Value': c.values.checkedValue,
                    'Decision Signal': stateLabel[c.settingCheckState]
                }));
        });
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map((r)=>headers.map((h)=>{
                    var _r_h;
                    return '"'.concat(((_r_h = r[h]) !== null && _r_h !== void 0 ? _r_h : '').replace(/"/g, '""'), '"');
                }).join(','))
        ].join('\n');
        const blob = new Blob([
            csv
        ], {
            type: 'text/csv'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'policy-decision-analysis.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
    // Card-level pagination for the detail view
    const filteredResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[filteredResults]": ()=>{
            if (!detailFilter) return results;
            // Only show policies that actually have conflicts or new-only settings
            return results.filter({
                "PolicyComparison.useMemo[filteredResults]": (r)=>{
                    var _r_checkResults;
                    return ((_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : []).some({
                        "PolicyComparison.useMemo[filteredResults]": (c)=>c.settingCheckState === 'InBothDifferent' || c.settingCheckState === 'InSource'
                    }["PolicyComparison.useMemo[filteredResults]"]);
                }
            }["PolicyComparison.useMemo[filteredResults]"]);
        }
    }["PolicyComparison.useMemo[filteredResults]"], [
        results,
        detailFilter
    ]);
    const pageCount = Math.ceil(filteredResults.length / pageSize);
    const pagedResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PolicyComparison.useMemo[pagedResults]": ()=>filteredResults.slice(page * pageSize, (page + 1) * pageSize)
    }["PolicyComparison.useMemo[pagedResults]"], [
        filteredResults,
        page,
        pageSize
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto p-6 space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                        className: "h-6 w-6 text-primary"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1587,
                                        columnNumber: 25
                                    }, this),
                                    "Compare existing policies in your environment"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1586,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground mt-1",
                                children: "Select a new (unassigned) policy and compare it against existing policies to identify coverage, conflicts, and unique settings before enabling it."
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1590,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1585,
                        columnNumber: 17
                    }, this),
                    results.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            comparing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: cancelCompare,
                                className: "border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1598,
                                        columnNumber: 33
                                    }, this),
                                    "Cancel"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1597,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: runCompare,
                                disabled: sourcePolicyIds.length === 0 || existingPolicyIds.length === 0,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        className: "h-4 w-4 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1602,
                                        columnNumber: 33
                                    }, this),
                                    "Re-run"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1601,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: exportCSV,
                                disabled: comparing,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        className: "h-4 w-4 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1606,
                                        columnNumber: 29
                                    }, this),
                                    "Export CSV"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1605,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1595,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1584,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "cursor-pointer select-none",
                        onClick: ()=>setSelectionCollapsed((c)=>!c),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                className: "text-base flex items-center gap-2",
                                children: [
                                    selectionCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: "h-4 w-4 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1616,
                                        columnNumber: 47
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        className: "h-4 w-4 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1616,
                                        columnNumber: 108
                                    }, this),
                                    "Policy Selection",
                                    selectionCollapsed && sourcePolicyIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 flex gap-1.5 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                className: "text-xs bg-blue-100 text-blue-800 border-blue-200",
                                                children: [
                                                    sourcePolicyIds.length,
                                                    " source ",
                                                    sourcePolicyIds.length === 1 ? 'policy' : 'policies'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1620,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-muted-foreground self-center",
                                                children: [
                                                    "vs ",
                                                    existingPolicyIds.length,
                                                    " existing"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1621,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1619,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1615,
                                columnNumber: 21
                            }, this),
                            !selectionCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                className: "mt-1",
                                children: [
                                    "Select one or more ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "source policies"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1627,
                                        columnNumber: 48
                                    }, this),
                                    " on the left and one or more ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "target policies"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1627,
                                        columnNumber: 109
                                    }, this),
                                    " on the right. Use scope tag filters to quickly narrow down each side.",
                                    policies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            " Found ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: policies.length
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1629,
                                                columnNumber: 62
                                            }, this),
                                            " policies."
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1626,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1614,
                        columnNumber: 17
                    }, this),
                    !selectionCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-4",
                        onClick: (e)=>e.stopPropagation(),
                        children: policies.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center gap-4 py-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                                    className: "h-12 w-12 text-muted-foreground/40"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1638,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-muted-foreground text-sm",
                                    children: "Load policies to get started."
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1639,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: fetchPolicies,
                                    disabled: loadingPolicies,
                                    className: "gap-2",
                                    children: [
                                        loadingPolicies ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1641,
                                            columnNumber: 56
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1641,
                                            columnNumber: 105
                                        }, this),
                                        loadingPolicies ? 'Loading…' : 'Load Policies'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1640,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 1637,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScopeTagFilter, {
                                                    scopeTags: scopeTags,
                                                    value: leftScopeTagFilter,
                                                    onChange: (v)=>{
                                                        setLeftScopeTagFilter(v);
                                                        setSourcePolicyIds([]);
                                                    },
                                                    label: "Filter by scope tag:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1650,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiPolicySelect, {
                                                    selectedIds: sourcePolicyIds,
                                                    onChange: (ids)=>{
                                                        setSourcePolicyIds(ids);
                                                        setExistingPolicyIds((prev)=>prev.filter((id)=>!ids.includes(id)));
                                                    },
                                                    options: leftPolicyOptions,
                                                    label: "Source Policies (left side)",
                                                    placeholder: "Select one or more source policies…",
                                                    disabled: comparing
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1656,
                                                    columnNumber: 41
                                                }, this),
                                                sourcePolicyIds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground flex items-center gap-1.5",
                                                    children: sourcePolicyIds.length === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                className: "h-3.5 w-3.5 text-green-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1667,
                                                                columnNumber: 57
                                                            }, this),
                                                            "Single source — uses ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                className: "bg-muted px-1 rounded",
                                                                children: [
                                                                    "compare/",
                                                                    '{type}'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1667,
                                                                columnNumber: 133
                                                            }, this)
                                                        ]
                                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                className: "h-3.5 w-3.5 text-blue-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1668,
                                                                columnNumber: 57
                                                            }, this),
                                                            sourcePolicyIds.length,
                                                            " sources — uses ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                className: "bg-muted px-1 rounded",
                                                                children: [
                                                                    "compare/",
                                                                    '{type}',
                                                                    "/set-analysis"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1668,
                                                                columnNumber: 147
                                                            }, this)
                                                        ]
                                                    }, void 0, true)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1665,
                                                    columnNumber: 45
                                                }, this),
                                                loadingScopeTags && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                            className: "h-3 w-3 animate-spin"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1672,
                                                            columnNumber: 131
                                                        }, this),
                                                        "Loading scope tags…"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1672,
                                                    columnNumber: 62
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1649,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScopeTagFilter, {
                                                    scopeTags: scopeTags,
                                                    value: rightScopeTagFilter,
                                                    onChange: (v)=>{
                                                        setRightScopeTagFilter(v);
                                                        setExistingPolicyIds([]);
                                                    },
                                                    label: "Filter by scope tag:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1677,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiPolicySelect, {
                                                    selectedIds: existingPolicyIds,
                                                    onChange: setExistingPolicyIds,
                                                    options: existingPolicyOptions,
                                                    label: "Target Policies (right side)".concat(sourcePolicyIds.length > 0 ? ' — filtered to matching platform/type' : ''),
                                                    placeholder: sourcePolicyIds.length > 0 ? 'Select target policies…' : 'Select source policies first…',
                                                    disabled: comparing
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1683,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1676,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1647,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: runCompare,
                                            disabled: sourcePolicyIds.length === 0 || existingPolicyIds.length === 0 || comparing || !accounts.length,
                                            className: "gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1695,
                                                    columnNumber: 41
                                                }, this),
                                                results.length > 0 ? 'Re-run Analysis' : setAnalysisItems ? 'Re-run Set Analysis' : 'Analyse Policy Overlap'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1694,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            size: "sm",
                                            onClick: ()=>{
                                                fetchPolicies();
                                                fetchScopeTags();
                                            },
                                            disabled: loadingPolicies,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                    className: "h-4 w-4 mr-2 ".concat(loadingPolicies ? 'animate-spin' : '')
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1699,
                                                    columnNumber: 41
                                                }, this),
                                                "Refresh"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1698,
                                            columnNumber: 37
                                        }, this),
                                        !accounts.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-amber-600 flex items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1701,
                                                    columnNumber: 123
                                                }, this),
                                                "Sign in first."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1701,
                                            columnNumber: 58
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1693,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1635,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1613,
                columnNumber: 13
            }, this),
            comparing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingBanner, {
                onCancel: cancelCompare,
                batchProgress: batchProgress
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1709,
                columnNumber: 27
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-destructive",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-destructive text-sm flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1714,
                                columnNumber: 89
                            }, this),
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1714,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 1713,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1712,
                columnNumber: 17
            }, this),
            setAnalysisItems && setAnalysisSummary && !comparing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-bold flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                                                className: "h-5 w-5 text-primary"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1725,
                                                columnNumber: 33
                                            }, this),
                                            "Set Analysis Results"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1724,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-0.5",
                                        children: [
                                            sourcePolicyIds.length,
                                            " left × ",
                                            existingPolicyIds.length,
                                            " right policies · ",
                                            setAnalysisSummary.totalSettings,
                                            " unique settings"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1727,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1723,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>{
                                    if (!(setAnalysisItems === null || setAnalysisItems === void 0 ? void 0 : setAnalysisItems.length)) return;
                                    const rows = setAnalysisItems.flatMap((i)=>[
                                            ...i.leftOccurrences.map((o)=>({
                                                    'Setting ID': i.settingDefinitionId,
                                                    'Setting Name': i.settingName,
                                                    Status: i.status,
                                                    Side: 'Left',
                                                    Policy: o.policyName,
                                                    Value: o.value
                                                })),
                                            ...i.rightOccurrences.map((o)=>({
                                                    'Setting ID': i.settingDefinitionId,
                                                    'Setting Name': i.settingName,
                                                    Status: i.status,
                                                    Side: 'Right',
                                                    Policy: o.policyName,
                                                    Value: o.value
                                                }))
                                        ]);
                                    const headers = Object.keys(rows[0]);
                                    const csv = [
                                        headers.join(','),
                                        ...rows.map((r)=>headers.map((h)=>{
                                                var _r_h;
                                                return '"'.concat(((_r_h = r[h]) !== null && _r_h !== void 0 ? _r_h : '').replace(/"/g, '""'), '"');
                                            }).join(','))
                                    ].join('\n');
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(new Blob([
                                        csv
                                    ], {
                                        type: 'text/csv'
                                    }));
                                    a.download = 'set-analysis.csv';
                                    a.click();
                                },
                                className: "gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1741,
                                        columnNumber: 29
                                    }, this),
                                    "Export CSV"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1731,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1722,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SetAnalysisView, {
                        items: setAnalysisItems,
                        summary: setAnalysisSummary,
                        resolvedMap: resolvedMap
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1744,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1721,
                columnNumber: 17
            }, this),
            results.length > 0 && globalSummary && !comparing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DecisionCard, {
                        results: results
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1752,
                        columnNumber: 21
                    }, this),
                    coverageSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "cursor-pointer hover:border-primary/40 transition-colors",
                                onClick: ()=>setActiveTab('coverage'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "pt-5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 rounded-lg bg-green-500/10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                    className: "h-5 w-5 text-green-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1760,
                                                    columnNumber: 89
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1760,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Covered settings"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1762,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xl font-bold ".concat(coverageSummary.covered / coverageSummary.total >= 0.8 ? 'text-green-600' : coverageSummary.covered / coverageSummary.total >= 0.5 ? 'text-amber-600' : 'text-red-600'),
                                                        children: smartPct(coverageSummary.covered, coverageSummary.total)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1763,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: [
                                                            coverageSummary.covered,
                                                            " of ",
                                                            coverageSummary.total,
                                                            " settings"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1764,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1761,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1759,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1758,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1757,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "cursor-pointer hover:border-primary/40 transition-colors",
                                onClick: ()=>setActiveTab('coverage'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "pt-5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 rounded-lg bg-red-500/10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldAlert$3e$__["ShieldAlert"], {
                                                    className: "h-5 w-5 text-red-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1772,
                                                    columnNumber: 87
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1772,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Conflicting settings"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1774,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xl font-bold ".concat(coverageSummary.conflict > 0 ? 'text-red-600' : 'text-green-600'),
                                                        children: smartPct(coverageSummary.conflict, coverageSummary.total)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1775,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: [
                                                            coverageSummary.conflict,
                                                            " of ",
                                                            coverageSummary.total,
                                                            " settings"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1776,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1773,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1771,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1770,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1769,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "cursor-pointer hover:border-primary/40 transition-colors",
                                onClick: ()=>setActiveTab('coverage'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "pt-5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 rounded-lg bg-blue-500/10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                    className: "h-5 w-5 text-blue-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1784,
                                                    columnNumber: 88
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1784,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Not in tenant"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1786,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xl font-bold ".concat(coverageSummary.notInTenant > 0 ? 'text-blue-600' : 'text-green-600'),
                                                        children: smartPct(coverageSummary.notInTenant, coverageSummary.total)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1787,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: [
                                                            coverageSummary.notInTenant,
                                                            " of ",
                                                            coverageSummary.total,
                                                            " settings"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1788,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1785,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1783,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1782,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1781,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "pt-5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2 rounded-lg bg-muted",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                                                    className: "h-5 w-5 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1796,
                                                    columnNumber: 82
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1796,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Policies analysed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1798,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xl font-bold",
                                                        children: results.length
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1799,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: [
                                                            coverageSummary.total,
                                                            " unique settings"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1800,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1797,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1795,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1794,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1793,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1756,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 border-b",
                        children: [
                            'coverage',
                            'detail',
                            'summary'
                        ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "pb-2 px-3 text-sm font-medium border-b-2 transition-colors ".concat(activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'),
                                onClick: ()=>setActiveTab(tab),
                                children: tab === 'coverage' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                            className: "h-4 w-4 inline mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1815,
                                            columnNumber: 41
                                        }, this),
                                        "Overall Coverage"
                                    ]
                                }, void 0, true) : tab === 'detail' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                            className: "h-4 w-4 inline mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1817,
                                            columnNumber: 41
                                        }, this),
                                        "Per-Policy Detail"
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                            className: "h-4 w-4 inline mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1818,
                                            columnNumber: 41
                                        }, this),
                                        "Summary"
                                    ]
                                }, void 0, true)
                            }, tab, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1811,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1809,
                        columnNumber: 21
                    }, this),
                    activeTab === 'coverage' && coverageSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CoverageTab, {
                        rows: settingCoverage,
                        summary: coverageSummary,
                        resolvedMap: resolvedMap
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1824,
                        columnNumber: 25
                    }, this),
                    activeTab === 'detail' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 flex-wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: detailFilter ? 'default' : 'outline',
                                        size: "sm",
                                        onClick: ()=>{
                                            setDetailFilter((f)=>!f);
                                            setPage(0);
                                        },
                                        className: "gap-2",
                                        children: [
                                            detailFilter ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1836,
                                                columnNumber: 53
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1836,
                                                columnNumber: 81
                                            }, this),
                                            detailFilter ? 'Show all policies' : 'Conflicts / new only'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1835,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground ml-2",
                                        children: [
                                            filteredResults.length,
                                            " ",
                                            detailFilter ? 'policies with conflicts/new settings' : 'policies',
                                            " · page ",
                                            page + 1,
                                            " of ",
                                            Math.max(pageCount, 1)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1839,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1 ml-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                size: "sm",
                                                onClick: ()=>setPage((p)=>Math.max(p - 1, 0)),
                                                disabled: page === 0,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1844,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1843,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                size: "sm",
                                                onClick: ()=>setPage((p)=>Math.min(p + 1, pageCount - 1)),
                                                disabled: page >= pageCount - 1,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1847,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1846,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1842,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1834,
                                columnNumber: 29
                            }, this),
                            pagedResults.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-6 text-center text-sm text-muted-foreground",
                                children: "No policies match current filter."
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1853,
                                columnNumber: 35
                            }, this) : pagedResults.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResultCard, {
                                    result: r,
                                    resolvedMap: resolvedMap
                                }, r.checkedPolicyId, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1854,
                                    columnNumber: 57
                                }, this)),
                            pageCount > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-center gap-2 pt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        size: "sm",
                                        onClick: ()=>setPage((p)=>Math.max(p - 1, 0)),
                                        disabled: page === 0,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                className: "h-4 w-4 mr-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1861,
                                                columnNumber: 41
                                            }, this),
                                            "Prev"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1860,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground px-2",
                                        children: [
                                            "Page ",
                                            page + 1,
                                            " / ",
                                            pageCount
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1863,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        size: "sm",
                                        onClick: ()=>setPage((p)=>Math.min(p + 1, pageCount - 1)),
                                        disabled: page >= pageCount - 1,
                                        children: [
                                            "Next",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                className: "h-4 w-4 ml-1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1865,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1864,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1859,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1832,
                        columnNumber: 25
                    }, this),
                    activeTab === 'summary' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-base flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                className: "h-4 w-4 text-primary"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1875,
                                                columnNumber: 90
                                            }, this),
                                            "Per-Policy Overlap Breakdown"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1875,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                        children: "Coverage, conflicts and unique settings per existing policy compared."
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1876,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1874,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "space-y-6",
                                children: results.map((r)=>{
                                    var _r_checkResults;
                                    const cr = (_r_checkResults = r.checkResults) !== null && _r_checkResults !== void 0 ? _r_checkResults : [];
                                    const t = cr.length;
                                    const s = cr.filter((c)=>c.settingCheckState === 'InBothTheSame').length;
                                    const d = cr.filter((c)=>c.settingCheckState === 'InBothDifferent').length;
                                    const no = cr.filter((c)=>c.settingCheckState === 'InSource').length;
                                    const eo = cr.filter((c)=>c.settingCheckState === 'InChecked').length;
                                    const sp = t === 0 ? 0 : Math.round(s / t * 100);
                                    const dp = t === 0 ? 0 : Math.round(d / t * 100);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 pb-4 border-b last:border-b-0 last:pb-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-semibold",
                                                        children: r.checkedPolicyName
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1891,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: [
                                                            t,
                                                            " settings"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1892,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1890,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex h-3 w-full rounded-full overflow-hidden bg-muted",
                                                children: [
                                                    sp > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-green-500 h-full",
                                                        style: {
                                                            width: "".concat(sp, "%")
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1895,
                                                        columnNumber: 60
                                                    }, this),
                                                    dp > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-red-400 h-full",
                                                        style: {
                                                            width: "".concat(dp, "%")
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1896,
                                                        columnNumber: 60
                                                    }, this),
                                                    t > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-blue-400 h-full",
                                                        style: {
                                                            width: "".concat(Math.round(no / t * 100), "%")
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1897,
                                                        columnNumber: 61
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1894,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-4 gap-3",
                                                children: [
                                                    {
                                                        label: 'Covered',
                                                        n: s,
                                                        color: 'bg-green-500'
                                                    },
                                                    {
                                                        label: 'Conflict',
                                                        n: d,
                                                        color: 'bg-red-400'
                                                    },
                                                    {
                                                        label: 'New only',
                                                        n: no,
                                                        color: 'bg-blue-400'
                                                    },
                                                    {
                                                        label: 'Exist only',
                                                        n: eo,
                                                        color: 'bg-muted-foreground'
                                                    }
                                                ].map((k)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between text-xs mb-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-muted-foreground",
                                                                        children: k.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1908,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-medium",
                                                                        children: smartPct(k.n, t)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1909,
                                                                        columnNumber: 61
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1907,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressBar, {
                                                                value: t === 0 ? 0 : Math.round(k.n / t * 100),
                                                                color: k.color
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1911,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-[10px] text-muted-foreground mt-0.5",
                                                                children: [
                                                                    k.n,
                                                                    " settings"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1912,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, k.label, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1906,
                                                        columnNumber: 53
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1899,
                                                columnNumber: 45
                                            }, this)
                                        ]
                                    }, r.checkedPolicyId, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1889,
                                        columnNumber: 41
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1878,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1873,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1750,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 1582,
        columnNumber: 9
    }, this);
}
_s5(PolicyComparison, "QPNW/2z7ju8+r9mudsJWEj1dUkE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"]
    ];
});
_c11 = PolicyComparison;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "StatusBadge");
__turbopack_context__.k.register(_c1, "ProgressBar");
__turbopack_context__.k.register(_c2, "LoadingBanner");
__turbopack_context__.k.register(_c3, "ValueCell");
__turbopack_context__.k.register(_c4, "MultiPolicySelect");
__turbopack_context__.k.register(_c5, "DecisionCard");
__turbopack_context__.k.register(_c6, "CoverageTab");
__turbopack_context__.k.register(_c7, "ResultCard");
__turbopack_context__.k.register(_c8, "SetAnalysisStatusBadge");
__turbopack_context__.k.register(_c9, "SetAnalysisView");
__turbopack_context__.k.register(_c10, "ScopeTagFilter");
__turbopack_context__.k.register(_c11, "PolicyComparison");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_compare_policies_page_tsx_faf62246._.js.map