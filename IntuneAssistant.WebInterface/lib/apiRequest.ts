// lib/api.ts
export class UserConsentRequiredError extends Error {
    consentUrl: string;
    constructor(message: string, consentUrl: string) {
        super(message);
        this.name = "UserConsentRequiredError";
        this.consentUrl = consentUrl;
    }
}

export async function apiRequest<T>(
    url: string,
    options: RequestInit = {},
    accessToken?: string
): Promise<T> {
    const headers: HeadersInit = {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        if (!response.ok) {
            if (
                data?.message === "User challenge required" &&
                typeof data?.data === "string"
            ) {
                throw new UserConsentRequiredError(data.message, data.data);
            }
            throw new Error(data?.message || response.statusText);
        }
        return data;
    } catch (err) {
        throw err;
    }
}
