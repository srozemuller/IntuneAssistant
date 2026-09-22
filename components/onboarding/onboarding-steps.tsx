'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OnboardingStep = 1 | 2 | 3;

const STEPS: { step: OnboardingStep; label: string }[] = [
    { step: 1, label: 'Sign in' },
    { step: 2, label: 'Create account' },
    { step: 3, label: 'Connect tenant' },
];

// Shared progress indicator for the onboarding pages, so a visitor who deep-links into
// /onboarding/register or /onboarding/tenant always sees where they are and what comes first.
export function OnboardingSteps({ current }: { current: OnboardingStep }) {
    return (
        <ol className="flex items-center justify-center gap-2 text-xs" aria-label="Onboarding progress">
            {STEPS.map(({ step, label }, i) => {
                const done = step < current;
                const active = step === current;
                return (
                    <li key={step} className="flex items-center gap-2">
                        <span
                            className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full border font-semibold',
                                done && 'border-green-600 bg-green-600 text-white',
                                active && 'border-blue-600 bg-blue-600 text-white',
                                !done && !active && 'border-border text-muted-foreground',
                            )}
                            aria-current={active ? 'step' : undefined}
                        >
                            {done ? <Check className="h-3.5 w-3.5" /> : step}
                        </span>
                        <span className={cn(active ? 'font-semibold' : 'text-muted-foreground')}>{label}</span>
                        {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" aria-hidden="true" />}
                    </li>
                );
            })}
        </ol>
    );
}
