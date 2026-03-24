'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    RefreshCw,
    Cpu,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Mail,
    Server,
    Shield,
    Zap,
    ArrowUpCircle,
    Package,
    Wifi,
    WifiOff,
    Settings,
    Loader2,
    Hash,
    Calendar,
    Monitor,
    BriefcaseBusiness,
    Wrench,
    CircleDot,
    CircleX,
    MailCheck,
    MailX,
    RefreshCcw,
    Save,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { WORKER_OVERVIEW_ENDPOINT, WORKER_CONFIG_ENDPOINT } from '@/lib/constants';

// ─── Types ──────────────────────────────────────────────────────────────────

interface WorkerOverview {
    customerId: string;
    isConfigured: boolean;
    isEnabled: boolean;
    acceptNewJobs: boolean;
    autoUpdate: boolean;
    updateRing: number;
    senderEmail: string;
    isSenderEmailConfigured: boolean;
    workerRegistrationId: string;
    workerInstanceId: string;
    workerVersion: string;
    machineName: string;
    osVersion: string;
    registeredAt: string;
    registrationStatus: number;
    lastHeartbeat: string;
    timeSinceLastHeartbeat: string;
    healthStatus: number;
    currentJobsRunning: number;
    availableVersion: string;
    currentVersion: string;
    updateAvailable: boolean;
    updatedAt: string;
    updatedBy: string | null;
}

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: WorkerOverview;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTimeSince(ts: string): { totalSeconds: number; display: string } {
    // Format: "HH:MM:SS.fffffff"
    const match = ts.match(/^(\d+):(\d+):(\d+)/);
    if (!match) return { totalSeconds: 0, display: ts };
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const s = parseInt(match[3], 10);
    const total = h * 3600 + m * 60 + s;

    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return { totalSeconds: total, display: parts.join(' ') };
}

function formatDateTime(iso: string): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function getHealthLabel(status: number) {
    switch (status) {
        case 0: return { label: 'Healthy', color: 'green', icon: CheckCircle };
        case 1: return { label: 'Warning', color: 'yellow', icon: AlertTriangle };
        case 2: return { label: 'Unhealthy', color: 'red', icon: XCircle };
        default: return { label: 'Unknown', color: 'gray', icon: AlertTriangle };
    }
}

function getRegistrationLabel(status: number) {
    switch (status) {
        case 0: return { label: 'Pending', color: 'yellow' };
        case 1: return { label: 'Registered', color: 'green' };
        case 2: return { label: 'Revoked', color: 'red' };
        default: return { label: `Status ${status}`, color: 'gray' };
    }
}

function getHeartbeatHealth(totalSeconds: number) {
    if (totalSeconds < 300) return 'green';   // < 5 min
    if (totalSeconds < 900) return 'yellow';  // < 15 min
    return 'red';
}

function getUpdateRingLabel(ring: number) {
    switch (ring) {
        case 1: return 'Fast';
        case 2: return 'Stable';
        case 3: return 'Slow';
        default: return `Ring ${ring}`;
    }
}

function compareVersions(current: string, available: string): boolean {
    // Returns true if available version is newer than current version
    if (!current || !available) return false;
    
    // Parse version strings into number arrays
    const parseParts = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
    const currentParts = parseParts(current);
    const availableParts = parseParts(available);
    
    // Compare each part
    const maxLength = Math.max(currentParts.length, availableParts.length);
    for (let i = 0; i < maxLength; i++) {
        const currentPart = currentParts[i] || 0;
        const availablePart = availableParts[i] || 0;
        
        if (availablePart > currentPart) return true;  // Available is newer
        if (availablePart < currentPart) return false; // Current is newer
    }
    
    return false; // Versions are equal
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
    borderColor: string;
    subText?: string;
}

function StatCard({ title, value, icon: Icon, gradient, iconColor, borderColor, subText }: StatCardProps) {
    return (
        <Card className={`${gradient} ${borderColor}`}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
                        <div className="text-2xl font-bold mt-1">{value}</div>
                        {subText && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{subText}</p>}
                    </div>
                    <Icon className={`h-12 w-12 opacity-40 flex-shrink-0 ml-2 ${iconColor}`} />
                </div>
            </CardContent>
        </Card>
    );
}

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    icon?: React.ElementType;
}

