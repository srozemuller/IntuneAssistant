'use client';
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useDeprecatedGroups } from '@/hooks/useDeprecatedGroups';
import { describeDays } from '@/lib/deprecationRadar';

interface Props {
    groupId?: string | null;
}

/**
 * Under a group in the assignment views: this group uses something Microsoft stops supporting (today, a memberOf dynamic group rule),
 * so the admin sees it next to the assignment that depends on it. Renders nothing for any other group.
 */
export function DeprecatedGroupNotice({ groupId }: Props) {
    const groups = useDeprecatedGroups();
    const finding = groupId ? groups.get(groupId.toLowerCase()) : undefined;
    if (!finding) return null;

    const expired = finding.daysRemaining != null && finding.daysRemaining < 0;
    const when = finding.deadline
        ? `${expired ? 'No longer supported since' : 'Not supported after'} ${finding.deadline}${finding.daysRemaining != null ? ` (${describeDays(finding.daysRemaining)})` : ''}`
        : 'Deprecated';

    return (
        <div className="flex items-start gap-1 text-xs text-amber-600 dark:text-amber-400 whitespace-normal">
            <span title={finding.message} className="mt-0.5 shrink-0">
                <AlertTriangle className="h-3 w-3" />
            </span>
            <span title={finding.message}>
                <span className="font-medium">{when}</span>
                <span className="block text-gray-500 dark:text-gray-400">{finding.title}</span>
                <span className="flex flex-wrap gap-x-3">
                    <Link href="/settings-library/impact?tab=objects" className="underline">See what depends on it</Link>
                    {finding.infoUrl && (
                        <a href={finding.infoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline">
                            Microsoft&apos;s information <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </span>
            </span>
        </div>
    );
}
