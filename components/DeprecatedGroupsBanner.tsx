'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useDeprecatedGroups } from '@/hooks/useDeprecatedGroups';
import { describeDays } from '@/lib/deprecationRadar';

interface Props {
    /** The group ids the page is currently listing as assignment targets; anything else (null, All users, a policy id) is ignored. */
    targetIds: ReadonlyArray<string | null | undefined>;
    className?: string;
}

const NAMES_SHOWN = 3;

/**
 * Above an assignments table: how many of the groups in these assignments use something Microsoft stops supporting, and the first
 * deadline. The per-group detail sits under each group (DeprecatedGroupNotice); this is the page-level notification. Renders nothing
 * when none of the listed groups is affected.
 */
export function DeprecatedGroupsBanner({ targetIds, className }: Props) {
    const groups = useDeprecatedGroups();

    const affected = useMemo(() => {
        const seen = new Map<string, { name: string; deadline?: string | null; daysRemaining?: number | null }>();
        if (groups.size === 0) return [];
        for (const id of targetIds) {
            const finding = id ? groups.get(id.toLowerCase()) : undefined;
            if (finding && !seen.has(finding.groupId)) seen.set(finding.groupId, { name: finding.groupName, deadline: finding.deadline, daysRemaining: finding.daysRemaining });
        }
        return [...seen.values()];
    }, [groups, targetIds]);

    if (affected.length === 0) return null;

    const dated = affected.filter(a => a.deadline).sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
    const first = dated[0];
    const names = affected.slice(0, NAMES_SHOWN).map(a => a.name).join(', ');
    const more = affected.length > NAMES_SHOWN ? ` and ${affected.length - NAMES_SHOWN} more` : '';

    return (
        <div role="status" className={`flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300 ${className ?? ''}`}>
            <span className="mt-0.5 shrink-0"><AlertTriangle className="h-4 w-4" /></span>
            <span>
                <span className="font-medium">
                    {affected.length === 1 ? '1 group in these assignments is' : `${affected.length} groups in these assignments are`} no longer supported
                    {first?.deadline ? ` after ${first.deadline}${first.daysRemaining != null ? ` (${describeDays(first.daysRemaining)})` : ''}` : ''}.
                </span>{' '}
                {names}{more}.{' '}
                <Link href="/analyzer/deprecations" className="underline">See what depends on them</Link>
            </span>
        </div>
    );
}
