'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface Monitor {
    id: string;
    displayName: string;
    description: string;
    status: string;
    monitorRunFrequencyInHours: number;
    mode: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
}

interface DriftedProperty {
    propertyName: string;
    currentValue: unknown;
    desiredValue: unknown;
}

interface Drift {
    id: string;
    monitorId: string;
    resourceType: string;
    baselineResourceDisplayName: string;
    firstReportedDateTime: string;
    status: string;
    driftedProperties: DriftedProperty[];
}

interface MonitorResult {
    id: string;
    monitorId: string;
    runInitiationDateTime: string;
    runCompletionDateTime: string;
    runStatus: 'successful' | 'partiallySuccessful' | 'failed';
    driftsCount: number;
    driftsFixed: number;
    runType: string;
}

interface MonitorContextType {
    monitors: Monitor[];
    drifts: Drift[];
    results: MonitorResult[];
    setMonitors: (monitors: Monitor[]) => void;
    setDrifts: (drifts: Drift[]) => void;
    setResults: (results: MonitorResult[]) => void;
    clearCache: () => void;
    hasData: boolean;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    lastFetchTime: number | null;
    updateLastFetchTime: () => void;
    // Memoized derived data
    monitorById: Map<string, Monitor>;
    driftsByMonitorId: Map<string, Drift[]>;
    resultsByMonitorId: Map<string, MonitorResult[]>;
}

const MonitorContext = createContext<MonitorContextType | undefined>(undefined);

export function MonitorProvider({ children }: { children: ReactNode }) {
    const [monitors, setMonitorsState] = useState<Monitor[]>([]);
    const [drifts, setDriftsState] = useState<Drift[]>([]);
    const [results, setResultsState] = useState<MonitorResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

    const setMonitors = useCallback((newMonitors: Monitor[]) => {
        setMonitorsState(newMonitors);
    }, []);

    const setDrifts = useCallback((newDrifts: Drift[]) => {
        setDriftsState(newDrifts);
    }, []);

    const setResults = useCallback((newResults: MonitorResult[]) => {
        setResultsState(newResults);
    }, []);

    const clearCache = useCallback(() => {
        setMonitorsState([]);
        setDriftsState([]);
        setResultsState([]);
        setLastFetchTime(null);
    }, []);

    const updateLastFetchTime = useCallback(() => {
        setLastFetchTime(Date.now());
    }, []);

    const hasData = monitors.length > 0 || drifts.length > 0 || results.length > 0;

    // Memoize monitor lookup by ID
    const monitorById = useMemo(() => {
        return new Map(monitors.map(m => [m.id, m]));
    }, [monitors]);

    // Memoize drifts grouped by monitor ID
    const driftsByMonitorId = useMemo(() => {
        const map = new Map<string, Drift[]>();
        drifts.forEach(drift => {
            const existing = map.get(drift.monitorId) || [];
            map.set(drift.monitorId, [...existing, drift]);
        });
        return map;
    }, [drifts]);

    // Memoize results grouped by monitor ID
    const resultsByMonitorId = useMemo(() => {
        const map = new Map<string, MonitorResult[]>();
        results.forEach(result => {
            const existing = map.get(result.monitorId) || [];
            map.set(result.monitorId, [...existing, result]);
        });
        return map;
    }, [results]);

    return (
        <MonitorContext.Provider
            value={{
                monitors,
                drifts,
                results,
                setMonitors,
                setDrifts,
                setResults,
                clearCache,
                hasData,
                isLoading,
                setIsLoading,
                lastFetchTime,
                updateLastFetchTime,
                monitorById,
                driftsByMonitorId,
                resultsByMonitorId
            }}
        >
            {children}
        </MonitorContext.Provider>
    );
}

export function useMonitorContext() {
    const context = useContext(MonitorContext);
    if (context === undefined) {
        throw new Error('useMonitorContext must be used within a MonitorProvider');
    }
    return context;
}
