// components/VerifyConsentOnMount.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { useConsent } from '@/contexts/ConsentContext';
import { IA_VERIFY_ENDPOINT } from '@/lib/constants';

interface ConsentVerifyResponse {
    status: number;
    message: string;
    details: {
        consentUrl: string;
    };
    data: {
        hasAllPermissions: boolean;
        requiredPermissions: string[];
        missingPermissions: string[];
    };
}

const CONSENT_CHECK_KEY = 'ia_consent_verified';

export function VerifyConsentOnMount() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const { setConsentNeeded, clearConsent } = useConsent();
    const hasVerified = useRef(false);

    useEffect(() => {
        // Expose a global function to force re-verification (for testing)
        if (typeof window !== 'undefined') {
            (window as any).forceConsentCheck = () => {
                console.log('FORCE: Clearing consent verification flag');
                sessionStorage.removeItem(CONSENT_CHECK_KEY);
                hasVerified.current = false;
                window.location.reload();
            };
        }

        const verifyConsent = async () => {
            console.log('VerifyConsent: Starting verification check...');
            console.log('VerifyConsent: Accounts count:', accounts.length);

            // Skip if no accounts
            if (!accounts.length) {
                console.log('VerifyConsent: No accounts, skipping verification');
                return;
            }

            // Check if already verified this session
            const alreadyVerified = sessionStorage.getItem(CONSENT_CHECK_KEY);
            console.log('VerifyConsent: Session storage flag:', alreadyVerified);
            console.log('VerifyConsent: hasVerified.current:', hasVerified.current);

            // TEMPORARILY DISABLED FOR TESTING - ALWAYS RUN THE CHECK
            console.log('VerifyConsent: SESSION CHECK DISABLED - FORCING API CALL FOR TESTING');
            /*
            if (alreadyVerified || hasVerified.current) {
                console.log('VerifyConsent: Already verified this session, skipping');
                console.log('VerifyConsent: To force re-check, run: window.forceConsentCheck()');
                return;
            }
            */

            // Mark as verified to prevent multiple calls
            hasVerified.current = true;
            sessionStorage.setItem(CONSENT_CHECK_KEY, 'true');

            console.log('VerifyConsent: Making API call to:', IA_VERIFY_ENDPOINT);

            try {
                const response = await request<ConsentVerifyResponse>(
                    IA_VERIFY_ENDPOINT,
                    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
                );

                console.log('VerifyConsent: Response received', response);

                if (response && response.status === 3) {
                    console.log('VerifyConsent: Consent required - missing permissions:', response.data?.missingPermissions);
                    setConsentNeeded(
                        response.details?.consentUrl || '',
                        response.data?.requiredPermissions || []
                    );
                } else if (response && response.status === 0) {
                    console.log('VerifyConsent: All permissions granted');
                    clearConsent();
                } else {
                    console.log('VerifyConsent: Unexpected status:', response?.status);
                }
            } catch (error) {
                console.error('VerifyConsent: Error checking consent', error);
                // Even on error, keep the session flag so we don't retry constantly
                // User can refresh page to retry if needed
            }
        };

        verifyConsent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]); // Run when accounts become available (user logs in)

    return null;
}

