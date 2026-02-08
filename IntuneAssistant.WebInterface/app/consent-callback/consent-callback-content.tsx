// app/consent-callback/consent-callback-content.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ConsentCallbackContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing consent...');

    useEffect(() => {
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const adminConsent = searchParams.get('admin_consent');
        const state = searchParams.get('state');

        if (error) {
            setStatus('error');
            setMessage(errorDescription || error || 'An error occurred during consent');

            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'CONSENT_ERROR',
                        error: error,
                        errorDescription: errorDescription || 'Unknown error'
                    },
                    window.location.origin
                );
            }

            setTimeout(() => window.close(), 3000);
        } else if (adminConsent === 'True') {
            setStatus('success');
            setMessage('Consent granted successfully!');

            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'CONSENT_SUCCESS',
                        state: state
                    },
                    window.location.origin
                );
            }

            setTimeout(() => window.close(), 2000);
        } else {
            setStatus('error');
            setMessage('Invalid consent response');

            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'CONSENT_ERROR',
                        error: 'invalid_response',
                        errorDescription: 'Invalid consent response'
                    },
                    window.location.origin
                );
            }

            setTimeout(() => window.close(), 3000);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="flex justify-center">
                        {status === 'processing' && (
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                                </div>
                                <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                                    <XCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        )}
                    </div>
                    <CardTitle className={`text-2xl font-bold ${
                        status === 'success'
                            ? 'text-green-600 dark:text-green-400'
                            : status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                    }`}>
                        {status === 'processing' && 'Processing Consent'}
                        {status === 'success' && 'Success!'}
                        {status === 'error' && 'Consent Failed'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        status === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : status === 'error'
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                        {status === 'success' && '✓ Closing window...'}
                        {status === 'error' && '✕ Closing in a few seconds...'}
                        {status === 'processing' && '⏳ Please wait...'}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}