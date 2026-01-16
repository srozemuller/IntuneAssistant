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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function DataTable(param) {
    let { data, columns: initialColumns, className = '', onRowClick, currentPage = 1, totalPages = 1, itemsPerPage = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ITEMS_PER_PAGE"], onPageChange, rowClassName, onItemsPerPageChange, showPagination = false, showSearch = true, searchPlaceholder = "Search...", onSelectionChange, selectedRows = [] } = param;
    _s();
    // Local pagination state to support uncontrolled usage
    const [internalCurrentPage, setInternalCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(currentPage);
    const [internalItemsPerPage, setInternalItemsPerPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(itemsPerPage);
    // Sync internal state when parent updates props
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTable.useEffect": ()=>setInternalCurrentPage(currentPage)
    }["DataTable.useEffect"], [
        currentPage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTable.useEffect": ()=>setInternalItemsPerPage(itemsPerPage)
    }["DataTable.useEffect"], [
        itemsPerPage
    ]);
    // Effective values: prefer controller (props) when callbacks are provided
    const effectiveCurrentPage = onPageChange ? currentPage : internalCurrentPage;
    const effectiveItemsPerPage = onItemsPerPageChange ? itemsPerPage : internalItemsPerPage;
    const changePage = (page)=>{
        if (onPageChange) {
            onPageChange(page);
        } else {
            setInternalCurrentPage(page);
        }
    };
    const changeItemsPerPage = (n)=>{
        if (onItemsPerPageChange) {
            onItemsPerPageChange(n);
        } else {
            setInternalItemsPerPage(n);
        }
    };
    const isRowSelected = (row)=>{
        if (!selectedRows || selectedRows.length === 0) return false;
        const rowId = String(row.id);
        return selectedRows.includes(rowId);
    };
    const handleRowSelection = (e, row)=>{
        e.stopPropagation();
        const rowId = String(row.id);
        if (onSelectionChange) {
            const isCurrentlySelected = isRowSelected(row);
            if (isCurrentlySelected) {
                onSelectionChange(selectedRows.filter((id)=>id !== rowId));
            } else {
                onSelectionChange([
                    ...selectedRows,
                    rowId
                ]);
            }
        }
    };
    const columnsWithSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DataTable.useMemo[columnsWithSelection]": ()=>{
            if (onSelectionChange && !initialColumns.some({
                "DataTable.useMemo[columnsWithSelection]": (col)=>col.key === '_select'
            }["DataTable.useMemo[columnsWithSelection]"])) {
                return [
                    {
                        key: '_select',
                        label: '',
                        width: 50,
                        minWidth: 40,
                        sortable: false,
                        searchable: false,
                        sortValue: undefined,
                        render: {
                            "DataTable.useMemo[columnsWithSelection]": (_, row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: isRowSelected(row),
                                    onChange: {
                                        "DataTable.useMemo[columnsWithSelection]": (e)=>handleRowSelection(e, row)
                                    }["DataTable.useMemo[columnsWithSelection]"],
                                    className: "rounded border-input text-primary focus:ring-ring"
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 120,
                                    columnNumber: 25
                                }, this)
                        }["DataTable.useMemo[columnsWithSelection]"]
                    },
                    ...initialColumns
                ];
            }
            return initialColumns;
        }
    }["DataTable.useMemo[columnsWithSelection]"], [
        onSelectionChange,
        selectedRows,
        initialColumns
    ]);
    const [columns, setColumns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(columnsWithSelection.map({
        "DataTable.useState": (col)=>({
                ...col,
                width: col.width || 150,
                minWidth: col.minWidth || 100,
                searchable: col.searchable !== false && col.key !== '_select',
                sortValue: col.sortValue
            })
    }["DataTable.useState"]));
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [resizing, setResizing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const tableRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTable.useEffect": ()=>{
            setColumns(columnsWithSelection.map({
                "DataTable.useEffect": (col)=>({
                        ...col,
                        width: col.width || 150,
                        minWidth: col.minWidth || 100,
                        searchable: col.searchable !== false && col.key !== '_select',
                        sortValue: col.sortValue
                    })
            }["DataTable.useEffect"]));
        }
    }["DataTable.useEffect"], [
        columnsWithSelection
    ]);
    // Filter data based on search term
    const filteredData = data.filter((row)=>{
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        // Search through ALL properties in the row, not just the column keys
        return Object.entries(row).some((param)=>{
            let [key, value] = param;
            if (value === null || value === undefined) return false;
            const stringValue = String(value).toLowerCase();
            return stringValue.includes(searchLower);
        });
    });
    // Sort filtered data
    const sortedData = [
        ...filteredData
    ].sort((a, b)=>{
        if (!sortConfig) return 0;
        // Find the column configuration to check for custom sortValue
        const column = columns.find((col)=>col.key === sortConfig.key);
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
    });
    // Update pagination to work with filtered/sorted data
    const startIndex = (effectiveCurrentPage - 1) * effectiveItemsPerPage;
    const endIndex = startIndex + effectiveItemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const totalFilteredPages = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));
    const handleSort = (columnKey)=>{
        let direction = 'asc';
        if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({
            key: columnKey,
            direction
        });
    };
    const getSortIcon = (columnKey)=>{
        if (!sortConfig || sortConfig.key !== columnKey) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUpDown$3e$__["ChevronsUpDown"], {
                className: "h-4 w-4 text-muted-foreground"
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 231,
                columnNumber: 20
            }, this);
        }
        return sortConfig.direction === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
            className: "h-4 w-4 text-foreground"
        }, void 0, false, {
            fileName: "[project]/components/DataTable.tsx",
            lineNumber: 235,
            columnNumber: 15
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
            className: "h-4 w-4 text-foreground"
        }, void 0, false, {
            fileName: "[project]/components/DataTable.tsx",
            lineNumber: 236,
            columnNumber: 15
        }, this);
    };
    const clearSearch = ()=>{
        setSearchTerm('');
        changePage(1);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTable.useEffect": ()=>{
            if (effectiveCurrentPage > 1) {
                changePage(1);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DataTable.useEffect"], [
        searchTerm
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTable.useEffect": ()=>{
            const maxPage = Math.max(1, Math.ceil(sortedData.length / effectiveItemsPerPage));
            if (effectiveCurrentPage > maxPage) {
                changePage(1);
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["DataTable.useEffect"], [
        effectiveItemsPerPage,
        sortedData.length,
        effectiveCurrentPage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DataTable.useEffect": ()=>{
            const handleMouseMove = {
                "DataTable.useEffect.handleMouseMove": (e)=>{
                    if (!resizing) return;
                    const diff = e.clientX - resizing.startX;
                    const newWidth = Math.max(resizing.startWidth + diff, columns[resizing.columnIndex].minWidth || 100);
                    setColumns({
                        "DataTable.useEffect.handleMouseMove": (prev)=>prev.map({
                                "DataTable.useEffect.handleMouseMove": (col, index)=>index === resizing.columnIndex ? {
                                        ...col,
                                        width: newWidth
                                    } : col
                            }["DataTable.useEffect.handleMouseMove"])
                    }["DataTable.useEffect.handleMouseMove"]);
                }
            }["DataTable.useEffect.handleMouseMove"];
            const handleMouseUp = {
                "DataTable.useEffect.handleMouseUp": ()=>{
                    setResizing(null);
                }
            }["DataTable.useEffect.handleMouseUp"];
            if (resizing) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }
            return ({
                "DataTable.useEffect": ()=>{
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
            })["DataTable.useEffect"];
        }
    }["DataTable.useEffect"], [
        resizing,
        columns
    ]);
    const handleResizeStart = (e, columnIndex)=>{
        e.preventDefault();
        e.stopPropagation();
        setResizing({
            columnIndex,
            startX: e.clientX,
            startWidth: columns[columnIndex].width || 150
        });
    };
    const handleRowClick = (e, row, index)=>{
        if (resizing) return;
        const target = e.target;
        const isInteractive = target.closest('input[type="checkbox"], input[type="radio"], button, a, [role="button"], [tabindex="0"]');
        if (!isInteractive && onRowClick) {
            onRowClick(row, index, e);
        }
    };
    const getCellValue = (row, column)=>{
        if (column.key === '_select') {
            return null;
        }
        return row[column.key];
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-background border rounded-lg overflow-hidden shadow-sm ".concat(className),
        children: [
            showSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-muted border-b",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative max-w-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 321,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: searchPlaceholder,
                                value: searchTerm,
                                onChange: (e)=>setSearchTerm(e.target.value),
                                className: "w-full pl-10 pr-10 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 322,
                                columnNumber: 25
                            }, this),
                            searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearSearch,
                                className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 334,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 330,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 320,
                        columnNumber: 21
                    }, this),
                    searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 text-sm text-muted-foreground",
                        children: [
                            sortedData.length,
                            " of ",
                            data.length,
                            " results"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 339,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 319,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    ref: tableRef,
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-background sticky top-0 z-10 border-b",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "border-b",
                                children: columns.map((column, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "relative text-left p-3 font-medium text-foreground",
                                        style: {
                                            width: "".concat(column.width, "px")
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 flex-1 ".concat(column.sortable !== false && column.key !== '_select' ? 'cursor-pointer hover:text-primary transition-colors' : ''),
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
                                                            lineNumber: 370,
                                                            columnNumber: 41
                                                        }, this),
                                                        column.sortable !== false && column.key !== '_select' && getSortIcon(column.key)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DataTable.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 357,
                                                columnNumber: 33
                                            }, this),
                                            column.key !== '_select' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary group",
                                                onMouseDown: (e)=>handleResizeStart(e, index),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full w-px bg-border group-hover:bg-primary transition-colors"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/DataTable.tsx",
                                                    lineNumber: 382,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 378,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, column.key, true, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 352,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 350,
                                columnNumber: 21
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DataTable.tsx",
                            lineNumber: 348,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "bg-background divide-y divide-border",
                            children: paginatedData.length > 0 ? paginatedData.map((row, rowIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "\n                transition-colors\n                ".concat(onRowClick ? 'cursor-pointer' : '', "\n                ").concat(isRowSelected(row) ? 'bg-yellow-400 dark:bg-yellow-400/80 text-foreground border-l-4 border-l-yellow-600 dark:border-l-yellow-400 shadow-md ring-1 ring-yellow-500/30' : 'hover:bg-muted/50', "\n                ").concat(rowClassName ? rowClassName(row) : '', "\n            "),
                                    onClick: (e)=>handleRowClick(e, row, startIndex + rowIndex),
                                    children: columns.map((column)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 text-foreground",
                                            style: {
                                                width: "".concat(column.width, "px")
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overflow-hidden",
                                                children: column.render ? column.render(getCellValue(row, column), row) : String(getCellValue(row, column) || '')
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 412,
                                                columnNumber: 41
                                            }, this)
                                        }, column.key, false, {
                                            fileName: "[project]/components/DataTable.tsx",
                                            lineNumber: 407,
                                            columnNumber: 37
                                        }, this))
                                }, rowIndex, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 392,
                                    columnNumber: 29
                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: columns.length,
                                    className: "p-8 text-center text-muted-foreground bg-muted/50",
                                    children: searchTerm ? 'No results found for your search.' : 'No data available.'
                                }, void 0, false, {
                                    fileName: "[project]/components/DataTable.tsx",
                                    lineNumber: 424,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 423,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DataTable.tsx",
                            lineNumber: 389,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DataTable.tsx",
                    lineNumber: 347,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 346,
                columnNumber: 13
            }, this),
            showPagination && sortedData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between p-4 border-t bg-muted",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-muted-foreground",
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
                                lineNumber: 439,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-muted-foreground",
                                        children: "Items per page:"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 444,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: effectiveItemsPerPage,
                                        onChange: (e)=>{
                                            const newItemsPerPage = Number(e.target.value);
                                            changeItemsPerPage(newItemsPerPage);
                                            changePage(1);
                                        },
                                        className: "border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 10,
                                                children: "10"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 454,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 25,
                                                children: "25"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 455,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 50,
                                                children: "50"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 456,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: 100,
                                                children: "100"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DataTable.tsx",
                                                lineNumber: 457,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 445,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 443,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 438,
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
                                        lineNumber: 468,
                                        columnNumber: 29
                                    }, this),
                                    "Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 462,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: Array.from({
                                    length: Math.min(5, totalFilteredPages)
                                }, (_, i)=>{
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
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: effectiveCurrentPage === pageNum ? "default" : "outline",
                                        size: "sm",
                                        onClick: ()=>changePage(pageNum),
                                        className: "w-8 h-8 p-0",
                                        children: pageNum
                                    }, pageNum, false, {
                                        fileName: "[project]/components/DataTable.tsx",
                                        lineNumber: 486,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 472,
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
                                        lineNumber: 506,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DataTable.tsx",
                                lineNumber: 499,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DataTable.tsx",
                        lineNumber: 461,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DataTable.tsx",
                lineNumber: 437,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DataTable.tsx",
        lineNumber: 317,
        columnNumber: 9
    }, this);
}
_s(DataTable, "zjIEH5pBZ4VYBkB/EIlN+5tNTAE=");
_c = DataTable;
var _c;
__turbopack_context__.k.register(_c, "DataTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/PlanProtection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PlanProtection",
    ()=>PlanProtection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
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
function PlanProtection(param) {
    let { children, requiredPlan, featureName } = param;
    _s();
    const [dialogOpen, setDialogOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // This would normally come from your user/subscription context
    const hasValidPlan = true; // Replace with actual plan check logic
    if ("TURBOPACK compile-time truthy", 1) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    //TURBOPACK unreachable
    ;
    const planInfo = undefined;
    const plan = undefined;
    const getDialogContent = undefined;
    const dialogContent = undefined;
    const emailBody = undefined;
    const mailtoLink = undefined;
}
_s(PlanProtection, "b79sV4Ur295qa8CEsXVhtHGdgXA=");
_c = PlanProtection;
var _c;
__turbopack_context__.k.register(_c, "PlanProtection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/deployment/assignments/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AssignmentRolloutPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-client] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/blocks.js [app-client] (ecmascript) <export default as Blocks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/msal-react/dist/hooks/useMsal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$msalConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/msalConfig.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useGroupDetails$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useGroupDetails.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DataTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useApiRequest.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlanProtection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PlanProtection.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ConsentContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ConsentContext.tsx [app-client] (ecmascript)");
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
;
function AssignmentRolloutContent() {
    _s();
    var _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
    // API CALLS
    const { instance, accounts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"])();
    const { request, cancel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"])();
    // Consent dialog state when not enough permissions
    const [showConsentDialog, setShowConsentDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [consentUrl, setConsentUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // State management
    const [currentStep, setCurrentStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('upload');
    const [csvData, setCsvData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [comparisonResults, setComparisonResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedRows, setSelectedRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [migrationProgress, setMigrationProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [validationComplete, setValidationComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [validationResults, setValidationResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [uploadCurrentPage, setUploadCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [compareCurrentPage, setCompareCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [validationCurrentPage, setValidationCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    // Group assignments dialog state
    const [showAssignmentsDialog, setShowAssignmentsDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedAssignments, setSelectedAssignments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [assignmentGroups, setAssignmentGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loadingAssignmentGroups, setLoadingAssignmentGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Add pagination logic before the return statement
    const [itemsPerPage, setItemsPerPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ITEMS_PER_PAGE"]);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = comparisonResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(comparisonResults.length / itemsPerPage);
    const { showConsent } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ConsentContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConsent"])();
    const [migrationSuccessful, setMigrationSuccessful] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [expandedRows, setExpandedRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Add this component before the uploadColumns definition
    const ValidationStatusCell = (param)=>{
        let { csvRow } = param;
        _s1();
        const [showTooltip, setShowTooltip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
        const [tooltipPosition, setTooltipPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
            x: 0,
            y: 0
        });
        const iconRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
        const handleMouseEnter = ()=>{
            if (iconRef.current) {
                const rect = iconRef.current.getBoundingClientRect();
                setTooltipPosition({
                    x: rect.left,
                    y: rect.bottom + 8
                });
                setShowTooltip(true);
            }
        };
        if (!csvRow.isValid) {
            var _csvRow_validationErrors;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: iconRef,
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: ()=>setShowTooltip(false),
                        className: "flex items-center justify-center cursor-help",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "h-5 w-5 text-red-500"
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 279,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 273,
                        columnNumber: 21
                    }, this),
                    showTooltip && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createPortal(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-[10000] bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]",
                        style: {
                            left: "".concat(tooltipPosition.x, "px"),
                            top: "".concat(tooltipPosition.y, "px")
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -top-1 left-4 w-2 h-2 bg-red-50 dark:bg-red-900 border-l border-t border-red-200 dark:border-red-700 transform rotate-45"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 289,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-red-800 dark:text-red-200 mb-2",
                                children: "Validation Errors:"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 290,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "text-xs text-red-700 dark:text-red-300 space-y-1",
                                children: (_csvRow_validationErrors = csvRow.validationErrors) === null || _csvRow_validationErrors === void 0 ? void 0 : _csvRow_validationErrors.map((error, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "leading-relaxed",
                                        children: [
                                            "• ",
                                            error.message
                                        ]
                                    }, idx, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 293,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 291,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 282,
                        columnNumber: 25
                    }, this), document.body)
                ]
            }, void 0, true);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-5 w-5 text-green-500"
            }, void 0, false, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 305,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/deployment/assignments/page.tsx",
            lineNumber: 304,
            columnNumber: 13
        }, this);
    };
    _s1(ValidationStatusCell, "mfu+pwfLpkIsokl6AxMPXj9HEIw=");
    const uploadColumns = [
        {
            key: 'validationStatusSort',
            label: 'Status',
            width: 25,
            maxWidth: 25,
            minWidth: 25,
            sortable: true,
            sortValue: (row)=>{
                const csvRow = row;
                // Return 0 for invalid (sorts first), 1 for valid (sorts last)
                return csvRow.isValid ? 1 : 0;
            },
            render: (_, row)=>{
                const csvRow = row;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ValidationStatusCell, {
                    csvRow: csvRow
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 325,
                    columnNumber: 24
                }, this);
            }
        },
        {
            key: 'PolicyName',
            label: 'Policy Name',
            minWidth: 200,
            render: (value, row)=>{
                var _csvRow_validationErrors;
                const csvRow = row;
                const hasError = (_csvRow_validationErrors = csvRow.validationErrors) === null || _csvRow_validationErrors === void 0 ? void 0 : _csvRow_validationErrors.some((e)=>e.field === 'PolicyName');
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm font-medium cursor-pointer truncate block w-full text-left ".concat(hasError ? 'text-red-600 font-bold' : ''),
                    title: String(value),
                    children: String(value) || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-500 italic",
                        children: "Missing"
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 339,
                        columnNumber: 43
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 336,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'GroupName',
            label: 'Group Name',
            minWidth: 150,
            render: (value, row)=>{
                var _csvRow_validationErrors;
                const csvRow = row;
                const hasError = (_csvRow_validationErrors = csvRow.validationErrors) === null || _csvRow_validationErrors === void 0 ? void 0 : _csvRow_validationErrors.some((e)=>e.field === 'GroupName');
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm font-medium cursor-pointer truncate block w-full text-left ".concat(hasError ? 'text-red-600 font-bold' : csvRow.AssignmentAction === 'NoAssignment' ? 'text-gray-400' : ''),
                    title: String(value),
                    children: String(value) || (hasError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-500 italic",
                        children: "Missing"
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 356,
                        columnNumber: 55
                    }, this) : '-')
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 352,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'AssignmentDirection',
            label: 'Direction',
            render: (value, row)=>{
                var _csvRow_validationErrors;
                const csvRow = row;
                const hasError = (_csvRow_validationErrors = csvRow.validationErrors) === null || _csvRow_validationErrors === void 0 ? void 0 : _csvRow_validationErrors.some((e)=>e.field === 'AssignmentDirection');
                if (hasError) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "destructive",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "h-3 w-3 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 371,
                                columnNumber: 29
                            }, this),
                            "Missing"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 370,
                        columnNumber: 25
                    }, this);
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: csvRow.AssignmentDirection === 'Include' ? 'default' : 'destructive',
                    className: csvRow.AssignmentAction === 'NoAssignment' ? 'opacity-50' : '',
                    children: csvRow.AssignmentDirection
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 378,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'AssignmentAction',
            label: 'Action',
            render: (value, row)=>{
                var _csvRow_validationErrors;
                const csvRow = row;
                const hasError = (_csvRow_validationErrors = csvRow.validationErrors) === null || _csvRow_validationErrors === void 0 ? void 0 : _csvRow_validationErrors.some((e)=>e.field === 'AssignmentAction');
                if (hasError) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "destructive",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                        className: "h-3 w-3 mr-1"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 398,
                                        columnNumber: 33
                                    }, this),
                                    "Invalid"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 397,
                                columnNumber: 29
                            }, this),
                            csvRow.originalActionValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-red-600",
                                children: [
                                    '"',
                                    csvRow.originalActionValue,
                                    '"'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 402,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 396,
                        columnNumber: 25
                    }, this);
                }
                if (!csvRow.isValidAction) {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                variant: "destructive",
                                children: "Invalid"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 413,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-red-600",
                                children: [
                                    '"',
                                    csvRow.originalActionValue,
                                    '"'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 414,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 412,
                        columnNumber: 25
                    }, this);
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: csvRow.AssignmentAction === 'Add' ? 'default' : csvRow.AssignmentAction === 'Replace' ? 'default' : csvRow.AssignmentAction === 'Remove' ? 'destructive' : csvRow.AssignmentAction === 'NoAssignment' ? 'secondary' : 'secondary',
                    className: csvRow.AssignmentAction === 'Add' ? 'bg-green-500 hover:bg-green-600 text-white' : csvRow.AssignmentAction === 'Replace' ? 'bg-blue-500 hover:bg-blue-600 text-white' : csvRow.AssignmentAction === 'Remove' ? 'bg-orange-500 hover:bg-orange-600 text-white' : csvRow.AssignmentAction === 'NoAssignment' ? 'bg-gray-500 hover:bg-gray-600 text-white' : '',
                    children: csvRow.AssignmentAction
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 422,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'FilterName',
            label: 'Filter Name',
            render: (value, row)=>{
                const csvRow = row;
                return csvRow.FilterName ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-xs truncate ".concat(csvRow.AssignmentAction === 'NoAssignment' ? 'text-gray-400' : ''),
                    title: csvRow.FilterName,
                    children: csvRow.FilterName
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 447,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-gray-400",
                    children: "-"
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 451,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'FilterType',
            label: 'Filter Type',
            render: (value, row)=>{
                const csvRow = row;
                return csvRow.FilterType ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: csvRow.FilterType === 'Include' ? 'default' : 'secondary',
                    className: csvRow.AssignmentAction === 'NoAssignment' ? 'opacity-50' : '',
                    children: csvRow.FilterType
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 461,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-gray-400",
                    children: "-"
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 468,
                    columnNumber: 21
                }, this);
            }
        }
    ];
    const MigrationCheckCell = (param)=>{
        let { result } = param;
        _s2();
        const [showTooltip, setShowTooltip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
        const [tooltipPosition, setTooltipPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
            x: 0,
            y: 0
        });
        const iconRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
        const handleMouseEnter = ()=>{
            if (iconRef.current) {
                const rect = iconRef.current.getBoundingClientRect();
                setTooltipPosition({
                    x: rect.left,
                    y: rect.bottom + 8
                });
                setShowTooltip(true);
            }
        };
        const check = result.migrationCheckResult;
        if (!check) return null;
        // Check if already migrated
        if (result.isMigrated) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: iconRef,
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: ()=>setShowTooltip(false),
                        className: "flex items-center justify-center cursor-help",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                            className: "h-5 w-5 text-blue-500"
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 503,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 497,
                        columnNumber: 21
                    }, this),
                    showTooltip && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createPortal(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-[10000] bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]",
                        style: {
                            left: "".concat(tooltipPosition.x, "px"),
                            top: "".concat(tooltipPosition.y, "px")
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -top-1 left-4 w-2 h-2 bg-blue-50 dark:bg-blue-900 border-l border-t border-blue-200 dark:border-blue-700 transform rotate-45"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 513,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-blue-800 dark:text-blue-200",
                                children: "Already Migrated"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 514,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 506,
                        columnNumber: 25
                    }, this), document.body)
                ]
            }, void 0, true);
        }
        const allChecksPass = check.policyExists && check.policyIsUnique && check.groupExists && check.correctAssignmentTypeProvided && check.correctAssignmentActionProvided && check.assignmentIsCompatible;
        const hasWarnings = check.filterExist === false || check.filterIsUnique === false || check.correctFilterPlatform === false || check.correctFilterTypeProvided === false;
        const errors = [];
        const warnings = [];
        const compatibilityErrors = [];
        if (!check.policyExists) errors.push("Policy not found");
        if (!check.policyIsUnique) errors.push("Multiple policies found");
        if (!check.groupExists) errors.push("Group not found");
        if (!check.correctAssignmentTypeProvided) errors.push("Invalid assignment type");
        if (!check.correctAssignmentActionProvided) errors.push("Invalid assignment action");
        if (check.filterExist === false) warnings.push("Filter not found");
        if (check.filterIsUnique === false) warnings.push("Multiple filters found");
        if (check.correctFilterPlatform === false) warnings.push("Incorrect filter platform");
        if (check.correctFilterTypeProvided === false) warnings.push("Invalid filter type");
        // Add compatibility errors
        if (check.assignmentIsCompatible === false && check.compatibilityErrors && check.compatibilityErrors.length > 0) {
            compatibilityErrors.push(...check.compatibilityErrors);
        }
        // IMPORTANT: If there are compatibility errors, always show red regardless of other checks
        if (compatibilityErrors.length > 0 || !allChecksPass) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: iconRef,
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: ()=>setShowTooltip(false),
                        className: "flex items-center justify-center cursor-help",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "h-5 w-5 text-red-500"
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 559,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 553,
                        columnNumber: 21
                    }, this),
                    showTooltip && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createPortal(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-[10000] bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]",
                        style: {
                            left: "".concat(tooltipPosition.x, "px"),
                            top: "".concat(tooltipPosition.y, "px")
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -top-1 left-4 w-2 h-2 bg-red-50 dark:bg-red-900 border-l border-t border-red-200 dark:border-red-700 transform rotate-45"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 569,
                                columnNumber: 29
                            }, this),
                            errors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold text-red-800 dark:text-red-200 mb-2",
                                        children: "Migration Check Errors:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 572,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "text-xs text-red-700 dark:text-red-300 space-y-1 mb-3",
                                        children: errors.map((error, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "leading-relaxed",
                                                children: [
                                                    "• ",
                                                    error
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 575,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 573,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true),
                            compatibilityErrors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold text-red-800 dark:text-red-200 mb-2",
                                        children: "Compatibility Issues:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 582,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "text-xs text-red-700 dark:text-red-300 space-y-1",
                                        children: compatibilityErrors.map((error, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "leading-relaxed",
                                                children: [
                                                    "• ",
                                                    error
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 585,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 583,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 562,
                        columnNumber: 25
                    }, this), document.body)
                ]
            }, void 0, true);
        }
        // Show yellow warning if all checks pass but there are warnings
        if (allChecksPass && hasWarnings) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: iconRef,
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: ()=>setShowTooltip(false),
                        className: "flex items-center justify-center cursor-help",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "h-5 w-5 text-yellow-500"
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 607,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 601,
                        columnNumber: 21
                    }, this),
                    showTooltip && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createPortal(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-[10000] bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]",
                        style: {
                            left: "".concat(tooltipPosition.x, "px"),
                            top: "".concat(tooltipPosition.y, "px")
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -top-1 left-4 w-2 h-2 bg-yellow-50 dark:bg-yellow-900 border-l border-t border-yellow-200 dark:border-yellow-700 transform rotate-45"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 617,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2",
                                children: "Filter Warnings:"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 618,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: "text-xs text-yellow-700 dark:text-yellow-300 space-y-1",
                                children: warnings.map((warning, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "leading-relaxed",
                                        children: [
                                            "• ",
                                            warning
                                        ]
                                    }, idx, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 621,
                                        columnNumber: 37
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 619,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 610,
                        columnNumber: 25
                    }, this), document.body)
                ]
            }, void 0, true);
        }
        // Show green checkmark only if all checks pass and no warnings
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-5 w-5 text-green-500"
            }, void 0, false, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 634,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/deployment/assignments/page.tsx",
            lineNumber: 633,
            columnNumber: 13
        }, this);
    };
    _s2(MigrationCheckCell, "mfu+pwfLpkIsokl6AxMPXj9HEIw=");
    const comparisonColumns = [
        {
            key: '_select',
            label: '',
            width: 10,
            render: (_, row)=>{
                const result = row;
                const isSelected = selectedRows.includes(result.id);
                const isDisabled = !result.isReadyForMigration || result.isMigrated;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    onClick: (e)=>e.stopPropagation(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "checkbox",
                        disabled: isDisabled,
                        checked: isSelected,
                        onChange: (e)=>{
                            e.stopPropagation();
                            const newChecked = e.target.checked;
                            console.log('Before update:', {
                                resultId: result.id,
                                newChecked,
                                currentSelectedRows: selectedRows
                            });
                            setSelectedRows((prev)=>{
                                const updated = newChecked ? prev.includes(result.id) ? prev : [
                                    ...prev,
                                    result.id
                                ] : prev.filter((id)=>id !== result.id);
                                console.log('After update:', updated);
                                return updated;
                            });
                        },
                        className: isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 651,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 650,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'migrationCheckSortValue',
            label: 'Status',
            width: 25,
            sortable: true,
            sortValue: (row)=>{
                const result = row;
                const check = result.migrationCheckResult;
                if (!check) return 2;
                const allChecksPass = check.policyExists && check.policyIsUnique && check.groupExists && check.correctAssignmentTypeProvided && check.correctAssignmentActionProvided && check.assignmentIsCompatible;
                return allChecksPass ? 1 : 0;
            },
            render: (_, row)=>{
                const result = row;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MigrationCheckCell, {
                    result: result
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 697,
                    columnNumber: 24
                }, this);
            }
        },
        {
            key: 'providedPolicyName',
            label: 'Policy Name',
            minWidth: 250,
            render: (_, row)=>{
                var _result_policies;
                const result = row;
                const hasDuplicates = result.policies && result.policies.length > 1;
                const isExpanded = expandedRows.includes(result.id);
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                return displayPolicy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        hasDuplicates && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>toggleExpanded(result.id),
                            className: "text-blue-500 hover:text-blue-700",
                            children: isExpanded ? '▼' : '▶'
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 713,
                            columnNumber: 29
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-medium cursor-pointer truncate block w-full text-left",
                                            title: displayPolicy.name || 'Unknown Policy',
                                            children: displayPolicy.name || 'Unknown Policy'
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 722,
                                            columnNumber: 33
                                        }, this),
                                        hasDuplicates && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            variant: "secondary",
                                            className: "text-xs",
                                            children: [
                                                ((_result_policies = result.policies) === null || _result_policies === void 0 ? void 0 : _result_policies.length) || 0,
                                                " duplicates"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 726,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 721,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs text-gray-500",
                                    children: [
                                        displayPolicy.policyType || 'Unknown Type',
                                        " • ",
                                        displayPolicy.platform || 'Unknown Platform'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 731,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 720,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 711,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-red-600 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                            className: "h-4 w-4 inline mr-1"
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 738,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-medium cursor-pointer truncate block w-full text-left",
                                    children: result.providedPolicyName || 'Unknown policy name'
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 740,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs text-red-500",
                                    children: "Policy not found"
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 741,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 739,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 737,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'assignedGroups',
            label: 'Current Assignments',
            width: 150,
            render: (_, row)=>{
                var _displayPolicy_assignments;
                const result = row;
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                return displayPolicy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: "outline",
                    className: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                    onClick: (e)=>{
                        e.stopPropagation();
                        handleAssignmentsClick(result);
                    },
                    children: [
                        ((_displayPolicy_assignments = displayPolicy.assignments) === null || _displayPolicy_assignments === void 0 ? void 0 : _displayPolicy_assignments.length) || 0,
                        " groups"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 755,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: "destructive",
                    children: "N/A"
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 766,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'groupToMigrate',
            label: 'Target Group',
            minWidth: 150,
            render: (_, row)=>{
                var _result_csvRow;
                const result = row;
                return result.groupToMigrate || ((_result_csvRow = result.csvRow) === null || _result_csvRow === void 0 ? void 0 : _result_csvRow.GroupName) || '-';
            }
        },
        {
            key: 'assignmentDirection',
            label: 'Direction',
            width: 100,
            render: (_, row)=>{
                const result = row;
                return result.assignmentDirection ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: result.assignmentDirection === 'Include' ? 'default' : 'destructive',
                    children: result.assignmentDirection
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 786,
                    columnNumber: 21
                }, this) : null;
            }
        },
        {
            key: 'assignmentAction',
            label: 'Action',
            width: 120,
            render: (_, row)=>{
                const result = row;
                return result.assignmentAction ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: result.assignmentAction === 'Add' ? 'default' : result.assignmentAction === 'NoAssignment' ? 'destructive' : 'secondary',
                    children: result.assignmentAction
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 799,
                    columnNumber: 21
                }, this) : null;
            }
        },
        {
            key: 'filterName',
            label: 'Filter Name',
            minWidth: 120,
            render: (_, row)=>{
                var _result_csvRow;
                const result = row;
                return result.filterName || ((_result_csvRow = result.csvRow) === null || _result_csvRow === void 0 ? void 0 : _result_csvRow.FilterName) || '-';
            }
        },
        {
            key: 'filterType',
            label: 'Filter Type',
            minWidth: 120,
            render: (_, row)=>{
                const result = row;
                if (!result.filterType) return null;
                if (result.filterType.toLowerCase() === 'none') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
                        children: result.filterType
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 827,
                        columnNumber: 25
                    }, this);
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: result.filterType === 'Include' ? 'default' : 'destructive',
                    children: result.filterType
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 834,
                    columnNumber: 21
                }, this);
            }
        }
    ];
    const validationColumns = [
        {
            key: 'policyName',
            label: 'Policy Name',
            minWidth: 200,
            render: (_, row)=>{
                const result = row;
                return result.policy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm font-medium cursor-pointer truncate block w-full text-left",
                    title: result.policy.name,
                    children: result.policy.name
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 850,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-red-600",
                    children: "Policy not found"
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 854,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'groupName',
            label: 'Group',
            minWidth: 150,
            render: (_, row)=>{
                var _result_csvRow, _result_csvRow1, _result_csvRow2;
                const result = row;
                return ((_result_csvRow = result.csvRow) === null || _result_csvRow === void 0 ? void 0 : _result_csvRow.GroupName) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm font-medium cursor-pointer truncate block w-full text-left",
                    title: (_result_csvRow1 = result.csvRow) === null || _result_csvRow1 === void 0 ? void 0 : _result_csvRow1.GroupName,
                    children: (_result_csvRow2 = result.csvRow) === null || _result_csvRow2 === void 0 ? void 0 : _result_csvRow2.GroupName
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 865,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-red-600",
                    children: "-"
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 869,
                    columnNumber: 21
                }, this);
            }
        },
        {
            key: 'assignmentAction',
            label: 'Action',
            width: 120,
            render: (_, row)=>{
                var _result_csvRow;
                const result = row;
                return ((_result_csvRow = result.csvRow) === null || _result_csvRow === void 0 ? void 0 : _result_csvRow.AssignmentAction) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    variant: result.csvRow.AssignmentAction === 'Add' ? 'default' : 'secondary',
                    children: result.csvRow.AssignmentAction
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 880,
                    columnNumber: 21
                }, this) : null;
            }
        },
        {
            key: 'validationStatus',
            label: 'Validation Status',
            minWidth: 150,
            render: (_, row)=>{
                const result = row;
                if (result.validationStatus === 'valid') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "default",
                        className: "bg-green-100 text-green-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                className: "h-3 w-3 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 896,
                                columnNumber: 29
                            }, this),
                            "Valid"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 895,
                        columnNumber: 25
                    }, this);
                }
                if (result.validationStatus === 'invalid') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "destructive",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "h-3 w-3 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 904,
                                columnNumber: 29
                            }, this),
                            "Invalid"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 903,
                        columnNumber: 25
                    }, this);
                }
                if (result.validationStatus === 'warning') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "secondary",
                        className: "bg-yellow-100 text-yellow-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "h-3 w-3 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 912,
                                columnNumber: 29
                            }, this),
                            "Warning"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 911,
                        columnNumber: 25
                    }, this);
                }
                if (result.validationStatus === 'pending') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        children: "Pending"
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 918,
                        columnNumber: 28
                    }, this);
                }
                return null;
            }
        },
        {
            key: 'validationMessage',
            label: 'Message',
            minWidth: 200,
            render: (_, row)=>{
                const result = row;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-sm font-medium cursor-pointer truncate block w-full text-left",
                    children: result.validationMessage || '-'
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 930,
                    columnNumber: 21
                }, this);
            }
        }
    ];
    // Drag and drop
    const [isDragOver, setIsDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Add these drag and drop handlers
    const handleDragOver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentRolloutContent.useCallback[handleDragOver]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
        }
    }["AssignmentRolloutContent.useCallback[handleDragOver]"], []);
    const handleDragLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentRolloutContent.useCallback[handleDragLeave]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
        }
    }["AssignmentRolloutContent.useCallback[handleDragLeave]"], []);
    const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentRolloutContent.useCallback[handleDrop]": (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                    const reader = new FileReader();
                    reader.onload = ({
                        "AssignmentRolloutContent.useCallback[handleDrop]": (e)=>{
                            try {
                                var _e_target;
                                const content = (_e_target = e.target) === null || _e_target === void 0 ? void 0 : _e_target.result;
                                const parsed = parseCSV(content);
                                setCsvData(parsed);
                                setError(null);
                            } catch (err) {
                                setError('Failed to parse CSV file. Please check the format.');
                            }
                        }
                    })["AssignmentRolloutContent.useCallback[handleDrop]"];
                    reader.readAsText(file);
                } else {
                    setError('Please drop a CSV file.');
                }
            }
        }
    }["AssignmentRolloutContent.useCallback[handleDrop]"], []);
    const [lastClickedIndex, setLastClickedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleRowClick = (row, index, event)=>{
        const result = row;
        const isDisabled = !result.isReadyForMigration || result.isMigrated;
        if (isDisabled) return;
        // Handle shift-click for range selection/deselection
        if ((event === null || event === void 0 ? void 0 : event.shiftKey) && lastClickedIndex !== null) {
            const currentIndex = index;
            const start = Math.min(lastClickedIndex, currentIndex);
            const end = Math.max(lastClickedIndex, currentIndex);
            const rowsInRange = comparisonResults.slice(start, end + 1).filter((r)=>r.isReadyForMigration && !r.isMigrated).map((r)=>r.id);
            // Check if all rows in range are already selected
            const allSelected = rowsInRange.every((id)=>selectedRows.includes(id));
            setSelectedRows((prev)=>{
                if (allSelected) {
                    // Deselect all rows in range
                    return prev.filter((id)=>!rowsInRange.includes(id));
                } else {
                    // Select all rows in range
                    const newSelection = [
                        ...prev
                    ];
                    rowsInRange.forEach((id)=>{
                        if (!newSelection.includes(id)) {
                            newSelection.push(id);
                        }
                    });
                    return newSelection;
                }
            });
        } else {
            // Normal click - toggle single row selection
            setSelectedRows((prev)=>prev.includes(result.id) ? prev.filter((id)=>id !== result.id) : [
                    ...prev,
                    result.id
                ]);
        }
        setLastClickedIndex(index);
    };
    const toggleExpanded = (resultId)=>{
        setExpandedRows((prev)=>prev.includes(resultId) ? prev.filter((id)=>id !== resultId) : [
                ...prev,
                resultId
            ]);
    };
    // CSV File Processing
    const parseCSV = (content)=>{
        const lines = content.split('\n').filter((line)=>line.trim());
        const headers = lines[0].split(';').map((h)=>h.trim());
        return lines.slice(1).map((line, index)=>{
            var _values_, _values_1, _values_2, _values_3;
            const values = line.split(';');
            const validationErrors = [];
            const nullIfEmpty = (value)=>(value === null || value === void 0 ? void 0 : value.trim()) === '' ? null : (value === null || value === void 0 ? void 0 : value.trim()) || null;
            const getAssignmentDirection = (value)=>{
                const normalized = value === null || value === void 0 ? void 0 : value.trim().toLowerCase();
                return normalized === 'exclude' ? 'Exclude' : 'Include';
            };
            const getAssignmentAction = (value)=>{
                const normalized = value === null || value === void 0 ? void 0 : value.trim().toLowerCase();
                if (normalized === 'add') return {
                    action: 'Add',
                    isValid: true
                };
                if (normalized === 'replace') return {
                    action: 'Replace',
                    isValid: true
                };
                if (normalized === 'remove') return {
                    action: 'Remove',
                    isValid: true
                };
                if (normalized === 'noassignment') return {
                    action: 'NoAssignment',
                    isValid: true
                };
                if (!value || value.trim() === '') {
                    return {
                        action: 'Add',
                        isValid: true
                    };
                }
                return {
                    action: 'Add',
                    isValid: false,
                    originalValue: value === null || value === void 0 ? void 0 : value.trim()
                };
            };
            // Validate required fields
            const policyName = ((_values_ = values[0]) === null || _values_ === void 0 ? void 0 : _values_.trim()) || '';
            const groupName = ((_values_1 = values[1]) === null || _values_1 === void 0 ? void 0 : _values_1.trim()) || '';
            const assignmentDirection = ((_values_2 = values[2]) === null || _values_2 === void 0 ? void 0 : _values_2.trim()) || '';
            const assignmentAction = ((_values_3 = values[3]) === null || _values_3 === void 0 ? void 0 : _values_3.trim()) || '';
            // Get action result first to determine if other fields are needed
            const actionResult = getAssignmentAction(assignmentAction);
            // Check PolicyName (always required)
            if (!policyName) {
                validationErrors.push({
                    rowIndex: index + 2,
                    field: 'PolicyName',
                    message: 'Policy Name is required'
                });
            }
            // Only validate GroupName and AssignmentDirection if action is not 'NoAssignment'
            if (actionResult.action !== 'NoAssignment') {
                // Check GroupName
                if (!groupName) {
                    validationErrors.push({
                        rowIndex: index + 2,
                        field: 'GroupName',
                        message: 'Group Name is required for Add/Remove actions. You can also use All Users or All Devices.'
                    });
                }
                // Check AssignmentDirection
                if (!assignmentDirection) {
                    validationErrors.push({
                        rowIndex: index + 2,
                        field: 'AssignmentDirection',
                        message: 'Assignment Direction is required for Add/Remove actions'
                    });
                }
            }
            // Check AssignmentAction validity
            if (!assignmentAction) {
                validationErrors.push({
                    rowIndex: index + 2,
                    field: 'AssignmentAction',
                    message: 'Assignment Action is required'
                });
            } else if (!actionResult.isValid) {
                validationErrors.push({
                    rowIndex: index + 2,
                    field: 'AssignmentAction',
                    message: 'Invalid Assignment Action: "'.concat(actionResult.originalValue, '". Must be Add, Remove, Replace, or NoAssignment')
                });
            }
            return {
                PolicyName: policyName,
                GroupName: groupName,
                AssignmentDirection: getAssignmentDirection(assignmentDirection),
                AssignmentAction: actionResult.action,
                FilterName: nullIfEmpty(values[4]),
                FilterType: nullIfEmpty(values[5]),
                isValidAction: actionResult.isValid,
                originalActionValue: actionResult.originalValue,
                validationErrors,
                isValid: validationErrors.length === 0,
                validationStatusSort: validationErrors.length === 0 ? 1 : 0
            };
        });
    };
    // Backup rows
    const downloadBackups = async ()=>{
        const readyForMigration = comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated);
        if (readyForMigration.length === 0) {
            alert('No policies ready for migration to backup');
            return;
        }
        setLoading(true);
        try {
            var _accounts_, _accounts_1, _accounts_2, _accounts_3, _accounts_4;
            const JSZip = (await __turbopack_context__.A("[project]/node_modules/jszip/lib/index.js [app-client] (ecmascript, async loader)")).default;
            const zip = new JSZip();
            const backupResults = {};
            const tenantId = ((_accounts_ = accounts[0]) === null || _accounts_ === void 0 ? void 0 : _accounts_.tenantId) || 'unknown-tenant';
            const loggedInUser = ((_accounts_1 = accounts[0]) === null || _accounts_1 === void 0 ? void 0 : _accounts_1.username) || ((_accounts_2 = accounts[0]) === null || _accounts_2 === void 0 ? void 0 : _accounts_2.name) || 'unknown-user';
            const backupTimestamp = new Date().toISOString();
            for (const policy of readyForMigration){
                try {
                    const response = await instance.acquireTokenSilent({
                        scopes: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$msalConfig$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiScope"]
                        ],
                        account: accounts[0]
                    });
                    const apiResponse = await fetch("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EXPORT_ENDPOINT"], "/").concat(policy.policy.policyType, "/").concat(policy.policy.id), {
                        headers: {
                            'Authorization': "Bearer ".concat(response.accessToken),
                            'Content-Type': 'application/json'
                        }
                    });
                    if (apiResponse.ok) {
                        const backupData = await apiResponse.json();
                        const folderPath = "".concat(policy.policy.policyType, "/").concat(policy.policy.name, "_").concat(policy.policy.id, ".json");
                        zip.file(folderPath, JSON.stringify(backupData, null, 2));
                        backupResults[policy.id] = true;
                    } else {
                        console.error("Failed to backup policy ".concat(policy.policy.id));
                        backupResults[policy.id] = false;
                    }
                } catch (error) {
                    console.error("Failed to backup policy ".concat(policy.policy.id, ":"), error);
                    backupResults[policy.id] = false;
                }
            }
            // Create metadata
            const metadata = {
                backupInfo: {
                    createdAt: backupTimestamp,
                    createdBy: loggedInUser,
                    tenantId: tenantId,
                    backupType: 'policy_assignments',
                    version: '1.0'
                },
                tenantInfo: {
                    tenantId: tenantId,
                    userPrincipalName: ((_accounts_3 = accounts[0]) === null || _accounts_3 === void 0 ? void 0 : _accounts_3.username) || 'unknown',
                    displayName: ((_accounts_4 = accounts[0]) === null || _accounts_4 === void 0 ? void 0 : _accounts_4.name) || 'unknown'
                },
                statistics: {
                    totalPoliciesRequested: readyForMigration.length,
                    totalPoliciesBackedUp: Object.values(backupResults).filter((success)=>success).length,
                    totalPoliciesFailed: Object.values(backupResults).filter((success)=>!success).length,
                    policyTypeBreakdown: readyForMigration.reduce((acc, policy)=>{
                        const type = policy.policy.policyType;
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {})
                },
                policies: readyForMigration.map((policy)=>({
                        id: policy.policy.id,
                        name: policy.policy.name,
                        type: policy.policy.policyType,
                        platform: policy.policy.platform,
                        backupSuccessful: backupResults[policy.id] === true,
                        assignmentAction: policy.assignmentAction,
                        targetGroup: policy.groupToMigrate
                    }))
            };
            // Add metadata file to root of ZIP
            console.log('Adding metadata to ZIP:', metadata);
            zip.file('backup_metadata.json', JSON.stringify(metadata, null, 2));
            console.log('ZIP contents after adding metadata:', Object.keys(zip.files));
            setComparisonResults((prev)=>prev.map((result)=>({
                        ...result,
                        isBackedUp: backupResults[result.id] === true
                    })));
            const content = await zip.generateAsync({
                type: 'blob'
            });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = "policy_backups_".concat(tenantId, "_").concat(new Date().toISOString().split('T')[0], ".zip");
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            const successCount = Object.values(backupResults).filter((success)=>success).length;
            const totalCount = Object.keys(backupResults).length;
            alert("Backup completed: ".concat(successCount, "/").concat(totalCount, " policies backed up successfully"));
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Backup failed. Please try again.');
        } finally{
            setLoading(false);
        }
    };
    const handleFileUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AssignmentRolloutContent.useCallback[handleFileUpload]": (event)=>{
            var _event_target_files;
            const file = (_event_target_files = event.target.files) === null || _event_target_files === void 0 ? void 0 : _event_target_files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ({
                "AssignmentRolloutContent.useCallback[handleFileUpload]": (e)=>{
                    try {
                        var _e_target;
                        const content = (_e_target = e.target) === null || _e_target === void 0 ? void 0 : _e_target.result;
                        const parsed = parseCSV(content);
                        setCsvData(parsed);
                        setError(null);
                    } catch (err) {
                        setError('Failed to parse CSV file. Please check the format.');
                    }
                }
            })["AssignmentRolloutContent.useCallback[handleFileUpload]"];
            reader.readAsText(file);
        }
    }["AssignmentRolloutContent.useCallback[handleFileUpload]"], []);
    // API Calls
    const compareAssignments = async ()=>{
        if (!accounts.length || !csvData.length) return;
        // Filter out invalid rows before sending to API
        const validCsvData = csvData.filter((row)=>row.isValid);
        const invalidRowCount = csvData.length - validCsvData.length;
        if (invalidRowCount > 0) {
            console.log("Excluding ".concat(invalidRowCount, " invalid rows from comparison"));
        }
        if (validCsvData.length === 0) {
            setError('No valid rows found in CSV. Please correct the validation errors and re-upload.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // The UserConsentRequiredError will be caught and handled by the useApiRequest hook
            // which will automatically call showConsent with the consentUrl
            const apiResponse = await request(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_COMPARE_ENDPOINT"], {
                method: 'POST',
                body: JSON.stringify(validCsvData)
            });
            if (!(apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.data) || !Array.isArray(apiResponse.data)) {
                setError('Invalid data format received from server');
                setLoading(false);
                return;
            }
            const enhancedResults = apiResponse.data.map((item, index)=>{
                const check = item.migrationCheckResult;
                let migrationCheckSortValue = 2; // default for no check data
                if (check) {
                    const allChecksPass = check.policyExists && check.policyIsUnique && check.groupExists && check.correctAssignmentTypeProvided && check.correctAssignmentActionProvided;
                    migrationCheckSortValue = allChecksPass ? 1 : 0;
                }
                return {
                    ...item,
                    csvRow: {
                        ...validCsvData[index]
                    },
                    isReadyForMigration: item.isReadyForMigration,
                    isMigrated: item.isMigrated || false,
                    isBackedUp: false,
                    validationStatus: 'pending',
                    migrationCheckSortValue
                };
            });
            setComparisonResults(enhancedResults);
            setCurrentStep('migrate');
        } catch (error) {
            // Don't set an error if it was a consent error (already handled)
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserConsentRequiredError"])) {
                setError(error instanceof Error ? error.message : 'Failed to compare assignments');
            }
        } finally{
            setLoading(false);
        }
    };
    const handleMigrationSuccess = ()=>{
        setMigrationSuccessful(true);
        // Reset after clearing error
        setTimeout(()=>setMigrationSuccessful(false), 100);
    };
    const migrateSelectedAssignments = async ()=>{
        if (!accounts.length || !selectedRows.length) return;
        setLoading(true);
        setMigrationProgress(0);
        try {
            var _apiResponse_message;
            // Get the selected comparison results first
            const selectedComparisonResults = comparisonResults.filter((result)=>selectedRows.includes(result.id));
            // Create the API payload with the correct structure
            const migrationPayload = selectedComparisonResults.map((result)=>{
                var _result_policy, _result_policy1, _result_policy2, _result_csvRow, _result_csvRow1, _result_csvRow2, _result_csvRow3, _result_csvRow4;
                return {
                    PolicyId: ((_result_policy = result.policy) === null || _result_policy === void 0 ? void 0 : _result_policy.id) || '',
                    PolicyName: ((_result_policy1 = result.policy) === null || _result_policy1 === void 0 ? void 0 : _result_policy1.name) || result.providedPolicyName || '',
                    PolicyType: ((_result_policy2 = result.policy) === null || _result_policy2 === void 0 ? void 0 : _result_policy2.policyType) || '',
                    AssignmentResourceName: ((_result_csvRow = result.csvRow) === null || _result_csvRow === void 0 ? void 0 : _result_csvRow.GroupName) || result.groupToMigrate || '',
                    AssignmentDirection: ((_result_csvRow1 = result.csvRow) === null || _result_csvRow1 === void 0 ? void 0 : _result_csvRow1.AssignmentDirection) || result.assignmentDirection || 'Include',
                    AssignmentAction: ((_result_csvRow2 = result.csvRow) === null || _result_csvRow2 === void 0 ? void 0 : _result_csvRow2.AssignmentAction) || result.assignmentAction || 'Add',
                    FilterName: ((_result_csvRow3 = result.csvRow) === null || _result_csvRow3 === void 0 ? void 0 : _result_csvRow3.FilterName) || result.filterName || null,
                    FilterType: ((_result_csvRow4 = result.csvRow) === null || _result_csvRow4 === void 0 ? void 0 : _result_csvRow4.FilterType) || result.filterType || 'none'
                };
            });
            const apiResponse = await request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_ENDPOINT"], "/migrate"), {
                method: 'POST',
                body: JSON.stringify(migrationPayload)
            });
            // Add null check for apiResponse
            if (!apiResponse) {
                setError('Failed to get response from server');
                return;
            }
            // Check if this is an error response
            if (apiResponse.status === 'Error' && ((_apiResponse_message = apiResponse.message) === null || _apiResponse_message === void 0 ? void 0 : _apiResponse_message.message) === 'User challenge required') {
                setConsentUrl(apiResponse.message.url || '');
                setShowConsentDialog(true);
                setLoading(false);
                return;
            }
            // Add null check for apiResponse.data
            if (!apiResponse.data) {
                setError('No data received from server');
                return;
            }
            if (!Array.isArray(apiResponse.data)) {
                setError('Invalid data format received from server');
                return;
            }
            // Simulate migration progress
            for(let i = 0; i <= 100; i += 10){
                setMigrationProgress(i);
                await new Promise((resolve)=>setTimeout(resolve, 200));
            }
            // Update migrated status
            setComparisonResults((prev)=>prev.map((result)=>selectedRows.includes(result.id) ? {
                        ...result,
                        isMigrated: true
                    } : result));
            // Move to validation step
            setCurrentStep('validate');
            // Clear selected rows to prevent confusion
            setSelectedRows([]);
            // Validate only the items that were just migrated
            setTimeout(()=>{
                validateMigratedAssignments(selectedComparisonResults);
            }, 500);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Migration failed');
        } finally{
            setLoading(false);
        }
    };
    const validateMigratedAssignments = async (results)=>{
        if (!accounts.length) return;
        // If no specific results are passed, don't validate anything
        if (!results || results.length === 0) {
            setError('No specific assignments provided for validation');
            return;
        }
        setLoading(true);
        setValidationComplete(false);
        try {
            var _validationData_message, _validationData_data;
            console.log("Validating ".concat(results.length, " specific assignments"));
            const validationPayload = results.map((result)=>{
                var _result_policy, _result_policy1, _result_policy2, _result_csvRow, _result_csvRow1, _result_filterToMigrate, _result_csvRow2;
                return {
                    Id: result.id,
                    ResourceType: ((_result_policy = result.policy) === null || _result_policy === void 0 ? void 0 : _result_policy.policyType) || '',
                    SubResourceType: ((_result_policy1 = result.policy) === null || _result_policy1 === void 0 ? void 0 : _result_policy1.policySubType) || '',
                    ResourceId: ((_result_policy2 = result.policy) === null || _result_policy2 === void 0 ? void 0 : _result_policy2.id) || result.id,
                    AssignmentId: result.assignmentId,
                    AssignmentType: result.assignmentType,
                    AssignmentDirection: (_result_csvRow = result.csvRow) === null || _result_csvRow === void 0 ? void 0 : _result_csvRow.AssignmentDirection,
                    AssignmentAction: ((_result_csvRow1 = result.csvRow) === null || _result_csvRow1 === void 0 ? void 0 : _result_csvRow1.AssignmentAction) || '',
                    FilterId: ((_result_filterToMigrate = result.filterToMigrate) === null || _result_filterToMigrate === void 0 ? void 0 : _result_filterToMigrate.id) && result.filterToMigrate.id !== "00000000-0000-0000-0000-000000000000" ? result.filterToMigrate.id : null,
                    FilterType: ((_result_csvRow2 = result.csvRow) === null || _result_csvRow2 === void 0 ? void 0 : _result_csvRow2.FilterType) || null
                };
            });
            console.log('Validation payload:', validationPayload);
            const validationData = await request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ASSIGNMENTS_ENDPOINT"], "/validate"), {
                method: 'POST',
                body: JSON.stringify(validationPayload)
            });
            if (!validationData) {
                setError('Failed to get response from server');
                return;
            }
            if (validationData.status === 'Error' && ((_validationData_message = validationData.message) === null || _validationData_message === void 0 ? void 0 : _validationData_message.message) === 'Additional permissions required') {
                setConsentUrl(validationData.message.url || '');
                setShowConsentDialog(true);
                setLoading(false);
                return;
            }
            if (!validationData.data || !Array.isArray(validationData.data)) {
                setError('Invalid data format received from server');
                return;
            }
            setValidationResults(validationData.data);
            // Only update the specific results that were validated
            setComparisonResults((prev)=>prev.map((result)=>{
                    const validation = validationData.data.find((v)=>v.id === result.id);
                    if (validation) {
                        var _validation_message, _validation_message1;
                        return {
                            ...result,
                            validationStatus: validation.hasCorrectAssignment ? 'valid' : 'invalid',
                            validationMessage: ((_validation_message = validation.message) === null || _validation_message === void 0 ? void 0 : _validation_message.reason) || ((_validation_message1 = validation.message) === null || _validation_message1 === void 0 ? void 0 : _validation_message1.status) || '',
                            isCurrentSessionValidation: true // Mark as current session
                        };
                    }
                    return result;
                }));
            setValidationComplete(true);
            console.log("Validation completed for ".concat(((_validationData_data = validationData.data) === null || _validationData_data === void 0 ? void 0 : _validationData_data.length) || 0, " items"));
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Validation failed');
            console.error('Validation error:', error);
        } finally{
            setLoading(false);
        }
    };
    const fetchAssignmentGroupDetails = async (groupId)=>{
        if (assignmentGroups[groupId] || loadingAssignmentGroups.includes(groupId)) {
            return;
        }
        setLoadingAssignmentGroups((prev)=>[
                ...prev,
                groupId
            ]);
        try {
            const response = await request("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GROUPS_ENDPOINT"], "/").concat(groupId), {
                method: 'GET'
            });
            if (response === null || response === void 0 ? void 0 : response.data) {
                setAssignmentGroups((prev)=>({
                        ...prev,
                        [groupId]: response.data
                    }));
            }
        } catch (error) {
            console.error("Failed to fetch group details for ".concat(groupId, ":"), error);
            setAssignmentGroups((prev)=>({
                    ...prev,
                    [groupId]: {
                        error: 'Failed to load group details'
                    }
                }));
        } finally{
            setLoadingAssignmentGroups((prev)=>prev.filter((id)=>id !== groupId));
        }
    };
    const handleAssignmentsClick = async (result)=>{
        const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
        if (!(displayPolicy === null || displayPolicy === void 0 ? void 0 : displayPolicy.assignments)) return;
        setSelectedAssignments(displayPolicy.assignments);
        setShowAssignmentsDialog(true);
        // Fetch group details for all group assignments
        for (const assignment of displayPolicy.assignments){
            var _assignment_target, _assignment_target_odatatype;
            if (((_assignment_target = assignment.target) === null || _assignment_target === void 0 ? void 0 : _assignment_target.groupId) && ((_assignment_target_odatatype = assignment.target['@odata.type']) === null || _assignment_target_odatatype === void 0 ? void 0 : _assignment_target_odatatype.includes('groupAssignmentTarget'))) {
                await fetchAssignmentGroupDetails(assignment.target.groupId);
            }
        }
    };
    const validateAssignments = async ()=>{
        // Only validate items that were just migrated in this session
        const recentlyMigrated = comparisonResults.filter((result)=>result.isMigrated && result.validationStatus === 'pending');
        if (recentlyMigrated.length === 0) {
            setError('No recently migrated assignments to validate');
            return;
        }
        await validateMigratedAssignments(recentlyMigrated);
    };
    const resetProcess = ()=>{
        setCurrentStep('upload');
        setCsvData([]);
        setComparisonResults([]);
        setSelectedRows([]);
        setMigrationProgress(0);
        setValidationResults([]);
        setValidationComplete(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const { selectedGroup, groupLoading, groupError, isDialogOpen, fetchGroupDetails, closeDialog } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useGroupDetails$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupDetails"])();
    // Update the handleResourceClick function to handle GroupAssignment:
    const handleResourceClick = (resourceId, assignmentType)=>{
        if (assignmentType === 'GroupAssignment' && resourceId) {
            fetchGroupDetails(resourceId);
        } else if ((assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude') && resourceId) {
            fetchGroupDetails(resourceId);
        }
    };
    const AssignmentsDialog = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
            open: showAssignmentsDialog,
            onOpenChange: setShowAssignmentsDialog,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                className: "max-w-4xl max-h-[80vh] overflow-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                    className: "h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1638,
                                    columnNumber: 25
                                }, this),
                                "Current Assignments (",
                                selectedAssignments.length,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 1637,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1636,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: selectedAssignments.map((assignment)=>{
                            var _assignment_target_odatatype, _assignment_target, _assignment_target_odatatype1, _assignment_target1, _assignment_target2, _assignment_target3, _assignment_target4;
                            const isGroupAssignment = (_assignment_target = assignment.target) === null || _assignment_target === void 0 ? void 0 : (_assignment_target_odatatype = _assignment_target['@odata.type']) === null || _assignment_target_odatatype === void 0 ? void 0 : _assignment_target_odatatype.includes('groupAssignmentTarget');
                            const isExcludeAssignment = (_assignment_target1 = assignment.target) === null || _assignment_target1 === void 0 ? void 0 : (_assignment_target_odatatype1 = _assignment_target1['@odata.type']) === null || _assignment_target_odatatype1 === void 0 ? void 0 : _assignment_target_odatatype1.includes('exclusionGroupAssignmentTarget');
                            const groupId = (_assignment_target2 = assignment.target) === null || _assignment_target2 === void 0 ? void 0 : _assignment_target2.groupId;
                            const groupData = groupId ? assignmentGroups[groupId] : null;
                            const isLoading = groupId ? loadingAssignmentGroups.includes(groupId) : false;
                            // Determine assignment direction
                            const assignmentDirection = isExcludeAssignment ? 'Exclude' : 'Include';
                            const directionColor = isExcludeAssignment ? 'destructive' : 'default';
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border rounded-lg p-4 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                        className: "h-4 w-4 text-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1659,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium",
                                                        children: isGroupAssignment ? 'Group Assignment' : 'All Users/Devices'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1660,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        variant: directionColor,
                                                        className: "text-xs",
                                                        children: assignmentDirection
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1663,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1658,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: ((_assignment_target3 = assignment.target) === null || _assignment_target3 === void 0 ? void 0 : _assignment_target3.deviceAndAppManagementAssignmentFilterType) !== 'None' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "outline",
                                                    className: "text-xs",
                                                    children: "Filtered"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1669,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1667,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1657,
                                        columnNumber: 33
                                    }, this),
                                    isGroupAssignment && groupId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-3",
                                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                    className: "h-4 w-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1680,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm",
                                                    children: "Loading group details..."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1681,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1679,
                                            columnNumber: 45
                                        }, this) : (groupData === null || groupData === void 0 ? void 0 : groupData.error) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-red-500",
                                            children: "Failed to load group details"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1684,
                                            columnNumber: 45
                                        }, this) : groupData ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-medium text-sm flex items-center gap-1",
                                                            children: [
                                                                groupData.displayName,
                                                                groupData.membershipRule && groupData.membershipRule.trim() !== '' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$blocks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Blocks$3e$__["Blocks"], {
                                                                    className: "h-3 w-3 text-purple-500 flex-shrink-0"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1693,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1690,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            onClick: ()=>{
                                                                setShowAssignmentsDialog(false);
                                                                fetchGroupDetails(groupId);
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                    className: "h-3 w-3 mr-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1704,
                                                                    columnNumber: 57
                                                                }, this),
                                                                "View Details"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1696,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1689,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-gray-600 dark:text-gray-400",
                                                    children: groupData.description || 'No description available'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1708,
                                                    columnNumber: 49
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-4 text-xs text-gray-500",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "ID: ",
                                                                groupData.id
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1712,
                                                            columnNumber: 53
                                                        }, this),
                                                        groupData.groupCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "Users: ",
                                                                        groupData.groupCount.userCount
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1715,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "Devices: ",
                                                                        groupData.groupCount.deviceCount
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1716,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "Groups: ",
                                                                        groupData.groupCount.groupCount
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1717,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1711,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1688,
                                            columnNumber: 45
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-gray-500",
                                            children: [
                                                "Group ID: ",
                                                groupId
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1723,
                                            columnNumber: 45
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1677,
                                        columnNumber: 37
                                    }, this),
                                    !isGroupAssignment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        className: "h-4 w-4 text-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1733,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-medium",
                                                        children: "All Users and Devices"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1734,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1732,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-600 dark:text-gray-400 mt-1",
                                                children: "This assignment applies to all users and devices in your organization"
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1736,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1731,
                                        columnNumber: 37
                                    }, this),
                                    ((_assignment_target4 = assignment.target) === null || _assignment_target4 === void 0 ? void 0 : _assignment_target4.deviceAndAppManagementAssignmentFilterId) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-gray-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium",
                                                children: "Filter:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1744,
                                                columnNumber: 41
                                            }, this),
                                            " ",
                                            assignment.target.deviceAndAppManagementAssignmentFilterType,
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-2",
                                                children: [
                                                    "ID: ",
                                                    assignment.target.deviceAndAppManagementAssignmentFilterId
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1745,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1743,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, assignment.id, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1656,
                                columnNumber: 29
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1643,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 1635,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/deployment/assignments/page.tsx",
            lineNumber: 1634,
            columnNumber: 9
        }, this);
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
                                children: "Assignments Manager"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1760,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground mt-2",
                                children: "Upload, compare, and migrate policy assignments in bulk using a CSV file."
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1761,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1759,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: resetProcess,
                        variant: "outline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                className: "h-4 w-4 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1766,
                                columnNumber: 21
                            }, this),
                            "Start Over"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1765,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 1758,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-4",
                        children: [
                            {
                                key: 'upload',
                                label: 'Upload CSV',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"]
                            },
                            {
                                key: 'compare',
                                label: 'Compare',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"]
                            },
                            {
                                key: 'migrate',
                                label: 'Migrate',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"]
                            },
                            {
                                key: 'validate',
                                label: 'Validate',
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"]
                            }
                        ].map((step, index)=>{
                            const Icon = step.icon;
                            const isActive = currentStep === step.key;
                            const stepOrder = [
                                'upload',
                                'compare',
                                'migrate',
                                'validate'
                            ];
                            const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.key);
                            // Special case for validate step - show green if validation is complete
                            const isValidateComplete = step.key === 'validate' && validationComplete;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center w-10 h-10 rounded-full border-2 ".concat(isCompleted || isValidateComplete ? 'bg-green-500 border-green-500 text-white' : isActive ? 'bgyellow-500 border-yellow-500 text-white' : 'border-gray-300 text-gray-400'),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1796,
                                            columnNumber: 41
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1791,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 text-sm font-medium ".concat(isActive && !isValidateComplete ? 'text-yellow-600' : isCompleted || isValidateComplete ? 'text-green-600' : 'text-gray-400'),
                                        children: step.label
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1798,
                                        columnNumber: 37
                                    }, this),
                                    index < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                        className: "h-4 w-4 mx-4 text-gray-300"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1805,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, step.key, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1790,
                                columnNumber: 33
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1774,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 1773,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 1772,
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
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1819,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Error:"
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1820,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1821,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 1818,
                            columnNumber: 25
                        }, this),
                        currentStep === 'upload' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600 mt-2",
                                    children: "Error occurred while processing the CSV file. Please check the file format and try again."
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1827,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>setError(null),
                                    className: "mt-4",
                                    variant: "outline",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1835,
                                            columnNumber: 37
                                        }, this),
                                        "Clear Error"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1830,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true),
                        currentStep === 'compare' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600 mt-2",
                                    children: "Error occurred while comparing assignments. Please check your connection and try again."
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1843,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: compareAssignments,
                                    className: "mt-4",
                                    variant: "outline",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1851,
                                            columnNumber: 37
                                        }, this),
                                        "Try Comparison Again"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1846,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true),
                        currentStep === 'migrate' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600 mt-2",
                                    children: "Error occurred during migration. The operation may be partially completed."
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1859,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: migrateSelectedAssignments,
                                    className: "mt-4",
                                    variant: "outline",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1867,
                                            columnNumber: 37
                                        }, this),
                                        "Retry Migration"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1862,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true),
                        currentStep === 'validate' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-gray-600 mt-2",
                                    children: "Error occurred while validating assignments. This doesn't affect your migrations."
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1875,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: validateAssignments,
                                    className: "mt-4",
                                    variant: "outline",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "h-4 w-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1883,
                                            columnNumber: 37
                                        }, this),
                                        "Retry Validation"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 1878,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 1817,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 1816,
                columnNumber: 17
            }, this),
            currentStep === 'upload' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                className: "h-12 w-12 text-yellow-500 mx-auto mb-4"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1897,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                children: "Upload Assignment CSV"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1898,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600",
                                children: "Upload a CSV file containing policy assignments to compare and migrate"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1899,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1896,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-2 border-dashed rounded-lg p-8 text-center transition-colors ".concat(isDragOver ? 'border-yellow-500 bg-blue-50' : 'border-gray-300'),
                                onDragOver: handleDragOver,
                                onDragLeave: handleDragLeave,
                                onDrop: handleDrop,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                        className: "h-8 w-8 mx-auto mb-4 ".concat(isDragOver ? 'text-yellow-500' : 'text-gray-400')
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1914,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-4 ".concat(isDragOver ? 'text-yellow-600' : 'text-gray-600'),
                                        children: isDragOver ? 'Drop your CSV file here' : 'Drop your CSV file here or click to browse'
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1917,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        ref: fileInputRef,
                                        type: "file",
                                        accept: ".csv",
                                        onChange: handleFileUpload,
                                        className: "hidden"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1922,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: ()=>{
                                            var _fileInputRef_current;
                                            return (_fileInputRef_current = fileInputRef.current) === null || _fileInputRef_current === void 0 ? void 0 : _fileInputRef_current.click();
                                        },
                                        children: "Select CSV File"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1929,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1904,
                                columnNumber: 25
                            }, this),
                            csvData.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    csvData.filter((r)=>!r.isValid).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                    className: "h-6 w-6 text-red-600 mt-0.5 flex-shrink-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1941,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-semibold text-red-800 dark:text-red-200 mb-2",
                                                            children: [
                                                                csvData.filter((r)=>!r.isValid).length,
                                                                " Invalid ",
                                                                csvData.filter((r)=>!r.isValid).length === 1 ? 'Row' : 'Rows',
                                                                " Detected"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1943,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-red-700 dark:text-red-300 mb-3",
                                                            children: [
                                                                "These rows will be ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "excluded from migration"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1947,
                                                                    columnNumber: 72
                                                                }, this),
                                                                " due to missing or invalid required fields."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1946,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-2",
                                                            children: Array.from(new Set(csvData.flatMap((r)=>{
                                                                var _r_validationErrors;
                                                                return ((_r_validationErrors = r.validationErrors) === null || _r_validationErrors === void 0 ? void 0 : _r_validationErrors.map((e)=>e.field)) || [];
                                                            }))).map((field)=>{
                                                                const count = csvData.filter((r)=>{
                                                                    var _r_validationErrors;
                                                                    return (_r_validationErrors = r.validationErrors) === null || _r_validationErrors === void 0 ? void 0 : _r_validationErrors.some((e)=>e.field === field);
                                                                }).length;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-sm text-red-700 dark:text-red-300",
                                                                    children: [
                                                                        "• ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                            children: count
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                            lineNumber: 1960,
                                                                            columnNumber: 67
                                                                        }, this),
                                                                        " row",
                                                                        count !== 1 ? 's' : '',
                                                                        " missing or invalid ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                            className: "bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded",
                                                                            children: field
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                            lineNumber: 1960,
                                                                            columnNumber: 139
                                                                        }, this)
                                                                    ]
                                                                }, field, true, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 1959,
                                                                    columnNumber: 61
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1951,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm text-red-700 dark:text-red-300 mt-3 font-medium",
                                                            children: "💡 Hover over the warning icon (⚠️) in each row to see specific validation errors."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 1966,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 1942,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 1940,
                                            columnNumber: 41
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1939,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold",
                                                children: [
                                                    "CSV Data Overview (",
                                                    csvData.filter((r)=>r.isValid).length,
                                                    " valid / ",
                                                    csvData.length,
                                                    " total rows)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1975,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                onClick: compareAssignments,
                                                disabled: loading || csvData.filter((r)=>r.isValid).length === 0,
                                                children: loading ? 'Comparing...' : "Compare ".concat(csvData.filter((r)=>r.isValid).length, " Valid Rows")
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1978,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1974,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-blue-500",
                                                        children: csvData.filter((r)=>r.isValid).length
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1989,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-600",
                                                        children: "Valid Rows"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1990,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1988,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-green-500",
                                                        children: csvData.filter((r)=>r.isValid && r.AssignmentAction === 'Add').length
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1993,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-600",
                                                        children: "Add Actions"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1996,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1992,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-orange-500",
                                                        children: csvData.filter((r)=>r.isValid && r.AssignmentAction === 'Remove').length
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 1999,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-600",
                                                        children: "Remove Actions"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2002,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 1998,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-red-500",
                                                        children: csvData.filter((r)=>r.isValid && r.AssignmentAction === 'NoAssignment').length
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2005,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-600",
                                                        children: "Clear Actions"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2008,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2004,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-2xl font-bold text-purple-500",
                                                        children: csvData.filter((r)=>r.isValid && r.FilterName).length
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2011,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-600",
                                                        children: "With Filters"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2014,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2010,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 1987,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border rounded-lg overflow-visible",
                                        children: [
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "overflow-x-auto",
                                                children: [
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                                                        data: csvData,
                                                        columns: uploadColumns,
                                                        currentPage: uploadCurrentPage,
                                                        totalPages: Math.ceil(csvData.length / itemsPerPage),
                                                        itemsPerPage: itemsPerPage,
                                                        onPageChange: setUploadCurrentPage,
                                                        onItemsPerPageChange: (newItemsPerPage)=>{
                                                            setItemsPerPage(newItemsPerPage);
                                                            setUploadCurrentPage(1);
                                                        },
                                                        showPagination: true,
                                                        searchPlaceholder: "Search CSV data..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2020,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2019,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2018,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 1936,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 1903,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 1895,
                columnNumber: 17
            }, this),
            currentStep === 'compare' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                children: "Assignment Comparison"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2046,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600",
                                children: "Review current assignments vs. planned changes"
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2047,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 2045,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: compareAssignments,
                            disabled: loading || csvData.filter((r)=>r.isValidAction).length === 0,
                            children: loading ? 'Comparing...' : csvData.filter((r)=>!r.isValidAction).length > 0 ? "Compare ".concat(csvData.filter((r)=>r.isValidAction).length, " Valid Rows (").concat(csvData.filter((r)=>!r.isValidAction).length, " Excluded)") : "Compare ".concat(csvData.filter((r)=>r.isValidAction).length, " Assignments")
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2052,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 2051,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 2044,
                columnNumber: 17
            }, this),
            currentStep === 'migrate' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            children: "Migration Ready"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2069,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600",
                                            children: "Select assignments to migrate"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2070,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2068,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: ()=>{
                                                const readyRows = comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated).map((r)=>r.id);
                                                // Check if all ready rows are already selected
                                                const allReadySelected = readyRows.length > 0 && readyRows.every((id)=>selectedRows.includes(id));
                                                if (allReadySelected) {
                                                    // Deselect all ready rows
                                                    setSelectedRows(selectedRows.filter((id)=>!readyRows.includes(id)));
                                                } else {
                                                    // Select all ready rows
                                                    const newSelection = [
                                                        ...new Set([
                                                            ...selectedRows,
                                                            ...readyRows
                                                        ])
                                                    ];
                                                    setSelectedRows(newSelection);
                                                }
                                            },
                                            variant: "outline",
                                            size: "sm",
                                            children: (()=>{
                                                const readyRows = comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated).map((r)=>r.id);
                                                const allReadySelected = readyRows.length > 0 && readyRows.every((id)=>selectedRows.includes(id));
                                                return allReadySelected ? "Deselect All Ready (".concat(readyRows.length, ")") : "Select All Ready (".concat(readyRows.length, ")");
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2075,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: downloadBackups,
                                            disabled: loading || comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated).length === 0,
                                            variant: "outline",
                                            children: loading ? 'Creating Backup...' : 'Backup Ready Policies'
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2111,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: migrateSelectedAssignments,
                                            disabled: selectedRows.filter((id)=>{
                                                const result = comparisonResults.find((r)=>r.id === id);
                                                return (result === null || result === void 0 ? void 0 : result.isReadyForMigration) && !(result === null || result === void 0 ? void 0 : result.isMigrated);
                                            }).length === 0 || loading,
                                            children: loading ? 'Migrating...' : "Migrate ".concat(selectedRows.filter((id)=>{
                                                const result = comparisonResults.find((r)=>r.id === id);
                                                return (result === null || result === void 0 ? void 0 : result.isReadyForMigration) && !(result === null || result === void 0 ? void 0 : result.isMigrated);
                                            }).length, " Selected")
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2118,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2074,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2067,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 2066,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            migrationProgress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium",
                                                children: "Migration Progress"
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2142,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm text-gray-600",
                                                children: [
                                                    migrationProgress,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2143,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2141,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-full bg-gray-200 rounded-full h-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-blue-600 h-2 rounded-full transition-all duration-300",
                                            style: {
                                                width: "".concat(migrationProgress, "%")
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2146,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2145,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2140,
                                columnNumber: 29
                            }, this),
                            comparisonResults.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-semibold",
                                                children: [
                                                    "Comparison Results (",
                                                    comparisonResults.length,
                                                    " policies)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2158,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        onChange: (e)=>{
                                                            const readyRows = comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated).map((r)=>r.id);
                                                            if (e.target.checked) {
                                                                setSelectedRows([
                                                                    ...selectedRows,
                                                                    ...readyRows.filter((id)=>!selectedRows.includes(id))
                                                                ]);
                                                            } else {
                                                                setSelectedRows(selectedRows.filter((id)=>!readyRows.includes(id)));
                                                            }
                                                        },
                                                        checked: (()=>{
                                                            const readyRows = comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated).map((r)=>r.id);
                                                            return readyRows.length > 0 && readyRows.every((id)=>selectedRows.includes(id));
                                                        })(),
                                                        className: "mr-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2160,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-sm text-gray-600",
                                                        children: "Select all ready for migration"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2181,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2159,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2157,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                                        data: comparisonResults.map((result)=>result),
                                        columns: comparisonColumns,
                                        className: "text-sm",
                                        // Instead of using key, pass selectedRows as a prop
                                        selectedRows: selectedRows,
                                        onRowClick: (row, index, event)=>handleRowClick(row, index, event),
                                        currentPage: compareCurrentPage,
                                        totalPages: Math.ceil(comparisonResults.length / itemsPerPage),
                                        itemsPerPage: itemsPerPage,
                                        onPageChange: setCompareCurrentPage,
                                        onItemsPerPageChange: (newItemsPerPage)=>{
                                            setItemsPerPage(newItemsPerPage);
                                            setCompareCurrentPage(1);
                                        },
                                        showPagination: true,
                                        onSelectionChange: setSelectedRows,
                                        searchPlaceholder: "Search policies..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2184,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between bg-gray-50 p-4 dark:bg-neutral-900 rounded-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-4 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: comparisonResults.filter((r)=>r.isReadyForMigration && !r.isMigrated).length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 2207,
                                                            columnNumber: 21
                                                        }, this),
                                                        " ready for migration"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2206,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: comparisonResults.filter((r)=>r.isMigrated).length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 2210,
                                                            columnNumber: 21
                                                        }, this),
                                                        " migrated"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2209,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: selectedRows.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 2213,
                                                            columnNumber: 21
                                                        }, this),
                                                        " selected"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2212,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2205,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2204,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2156,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "No comparison results available. Please run the comparison first."
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2220,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2219,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 2138,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 2065,
                columnNumber: 17
            }, this),
            currentStep === 'validate' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                            children: "Validation Results"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2234,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600",
                                            children: "Verify migrated assignments"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2235,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2233,
                                    columnNumber: 29
                                }, this),
                                !validationComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: validateAssignments,
                                    disabled: loading,
                                    children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2243,
                                                columnNumber: 45
                                            }, this),
                                            "Validating..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2242,
                                        columnNumber: 41
                                    }, this) : 'Run Validation'
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2240,
                                    columnNumber: 33
                                }, this),
                                validationComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 text-green-600",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2253,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: "Validation Complete"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2254,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2252,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2232,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 2231,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-green-50 p-4 rounded-lg border border-green-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                        className: "h-5 w-5 text-green-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2263,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-green-800",
                                                        children: "Successful"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2264,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2262,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-green-600 mt-2",
                                                children: comparisonResults.filter((r)=>r.isCurrentSessionValidation && r.validationStatus === 'valid').length
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2266,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2261,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-yellow-50 p-4 rounded-lg border border-yellow-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                        className: "h-5 w-5 text-yellow-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2272,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-yellow-800",
                                                        children: "Warnings"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2273,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2271,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-yellow-600 mt-2",
                                                children: comparisonResults.filter((r)=>r.isCurrentSessionValidation && r.validationStatus === 'warning').length
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2275,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2270,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-red-50 p-4 rounded-lg border border-red-200",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                        className: "h-5 w-5 text-red-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2281,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-red-800",
                                                        children: "Failed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2282,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2280,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-red-600 mt-2",
                                                children: comparisonResults.filter((r)=>r.isCurrentSessionValidation && r.validationStatus === 'invalid').length
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2284,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2279,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2260,
                                columnNumber: 25
                            }, this),
                            comparisonResults.filter((r)=>r.isCurrentSessionValidation).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-semibold",
                                        children: [
                                            "Validated Assignments (",
                                            comparisonResults.filter((r)=>r.isCurrentSessionValidation).length,
                                            " items)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2294,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border rounded-lg overflow-visible",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "overflow-x-auto overflow-y-visible",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DataTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DataTable"], {
                                                data: comparisonResults.filter((r)=>r.isCurrentSessionValidation).map((result)=>result),
                                                columns: validationColumns,
                                                className: "text-sm",
                                                currentPage: validationCurrentPage,
                                                totalPages: Math.ceil(comparisonResults.filter((r)=>r.isCurrentSessionValidation).length / itemsPerPage),
                                                itemsPerPage: itemsPerPage,
                                                onPageChange: setValidationCurrentPage,
                                                onItemsPerPageChange: (newItemsPerPage)=>{
                                                    setItemsPerPage(newItemsPerPage);
                                                    setValidationCurrentPage(1);
                                                },
                                                showPagination: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2297,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2296,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2295,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2293,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/deployment/assignments/page.tsx",
                        lineNumber: 2259,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 2230,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                open: isDialogOpen,
                onOpenChange: closeDialog,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                    className: "max-w-4xl max-h-[80vh] overflow-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2323,
                                        columnNumber: 29
                                    }, this),
                                    "Group Details"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2322,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2321,
                            columnNumber: 21
                        }, this),
                        groupLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center py-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2330,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2",
                                    children: "Loading group details..."
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2331,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2329,
                            columnNumber: 25
                        }, this),
                        groupError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-50 border border-red-200 rounded-lg p-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 text-red-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2338,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: groupError
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2339,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                lineNumber: 2337,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2336,
                            columnNumber: 25
                        }, this),
                        selectedGroup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-gray-500",
                                                    children: "Display Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2348,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold",
                                                    children: selectedGroup.displayName
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2349,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2347,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-gray-500",
                                                    children: "Group ID"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2352,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-mono text-gray-600",
                                                    children: selectedGroup.id
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2353,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2351,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2346,
                                    columnNumber: 29
                                }, this),
                                selectedGroup.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-500",
                                            children: "Description"
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2359,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600",
                                            children: selectedGroup.description
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2360,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2358,
                                    columnNumber: 33
                                }, this),
                                selectedGroup.groupCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-2xl font-bold text-blue-600",
                                                    children: selectedGroup.groupCount.userCount
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2367,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-600",
                                                    children: "Users"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2370,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2366,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-2xl font-bold text-green-600",
                                                    children: selectedGroup.groupCount.deviceCount
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2373,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-600",
                                                    children: "Devices"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2376,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2372,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-2xl font-bold text-purple-600",
                                                    children: selectedGroup.groupCount.groupCount
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2379,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-gray-600",
                                                    children: "Groups"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                    lineNumber: 2382,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2378,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2365,
                                    columnNumber: 33
                                }, this),
                                selectedGroup.members && selectedGroup.members.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-500 mb-2 block",
                                            children: [
                                                "Members (",
                                                selectedGroup.members.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2389,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border rounded-lg overflow-hidden max-h-60 overflow-y-auto",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                className: "w-full text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                        className: "bg-gray-50 sticky top-0",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-left p-3 border-b",
                                                                    children: "Name"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 2396,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-left p-3 border-b",
                                                                    children: "Type"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 2397,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                    className: "text-left p-3 border-b",
                                                                    children: "Status"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                    lineNumber: 2398,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                            lineNumber: 2395,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2394,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                        children: selectedGroup.members.map((member, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                className: index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "p-3 border-b",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "font-medium",
                                                                                children: member.displayName || 'Unknown'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                                lineNumber: 2405,
                                                                                columnNumber: 57
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xs text-gray-500",
                                                                                children: member.id || 'No ID'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                                lineNumber: 2406,
                                                                                columnNumber: 57
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                        lineNumber: 2404,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "p-3 border-b",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                            variant: "outline",
                                                                            children: member.type || 'Unknown'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                            lineNumber: 2409,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                        lineNumber: 2408,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                        className: "p-3 border-b",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                            variant: member.accountEnabled ? 'default' : 'secondary',
                                                                            children: member.accountEnabled ? 'Enabled' : 'Disabled'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                            lineNumber: 2412,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                        lineNumber: 2411,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, member.id || index, true, {
                                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                                lineNumber: 2403,
                                                                columnNumber: 49
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                                        lineNumber: 2401,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/deployment/assignments/page.tsx",
                                                lineNumber: 2393,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/deployment/assignments/page.tsx",
                                            lineNumber: 2392,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2388,
                                    columnNumber: 33
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-50 p-4 rounded-lg text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: "No members found or unable to load member details."
                                    }, void 0, false, {
                                        fileName: "[project]/app/deployment/assignments/page.tsx",
                                        lineNumber: 2424,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/deployment/assignments/page.tsx",
                                    lineNumber: 2423,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/deployment/assignments/page.tsx",
                            lineNumber: 2345,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/deployment/assignments/page.tsx",
                    lineNumber: 2320,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 2319,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssignmentsDialog, {}, void 0, false, {
                fileName: "[project]/app/deployment/assignments/page.tsx",
                lineNumber: 2433,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/deployment/assignments/page.tsx",
        lineNumber: 1757,
        columnNumber: 9
    }, this);
}
_s(AssignmentRolloutContent, "CpSkLs012AcINQKHnRZB87eVaFQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$msal$2d$react$2f$dist$2f$hooks$2f$useMsal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMsal"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useApiRequest$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiRequest"],
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ConsentContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConsent"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useGroupDetails$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGroupDetails"]
    ];
});
_c = AssignmentRolloutContent;
function AssignmentRolloutPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlanProtection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlanProtection"], {
        requiredPlan: "extensions",
        featureName: "Assignments Manager",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AssignmentRolloutContent, {}, void 0, false, {
            fileName: "[project]/app/deployment/assignments/page.tsx",
            lineNumber: 2441,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/deployment/assignments/page.tsx",
        lineNumber: 2440,
        columnNumber: 9
    }, this);
}
_c1 = AssignmentRolloutPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "AssignmentRolloutContent");
__turbopack_context__.k.register(_c1, "AssignmentRolloutPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_a90c7ad2._.js.map