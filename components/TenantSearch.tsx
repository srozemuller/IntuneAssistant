// components/TenantSearch.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTenantOverview, formatRelativeTime } from '@/contexts/TenantOverviewContext';
import { FileText, GitBranch, Loader2, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_PER_GROUP = 15;

/** Matches every whitespace-separated token as a case-insensitive substring of the joined fields. */
function matches(fields: Array<string | null | undefined>, tokens: string[]): boolean {
    if (tokens.length === 0) return false;
    const haystack = fields.filter(Boolean).join(' ').toLowerCase();
    return tokens.every(t => haystack.includes(t));
}

/**
 * Global search over the cached tenant overview: configurations (every family) and assignment rows, from any
 * page, without a network call. Opens with Cmd/Ctrl+K or a dispatched `ia:open-tenant-search` event; a result
 * navigates to the page that owns it with the search prefilled (`?q=`).
 *
 * Inert (both triggers no-op, dialog never opens) until `useTenantOverview().isEnabled` — true for any
 * signed-in account with a connected tenant — and until the first successful stream has populated the
 * cache; see `contexts/TenantOverviewContext.tsx` for why a stream can currently stay idle indefinitely.
 */
export function TenantSearch() {
    const router = useRouter();
    const { accounts } = useMsal();
    const { isEnabled, allItems, assignments, fetchedAt, phase, totalCount, refresh } = useTenantOverview();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    // Both triggers are inert when the tenant overview is not available to this customer (beta channel).
    useEffect(() => {
        if (!isEnabled) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setOpen(o => !o);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isEnabled]);

    useEffect(() => {
        if (!isEnabled) return;
        const onOpen = () => setOpen(true);
        window.addEventListener('ia:open-tenant-search', onOpen);
        return () => window.removeEventListener('ia:open-tenant-search', onOpen);
    }, [isEnabled]);

    const tokens = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);

    const configurationHits = useMemo(() => {
        if (tokens.length === 0) return [];
        const hits = [];
        for (const item of allItems) {
            if (matches([item.name, item.description, item.platform, item.policySubType, item.policyType], tokens)) {
                hits.push(item);
                if (hits.length >= MAX_PER_GROUP) break;
            }
        }
        return hits;
    }, [allItems, tokens]);

    const assignmentHits = useMemo(() => {
        if (tokens.length === 0 || !assignments) return [];
        const hits = [];
        for (const row of assignments) {
            if (matches([row.resourceName, row.targetName, row.assignmentType, row.resourceType, row.platform], tokens)) {
                hits.push(row);
                if (hits.length >= MAX_PER_GROUP) break;
            }
        }
        return hits;
    }, [assignments, tokens]);

    const go = (href: string) => {
        setOpen(false);
        setQuery('');
        router.push(href);
    };

    if (accounts.length === 0 || !isEnabled) return null;

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title="Search tenant"
            description="Search configurations and assignments from the cached tenant overview"
            className="sm:max-w-2xl"
            shouldFilter={false}
        >
            <CommandInput
                placeholder="Search configurations and assignments…"
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="max-h-[60vh]">
                {tokens.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {phase === 'streaming' && totalCount === 0
                            ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading the tenant overview…</span>
                            : `Type to search ${totalCount} configurations${assignments ? ` and ${assignments.length} assignments` : ''}.`}
                    </div>
                )}
                {tokens.length > 0 && configurationHits.length === 0 && assignmentHits.length === 0 && (
                    <CommandEmpty>Nothing in the cached overview matches.</CommandEmpty>
                )}

                {configurationHits.length > 0 && (
                    <CommandGroup heading="Configurations">
                        {configurationHits.map(item => (
                            <CommandItem
                                key={`cfg-${item.id}`}
                                value={`cfg-${item.id}`}
                                onSelect={() => go(`/overview?q=${encodeURIComponent(item.name ?? item.id)}`)}
                            >
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="flex-1 truncate">{item.name || item.id}</span>
                                {item.platform && <Badge variant="outline" className="text-xs">{item.platform}</Badge>}
                                <span className="text-xs text-gray-500">{item.policyType}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {assignmentHits.length > 0 && (
                    <>
                        {configurationHits.length > 0 && <CommandSeparator />}
                        <CommandGroup heading="Assignments">
                            {assignmentHits.map((row, index) => (
                                <CommandItem
                                    key={`asg-${row.resourceId}-${row.targetId ?? 'none'}-${index}`}
                                    value={`asg-${row.resourceId}-${row.targetId ?? 'none'}-${index}`}
                                    onSelect={() => go(`/assistant/assignments-overview?q=${encodeURIComponent(row.resourceName ?? '')}`)}
                                >
                                    <GitBranch className="h-4 w-4 text-gray-500" />
                                    <span className="truncate">{row.resourceName}</span>
                                    <span className={cn('text-xs', row.isExcluded ? 'text-red-600' : 'text-gray-500')}>
                                        {row.isExcluded ? 'excluded from' : 'to'} {row.targetName}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>

            <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <span>
                    {phase === 'streaming'
                        ? 'Overview is still loading; results grow as families arrive'
                        : fetchedAt !== null ? `Data collected ${formatRelativeTime(fetchedAt)}` : 'No overview loaded yet'}
                </span>
                <Button variant="ghost" size="sm" className="h-7" onClick={refresh} disabled={phase === 'streaming'}>
                    <RefreshCw className={cn('mr-1 h-3.5 w-3.5', phase === 'streaming' && 'animate-spin')} />
                    Refresh
                </Button>
            </div>
        </CommandDialog>
    );
}

/** Sidebar-style trigger button. Dispatches a window event so the dialog can live once, in the layout. */
export function TenantSearchTrigger({ collapsed }: { collapsed: boolean }) {
    const { accounts } = useMsal();
    if (accounts.length === 0) return null;

    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('ia:open-tenant-search'))}
            className={cn(
                'mb-4 flex items-center gap-2 rounded-md border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800',
                collapsed ? 'h-10 w-10 justify-center' : 'w-full px-3 py-2'
            )}
            aria-label="Search tenant"
        >
            <Search className="h-4 w-4" />
            {!collapsed && (
                <>
                    <span className="flex-1 text-left">Search tenant…</span>
                    <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700">⌘K</kbd>
                </>
            )}
        </button>
    );
}
