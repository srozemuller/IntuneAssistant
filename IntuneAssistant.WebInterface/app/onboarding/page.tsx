// app/onboarding/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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

            if (error) {
                setStatus('error');
                setMessage(errorDescription || error || 'Admin consent was denied or failed.');

                // Send error message to parent window
                window.opener?.postMessage({
                    type: 'CONSENT_ERROR',
                    error: error,
                    errorDescription: errorDescription
                }, window.location.origin);
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
                        window.opener?.postMessage({
                            type: 'CONSENT_SUCCESS',
                            adminConsent: adminConsent,
                            state: state,
                            tenantId: tenantId,
                            result: result
                        }, window.location.origin);
                    } else {
                        const errorResult = await callbackResponse.json().catch(() => null);
                        throw new Error(errorResult?.message || `Callback failed: ${callbackResponse.statusText}`);
                    }
                } catch (callbackError) {
                    console.error('Error processing consent callback:', callbackError);
                    setStatus('error');
                    setMessage(callbackError instanceof Error ? callbackError.message : 'Failed to process consent callback');

                    // Send error message to parent window
                    window.opener?.postMessage({
                        type: 'CONSENT_ERROR',
                        error: 'callback_failed',
                        errorDescription: callbackError instanceof Error ? callbackError.message : 'Failed to process consent callback'
                    }, window.location.origin);
                }
            } else {
                // Unknown state
                setStatus('error');
                setMessage('Unexpected response from consent flow');

                window.opener?.postMessage({
                    type: 'CONSENT_ERROR',
                    error: 'unknown_response',
                    errorDescription: 'Unexpected response from consent flow'
                }, window.location.origin);
            }
        };

        processCallback();
    }, [searchParams]);

    // Close the popup window after processing
    useEffect(() => {
        if (status !== 'processing') {
            const timer = setTimeout(() => {
                if (window.opener) {
                    window.close();
                } else {
                    // If not in popup, redirect to main app
                    window.location.href = '/';
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center max-w-md mx-auto p-6">
                {status === 'error' ? (
                    <div className="space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <h1 className="text-xl font-semibold text-gray-900">Consent Failed</h1>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">This window will close automatically...</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <h1 className="text-xl font-semibold text-gray-900">Consent Granted</h1>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">Completing onboarding...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                        <h1 className="text-xl font-semibold text-gray-900">Processing Consent</h1>
                        <p className="text-gray-600">Please wait while we process the consent response...</p>
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
