(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/errors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserConsentRequiredError",
    ()=>UserConsentRequiredError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class UserConsentRequiredError extends Error {
    constructor(url, message = 'Additional permissions required'){
        super(message), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "consentUrl", void 0);
        this.name = 'UserConsentRequiredError';
        this.consentUrl = url;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/apiRequest.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/apiRequest.ts
__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "apiRequest",
    ()=>apiRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-client] (ecmascript)");
;
;
class ApiError extends Error {
    constructor(message, correlationId, status){
        super(message), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "correlationId", void 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "status", void 0);
        this.name = 'ApiError';
        this.correlationId = correlationId;
        this.status = status;
    }
}
async function apiRequest(url) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, token = arguments.length > 2 ? arguments[2] : void 0;
    try {
        // Add authorization header if token is provided
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            ...token && {
                Authorization: "Bearer ".concat(token)
            }
        };
        const response = await fetch(url, {
            ...options,
            headers
        });
        // Extract correlation ID from response headers ALWAYS
        const correlationId = response.headers.get('x-correlation-id') || response.headers.get('X-Correlation-ID') || response.headers.get('correlation-id') || response.headers.get('Correlation-ID');
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        // Parse response
        const data = isJson ? await response.json() : await response.text();
        // Handle 401 specifically for consent
        if (response.status === 401) {
            var _data_message, _data_message1;
            console.log("401 response detected:", JSON.stringify(data, null, 2));
            if (data === null || data === void 0 ? void 0 : (_data_message = data.message) === null || _data_message === void 0 ? void 0 : _data_message.url) {
                console.log("Consent URL found:", data.message.url);
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserConsentRequiredError"](data.message.url, data.message.message || "Additional permissions required");
            }
            const consentUrl = (data === null || data === void 0 ? void 0 : data.consentUrl) || (data === null || data === void 0 ? void 0 : (_data_message1 = data.message) === null || _data_message1 === void 0 ? void 0 : _data_message1.url);
            if (consentUrl) {
                console.log("Consent URL detected:", consentUrl);
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserConsentRequiredError"](consentUrl);
            }
        }
        // Handle ALL other error status codes (400, 500, etc.)
        if (!response.ok) {
            console.log("Error ".concat(response.status, " response data:"), JSON.stringify(data, null, 2));
            // Debug: Log ALL headers to see what we actually have
            console.log("=== ALL RESPONSE HEADERS ===");
            for (const [key, value] of response.headers){
                console.log("".concat(key, ": ").concat(value));
            }
            // Create error message based on status code, not response content
            const errorMessage = "API request failed: ".concat(response.status, " - ").concat(response.statusText || 'HTTP Error');
            console.log("Final error message:", errorMessage);
            throw new ApiError(errorMessage, correlationId, response.status);
        }
        // Success case
        console.log("Success response, correlation ID:", correlationId);
        return data;
    } catch (error) {
        // Re-throw specific errors
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserConsentRequiredError"] || error instanceof ApiError) {
            throw error;
        }
        console.error("API request error:", error);
        throw error;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useApiRequest.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// hooks/useApiRequest.ts
