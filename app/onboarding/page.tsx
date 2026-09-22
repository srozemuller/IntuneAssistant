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
    code?: string | null;
    result?: unknown;
    searchParams?: Record<string, string>;
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

            console.log('Onboarding callback received:', {
                error,
                errorDescription,
                adminConsent,
                state,
                tenantId,
                code,
                allParams: Object.fromEntries(searchParams.entries())
            });

            const sendMessageToParent = (messageData: ConsentMessage) => {
                console.log('Sending message to parent:', messageData);

                if (!window.opener || window.opener.closed) {
                    console.log('No opener window available or it was closed');
                    setStatus('error');
                    setMessage('Parent window not found. Please return to the main window and try again.');
                    return;
                }

                try {
                    // Try same origin first
                    window.opener.postMessage(messageData, window.location.origin);
                    console.log('Message sent with same origin:', window.location.origin);
                } catch (error1) {
                    console.log('Failed to send with same origin, trying parent origin');
                    try {
                        const parentOrigin = window.opener.location.origin;
                        window.opener.postMessage(messageData, parentOrigin);
                        console.log('Message sent with parent origin:', parentOrigin);
                    } catch (error2) {
                        console.log('Failed to send with parent origin, trying wildcard');
                        try {
                            window.opener.postMessage(messageData, '*');
                            console.log('Message sent with wildcard origin');
                        } catch (error3) {
                            console.error('Failed to send message to parent window:', error3);
                            setStatus('error');
                            setMessage('Failed to communicate with parent window. Please close this window and try again.');
                        }
                    }
                }
            };

            if (error) {
                setStatus('error');
                setMessage(errorDescription || error || 'Admin consent was denied or failed.');

                sendMessageToParent({
                    type: 'CONSENT_ERROR',
                    error: error,
                    errorDescription: errorDescription
                });

                // Don't auto-close on error - let user read the message
                return;
            }

            // Success case - admin consent granted
            if (adminConsent === 'True' || code) {
                setStatus('success');
                setMessage('Admin consent granted successfully! Processing will continue in the parent window.');

                const messageData: ConsentMessage = {
                    type: 'CONSENT_SUCCESS',
                    adminConsent: adminConsent,
                    state: state,
                    tenantId: tenantId,
                    code: code,
                    searchParams: Object.fromEntries(searchParams.entries())
                };

                sendMessageToParent(messageData);

                // Auto-close after 2 seconds on success
                setTimeout(() => {
                    console.log('Closing window after successful consent');
                    window.close();
                }, 2000);
            } else {
                setStatus('error');
                setMessage('Unexpected response from consent flow. Please try again.');

                sendMessageToParent({
                    type: 'CONSENT_ERROR',
                    error: 'unknown_response',
                    errorDescription: 'Unexpected response from consent flow'
                });
            }
        };

        processCallback();
    }, [searchParams]);

    useEffect(() => {
        if (status !== 'processing') {
            const timer = setTimeout(() => {
                console.log('Process completed, window should be closed by parent or user');
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
