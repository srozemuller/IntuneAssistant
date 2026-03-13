'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    Loader2,
    User,
    X,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { useAuditEvents } from '@/contexts/AuditEventsContext';
import { DataTable } from '@/components/DataTable';
import { AuditEvent } from '@/types/auditEvents';
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

// Get category color from CSS variables
const getCategoryColor = (index: number): string => {
    const colors = [
        'var(--category-default)',
        'var(--category-success)',
        'var(--category-warning)',
        'var(--category-error)',
        'var(--category-info)'
    ];
    return colors[index % colors.length];
};

export default function AuditDashboardPage() {
    const { accounts } = useMsal();
    const router = useRouter();
    const { statistics, recentEvents, loading, loadingMore, error, hasMore, fetchData, loadMore } = useAuditEvents();

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'failures' | 'hour' | 'day'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<{ category: string; activity: string } | null>(null);
    const [tableItemsPerPage, setTableItemsPerPage] = useState(50);
    const [tablePage, setTablePage] = useState(1);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Categories are collapsed by default - users can expand them individually or use "Expand All"

    useEffect(() => {
        if (accounts.length > 0 && !statistics) {
            // Only fetch if we don't have cached data
            fetchData(filterType, 'all', 'all');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    // Re-fetch when filter changes
    useEffect(() => {
        if (accounts.length > 0 && statistics) {
            fetchData(filterType, 'all', 'all');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchData(filterType, 'all', 'all', true);
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, filterType]);

    const handleRefresh = () => {
        fetchData(filterType, 'all', 'all');
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
            color: getCategoryColor(index)
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

    // Group activities by category using eventsByCategory counts (matches pie chart)
    const activitiesByCategory = useMemo(() => {
        if (!statistics?.eventsByCategory || !statistics?.topActivities) return {};

        // First, get all categories from eventsByCategory (this is what the pie chart uses)
        const result: Record<string, {
            totalCount: number;
            activities: Array<{ activity: string; count: number }>
        }> = {};

        // For each category in eventsByCategory, get its activities
        Object.entries(statistics.eventsByCategory).forEach(([category, totalCount]) => {
            // Find all activities for this category
            const categoryActivities = statistics.topActivities
                .filter(item => item.category === category)
                .map(item => ({
                    activity: item.activity,
                    count: item.count
                }))
                .sort((a, b) => b.count - a.count);

            result[category] = {
                totalCount,
                activities: categoryActivities
            };
        });

        // Sort by totalCount (descending)
        return Object.entries(result)
            .sort((a, b) => b[1].totalCount - a[1].totalCount)
            .reduce((acc, [category, data]) => {
                acc[category] = data;
                return acc;
            }, {} as Record<string, { totalCount: number; activities: Array<{ activity: string; count: number }> }>);
    }, [statistics?.eventsByCategory, statistics?.topActivities]);

    const toggleCategory = useCallback((category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    }, []);

    // Memoize most active users to prevent recalculation
    const mostActiveUsers = useMemo(() => {
        return statistics?.mostActiveUsers || [];
    }, [statistics?.mostActiveUsers]);

    // Filter events based on selected category or activity
    const filteredEvents = useMemo(() => {
        let filtered = recentEvents;

        if (selectedCategory) {
            filtered = filtered.filter(event => event.category === selectedCategory);
        }

        if (selectedActivity) {
            // Filter by category only (from Top Activities click)
            filtered = filtered.filter(event => event.category === selectedActivity.category);
        }

        return filtered;
    }, [recentEvents, selectedCategory, selectedActivity]);

    // Define columns for DataTable
    const eventColumns = useMemo(() => [
        {
            key: 'activityDateTime',
            label: 'Time',
            width: 180,
            render: (value: unknown) => {
                return (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getRelativeTime(String(value))}
                        </span>
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
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {event.activityType || String(value)}
                        </div>
                        <div className="text-xs text-gray-500">{event.componentName}</div>
                    </div>
                );
            }
        },
        {
            key: 'actorUserPrincipalName',
            label: 'Actor',
            width: 240,
            render: (value: unknown) => {
                const upn = String(value);
                return upn && upn !== 'undefined' ? (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-sm truncate">{upn}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">System</span>
                );
            }
        },
        {
            key: 'category',
            label: 'Category',
            width: 150,
            render: (value: unknown) => (
                <Badge variant="outline">{String(value)}</Badge>
            )
        },
        {
            key: 'activityResult',
            label: 'Result',
            width: 140,
            render: (value: unknown) => getResultBadge(String(value))
        },
        {
            key: 'id',
            label: 'Actions',
            width: 100,
            render: (value: unknown) => (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/audit-events/${String(value)}`);
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )
        }
    ], [getRelativeTime, getResultBadge, router]);

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
                    <Link href="/audit-events/advanced">
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
                    {/*<Button*/}
                    {/*    variant={filterType === 'failures' ? 'default' : 'outline'}*/}
                    {/*    size="sm"*/}
                    {/*    onClick={() => setFilterType('failures')}*/}
                    {/*    className={filterType === 'failures' ? 'bg-red-500 hover:bg-red-600' : ''}*/}
                    {/*>*/}
                    {/*    Failures Only*/}
                    {/*</Button>*/}
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
                {(selectedCategory || selectedActivity) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedCategory(null);
                            setSelectedActivity(null);
                        }}
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Show All Activities
                    </Button>
                )}
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Events by Category</CardTitle>
                                <CardDescription>
                                    {selectedCategory ? `Filtered by: ${selectedCategory}` : 'Click on a category to filter'}
                                </CardDescription>
                            </div>
                            {selectedCategory && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSelectedActivity(null);
                                    }}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear Filter
                                </Button>
                            )}
                        </div>
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
                                    onClick={(data) => {
                                        setSelectedCategory(data.name);
                                        setSelectedActivity(null);
                                    }}
                                    cursor="pointer"
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                                        />
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
                                {mostActiveUsers.slice(0, 5).map((user, index) => (
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

                {/* Top Activities by Category */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Activities by Category
                                    {Object.keys(activitiesByCategory).length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {Object.keys(activitiesByCategory).length} categories
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {selectedActivity ? `Filtered by: ${selectedActivity.category}` : 'Click category to filter events'}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedActivity && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedActivity(null)}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear Filter
                                    </Button>
                                )}
                                {Object.keys(activitiesByCategory).length > 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            if (expandedCategories.size === Object.keys(activitiesByCategory).length) {
                                                setExpandedCategories(new Set());
                                            } else {
                                                setExpandedCategories(new Set(Object.keys(activitiesByCategory)));
                                            }
                                        }}
                                    >
                                        {expandedCategories.size === Object.keys(activitiesByCategory).length ? (
                                            <>
                                                <ChevronRight className="h-4 w-4 mr-1" />
                                                Collapse All
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-4 w-4 mr-1" />
                                                Expand All
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                            {Object.entries(activitiesByCategory).length > 0 ? (
                                Object.entries(activitiesByCategory).map(([category, data], categoryIndex) => {
                                    const categoryData = data as { totalCount: number; activities: Array<{ activity: string; count: number }> };
                                    const totalCount = categoryData.totalCount;
                                    const activities = categoryData.activities;
                                    const isExpanded = expandedCategories.has(category);
                                    const isSelected = selectedActivity?.category === category;

                                    return (
                                        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                            {/* Category Header */}
                                            <button
                                                onClick={() => {
                                                    setSelectedActivity({
                                                        category: category,
                                                        activity: activities.length > 0 ? activities[0].activity : ''
                                                    });
                                                    setSelectedCategory(null);
                                                }}
                                                className={`w-full flex items-center justify-between p-3 transition-colors ${
                                                    isSelected
                                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCategory(category);
                                                        }}
                                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.stopPropagation();
                                                                toggleCategory(category);
                                                            }
                                                        }}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                        categoryIndex === 0 ? 'bg-yellow-500' :
                                                        categoryIndex === 1 ? 'bg-gray-400' :
                                                        categoryIndex === 2 ? 'bg-orange-600' :
                                                        'bg-blue-500'
                                                    }`}>
                                                        {categoryIndex + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{category}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {totalCount} events{activities.length > 0 ? ` · ${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="font-semibold">{totalCount}</Badge>
                                            </button>

                                            {/* Expanded Activities */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                                    {activities.length > 0 ? (
                                                        activities.map((activity, actIndex) => (
                                                            <div
                                                                key={actIndex}
                                                                className="flex items-center justify-between p-3 pl-16 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                                                                        {actIndex + 1}
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{activity.activity}</p>
                                                                </div>
                                                                <Badge variant="secondary" className="text-xs">{activity.count}x</Badge>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 pl-16 text-sm text-gray-500 dark:text-gray-400 italic">
                                                            No detailed activity breakdown available for this category.
                                                            Total events: {totalCount}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-center py-4">No data available</p>
                            )}
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
                                {(selectedCategory || selectedActivity) && (
                                    <Badge variant="secondary" className="ml-2">
                                        {selectedCategory || selectedActivity?.category} - {filteredEvents.length} events
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {selectedCategory || selectedActivity
                                    ? 'Filtered events based on your selection'
                                    : 'Latest activity in your environment'}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {(selectedCategory || selectedActivity) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSelectedActivity(null);
                                    }}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All Filters
                                </Button>
                            )}
                            <Link href="/audit-events/advanced">
                                <Button size="sm" variant="outline">
                                    View All
                                    <Eye className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredEvents.length > 0 ? (
                        <>
                            <DataTable
                                data={filteredEvents}
                                columns={eventColumns}
                                showPagination={true}
                                itemsPerPage={tableItemsPerPage}
                                currentPage={tablePage}
                                onPageChange={(page) => setTablePage(page)}
                                onItemsPerPageChange={(items) => {
                                    setTableItemsPerPage(items);
                                    setTablePage(1);
                                }}
                                onRowClick={(row) => {
                                    const event = row as AuditEvent;
                                    router.push(`/audit-events/${event.id}`);
                                }}
                            />
                            {hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <Button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        variant="outline"
                                        size="lg"
                                        className="min-w-[200px]"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Loading more...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Load More Events
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {selectedCategory || selectedActivity
                                ? 'No events found matching the selected filter'
                                : 'No events found for the selected filter'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
