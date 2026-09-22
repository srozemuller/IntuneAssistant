'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import { Server, Loader2, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CONSENT_URL_ENDPOINT, CONSENT_CALLBACK } from '@/lib/constants';
import { OnboardingSignInGate } from '@/components/onboarding/sign-in-gate';
import { OnboardingSteps } from '@/components/onboarding/onboarding-steps';

type Step = 'loading' | 'ready' | 'consent_pending' | 'callback' | 'done' | 'error';

const CONSENT_CLIENT_ID = 'afe66ddf-67d4-4d61-8a51-beca7b799f52';

interface ConsentUrlResponse {
    data: { url: string };
}

export default function ConnectTenantPage() {
    const { accounts } = useMsal();
    const router = useRouter();
    const { request } = useApiRequest();

    const [step, setStep] = useState<Step>('loading');
    const [error, setError] = useState<string | null>(null);
    const [consentUrl, setConsentUrl] = useState<string | null>(null);
    const consentStateRef = useRef<string | null>(null);
    const [consentWindow, setConsentWindow] = useState<Window | null>(null);
    const initialized = useRef(false);

    const account = accounts[0];
    const tenantId = account?.tenantId ?? '';
    const domain = account?.username?.split('@')[1] ?? '';
    const customerName = account?.username?.split('@')[1] ?? account?.username ?? 'Customer';

    useEffect(() => {
        if (initialized.current || !tenantId || !domain) return;
        initialized.current = true;
        buildConsentUrl();
    }, [tenantId, domain]); // eslint-disable-line react-hooks/exhaustive-deps

    const buildConsentUrl = async () => {
        setStep('loading');
        setError(null);
        const params = new URLSearchParams({
            tenantid: tenantId,
            clientId: CONSENT_CLIENT_ID,
            assistantLicense: '0',
            redirectUrl: window.location.origin + '/onboarding',
            tenantName: domain,
            tenantDomain: domain,
            purpose: 'InitialOnboarding',
            customerName,
        });
        const res = await request<ConsentUrlResponse>(`${CONSENT_URL_ENDPOINT}?${params}`);
        if (!res) {
            // useApiRequest showed the error globally
            setStep('error');
            setError('Failed to prepare consent request. See the error banner above.');
            return;
        }
        const url = res.data?.data?.url;
        if (!url) {
            setError('No consent URL returned from server.');
            setStep('error');
            return;
        }
        const parsed = new URL(url);
        consentStateRef.current = parsed.searchParams.get('state');
        setConsentUrl(url);
        setStep('ready');
    };

    // Listen for postMessage from consent popup
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            // The consent popup redirects back to this app's own /onboarding route,
            // so only accept messages from our exact origin.
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'CONSENT_SUCCESS') {
                consentWindow?.close();
                setConsentWindow(null);
                runCallback();
            } else if (event.data?.type === 'CONSENT_ERROR') {
                consentWindow?.close();
                setConsentWindow(null);
                setError(`Consent failed: ${event.data.errorDescription || event.data.error || 'Unknown error'}`);
                setStep('error');
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [consentWindow]); // eslint-disable-line react-hooks/exhaustive-deps

    // Detect manual popup close
    useEffect(() => {
        if (!consentWindow) return;
        const interval = setInterval(() => {
            if (consentWindow.closed) {
                clearInterval(interval);
                setConsentWindow(null);
                setTimeout(() => runCallback(), 1000);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [consentWindow]); // eslint-disable-line react-hooks/exhaustive-deps

    const openConsent = () => {
        if (!consentUrl) return;
        const popup = window.open(consentUrl, 'consent', 'width=600,height=700,scrollbars=yes,resizable=yes');
        if (!popup) {
            setError('Could not open popup. Please allow popups for this site and try again.');
            return;
        }
        setConsentWindow(popup);
        setStep('consent_pending');
        popup.focus();
    };

    const runCallback = async () => {
        setStep('callback');
        setError(null);
        await new Promise(r => setTimeout(r, 1000));
        const state = consentStateRef.current;
        const query = state ? `?state=${encodeURIComponent(state)}` : '';
        const res = await request(`${CONSENT_CALLBACK}${query}`);
        if (res !== undefined) {
            setStep('done');
            setTimeout(() => router.push('/onboarding/success'), 2000);
        } else {
            setStep('error');
            setError('Onboarding callback failed. Please try again.');
        }
    };

    return (
        <OnboardingSignInGate>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto h-14 w-14 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <Server className="h-7 w-7 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Connect your tenant</h1>
                    <p className="text-sm text-muted-foreground">
                        Step 3 of 3 — Approve read-only access so IntuneAssistant can show you your tenant.
                    </p>
                </div>

                <OnboardingSteps current={3} />

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                    <div className="rounded-lg bg-muted/40 p-4 space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Tenant ID:</span> <code className="font-mono text-xs">{tenantId}</code></p>
                        <p><span className="text-muted-foreground">Domain:</span> {domain}</p>
                    </div>

                    {step === 'loading' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Getting things ready…
                        </div>
                    )}

                    {step === 'ready' && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Click below to open a Microsoft window. Sign in as a <strong>Global Administrator</strong> of your tenant and approve the read-only permissions. IntuneAssistant never changes anything in your tenant.
                            </p>
                            <Button onClick={openConsent} className="w-full">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Approve read-only access
                            </Button>
                        </div>
                    )}

                    {step === 'consent_pending' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Waiting for your approval in the Microsoft window…
                        </div>
                    )}

                    {step === 'callback' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Finalising setup…
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            Tenant connected! Redirecting…
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="space-y-3">
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                    <XCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}
                            <Button variant="outline" onClick={buildConsentUrl} className="w-full">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try again
                            </Button>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Signed in as <strong>{account?.username}</strong>
                </p>
            </div>
        </div>
        </OnboardingSignInGate>
    );
}
