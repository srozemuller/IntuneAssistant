'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/DataTable';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Camera,
    RefreshCw,
    Trash2,
    Eye,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    AlertCircle,
    MonitorCheck,
    ChevronRight,
    FileText,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    MONITOR_CONFIGURATION_SNAPSHOTS,
    MONITOR_CONFIGURATION_SNAPSHOTS_JOBS,
    MONITOR_SNAPSHOTS_JOB_BY_ID,
    MONITOR_SNAPSHOT_BY_ID,
} from '@/lib/constants';
import { CancelledCard } from '@/components/CancelledCard';
import { CreateSnapshotDialog } from '@/components/CreateSnapshotDialog';

type JobStatus = 'notStarted' | 'inProgress' | 'succeeded' | 'partiallySuccessful' | 'failed';

interface SnapshotJob {
    id: string;
    displayName: string;
    description: string;
    status: JobStatus;
    resources: string[];
    createdDateTime: string;
    completedDateTime: string | null;
    snapshotId: string | null;
    error: unknown;
}

interface SnapshotResource {
    displayName: string;
    resourceType: string;
    resourceId: string;
}

interface Snapshot {
    id: string;
    displayName: string;
    description: string;
    createdDateTime: string;
    resources: SnapshotResource[];
}

interface ApiEnvelope<T> {
    status: number;
    message: string;
    data: T;
}

const STATUS_CONFIG: Record<JobStatus, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ComponentType<{ className?: string }>;
    spin?: boolean;
}> = {
    notStarted:          { label: 'Not Started', variant: 'secondary',   icon: Clock },
    inProgress:          { label: 'In Progress', variant: 'default',     icon: Loader2, spin: true },
    succeeded:           { label: 'Succeeded',   variant: 'default',     icon: CheckCircle },
    partiallySuccessful: { label: 'Partial',     variant: 'outline',     icon: AlertCircle },
    failed:              { label: 'Failed',      variant: 'destructive', icon: XCircle },
};

function StatusBadge({ status }: { status: JobStatus }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.notStarted;
    const Icon = cfg.icon;
    return (
        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
            <Icon className={`h-3 w-3 ${cfg.spin ? 'animate-spin' : ''}`} />
            {cfg.label}
        </Badge>
    );
}

function fmtDate(dt: string | null | undefined) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString();
}

