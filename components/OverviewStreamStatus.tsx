// components/OverviewStreamStatus.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTenantOverview, formatRelativeTime } from '@/contexts/TenantOverviewContext';
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Loader2,
    RefreshCw,
    X,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OverviewStep } from '@/types/tenantOverview';

// How long the panel stays open after a clean run before folding itself away.
const AUTO_HIDE_AFTER_MS = 8_000;

function StepIcon({ status }: { status: OverviewStep['status'] }) {
    switch (status) {
        case 'loading':
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case 'completed':
            return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />;
        case 'failed':
            return <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />;
        default:
            return <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />;
    }
}

/**
 * Floating bottom-right panel that mirrors the tenant overview stream: one row per resource family with its
 * live state, a progress bar while streaming, and the collected-at time + refresh once done. Renders nothing
 * on its own for an account the backend hasn't opened the beta rollout for — `useTenantOverview().phase`
 * simply stays `'idle'` (see `contexts/TenantOverviewContext.tsx`'s 403 handling).
 */
export function OverviewStreamStatus() {
    const { accounts } = useMsal();
    const {
        phase,
        steps,
        fetchedAt,
        progress,
        error,
        warnings,
        isStatusVisible,
        hideStatus,
        refresh,
        cancel,
    } = useTenantOverview();
    const [collapsed, setCollapsed] = useState(false);

    // Fold away after a clean completion; stay open when something failed so the admin sees it.
    useEffect(() => {
        if (phase !== 'completed' || warnings.length > 0) return;
        const timer = setTimeout(hideStatus, AUTO_HIDE_AFTER_MS);
        return () => clearTimeout(timer);
    }, [phase, warnings.length, hideStatus]);

    useEffect(() => {
        if (phase === 'streaming') setCollapsed(false);
    }, [phase]);

    if (accounts.length === 0 || !isStatusVisible || phase === 'idle') return null;

    const completed = steps.filter(s => s.status === 'completed').length;
    const failed = steps.filter(s => s.status === 'failed').length;
    const percent = Math.round(progress * 100);

    const title = phase === 'streaming'
        ? 'Loading tenant overview'
        : phase === 'failed'
            ? 'Tenant overview failed'
            : failed > 0
                ? 'Tenant overview loaded with errors'
                : 'Tenant overview ready';

    return (
        <div
            className="fixed bottom-4 right-4 z-40 w-[22rem] max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
            role="status"
            aria-live="polite"
        >
            <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div className="mt-0.5">
                    {phase === 'streaming' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                    {phase === 'completed' && failed === 0 && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />}
                    {phase === 'completed' && failed > 0 && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                    {phase === 'failed' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {phase === 'streaming' && `${completed} of ${Math.max(steps.length, 1)} resource types loaded`}
                        {phase === 'completed' && fetchedAt !== null && `Data collected ${formatRelativeTime(fetchedAt)}`}
                        {phase === 'failed' && (error ?? 'Something went wrong while streaming')}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {phase !== 'streaming' && (
                        <span title="Refresh data">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh} aria-label="Refresh tenant overview">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </span>
                    )}
                    <span title={collapsed ? 'Expand' : 'Collapse'}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand status' : 'Collapse status'}>
                            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </span>
                    <span title="Hide">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={hideStatus} aria-label="Hide status">
                            <X className="h-4 w-4" />
                        </Button>
                    </span>
                </div>
            </div>

            {phase === 'streaming' && (
                <div className="px-4 pt-3">
                    <Progress value={percent} className="h-1.5" />
                </div>
            )}

            {!collapsed && (
                <div className="max-h-72 overflow-y-auto px-2 py-2">
                    <ul className="space-y-0.5">
                        {steps.map(step => (
                            <li
                                key={step.stepIndex}
                                className={cn(
                                    'flex items-center gap-2 rounded px-2 py-1 text-xs',
                                    step.status === 'failed' && 'bg-red-50 dark:bg-red-950/40'
                                )}
                            >
                                <StepIcon status={step.status} />
                                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{step.step}</span>
                                {step.status === 'completed' && typeof step.itemCount === 'number' && step.stepIndex !== 0 && (
                                    <span className="tabular-nums text-gray-500 dark:text-gray-400">{step.itemCount}</span>
                                )}
                                {step.status === 'failed' && step.error && (
                                    <span className="max-w-[9rem] truncate text-red-600 dark:text-red-400" title={step.error}>{step.error}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs dark:border-gray-800">
                <Link href="/overview" className="text-blue-600 hover:underline dark:text-blue-400">
                    Open overview
                </Link>
                {phase === 'streaming' && (
                    <button type="button" onClick={cancel} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
