'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    AUDIT_LOGS_INTUNE_EVENTS,
    AUDIT_LOGS_INTUNE_FILTER
} from '@/lib/constants';
import {
    AuditEvent,
    AuditStatistics
} from '@/types/auditEvents';

interface AuditEventsContextType {
    statistics: AuditStatistics | null;
    recentEvents: AuditEvent[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    nextPageToken: string | null;
    fetchData: (filterType?: 'all' | 'failures' | 'hour' | 'day', activity?: string, actor?: string, silent?: boolean) => Promise<void>;
    loadMore: () => Promise<void>;
    clearCache: () => void;
}

const AuditEventsContext = createContext<AuditEventsContextType>({
    statistics: null,
    recentEvents: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    nextPageToken: null,
    fetchData: async () => {},
    loadMore: async () => {},
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
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [lastFetchParams, setLastFetchParams] = useState<{
        filterType: 'all' | 'failures' | 'hour' | 'day';
        activity?: string;
        actor?: string;
    }>({ filterType: 'day' });

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
            // Build query params
            const params = new URLSearchParams({
                pageSize: '100' // Get more events for statistics calculation
            });

            // Use filter endpoint if we need filtering
            const shouldFilter = filterType === 'failures' || (activity && activity !== 'all') || (actor && actor !== 'all');
            const endpoint = shouldFilter ? AUDIT_LOGS_INTUNE_FILTER : AUDIT_LOGS_INTUNE_EVENTS;

            // Add filter params if using filter endpoint
            if (shouldFilter) {
                if (filterType === 'failures') {
                    params.append('activityResult', 'Failure');
                }
                if (activity && activity !== 'all') {
                    params.append('activityType', activity);
                }
                if (actor && actor !== 'all') {
                    params.append('actorUserPrincipalName', actor);
                }
            }

            const response = await request<{
                status: number;
                message: string;
                details: string[];
                data: {
                    items: AuditEvent[];
                    totalCount: number;
                    hasMore: boolean;
                    nextPageToken: string | null;
                    errorMessage: string | null;
                };
            }>(
                `${endpoint}?${params.toString()}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            // Unwrap ApiResponseWithCorrelation → response.data is the envelope, response.data.data.items is the events array
            const envelope = response?.data;
            if (envelope?.status === 0 && envelope.data?.items) {
                const events = envelope.data.items;

                // Filter by time if needed
                const now = new Date();
                let filteredEvents = events;

                if (filterType === 'hour') {
                    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                    filteredEvents = events.filter(e => new Date(e.activityDateTime) >= oneHourAgo);
                } else if (filterType === 'day') {
                    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    filteredEvents = events.filter(e => new Date(e.activityDateTime) >= oneDayAgo);
                }

                // Calculate statistics from events
                const totalEvents = filteredEvents.length;
                const oldestEvent = filteredEvents.length > 0
                    ? new Date(Math.min(...filteredEvents.map(e => new Date(e.activityDateTime).getTime()))).toISOString()
                    : new Date().toISOString();
                const newestEvent = filteredEvents.length > 0
                    ? new Date(Math.max(...filteredEvents.map(e => new Date(e.activityDateTime).getTime()))).toISOString()
                    : new Date().toISOString();

                // Group by category
                const eventsByCategory: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
                });

                // Group by activity type
                const eventsByActivityType: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    eventsByActivityType[event.activityType] = (eventsByActivityType[event.activityType] || 0) + 1;
                });

                // Group by component
                const eventsByComponent: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    eventsByComponent[event.componentName] = (eventsByComponent[event.componentName] || 0) + 1;
                });

                // Group by actor
                const eventsByActor: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    if (event.actorUserPrincipalName) {
                        eventsByActor[event.actorUserPrincipalName] = (eventsByActor[event.actorUserPrincipalName] || 0) + 1;
                    }
                });

                // Group by result
                const eventsByResult: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    eventsByResult[event.activityResult] = (eventsByResult[event.activityResult] || 0) + 1;
                });

                // Group by hour for timeline
                const eventsByHour: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    const hour = new Date(event.activityDateTime).getHours();
                    eventsByHour[hour] = (eventsByHour[hour] || 0) + 1;
                });

                // Group by day for timeline
                const eventsByDay: Record<string, number> = {};
                filteredEvents.forEach(event => {
                    const day = new Date(event.activityDateTime).toISOString().split('T')[0];
                    eventsByDay[day] = (eventsByDay[day] || 0) + 1;
                });

                // Most active users with proper structure
                const userActivity: Record<string, { userId: string; activities: string[] }> = {};
                filteredEvents.forEach(event => {
                    if (event.actorUserPrincipalName) {
                        if (!userActivity[event.actorUserPrincipalName]) {
                            userActivity[event.actorUserPrincipalName] = {
                                userId: event.actorUserId || '',
                                activities: []
                            };
                        }
                        if (!userActivity[event.actorUserPrincipalName].activities.includes(event.displayName)) {
                            userActivity[event.actorUserPrincipalName].activities.push(event.displayName);
                        }
                    }
                });
                const mostActiveUsers = Object.entries(userActivity)
                    .map(([userPrincipalName, data]) => ({
                        userPrincipalName,
                        userId: data.userId,
                        eventCount: filteredEvents.filter(e => e.actorUserPrincipalName === userPrincipalName).length,
                        topActivities: data.activities.slice(0, 5)
                    }))
                    .sort((a, b) => b.eventCount - a.eventCount)
                    .slice(0, 10);

                // Top activities with category
                const activityCounts: Record<string, { category: string; count: number }> = {};
                filteredEvents.forEach(event => {
                    if (!activityCounts[event.displayName]) {
                        activityCounts[event.displayName] = { category: event.category, count: 0 };
                    }
                    activityCounts[event.displayName].count++;
                });
                const topActivities = Object.entries(activityCounts)
                    .map(([activity, data]) => ({
                        activity,
                        category: data.category,
                        count: data.count
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                // Set statistics
                setStatistics({
                    totalEvents,
                    oldestEvent,
                    newestEvent,
                    eventsByCategory,
                    eventsByActivityType,
                    eventsByComponent,
                    eventsByActor,
                    eventsByResult,
                    timeline: {
                        eventsByDay,
                        eventsByHour
                    },
                    mostActiveUsers,
                    topActivities
                });

                // Set recent events (sorted by time, newest first)
                const sortedEvents = [...filteredEvents]
                    .sort((a, b) => new Date(b.activityDateTime).getTime() - new Date(a.activityDateTime).getTime());
                setRecentEvents(sortedEvents);

                // Store pagination info
                setHasMore(envelope.data.hasMore || false);
                setNextPageToken(envelope.data.nextPageToken || null);

                // Store fetch params for loadMore
                setLastFetchParams({ filterType, activity, actor });
            } else {
                throw new Error(envelope?.message || 'Failed to fetch audit events');
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

    const loadMore = useCallback(async () => {
        if (!nextPageToken || !accounts.length || loadingMore) return;

        setLoadingMore(true);
        setError(null);

        try {
            const { filterType, activity, actor } = lastFetchParams;

            // Build query params with skipToken
            const params = new URLSearchParams({
                pageSize: '100',
                skipToken: nextPageToken
            });

            // Use filter endpoint if we need filtering
            const shouldFilter = filterType === 'failures' || (activity && activity !== 'all') || (actor && actor !== 'all');
            const endpoint = shouldFilter ? AUDIT_LOGS_INTUNE_FILTER : AUDIT_LOGS_INTUNE_EVENTS;

            // Add filter params if using filter endpoint
            if (shouldFilter) {
                if (filterType === 'failures') {
                    params.append('activityResult', 'Failure');
                }
                if (activity && activity !== 'all') {
                    params.append('activityType', activity);
                }
                if (actor && actor !== 'all') {
                    params.append('actorUserPrincipalName', actor);
                }
            }

            const response = await request<{
                status: number;
                message: string;
                details: string[];
                data: {
                    items: AuditEvent[];
                    totalCount: number;
                    hasMore: boolean;
                    nextPageToken: string | null;
                    errorMessage: string | null;
                };
            }>(
                `${endpoint}?${params.toString()}`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            // Unwrap ApiResponseWithCorrelation
            const envelope = response?.data;
            if (envelope?.status === 0 && envelope.data?.items) {
                const newEvents = envelope.data.items;

                // Append new events to existing ones (avoiding duplicates)
                const existingIds = new Set(recentEvents.map(e => e.id));
                const uniqueNewEvents = newEvents.filter(e => !existingIds.has(e.id));

                const updatedEvents = [...recentEvents, ...uniqueNewEvents]
                    .sort((a, b) => new Date(b.activityDateTime).getTime() - new Date(a.activityDateTime).getTime());

                setRecentEvents(updatedEvents);

                // Update pagination info
                setHasMore(envelope.data.hasMore || false);
                setNextPageToken(envelope.data.nextPageToken || null);
            } else {
                throw new Error(envelope?.message || 'Failed to load more events');
            }
        } catch (err) {
            console.error('Failed to load more events:', err);
            setError(err instanceof Error ? err.message : 'Failed to load more events');
        } finally {
            setLoadingMore(false);
        }
    }, [nextPageToken, accounts.length, loadingMore, lastFetchParams, request, recentEvents]);

    const clearCache = useCallback(() => {
        setStatistics(null);
        setRecentEvents([]);
        setError(null);
        setHasMore(false);
        setNextPageToken(null);
    }, []);

    const value = useMemo(() => ({
        statistics,
        recentEvents,
        loading,
        loadingMore,
        error,
        hasMore,
        nextPageToken,
        fetchData,
        loadMore,
        clearCache
    }), [statistics, recentEvents, loading, loadingMore, error, hasMore, nextPageToken, fetchData, loadMore, clearCache]);

    return (
        <AuditEventsContext.Provider value={value}>
            {children}
        </AuditEventsContext.Provider>
    );
};
