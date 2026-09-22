'use client';

import { ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { LogIn, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginRequest } from '@/lib/msalConfig';
import { OnboardingSteps } from '@/components/onboarding/onboarding-steps';

// Onboarding pages are public deep-link targets (docs and the landing page send people straight
// to /onboarding/register), so a visitor is often not signed in yet. Every API call behind these
// pages needs a bearer token, so without this gate the first thing a new user sees is a 401.
// Signing in also triggers the first consent (the IntuneAssistant sign-in app) — that is
// deliberately step 1 of the flow, before the customer record and the tenant admin consent.
export function OnboardingSignInGate({ children }: { children: ReactNode }) {
    const { instance, accounts, inProgress } = useMsal();

    if (accounts.length > 0) {
        return <>{children}</>;
    }

    const busy = inProgress !== InteractionStatus.None;

    const signIn = () => {
        // loginRequest carries the API scope so the token needed by the next steps is consented
        // up front. MSAL returns to the page that started the login once /auth/verify has
        // processed the response.
        instance.loginRedirect(loginRequest);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto h-14 w-14 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <LogIn className="h-7 w-7 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Sign in to get started</h1>
                    <p className="text-sm text-muted-foreground">
                        Step 1 of 3 — Sign in with the Microsoft work account of the tenant you want to onboard.
                    </p>
                </div>

                <OnboardingSteps current={1} />

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                    <p className="text-sm text-muted-foreground">
                        IntuneAssistant needs to know who you are before it can create your account and connect your tenant.
                    </p>

                    <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            <strong>First time here?</strong> Microsoft will ask you to accept the <strong>IntuneAssistant</strong> application.
                            That only lets you sign in. Access to your tenant is approved separately in step 3, and it is read-only.
                        </p>
                    </div>

                    <Button onClick={signIn} disabled={busy} className="w-full">
                        {busy
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</>
                            : <><LogIn className="h-4 w-4 mr-2" />Sign in with Microsoft</>
                        }
                    </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    After signing in you return to this page to continue with step 2.
                </p>
            </div>
        </div>
    );
}
