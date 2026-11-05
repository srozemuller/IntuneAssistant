'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/DataTable';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import {
    PlayCircle,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ShieldQuestion,
    Users,
    Ban,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    X,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    GAP_ANALYSIS_COMPLIANCE_COVERAGE_RUN_ENDPOINT,
    GAP_ANALYSIS_COMPLIANCE_COVERAGE_RUN_STATUS_ENDPOINT,
    GAP_ANALYSIS_COMPLIANCE_COVERAGE_RUN_CANCEL_ENDPOINT,
} from '@/lib/constants';
import { CompliancePolicyCoverageDto, DeviceComplianceCoverageDto, ComplianceCoverageRunSummaryDto } from '@/types/gapAnalysis';

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

interface ComplianceCoverageRun {
    id: string;
    status: 'Pending' | 'Running' | 'Success' | 'Failed' | 'Cancelled' | 'ResultExpired';
    progressPercent: number;
    progressMessage: string | null;
    resultJson: string | null;
    reportExportJobId: string | null;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
}

const RUN_TERMINAL_STATUSES = new Set(['Success', 'Failed', 'Cancelled', 'ResultExpired']);
const ACTIVE_RUN_STORAGE_KEY = 'complianceCoverageActiveRunId';

const RESULT_BADGE: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; className: string; icon: React.ReactNode }> = {
    ShouldApply: { variant: 'default', className: 'bg-green-600', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    ShouldApplyButMissing: { variant: 'destructive', className: '', icon: <XCircle className="h-3 w-3 mr-1" /> },
    NotTargeted: { variant: 'secondary', className: '', icon: <HelpCircle className="h-3 w-3 mr-1" /> },
    Excluded: { variant: 'secondary', className: '', icon: <XCircle className="h-3 w-3 mr-1" /> },
    FilteredOut: { variant: 'outline', className: 'border-amber-500 text-amber-600', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
    Unknown: { variant: 'outline', className: 'border-purple-500 text-purple-600', icon: <ShieldQuestion className="h-3 w-3 mr-1" /> },
};

function ResultBadge({ result }: { result: string }) {
    const cfg = RESULT_BADGE[result] ?? RESULT_BADGE.Unknown;
    return (
        <Badge variant={cfg.variant} className={cfg.className}>
            {cfg.icon}
            {result}
        </Badge>
    );
}

function formatDate(dateString?: string | null): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

/** Check > Compliance coverage: why each device in Intune's "no compliance policy" report has no compliance policy, per assignment. */
export default function ComplianceCoverageAnalysisPage() {
    const { request: startRequest } = useApiRequest();
    const { request: pollRequest } = useApiRequest();
    const { request: cancelRequest } = useApiRequest();

    const [starting, setStarting] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [run, setRun] = useState<ComplianceCoverageRun | null>(null);
    const [results, setResults] = useState<ComplianceCoverageRunSummaryDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [platformFilter, setPlatformFilter] = useState<string>('all');
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleExpandedRow = (deviceId: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(deviceId)) next.delete(deviceId);
            else next.add(deviceId);
            return next;
        });
    };

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // A failed poll (run not found, network hiccup, tenant mismatch) must not spin forever — give
    // up after a few consecutive misses instead of retrying every 2s indefinitely.
    const consecutiveFailuresRef = useRef(0);
    const MAX_CONSECUTIVE_POLL_FAILURES = 3;

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    const pollRun = useCallback(async (runId: string) => {
        const result = await pollRequest<ApiResponse<ComplianceCoverageRun>>(GAP_ANALYSIS_COMPLIANCE_COVERAGE_RUN_STATUS_ENDPOINT(runId));
        const current = result?.data?.data;

        if (!current) {
            consecutiveFailuresRef.current += 1;
            if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_POLL_FAILURES) {
                stopPolling();
                setStarting(false);
                setRun(null);
                sessionStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);
                setError('Lost track of this analysis run (it may no longer exist) — please start a new one.');
            }
            return;
        }
        consecutiveFailuresRef.current = 0;

        setRun(current);

        if (RUN_TERMINAL_STATUSES.has(current.status)) {
            stopPolling();
            setStarting(false);
            sessionStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);

            if (current.status === 'Success' && current.resultJson) {
                try {
                    setResults(JSON.parse(current.resultJson) as ComplianceCoverageRunSummaryDto);
                } catch {
                    setError('The analysis completed but its results could not be parsed.');
                }
            } else if (current.status === 'Failed') {
                setError(current.errorMessage || 'The analysis run failed.');
            } else if (current.status === 'Cancelled') {
                setError('The analysis was cancelled and its data removed.');
            } else if (current.status === 'ResultExpired') {
                setError(current.progressMessage || 'This run\'s results are no longer available — please run the analysis again.');
            }
        }
    }, [pollRequest, stopPolling]);

    const startPolling = useCallback((runId: string) => {
        stopPolling();
        consecutiveFailuresRef.current = 0;
        sessionStorage.setItem(ACTIVE_RUN_STORAGE_KEY, runId);
        pollingIntervalRef.current = setInterval(() => pollRun(runId), 2000);
        pollRun(runId);
    }, [pollRun, stopPolling]);

    // Resume polling an in-progress run after a page refresh.
    useEffect(() => {
        const activeRunId = sessionStorage.getItem(ACTIVE_RUN_STORAGE_KEY);
        if (activeRunId) {
            setStarting(true);
            startPolling(activeRunId);
        }
        return () => stopPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runAnalysis = useCallback(async () => {
        setError(null);
        setResults(null);
        setRun(null);
        setStarting(true);
        setStatusFilter('all');
        setPlatformFilter('all');

        const startResult = await startRequest<ApiResponse<{ runId: string }>>(
            GAP_ANALYSIS_COMPLIANCE_COVERAGE_RUN_ENDPOINT,
            { method: 'POST' }
        );

        const runId = startResult?.data?.data?.runId;
        if (!runId) {
            setError(startResult?.data?.message || 'Could not start the analysis.');
            setStarting(false);
            return;
        }

        startPolling(runId);
    }, [startRequest, startPolling]);

    const cancelRun = useCallback(async () => {
        if (!run) return;
        setCancelling(true);
        try {
            await cancelRequest(GAP_ANALYSIS_COMPLIANCE_COVERAGE_RUN_CANCEL_ENDPOINT(run.id), { method: 'POST' });
        } finally {
            stopPolling();
            sessionStorage.removeItem(ACTIVE_RUN_STORAGE_KEY);
            setStarting(false);
            setCancelling(false);
            setRun(null);
            setError('Analysis cancelled — nothing gathered so far was kept.');
        }
    }, [run, cancelRequest, stopPolling]);

    const columns = [
        {
            key: 'deviceName', label: 'Device', minWidth: 180, sortable: true, searchable: true,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceComplianceCoverageDto;
                const isExpanded = expandedRows.has(device.managedDeviceId);
                return (
                    <span className="flex items-center gap-1.5">
                        {isExpanded
                            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                        <span>{value as string}</span>
                    </span>
                );
            },
        },
        {
            key: 'managedDeviceId', label: 'Managed Device ID', minWidth: 220, searchable: true,
            render: (value: unknown) => <code className="text-xs">{(value as string) || '—'}</code>,
        },
        {
            key: 'platform', label: 'Platform', minWidth: 100, sortable: true,
        },
        {
            key: 'userPrincipalName', label: 'User', minWidth: 180, searchable: true,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceComplianceCoverageDto;
                return device.isUserless ? <span className="text-muted-foreground italic">No associated user</span> : (value as string) || '—';
            },
        },
        {
            key: 'lastSyncDateTime', label: 'Last Sync', minWidth: 160, sortable: true,
            sortValue: (row: Record<string, unknown>) => (row.lastSyncDateTime as string) || '',
            render: (value: unknown) => formatDate(value as string | null),
        },
        {
            key: 'overallResult', label: 'Result', minWidth: 180, sortable: true,
            render: (value: unknown) => <ResultBadge result={value as string} />,
        },
        {
            key: 'policyResults', label: 'Policies Evaluated', minWidth: 140,
            render: (value: unknown) => ((value as CompliancePolicyCoverageDto[]) ?? []).length,
        },
    ];

    // Counts respect the *other* active filter, so picking a platform narrows the status counts
    // shown next to each option, and vice versa — matching devices/overview's filter chain.
    const statusOptions = useMemo(() => {
        if (!results) return [];
        const scoped = results.devices.filter(d => platformFilter === 'all' || d.platform === platformFilter);
        const counts = new Map<string, number>();
        for (const d of scoped) counts.set(d.overallResult, (counts.get(d.overallResult) ?? 0) + 1);
        return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [results, platformFilter]);

    const platformOptions = useMemo(() => {
        if (!results) return [];
        const scoped = results.devices.filter(d => statusFilter === 'all' || d.overallResult === statusFilter);
        const counts = new Map<string, number>();
        for (const d of scoped) counts.set(d.platform, (counts.get(d.platform) ?? 0) + 1);
        return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [results, statusFilter]);

    const filteredDevices = useMemo(() => {
        if (!results) return [];
        return results.devices.filter(d =>
            (statusFilter === 'all' || d.overallResult === statusFilter) &&
            (platformFilter === 'all' || d.platform === platformFilter)
        );
    }, [results, statusFilter, platformFilter]);

    const isRunning = starting && run && !RUN_TERMINAL_STATUSES.has(run.status);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldQuestion className="h-6 w-6" />
                        Compliance coverage
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Starts the real Intune &quot;devices without a compliance policy&quot; report, waits for it,
                        and explains why for each device — evidence-based, per assignment, never a guess.
                    </p>
                </div>
                <Button onClick={runAnalysis} disabled={!!isRunning}>
                    {isRunning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                    {isRunning ? 'Running…' : 'Run Analysis'}
                </Button>
            </div>

            {isRunning && (
                <Card className="border-blue-500">
                    <CardContent className="pt-6 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>{run?.progressMessage || 'Starting…'}</span>
                            <span className="text-muted-foreground">{run?.progressPercent ?? 0}%</span>
                        </div>
                        <Progress value={run?.progressPercent ?? 0} />
                        {run?.reportExportJobId && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground shrink-0">Intune export job:</span>
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">
                                    {run.reportExportJobId}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(run.reportExportJobId || '')}
                                    className="h-6 px-2 text-xs shrink-0"
                                >
                                    Copy
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                This schedules a report export at Intune and waits for it to finish — it can take anywhere
                                from a few seconds to a few minutes depending on tenant size.
                            </p>
                            <Button size="sm" variant="outline" onClick={cancelRun} disabled={cancelling}>
                                <Ban className="h-3.5 w-3.5 mr-2" />
                                {cancelling ? 'Cancelling…' : 'Cancel'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!results && !isRunning && !error && (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground py-12">
                        <ShieldQuestion className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p>Run the analysis to see which devices lack a compliance policy and why.</p>
                    </CardContent>
                </Card>
            )}

            {isRunning && !run?.progressPercent && (
                <AssignmentsTableSkeleton showStats={true} statsCount={4} showFilters={false} tableRows={8} tableColumns={5} />
            )}

            {results && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground font-normal">Devices without a compliance policy</CardTitle>
                            </CardHeader>
                            <CardContent><div className="text-2xl font-bold">{results.totalDevicesWithoutCompliancePolicy}</div></CardContent>
                        </Card>
                        {Object.entries(results.resultCounts).map(([result, count]) => (
                            <Card key={result}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground font-normal">{result}</CardTitle>
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold">{count}</div></CardContent>
                            </Card>
                        ))}
                    </div>

                    {Object.keys(results.skippedPlatformCounts).length > 0 && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Skipped or unresolved rows</CardTitle></CardHeader>
                            <CardContent className="flex gap-4 flex-wrap">
                                {Object.entries(results.skippedPlatformCounts).map(([platform, count]) => (
                                    <div key={platform} className="text-sm"><span className="font-medium">{count}</span> {platform}</div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-lg">Filters</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {filtersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                    {!filtersExpanded && (statusFilter !== 'all' || platformFilter !== 'all') && (
                                        <Badge variant="secondary" className="text-xs">
                                            {(statusFilter !== 'all' ? 1 : 0) + (platformFilter !== 'all' ? 1 : 0)} filter(s) active
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        Showing {filteredDevices.length} of {results.devices.length} device(s)
                                    </span>
                                    {(statusFilter !== 'all' || platformFilter !== 'all') && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { setStatusFilter('all'); setPlatformFilter('all'); }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Clear All Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {!filtersExpanded && (statusFilter !== 'all' || platformFilter !== 'all') && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {statusFilter !== 'all' && (
                                        <Badge variant="default" className="flex items-center gap-1 text-xs">
                                            Status: {statusFilter}
                                            <button onClick={() => setStatusFilter('all')} className="ml-1 hover:bg-black/20 rounded-full p-0.5">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {platformFilter !== 'all' && (
                                        <Badge variant="default" className="flex items-center gap-1 text-xs">
                                            Platform: {platformFilter}
                                            <button onClick={() => setPlatformFilter('all')} className="ml-1 hover:bg-black/20 rounded-full p-0.5">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardHeader>

                        {filtersExpanded && (
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('all')}
                                        >
                                            All ({results.devices.filter(d => platformFilter === 'all' || d.platform === platformFilter).length})
                                        </Button>
                                        {statusOptions.map(([value, count]) => (
                                            <Button
                                                key={value}
                                                variant={statusFilter === value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setStatusFilter(value)}
                                            >
                                                {value} ({count})
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Platform</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={platformFilter === 'all' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPlatformFilter('all')}
                                        >
                                            All ({results.devices.filter(d => statusFilter === 'all' || d.overallResult === statusFilter).length})
                                        </Button>
                                        {platformOptions.map(([value, count]) => (
                                            <Button
                                                key={value}
                                                variant={platformFilter === value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setPlatformFilter(value)}
                                            >
                                                {value} ({count})
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <DataTable
                        data={filteredDevices as unknown as Record<string, unknown>[]}
                        columns={columns}
                        showSearch={true}
                        searchPlaceholder="Search devices…"
                        onRowClick={(row) => {
                            const device = row as unknown as DeviceComplianceCoverageDto;
                            toggleExpandedRow(device.managedDeviceId);
                        }}
                        expandedRowRender={(row) => {
                            const device = row as unknown as DeviceComplianceCoverageDto;
                            if (!expandedRows.has(device.managedDeviceId)) return null;
                            return (
                                <div className="p-4 space-y-3 bg-muted/30">
                                    {device.showUserlessAdvisory && (
                                        <div className="flex items-start gap-2 text-sm bg-blue-500/10 border border-blue-500/30 rounded p-3">
                                            <Users className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>
                                                This device has no primary user and no compliance policy applies. A user-group
                                                assignment can never match a userless device — if this is intentionally a shared
                                                device, assign compliance policies via a group containing the device itself
                                                (or &quot;All Devices&quot;), not a user group.
                                            </span>
                                        </div>
                                    )}
                                    {device.policyResults.map(policy => (
                                        <div key={policy.policyId} className="border rounded p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">{policy.policyName}</span>
                                                <ResultBadge result={policy.result} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{policy.reason}</p>
                                            <ul className="space-y-1">
                                                {policy.assignmentEvidence.map((e, i) => (
                                                    <li key={i} className="text-xs pl-3 border-l-2 border-muted-foreground/30">
                                                        <span className="font-medium">{e.verdict}</span>
                                                        {e.groupName && <> — group &quot;{e.groupName}&quot;</>}
                                                        {e.matchedVia !== 'None' && <> (via {e.matchedVia})</>}
                                                        : {e.note}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                </>
            )}
        </div>
    );
}
