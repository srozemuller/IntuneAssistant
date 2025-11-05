// lib/apiRequest.ts
import { UserConsentRequiredError } from '@/lib/errors';

export class ApiError extends Error {
    public correlationId?: string | null;
    public status?: number;

    constructor(message: string, correlationId?: string | null, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.correlationId = correlationId;
        this.status = status;
    }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}, token?: string): Promise<T> {
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

        // Extract correlation ID from response headers ALWAYS
        const correlationId = response.headers.get('x-correlation-id') ||
            response.headers.get('X-Correlation-ID') ||
            response.headers.get('correlation-id') ||
            response.headers.get('Correlation-ID');

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // Parse response
        const data = isJson ? await response.json() : await response.text();

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

            // Debug: Log ALL headers to see what we actually have
            console.log("=== ALL RESPONSE HEADERS ===");
            for (const [key, value] of response.headers) {
                console.log(`${key}: ${value}`);
            }



            // Create error message based on status code, not response content
            const errorMessage = `API request failed: ${response.status} - ${response.statusText || 'HTTP Error'}`;

            console.log("Final error message:", errorMessage);
            throw new ApiError(errorMessage, correlationId, response.status);
        }

        // Success case
        console.log("Success response, correlation ID:", correlationId);
        return data as T;
    } catch (error) {
        // Re-throw specific errors
        if (error instanceof UserConsentRequiredError || error instanceof ApiError) {
            throw error;
        }

        console.error("API request error:", error);
        throw error;
    }
}
