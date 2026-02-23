'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    AUDIT_EVENT_PAGE_ENDPOINT,
    AUDIT_EVENT_STATS_ENDPOINT
} from '@/lib/constants';
import {
    AuditEvent,
    AuditEventPageResponse,
    AuditStatistics,
    AuditStatisticsResponse
} from '@/types/auditEvents';

interface AuditEventsContextType {
    statistics: AuditStatistics | null;
    recentEvents: AuditEvent[];
    loading: boolean;
    error: string | null;
    fetchData: (filterType?: 'all' | 'failures' | 'hour' | 'day', activity?: string, actor?: string, silent?: boolean) => Promise<void>;
    clearCache: () => void;
}

const AuditEventsContext = createContext<AuditEventsContextType>({
    statistics: null,
    recentEvents: [],
    loading: false,
    error: null,
    fetchData: async () => {},
    clearCache: () => {}
});

export const useAuditEvents = () => {
    const context = useContext(AuditEventsContext);
    if (!context) {
        throw new Error('useAuditEvents must be used within AuditEventsProvider');
    }
    return context;
};

interface AuditEventsProviderProps {
    children: ReactNode;
}

export const AuditEventsProvider: React.FC<AuditEventsProviderProps> = ({ children }) => {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
    const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (
        filterType: 'all' | 'failures' | 'hour' | 'day' = 'day',
        activity?: string,
        actor?: string,
        silent = false
    ) => {
        if (!accounts.length) return;

        if (!silent) {
            setLoading(true);
        }
        setError(null);

        try {
            // Calculate date range based on filter
            const now = new Date();
            const dateFrom = new Date();

            if (filterType === 'hour') {
                dateFrom.setHours(now.getHours() - 1);
            } else {
                dateFrom.setHours(now.getHours() - 24);
            }

            // Common params
            const commonParams: Record<string, string> = {
                dateFrom: dateFrom.toISOString(),
                dateTo: now.toISOString()
            };

            if (activity && activity !== 'all') commonParams['activityType'] = activity;
            if (actor && actor !== 'all') commonParams['actorUserPrincipalName'] = actor;

            // Fetch statistics
            const statsParams = new URLSearchParams(commonParams);

            const statsResponse = await request<AuditStatisticsResponse>(
                `${AUDIT_EVENT_STATS_ENDPOINT}?${statsParams.toString()}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            if (statsResponse?.data) {
                setStatistics(statsResponse.data);
            }

            // Fetch recent events
            const eventsParams = new URLSearchParams({
                ...commonParams,
                pageNumber: '1',
                pageSize: '10'
            });

            if (filterType === 'failures') {
                eventsParams.append('result', 'Failure');
            }

            const eventsResponse = await request<AuditEventPageResponse>(
                `${AUDIT_EVENT_PAGE_ENDPOINT}?${eventsParams.toString()}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            if (eventsResponse?.data?.items) {
                // Sort events by activityDateTime, newest first
                const sortedEvents = [...eventsResponse.data.items].sort((a, b) =>
                    new Date(b.activityDateTime).getTime() - new Date(a.activityDateTime).getTime()
                );
                setRecentEvents(sortedEvents);
            }
        } catch (err) {
            console.error('Failed to fetch audit data:', err);
            if (!silent) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [accounts.length, request]);

    const clearCache = useCallback(() => {
        setStatistics(null);
        setRecentEvents([]);
        setError(null);
    }, []);

    const value = useMemo(() => ({
        statistics,
        recentEvents,
        loading,
        error,
        fetchData,
        clearCache
    }), [statistics, recentEvents, loading, error, fetchData, clearCache]);

    return (
        <AuditEventsContext.Provider value={value}>
            {children}
        </AuditEventsContext.Provider>
    );
};
