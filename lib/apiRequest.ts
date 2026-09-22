// lib/apiRequest.ts
import { UserConsentRequiredError } from '@/lib/errors';
import { CUSTOMER_ENDPOINT, AUDIT_LOGS_INTUNE_FILTER, BACKUP_FETCH_ENDPOINT, COMPARE_ENDPOINT, SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT } from '@/lib/constants';

// IntuneAssistant is a read-only community tool: it never writes to your tenant. Every request is
// a GET, with a short, explicit allowlist of POST endpoints that are verified read-only on the
// API side (a filter/id-list body that is too large for a querystring, wrapped in POST — no Graph
// write, no tenant mutation) plus one genuine write: creating your own account during onboarding,
// which writes to our own service, never to your tenant. Never add to this list without checking
// the controller's own Graph calls first — see IntuneAssistant.Docs/private/todo-list.md.
const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const READ_ONLY_POST_PREFIXES = [
    AUDIT_LOGS_INTUNE_FILTER,          // filter body only; same read path as GET /audit/intune/page
    BACKUP_FETCH_ENDPOINT('').replace(/\/$/, ''), // id-list body only; Graph GET per id, no write
    COMPARE_ENDPOINT,                  // covers /compare/{type}, /compare/json, /compare/{type}/set-analysis — all Read.All only
    SETTINGS_DEFINITIONS_RESOLVE_ENDPOINT, // definitionId list body only; Read.All only
];

function assertReadOnly(url: string, method: string | undefined) {
    const verb = (method ?? 'GET').toUpperCase();
    if (READ_ONLY_METHODS.includes(verb)) return;
    if (verb === 'POST' && url === CUSTOMER_ENDPOINT) return;
    if (verb === 'POST' && READ_ONLY_POST_PREFIXES.some(prefix => url.startsWith(prefix))) return;
    throw new Error(`IntuneAssistant only reads data. ${verb} requests are not allowed.`);
}

export class ApiError extends Error {
    public correlationId?: string | null;
    public status?: number;
    public responseData?: unknown;

    constructor(message: string, correlationId?: string | null, status?: number, responseData?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.correlationId = correlationId;
        this.status = status;
        this.responseData = responseData;
    }
}

// Track if we've already warned about missing correlation ID header
let hasWarnedAboutCorrelationId = false;

// Return type that includes both data and correlationId
export interface ApiResponseWithCorrelation<T> {
    data: T;
    correlationId: string | null;
}

export async function apiRequest<T>(url: string, options: RequestInit = {}, token?: string): Promise<ApiResponseWithCorrelation<T>> {
    assertReadOnly(url, options.method);
    try {
        // Add authorization header if token is provided
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` })
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // Parse response
        const data = isJson ? await response.json() : await response.text();

        // Extract correlation ID from response headers AFTER response is complete
        const correlationId = response.headers.get('x-correlation-id') ||
            response.headers.get('X-Correlation-ID') ||
            null;

        // Handle 401 specifically for consent
        if (response.status === 401) {
            console.log("401 response detected:", JSON.stringify(data, null, 2));

            if (data?.message?.url) {
                console.log("Consent URL found:", data.message.url);
                throw new UserConsentRequiredError(
                    data.message.url,
                    data.message.message || "Additional permissions required"
                );
            }

            const consentUrl = data?.consentUrl || data?.message?.url;
            if (consentUrl) {
                console.log("Consent URL detected:", consentUrl);
                throw new UserConsentRequiredError(consentUrl);
            }
        }

        // Handle ALL other error status codes (400, 500, etc.)
        if (!response.ok) {
            console.log(`Error ${response.status} response data:`, JSON.stringify(data, null, 2));

            // Prefer the backend's own message when it gave us a plain string (e.g. "License code
            // 'X' is already in use...") — falls back to a generic status line when it didn't
            // (or when `message` is a non-string shape like the {url, message} consent envelope,
            // which is handled separately above before reaching this branch).
            const backendMessage = typeof (data as { message?: unknown })?.message === 'string'
                ? (data as { message: string }).message
                : undefined;
            const errorMessage = backendMessage ?? `API request failed: ${response.status} - ${response.statusText || 'HTTP Error'}`;

            console.log("Final error message:", errorMessage);
            throw new ApiError(errorMessage, correlationId, response.status, data);
        }

        // Success case - log correlation ID if available
        if (correlationId) {
            console.log("Correlation ID:", correlationId);
        } else if (!hasWarnedAboutCorrelationId) {
            hasWarnedAboutCorrelationId = true;
        }

        // Return both data and correlationId
        return {
            data: data as T,
            correlationId: correlationId
        };
    } catch (error) {
        // Re-throw specific errors without logging
        if (error instanceof UserConsentRequiredError || error instanceof ApiError) {
            throw error;
        }

        // AbortErrors are expected when requests are cancelled — don't log them
        if ((error as { name?: string })?.name === 'AbortError') {
            throw error;
        }

        console.error("API request error:", error);
        throw error;
    }
}
