'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ConsentMessage {
    type: 'CONSENT_SUCCESS' | 'CONSENT_ERROR';
    adminConsent?: string | null;
    state?: string | null;
    tenantId?: string | null;
    result?: unknown;
    error?: string | null;
    errorDescription?: string | null;
}

function ConsentCallbackContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing consent...');

    const sendMessageToParent = (messageData: ConsentMessage) => {
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(messageData, window.location.origin);
        }
    };

    useEffect(() => {
        const error = searchParams.get('error');
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (error) {
            setStatus('error');
            setMessage(`Consent failed: ${error}`);

            // Send error message to parent window
            sendMessageToParent({
                type: 'CONSENT_ERROR',
                error: error,
                errorDescription: searchParams.get('error_description')
            });
        } else if (code) {
            setStatus('success');
            setMessage('Admin consent has been successfully granted and processed.');

            // Send success message to parent window
            sendMessageToParent({
                type: 'CONSENT_SUCCESS',
                adminConsent: code,
                state: state,
                tenantId: searchParams.get('tenant_id'),
                result: { code, state }
            });
        } else {
            setStatus('error');
            setMessage('Invalid callback - missing required parameters.');

            sendMessageToParent({
                type: 'CONSENT_ERROR',
                error: 'invalid_callback',
                errorDescription: 'Missing required parameters'
            });
        }
    }, [searchParams]);

    // Don't try to close the window automatically
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
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
                {status === 'processing' && (
                    <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <h2 className="text-xl font-semibold text-gray-900">Processing Consent</h2>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Onboarding Complete!</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">
                            You can now close this window.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Onboarding Failed</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-500">
                            Please close this window and try again.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ConsentCallback() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <ConsentCallbackContent />
        </Suspense>
    );
}
