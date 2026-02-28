'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Search,
    X,
    Download,
    Filter,
    Calendar as CalendarIcon,
    Loader2,
    Save,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    RefreshCw
} from 'lucide-react';
import { useAuditEvents } from '@/contexts/AuditEventsContext';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    AUDIT_LOGS_INTUNE_FILTER
} from '@/lib/constants';
import {
    AuditEvent,
    AuditEventPageResponse,
    AuditFilterRequest,
    FilterPreset
} from '@/types/auditEvents';
import { format } from 'date-fns';
import { DataTable } from '@/components/DataTable';
import { useRouter } from 'next/navigation';

const DATE_PRESETS = [
    { label: 'Last 24 Hours', hours: 24 },
    { label: 'Last 7 Days', hours: 24 * 7 },
    { label: 'Last 30 Days', hours: 24 * 30 },
    { label: 'Last 90 Days', hours: 24 * 90 },
];

export default function AuditSearchPage() {
    const { recentEvents, loading: contextLoading, loadingMore, error: contextError, hasMore, fetchData, loadMore } = useAuditEvents();
    const { request } = useApiRequest();
    const router = useRouter();

    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 25;

    // Filter state
    const [dateFrom, setDateFrom] = useState<Date>();
    const [dateTo, setDateTo] = useState<Date>();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
    const [selectedActors, setSelectedActors] = useState<string[]>([]);
    const [selectedResults, setSelectedResults] = useState<Array<'Success' | 'Failure' | 'Warning'>>([]);
    const [searchText, setSearchText] = useState('');

    // Fetch events on mount if not already loaded
    useEffect(() => {
        if (recentEvents.length === 0 && !contextLoading && !contextError) {
            fetchData('all', 'all', 'all');
        }
    }, [recentEvents.length, contextLoading, contextError, fetchData]);

    // Derived unique values from events (both from context and search results)
    const allAvailableEvents = useMemo(() => {
        // Combine context events with search results for filter options
        return events.length > 0 ? events : recentEvents;
    }, [events, recentEvents]);

    // Real-time filtered events - apply selected filters immediately
    const filteredEvents = useMemo(() => {
        let filtered = allAvailableEvents;

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(e => selectedCategories.includes(e.category));
        }

        // Apply activity filter
        if (selectedActivities.length > 0) {
            filtered = filtered.filter(e => selectedActivities.includes(e.activityType));
        }

        // Apply actor filter
        if (selectedActors.length > 0) {
            filtered = filtered.filter(e => selectedActors.includes(e.actorUserPrincipalName));
        }

        // Apply component filter
        if (selectedComponents.length > 0) {
            filtered = filtered.filter(e => selectedComponents.includes(e.componentName));
        }

        // Apply result filter
        if (selectedResults.length > 0) {
            filtered = filtered.filter(e => selectedResults.includes(e.activityResult as 'Success' | 'Failure' | 'Warning'));
        }

        // Apply date range filter
        if (dateFrom) {
            filtered = filtered.filter(e => new Date(e.activityDateTime) >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(e => new Date(e.activityDateTime) <= dateTo);
        }

        // Apply text search
        if (searchText && searchText.trim()) {
            const query = searchText.toLowerCase();
            filtered = filtered.filter(e =>
                e.displayName?.toLowerCase().includes(query) ||
                e.actorUserPrincipalName?.toLowerCase().includes(query) ||
                e.category?.toLowerCase().includes(query) ||
                e.activityType?.toLowerCase().includes(query) ||
                e.componentName?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [allAvailableEvents, selectedCategories, selectedActivities, selectedActors, selectedComponents, selectedResults, dateFrom, dateTo, searchText]);

    // Cascading filter logic: each filter shows only values that exist in events matching OTHER selected filters
    const uniqueCategories = useMemo(() => {
        if (!allAvailableEvents.length) return [];

        // Filter events based on OTHER selected filters (not categories)
        const filtered = allAvailableEvents.filter(e => {
            if (selectedActivities.length > 0 && !selectedActivities.includes(e.activityType)) return false;
            if (selectedActors.length > 0 && !selectedActors.includes(e.actorUserPrincipalName)) return false;
            if (selectedComponents.length > 0 && !selectedComponents.includes(e.componentName)) return false;
            if (selectedResults.length > 0 && !selectedResults.includes(e.activityResult as 'Success' | 'Failure' | 'Warning')) return false;
            return true;
        });

        const cats = new Set<string>();
        filtered.forEach(e => {
            if (e.category && e.category.trim() !== '') {
                cats.add(e.category);
            }
        });
        return Array.from(cats).sort();
    }, [allAvailableEvents, selectedActivities, selectedActors, selectedComponents, selectedResults]);

    const uniqueActivities = useMemo(() => {
        if (!allAvailableEvents.length) return [];

        // Filter events based on OTHER selected filters (not activities)
        const filtered = allAvailableEvents.filter(e => {
            if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false;
            if (selectedActors.length > 0 && !selectedActors.includes(e.actorUserPrincipalName)) return false;
            if (selectedComponents.length > 0 && !selectedComponents.includes(e.componentName)) return false;
            if (selectedResults.length > 0 && !selectedResults.includes(e.activityResult as 'Success' | 'Failure' | 'Warning')) return false;
            return true;
        });

        const acts = new Set<string>();
        filtered.forEach(e => {
            if (e.activityType && e.activityType.trim() !== '') {
                acts.add(e.activityType);
            }
        });
        return Array.from(acts).sort();
    }, [allAvailableEvents, selectedCategories, selectedActors, selectedComponents, selectedResults]);

    const uniqueActors = useMemo(() => {
        if (!allAvailableEvents.length) return [];

        // Filter events based on OTHER selected filters (not actors)
        const filtered = allAvailableEvents.filter(e => {
            if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false;
            if (selectedActivities.length > 0 && !selectedActivities.includes(e.activityType)) return false;
            if (selectedComponents.length > 0 && !selectedComponents.includes(e.componentName)) return false;
            if (selectedResults.length > 0 && !selectedResults.includes(e.activityResult as 'Success' | 'Failure' | 'Warning')) return false;
            return true;
        });

        const actors = new Set<string>();
        filtered.forEach(e => {
            if (e.actorUserPrincipalName && e.actorUserPrincipalName.trim() !== '') {
                actors.add(e.actorUserPrincipalName);
            }
        });
        return Array.from(actors).sort();
    }, [allAvailableEvents, selectedCategories, selectedActivities, selectedComponents, selectedResults]);

    const uniqueComponents = useMemo(() => {
        if (!allAvailableEvents.length) return [];

        // Filter events based on OTHER selected filters (not components)
        const filtered = allAvailableEvents.filter(e => {
            if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false;
            if (selectedActivities.length > 0 && !selectedActivities.includes(e.activityType)) return false;
            if (selectedActors.length > 0 && !selectedActors.includes(e.actorUserPrincipalName)) return false;
            if (selectedResults.length > 0 && !selectedResults.includes(e.activityResult as 'Success' | 'Failure' | 'Warning')) return false;
            return true;
        });

        const comps = new Set<string>();
        filtered.forEach(e => {
            if (e.componentName && e.componentName.trim() !== '') {
                comps.add(e.componentName);
            }
        });
        return Array.from(comps).sort();
    }, [allAvailableEvents, selectedCategories, selectedActivities, selectedActors, selectedResults]);

    // Saved presets
    const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
    const [presetName, setPresetName] = useState('');

    useEffect(() => {
        // Load saved presets from localStorage
        const saved = localStorage.getItem('auditFilterPresets');
        if (saved) {
            setSavedPresets(JSON.parse(saved));
        }
    }, []);

    // Auto-cleanup: Remove selected values that are no longer available due to cascading filters
    useEffect(() => {
        // Clean up categories that are no longer valid
        if (selectedCategories.length > 0) {
            const validCategories = selectedCategories.filter(cat => uniqueCategories.includes(cat));
            if (validCategories.length !== selectedCategories.length) {
                setSelectedCategories(validCategories);
            }
        }
    }, [uniqueCategories]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Clean up activities that are no longer valid
        if (selectedActivities.length > 0) {
            const validActivities = selectedActivities.filter(act => uniqueActivities.includes(act));
            if (validActivities.length !== selectedActivities.length) {
                setSelectedActivities(validActivities);
            }
        }
    }, [uniqueActivities]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Clean up actors that are no longer valid
        if (selectedActors.length > 0) {
            const validActors = selectedActors.filter(actor => uniqueActors.includes(actor));
            if (validActors.length !== selectedActors.length) {
                setSelectedActors(validActors);
            }
        }
    }, [uniqueActors]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Clean up components that are no longer valid
        if (selectedComponents.length > 0) {
            const validComponents = selectedComponents.filter(comp => uniqueComponents.includes(comp));
            if (validComponents.length !== selectedComponents.length) {
                setSelectedComponents(validComponents);
            }
        }
    }, [uniqueComponents]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleSearch = async () => {

        setLoading(true);

        const filters: AuditFilterRequest = {
            pageNumber: currentPage,
            pageSize,
            ...(dateFrom && { dateFrom: dateFrom.toISOString() }),
            ...(dateTo && { dateTo: dateTo.toISOString() }),
            ...(selectedCategories.length > 0 && { categories: selectedCategories }),
            ...(selectedActivities.length > 0 && { activities: selectedActivities }),
            ...(selectedComponents.length > 0 && { components: selectedComponents }),
            ...(selectedActors.length > 0 && { actors: selectedActors }),
            ...(selectedResults.length > 0 && { results: selectedResults }),
            ...(searchText && { searchText })
        };

        try {
            const response = await request<AuditEventPageResponse>(
                AUDIT_LOGS_INTUNE_FILTER,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filters)
                }
            );

            if (response?.data?.items) {
                // Sort events by activityDateTime, newest first
                const sortedEvents = [...response.data.items].sort((a, b) =>
                    new Date(b.activityDateTime).getTime() - new Date(a.activityDateTime).getTime()
                );
                setEvents(sortedEvents);
                setTotalCount(response.data.totalCount || response.data.items.length);

                // If metadata is not loaded/available, we could try to infer some common values from the first page of results
                // to help populate filters if they are empty. However, unique* UseMemos handle this dynamic population
                // from the loaded events.
            }
        } catch (err) {
            console.error('Failed to search events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDatePreset = useCallback((hours: number) => {
        const to = new Date();
        const from = new Date();
        from.setHours(from.getHours() - hours);
        setDateFrom(from);
        setDateTo(to);
    }, []);

    const clearFilters = useCallback(() => {
        setDateFrom(undefined);
        setDateTo(undefined);
        setSelectedCategories([]);
        setSelectedActivities([]);
        setSelectedComponents([]);
        setSelectedActors([]);
        setSelectedResults([]);
        setSearchText('');
        setEvents([]);
    }, []);

    const savePreset = useCallback(() => {
        if (!presetName) return;

        const preset: FilterPreset = {
            id: Date.now().toString(),
            name: presetName,
            filters: {
                ...(dateFrom && { dateFrom: dateFrom.toISOString() }),
                ...(dateTo && { dateTo: dateTo.toISOString() }),
                categories: selectedCategories,
                activities: selectedActivities,
                components: selectedComponents,
                actors: selectedActors,
                results: selectedResults,
                searchText
            }
        };

        const updated = [...savedPresets, preset];
        setSavedPresets(updated);
        localStorage.setItem('auditFilterPresets', JSON.stringify(updated));
        setPresetName('');
    }, [presetName, dateFrom, dateTo, selectedCategories, selectedActivities, selectedComponents, selectedActors, selectedResults, searchText, savedPresets]);

    const loadPreset = useCallback((preset: FilterPreset) => {
        if (preset.filters.dateFrom) setDateFrom(new Date(preset.filters.dateFrom));
        if (preset.filters.dateTo) setDateTo(new Date(preset.filters.dateTo));
        setSelectedCategories(preset.filters.categories || []);
        setSelectedActivities(preset.filters.activities || []);
        setSelectedComponents(preset.filters.components || []);
        setSelectedActors(preset.filters.actors || []);
        setSelectedResults(preset.filters.results || []);
        setSearchText(preset.filters.searchText || '');
    }, []);

    const deletePreset = useCallback((id: string) => {
        const updated = savedPresets.filter(p => p.id !== id);
        setSavedPresets(updated);
        localStorage.setItem('auditFilterPresets', JSON.stringify(updated));
    }, [savedPresets]);

    const exportToCSV = useCallback(() => {
        const headers = ['Timestamp', 'Activity', 'Actor', 'Category', 'Component', 'Result', 'Display Name'];
        const rows = filteredEvents.map(e => [
            e.activityDateTime,
            e.activityType || '',
            e.actorUserPrincipalName || 'Unknown',
            e.category || '',
            e.componentName || '',
            e.activityResult || '',
            e.displayName || ''
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-events-${new Date().toISOString()}.csv`;
        a.click();
    }, [filteredEvents]);

    const exportToJSON = useCallback(() => {
        const json = JSON.stringify(filteredEvents, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-events-${new Date().toISOString()}.json`;
        a.click();
    }, [filteredEvents]);


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

    // Define columns for DataTable
    const columns = useMemo(() => [
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
                const event = row as unknown as AuditEvent;
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
            key: 'componentName',
            label: 'Component',
            width: 180,
            render: (value: unknown) => {
                return <Badge variant="outline" className="text-xs">{String(value)}</Badge>;
            }
        },
        {
            key: 'activityResult',
            label: 'Status',
            width: 120,
            render: (value: unknown) => getResultBadge(String(value))
        }
    ], [getResultBadge]);

    const activeFiltersCount = useMemo(() => {
        return [
            selectedCategories.length,
            selectedActivities.length,
            selectedComponents.length,
            selectedActors.length,
            selectedResults.length,
            dateFrom ? 1 : 0,
            searchText ? 1 : 0
        ].reduce((a, b) => a + b, 0);
    }, [selectedCategories, selectedActivities, selectedComponents, selectedActors, selectedResults, dateFrom, searchText]);

    const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Search className="h-8 w-8 text-blue-500" />
                        Advanced Event Search
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Filter and explore audit events with precision
                    </p>
                </div>
                <Link href="/audit-events">
                    <Button variant="outline">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Filter Panel */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge className="bg-blue-500">{activeFiltersCount} active</Badge>
                            )}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                            <Button size="sm" onClick={handleSearch} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                Search
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/30 dark:border-gray-700/50">
                                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/30 dark:border-gray-700/50">
                                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <Label>Quick Presets</Label>
                            <div className="flex gap-2 flex-wrap">
                                {DATE_PRESETS.map(preset => (
                                    <Button
                                        key={preset.label}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDatePreset(preset.hours)}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search Text */}
                    <div className="space-y-2">
                        <Label>Free Text Search</Label>
                        <Input
                            placeholder="Search across all fields..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    {/* Multi-select Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <Select
                                value={selectedCategories[0] || ''}
                                onValueChange={(val) => {
                                    if (val && !selectedCategories.includes(val)) {
                                        setSelectedCategories([...selectedCategories, val]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select categories..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/30 dark:border-gray-700/50">
                                    {uniqueCategories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedCategories.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedCategories.map(cat => (
                                        <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                                            <span>{cat}</span>
                                            <button
                                                type="button"
                                                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Activities</Label>
                            <Select
                                value={selectedActivities[0] || ''}
                                onValueChange={(val) => {
                                    if (val && !selectedActivities.includes(val)) {
                                        setSelectedActivities([...selectedActivities, val]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activities..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/30 dark:border-gray-700/50">
                                    {uniqueActivities.map(act => (
                                        <SelectItem key={act} value={act}>{act}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedActivities.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedActivities.map(act => (
                                        <Badge key={act} variant="secondary" className="flex items-center gap-1">
                                            <span>{act}</span>
                                            <button
                                                type="button"
                                                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedActivities(selectedActivities.filter(a => a !== act));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Actors</Label>
                            <Select
                                value={selectedActors[0] || ''}
                                onValueChange={(val) => {
                                    if (val && !selectedActors.includes(val)) {
                                        setSelectedActors([...selectedActors, val]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select actors..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/30 dark:border-gray-700/50">
                                    {uniqueActors.map(actor => (
                                        <SelectItem key={actor} value={actor}>{actor}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedActors.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedActors.map(actor => (
                                        <Badge key={actor} variant="secondary" className="flex items-center gap-1">
                                            <span>{actor}</span>
                                            <button
                                                type="button"
                                                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedActors(selectedActors.filter(a => a !== actor));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Components</Label>
                            <Select
                                value={selectedComponents[0] || ''}
                                onValueChange={(val) => {
                                    if (val && !selectedComponents.includes(val)) {
                                        setSelectedComponents([...selectedComponents, val]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select components..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/30 dark:border-gray-700/50">
                                    {uniqueComponents.map(comp => (
                                        <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedComponents.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedComponents.map(comp => (
                                        <Badge key={comp} variant="secondary" className="flex items-center gap-1">
                                            <span>{comp}</span>
                                            <button
                                                type="button"
                                                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedComponents(selectedComponents.filter(c => c !== comp));
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Result</Label>
                            <div className="flex gap-2">
                                {(['Success', 'Failure', 'Warning'] as const).map(result => (
                                    <Button
                                        key={result}
                                        variant={selectedResults.includes(result) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setSelectedResults(prev =>
                                                prev.includes(result)
                                                    ? prev.filter(r => r !== result)
                                                    : [...prev, result]
                                            );
                                        }}
                                    >
                                        {result}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Save Preset */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Save Filter Preset</Label>
                                <Input
                                    placeholder="Preset name..."
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                />
                            </div>
                            <Button onClick={savePreset} disabled={!presetName}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                        {savedPresets.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {savedPresets.map(preset => (
                                    <Badge key={preset.id} variant="outline" className="flex items-center gap-1">
                                        <span className="cursor-pointer" onClick={() => loadPreset(preset)}>{preset.name}</span>
                                        <button
                                            type="button"
                                            className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deletePreset(preset.id);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            {allAvailableEvents.length > 0 ? (
                                <>
                                    Results ({filteredEvents.length.toLocaleString()} of {allAvailableEvents.length.toLocaleString()} events{events.length === 0 ? ' from cache' : ''})
                                </>
                            ) : (
                                'Results'
                            )}
                        </CardTitle>
                        {filteredEvents.length > 0 && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredEvents.length === 0}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button variant="outline" size="sm" onClick={exportToJSON} disabled={filteredEvents.length === 0}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export JSON
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {(loading || contextLoading) ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                            <span className="text-gray-600 dark:text-gray-400">Loading events...</span>
                        </div>
                    ) : contextError ? (
                        <div className="text-center py-12">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600 dark:text-red-400">{contextError}</p>
                            <Button onClick={() => fetchData('all', 'all', 'all')} className="mt-4" variant="outline">
                                Try Again
                            </Button>
                        </div>
                    ) : allAvailableEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">No events found</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters or search criteria</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">No events match your filters</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting or removing some filters</p>
                            <Button onClick={clearFilters} className="mt-4" variant="outline">
                                Clear All Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <DataTable
                                data={filteredEvents as unknown as Record<string, unknown>[]}
                                columns={columns}
                                onRowClick={(row) => router.push(`/audit-events/${(row as unknown as AuditEvent).id}`)}
                                itemsPerPage={pageSize}
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
