'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    RefreshCw,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Users,
    TrendingUp,
    Clock,
    Filter,
    Eye,
    Loader2
} from 'lucide-react';
import { useAuditEvents } from '@/contexts/AuditEventsContext';
import { useApiRequest } from '@/hooks/useApiRequest';
import { AuditEvent, AuditMetadata, AuditMetadataResponse } from '@/types/auditEvents';
import { AUDIT_EVENT_METADATA_ENDPOINT } from '@/lib/constants';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Custom Tooltip for charts
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
    }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {payload[0].name}: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const CATEGORY_COLORS = {
    'default': '#3b82f6',
    'success': '#22c55e',
    'warning': '#f59e0b',
    'error': '#ef4444',
    'info': '#06b6d4'
};

export default function AuditDashboardPage() {
    const { accounts } = useMsal();
    const { statistics, recentEvents, loading, error, fetchData } = useAuditEvents();
    const { request } = useApiRequest();

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'failures' | 'hour' | 'day'>('day');
    const [metadata, setMetadata] = useState<AuditMetadata | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<string>('all');
    const [selectedActor, setSelectedActor] = useState<string>('all');

    // Derived lists with fallbacks
    const activitiesList = metadata?.activities || metadata?.activityTypes || [];
    const actorsList = metadata?.actors || metadata?.userPrincipalNames || [];

    // Fetch metadata
    useEffect(() => {
        const fetchMetadata = async () => {
            if (!accounts.length) return;
            try {
                const response = await request<AuditMetadataResponse>(
                    AUDIT_EVENT_METADATA_ENDPOINT,
                    { method: 'GET' }
                );
                if (response?.data) {
                    setMetadata(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch metadata:', err);
            }
        };
        fetchMetadata();
    }, [accounts.length, request]);

    useEffect(() => {
        if (accounts.length > 0 && !statistics) {
            // Only fetch if we don't have cached data
            fetchData(filterType, selectedActivity, selectedActor);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    // Re-fetch when filter changes
    useEffect(() => {
        if (accounts.length > 0 && statistics) {
            fetchData(filterType, selectedActivity, selectedActor);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType, selectedActivity, selectedActor]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchData(filterType, selectedActivity, selectedActor, true);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, filterType, selectedActivity, selectedActor]);

    const handleRefresh = () => {
        fetchData(filterType, selectedActivity, selectedActor);
    };

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

    const getInitials = useCallback((name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, []);

    // Prepare chart data
    const categoryChartData = useMemo(() => {
        if (!statistics?.eventsByCategory) return [];
        return Object.entries(statistics.eventsByCategory).map(([name, value], index) => ({
            name,
            value,
            color: Object.values(CATEGORY_COLORS)[index % Object.values(CATEGORY_COLORS).length]
        }));
    }, [statistics]);

    const timelineChartData = useMemo(() => {
        if (!statistics?.timeline?.eventsByHour) return [];
        return Object.entries(statistics.timeline.eventsByHour).map(([hour, count]) => ({
            hour: `${hour}:00`,
            count
        }));
    }, [statistics]);

    // Calculate derived statistics
    const derivedStats = useMemo(() => {
        if (!statistics) return { successRate: 0, failureCount: 0 };

        const totalEvents = statistics.totalEvents || 0;
        const successCount = statistics.eventsByResult?.Success || 0;
        const failureCount = statistics.eventsByResult?.Failure || 0;
        const successRate = totalEvents > 0 ? (successCount / totalEvents) * 100 : 0;

        return { successRate, failureCount };
    }, [statistics]);

    if (loading && !statistics) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Dashboard
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching audit event data...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                        <Button onClick={() => fetchData()} className="mt-4" variant="outline">
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-500" />
                        Audit Events Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Real-time monitoring and insights
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                        />
                        <Label htmlFor="auto-refresh" className="text-sm">
                            Auto-refresh (30s)
                        </Label>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/audit-events/search">
                        <Button size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Advanced Search
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={filterType === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('all')}
                    >
                        All Events
                    </Button>
                    <Button
                        variant={filterType === 'failures' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('failures')}
                        className={filterType === 'failures' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        Failures Only
                    </Button>
                    <Button
                        variant={filterType === 'hour' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('hour')}
                    >
                        Last Hour
                    </Button>
                    <Button
                        variant={filterType === 'day' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('day')}
                    >
                        Last 24 Hours
                    </Button>
                </div>

                <div className="flex gap-2 flex-wrap w-full lg:w-auto">
                    <div className="w-full lg:w-[200px]">
                        <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Activity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Activities</SelectItem>
                                {activitiesList.map((activity) => (
                                    <SelectItem key={activity} value={activity}>
                                        {activity}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full lg:w-[200px]">
                        <Select value={selectedActor} onValueChange={setSelectedActor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Actor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actors</SelectItem>
                                {actorsList.map((actor) => (
                                    <SelectItem key={actor} value={actor}>
                                        {actor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Events</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {statistics?.totalEvents.toLocaleString() || 0}
                                </p>
                            </div>
                            <Activity className="h-12 w-12 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Success Rate</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {derivedStats.successRate.toFixed(1)}%
                                </p>
                            </div>
                            <CheckCircle className="h-12 w-12 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Failures</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {derivedStats.failureCount.toLocaleString()}
                                </p>
                            </div>
                            <XCircle className="h-12 w-12 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Categories</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {Object.keys(statistics?.eventsByCategory || {}).length}
                                </p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Chart */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle>Events Over Time</CardTitle>
                        <CardDescription>Activity in the last 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={timelineChartData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="currentColor"
                                    className="stroke-gray-200 dark:stroke-gray-700"
                                    opacity={0.3}
                                />
                                <XAxis
                                    dataKey="hour"
                                    stroke="currentColor"
                                    className="text-gray-600 dark:text-gray-400"
                                    tick={{ fill: 'currentColor' }}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="currentColor"
                                    className="text-gray-600 dark:text-gray-400"
                                    tick={{ fill: 'currentColor' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="#3b82f6" fillOpacity={0.85} radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle>Events by Category</CardTitle>
                        <CardDescription>Distribution across categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    fillOpacity={0.85}
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Most Active Users & Top Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Active Users */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Most Active Users
                        </CardTitle>
                        <CardDescription>Top contributors in the selected timeframe</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statistics?.mostActiveUsers.slice(0, 5).map((user, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-blue-500 text-white text-sm">
                                                {getInitials(user.userPrincipalName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.userPrincipalName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.userId}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{user.eventCount} events</Badge>
                                </div>
                            )) || <p className="text-gray-500 text-center py-4">No data available</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Activities */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Top Activities
                        </CardTitle>
                        <CardDescription>Most frequent actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {statistics?.topActivities.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                            index === 2 ? 'bg-orange-600' :
                                            'bg-blue-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{activity.category}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.activity}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{activity.count} times</Badge>
                                </div>
                            )) || <p className="text-gray-500 text-center py-4">No data available</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Events Table */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Recent Events
                            </CardTitle>
                            <CardDescription>Latest activity in your environment</CardDescription>
                        </div>
                        <Link href="/audit-events/search">
                            <Button size="sm" variant="outline">
                                View All
                                <Eye className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Time</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Activity</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actor</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Result</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentEvents.length > 0 ? recentEvents.map((event) => (
                                    <tr key={event.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {getRelativeTime(event.activityDateTime)}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {event.activityType || event.displayName}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {event.actorUserPrincipalName || 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <Badge variant="outline">{event.category}</Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {getResultBadge(event.activityResult)}
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            <Link href={`/audit-events/${event.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            No events found for the selected filter
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
