// app/consent-callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ConsentCallback() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (error) {
            // Send error message to parent window
            window.opener?.postMessage({
                type: 'CONSENT_ERROR',
                error: error,
                errorDescription: searchParams.get('error_description')
            }, window.location.origin);
        } else if (code) {
            // Send success message to parent window
            window.opener?.postMessage({
                type: 'CONSENT_SUCCESS',
                code: code,
                state: state
            }, window.location.origin);
        }

        // Close the popup window
        window.close();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Processing consent...</p>
            </div>
        </div>
    );
}
