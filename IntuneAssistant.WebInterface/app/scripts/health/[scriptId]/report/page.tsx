'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import { CancelledCard } from '@/components/CancelledCard';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    HEALTH_SCRIPTS_ENDPOINT,
    HEALTH_SCRIPT_RUN_STATES_REPORT_ENDPOINT,
} from '@/lib/constants';
import {
    RefreshCw, XCircle, Database, AlertCircle, ArrowLeft,
    CheckCircle, AlertTriangle, FileJson, X, Monitor,
    TableProperties, Users,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeviceRunStateReport {
    deviceId: string;
    deviceName: string;
    osVersion: string;
    userId: string;
    userPrincipalName: string;
    detectionState: string;
    remediationState: string;
    lastStateUpdateDateTime: string;
    parsedOutput: Record<string, unknown>[] | null;
    scriptError: string | null;
}

interface HealthScript {
    id: string;
    displayName: string;
    description?: string;
}

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeState(s: string): string {
    const l = (s ?? '').toLowerCase();
    return l === 'fail' ? 'failed' : l;
}

function DetectionBadge({ state }: { state: string }) {
    switch (normalizeState(state)) {
        case 'success':
            return (
                <Badge className="bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />{state}
                </Badge>
            );
        case 'failed':
            return (
                <Badge className="bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />{state}
                </Badge>
            );
        default:
            return <Badge variant="secondary" className="text-xs">{state || '—'}</Badge>;
    }
}

/** Compact device + user + OS stacked cell */
function DeviceCell({ row }: { row: Record<string, unknown> }) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5">
                <Monitor className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm text-foreground truncate">
                    {String(row.deviceName ?? '—')}
                </span>
            </div>
            <div className="text-xs text-muted-foreground truncate pl-4">
                {String(row.userPrincipalName ?? '')}
            </div>
            <div className="text-xs text-muted-foreground/60 truncate pl-4">
                {String(row.osVersion ?? '')}
            </div>
        </div>
    );
}