__turbopack_context__.s([
    "useApiRequest",
    ()=>useApiRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/hooks/useMsal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ConsentContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ConsentContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$TenantContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/TenantContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiRequest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$msalConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/msalConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ErrorContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ErrorContext.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
function useApiRequest() {
    _s();
    const { instance, accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const { showConsent } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ConsentContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConsent"])();
    const { showError, clearError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ErrorContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useError"])();
    const { selectedTenant } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$TenantContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenant"])();
    const abortControllerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useApiRequest.useCallback[request]": async function(url) {
            let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, onConsentComplete = arguments.length > 2 ? arguments[2] : void 0;
            // Cancel previous request if still running
            clearError();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            // Create new abort controller
            abortControllerRef.current = new AbortController();
            try {
                // Get access token
                let accessToken;
                if (accounts.length > 0) {
                    const response = await instance.acquireTokenSilent({
                        scopes: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$msalConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiScope"]
                        ],
                        account: accounts[0]
                    });
                    accessToken = response.accessToken;
                }
                // Add tenant header and signal to options
                const requestOptions = {
                    ...options,
                    signal: abortControllerRef.current.signal,
                    headers: {
                        ...options.headers,
                        ...selectedTenant && {
                            'X-Tenant-ID': selectedTenant.tenantId
                        }
                    }
                };
                return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiRequest"])(url, requestOptions, accessToken);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserConsentRequiredError"]) {
                    console.log("Consent required, showing consent dialog with URL:", err.consentUrl);
                    showConsent(err.consentUrl, onConsentComplete ? ({
                        "useApiRequest.useCallback[request]": async ()=>{
                            try {
                                return await onConsentComplete();
                            } catch (retryError) {
                                console.error("Error retrying request after consent:", retryError);
                                const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Retry failed';
                                showError(retryErrorMessage);
                            }
                        }
                    })["useApiRequest.useCallback[request]"] : undefined);
                    return;
                }
                // Handle ApiError with correlation ID
                let errorMessage = err instanceof Error ? err.message : 'An error occurred';
                if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"] && err.correlationId) {
                    errorMessage = "".concat(errorMessage, " (Correlation ID: ").concat(err.correlationId, ")");
                    console.log('Error with correlation ID:', err.correlationId);
                }
                // Show error through global error handler
                showError(errorMessage, onConsentComplete ? ({
                    "useApiRequest.useCallback[request]": async ()=>{
                        try {
                            return await onConsentComplete();
                        } catch (retryError) {
                            console.error("Error retrying request after consent:", retryError);
                            const retryErrorMessage = retryError instanceof Error ? retryError.message : 'Retry failed';
                            showError(retryErrorMessage);
                        }
                    }
                })["useApiRequest.useCallback[request]"] : undefined);
                return;
            }
        }
    }["useApiRequest.useCallback[request]"], [
        instance,
        accounts,
        showConsent,
        selectedTenant,
        showError,
        clearError
    ]);
    const cancel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useApiRequest.useCallback[cancel]": ()=>{
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        }
    }["useApiRequest.useCallback[cancel]"], []);
    return {
        request,
        cancel
    };
}
_s(useApiRequest, "wV6TWUMiZTqOpqal4OTEivgQgTc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ConsentContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConsent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ErrorContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useError"],
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$TenantContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenant"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/funnel.js [app-client] (ecmascript) <export default as Filter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-compare.js [app-client] (ecmascript) <export default as GitCompare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left-right.js [app-client] (ecmascript) <export default as ArrowLeftRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useApiRequest.ts [app-client] (ecmascript)");
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
function PolicyComparison() {
    var _comparisonResult_results_checkResults, _comparisonResult_results, _comparisonResult_results1, _comparisonResult_results2, _comparisonResult_results3, _comparisonResult_results4, _comparisonResult_results5;
    _s();
    var _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
    const { instance, accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const [policies, setPolicies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sourcePolicy, setSourcePolicy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [targetPolicy, setTargetPolicy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [comparisonResult, setComparisonResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [compareLoading, setCompareLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedKeywords, setSelectedKeywords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const { request, cancel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"])();
    const fetchPolicies = async ()=>{
        if (!accounts.length) return;
        setLoading(true);
        setError(null);
        try {
            const response = await request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CONFIGURATION_POLICIES_ENDPOINT"]);
            if (!response) {
                throw new Error('No response received from API');
            }
            let allPolicies = [];
            // Handle the response data properly
            if (Array.isArray(response)) {
                allPolicies = response;
            } else if (response.data) {
                if (Array.isArray(response.data)) {
                    allPolicies = response.data;
                } else {
                    throw new Error(response.data.message || 'Failed to fetch policies');
                }
            } else {
                throw new Error('Invalid response format');
            }
            // Show all available policy types for debugging
            const policyTypes = [
                ...new Set(allPolicies.map((policy)=>policy.policyType))
            ];
            console.log('Available policy types:', policyTypes);
            console.log('All fetched policies:', allPolicies);
            // Show all policies without filtering
            const settingsCatalogPolicies = allPolicies.filter((policy)=>policy.policyType === 'SettingsCatalog');
            console.log('SettingsCatalog policies:', settingsCatalogPolicies);
            if (settingsCatalogPolicies.length === 0) {
                setError("No SettingsCatalog policies found. Available policy types: ".concat(policyTypes.join(', ')));
            }
            setPolicies(settingsCatalogPolicies);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch policies');
            console.error('Error fetching policies:', err);
        } finally{
            setLoading(false);
        }
    };
    // Reset target policy when source policy changes to enforce same type selection
    const handleSourcePolicySelect = (policy)=>{
        setSourcePolicy(policy);
        // Clear target policy if it's not the same type as the new source policy
        if (policy && targetPolicy && targetPolicy.policyType !== policy.policyType) {
            setTargetPolicy(null);
        }
    };
    // Filter target policies to only show same platform as source
    const getTargetPolicyOptions = ()=>{
        if (!sourcePolicy) return policies;
        return policies.filter((policy)=>policy.platform === sourcePolicy.platform && policy.id !== sourcePolicy.id);
    };
    // Your existing SearchableSelect component...
    const SearchableSelect = (param)=>{
        let { value, onSelect, options, placeholder, disabled, label } = param;
        _s1();
        const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
        const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
        const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
        const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
        const selectedPolicy = options.find((p)=>p.id === value);
        const filteredOptions = options.filter((policy)=>policy.name.toLowerCase().includes(searchTerm.toLowerCase()) || policy.policyType.toLowerCase().includes(searchTerm.toLowerCase()));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
            "PolicyComparison.SearchableSelect.useEffect": ()=>{
                const handleClickOutside = {
                    "PolicyComparison.SearchableSelect.useEffect.handleClickOutside": (event)=>{
                        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                            setIsOpen(false);
                            setSearchTerm('');
                        }
                    }
                }["PolicyComparison.SearchableSelect.useEffect.handleClickOutside"];
                document.addEventListener('mousedown', handleClickOutside);
                return ({
                    "PolicyComparison.SearchableSelect.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
                })["PolicyComparison.SearchableSelect.useEffect"];
            }
        }["PolicyComparison.SearchableSelect.useEffect"], []);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
            "PolicyComparison.SearchableSelect.useEffect": ()=>{
                if (isOpen && inputRef.current) {
                    inputRef.current.focus();
                }
            }
        }["PolicyComparison.SearchableSelect.useEffect"], [
            isOpen
        ]);
        const handleSelect = (policy)=>{
            onSelect(policy);
            setIsOpen(false);
            setSearchTerm('');
        };
        const handleClear = (e)=>{
            e.stopPropagation();
            onSelect(null);
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative z-10",
            ref: dropdownRef,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "block text-sm font-medium text-foreground mb-2",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 210,
                    columnNumber: 16
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full p-3 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 cursor-pointer transition-all ".concat(disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/70 dark:hover:bg-white/15', " ").concat(isOpen ? 'ring-2 ring-primary/50' : ''),
                    onClick: ()=>!disabled && setIsOpen(!isOpen),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: selectedPolicy ? 'text-foreground' : 'text-muted-foreground',
                                children: selectedPolicy ? selectedPolicy.name : placeholder
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 220,
                                columnNumber: 24
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    selectedPolicy && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleClear,
                                        className: "hover:bg-white/20 dark:hover:bg-white/10 rounded-full p-1 transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "h-4 w-4 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 229,
                                            columnNumber: 36
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 225,
                                        columnNumber: 32
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        className: "h-4 w-4 text-muted-foreground transition-transform ".concat(isOpen ? 'transform rotate-180' : '')
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 232,
                                        columnNumber: 28
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 223,
                                columnNumber: 24
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 219,
                        columnNumber: 20
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 213,
                    columnNumber: 16
                }, this),
                isOpen && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute left-0 right-0 top-full mt-2 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-lg shadow-2xl overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3 border-b border-border/20 bg-white/40 dark:bg-white/5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 242,
                                        columnNumber: 32
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        ref: inputRef,
                                        type: "text",
                                        placeholder: "Search policies...",
                                        value: searchTerm,
                                        onChange: (e)=>setSearchTerm(e.target.value),
                                        className: "w-full pl-10 pr-4 py-2 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border-0"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 32
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 241,
                                columnNumber: 28
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 240,
                            columnNumber: 24
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-[400px] overflow-y-auto custom-scrollbar",
                            children: filteredOptions.length > 0 ? filteredOptions.map((policy, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>handleSelect(policy),
                                    className: "px-4 py-3 hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer transition-colors border-b border-border/10 last:border-b-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-medium text-foreground",
                                            children: policy.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 262,
                                            columnNumber: 40
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-muted-foreground mt-1 flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: policy.policyType
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 264,
                                                    columnNumber: 44
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-border",
                                                    children: "•"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 265,
                                                    columnNumber: 44
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: policy.platform
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 44
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 263,
                                            columnNumber: 40
                                        }, this)
                                    ]
                                }, policy.id, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 257,
                                    columnNumber: 36
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-8 text-center text-muted-foreground",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        className: "h-8 w-8 mx-auto mb-2 opacity-50"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 272,
                                        columnNumber: 36
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "No policies found"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 273,
                                        columnNumber: 36
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 271,
                                columnNumber: 32
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 254,
                            columnNumber: 24
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 239,
                    columnNumber: 20
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 209,
            columnNumber: 12
        }, this);
    };
    _s1(SearchableSelect, "TacIESBL3xWoAlAUWnUFEJz1Gks=");
    const MultiSelectKeywords = (param)=>{
        let { availableKeywords, selectedKeywords, onSelectionChange } = param;
        _s2();
        const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
        const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
        const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
        const filteredKeywords = availableKeywords.filter((keyword)=>keyword.toLowerCase().includes(searchTerm.toLowerCase()));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
            "PolicyComparison.MultiSelectKeywords.useEffect": ()=>{
                const handleClickOutside = {
                    "PolicyComparison.MultiSelectKeywords.useEffect.handleClickOutside": (event)=>{
                        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                            setIsOpen(false);
                            setSearchTerm('');
                        }
                    }
                }["PolicyComparison.MultiSelectKeywords.useEffect.handleClickOutside"];
                document.addEventListener('mousedown', handleClickOutside);
                return ({
                    "PolicyComparison.MultiSelectKeywords.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
                })["PolicyComparison.MultiSelectKeywords.useEffect"];
            }
        }["PolicyComparison.MultiSelectKeywords.useEffect"], []);
        const toggleKeyword = (keyword)=>{
            const newSelection = selectedKeywords.includes(keyword) ? selectedKeywords.filter((k)=>k !== keyword) : [
                ...selectedKeywords,
                keyword
            ];
            onSelectionChange(newSelection);
        };
        const clearAll = ()=>{
            onSelectionChange([]);
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            ref: dropdownRef,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "block text-sm font-medium text-gray-700 mb-2",
                    children: "Filter by Keywords"
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 321,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white min-h-[42px]",
                    onClick: ()=>setIsOpen(!isOpen),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: selectedKeywords.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-500",
                                    children: "Select keywords..."
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 331,
                                    columnNumber: 33
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-1",
                                    children: [
                                        selectedKeywords.slice(0, 2).map((keyword)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                variant: "secondary",
                                                className: "text-xs",
                                                children: keyword
                                            }, keyword, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 335,
                                                columnNumber: 41
                                            }, this)),
                                        selectedKeywords.length > 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            variant: "secondary",
                                            className: "text-xs",
                                            children: [
                                                "+",
                                                selectedKeywords.length - 2,
                                                " more"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 340,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 333,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 329,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    selectedKeywords.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: (e)=>{
                                            e.stopPropagation();
                                            clearAll();
                                        },
                                        className: "text-gray-400 hover:text-gray-600",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 356,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 349,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                        className: "h-4 w-4 text-gray-400 transition-transform ".concat(isOpen ? 'transform rotate-180' : '')
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 359,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 347,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 328,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 324,
                    columnNumber: 17
                }, this),
                isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3 border-b border-gray-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 370,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search keywords...",
                                        className: "w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm",
                                        value: searchTerm,
                                        onChange: (e)=>setSearchTerm(e.target.value),
                                        onClick: (e)=>e.stopPropagation()
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 371,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 369,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 368,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-48 overflow-y-auto",
                            children: filteredKeywords.length > 0 ? filteredKeywords.map((keyword)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2",
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        toggleKeyword(keyword);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: selectedKeywords.includes(keyword),
                                            onChange: ()=>{},
                                            className: "h-4 w-4 text-blue-600 rounded border-gray-300"
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 393,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm text-gray-900",
                                            children: keyword
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 399,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, keyword, true, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 385,
                                    columnNumber: 37
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 text-gray-500 text-sm text-center",
                                children: [
                                    'No keywords found matching "',
                                    searchTerm,
                                    '"'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 403,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 382,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 367,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 320,
            columnNumber: 13
        }, this);
    };
    _s2(MultiSelectKeywords, "0OiaxN2WrlEGTfdB7f0+z8zar8k=");
    const comparePolicies = async ()=>{
        if (!sourcePolicy || !targetPolicy || !accounts.length) return;
        setCompareLoading(true);
        setError(null);
        try {
            const data = await request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMPARE_ENDPOINT"], "/").concat(sourcePolicy.policyType), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    PolicyId: sourcePolicy.id,
                    ComparePolicyId: targetPolicy.id
                })
            });
            if (!data) {
                throw new Error('No response received from comparison API');
            }
            setComparisonResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to compare policies');
            console.error('Error comparing policies:', err);
        } finally{
            setCompareLoading(false);
        }
    };
    const getAllKeywords = ()=>{
        var _comparisonResult_results;
        if (!(comparisonResult === null || comparisonResult === void 0 ? void 0 : (_comparisonResult_results = comparisonResult.results) === null || _comparisonResult_results === void 0 ? void 0 : _comparisonResult_results.checkResults)) return [];
        const allKeywords = comparisonResult.results.checkResults.flatMap((result)=>result.keywords || []).filter((keyword, index, array)=>array.indexOf(keyword) === index).sort();
        return allKeywords;
    };
    const filteredResults = (comparisonResult === null || comparisonResult === void 0 ? void 0 : (_comparisonResult_results = comparisonResult.results) === null || _comparisonResult_results === void 0 ? void 0 : (_comparisonResult_results_checkResults = _comparisonResult_results.checkResults) === null || _comparisonResult_results_checkResults === void 0 ? void 0 : _comparisonResult_results_checkResults.filter((result)=>{
        const matchesName = result.name.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || result.settingCheckState === statusFilter;
        const matchesKeywords = selectedKeywords.length === 0 || selectedKeywords.some((keyword)=>{
            var _result_keywords;
            return (_result_keywords = result.keywords) === null || _result_keywords === void 0 ? void 0 : _result_keywords.some((k)=>k.toLowerCase().includes(keyword.toLowerCase()));
        });
        return matchesName && matchesStatus && matchesKeywords;
    })) || [];
    const getStatusBadge = (status)=>{
        const badges = {
            'InBothTheSame': {
                color: 'bg-green-500 hover:bg-green-600',
                text: 'Same'
            },
            'InBothDifferent': {
                color: 'bg-red-500 hover:bg-red-600',
                text: 'Different'
            },
            'InSource': {
                color: 'bg-blue-500 hover:bg-blue-600',
                text: 'Source Only'
            },
            'InChecked': {
                color: 'bg-yellow-500 hover:bg-yellow-600',
                text: 'Target Only'
            }
        };
        const badge = badges[status] || {
            color: 'bg-gray-500',
            text: status
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
            variant: "default",
            className: "text-xs whitespace-nowrap ".concat(badge.color),
            children: badge.text
        }, void 0, false, {
            fileName: "[project]/app/compare/policies/page.tsx",
            lineNumber: 477,
            columnNumber: 13
        }, this);
    };
    const clearFilter = ()=>{
        setFilter('');
        setStatusFilter('all');
        setSelectedKeywords([]);
    };
    const clearSearch = ()=>{
        setFilter('');
    };
    const getFilteredStats = ()=>{
        var _comparisonResult_results;
        if (!(comparisonResult === null || comparisonResult === void 0 ? void 0 : (_comparisonResult_results = comparisonResult.results) === null || _comparisonResult_results === void 0 ? void 0 : _comparisonResult_results.checkResults)) return null;
        const total = filteredResults.length;
        const same = filteredResults.filter((r)=>r.settingCheckState === 'InBothTheSame').length;
        const different = filteredResults.filter((r)=>r.settingCheckState === 'InBothDifferent').length;
        const sourceOnly = filteredResults.filter((r)=>r.settingCheckState === 'InSource').length;
        const targetOnly = filteredResults.filter((r)=>r.settingCheckState === 'InChecked').length;
        // Count child settings differences
        const totalChildSettings = filteredResults.reduce((acc, result)=>{
            var _result_childSettings;
            return acc + (((_result_childSettings = result.childSettings) === null || _result_childSettings === void 0 ? void 0 : _result_childSettings.length) || 0);
        }, 0);
        const childDifferences = filteredResults.reduce((acc, result)=>{
            var _result_childSettings;
            return acc + (((_result_childSettings = result.childSettings) === null || _result_childSettings === void 0 ? void 0 : _result_childSettings.filter((child)=>child.sourceValue !== child.targetValue).length) || 0);
        }, 0);
        return {
            total,
            same,
            different,
            sourceOnly,
            targetOnly,
            totalChildSettings,
            childDifferences
        };
    };
    const stats = getFilteredStats();
    // Add these new functions after your existing functions and before the return statement
    const exportToHtml = ()=>{
        var _comparisonResult_results;
        if (!(comparisonResult === null || comparisonResult === void 0 ? void 0 : (_comparisonResult_results = comparisonResult.results) === null || _comparisonResult_results === void 0 ? void 0 : _comparisonResult_results.checkResults)) return;
        const stats = getFilteredStats();
        const timestamp = new Date().toLocaleString();
        const htmlContent = '\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Policy Comparison Report - '.concat(comparisonResult.results.sourcePolicyName, " vs ").concat(comparisonResult.results.checkedPolicyName, "</title>\n    <style>\n        * { box-sizing: border-box; }\n        body { \n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n            line-height: 1.6;\n            color: #333;\n            max-width: 1200px;\n            margin: 0 auto;\n            padding: 20px;\n            background-color: #f8f9fa;\n        }\n        .header { \n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n            color: white;\n            padding: 30px;\n            border-radius: 10px;\n            margin-bottom: 30px;\n            text-align: center;\n        }\n        .header h1 { margin: 0 0 10px 0; font-size: 2.5rem; }\n        .header p { margin: 0; opacity: 0.9; font-size: 1.1rem; }\n        .stats-grid { \n            display: grid;\n            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n            gap: 15px;\n            margin-bottom: 30px;\n        }\n        .stat-card {\n            background: white;\n            padding: 20px;\n            border-radius: 8px;\n            text-align: center;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }\n        .stat-label { color: #666; font-size: 0.9rem; }\n        .same { color: #10b981; }\n        .different { color: #ef4444; }\n        .source-only { color: #3b82f6; }\n        .target-only { color: #f59e0b; }\n        .filters-section {\n            background: white;\n            padding: 20px;\n            border-radius: 8px;\n            margin-bottom: 20px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        .filter-controls {\n            display: grid;\n            grid-template-columns: 1fr 200px 200px auto;\n            gap: 15px;\n            align-items: end;\n            margin-bottom: 15px;\n        }\n        .form-group label {\n            display: block;\n            margin-bottom: 5px;\n            font-weight: 500;\n            color: #374151;\n        }\n        input, select {\n            width: 100%;\n            padding: 8px 12px;\n            border: 1px solid #d1d5db;\n            border-radius: 6px;\n            font-size: 14px;\n        }\n        input:focus, select:focus {\n            outline: none;\n            border-color: #3b82f6;\n            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n        }\n        .btn {\n            padding: 8px 16px;\n            background: #3b82f6;\n            color: white;\n            border: none;\n            border-radius: 6px;\n            cursor: pointer;\n            font-size: 14px;\n        }\n        .btn:hover { background: #2563eb; }\n        .btn-outline {\n            background: transparent;\n            color: #3b82f6;\n            border: 1px solid #3b82f6;\n        }\n        .btn-outline:hover {\n            background: #3b82f6;\n            color: white;\n        }\n        .keyword-filter {\n            position: relative;\n        }\n        .keyword-dropdown {\n            position: absolute;\n            top: 100%;\n            left: 0;\n            right: 0;\n            background: white;\n            border: 1px solid #d1d5db;\n            border-radius: 6px;\n            box-shadow: 0 10px 25px rgba(0,0,0,0.15);\n            max-height: 200px;\n            overflow-y: auto;\n            z-index: 1000;\n            display: none;\n        }\n        .keyword-dropdown.open { display: block; }\n        .keyword-option {\n            padding: 8px 12px;\n            cursor: pointer;\n            border-bottom: 1px solid #f3f4f6;\n        }\n        .keyword-option:hover { background: #f3f4f6; }\n        .keyword-option.selected { background: #dbeafe; color: #1d4ed8; }\n        .selected-keywords {\n            display: flex;\n            flex-wrap: wrap;\n            gap: 5px;\n            margin-top: 10px;\n        }\n        .keyword-tag {\n            background: #3b82f6;\n            color: white;\n            padding: 2px 8px;\n            border-radius: 12px;\n            font-size: 12px;\n            display: flex;\n            align-items: center;\n            gap: 4px;\n        }\n        .keyword-tag button {\n            background: none;\n            border: none;\n            color: white;\n            cursor: pointer;\n            padding: 0;\n            width: 16px;\n            height: 16px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n        }\n        .policies-header {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 20px;\n            margin-bottom: 30px;\n        }\n        .policy-card {\n            background: white;\n            padding: 20px;\n            border-radius: 8px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        .policy-source { border-left: 4px solid #3b82f6; }\n        .policy-target { border-left: 4px solid #10b981; }\n        .policy-name { font-weight: bold; color: #1f2937; }\n        .policy-label { font-size: 0.9rem; color: #6b7280; margin-bottom: 5px; }\n        .setting-item {\n            background: white;\n            border: 1px solid #e5e7eb;\n            border-radius: 8px;\n            padding: 20px;\n            margin-bottom: 15px;\n            box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n        }\n        .setting-header {\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-bottom: 15px;\n        }\n        .setting-name { font-weight: bold; font-size: 1.1rem; }\n        .status-badge {\n            padding: 4px 12px;\n            border-radius: 20px;\n            font-size: 0.8rem;\n            font-weight: 500;\n            text-transform: uppercase;\n        }\n        .badge-same { background: #dcfce7; color: #166534; }\n        .badge-different { background: #fecaca; color: #991b1b; }\n        .badge-source { background: #dbeafe; color: #1e40af; }\n        .badge-target { background: #fef3c7; color: #92400e; }\n        .setting-description { color: #6b7280; margin-bottom: 15px; }\n        .keywords {\n            margin-bottom: 15px;\n        }\n        .keywords-label {\n            font-size: 0.75rem;\n            color: #6b7280;\n            font-weight: 500;\n            margin-bottom: 5px;\n            text-transform: uppercase;\n        }\n        .keyword-list {\n            display: flex;\n            flex-wrap: wrap;\n            gap: 5px;\n        }\n        .keyword {\n            background: #f3f4f6;\n            color: #374151;\n            padding: 2px 8px;\n            border-radius: 12px;\n            font-size: 0.75rem;\n            border: 1px solid #d1d5db;\n        }\n        .values-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 15px;\n            margin-bottom: 15px;\n        }\n        .value-card {\n            padding: 15px;\n            border-radius: 6px;\n            border-left: 4px solid;\n        }\n        .value-source {\n            background: #eff6ff;\n            border-left-color: #3b82f6;\n        }\n        .value-target {\n            background: #f0fdf4;\n            border-left-color: #10b981;\n        }\n        .value-label {\n            font-size: 0.75rem;\n            font-weight: 500;\n            text-transform: uppercase;\n            margin-bottom: 5px;\n        }\n        .value-source .value-label { color: #1e40af; }\n        .value-target .value-label { color: #065f46; }\n        .value-text {\n            font-size: 0.9rem;\n            font-family: 'Monaco', 'Consolas', monospace;\n        }\n        .value-source .value-text { color: #1e3a8a; }\n        .value-target .value-text { color: #064e3b; }\n        .differences {\n            background: #fffbeb;\n            border: 1px solid #f59e0b;\n            border-radius: 6px;\n            padding: 15px;\n            margin-bottom: 15px;\n        }\n        .differences-label {\n            font-size: 0.75rem;\n            color: #92400e;\n            font-weight: 500;\n            text-transform: uppercase;\n            margin-bottom: 5px;\n        }\n        .differences-text { color: #78350f; font-size: 0.9rem; }\n        .child-settings {\n            border-top: 1px solid #e5e7eb;\n            padding-top: 15px;\n            margin-top: 15px;\n        }\n        .child-settings-header {\n            font-size: 0.9rem;\n            font-weight: 500;\n            color: #374151;\n            margin-bottom: 15px;\n            display: flex;\n            align-items: center;\n            gap: 5px;\n        }\n        .child-setting {\n            background: #f9fafb;\n            border: 1px solid #e5e7eb;\n            border-radius: 6px;\n            padding: 12px;\n            margin-bottom: 10px;\n        }\n        .child-setting.different {\n            background: #fef2f2;\n            border-color: #fca5a5;\n        }\n        .child-name {\n            font-weight: 500;\n            margin-bottom: 8px;\n            font-size: 0.9rem;\n        }\n        .child-values {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 10px;\n        }\n        .child-value {\n            padding: 8px;\n            border-radius: 4px;\n            font-size: 0.8rem;\n            font-family: 'Monaco', 'Consolas', monospace;\n        }\n        .no-results {\n            text-align: center;\n            padding: 60px 20px;\n            color: #6b7280;\n            background: white;\n            border-radius: 8px;\n            box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n        }\n        .hidden { display: none !important; }\n        @media (max-width: 768px) {\n            .filter-controls {\n                grid-template-columns: 1fr;\n            }\n            .values-grid, .child-values {\n                grid-template-columns: 1fr;\n            }\n            .policies-header {\n                grid-template-columns: 1fr;\n            }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"header\">\n        <h1>Policy Comparison Report</h1>\n        <p>Generated on ").concat(timestamp, '</p>\n    </div>\n\n    <div class="stats-grid">\n        <div class="stat-card">\n            <div class="stat-number same">').concat((stats === null || stats === void 0 ? void 0 : stats.same) || 0, '</div>\n            <div class="stat-label">Identical Settings</div>\n        </div>\n        <div class="stat-card">\n            <div class="stat-number different">').concat((stats === null || stats === void 0 ? void 0 : stats.different) || 0, '</div>\n            <div class="stat-label">Different Settings</div>\n        </div>\n        <div class="stat-card">\n            <div class="stat-number source-only">').concat((stats === null || stats === void 0 ? void 0 : stats.sourceOnly) || 0, '</div>\n            <div class="stat-label">Source Only</div>\n        </div>\n        <div class="stat-card">\n            <div class="stat-number target-only">').concat((stats === null || stats === void 0 ? void 0 : stats.targetOnly) || 0, '</div>\n            <div class="stat-label">Target Only</div>\n        </div>\n    </div>\n\n    <div class="filters-section">\n        <div class="filter-controls">\n            <div class="form-group">\n                <label for="searchInput">Search Settings</label>\n                <input type="text" id="searchInput" placeholder="Search by setting name..." />\n            </div>\n            <div class="form-group">\n                <label for="statusFilter">Status Filter</label>\n                <select id="statusFilter">\n                    <option value="all">All Settings</option>\n                    <option value="InBothDifferent">Different Values</option>\n                    <option value="InBothTheSame">Same Values</option>\n                    <option value="InSource">Source Only</option>\n                    <option value="InChecked">Target Only</option>\n                </select>\n            </div>\n            <div class="form-group">\n                <label for="keywordFilter">Keywords</label>\n                <div class="keyword-filter">\n                    <input type="text" id="keywordFilter" placeholder="Filter by keywords..." readonly onclick="toggleKeywordDropdown()" />\n                    <div class="keyword-dropdown" id="keywordDropdown">\n                        ').concat(getAllKeywords().map((keyword)=>'\n                            <div class="keyword-option" data-keyword="'.concat(keyword.replace(/"/g, '&quot;'), '" onclick="toggleKeyword(\'').concat(keyword.replace(/'/g, "\\'"), "')\">\n                                ").concat(keyword, "\n                            </div>\n                        ")).join(''), '\n                    </div>\n                </div>\n                <div class="selected-keywords" id="selectedKeywords"></div>\n            </div>\n            <div>\n                <button class="btn btn-outline" onclick="clearAllFilters()">Clear All</button>\n            </div>\n        </div>\n    </div>\n\n    <div class="policies-header">\n        <div class="policy-card policy-source">\n            <div class="policy-label">Source Policy</div>\n            <div class="policy-name">').concat(comparisonResult.results.sourcePolicyName, '</div>\n        </div>\n        <div class="policy-card policy-target">\n            <div class="policy-label">Target Policy</div>\n            <div class="policy-name">').concat(comparisonResult.results.checkedPolicyName, '</div>\n        </div>\n    </div>\n\n    <div id="settingsContainer">\n        ').concat(comparisonResult.results.checkResults.map((result)=>{
            const badgeClass = {
                'InBothTheSame': 'badge-same',
                'InBothDifferent': 'badge-different',
                'InSource': 'badge-source',
                'InChecked': 'badge-target'
            }[result.settingCheckState] || 'badge-same';
            const badgeText = {
                'InBothTheSame': 'Same',
                'InBothDifferent': 'Different',
                'InSource': 'Source Only',
                'InChecked': 'Target Only'
            }[result.settingCheckState] || result.settingCheckState;
            return '\n                <div class="setting-item" \n                     data-name="'.concat(result.name.toLowerCase(), '"\n                     data-status="').concat(result.settingCheckState, '"\n                     data-keywords="').concat((result.keywords || []).join('|').toLowerCase(), '">\n                    <div class="setting-header">\n                        <div class="setting-name">').concat(result.name, '</div>\n                        <div class="status-badge ').concat(badgeClass, '">').concat(badgeText, '</div>\n                    </div>\n                    \n                    <div class="setting-description">').concat(result.description, "</div>\n                    \n                    ").concat(result.keywords && result.keywords.length > 0 ? '\n                        <div class="keywords">\n                            <div class="keywords-label">Keywords</div>\n                            <div class="keyword-list">\n                                '.concat(result.keywords.map((keyword)=>'<span class="keyword">'.concat(keyword, "</span>")).join(''), "\n                            </div>\n                        </div>\n                    ") : '', '\n                    \n                    <div class="values-grid">\n                        <div class="value-card value-source">\n                            <div class="value-label">Source Value</div>\n                            <div class="value-text">').concat(result.values.sourceValue || '[Not Set]', '</div>\n                        </div>\n                        <div class="value-card value-target">\n                            <div class="value-label">Target Value</div>\n                            <div class="value-text">').concat(result.values.checkedValue || '[Not Set]', "</div>\n                        </div>\n                    </div>\n                    \n                    ").concat(result.differences && result.settingCheckState === 'InBothDifferent' ? '\n                        <div class="differences">\n                            <div class="differences-label">Differences Summary</div>\n                            <div class="differences-text">'.concat(result.differences, "</div>\n                        </div>\n                    ") : '', "\n                    \n                    ").concat(result.childSettings && result.childSettings.length > 0 ? '\n                        <div class="child-settings">\n                            <div class="child-settings-header">\n                                ⚙ Child Settings ('.concat(result.childSettings.length, ")\n                            </div>\n                            ").concat(result.childSettings.map((child)=>{
                const isDifferent = child.sourceValue !== child.targetValue;
                return '\n                                    <div class="child-setting '.concat(isDifferent ? 'different' : '', '">\n                                        <div class="child-name">').concat(child.name, '</div>\n                                        <div class="child-values">\n                                            <div class="child-value value-source">\n                                                <strong>Source:</strong> ').concat(child.sourceValue || '[Not Set]', '\n                                            </div>\n                                            <div class="child-value value-target">\n                                                <strong>Target:</strong> ').concat(child.targetValue || '[Not Set]', "\n                                            </div>\n                                        </div>\n                                    </div>\n                                ");
            }).join(''), "\n                        </div>\n                    ") : '', "\n                </div>\n            ");
        }).join(''), "\n    </div>\n\n    <div class=\"no-results hidden\" id=\"noResults\">\n        <h3>No settings match your current filters</h3>\n        <p>Try adjusting your search criteria or clearing the filters.</p>\n    </div>\n\n    <script>\n        let selectedKeywords = [];\n        \n        function toggleKeywordDropdown() {\n            const dropdown = document.getElementById('keywordDropdown');\n            dropdown.classList.toggle('open');\n        }\n        \n        function toggleKeyword(keyword) {\n            const index = selectedKeywords.indexOf(keyword);\n            if (index > -1) {\n                selectedKeywords.splice(index, 1);\n            } else {\n                selectedKeywords.push(keyword);\n            }\n            updateSelectedKeywords();\n            updateKeywordDropdown();\n            filterSettings();\n        }\n        \n        function updateSelectedKeywords() {\n            const container = document.getElementById('selectedKeywords');\n            container.innerHTML = selectedKeywords.map(keyword => \n                `<span class=\"keyword-tag\">\n                    ${keyword}\n                    <button onclick=\"toggleKeyword('${keyword.replace(/'/g, \"\\\\'\")}')\">×</button>\n                </span>`\n            ).join('');\n        }\n        \n        function updateKeywordDropdown() {\n            const options = document.querySelectorAll('.keyword-option');\n            options.forEach(option => {\n                const keyword = option.dataset.keyword;\n                option.classList.toggle('selected', selectedKeywords.includes(keyword));\n            });\n        }\n        \n        function filterSettings() {\n            const searchTerm = document.getElementById('searchInput').value.toLowerCase();\n            const statusFilter = document.getElementById('statusFilter').value;\n            const settings = document.querySelectorAll('.setting-item');\n            let visibleCount = 0;\n            \n            settings.forEach(setting => {\n                const name = setting.dataset.name;\n                const status = setting.dataset.status;\n                const keywords = setting.dataset.keywords;\n                \n                const matchesSearch = !searchTerm || name.includes(searchTerm);\n                const matchesStatus = statusFilter === 'all' || status === statusFilter;\n                const matchesKeywords = selectedKeywords.length === 0 || \n                    selectedKeywords.some(keyword => keywords.includes(keyword.toLowerCase()));\n                \n                const isVisible = matchesSearch && matchesStatus && matchesKeywords;\n                setting.classList.toggle('hidden', !isVisible);\n                \n                if (isVisible) visibleCount++;\n            });\n            \n            document.getElementById('noResults').classList.toggle('hidden', visibleCount > 0);\n        }\n        \n        function clearAllFilters() {\n            document.getElementById('searchInput').value = '';\n            document.getElementById('statusFilter').value = 'all';\n            selectedKeywords = [];\n            updateSelectedKeywords();\n            updateKeywordDropdown();\n            filterSettings();\n        }\n        \n        // Close dropdown when clicking outside\n        document.addEventListener('click', function(event) {\n            const keywordFilter = document.querySelector('.keyword-filter');\n            if (!keywordFilter.contains(event.target)) {\n                document.getElementById('keywordDropdown').classList.remove('open');\n            }\n        });\n        \n        // Add event listeners\n        document.getElementById('searchInput').addEventListener('input', filterSettings);\n        document.getElementById('statusFilter').addEventListener('change', filterSettings);\n    </script>\n</body>\n</html>\n    ");
        // Create and download the HTML file
        const blob = new Blob([
            htmlContent
        ], {
            type: 'text/html'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "policy-comparison-".concat(comparisonResult.results.sourcePolicyName.replace(/[^a-z0-9]/gi, '_').toLowerCase(), "-vs-").concat(comparisonResult.results.checkedPolicyName.replace(/[^a-z0-9]/gi, '_').toLowerCase(), "-").concat(new Date().toISOString().split('T')[0], ".html");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4 lg:p-8 space-y-6 w-full max-w-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl lg:text-3xl font-bold text-foreground",
                                children: "Policy Comparison"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1116,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground mt-2",
                                children: "Compare configuration policies to identify differences and similarities"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1117,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1115,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: fetchPolicies,
                            disabled: loading,
                            variant: "outline",
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                    className: "h-4 w-4 ".concat(loading ? 'animate-spin' : '')
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1128,
                                    columnNumber: 25
                                }, this),
                                policies.length > 0 ? 'Refresh' : 'Load Policies'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 1122,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1121,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1114,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-red-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-red-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1140,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: "Error:"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1141,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1142,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1139,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 1138,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1137,
                columnNumber: 17
            }, this),
            policies.length === 0 && !loading && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-400 mb-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                                    className: "h-16 w-16 mx-auto"
                                }, void 0, false, {
                                    fileName: "[project]/app/compare/policies/page.tsx",
                                    lineNumber: 1154,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1153,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-medium text-foreground mb-4",
                                children: "Ready to Compare Policies"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1156,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 mb-6 max-w-md mx-auto",
                                children: "Load your configuration policies to start comparing them and identify key differences."
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1159,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                onClick: fetchPolicies,
                                className: "flex items-center gap-2 mx-auto",
                                size: "lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1163,
                                        columnNumber: 33
                                    }, this),
                                    "Load Policies"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1162,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1152,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 1151,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1150,
                columnNumber: 17
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "pt-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-16",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                className: "h-12 w-12 mx-auto text-yellow-500 animate-spin mb-4"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1176,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-medium text-foreground mb-2",
                                children: "Loading Policies"
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1177,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600",
                                children: "Fetching configuration policies from your environment..."
                            }, void 0, false, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1180,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1175,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/compare/policies/page.tsx",
                    lineNumber: 1174,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/compare/policies/page.tsx",
                lineNumber: 1173,
                columnNumber: 17
            }, this),
            policies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "relative bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "pb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                className: "h-5 w-5 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1195,
                                                columnNumber: 33
                                            }, this),
                                            "Select Policies to Compare"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1194,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                        children: [
                                            "Choose two policies of the same type to compare their configurations. Found ",
                                            policies.length,
                                            " configuration policies."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1197,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1193,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "min-h-[400px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SearchableSelect, {
                                                value: (sourcePolicy === null || sourcePolicy === void 0 ? void 0 : sourcePolicy.id) || '',
                                                onSelect: handleSourcePolicySelect,
                                                options: policies,
                                                placeholder: "Select source policy...",
                                                disabled: loading,
                                                label: "Source Policy"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1203,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SearchableSelect, {
                                                value: (targetPolicy === null || targetPolicy === void 0 ? void 0 : targetPolicy.id) || '',
                                                onSelect: setTargetPolicy,
                                                options: getTargetPolicyOptions(),
                                                placeholder: sourcePolicy ? "Select target policy..." : "Select source policy first...",
                                                disabled: loading || !sourcePolicy,
                                                label: "Target Policy"
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1212,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1202,
                                        columnNumber: 29
                                    }, this),
                                    sourcePolicy && targetPolicy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-center pt-8",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: comparePolicies,
                                            disabled: compareLoading,
                                            size: "lg",
                                            className: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                                            children: compareLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                        className: "mr-2 h-5 w-5 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1232,
                                                        columnNumber: 49
                                                    }, this),
                                                    "Comparing..."
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$compare$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitCompare$3e$__["GitCompare"], {
                                                        className: "mr-2 h-5 w-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1236,
                                                        columnNumber: 47
                                                    }, this),
                                                    "Compare Policies"
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1224,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1223,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1201,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1192,
                        columnNumber: 20
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-red-200 bg-red-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "pt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-red-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1250,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: "Error:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1251,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1252,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1249,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/compare/policies/page.tsx",
                            lineNumber: 1248,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/compare/policies/page.tsx",
                        lineNumber: 1247,
                        columnNumber: 25
                    }, this),
                    (comparisonResult === null || comparisonResult === void 0 ? void 0 : (_comparisonResult_results1 = comparisonResult.results) === null || _comparisonResult_results1 === void 0 ? void 0 : _comparisonResult_results1.checkResults) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        className: "pb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "h-5 w-5 text-gray-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1265,
                                                    columnNumber: 41
                                                }, this),
                                                "Search Settings"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1264,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1263,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    placeholder: "Search by setting name...",
                                                    className: "w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                                    value: filter,
                                                    onChange: (e)=>setFilter(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1271,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1278,
                                                    columnNumber: 41
                                                }, this),
                                                filter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: clearSearch,
                                                    className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                        className: "h-5 w-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1284,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1280,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1270,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1269,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1262,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        className: "pb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                                            className: "h-5 w-5 text-gray-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1296,
                                                            columnNumber: 45
                                                        }, this),
                                                        "Filters"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1295,
                                                    columnNumber: 41
                                                }, this),
                                                (statusFilter !== 'all' || filter || selectedKeywords.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    onClick: clearFilter,
                                                    variant: "outline",
                                                    size: "sm",
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1306,
                                                            columnNumber: 49
                                                        }, this),
                                                        "Clear"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1300,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/compare/policies/page.tsx",
                                            lineNumber: 1294,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1293,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "block text-sm font-medium text-gray-700 mb-2",
                                                                children: "Comparison Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1315,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                                                value: statusFilter,
                                                                onChange: (e)=>setStatusFilter(e.target.value),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "all",
                                                                        children: "All Settings"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1323,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "InBothDifferent",
                                                                        children: "Different Values"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1324,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "InBothTheSame",
                                                                        children: "Same Values"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1325,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "InSource",
                                                                        children: "Source Only"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1326,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "InChecked",
                                                                        children: "Target Only"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1327,
                                                                        columnNumber: 49
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1318,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1314,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiSelectKeywords, {
                                                        availableKeywords: getAllKeywords(),
                                                        selectedKeywords: selectedKeywords,
                                                        onSelectionChange: setSelectedKeywords
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1331,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1313,
                                                columnNumber: 37
                                            }, this),
                                            (statusFilter !== 'all' || filter || selectedKeywords.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-medium text-gray-700 mb-2",
                                                        children: "Active Filters:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1341,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-2",
                                                        children: [
                                                            filter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "secondary",
                                                                className: "flex items-center gap-1",
                                                                children: [
                                                                    'Search: "',
                                                                    filter,
                                                                    '"',
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setFilter(''),
                                                                        className: "ml-1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                            className: "h-3 w-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                                            lineNumber: 1347,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1346,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1344,
                                                                columnNumber: 53
                                                            }, this),
                                                            statusFilter !== 'all' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "secondary",
                                                                className: "flex items-center gap-1",
                                                                children: [
                                                                    "Status: ",
                                                                    statusFilter,
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setStatusFilter('all'),
                                                                        className: "ml-1",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                            className: "h-3 w-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                                            lineNumber: 1355,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1354,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1352,
                                                                columnNumber: 53
                                                            }, this),
                                                            selectedKeywords.map((keyword)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                    variant: "secondary",
                                                                    className: "flex items-center gap-1",
                                                                    children: [
                                                                        "Keyword: ",
                                                                        keyword,
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>setSelectedKeywords((prev)=>prev.filter((k)=>k !== keyword)),
                                                                            className: "ml-1",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                                                className: "h-3 w-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1366,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                                            lineNumber: 1362,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, keyword, true, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 1360,
                                                                    columnNumber: 53
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1342,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1340,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1312,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1292,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 w-full overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        className: "pb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeftRight$3e$__["ArrowLeftRight"], {
                                                                className: "h-5 w-5 text-gray-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1382,
                                                                columnNumber: 45
                                                            }, this),
                                                            "Comparison Results",
                                                            stats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-gray-500",
                                                                children: [
                                                                    "(",
                                                                    stats.total,
                                                                    " settings)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1384,
                                                                columnNumber: 55
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1381,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            stats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap gap-2 text-sm",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                        variant: "default",
                                                                        className: "bg-green-500 hover:bg-green-600",
                                                                        children: [
                                                                            "Same: ",
                                                                            stats.same
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1389,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                        variant: "default",
                                                                        className: "bg-red-500 hover:bg-red-600",
                                                                        children: [
                                                                            "Different: ",
                                                                            stats.different
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1390,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                        variant: "default",
                                                                        className: "bg-blue-500 hover:bg-blue-600",
                                                                        children: [
                                                                            "Source Only: ",
                                                                            stats.sourceOnly
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1391,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                        variant: "default",
                                                                        className: "bg-yellow-500 hover:bg-yellow-600",
                                                                        children: [
                                                                            "Target Only: ",
                                                                            stats.targetOnly
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1392,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1388,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                onClick: exportToHtml,
                                                                variant: "outline",
                                                                size: "sm",
                                                                className: "flex items-center gap-2 whitespace-nowrap",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1401,
                                                                        columnNumber: 49
                                                                    }, this),
                                                                    "Export HTML"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1395,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1386,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1380,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                children: [
                                                    "Detailed comparison between ",
                                                    (_comparisonResult_results2 = comparisonResult.results) === null || _comparisonResult_results2 === void 0 ? void 0 : _comparisonResult_results2.sourcePolicyName,
                                                    " and ",
                                                    (_comparisonResult_results3 = comparisonResult.results) === null || _comparisonResult_results3 === void 0 ? void 0 : _comparisonResult_results3.checkedPolicyName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1406,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1379,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "sticky top-0 z-10 p-6 bg-white border-b relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "font-medium text-blue-900",
                                                                    children: "Source Policy"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 1415,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-blue-700 text-sm",
                                                                    children: (_comparisonResult_results4 = comparisonResult.results) === null || _comparisonResult_results4 === void 0 ? void 0 : _comparisonResult_results4.sourcePolicyName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 1416,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1414,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-green-50 p-4 rounded-lg border-l-4 border-green-400",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "font-medium text-green-900",
                                                                    children: "Target Policy"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 1419,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-green-700 text-sm",
                                                                    children: (_comparisonResult_results5 = comparisonResult.results) === null || _comparisonResult_results5 === void 0 ? void 0 : _comparisonResult_results5.checkedPolicyName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                                    lineNumber: 1420,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/compare/policies/page.tsx",
                                                            lineNumber: 1418,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1413,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1412,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-6 space-y-4",
                                                children: filteredResults.length > 0 ? filteredResults.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mb-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "font-medium text-gray-900",
                                                                        children: result.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1431,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    getStatusBadge(result.settingCheckState)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1430,
                                                                columnNumber: 53
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600 mb-3",
                                                                children: result.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1435,
                                                                columnNumber: 53
                                                            }, this),
                                                            result.keywords && result.keywords.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-xs text-gray-500 font-medium mb-2",
                                                                        children: "KEYWORDS"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1440,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex flex-wrap gap-1",
                                                                        children: result.keywords.map((keyword, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                variant: "outline",
                                                                                className: "text-xs bg-neutral-300 hover:bg-neutral-400",
                                                                                children: keyword
                                                                            }, index, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1443,
                                                                                columnNumber: 69
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1441,
                                                                        columnNumber: 61
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1439,
                                                                columnNumber: 57
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "bg-blue-50 p-3 rounded border-l-4 border-blue-400",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xs text-blue-600 font-medium mb-1",
                                                                                children: "SOURCE VALUE"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1454,
                                                                                columnNumber: 61
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm text-blue-900",
                                                                                children: result.values.sourceValue || '[Not Set]'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1455,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1453,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "bg-green-50 p-3 rounded border-l-4 border-green-400",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xs text-green-600 font-medium mb-1",
                                                                                children: "TARGET VALUE"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1460,
                                                                                columnNumber: 61
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm text-green-900",
                                                                                children: result.values.checkedValue || '[Not Set]'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1461,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1459,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1452,
                                                                columnNumber: 53
                                                            }, this),
                                                            result.differences && result.settingCheckState === 'InBothDifferent' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-xs text-yellow-600 font-medium mb-1",
                                                                        children: "DIFFERENCES SUMMARY"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1470,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm text-yellow-900",
                                                                        children: result.differences
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1471,
                                                                        columnNumber: 61
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1469,
                                                                columnNumber: 57
                                                            }, this),
                                                            result.childSettings && result.childSettings.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-4 border-t pt-4",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "text-sm font-medium text-gray-700 mb-3 flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                                                className: "h-4 w-4"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1479,
                                                                                columnNumber: 65
                                                                            }, this),
                                                                            "Child Settings (",
                                                                            result.childSettings.length,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1478,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-3",
                                                                        children: result.childSettings.map((child, index)=>{
                                                                            const isDifferent = child.sourceValue !== child.targetValue;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "p-3 rounded-lg border ".concat(isDifferent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'),
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center justify-between mb-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-sm font-medium text-gray-700",
                                                                                                children: child.name
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                lineNumber: 1491,
                                                                                                columnNumber: 81
                                                                                            }, this),
                                                                                            isDifferent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                                                variant: "destructive",
                                                                                                className: "text-xs",
                                                                                                children: "Different"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                lineNumber: 1493,
                                                                                                columnNumber: 85
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                                        lineNumber: 1490,
                                                                                        columnNumber: 77
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-xs",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "p-2 rounded ".concat(isDifferent ? 'bg-blue-100' : 'bg-white'),
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "text-blue-600 font-medium mb-1",
                                                                                                        children: "SOURCE"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                        lineNumber: 1499,
                                                                                                        columnNumber: 85
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "text-blue-900",
                                                                                                        children: child.sourceValue || '[Not Set]'
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                        lineNumber: 1500,
                                                                                                        columnNumber: 85
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                lineNumber: 1498,
                                                                                                columnNumber: 81
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "p-2 rounded ".concat(isDifferent ? 'bg-green-100' : 'bg-white'),
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "text-green-600 font-medium mb-1",
                                                                                                        children: "TARGET"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                        lineNumber: 1505,
                                                                                                        columnNumber: 85
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "text-green-900",
                                                                                                        children: child.targetValue || '[Not Set]'
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                        lineNumber: 1506,
                                                                                                        columnNumber: 85
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                                lineNumber: 1504,
                                                                                                columnNumber: 81
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                                        lineNumber: 1497,
                                                                                        columnNumber: 77
                                                                                    }, this)
                                                                                ]
                                                                            }, index, true, {
                                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                                lineNumber: 1487,
                                                                                columnNumber: 73
                                                                            }, this);
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                                        lineNumber: 1482,
                                                                        columnNumber: 61
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                                lineNumber: 1477,
                                                                columnNumber: 57
                                                            }, this)
                                                        ]
                                                    }, result.id, true, {
                                                        fileName: "[project]/app/compare/policies/page.tsx",
                                                        lineNumber: 1429,
                                                        columnNumber: 49
                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-center py-8 text-gray-500",
                                                    children: "No settings match your current filters."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/compare/policies/page.tsx",
                                                    lineNumber: 1520,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/compare/policies/page.tsx",
                                                lineNumber: 1426,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/compare/policies/page.tsx",
                                        lineNumber: 1410,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/compare/policies/page.tsx",
                                lineNumber: 1378,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/app/compare/policies/page.tsx",
        lineNumber: 1113,
        columnNumber: 9
    }, this);
}
_s(PolicyComparison, "ToOLriZud2RR+BBW8ZKfO9rc8jc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"]
    ];
});
_c = PolicyComparison;
var _c;
__turbopack_context__.k.register(_c, "PolicyComparison");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7bf455fd._.js.map