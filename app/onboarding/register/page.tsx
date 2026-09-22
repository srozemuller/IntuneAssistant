'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import { Building2, Loader2, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiRequest } from '@/hooks/useApiRequest';
import { CUSTOMER_ENDPOINT } from '@/lib/constants';
import { OnboardingSignInGate } from '@/components/onboarding/sign-in-gate';
import { OnboardingSteps } from '@/components/onboarding/onboarding-steps';

export default function RegisterPage() {
    const { accounts } = useMsal();
    const router = useRouter();
    const { request } = useApiRequest();

    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const domain = accounts[0]?.username?.split('@')[1];
        if (domain) setName(domain);
    }, [accounts]);

    const nameError = touched && !name.trim() ? 'Company or display name is required' : null;
    const canSubmit = name.trim() && !saving;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (!name.trim()) return;
        setSaving(true);
        setError(null);
        const result = await request(CUSTOMER_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() }),
        });
        // useApiRequest catches errors and returns undefined — only navigate on success
        if (result !== undefined) {
            router.push('/onboarding/tenant');
        } else {
            setSaving(false);
        }
    };

    return (
        <OnboardingSignInGate>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto h-14 w-14 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <Building2 className="h-7 w-7 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                    <p className="text-sm text-muted-foreground">
                        Step 2 of 3 — Choose a name for your account.
                    </p>
                </div>

                <OnboardingSteps current={2} />

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Account name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onBlur={() => setTouched(true)}
                                placeholder="e.g. Contoso Ltd"
                                className={nameError ? 'border-red-400 focus-visible:ring-red-400' : ''}
                                autoFocus
                            />
                            {nameError
                                ? <p className="text-xs text-red-600">{nameError}</p>
                                : <p className="text-xs text-muted-foreground">Just a label for you. We suggest your organization&apos;s domain.</p>
                            }
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                <XCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={!canSubmit} className="w-full">
                            {saving
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</>
                                : <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>
                            }
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Signed in as <strong>{accounts[0]?.username}</strong>
                </p>
            </div>
        </div>
        </OnboardingSignInGate>
    );
}