function InfoRow({ label, value, icon: Icon }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3 py-3">
            {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-all">{value}</div>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function WorkerOverviewPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [worker, setWorker] = useState<WorkerOverview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    
    // Settings dialog state
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settingsError, setSettingsError] = useState<string | null>(null);
    const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
    const [formAutoUpdate, setFormAutoUpdate] = useState(false);
    const [formUpdateRing, setFormUpdateRing] = useState(3);
    const [formSenderEmail, setFormSenderEmail] = useState('');

    const openSettingsDialog = () => {
        if (worker) {
            setFormAutoUpdate(worker.autoUpdate);
            setFormUpdateRing(worker.updateRing);
            setFormSenderEmail(worker.senderEmail || '');
            setSettingsError(null);
            setSettingsSuccess(null);
            setShowSettingsDialog(true);
        }
    };

    const handleSaveSettings = async () => {
        setSettingsError(null);
        setSettingsSuccess(null);
        setSaving(true);

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formSenderEmail && !emailRegex.test(formSenderEmail)) {
            setSettingsError('Please enter a valid email address');
            setSaving(false);
            return;
        }

        try {
            const payload = {
                autoUpdate: formAutoUpdate,
                updateRing: formUpdateRing,
                senderEmail: formSenderEmail || null,
            };

            const result = await request<ApiResponse>(
                WORKER_CONFIG_ENDPOINT,
                {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                }
            );

            if (result?.data?.data) {
                setWorker(result.data.data);
                setSettingsSuccess('Settings updated successfully!');
                setTimeout(() => {
                    setShowSettingsDialog(false);
                    setSettingsSuccess(null);
                }, 1500);
            }
        } catch (err) {
            setSettingsError(err instanceof Error ? err.message : 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const fetchWorker = useCallback(async () => {
        if (accounts.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const result = await request<ApiResponse>(WORKER_OVERVIEW_ENDPOINT);
            if (result?.data?.data) {
                setWorker(result.data.data);
                setLastRefreshed(new Date());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch worker data');
        } finally {
            setLoading(false);
        }
    }, [accounts, request]);

    useEffect(() => {
        if (accounts.length > 0) {
            fetchWorker();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchWorker(), 30_000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchWorker]);

    // ── Derived values ────────────────────────────────────────────────────────
    const health = worker ? getHealthLabel(worker.healthStatus) : null;
    const heartbeat = worker ? parseTimeSince(worker.timeSinceLastHeartbeat) : null;
    const heartbeatColor = heartbeat ? getHeartbeatHealth(heartbeat.totalSeconds) : 'gray';
    const regStatus = worker ? getRegistrationLabel(worker.registrationStatus) : null;
    
    // Client-side version comparison (override backend's updateAvailable)
    const isUpdateAvailable = worker 
        ? compareVersions(worker.currentVersion, worker.availableVersion)
        : false;

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading && !worker) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Worker Data
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching worker overview…
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error && !worker) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={fetchWorker} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Cpu className="h-8 w-8 text-blue-500" />
                        Worker Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {worker
                            ? `${worker.machineName} · ${worker.osVersion}`
                            : 'Managed identity running background jobs'}
                    </p>
                    {lastRefreshed && (
                        <p className="text-xs text-gray-400 mt-1">
                            Last refreshed: {formatDateTime(lastRefreshed.toISOString())}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                        />
                        <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh (30s)</Label>
                    </div>
                    <Button onClick={openSettingsDialog} variant="outline" size="sm" disabled={!worker}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                    <Button onClick={fetchWorker} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* ── Stat Cards ──────────────────────────────────────────────────── */}
            {worker && health && heartbeat && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                    {/* Health Status */}
                    <StatCard
                        title="Health Status"
                        value={
                            <span className={
                                health.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                health.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }>
                                {health.label}
                            </span>
                        }
                        icon={health.icon}
                        gradient={
                            health.color === 'green'
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                                : health.color === 'yellow'
                                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
                                    : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
                        }
                        iconColor={
                            health.color === 'green' ? 'text-green-500' :
                            health.color === 'yellow' ? 'text-yellow-500' :
                            'text-red-500'
                        }
                        borderColor={
                            health.color === 'green' ? 'border-green-200 dark:border-green-800' :
                            health.color === 'yellow' ? 'border-yellow-200 dark:border-yellow-800' :
                            'border-red-200 dark:border-red-800'
                        }
                        subText={`Registration: ${regStatus?.label}`}
                    />

                    {/* Worker State */}
                    <StatCard
                        title="Worker State"
                        value={
                            <span className={worker.isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}>
                                {worker.isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        }
                        icon={worker.isEnabled ? Zap : XCircle}
                        gradient="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
                        iconColor="text-blue-500"
                        borderColor="border-blue-200 dark:border-blue-800"
                        subText={worker.acceptNewJobs ? 'Accepting new jobs' : 'Not accepting jobs'}
                    />

                    {/* Active Jobs */}
                    <StatCard
                        title="Active Jobs"
                        value={
                            <span className="text-purple-600 dark:text-purple-400">
                                {worker.currentJobsRunning}
                            </span>
                        }
                        icon={BriefcaseBusiness}
                        gradient="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                        iconColor="text-purple-500"
                        borderColor="border-purple-200 dark:border-purple-800"
                        subText="Currently running"
                    />

                    {/* Last Heartbeat */}
                    <StatCard
                        title="Last Heartbeat"
                        value={
                            <span className={
                                heartbeatColor === 'green' ? 'text-green-600 dark:text-green-400' :
                                heartbeatColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }>
                                {heartbeat.display} ago
                            </span>
                        }
                        icon={heartbeatColor === 'green' ? Wifi : heartbeatColor === 'yellow' ? Activity : WifiOff}
                        gradient={
                            heartbeatColor === 'green'
                                ? 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'
                                : heartbeatColor === 'yellow'
                                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
                                    : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
                        }
                        iconColor={
                            heartbeatColor === 'green' ? 'text-teal-500' :
                            heartbeatColor === 'yellow' ? 'text-yellow-500' :
                            'text-red-500'
                        }
                        borderColor={
                            heartbeatColor === 'green' ? 'border-teal-200 dark:border-teal-800' :
                            heartbeatColor === 'yellow' ? 'border-yellow-200 dark:border-yellow-800' :
                            'border-red-200 dark:border-red-800'
                        }
                        subText={formatDateTime(worker.lastHeartbeat)}
                    />
                </div>
            )}

            {/* ── Update Banner ────────────────────────────────────────────────── */}
            {isUpdateAvailable && worker && (
                <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <ArrowUpCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-amber-800 dark:text-amber-200">
                                    Update Available
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    A new version <strong>{worker.availableVersion}</strong> is available.
                                    Your worker is currently on <strong>{worker.currentVersion}</strong>.
                                    {worker.autoUpdate && ' Auto-update is enabled — the worker will update automatically.'}
                                </p>
                            </div>
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0">
                                v{worker.availableVersion}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Identity & Version Row ───────────────────────────────────────── */}
            {worker && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Worker Identity */}
                    <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5 text-blue-500" />
                                Worker Identity
                            </CardTitle>
                            <CardDescription>Registration and machine details</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                            <InfoRow label="Machine Name" value={worker.machineName} icon={Monitor} />
                            <InfoRow label="OS Version" value={worker.osVersion} icon={Cpu} />
                            <InfoRow label="Instance ID" value={
                                <span className="font-mono text-xs">{worker.workerInstanceId}</span>
                            } icon={Hash} />
                            <InfoRow label="Registration ID" value={
                                <span className="font-mono text-xs">{worker.workerRegistrationId}</span>
                            } icon={Hash} />
                            <InfoRow label="Customer ID" value={
                                <span className="font-mono text-xs">{worker.customerId}</span>
                            } icon={Shield} />
                            <InfoRow label="Registered At" value={formatDateTime(worker.registeredAt)} icon={Calendar} />
                            <InfoRow label="Last Updated" value={formatDateTime(worker.updatedAt)} icon={Calendar} />
                            {worker.updatedBy && (
                                <InfoRow label="Updated By" value={worker.updatedBy} />
                            )}
                        </CardContent>
                    </Card>

                    {/* Version & Update Info */}
                    <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-500" />
                                Version &amp; Updates
                            </CardTitle>
                            <CardDescription>Software version and update configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                            <InfoRow label="Current Version" value={
                                <Badge variant="outline" className="font-mono">
                                    v{worker.currentVersion}
                                </Badge>
                            } icon={Package} />
                            <InfoRow label="Available Version" value={
                                <Badge variant="outline" className="font-mono">
                                    v{worker.availableVersion}
                                </Badge>
                            } icon={Package} />
                            <InfoRow label="Update Available" value={
                                isUpdateAvailable ? (
                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                                        Yes — update pending
                                    </Badge>
                                ) : (
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Up to date
                                    </Badge>
                                )
                            } icon={ArrowUpCircle} />
                            <InfoRow label="Auto Update" value={
                                worker.autoUpdate ? (
                                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                                        <RefreshCcw className="h-3 w-3 mr-1" />
                                        Enabled
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Disabled</Badge>
                                )
                            } icon={RefreshCcw} />
                            <InfoRow label="Update Ring" value={
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        Ring {worker.updateRing} — {getUpdateRingLabel(worker.updateRing)}
                                    </Badge>
                                </div>
                            } icon={CircleDot} />

                            <Separator className="my-2" />

                            <InfoRow label="Registration Status" value={
                                <Badge className={
                                    regStatus?.color === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                    regStatus?.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                    'bg-red-500 hover:bg-red-600 text-white'
                                }>
                                    {regStatus?.label}
                                </Badge>
                            } icon={Shield} />
                            <InfoRow label="Worker Version (manifest)" value={
                                <span className="font-mono text-sm">{worker.workerVersion}</span>
                            } icon={Package} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Configuration Card ───────────────────────────────────────────── */}
            {worker && (
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-gray-500" />
                            Configuration
                        </CardTitle>
                        <CardDescription>Worker runtime settings and email configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Worker Configured */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className={`p-2 rounded-lg ${worker.isConfigured ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {worker.isConfigured
                                        ? <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        : <CircleX className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    }
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Configured</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {worker.isConfigured ? 'Yes' : 'No'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">Worker is {worker.isConfigured ? 'fully' : 'not yet'} configured</p>
                                </div>
                            </div>

                            {/* Worker Enabled */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className={`p-2 rounded-lg ${worker.isEnabled ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <Zap className={`h-5 w-5 ${worker.isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Worker Enabled</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {worker.isEnabled ? 'Yes' : 'No'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">Worker {worker.isEnabled ? 'is active' : 'has been disabled'}</p>
                                </div>
                            </div>

                            {/* Accept New Jobs */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className={`p-2 rounded-lg ${worker.acceptNewJobs ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <Activity className={`h-5 w-5 ${worker.acceptNewJobs ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Accept New Jobs</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {worker.acceptNewJobs ? 'Yes' : 'No'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">Queue {worker.acceptNewJobs ? 'is open' : 'is closed'}</p>
                                </div>
                            </div>

                            {/* Sender Email */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className={`p-2 rounded-lg ${worker.isSenderEmailConfigured ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                                    {worker.isSenderEmailConfigured
                                        ? <MailCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        : <MailX className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    }
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Sender Email</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                                        {worker.senderEmail || '—'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {worker.isSenderEmailConfigured ? 'Configured' : 'Not configured'}
                                    </p>
                                </div>
                            </div>

                            {/* Auto Update */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className={`p-2 rounded-lg ${worker.autoUpdate ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <RefreshCcw className={`h-5 w-5 ${worker.autoUpdate ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Auto Update</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {worker.autoUpdate ? 'Enabled' : 'Disabled'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Update ring: <span className="font-medium">{getUpdateRingLabel(worker.updateRing)}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Mail Icon for overall summary */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                    <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Notifications</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                                        {worker.isSenderEmailConfigured ? 'Active' : 'Not Configured'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Results sent to job requestor
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Settings Dialog ───────────────────────────────────────────────── */}
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-blue-500" />
                            Worker Configuration
                        </DialogTitle>
                        <DialogDescription>
                            Update worker settings and email configuration
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Success Message */}
                        {settingsSuccess && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{settingsSuccess}</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {settingsError && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{settingsError}</span>
                                </div>
                            </div>
                        )}

                        {/* Auto Update */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <RefreshCcw className={`h-5 w-5 ${formAutoUpdate ? 'text-purple-500' : 'text-gray-400'}`} />
                                    <div>
                                        <Label htmlFor="autoUpdate" className="text-base font-medium cursor-pointer">
                                            Auto Update
                                        </Label>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            Automatically update worker to latest version
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="autoUpdate"
                                    checked={formAutoUpdate}
                                    onCheckedChange={setFormAutoUpdate}
                                />
                            </div>

                            {/* Update Ring */}
                            <div className="space-y-2">
                                <Label htmlFor="updateRing">Update Ring</Label>
                                <select
                                    id="updateRing"
                                    value={formUpdateRing}
                                    onChange={(e) => setFormUpdateRing(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                                    disabled={!formAutoUpdate}
                                >
                                    <option value={1}>Fast - Get updates immediately</option>
                                    <option value={2}>Stable - Balanced updates</option>
                                    <option value={3}>Slow - Delayed, stable releases</option>
                                </select>
                                <p className="text-xs text-gray-500">
                                    {!formAutoUpdate && 'Enable auto-update to select update ring'}
                                    {formAutoUpdate && formUpdateRing === 1 && 'Receive updates as soon as available (may be unstable)'}
                                    {formAutoUpdate && formUpdateRing === 2 && 'Receive updates after initial testing'}
                                    {formAutoUpdate && formUpdateRing === 3 && 'Receive updates after full validation'}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Sender Email */}
                        <div className="space-y-2">
                            <Label htmlFor="senderEmail" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Sender Email
                            </Label>
                            <Input
                                id="senderEmail"
                                type="email"
                                value={formSenderEmail}
                                onChange={(e) => setFormSenderEmail(e.target.value)}
                                placeholder="notifications@yourcompany.com"
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">
                                Email address used to send job result notifications
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowSettingsDialog(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

