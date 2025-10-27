// app/onboarding/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ConsentMessage {
    type: 'CONSENT_SUCCESS' | 'CONSENT_ERROR';
    adminConsent?: string | null;
    state?: string | null;
    tenantId?: string | null;
    result?: unknown;
    error?: string | null;
    errorDescription?: string | null;
}


function OnboardingCallbackContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const processCallback = async () => {
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');
            const adminConsent = searchParams.get('admin_consent');
            const state = searchParams.get('state');
            const tenantId = searchParams.get('tenant');
            const code = searchParams.get('code');

            console.log('🔵 Onboarding callback received:', {
                error,
                errorDescription,
                adminConsent,
                state,
                tenantId,
                code
            });

            // Function to send message to parent window with cross-origin handling
            const sendMessageToParent = (messageData: ConsentMessage) => {
                if (!window.opener || window.opener.closed) {
                    console.log('No opener window available');
                    return;
                }

                try {
                    // First try with the current origin
                    window.opener.postMessage(messageData, window.location.origin);
                    console.log('Message sent with same origin');
                } catch (error1) {
                    try {
                        // Try with the parent's origin if available
                        const parentOrigin = window.opener.location.origin;
                        window.opener.postMessage(messageData, parentOrigin);
                        console.log('Message sent with parent origin');
                    } catch (error2) {
                        try {
                            // Fallback to wildcard for cross-origin scenarios
                            window.opener.postMessage(messageData, '*');
                            console.log('Message sent with wildcard origin');
                        } catch (error3) {
                            console.error('Failed to send message to parent window:', error3);
                        }
                    }
                }
            };

            if (error) {
                setStatus('error');
                setMessage(errorDescription || error || 'Admin consent was denied or failed.');

                // Send error message to parent window
                sendMessageToParent({
                    type: 'CONSENT_ERROR',
                    error: error,
                    errorDescription: errorDescription
                });
                return;
            }

            if (adminConsent === 'True' || code) {
                try {
                    // Send POST request to CONSENT_CALLBACK endpoint
                    const callbackResponse = await fetch('/api/consent-callback', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            adminConsent,
                            state,
                            tenantId,
                            code,
                            // Include all query parameters
                            searchParams: Object.fromEntries(searchParams.entries())
                        })
                    });

                    if (callbackResponse.ok) {
                        const result = await callbackResponse.json();
                        console.log('Consent callback successful:', result);

                        setStatus('success');
                        setMessage('Admin consent has been successfully granted and processed.');

                        // Send success message to parent window
                        sendMessageToParent({
                            type: 'CONSENT_SUCCESS',
                            adminConsent: adminConsent,
                            state: state,
                            tenantId: tenantId,
                            result: result
                        });
                    } else {
                        const errorResult = await callbackResponse.json().catch(() => null);
                        throw new Error(errorResult?.message || `Callback failed: ${callbackResponse.statusText}`);
                    }
                } catch (callbackError) {
                    console.error('Error processing consent callback:', callbackError);
                    setStatus('error');
                    setMessage(callbackError instanceof Error ? callbackError.message : 'Failed to process consent callback');

                    // Send error message to parent window
                    sendMessageToParent({
                        type: 'CONSENT_ERROR',
                        error: 'callback_failed',
                        errorDescription: callbackError instanceof Error ? callbackError.message : 'Failed to process consent callback'
                    });
                }
            } else {
                // Unknown state
                setStatus('error');
                setMessage('Unexpected response from consent flow');

                sendMessageToParent({
                    type: 'CONSENT_ERROR',
                    error: 'unknown_response',
                    errorDescription: 'Unexpected response from consent flow'
                });
            }
        };

        processCallback();
    }, [searchParams]);

    // Close the popup window after processing
    useEffect(() => {
        if (status !== 'processing') {
            const timer = setTimeout(() => {
                console.log('Process completed, window should be closed by parent or user');
                // Don't try to close the window at all - let the parent handle it
                // or the user can close it manually
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
                {status === 'processing' && (
                    <div className="space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Processing onboarding...</h2>
                        <p className="text-gray-600">Please wait while we complete your setup.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Onboarding Complete!</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">
                            This window will close automatically, or you can close it manually.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Onboarding Failed</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">
                            You can close this window and try again.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OnboardingCallback() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <OnboardingCallbackContent />
        </Suspense>
    );
}
