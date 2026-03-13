'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    RefreshCw,
    X,
    ChevronRight,
    GitBranch,
    Activity,
    Clock,
    User,
    Folder,
    CheckCircle,
    XCircle,
    ArrowLeft
} from 'lucide-react';
import { useAuditEvents } from '@/contexts/AuditEventsContext';
import { DataTable } from '@/components/DataTable';
import { AuditEvent, AuditResource } from '@/types/auditEvents';

export default function AdvancedAuditPage() {
    const { recentEvents, loading, error: contextError, fetchData } = useAuditEvents();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
    const [showVisualizer, setShowVisualizer] = useState(false);

    // Fetch events on mount if not already loaded
    useEffect(() => {
        if (recentEvents.length === 0 && !loading && !contextError) {
            fetchData('all', 'all', 'all');
        }
    }, [recentEvents.length, loading, contextError, fetchData]);

    // Handle refresh button
    const handleRefresh = useCallback(() => {
        fetchData('all', 'all', 'all');
    }, [fetchData]);

    // Use events from context
    const events = recentEvents;

    // Find related events
    const relatedEvents = useMemo(() => {
        if (!selectedEvent) return [];

        const resourceIds = selectedEvent.resources?.map(r => r.resourceId) || [];
        const actorId = selectedEvent.actorUserId;
        const eventTime = new Date(selectedEvent.activityDateTime).getTime();
        const timeWindow = 60 * 60 * 1000; // 1 hour

        return events.filter(e => {
            if (e.id === selectedEvent.id) return false;
            const eTime = new Date(e.activityDateTime).getTime();
            const withinTimeWindow = Math.abs(eTime - eventTime) <= timeWindow;
            const hasSharedResource = e.resources?.some(r => resourceIds.includes(r.resourceId)) || false;
            const sameActor = e.actorUserId === actorId;
            return withinTimeWindow && (hasSharedResource || sameActor);
        }).sort((a, b) =>
            new Date(a.activityDateTime).getTime() - new Date(b.activityDateTime).getTime()
        );
    }, [selectedEvent, events]);

    // Filter events
    const filteredEvents = useMemo(() => {
        if (!searchQuery.trim()) return events;
        const query = searchQuery.toLowerCase();
        return events.filter(event =>
            event.displayName.toLowerCase().includes(query) ||
            event.actorUserPrincipalName.toLowerCase().includes(query) ||
            event.category.toLowerCase().includes(query) ||
            event.resources?.some(r => r.displayName?.toLowerCase().includes(query)) || false
        );
    }, [events, searchQuery]);

    const getStatusBadge = (result: string) => {
        const r = result.toLowerCase();
        if (r === 'success') {
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
        }
        if (r === 'failure' || r === 'failed') {
            return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-0"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-800 border-0">{result}</Badge>;
    };

    const columns = [
        {
            key: 'activityDateTime',
            label: 'Time',
            width: 180,
            render: (value: unknown) => {
                const date = new Date(String(value));
                return (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div className="text-xs">
                            <div className="font-medium">{date.toLocaleDateString()}</div>
                            <div className="text-gray-500">{date.toLocaleTimeString()}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'displayName',
            label: 'Activity',
            width: 280,
            render: (value: unknown, row: Record<string, unknown>) => {
                const event = row as AuditEvent;
                return (
                    <div>
                        <div className="font-medium text-sm">{String(value)}</div>
                        <div className="text-xs text-gray-500">{event.category}</div>
                    </div>
                );
            }
        },
        {
            key: 'actorUserPrincipalName',
            label: 'Actor',
            width: 220,
            render: (value: unknown) => {
                const upn = String(value);
                return upn ? (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-sm truncate">{upn}</span>
                    </div>
                ) : <span className="text-sm text-gray-400">System</span>;
            }
        },
        {
            key: 'resources',
            label: 'Resources',
            width: 200,
            render: (value: unknown) => {
                const resources = value as AuditResource[] | undefined;
                const firstResource = resources?.[0];
                if (!firstResource) return <span className="text-sm text-gray-400">No resources</span>;
                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-purple-500" />
                            <div className="text-xs">
                                <div className="font-medium truncate">{firstResource.displayName || '<null>'}</div>
                                <div className="text-gray-500">{firstResource.type}</div>
                            </div>
                        </div>
                        {resources && resources.length > 1 && (
                            <Badge variant="outline" className="text-xs mt-1">+{resources.length - 1} more</Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'activityResult',
            label: 'Status',
            width: 120,
            render: (value: unknown) => getStatusBadge(String(value))
        }
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <Link href="/audit-events">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl lg:text-3xl font-bold">Advanced Audit Search</h1>
                    <p className="text-muted-foreground mt-2">
                        Search and analyze Intune audit events with detailed context
                    </p>
                </div>
                <Button onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Events
                    </CardTitle>
                    <CardDescription>
                        {events.length > 0 && `Searching across ${events.length} loaded audit events`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search by activity, user, resource, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <div className="mt-2 text-sm text-gray-600">
                            Found {filteredEvents.length} of {events.length} events
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Events</CardTitle>
                            <CardDescription>Click on an event to see details and related activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && events.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                                    <span className="ml-3">Loading events...</span>
                                </div>
                            ) : contextError ? (
                                <div className="text-center py-12">
                                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-red-600">{contextError}</p>
                                    <Button onClick={handleRefresh} className="mt-4" variant="outline">Try Again</Button>
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        {searchQuery ? 'No events match your search' : 'No audit events found'}
                                    </p>
                                </div>
                            ) : (
                                <DataTable
                                    data={filteredEvents}
                                    columns={columns}
                                    onRowClick={(row) => setSelectedEvent(row as AuditEvent)}
                                    rowClassName={(row) => selectedEvent?.id === (row as AuditEvent).id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {selectedEvent ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        <span>Event Details</span>
                                        <Button size="sm" variant="outline" onClick={() => setShowVisualizer(!showVisualizer)}>
                                            <GitBranch className="h-4 w-4 mr-2" />
                                            {showVisualizer ? 'Hide' : 'Show'} Flow
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Activity</label>
                                        <p className="font-medium">{selectedEvent.displayName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</label>
                                        <p>{selectedEvent.category}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Actor</label>
                                        <p>{selectedEvent.actorUserPrincipalName || 'System'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Time</label>
                                        <p>{new Date(selectedEvent.activityDateTime).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
                                        <div className="mt-1">{getStatusBadge(selectedEvent.activityResult)}</div>
                                    </div>

                                    {selectedEvent.resources && selectedEvent.resources.length > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Resources ({selectedEvent.resources.length})</label>
                                            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                                                {selectedEvent.resources.map((resource, idx) => (
                                                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                                                        <div className="text-sm font-medium">{resource.displayName || '<null>'}</div>
                                                        <div className="text-xs text-gray-500">{resource.type}</div>
                                                        {resource.modifiedProperties && resource.modifiedProperties.length > 0 && (
                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                {resource.modifiedProperties.length} properties modified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Related Events</CardTitle>
                                    <CardDescription>Events within 1 hour involving same resources or actor</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {relatedEvents.length > 0 ? (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {relatedEvents.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="w-full text-left p-3 rounded border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium truncate">{event.displayName}</div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                            {new Date(event.activityDateTime).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                                                </div>
                                                    <div className="mt-2">{getStatusBadge(event.activityResult)}</div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No related events found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Select an event to view details and related activities</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {showVisualizer && selectedEvent && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Event Flow Visualizer
                        </CardTitle>
                        <CardDescription>Timeline showing the context and sequence of events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[selectedEvent, ...relatedEvents].map((event, idx) => {
                                const isSelected = event.id === selectedEvent.id;
                                return (
                                    <div key={event.id} className="relative flex items-start gap-4">
                                        {idx < relatedEvents.length && (
                                            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700" />
                                        )}
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}>
                                            <Activity className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                                        </div>
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className={`flex-1 text-left p-4 rounded-lg border transition-colors ${
                                                isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">{event.displayName}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{event.category}</div>
                                                    <div className="text-xs text-gray-400 mt-1">{new Date(event.activityDateTime).toLocaleString()}</div>
                                                </div>
                                                <div>{getStatusBadge(event.activityResult)}</div>
                                            </div>
                                            {event.resources && event.resources.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {event.resources.slice(0, 2).map((resource, rIdx) => (
                                                        <Badge key={rIdx} variant="outline" className="text-xs">
                                                            {resource.displayName || resource.type}
                                                        </Badge>
                                                    ))}
                                                    {event.resources.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">+{event.resources.length - 2} more</Badge>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
