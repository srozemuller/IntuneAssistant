// lib/apiRequest.ts
import { UserConsentRequiredError } from '@/lib/errors';

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

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        // Parse response
        const data = isJson ? await response.json() : await response.text();

        // Improved consent detection
        if (response.status === 401) {
            console.log("401 response detected:", JSON.stringify(data, null, 2));

            // Check specifically for the message structure you showed
            if (data?.message?.url) {
                console.log("Consent URL found:", data.message.url);
                throw new UserConsentRequiredError(
                    data.message.url,
                    data.message.message || "Additional permissions required"
                );
            }

            // Try multiple ways to extract consent URL
            const consentUrl =
                (data?.consentUrl) ||
                (data?.message?.url) ||
                (typeof data === 'object' && data.error && data.error.includes('consent') ? data.url : null);

            if (consentUrl) {
                console.log("Consent URL detected:", consentUrl);
                throw new UserConsentRequiredError(consentUrl);
            }

            // If we have a message object but no specific URL
            if (data?.message) {
                console.log("Message detected in 401 response:", data.message);
                throw new UserConsentRequiredError(
                    data.message.url || "https://login.microsoftonline.com",
                    data.message.message || "User consent required"
                );
            }
        }

        // Handle errors
        else if (!response.ok) {
            console.log("Error response data:", JSON.stringify(data, null, 2));

            // More specific handling for different data structures
            let errorMessage;

            if (typeof data === 'object' && data !== null) {
                if (data.message?.message) {
                    errorMessage = `API request failed: ${response.status} - ${data.message.message}`;
                } else if (typeof data.message === 'string') {
                    errorMessage = `API request failed: ${response.status} - ${data.message}`;
                } else {
                    errorMessage = `API request failed: ${response.status} - ${JSON.stringify(data)}`;
                }
            } else {
                errorMessage = `API request failed: ${response.status}`;
            }

            throw new Error(errorMessage);
        }


        return data as T;
    } catch (error) {
        // Re-throw UserConsentRequiredError to be caught by useApiRequest
        if (error instanceof UserConsentRequiredError) {
            throw error;
        }

        console.error("API request error:", error);
        throw error;
    }
}