/** Mini table shown inside the Device Overview expandable row */
function MiniOutputTable({ items, keys }: { items: Record<string, unknown>[]; keys: string[] }) {
    if (!items.length || !keys.length) return null;
    return (
        <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                        {keys.map(k => (
                            <th key={k} className="text-left px-3 py-1.5 text-muted-foreground font-medium border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                {k}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-slate-50/60 dark:bg-slate-800/40'}>
                            {keys.map(k => (
                                <td key={k} className="px-3 py-1.5 text-foreground border-b border-slate-100 dark:border-slate-800 whitespace-nowrap max-w-xs truncate" title={String(item[k] ?? '')}>
                                    {item[k] == null
                                        ? <span className="text-muted-foreground">—</span>
                                        : String(item[k])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HealthScriptReportPage() {
    const { accounts } = useMsal();
    const router = useRouter();
    const { scriptId } = useParams<{ scriptId: string }>();
    const { request, cancel } = useApiRequest();

    const [script, setScript] = useState<HealthScript | null>(null);
    const [data, setData] = useState<DeviceRunStateReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);

    // ── Filters ────────────────────────────────────────────────────────────────
    const [stateFilter, setStateFilter] = useState<string[]>([]);   // 'success' | 'failed'
    const [outputFilter, setOutputFilter] = useState('');            // '' | 'has_output' | 'no_output'

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        if (!accounts.length || !scriptId) return;
        setLoading(true);
        setError(null);
        setIsCancelled(false);
        try {
            const [scriptResp, reportResp] = await Promise.all([
                request<ApiResponse<HealthScript>>(`${HEALTH_SCRIPTS_ENDPOINT}/${scriptId}`),
                request<ApiResponse<DeviceRunStateReport[]>>(HEALTH_SCRIPT_RUN_STATES_REPORT_ENDPOINT(scriptId)),
            ]);
            if (scriptResp?.data?.data) setScript(scriptResp.data.data);
            setData(reportResp?.data?.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch run-state report');
        } finally {
            setLoading(false);
        }
    }, [accounts.length, scriptId, request]);

    useEffect(() => {
        if (accounts.length > 0 && scriptId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length, scriptId]);

    // ── Stats ──────────────────────────────────────────────────────────────────

    const stats = useMemo(() => ({
        total:      data.length,
        success:    data.filter(r => normalizeState(r.detectionState) === 'success').length,
        failed:     data.filter(r => normalizeState(r.detectionState) === 'failed').length,
        withOutput: data.filter(r => !!r.parsedOutput?.length).length,
        noOutput:   data.filter(r => !r.parsedOutput?.length).length,
        withErrors: data.filter(r => !!r.scriptError).length,
    }), [data]);

    // ── Dynamic parsed-output column keys ─────────────────────────────────────

    const dynamicKeys = useMemo<string[]>(() => {
        const s = new Set<string>();
        data.forEach(r => r.parsedOutput?.forEach(o => Object.keys(o).forEach(k => s.add(k))));
        return Array.from(s);
    }, [data]);

    // ── Filtered device list ───────────────────────────────────────────────────

    const filteredData = useMemo(() => {
        let d = data;
        if (stateFilter.length)
            d = d.filter(r => stateFilter.includes(normalizeState(r.detectionState)));
        if (outputFilter === 'has_output') d = d.filter(r => !!r.parsedOutput?.length);
        if (outputFilter === 'no_output')  d = d.filter(r => !r.parsedOutput?.length);
        return d;
    }, [data, stateFilter, outputFilter]);

    const activeFilterCount = stateFilter.length + (outputFilter ? 1 : 0);

    // ── Script Output tab rows (one per parsedOutput item) ────────────────────
    // _deviceGroup alternates 0/1 per device so rows get a left-border stripe.

    const outputRows = useMemo<Record<string, unknown>[]>(() => {
        const rows: Record<string, unknown>[] = [];
        let group = 0;
        let lastId = '';
        filteredData.forEach((item, idx) => {
            if (item.deviceId !== lastId) { group = group === 0 ? 1 : 0; lastId = item.deviceId; }
            const base: Record<string, unknown> = {
                deviceId: item.deviceId, deviceName: item.deviceName,
                userPrincipalName: item.userPrincipalName, osVersion: item.osVersion,
                detectionState: item.detectionState, lastStateUpdateDateTime: item.lastStateUpdateDateTime,
                scriptError: item.scriptError, _deviceGroup: group,
            };
            if (item.parsedOutput?.length) {
                item.parsedOutput.forEach((o, oi) =>
                    rows.push({ ...base, id: `out-${item.deviceId}-${idx}-${oi}`, _noOutput: false, ...o })
                );
            } else {
                rows.push({ ...base, id: `out-${item.deviceId}-${idx}-0`, _noOutput: true });
            }
        });
        return rows;
    }, [filteredData]);

    // ── Device Overview tab rows (one per device) ─────────────────────────────

    const deviceRows = useMemo<Record<string, unknown>[]>(() =>
        filteredData.map((item, i) => ({
            id: `dev-${item.deviceId}-${i}`,
            deviceId: item.deviceId, deviceName: item.deviceName,
            userPrincipalName: item.userPrincipalName, osVersion: item.osVersion,
            detectionState: item.detectionState, remediationState: item.remediationState,
            lastStateUpdateDateTime: item.lastStateUpdateDateTime,
            outputCount: item.parsedOutput?.length ?? 0,
            hasError: !!item.scriptError, scriptError: item.scriptError,
            _parsedOutput: item.parsedOutput ?? [],
        })),
    [filteredData]);

    // ── Column definitions ─────────────────────────────────────────────────────

    const outputColumns = useMemo(() => [
        {
            key: 'detectionState', label: 'State', sortable: true, width: 120, minWidth: 100,
            render: (v: unknown) => <DetectionBadge state={String(v ?? '')} />,
        },
        // Dynamic parsed-output columns — the important data — come first
        ...dynamicKeys.map(key => ({
            key, label: key, sortable: true, searchable: true, width: 180, minWidth: 120,
            render: (v: unknown, row: Record<string, unknown>) => {
                if (row._noOutput) return <span className="text-muted-foreground text-xs italic">—</span>;
                if (v == null)     return <span className="text-muted-foreground">—</span>;
                return <span className="text-sm font-mono">{String(v)}</span>;
            },
        })),
        // Device info after the data so the user reads output first
        {
            key: 'deviceName', label: 'Device', sortable: true, searchable: true, width: 220, minWidth: 160,
            render: (_: unknown, row: Record<string, unknown>) => <DeviceCell row={row} />,
        },
        {
            key: 'lastStateUpdateDateTime', label: 'Last Updated', sortable: true, width: 160, minWidth: 130,
            render: (v: unknown) => v ? new Date(v as string).toLocaleString() : '—',
        },
    ], [dynamicKeys]);

    const deviceColumns = useMemo(() => [
        {
            key: 'deviceName', label: 'Device', sortable: true, searchable: true, width: 230, minWidth: 170,
            render: (_: unknown, row: Record<string, unknown>) => <DeviceCell row={row} />,
        },
        {
            key: 'detectionState', label: 'Detection State', sortable: true, width: 150, minWidth: 120,
            render: (v: unknown) => <DetectionBadge state={String(v ?? '')} />,
        },
        {
            key: 'remediationState', label: 'Remediation', sortable: true, width: 140, minWidth: 110,
            render: (v: unknown) => <Badge variant="secondary" className="text-xs">{String(v ?? '—')}</Badge>,
        },
        {
            key: 'outputCount', label: 'Output Items', sortable: true, width: 120, minWidth: 90,
            render: (v: unknown) => {
                const n = Number(v ?? 0);
                return n > 0
                    ? <Badge className="bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 text-xs">{n} item{n !== 1 ? 's' : ''}</Badge>
                    : <span className="text-muted-foreground text-xs">—</span>;
            },
        },
        {
            key: 'hasError', label: 'Error', sortable: true, width: 90, minWidth: 70,
            render: (v: unknown) => v
                ? <Badge variant="destructive" className="text-xs">Error</Badge>
                : <span className="text-muted-foreground text-xs">—</span>,
        },
        {
            key: 'lastStateUpdateDateTime', label: 'Last Updated', sortable: true, width: 165, minWidth: 130,
            render: (v: unknown) => v ? new Date(v as string).toLocaleString() : '—',
        },
    ], []);

    // ── Export datasets ────────────────────────────────────────────────────────

    const exportOutputData = useMemo((): ExportData => {
        const cols: ExportColumn[] = [
            { key: 'deviceName', label: 'Device' },
            { key: 'userPrincipalName', label: 'User' },
            { key: 'osVersion', label: 'OS Version' },
            { key: 'detectionState', label: 'Detection State' },
            { key: 'lastStateUpdateDateTime', label: 'Last Updated',
              getValue: r => r.lastStateUpdateDateTime ? new Date(r.lastStateUpdateDateTime as string).toLocaleString() : '' },
            ...dynamicKeys.map(k => ({
                key: k, label: k,
                getValue: (r: Record<string, unknown>) => r._noOutput ? '' : String(r[k] ?? ''),
            })),
        ];
        return {
            data: outputRows.filter(r => !r._noOutput),
            columns: cols,
            filename: `health-script-output-${scriptId}`,
            title: `${script?.displayName ?? scriptId} — Script Output`,
            stats: [
                { label: 'Total Devices', value: stats.total },
                { label: 'Success',       value: stats.success },
                { label: 'Failed',        value: stats.failed },
                { label: 'With Output',   value: stats.withOutput },
            ],
        };
    }, [outputRows, dynamicKeys, scriptId, script, stats]);

    const exportDeviceData = useMemo((): ExportData => ({
        data: deviceRows,
        columns: [
            { key: 'deviceName',    label: 'Device' },
            { key: 'userPrincipalName', label: 'User' },
            { key: 'osVersion',     label: 'OS Version' },
            { key: 'detectionState', label: 'Detection State' },
            { key: 'remediationState', label: 'Remediation State' },
            { key: 'outputCount',   label: 'Output Items', getValue: r => String(r.outputCount ?? 0) },
            { key: 'hasError',      label: 'Has Error',    getValue: r => r.hasError ? 'Yes' : 'No' },
            { key: 'lastStateUpdateDateTime', label: 'Last Updated',
              getValue: r => r.lastStateUpdateDateTime ? new Date(r.lastStateUpdateDateTime as string).toLocaleString() : '' },
        ],
        filename: `health-script-devices-${scriptId}`,
        title: `${script?.displayName ?? scriptId} — Device Overview`,
        stats: [
            { label: 'Total Devices', value: stats.total },
            { label: 'Success',       value: stats.success },
            { label: 'Failed',        value: stats.failed },
        ],
    }), [deviceRows, scriptId, script, stats]);

    // ── Filter toggle helpers ──────────────────────────────────────────────────

    const toggleState = useCallback((s: string) =>
        setStateFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]),
    []);

    const clearFilters = useCallback(() => {
        setStateFilter([]);
        setOutputFilter('');
    }, []);

    // ── Render ─────────────────────────────────────────────────────────────────

    const hasData = data.length > 0;
    const scriptName = script?.displayName ?? scriptId;

    return (
        <div className="p-4 lg:p8 space-y-6 w-full max-w-none">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.push('/scripts/health')}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 -ml-1"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Health Scripts
                    </button>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{scriptName}</h1>
                    {script?.description && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm max-w-2xl">{script.description}</p>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
                        Device run-state report · pre-remediation detection output
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {hasData && (
                        <ExportButton
                            exportOptions={[
                                { label: 'Export Script Output',  data: exportOutputData, formats: ['csv', 'pdf', 'html'] },
                                { label: 'Export Device Overview', data: exportDeviceData, formats: ['csv', 'pdf', 'html'] },
                            ]}
                            variant="outline"
                            size="sm"
                        />
                    )}
                    <Button onClick={fetchData} variant={hasData ? 'outline' : 'default'} size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {hasData ? 'Refresh' : 'Load Report'}
                    </Button>
                    {loading && !hasData && (
                        <Button
                            onClick={() => { cancel(); setData([]); setLoading(false); setIsCancelled(true); }}
                            variant="destructive" size="sm"
                        >
                            <XCircle className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Error ───────────────────────────────────────────────────── */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="pt-4 pb-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                        <Button onClick={fetchData} variant="outline" size="sm" className="w-fit">
                            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Cancelled ───────────────────────────────────────────────── */}
            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => { setIsCancelled(false); fetchData(); }}
                    title="Loading Cancelled"
                    description="Report loading was cancelled."
                    buttonText="Load Report"
                />
            )}

            {/* ── Loading ─────────────────────────────────────────────────── */}
            {loading && !hasData && (
                <Card>
                    <CardContent className="pt-6 text-center py-16">
                        <RefreshCw className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium">Loading Report…</p>
                        <p className="text-muted-foreground text-sm mt-1">Fetching device run states from Intune</p>
                    </CardContent>
                </Card>
            )}

            {/* ── Empty ───────────────────────────────────────────────────── */}
            {!hasData && !loading && !error && !isCancelled && (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-medium mb-4">No report loaded</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            Load the report to see device run states and parsed script output
                        </p>
                        <Button onClick={fetchData} size="lg">
                            <Database className="h-5 w-5 mr-2" /> Load Report
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Main content ────────────────────────────────────────────── */}
            {hasData && (
                <>
                    {/* ── Clickable filter / stats strip ────────────────── */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">

                        {/* Total — clears all filters */}
                        <button onClick={clearFilters} className="focus:outline-none" title="Clear all filters">
                            <Badge
                                variant={activeFilterCount === 0 ? 'default' : 'secondary'}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {filteredData.length}{activeFilterCount > 0 ? ` of ${stats.total}` : ''} device{stats.total !== 1 ? 's' : ''}
                            </Badge>
                        </button>

                        {/* Success */}
                        {stats.success > 0 && (() => {
                            const active = stateFilter.includes('success');
                            return (
                                <button onClick={() => toggleState('success')} className="focus:outline-none">
                                    <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-700 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-green-500' : ''}`}>
                                        <CheckCircle className="h-3 w-3" /> {stats.success} success
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* Failed */}
                        {stats.failed > 0 && (() => {
                            const active = stateFilter.includes('failed');
                            return (
                                <button onClick={() => toggleState('failed')} className="focus:outline-none">
                                    <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-700 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-red-500' : ''}`}>
                                        <AlertTriangle className="h-3 w-3" /> {stats.failed} failed
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* With output */}
                        {stats.withOutput > 0 && (() => {
                            const active = outputFilter === 'has_output';
                            return (
                                <button onClick={() => setOutputFilter(active ? '' : 'has_output')} className="focus:outline-none">
                                    <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}>
                                        <FileJson className="h-3 w-3" /> {stats.withOutput} with output
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* No output */}
                        {stats.noOutput > 0 && (() => {
                            const active = outputFilter === 'no_output';
                            return (
                                <button onClick={() => setOutputFilter(active ? '' : 'no_output')} className="focus:outline-none">
                                    <Badge variant="outline" className={`cursor-pointer hover:opacity-80 transition-opacity bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-600 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}>
                                        {stats.noOutput} no output
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* With errors — info only */}
                        {stats.withErrors > 0 && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {stats.withErrors} with errors
                            </Badge>
                        )}

                        {/* Clear link */}
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1">
                                <X className="h-3 w-3" /> Clear filters
                            </button>
                        )}
                    </div>

                    {/* ── Tabs ──────────────────────────────────────────── */}
                    <Tabs defaultValue="output">
                        <TabsList>
                            <TabsTrigger value="output" className="flex items-center gap-1.5">
                                <TableProperties className="h-4 w-4" />
                                Script Output
                                {dynamicKeys.length > 0 && (
                                    <Badge variant="secondary" className="text-xs ml-1 py-0 px-1.5 h-4">
                                        {dynamicKeys.length} col{dynamicKeys.length !== 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="devices" className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                Device Overview
                                <Badge variant="secondary" className="text-xs ml-1 py-0 px-1.5 h-4">
                                    {filteredData.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Script Output ──────────────────────────────── */}
                        <TabsContent value="output">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>Parsed Detection Output</span>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {outputRows.length} row{outputRows.length !== 1 ? 's' : ''}
                                            {dynamicKeys.length > 0 && ` · ${dynamicKeys.length} output column${dynamicKeys.length !== 1 ? 's' : ''}`}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                        {dynamicKeys.length > 0
                                            ? 'One row per output item. Rows from the same device share a left-border colour. Expand a row with an error to see the error message.'
                                            : 'No JSON output columns detected — the script may not return structured output yet.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <DataTable
                                        data={outputRows}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        columns={outputColumns as any}
                                        searchPlaceholder="Search output, devices, users…"
                                        rowClassName={row =>
                                            row._deviceGroup === 1
                                                ? 'border-l-4 border-l-blue-200 dark:border-l-blue-800'
                                                : 'border-l-4 border-l-transparent'
                                        }
                                        expandedRowRender={row => {
                                            if (!row.scriptError) return null;
                                            return (
                                                <div className="px-6 py-2 bg-red-50/40 dark:bg-red-950/10 text-sm border-t border-red-100 dark:border-red-900">
                                                    <span className="font-medium text-red-600 dark:text-red-400 mr-2">Script error:</span>
                                                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{String(row.scriptError)}</span>
                                                </div>
                                            );
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Device Overview ──────────────────────────────── */}
                        <TabsContent value="devices">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span>Device Run States</span>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {deviceRows.length} device{deviceRows.length !== 1 ? 's' : ''}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                        One row per device. Expand a row to see its full parsed output inline.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <DataTable
                                        data={deviceRows}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        columns={deviceColumns as any}
                                        searchPlaceholder="Search devices, users…"
                                        expandedRowRender={row => {
                                            const parsed = row._parsedOutput as Record<string, unknown>[];
                                            const scriptErr = row.scriptError ? String(row.scriptError) : null;
                                            if (!parsed.length && !scriptErr) return null;
                                            return (
                                                <div className="px-6 py-3 space-y-3 bg-slate-50/60 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800">
                                                    {scriptErr && (
                                                        <div className="text-sm">
                                                            <span className="font-medium text-red-600 dark:text-red-400 mr-2">Script error:</span>
                                                            <span className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{scriptErr}</span>
                                                        </div>
                                                    )}
                                                    {parsed.length > 0 && (
                                                        <MiniOutputTable items={parsed} keys={dynamicKeys} />
                                                    )}
                                                </div>
                                            );
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}


