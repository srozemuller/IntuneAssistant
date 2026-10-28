'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMsal } from '@azure/msal-react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEPRECATION_RADAR_ENDPOINT } from '@/lib/constants';
import { DeprecationFindings, OBJECT_TYPE_LABEL, describeDays } from '@/lib/deprecationRadar';
import { quietGet } from '@/lib/quietApi';

const TOP_FINDINGS = 5;
const DUE_SOON_DAYS = 30;

interface Props {
    /**
     * Load only when the overview collection has finished. The radar reads the assignment rows through the same provider, which serves
     * the collection that just completed; asked earlier, it would start a second collection of the same tenant.
     */
    enabled: boolean;
}

/** The "Deprecated" section of the Tenant Overview: what Microsoft is about to stop supporting here, with a way into the full list. */
export function DeprecationOverviewCard({ enabled }: Props) {
    const { instance, accounts } = useMsal();
    const tenantKey = 'home'; // the community edition has no tenant switching
    const account = accounts[0];
    const [result, setResult] = useState<DeprecationFindings | null | undefined>(undefined);

    useEffect(() => {
        if (!enabled || !account) return;
        let cancelled = false;
        setResult(undefined);
        quietGet<DeprecationFindings>(instance, account, DEPRECATION_RADAR_ENDPOINT, undefined).then(r => { if (!cancelled) setResult(r); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, tenantKey, account]);

    // Nothing to say while loading or when the radar is unavailable: the overview must not look broken because of a side card.
    if (!enabled || !result) return null;

    const findings = result.findings;
    const dueSoon = findings.filter(f => f.daysRemaining != null && f.daysRemaining <= DUE_SOON_DAYS).length;
    const undated = findings.filter(f => f.daysRemaining == null).length;

    if (findings.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-800">
                <CardContent className="flex items-center gap-2 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Deprecated: nothing found. No group or filter uses something Microsoft is retiring.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="h-5 w-5 text-amber-500" /> Deprecated
                        </CardTitle>
                        <CardDescription>Objects Microsoft is about to stop supporting, and how much depends on them.</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {dueSoon > 0 && <Badge variant="outline" className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-[11px]">{dueSoon} due within {DUE_SOON_DAYS} days</Badge>}
                        {undated > 0 && <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px]">{undated} without a date</Badge>}
                        <Button asChild variant="outline" size="sm"><Link href="/analyzer/deprecations">View all {findings.length}</Link></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {result.warnings.map(w => (
                    <div key={`${w.code}-${w.message}`} className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w.message}
                    </div>
                ))}
                {findings.slice(0, TOP_FINDINGS).map(f => (
                    <div key={`${f.ruleId}-${f.objectId}`} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                        <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{f.objectName}</span>
                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{OBJECT_TYPE_LABEL[f.objectType]} · {f.ruleTitle}</span>
                        </span>
                        <Badge variant="outline" className="shrink-0 text-[11px]">
                            {f.deadline ? `${f.deadline}${f.daysRemaining != null ? ` · ${describeDays(f.daysRemaining)}` : ''}` : 'No date published'}
                        </Badge>
                        <Badge variant="outline" className="shrink-0 text-[11px]">{f.consumers.length} consumer{f.consumers.length === 1 ? '' : 's'}</Badge>
                    </div>
                ))}
                {findings.length > TOP_FINDINGS && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">And {findings.length - TOP_FINDINGS} more in the full list.</p>
                )}
            </CardContent>
        </Card>
    );
}
