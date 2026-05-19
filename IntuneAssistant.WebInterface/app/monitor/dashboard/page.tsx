'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { Badge } from '@/components/ui/badge';
import {
    Shield, Activity, AlertTriangle, CheckCircle, XCircle,
    Clock, RefreshCw, Wifi, WifiOff, Server, TrendingUp,
    TrendingDown, Minus, Maximize2, Minimize2, Eye,
    AlertCircle, Cpu, Zap,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    MONITOR_CONFIGURATION_ENDPOINT,
    MONITOR_CONFIGURATION_DRIFTS_ENDPOINT,
    MONITOR_CONFIGURATION_RESULTS_ENDPOINT,
    WORKER_OVERVIEW_ENDPOINT,
    MONITOR_CONFIGURATION_SNAPSHOTS_JOBS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import { WorkerOverview } from '@/types/worker';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Monitor {
    id: string;
    displayName: string;
    status: 'active' | 'inactive';
    monitorRunFrequencyInHours: number;
}

interface Drift {
    id: string;
    monitorId: string;
    resourceType: string;
    baselineResourceDisplayName: string;
    firstReportedDateTime: string;
    status: string; // 'active' | 'resolved'
}

interface MonitorResult {
    id: string;
    monitorId: string;
    runInitiationDateTime: string;
    runCompletionDateTime: string;
    runStatus: 'successful' | 'partiallySuccessful' | 'failed';
    driftsCount: number;
    driftsFixed: number;
}

interface SnapshotJob {
    id: string;
    displayName: string;
    status: 'notStarted' | 'inProgress' | 'succeeded' | 'partiallySuccessful' | 'failed';
    createdDateTime: string;
    completedDateTime: string | null;
}

interface ApiEnvelope<T> { status: number; message: string; data: T; }

const REFRESH_INTERVAL_MS = 60_000; // 60 seconds

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(iso));
}

function fmtRelative(iso: string | null | undefined): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
}

function parseTimeSince(ts: string): number {
    const dayMatch = ts.match(/^(\d+)\.(\d+):(\d+):(\d+)/);
    if (dayMatch) {
        return parseInt(dayMatch[1]) * 86400 + parseInt(dayMatch[2]) * 3600 +
            parseInt(dayMatch[3]) * 60 + parseInt(dayMatch[4]);
    }
    const match = ts.match(/^(\d+):(\d+):(\d+)/);
    if (!match) return 0;
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
}