function fmtResourceType(rt: string) {
    return rt
        .replace(/^microsoft\.intune\./i, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export default function SnapshotsPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const router = useRouter();

    const [jobs, setJobs] = useState<SnapshotJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [deleteJob, setDeleteJob] = useState<SnapshotJob | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [detailsJob, setDetailsJob] = useState<SnapshotJob | null>(null);
    const [detailsSnapshot, setDetailsSnapshot] = useState<Snapshot | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchJobs = useCallback(async () => {
        if (accounts.length === 0) return;
        setLoading(true);
        setIsCancelled(false);
        try {
            const resp = await request<ApiEnvelope<SnapshotJob[]>>(
                MONITOR_CONFIGURATION_SNAPSHOTS_JOBS,
                { method: 'GET' }
            );
            if (resp === undefined) { setIsCancelled(true); return; }
            const raw = resp.data?.data;
            setJobs(Array.isArray(raw) ? raw : raw ? [raw as SnapshotJob] : []);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleCreate = async (payload: { displayName: string; description: string; resources: string[] }) => {
        setIsCreating(true);
        try {
            await request<ApiEnvelope<SnapshotJob>>(
                MONITOR_CONFIGURATION_SNAPSHOTS,
                { method: 'POST', body: JSON.stringify(payload) }
            );
            await fetchJobs();
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteJob) return;
        setIsDeleting(true);
        try {
            await request(MONITOR_SNAPSHOTS_JOB_BY_ID(deleteJob.id), { method: 'DELETE' });
            setDeleteJob(null);
            await fetchJobs();
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetails = async (job: SnapshotJob) => {
        setDetailsJob(job);
        setDetailsSnapshot(null);
        setLoadingDetails(true);
        try {
            const jr = await request<ApiEnvelope<SnapshotJob>>(MONITOR_SNAPSHOTS_JOB_BY_ID(job.id), { method: 'GET' });
            const fullJob = jr?.data?.data ?? job;
            setDetailsJob(fullJob);
            if (fullJob?.snapshotId) {
                const sr = await request<ApiEnvelope<Snapshot>>(MONITOR_SNAPSHOT_BY_ID(fullJob.snapshotId), { method: 'GET' });
                if (sr?.data?.data) setDetailsSnapshot(sr.data.data);
            }
        } finally {
            setLoadingDetails(false);
        }
    };

    const columns = [
        {
            key: 'displayName',
            label: 'Name',
            render: (_: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as SnapshotJob;
                return (
                    <div>
                        <p className="font-medium">{job.displayName}</p>
                        {job.description && <p className="text-xs text-muted-foreground">{job.description}</p>}
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (_: unknown, row: Record<string, unknown>) => <StatusBadge status={(row as unknown as SnapshotJob).status} />,
        },
        {
            key: 'resources',
            label: 'Resources',
            render: (_: unknown, row: Record<string, unknown>) => (
                <Badge variant="outline">{((row as unknown as SnapshotJob).resources?.length ?? 0)} types</Badge>
            ),
        },
        {
            key: 'createdDateTime',
            label: 'Created',
            render: (_: unknown, row: Record<string, unknown>) => (
                <span className="text-sm text-muted-foreground">{fmtDate((row as unknown as SnapshotJob).createdDateTime)}</span>
            ),
        },
        {
            key: 'completedDateTime',
            label: 'Completed',
            render: (_: unknown, row: Record<string, unknown>) => (
                <span className="text-sm text-muted-foreground">{fmtDate((row as unknown as SnapshotJob).completedDateTime)}</span>
            ),
        },
        {
            key: 'id',
            label: 'Actions',
            render: (_: unknown, row: Record<string, unknown>) => {
                const job = row as unknown as SnapshotJob;
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetails(job)} title="View details">
                            <Eye className="h-4 w-4" />
                        </Button>
                        {job.status === 'succeeded' && job.snapshotId && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/monitor/add')}
                                title="Create monitor from snapshot"
                                className="text-primary border-primary/30 hover:bg-primary/10"
                            >
                                <MonitorCheck className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteJob(job)}
                            title="Delete snapshot job"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const succeededCount  = jobs.filter(j => j.status === 'succeeded').length;
    const inProgressCount = jobs.filter(j => j.status === 'inProgress').length;
    const failedCount     = jobs.filter(j => j.status === 'failed').length;

    if (isCancelled) return <CancelledCard onRetry={fetchJobs} />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Camera className="h-6 w-6" />
                        Configuration Snapshots
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Capture, manage, and use point-in-time snapshots of your Intune configuration.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Snapshot
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{succeededCount}</p>
                            <p className="text-xs text-muted-foreground">Succeeded</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <Loader2 className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                            <p className="text-xs text-muted-foreground">In Progress</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                        <div>
                            <p className="text-2xl font-bold">{failedCount}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Snapshot Jobs</CardTitle>
                    <CardDescription>
                        {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading snapshots…</span>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <Camera className="h-12 w-12 opacity-30" />
                            <p className="font-medium">No snapshots yet</p>
                            <p className="text-sm">Create your first snapshot to capture a configuration baseline.</p>
                            <Button size="sm" onClick={() => setCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />New Snapshot
                            </Button>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={jobs as unknown as Record<string, unknown>[]} />
                    )}
                </CardContent>
            </Card>

            {/* Create dialog */}
            <CreateSnapshotDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreate}
                isSubmitting={isCreating}
            />

            {/* Delete confirm */}
            <Dialog open={!!deleteJob} onOpenChange={o => { if (!o) setDeleteJob(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            Delete Snapshot Job
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteJob?.displayName}</strong>?
                            This cannot be undone and will also remove the associated snapshot data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteJob(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting
                                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting…</>
                                : <><Trash2 className="h-4 w-4 mr-2" />Delete</>
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details dialog */}
            <Dialog open={!!detailsJob} onOpenChange={o => { if (!o) { setDetailsJob(null); setDetailsSnapshot(null); } }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {detailsJob?.displayName}
                        </DialogTitle>
                        <DialogDescription>Snapshot job details and captured resources.</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-5 py-2 pr-1">
                        {loadingDetails ? (
                            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" /><span>Loading details…</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                                        {detailsJob && <StatusBadge status={detailsJob.status} />}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Snapshot ID</p>
                                        <p className="font-mono text-xs">{detailsJob?.snapshotId ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Created</p>
                                        <p>{fmtDate(detailsJob?.createdDateTime)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Completed</p>
                                        <p>{fmtDate(detailsJob?.completedDateTime)}</p>
                                    </div>
                                </div>

                                {(detailsJob?.resources?.length ?? 0) > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold">Requested Resource Types</p>
                                        <div className="flex flex-wrap gap-2">
                                            {detailsJob!.resources.map(r => (
                                                <Badge key={r} variant="secondary" className="font-mono text-xs">{r}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailsSnapshot && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold flex items-center gap-2">
                                            <Camera className="h-4 w-4" />
                                            Captured Resources ({detailsSnapshot.resources?.length ?? 0})
                                        </p>
                                        {(detailsSnapshot.resources?.length ?? 0) === 0 ? (
                                            <p className="text-sm text-muted-foreground">No resources captured.</p>
                                        ) : (
                                            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                                                {detailsSnapshot.resources.map((res, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{res.displayName}</p>
                                                            <p className="text-xs text-muted-foreground font-mono truncate">{fmtResourceType(res.resourceType)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {detailsJob?.status === 'succeeded' && detailsJob.snapshotId && (
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-sm">Ready to monitor</p>
                                            <p className="text-xs text-muted-foreground">
                                                Use this snapshot as a baseline to create a drift monitor.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setDetailsJob(null);
                                                setDetailsSnapshot(null);
                                                router.push('/monitor/add');
                                            }}
                                        >
                                            <MonitorCheck className="h-4 w-4 mr-2" />Create Monitor
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setDetailsJob(null); setDetailsSnapshot(null); }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}







