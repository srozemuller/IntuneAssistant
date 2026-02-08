
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ConsentCallbackPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing consent...');

    useEffect(() => {
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const adminConsent = searchParams.get('admin_consent');
        const state = searchParams.get('state');

        if (error) {
            // Handle error
            setStatus('error');
            setMessage(errorDescription || error || 'An error occurred during consent');

            // Send error message to parent
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

            // Close window after 3 seconds
            setTimeout(() => {
                window.close();
            }, 3000);} else if (adminConsent === 'True') {
            // Handle success
            setStatus('success');
            setMessage('Consent granted successfully!');

            // Send success message to parent
            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: 'CONSENT_SUCCESS',
                        state: state
                    },
                    window.location.origin
                );
            }

            // Close window after 2 seconds
            setTimeout(() => {
                window.close();
            }, 2000);
        } else {
            // Unknown state
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

            setTimeout(() => {
                window.close();
            }, 3000);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'processing' && (
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        )}
                    </div>
                    <CardTitle className={
                        status === 'success'
                            ? 'text-green-600 dark:text-green-400'
                            : status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                    }>
                        {status === 'processing' && 'Processing Consent'}
                        {status === 'success' && 'Consent Granted'}
                        {status === 'error' && 'Consent Failed'}
                    </CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    {status === 'success' && 'This window will close automatically...'}
                    {status === 'error' && 'This window will close in a few seconds...'}
                    {status === 'processing' && 'Please wait...'}
                </CardContent>
            </Card>
        </div>
    );
}