'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    ChevronRight
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { AUDIT_EVENT_PAGE_ENDPOINT } from '@/lib/constants';
import { AuditEvent, AuditEventPageResponse } from '@/types/auditEvents';

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

    useEffect(() => {
        if (accounts.length > 0 && eventId) {
            fetchEventDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length, eventId]);

    const fetchEventDetails = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch the specific event - we'll need to search for it by ID
            const response = await request<AuditEventPageResponse>(
                `${AUDIT_EVENT_PAGE_ENDPOINT}?pageNumber=1&pageSize=100`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            if (response?.data?.items) {
                const foundEvent = response.data.items.find(e => e.id === eventId);
                if (foundEvent) {
                    setEvent(foundEvent);

                    // Fetch related events (same actor or similar time)
                    const timeWindow = 3600000; // 1 hour in milliseconds
                    const eventTime = new Date(foundEvent.activityDateTime).getTime();

                    const related = response.data.items.filter(e => {
                        if (e.id === eventId) return false;
                        const eTime = new Date(e.activityDateTime).getTime();
                        const timeDiff = Math.abs(eventTime - eTime);

                        return (
                            e.actorUserPrincipalName === foundEvent.actorUserPrincipalName ||
                            timeDiff < timeWindow
                        );
                    }).slice(0, 5);

                    setRelatedEvents(related);
                } else {
                    setError('Event not found');
                }
            }
        } catch (err) {
            console.error('Failed to fetch event details:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch event details');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = useCallback((name: string) => {
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
                        <Button onClick={fetchEventDetails} className="mt-4" variant="outline">
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

            {/* Header */}
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

            {/* Event Overview */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
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

            {/* Timeline & Actor Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline */}
                <Card className="lg:col-span-2 bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
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
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Changes Made</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {event.resources.length} resource{event.resources.length > 1 ? 's' : ''} affected
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Result */}
                            <div className="relative">
                                <div className={`absolute -left-6 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 ${
                                    event.activityResult === 'Success' ? 'bg-green-500' :
                                    event.activityResult === 'Failure' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                }`}></div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Result</p>
                                    <div className="mt-2">
                                        {getResultBadge(event.activityResult)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actor Card */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Performed By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                                    {getInitials(event.actorUserPrincipalName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{event.actorUserPrincipalName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{event.actorUserId}</p>
                            </div>
                            <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Component</span>
                                    <span className="font-medium">{event.componentName}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Resource Impact */}
            {event.resources && event.resources.length > 0 && (
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Resource Impact
                        </CardTitle>
                        <CardDescription>
                            {event.resources.length} resource{event.resources.length > 1 ? 's' : ''} affected by this event
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {event.resources.map((resource, index) => (
                                <Card key={index} className="border-l-4 border-l-blue-500">
                                    <CardContent className="pt-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{resource.displayName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                                    <span className="text-xs text-gray-500">{resource.resourceId}</span>
                                                </div>
                                            </div>

                                            {resource.modifiedProperties && resource.modifiedProperties.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Modified Properties</p>
                                                    {resource.modifiedProperties.map((prop, pidx) => (
                                                        <div key={pidx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                                {prop.displayName}
                                                            </p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-1">Before</p>
                                                                    <code className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded block overflow-x-auto">
                                                                        {prop.oldValue || '(empty)'}
                                                                    </code>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-1">After</p>
                                                                    <code className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded block overflow-x-auto">
                                                                        {prop.newValue || '(empty)'}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Related Events */}
            {relatedEvents.length > 0 && (
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Related Events
                        </CardTitle>
                        <CardDescription>
                            Events from the same actor or similar timeframe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {relatedEvents.map((relEvent) => (
                                <Link key={relEvent.id} href={`/audit-events/${relEvent.id}`}>
                                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{relEvent.activityType || relEvent.displayName}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-500">{getRelativeTime(relEvent.activityDateTime)}</span>
                                                    <Badge variant="outline" className="text-xs">{relEvent.category}</Badge>
                                                    {getResultBadge(relEvent.activityResult)}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
