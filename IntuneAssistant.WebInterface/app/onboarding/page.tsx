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

            console.log('🔵 Onboarding callback received:', {
                error,
                errorDescription,
                adminConsent,
                state,
                tenantId,
                code
            });

            const sendMessageToParent = (messageData: ConsentMessage) => {
                if (!window.opener || window.opener.closed) {
                    console.log('No opener window available');
                    return;
                }

                try {
                    window.opener.postMessage(messageData, window.location.origin);
                    console.log('Message sent with same origin');
                } catch (error1) {
                    try {
                        const parentOrigin = window.opener.location.origin;
                        window.opener.postMessage(messageData, parentOrigin);
                        console.log('Message sent with parent origin');
                    } catch (error2) {
                        try {
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

                sendMessageToParent({
                    type: 'CONSENT_ERROR',
                    error: error,
                    errorDescription: errorDescription
                });
                return;
            }

            // DO NOT call the server callback here — let customer-onboarding handle it.
            if (adminConsent === 'True' || code) {
                setStatus('success');
                setMessage('Admin consent has been received. Processing will continue in the parent window.');

                sendMessageToParent({
                    type: 'CONSENT_SUCCESS',
                    adminConsent: adminConsent,
                    state: state,
                    tenantId: tenantId,
                    code: code,
                    searchParams: Object.fromEntries(searchParams.entries())
                });
            } else {
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
