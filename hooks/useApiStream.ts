// hooks/useApiStream.ts
'use client';

import { useCallback, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useConsent } from '@/contexts/ConsentContext';
import { apiScope } from '@/lib/msalConfig';
import { ApiError } from '@/lib/apiRequest';
import { UserConsentRequiredError } from '@/lib/errors';
import { readSseStream, SseMessage } from '@/lib/sseStream';

export type StreamOutcome = 'completed' | 'aborted' | 'consent-required' | 'session-expired';

// Same scope extraction useApiRequest does for the consent banner.
function extractScopesFromConsentUrl(url: string): string[] {
    try {
        const scope = new URL(url).searchParams.get('scope');
        return scope ? scope.split(' ').filter(Boolean) : [];
    } catch {
        return [];
    }
}

/**
 * Streaming sibling of useApiRequest for Server-Sent Events endpoints. Acquires the API token the same way
 * and routes 401 consent challenges to the consent banner, swallowing expired-session errors
 * (SessionExpiredDialog owns those). Unlike useApiRequest it does NOT report errors to the
 * global error banner - a stream is owned by whoever started it and shows its own state.
 *
 * Each hook instance holds one AbortController: starting a new stream cancels the previous one.
 */
export function useApiStream() {
    const { instance, accounts } = useMsal();
    const { setConsentNeeded } = useConsent();
    const abortControllerRef = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
        abortControllerRef.current?.abort(new DOMException('Stream cancelled', 'AbortError'));
        abortControllerRef.current = null;
    }, []);

    const stream = useCallback(async (
        url: string,
        onMessage: (message: SseMessage) => void,
        options: RequestInit = {}
    ): Promise<StreamOutcome> => {
        cancel();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            let accessToken: string | undefined;
            if (accounts.length > 0) {
                const tokenResponse = await instance.acquireTokenSilent({
                    scopes: [apiScope],
                    account: accounts[0],
                });
                accessToken = tokenResponse.accessToken;
            }

            const response = await fetch(url, {
                ...options,
                method: options.method ?? 'GET',
                signal: controller.signal,
                headers: {
                    Accept: 'text/event-stream',
                    ...options.headers,
                    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                },
            });

            if (!response.ok) {
                // Everything before the first event is a normal JSON action on the backend, so the consent and
                // error envelopes are the same ones apiRequest understands.
                const contentType = response.headers.get('content-type') ?? '';
                const body = contentType.includes('application/json') ? await response.json() : await response.text();
                const correlationId = response.headers.get('x-correlation-id');

                if (response.status === 401) {
                    const consentUrl = body?.message?.url ?? body?.consentUrl;
                    if (consentUrl) {
                        throw new UserConsentRequiredError(consentUrl, body?.message?.message || 'Additional permissions required');
                    }
                }

                const backendMessage = typeof body?.message === 'string' ? body.message : undefined;
                throw new ApiError(
                    backendMessage ?? `API request failed: ${response.status} - ${response.statusText || 'HTTP Error'}`,
                    correlationId,
                    response.status,
                    body
                );
            }

            await readSseStream(response, onMessage, controller.signal);
            return 'completed';
        } catch (err) {
            if ((err as { name?: string })?.name === 'AbortError') {
                return 'aborted';
            }
            if (err instanceof InteractionRequiredAuthError) {
                return 'session-expired';
            }
            if (err instanceof UserConsentRequiredError) {
                setConsentNeeded(err.consentUrl, extractScopesFromConsentUrl(err.consentUrl));
                return 'consent-required';
            }
            throw err;
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }, [accounts, instance, setConsentNeeded, cancel]);

    return { stream, cancel };
}