function workerHealth(healthStatus: number, timeSince: string): 'healthy' | 'stale' | 'offline' | 'unknown' {
    const secs = parseTimeSince(timeSince);
    if (secs > 3600 || healthStatus === 2) return 'offline';
    if (secs > 600  || healthStatus === 1) return 'stale';
    if (healthStatus === 3) return 'unknown';
    return 'healthy';
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

interface StatTileProps {
    label: string;
    value: number | string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'neutral';
    trend?: 'up' | 'down' | 'flat';
    large?: boolean;
}

const VARIANT_STYLES: Record<StatTileProps['variant'], { card: string; icon: string; value: string }> = {
    green:   { card: 'border-green-500/30 bg-green-950/40',   icon: 'text-green-400',  value: 'text-green-300' },
    red:     { card: 'border-red-500/30 bg-red-950/40',       icon: 'text-red-400',    value: 'text-red-300' },
    amber:   { card: 'border-amber-500/30 bg-amber-950/40',   icon: 'text-amber-400',  value: 'text-amber-300' },
    blue:    { card: 'border-blue-500/30 bg-blue-950/40',     icon: 'text-blue-400',   value: 'text-blue-300' },
    purple:  { card: 'border-purple-500/30 bg-purple-950/40', icon: 'text-purple-400', value: 'text-purple-300' },
    neutral: { card: 'border-slate-600/30 bg-slate-800/40',   icon: 'text-slate-400',  value: 'text-slate-200' },
};

function StatTile({ label, value, sub, icon: Icon, variant, trend, large }: StatTileProps) {
    const s = VARIANT_STYLES[variant];
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    return (
        <div className={cn(
            'rounded-2xl border backdrop-blur-sm p-5 flex flex-col gap-3 relative overflow-hidden',
            s.card,
        )}>
            {/* Subtle glow */}
            <div className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl', s.value.replace('text-', 'bg-'))} />
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-400 leading-tight">{label}</p>
                <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', s.icon)} />
            </div>
            <div className="flex items-end justify-between gap-2">
                <span className={cn('font-black tabular-nums leading-none', large ? 'text-5xl' : 'text-4xl', s.value)}>
                    {value}
                </span>
                {trend && (
                    <TrendIcon className={cn('h-4 w-4 mb-1',
                        trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'
                    )} />
                )}
            </div>
            {sub && <p className="text-xs text-slate-500 -mt-1">{sub}</p>}
        </div>
    );
}

// ─── Pulse dot ────────────────────────────────────────────────────────────────

function PulseDot({ color }: { color: 'green' | 'amber' | 'red' | 'gray' }) {
    const cls = {
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        red:   'bg-red-500',
        gray:  'bg-slate-500',
    }[color];
    return (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
            {color !== 'gray' && <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', cls)} />}
            <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', cls)} />
        </span>
    );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, count }: { icon: React.ComponentType<{ className?: string }>; title: string; count?: number }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <Icon className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
            {count !== undefined && (
                <span className="ml-auto text-xs font-mono text-slate-500">{count}</span>
            )}
        </div>
    );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function WallDashboard() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [monitors, setMonitors]     = useState<Monitor[]>([]);
    const [drifts, setDrifts]         = useState<Drift[]>([]);
    const [results, setResults]       = useState<MonitorResult[]>([]);
    const [worker, setWorker]         = useState<WorkerOverview | null>(null);
    const [snapJobs, setSnapJobs]     = useState<SnapshotJob[]>([]);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [countdown, setCountdown]   = useState(REFRESH_INTERVAL_MS / 1000);
    const [loading, setLoading]       = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
    const cdRef        = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Fetch all data ──────────────────────────────────────────────────────

    const fetchAll = useCallback(async () => {
        if (!accounts.length) return;
        try {
            const [mR, dR, rR, wR, sR] = await Promise.allSettled([
                request<ApiEnvelope<Monitor[]>>(MONITOR_CONFIGURATION_ENDPOINT, { method: 'GET' }),
                request<ApiEnvelope<Drift[]>>(MONITOR_CONFIGURATION_DRIFTS_ENDPOINT, { method: 'GET' }),
                request<ApiEnvelope<MonitorResult[]>>(MONITOR_CONFIGURATION_RESULTS_ENDPOINT, { method: 'GET' }),
                request<ApiEnvelope<WorkerOverview>>(WORKER_OVERVIEW_ENDPOINT, { method: 'GET' }),
                request<ApiEnvelope<SnapshotJob[]>>(MONITOR_CONFIGURATION_SNAPSHOTS_JOBS, { method: 'GET' }),
            ]);

            if (mR.status === 'fulfilled' && mR.value?.data?.data) {
                const d = mR.value.data.data;
                setMonitors(Array.isArray(d) ? d : [d]);
            }
            if (dR.status === 'fulfilled' && dR.value?.data?.data) {
                const d = dR.value.data.data;
                setDrifts(Array.isArray(d) ? d : [d]);
            }
            if (rR.status === 'fulfilled' && rR.value?.data?.data) {
                const d = rR.value.data.data;
                setResults(Array.isArray(d) ? d : [d]);
            }
            if (wR.status === 'fulfilled' && wR.value?.data?.data) {
                setWorker(wR.value.data.data);
            }
            if (sR.status === 'fulfilled' && sR.value?.data?.data) {
                const d = sR.value.data.data;
                setSnapJobs(Array.isArray(d) ? d : [d]);
            }
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
            setCountdown(REFRESH_INTERVAL_MS / 1000);
        }
    }, [accounts.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-refresh every 60 s ─────────────────────────────────────────────

    useEffect(() => {
        fetchAll();
        intervalRef.current = setInterval(fetchAll, REFRESH_INTERVAL_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchAll]);

    // ── Countdown ticker ────────────────────────────────────────────────────

    useEffect(() => {
        cdRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
        return () => { if (cdRef.current) clearInterval(cdRef.current); };
    }, []);

    // ── Fullscreen ──────────────────────────────────────────────────────────

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // ── Derived stats ───────────────────────────────────────────────────────

    const stats = useMemo(() => {
        const activeMonitors   = monitors.filter(m => m.status === 'active').length;
        const activeDrifts     = drifts.filter(d => d.status === 'active').length;
        const resolvedDrifts   = drifts.filter(d => d.status !== 'active').length;
        const successfulRuns   = results.filter(r => r.runStatus === 'successful').length;
        const failedRuns       = results.filter(r => r.runStatus === 'failed').length;
        const partialRuns      = results.filter(r => r.runStatus === 'partiallySuccessful').length;
        const successRate      = results.length > 0 ? Math.round((successfulRuns / results.length) * 100) : 0;
        const recentResults    = [...results]
            .sort((a, b) => new Date(b.runCompletionDateTime).getTime() - new Date(a.runCompletionDateTime).getTime())
            .slice(0, 8);
        const inProgressSnaps  = snapJobs.filter(j => j.status === 'inProgress' || j.status === 'notStarted').length;
        const failedSnaps      = snapJobs.filter(j => j.status === 'failed').length;

        // Worker aggregate
        const workerInstances  = worker?.workers ?? [];
        const healthyWorkers   = workerInstances.filter(w => workerHealth(w.healthStatus, w.timeSinceLastHeartbeat) === 'healthy').length;
        const offlineWorkers   = workerInstances.filter(w => ['offline', 'stale'].includes(workerHealth(w.healthStatus, w.timeSinceLastHeartbeat))).length;

        // Monitors with active drifts
        const monitorsWithActiveDrifts = [...new Set(
            drifts.filter(d => d.status === 'active').map(d => d.monitorId)
        )].length;

        return {
            activeMonitors, inactiveMonitors: monitors.length - activeMonitors,
            activeDrifts, resolvedDrifts,
            successfulRuns, failedRuns, partialRuns, successRate,
            recentResults, inProgressSnaps, failedSnaps,
            healthyWorkers, offlineWorkers, totalWorkers: workerInstances.length,
            monitorsWithActiveDrifts,
        };
    }, [monitors, drifts, results, worker, snapJobs]);

    // ── Worker overall status ───────────────────────────────────────────────

    const workerStatus = useMemo(() => {
        if (!worker) return 'unknown';
        if (!worker.isEnabled) return 'disabled';
        if (stats.offlineWorkers > 0 && stats.healthyWorkers === 0) return 'offline';
        if (stats.offlineWorkers > 0) return 'degraded';
        return 'healthy';
    }, [worker, stats]);

    // ── Recent active drifts (max 8 for wall) ──────────────────────────────

    const recentDrifts = useMemo(() =>
        [...drifts]
            .filter(d => d.status === 'active')
            .sort((a, b) => new Date(b.firstReportedDateTime).getTime() - new Date(a.firstReportedDateTime).getTime())
            .slice(0, 10),
        [drifts]
    );

    // ── Clock ───────────────────────────────────────────────────────────────

    const [clock, setClock] = useState('');
    const [clockDate, setClockDate] = useState('');
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setClock(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setClockDate(now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
        };
        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, []);

    // ── Run-status sparkline (last 8 results) ───────────────────────────────

    const statusColor = (s: MonitorResult['runStatus']) =>
        s === 'successful' ? 'bg-green-500' : s === 'partiallySuccessful' ? 'bg-amber-500' : 'bg-red-500';

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="text-lg font-medium">Loading dashboard…</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-slate-950 text-slate-100 p-5 flex flex-col gap-5 font-sans select-none"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            {/* ── TOP BAR ──────────────────────────────────────────────────── */}
            <header className="flex items-center justify-between gap-4">
                {/* Logo / title */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30">
                        <Shield className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white leading-none">IntuneAssistant</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Configuration Drift Monitor</p>
                    </div>
                </div>

                {/* Clock */}
                <div className="text-center flex-1">
                    <p className="text-4xl font-black tabular-nums text-white tracking-tight leading-none">{clock}</p>
                    <p className="text-xs text-slate-500 mt-1">{clockDate}</p>
                </div>

                {/* Status + controls */}
                <div className="flex items-center gap-4">
                    {/* Worker pill */}
                    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold',
                        workerStatus === 'healthy'  && 'border-green-500/40 bg-green-950/50 text-green-300',
                        workerStatus === 'degraded' && 'border-amber-500/40 bg-amber-950/50 text-amber-300',
                        workerStatus === 'offline'  && 'border-red-500/40 bg-red-950/50 text-red-300',
                        workerStatus === 'disabled' && 'border-slate-600/40 bg-slate-800/50 text-slate-400',
                        workerStatus === 'unknown'  && 'border-slate-600/40 bg-slate-800/50 text-slate-400',
                    )}>
                        {workerStatus === 'healthy'
                            ? <Wifi className="h-3.5 w-3.5" />
                            : <WifiOff className="h-3.5 w-3.5" />
                        }
                        Worker {workerStatus}
                        {stats.totalWorkers > 0 && <span className="opacity-60 ml-1">({stats.healthyWorkers}/{stats.totalWorkers})</span>}
                    </div>

                    {/* Refresh countdown ring */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="relative w-7 h-7">
                            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                                <circle cx="14" cy="14" r="11" fill="none" stroke="#334155" strokeWidth="2.5" />
                                <circle cx="14" cy="14" r="11" fill="none" stroke="#3b82f6" strokeWidth="2.5"
                                    strokeDasharray={`${2 * Math.PI * 11}`}
                                    strokeDashoffset={`${2 * Math.PI * 11 * (1 - countdown / (REFRESH_INTERVAL_MS / 1000))}`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-blue-400 tabular-nums">{countdown}</span>
                        </div>
                        <span className="hidden sm:inline">next refresh</span>
                    </div>

                    {/* Fullscreen toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                        title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </header>

            {/* ── KPI ROW ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <StatTile label="Active Monitors"   value={stats.activeMonitors}    icon={Eye}           variant="blue"    />
                <StatTile label="Inactive"          value={stats.inactiveMonitors}  icon={Minus}         variant="neutral" />
                <StatTile label="Active Drifts"     value={stats.activeDrifts}      icon={AlertTriangle} variant={stats.activeDrifts > 0 ? 'red' : 'green'}  />
                <StatTile label="Resolved Drifts"   value={stats.resolvedDrifts}    icon={CheckCircle}   variant="green"   />
                <StatTile label="Successful Runs"   value={stats.successfulRuns}    icon={CheckCircle}   variant="green"   />
                <StatTile label="Failed Runs"       value={stats.failedRuns}        icon={XCircle}       variant={stats.failedRuns > 0 ? 'red' : 'neutral'}   />
                <StatTile label="Success Rate"      value={`${stats.successRate}%`} icon={TrendingUp}    variant={stats.successRate >= 90 ? 'green' : stats.successRate >= 70 ? 'amber' : 'red'} />
                <StatTile label="Snapshot Jobs"     value={snapJobs.length}         icon={Cpu}           variant={stats.failedSnaps > 0 ? 'amber' : 'purple'} sub={stats.inProgressSnaps > 0 ? `${stats.inProgressSnaps} running` : undefined} />
            </div>

            {/* ── MAIN GRID ─────────────────────────────────────────────────── */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">

                {/* LEFT: Active Drifts ──────────────────────────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Active drift list */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-4 flex-1 flex flex-col min-h-0">
                        <SectionHeader icon={AlertTriangle} title="Active Drifts" count={stats.activeDrifts} />
                        {recentDrifts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600">
                                <CheckCircle className="h-12 w-12" />
                                <p className="text-base font-semibold">No active drifts detected</p>
                                <p className="text-xs">All monitored configurations match their baselines</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
                                {recentDrifts.map(drift => {
                                    const monitor = monitors.find(m => m.id === drift.monitorId);
                                    return (
                                        <div key={drift.id} className="flex items-center gap-3 rounded-xl bg-red-950/30 border border-red-500/20 px-3 py-2.5">
                                            <PulseDot color="red" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-red-200 truncate">{drift.baselineResourceDisplayName}</p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {drift.resourceType.replace(/^microsoft\.(intune|exchange|entra)\./i, '')}
                                                    {monitor && <span className="text-slate-600"> · {monitor.displayName}</span>}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-600 shrink-0 tabular-nums">{fmtRelative(drift.firstReportedDateTime)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent run history sparkline */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-4">
                        <SectionHeader icon={Activity} title="Recent Run History" count={results.length} />
                        {stats.recentResults.length === 0 ? (
                            <p className="text-sm text-slate-600 text-center py-4">No run results yet</p>
                        ) : (
                            <div className="space-y-2">
                                {stats.recentResults.map(r => {
                                    const mon = monitors.find(m => m.id === r.monitorId);
                                    const driftPct = r.driftsCount > 0 ? Math.min(100, (r.driftsCount / 20) * 100) : 0;
                                    return (
                                        <div key={r.id} className="flex items-center gap-3">
                                            <div className={cn('h-2 w-2 rounded-full shrink-0', statusColor(r.runStatus))} />
                                            <span className="text-xs text-slate-400 truncate w-36 shrink-0">
                                                {mon?.displayName ?? 'Unknown'}
                                            </span>
                                            {/* mini bar showing drift count */}
                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                {driftPct > 0 && (
                                                    <div className={cn('h-full rounded-full', r.runStatus === 'failed' ? 'bg-red-500' : 'bg-amber-500')}
                                                        style={{ width: `${driftPct}%` }} />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-600 tabular-nums shrink-0 w-8 text-right">
                                                {r.driftsCount > 0 ? `${r.driftsCount}Δ` : '✓'}
                                            </span>
                                            <span className="text-xs text-slate-700 tabular-nums shrink-0 w-16 text-right hidden sm:block">
                                                {fmtTime(r.runCompletionDateTime)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN ─────────────────────────────────────────────── */}
                <div className="flex flex-col gap-5">

                    {/* Worker status */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-4">
                        <SectionHeader icon={Server} title="Worker Instances" count={stats.totalWorkers} />
                        {!worker || stats.totalWorkers === 0 ? (
                            <div className="flex items-center gap-2 text-slate-600 py-2">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-xs">No worker instances registered</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {worker.workers.slice(0, 6).map(w => {
                                    const health = workerHealth(w.healthStatus, w.timeSinceLastHeartbeat);
                                    const dotColor = health === 'healthy' ? 'green' : health === 'stale' ? 'amber' : health === 'offline' ? 'red' : 'gray';
                                    return (
                                        <div key={w.workerInstanceId} className="flex items-center gap-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 px-3 py-2">
                                            <PulseDot color={dotColor} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200 truncate">{w.machineName}</p>
                                                <p className="text-xs text-slate-600 truncate">{w.workerVersion}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 border',
                                                    health === 'healthy' && 'border-green-500/40 text-green-400',
                                                    health === 'stale'   && 'border-amber-500/40 text-amber-400',
                                                    health === 'offline' && 'border-red-500/40 text-red-400',
                                                    health === 'unknown' && 'border-slate-600/40 text-slate-500',
                                                )}>{health}</Badge>
                                                {w.updateAvailable && (
                                                    <p className="text-[10px] text-blue-400 mt-0.5">update</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Config chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {[
                                        { label: worker.isEnabled ? 'Enabled' : 'Disabled', ok: worker.isEnabled },
                                        { label: worker.acceptNewJobs ? 'Accepting Jobs' : 'No New Jobs', ok: worker.acceptNewJobs },
                                        { label: worker.autoUpdate ? 'Auto-Update' : 'Manual Update', ok: worker.autoUpdate },
                                    ].map(chip => (
                                        <span key={chip.label} className={cn(
                                            'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                                            chip.ok ? 'border-green-500/30 text-green-400 bg-green-950/30' : 'border-slate-600/30 text-slate-500 bg-slate-800/30'
                                        )}>{chip.label}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Monitor list */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-4 flex-1">
                        <SectionHeader icon={Shield} title="Monitors" count={monitors.length} />
                        {monitors.length === 0 ? (
                            <p className="text-xs text-slate-600 py-2">No monitors configured</p>
                        ) : (
                            <div className="space-y-1.5">
                                {monitors.slice(0, 10).map(m => {
                                    const mDrifts = drifts.filter(d => d.monitorId === m.id && d.status === 'active').length;
                                    const lastRun = results
                                        .filter(r => r.monitorId === m.id)
                                        .sort((a, b) => new Date(b.runCompletionDateTime).getTime() - new Date(a.runCompletionDateTime).getTime())[0];
                                    return (
                                        <div key={m.id} className="flex items-center gap-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30 px-3 py-2">
                                            <PulseDot color={m.status === 'active' ? (mDrifts > 0 ? 'red' : 'green') : 'gray'} />
                                            <span className="flex-1 text-sm text-slate-300 truncate">{m.displayName}</span>
                                            {mDrifts > 0 && (
                                                <Badge className="bg-red-900/50 text-red-300 border-red-700/50 text-[10px] h-4 px-1.5">
                                                    {mDrifts}Δ
                                                </Badge>
                                            )}
                                            {lastRun && (
                                                <span className="text-[10px] text-slate-700 tabular-nums hidden sm:inline">
                                                    {fmtRelative(lastRun.runCompletionDateTime)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Snapshot jobs */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-4">
                        <SectionHeader icon={Zap} title="Recent Snapshot Jobs" count={snapJobs.length} />
                        {snapJobs.length === 0 ? (
                            <p className="text-xs text-slate-600 py-2">No snapshot jobs</p>
                        ) : (
                            <div className="space-y-1.5">
                                {[...snapJobs]
                                    .sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime())
                                    .slice(0, 5)
                                    .map(j => {
                                        const dotColor = j.status === 'succeeded' ? 'green'
                                            : j.status === 'inProgress' || j.status === 'notStarted' ? 'amber'
                                            : j.status === 'failed' ? 'red' : 'gray';
                                        return (
                                            <div key={j.id} className="flex items-center gap-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30 px-3 py-2">
                                                <PulseDot color={dotColor} />
                                                <span className="flex-1 text-xs text-slate-300 truncate">{j.displayName}</span>
                                                <span className="text-[10px] text-slate-600 shrink-0">{fmtRelative(j.createdDateTime)}</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <footer className="flex items-center justify-between text-[11px] text-slate-700 pt-1 border-t border-slate-800">
                <span>Last updated: {lastRefresh ? fmtTime(lastRefresh.toISOString()) : '—'}</span>
                <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3" />
                    Auto-refresh every 60 s
                </span>
                <span>IntuneAssistant · Configuration Drift Dashboard</span>
            </footer>
        </div>
    );
}

