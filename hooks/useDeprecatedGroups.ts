// hooks/useDeprecatedGroups.ts
'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useMsal } from '@azure/msal-react';
import { quietGet } from '@/lib/quietApi';
import { DEPRECATION_RADAR_GROUPS_ENDPOINT } from '@/lib/constants';
import type { DeprecatedGroup, DeprecatedGroups } from '@/lib/deprecationRadar';

/**
 * The groups Microsoft is about to stop supporting, for the warning next to a group in the assignment views.
 *
 * It is a decoration on pages that have their own job, so it is deliberately quiet (see quietGet): when the call fails the pages
 * simply show no warning. One request per tenant is shared by every cell on the page and reused for a few minutes.
 */
const MAX_AGE_MS = 5 * 60 * 1000;

interface Snapshot { groups: ReadonlyMap<string, DeprecatedGroup>; loadedAt: number }
interface Entry { snapshot: Snapshot; listeners: Set<() => void>; inFlight: boolean }

const EMPTY: Snapshot = { groups: new Map(), loadedAt: 0 };
const entries = new Map<string, Entry>();

function entryFor(tenantKey: string): Entry {
    let entry = entries.get(tenantKey);
    if (!entry) { entry = { snapshot: EMPTY, listeners: new Set(), inFlight: false }; entries.set(tenantKey, entry); }
    return entry;
}

export function useDeprecatedGroups(): ReadonlyMap<string, DeprecatedGroup> {
    const { instance, accounts } = useMsal();
    const tenantKey = 'home'; // the community edition has no tenant switching
    const entry = entryFor(tenantKey);
    const account = accounts[0];

    const subscribe = useCallback((listener: () => void) => {
        const current = entryFor(tenantKey);
        current.listeners.add(listener);
        return () => { current.listeners.delete(listener); };
    }, [tenantKey]);
    const snapshot = useSyncExternalStore(subscribe, () => entryFor(tenantKey).snapshot, () => EMPTY);

    useEffect(() => {
        const current = entryFor(tenantKey);
        if (!account || current.inFlight || Date.now() - current.snapshot.loadedAt < MAX_AGE_MS) return;
        current.inFlight = true;
        (async () => {
            const result = await quietGet<DeprecatedGroups>(instance, account, DEPRECATION_RADAR_GROUPS_ENDPOINT, undefined);
            const groups = new Map<string, DeprecatedGroup>();
            for (const g of result?.groups ?? []) groups.set(g.groupId.toLowerCase(), g);
            current.snapshot = { groups, loadedAt: Date.now() };
            current.inFlight = false;
            current.listeners.forEach(l => l());
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantKey, account, entry.snapshot.loadedAt]);

    return snapshot.groups;
}
