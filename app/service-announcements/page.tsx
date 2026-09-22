'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Megaphone, RefreshCw, AlertTriangle, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { SERVICE_ANNOUNCEMENTS_MESSAGES_ENDPOINT } from '@/lib/constants';
import { DataTable } from '@/components/DataTable';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ServiceAnnouncementMessage extends Record<string, unknown> {
    id: string;
    title: string;
    category: string | null;
    severity: string | null;
    isMajorChange: boolean;
    services: string[];
    tags: string[];
    startDateTime: string | null;
    endDateTime: string | null;
    actionRequiredByDateTime: string | null;
    lastModifiedDateTime: string | null;
    bodyContent: string | null;
    bodyContentType: string | null;
    isRead: boolean;
    isFavorited: boolean;
    isArchived: boolean;
    roadmapIds: string[];
    tenantRollouts: ServiceAnnouncementFeatureRollout[];
    tenantRolloutStatus: string | null;
}

interface ServiceAnnouncementFeatureRollout {
    roadmapId: number;
    mcPostId: string | null;
    platform: string | null;
    status: string | null;
    lastUpdateTime: string | null;
    latestRing: string | null;
    tenantRolloutRing: string | null;
}

interface ApiResponse {
    status: string;
    message: string;
    data: ServiceAnnouncementMessage[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// DataTable paginates client-side over whatever `data` it's given, so we fetch one bounded
// batch (not the true per-page size shown in the table) rather than wiring it to per-click
// server paging — DataTable's `totalPages`/`onPageChange` props don't support partial data.
const FETCH_BATCH_SIZE = 1000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function severityBadgeClass(severity: string | null): string {
    switch ((severity || '').toLowerCase()) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        default: return 'bg-blue-500';
    }
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
        }).format(new Date(iso));
    } catch { return iso; }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ServiceAnnouncementsPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [messages, setMessages] = useState<ServiceAnnouncementMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ServiceAnnouncementMessage | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
    const [filterService, setFilterService] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterTag, setFilterTag] = useState('all');
    const [onlyMajorChanges, setOnlyMajorChanges] = useState(false);
    const [filterRolloutStatus, setFilterRolloutStatus] = useState('all');

    // Populated from whatever's actually come back so far — only ever grows, so picking a
    // service/tag filter doesn't collapse the other dropdown's own option list on refetch.
    const [availableServices, setAvailableServices] = useState<string[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    const fetchMessages = useCallback(async () => {
        if (accounts.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filterService !== 'all') params.set('services', filterService);
            if (filterSeverity !== 'all') params.set('severities', filterSeverity);
            if (filterCategory !== 'all') params.set('categories', filterCategory);
            if (filterTag !== 'all') params.set('tags', filterTag);
            if (onlyMajorChanges) params.set('onlyMajorChanges', 'true');
            if (filterRolloutStatus !== 'all') params.set('tenantRolloutStatuses', filterRolloutStatus);
            params.set('page', '1');
            params.set('pageSize', String(FETCH_BATCH_SIZE));

            const url = `${SERVICE_ANNOUNCEMENTS_MESSAGES_ENDPOINT}?${params.toString()}`;
            const result = await request<ApiResponse>(url);

            if (result?.data) {
                const data = result.data.data ?? [];
                setMessages(data);
                setTotalCount(result.data.totalCount ?? 0);
                setHasMore(result.data.hasMore ?? false);
                setAvailableServices(prev => Array.from(new Set([...prev, ...data.flatMap(m => m.services)])).sort());
                setAvailableTags(prev => Array.from(new Set([...prev, ...data.flatMap(m => m.tags)])).sort());
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch service announcements');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length, request, filterService, filterSeverity, filterCategory, filterTag, onlyMajorChanges, filterRolloutStatus]);

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length, filterService, filterSeverity, filterCategory, filterTag, onlyMajorChanges, filterRolloutStatus]);

    const stats = useMemo(() => ({
        total: totalCount,
        majorChanges: messages.filter(m => m.isMajorChange).length,
        critical: messages.filter(m => (m.severity || '').toLowerCase() === 'critical').length,
    }), [messages, totalCount]);

    const columns = useMemo(() => [
        {
            key: 'id', label: 'Message ID', width: 110, sortable: true, searchable: true,
            render: (value: unknown) => <span className="font-mono text-xs">{String(value)}</span>,
        },
        {
            key: 'title', label: 'Title', minWidth: 280, sortable: true, searchable: true,
            render: (value: unknown, row: Record<string, unknown>) => (
                <div className="flex items-center gap-2">
                    {row.isMajorChange as boolean && <Badge className="bg-amber-500 text-white text-xs shrink-0">Major</Badge>}
                    {!!row.tenantRolloutStatus && <Badge className="bg-cyan-600 text-white text-xs shrink-0">Tenant-Specific</Badge>}
                    <span className="font-medium truncate">{String(value)}</span>
                </div>
            ),
        },
        {
            key: 'category', label: 'Category', width: 160, sortable: true,
            render: (value: unknown) => value ? <Badge variant="outline" className="text-xs">{String(value)}</Badge> : '—',
        },
        {
            key: 'severity', label: 'Severity', width: 110, sortable: true,
            render: (value: unknown) => (
                <Badge className={`${severityBadgeClass(value as string | null)} text-white text-xs`}>
                    {(value as string) || 'Normal'}
                </Badge>
            ),
        },
        {
            key: 'services', label: 'Services', minWidth: 200, searchable: true,
            render: (value: unknown) => (Array.isArray(value) ? value.join(', ') : '—') || '—',
        },
        {
            key: 'tags', label: 'Tags', minWidth: 180, searchable: true,
            render: (value: unknown) => (Array.isArray(value) && value.length > 0 ? value.join(', ') : '—'),
        },
        {
            key: 'tenantRolloutStatus', label: 'Rollout', width: 130, sortable: true,
            render: (value: unknown) => value ? <Badge className="bg-purple-500 text-white text-xs">{String(value)}</Badge> : '—',
        },
        {
            key: 'lastModifiedDateTime', label: 'Last Updated', width: 170, sortable: true,
            render: (value: unknown) => formatDateTime(value as string | null),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any, []);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Megaphone className="h-6 w-6 text-blue-500" />
                        M365 Service Announcements
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Message Center announcements from Microsoft Graph — filter by service, severity, category, or tag.
                    </p>
                </div>
                <Button variant="outline" onClick={() => fetchMessages()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />{error}
                </div>
            )}

            {loading ? (
                <AssignmentsTableSkeleton showStats={true} statsCount={3} showFilters={true} tableRows={12} tableColumns={6} />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground mt-1">Messages</div></CardContent></Card>
                        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{stats.majorChanges}</div><div className="text-xs text-muted-foreground mt-1">Major Changes</div></CardContent></Card>
                        <Card><CardContent className="p-6"><div className="text-2xl font-bold">{stats.critical}</div><div className="text-xs text-muted-foreground mt-1">Critical Severity</div></CardContent></Card>
                    </div>

                    <Card>
                        <CardHeader className="cursor-pointer" onClick={() => setIsFiltersExpanded(v => !v)}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Filter className="h-4 w-4" />Filters
                                </CardTitle>
                                {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        {isFiltersExpanded && (
                            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Service</Label>
                                    <select value={filterService} onChange={e => setFilterService(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                        <option value="all">All services</option>
                                        {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Severity</Label>
                                    <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                        <option value="all">All severities</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Category</Label>
                                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                        <option value="all">All categories</option>
                                        <option value="PreventOrFixIssue">Prevent or fix issue</option>
                                        <option value="PlanForChange">Plan for change</option>
                                        <option value="StayInformed">Stay informed</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Tag</Label>
                                    <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                        <option value="all">All tags</option>
                                        {availableTags.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Rollout status</Label>
                                    <select value={filterRolloutStatus} onChange={e => setFilterRolloutStatus(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                        <option value="all">All (including non-rollout messages)</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="InRollout">In rollout</option>
                                        <option value="Launched">Launched</option>
                                    </select>
                                    <p className="text-xs text-gray-500">Only matches messages tracking a staged feature rollout for your tenant.</p>
                                </div>
                                <div className="md:col-span-4 flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" checked={onlyMajorChanges} onChange={e => setOnlyMajorChanges(e.target.checked)} className="h-4 w-4" />
                                        Only major changes
                                    </label>
                                    {(filterService !== 'all' || filterSeverity !== 'all' || filterCategory !== 'all' || filterTag !== 'all' || onlyMajorChanges || filterRolloutStatus !== 'all') && (
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={() => { setFilterService('all'); setFilterSeverity('all'); setFilterCategory('all'); setFilterTag('all'); setOnlyMajorChanges(false); setFilterRolloutStatus('all'); }}
                                        >
                                            <X className="h-3.5 w-3.5 mr-1" />Clear filters
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                            <CardDescription>
                                {totalCount > 0 ? `${totalCount} total — ` : ''}Click a row to view the full message.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasMore && (
                                <div className="mb-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-xs text-amber-800 dark:text-amber-200">
                                    Showing the first {FETCH_BATCH_SIZE} messages ({totalCount} total match your filters). Narrow your filters to see the rest.
                                </div>
                            )}
                            <DataTable
                                data={messages}
                                columns={columns}
                                searchPlaceholder="Search title, service, tag…"
                                onRowClick={(row) => setSelectedMessage(row as ServiceAnnouncementMessage)}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

            <Dialog open={!!selectedMessage} onOpenChange={open => { if (!open) setSelectedMessage(null); }}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    {selectedMessage && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 flex-wrap">
                                    {selectedMessage.isMajorChange && <Badge className="bg-amber-500 text-white">Major Change</Badge>}
                                    {selectedMessage.tenantRolloutStatus && <Badge className="bg-cyan-600 text-white">Tenant-Specific</Badge>}
                                    {selectedMessage.tenantRolloutStatus && <Badge className="bg-purple-500 text-white">Rollout: {selectedMessage.tenantRolloutStatus}</Badge>}
                                    <Badge className={`${severityBadgeClass(selectedMessage.severity)} text-white`}>{selectedMessage.severity || 'Normal'}</Badge>
                                    {selectedMessage.category && <Badge variant="outline">{selectedMessage.category}</Badge>}
                                </DialogTitle>
                                <DialogDescription className="text-base font-semibold text-foreground pt-1">
                                    {selectedMessage.title}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                    <span className="font-mono">{selectedMessage.id}</span>
                                    <span>Last updated: {formatDateTime(selectedMessage.lastModifiedDateTime)}</span>
                                    {selectedMessage.actionRequiredByDateTime && (
                                        <span className="text-amber-600">Action required by: {formatDateTime(selectedMessage.actionRequiredByDateTime)}</span>
                                    )}
                                </div>

                                {selectedMessage.services.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedMessage.services.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                                    </div>
                                )}

                                {selectedMessage.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedMessage.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                                    </div>
                                )}

                                {selectedMessage.tenantRollouts.length > 0 && (
                                    <div className="border-t pt-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Rollout by platform</p>
                                        <div className="space-y-1.5">
                                            {selectedMessage.tenantRollouts.map((r, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <Badge variant="outline" className="text-xs">{r.platform || 'Unknown'}</Badge>
                                                    <span className="font-medium">{r.status || 'Unknown'}</span>
                                                    {r.tenantRolloutRing && <span className="text-muted-foreground">({r.tenantRolloutRing})</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedMessage.bodyContent && (
                                    <div
                                        className="text-sm border-t pt-4 prose prose-sm dark:prose-invert max-w-none"
                                        // Content is sourced server-side from Microsoft Graph (admin service announcements), not user input.
                                        dangerouslySetInnerHTML={{ __html: selectedMessage.bodyContent }}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
