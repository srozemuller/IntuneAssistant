'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Clock,
    User,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    MapPin,
    FileText,
    Loader2,
    AlertCircle,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { AUDIT_LOGS_INTUNE_EVENTS } from '@/lib/constants';
import { AuditEvent } from '@/types/auditEvents';

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const eventId = params.id as string;
    const [event, setEvent] = useState<AuditEvent | null>(null);
    const [relatedEvents, setRelatedEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [showResourcesInTimeline, setShowResourcesInTimeline] = useState(false);
    const [expandedResources, setExpandedResources] = useState<Set<number>>(new Set());

    const fetchEventDetails = useCallback(async () => {
        if (!accounts.length || !eventId || hasFetched) return;

        setLoading(true);
        setError(null);
        setHasFetched(true);

        try {
            // Fetch events from the main events endpoint and find our event
            const eventsResponse = await request<{
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
            }>(`${AUDIT_LOGS_INTUNE_EVENTS}?pageSize=100`);

            // Unwrap ApiResponseWithCorrelation → eventsResponse.data is the envelope, eventsResponse.data.data.items is the events array
            const envelope = eventsResponse?.data;
            if (envelope?.data?.items) {
                // Find the specific event by ID
                const foundEvent = envelope.data.items.find(e => e.id === eventId);

                if (foundEvent) {
                    setEvent(foundEvent);

                    // Find related events
                    const timeWindow = 3600000; // 1 hour in milliseconds
                    const eventTime = new Date(foundEvent.activityDateTime).getTime();
                    const resourceIds = foundEvent.resources?.map(r => r.resourceId) || [];

                    const related = envelope.data.items.filter(e => {
                        if (e.id === eventId) return false;
                        const eTime = new Date(e.activityDateTime).getTime();
                        const timeDiff = Math.abs(eventTime - eTime);
                        const hasSharedResource = e.resources?.some(r => resourceIds.includes(r.resourceId)) || false;
                        const sameActor = e.actorUserPrincipalName === foundEvent.actorUserPrincipalName;

                        return (
                            timeDiff < timeWindow && (sameActor || hasSharedResource)
                        );
                    }).slice(0, 5);

                    setRelatedEvents(related);
                } else {
                    setError('Event not found');
                }
            } else {
                setError('Failed to fetch events');
            }
        } catch (err) {
            console.error('Failed to fetch event details:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch event details');
            setHasFetched(false); // Reset so retry can work
        } finally {
            setLoading(false);
        }
    }, [accounts.length, eventId, request, hasFetched]);

    useEffect(() => {
        if (accounts.length > 0 && eventId && !hasFetched) {
            fetchEventDetails();
        }
    }, [accounts.length, eventId, hasFetched, fetchEventDetails]);

    const getInitials = useCallback((name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, []);

    const getResultBadge = useCallback((result: string) => {
        switch (result) {
            case 'Success':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Success</Badge>;
            case 'Failure':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failure</Badge>;
            case 'Warning':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
            default:
                return <Badge variant="outline">{result}</Badge>;
        }
    }, []);

    const getRelativeTime = useCallback((timestamp: string) => {
        const now = new Date();
        const eventTime = new Date(timestamp);
        const diffMs = now.getTime() - eventTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }, []);


    if (loading) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Event Details
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching event information...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Button onClick={() => router.back()} variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error || 'Event not found'}</span>
                        </div>
                        <Button
                            onClick={() => {
                                setHasFetched(false);
                                setError(null);
                            }}
                            className="mt-4"
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Link href="/audit-events" className="hover:text-blue-500">Dashboard</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/audit-events/search" className="hover:text-blue-500">Search</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 dark:text-gray-100">Event Details</span>
            </div>

            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-500" />
                        Event Details
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {getRelativeTime(event.activityDateTime)}
                    </p>
                </div>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Event Overview with Compact Actor Info */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Activity</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{event.activityType || event.displayName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Category</p>
                                <Badge variant="outline" className="text-sm">{event.category}</Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Result</p>
                                {getResultBadge(event.activityResult)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Component</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.componentName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Compact Performed By Card */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Performed By
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-blue-500 text-white text-sm">
                                    {getInitials(event.actorUserPrincipalName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{event.actorUserPrincipalName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{event.actorUserId}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content: Visual Flow & Related Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Timeline & Visual Flow */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline Details - Now First */}
                    <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Event Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-8">
                                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800"></div>

                                {/* Event Occurred */}
                                <div className="relative mb-8">
                                    <div className="absolute -left-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900"></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Event Occurred</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(event.activityDateTime).toLocaleString()}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{event.displayName}</p>
                                    </div>
                                </div>

                                {/* Changes Made */}
                                {event.resources && event.resources.length > 0 && (
                                    <div className="relative mb-8">
                                        <div className="absolute -left-6 w-4 h-4 rounded-full bg-yellow-500 border-4 border-white dark:border-gray-900"></div>
                                        <div className="ml-4">
                                            <button
                                                onClick={() => setShowResourcesInTimeline(!showResourcesInTimeline)}
                                                className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -ml-2 rounded transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Changes Made</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {event.resources.length} resource{event.resources.length > 1 ? 's' : ''} affected
                                                        </p>
                                                    </div>
                                                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${showResourcesInTimeline ? 'rotate-90' : ''}`} />
                                                </div>
                                            </button>

                                            {showResourcesInTimeline && (
                                                <div className="mt-4 space-y-2 ml-2">
                                                    {event.resources.map((resource, ridx) => (
                                                        <div key={ridx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{resource.displayName}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                                                {resource.modifiedProperties && resource.modifiedProperties.length > 0 && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            document.getElementById('resource-impact')?.scrollIntoView({
                                                                                behavior: 'smooth',
                                                                                block: 'start'
                                                                            });
                                                                        }}
                                                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                                                    >
                                                                        {resource.modifiedProperties.length} properties modified
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Event Completed */}
                                <div className="relative">
                                    <div className="absolute -left-6 w-4 h-4 rounded-full bg-green-500 border-4 border-white dark:border-gray-900"></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Event Completed</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getResultBadge(event.activityResult)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stunning Visual Flow - Now Second */}
                    <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Event Flow
                            </CardTitle>
                            <CardDescription>Visual representation of the event sequence</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Visual Flow Diagram */}
                            <div className="relative">
                                {/* Timeline connector line */}
                                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-20 rounded-full"></div>

                                <div className="space-y-6">
                                    {/* Current Event - Highlighted */}
                                    <div className="relative pl-20">
                                        <div className="absolute left-2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-blue-500/20">
                                            <Activity className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40 border-2 border-blue-500 rounded-lg p-4 shadow-md">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge className="bg-blue-500">Current Event</Badge>
                                                        {getResultBadge(event.activityResult)}
                                                    </div>
                                                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                                        {event.activityType || event.displayName}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(event.activityDateTime).toLocaleString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {event.actorUserPrincipalName}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">{event.category}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Related Events in Flow - Show ALL */}
                                    {relatedEvents.length > 0 && relatedEvents.map((relEvent) => {
                                        const isSuccess = relEvent.activityResult === 'Success';
                                        const isFailure = relEvent.activityResult === 'Failure';
                                        const iconColor = isSuccess ? 'from-green-500 to-green-600' : isFailure ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600';
                                        const bgColor = isSuccess ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : isFailure ? 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20' : 'from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800';

                                        return (
                                            <div key={relEvent.id} className="relative pl-20">
                                                <div className={`absolute left-2 w-12 h-12 rounded-full bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-900`}>
                                                    {isSuccess ? (
                                                        <CheckCircle className="h-5 w-5 text-white" />
                                                    ) : isFailure ? (
                                                        <XCircle className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <Activity className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <Link href={`/audit-events/${relEvent.id}`}>
                                                    <div className={`bg-gradient-to-r ${bgColor} border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group`}>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {getResultBadge(relEvent.activityResult)}
                                                                    <span className="text-xs text-gray-500">
                                                                        {getRelativeTime(relEvent.activityDateTime)}
                                                                    </span>
                                                                </div>
                                                                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                    {relEvent.activityType || relEvent.displayName}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <Badge variant="outline" className="text-xs">{relEvent.category}</Badge>
                                                                    <span className="text-gray-500">{relEvent.componentName}</span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Related Events Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 sticky top-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-purple-500" />
                                Related Events
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {relatedEvents.length > 0 ? `${relatedEvents.length} related events found` : 'No related events'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {relatedEvents.length > 0 ? (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {relatedEvents.map((relEvent) => {
                                        const isSuccess = relEvent.activityResult === 'Success';
                                        const isFailure = relEvent.activityResult === 'Failure';

                                        return (
                                            <Link key={relEvent.id} href={`/audit-events/${relEvent.id}`}>
                                                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group relative">
                                                    {/* Connection indicator */}
                                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-500 to-transparent"></div>

                                                    <div className="flex items-start gap-2">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                            isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 
                                                            isFailure ? 'bg-red-100 dark:bg-red-900/30' : 
                                                            'bg-gray-100 dark:bg-gray-800'
                                                        }`}>
                                                            {isSuccess ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            ) : isFailure ? (
                                                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                            ) : (
                                                                <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                                {relEvent.activityType || relEvent.displayName}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {getRelativeTime(relEvent.activityDateTime)}
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-2">
                                                                <Badge variant="outline" className="text-xs">{relEvent.category}</Badge>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No related events found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Resource Impact - Full Width */}
            {event.resources && event.resources.length > 0 && (
                <Card id="resource-impact" className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 scroll-mt-20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Resource Impact
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {event.resources.length} resource{event.resources.length > 1 ? 's' : ''} affected by this event
                                </CardDescription>
                            </div>
                            {event.resources.length > 1 && (
                                <Badge variant="outline" className="text-sm">
                                    {event.resources.length} Resources
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {event.resources.map((resource, index) => {
                                // Filter out properties that didn't actually change
                                const changedProperties = resource.modifiedProperties?.filter(prop =>
                                    prop.oldValue !== prop.newValue
                                ) || [];

                                const isExpanded = expandedResources.has(index);
                                const displayedProperties = isExpanded ? changedProperties : changedProperties.slice(0, 2);

                                // Alternate border colors for multiple resources
                                const borderColor = index % 2 === 0 ? 'border-l-blue-500' : 'border-l-purple-500';

                                return (
                                    <Card key={index} className={`border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
                                        <CardContent className="pt-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{resource.displayName}</p>
                                                        </div>
                                                        {event.resources && event.resources.length > 1 && (
                                                            <Badge variant="secondary" className="text-xs ml-2">
                                                                Resource {index + 1}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                                        <span className="text-xs text-gray-500 truncate">{resource.resourceId}</span>
                                                    </div>
                                                </div>

                                                {changedProperties.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {changedProperties.length} {changedProperties.length === 1 ? 'property' : 'properties'} modified
                                                        </p>
                                                        {displayedProperties.map((prop, pidx) => (
                                                            <div key={pidx} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                                    {prop.displayName}
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <p className="text-gray-500 mb-1">Before</p>
                                                                        <code className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-1 rounded block overflow-x-auto whitespace-pre-wrap break-all">
                                                                            {prop.oldValue || '(empty)'}
                                                                        </code>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500 mb-1">After</p>
                                                                        <code className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-1 rounded block overflow-x-auto whitespace-pre-wrap break-all">
                                                                            {prop.newValue || '(empty)'}
                                                                        </code>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {changedProperties.length > 2 && (
                                                            <button
                                                                onClick={() => {
                                                                    const newExpanded = new Set(expandedResources);
                                                                    if (isExpanded) {
                                                                        newExpanded.delete(index);
                                                                    } else {
                                                                        newExpanded.add(index);
                                                                    }
                                                                    setExpandedResources(newExpanded);
                                                                }}
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <ChevronRight className="h-3 w-3 rotate-90" />
                                                                        Show less
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronRight className="h-3 w-3" />
                                                                        Show {changedProperties.length - 2} more {changedProperties.length - 2 === 1 ? 'property' : 'properties'}
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">No properties were changed</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
