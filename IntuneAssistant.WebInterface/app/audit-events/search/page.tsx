'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
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
    ChevronDown,
    ChevronUp,
    Eye,
    Filter,
    Calendar as CalendarIcon,
    Loader2,
    Save,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    AUDIT_EVENT_FILTER_ENDPOINT,
    AUDIT_EVENT_METADATA_ENDPOINT
} from '@/lib/constants';
import {
    AuditEvent,
    AuditEventPageResponse,
    AuditFilterRequest,
    AuditMetadata,
    AuditMetadataResponse,
    FilterPreset
} from '@/types/auditEvents';
import { format } from 'date-fns';

const DATE_PRESETS = [
    { label: 'Last 24 Hours', hours: 24 },
    { label: 'Last 7 Days', hours: 24 * 7 },
    { label: 'Last 30 Days', hours: 24 * 30 },
    { label: 'Last 90 Days', hours: 24 * 90 },
];

export default function AuditSearchPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [metadata, setMetadata] = useState<AuditMetadata | null>(null);
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
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

    // Saved presets
    const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
    const [presetName, setPresetName] = useState('');

    useEffect(() => {
        if (accounts.length > 0) {
            fetchMetadata();
            // Load saved presets from localStorage
            const saved = localStorage.getItem('auditFilterPresets');
            if (saved) {
                setSavedPresets(JSON.parse(saved));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts.length]);

    const fetchMetadata = async () => {
        try {
            const response = await request<AuditMetadataResponse>(
                AUDIT_EVENT_METADATA_ENDPOINT,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            if (response?.data) {
                setMetadata(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch metadata:', err);
        }
    };

    const handleSearch = async () => {
        if (!accounts.length) return;

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
                AUDIT_EVENT_FILTER_ENDPOINT,
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
        const rows = events.map(e => [
            e.activityDateTime,
            e.activityType,
            e.actorUserPrincipalName,
            e.category,
            e.componentName,
            e.activityResult,
            e.displayName
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-events-${new Date().toISOString()}.csv`;
        a.click();
    }, [events]);

    const exportToJSON = useCallback(() => {
        const json = JSON.stringify(events, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-events-${new Date().toISOString()}.json`;
        a.click();
    }, [events]);

    const toggleRowExpansion = useCallback((id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
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
                                <PopoverContent className="w-auto p-0">
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
                                <PopoverContent className="w-auto p-0">
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
                                <SelectContent>
                                    {metadata?.categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedCategories.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedCategories.map(cat => (
                                        <Badge key={cat} variant="secondary">
                                            {cat}
                                            <X
                                                className="h-3 w-3 ml-1 cursor-pointer"
                                                onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
                                            />
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
                                <SelectContent>
                                    {metadata?.activities.map(act => (
                                        <SelectItem key={act} value={act}>{act}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedActivities.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                    {selectedActivities.map(act => (
                                        <Badge key={act} variant="secondary">
                                            {act}
                                            <X
                                                className="h-3 w-3 ml-1 cursor-pointer"
                                                onClick={() => setSelectedActivities(selectedActivities.filter(a => a !== act))}
                                            />
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
                                    <Badge key={preset.id} variant="outline" className="cursor-pointer">
                                        <span onClick={() => loadPreset(preset)}>{preset.name}</span>
                                        <X
                                            className="h-3 w-3 ml-2 cursor-pointer"
                                            onClick={() => deletePreset(preset.id)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {events.length > 0 && (
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Results ({totalCount.toLocaleString()} events found)
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={exportToCSV}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button variant="outline" size="sm" onClick={exportToJSON}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export JSON
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {events.map((event) => {
                                const isExpanded = expandedRows.has(event.id);
                                return (
                                    <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <div className="flex-1 grid grid-cols-5 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Time</p>
                                                    <p className="text-sm font-medium">{new Date(event.activityDateTime).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Activity</p>
                                                    <p className="text-sm font-medium">{event.activityType || event.displayName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Actor</p>
                                                    <p className="text-sm">{event.actorUserPrincipalName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Category</p>
                                                    <Badge variant="outline" className="text-xs">{event.category}</Badge>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Result</p>
                                                    {getResultBadge(event.activityResult)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/audit-events/${event.id}`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => toggleRowExpansion(event.id)}
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Display Name</p>
                                                        <p className="text-sm">{event.displayName}</p>
                                                    </div>
                                                    {event.resources && event.resources.length > 0 && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-2">Affected Resources</p>
                                                            <div className="space-y-2">
                                                                {event.resources.map((resource, idx) => (
                                                                    <div key={idx} className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                                                        <p className="text-sm font-medium">{resource.displayName}</p>
                                                                        <p className="text-xs text-gray-500">{resource.type}</p>
                                                                        {resource.modifiedProperties && resource.modifiedProperties.length > 0 && (
                                                                            <div className="mt-2 space-y-1">
                                                                                {resource.modifiedProperties.map((prop, pidx) => (
                                                                                    <div key={pidx} className="text-xs">
                                                                                        <span className="font-medium">{prop.displayName}:</span>
                                                                                        <span className="text-red-500 mx-1">{prop.oldValue || '(empty)'}</span>
                                                                                        →
                                                                                        <span className="text-green-500 mx-1">{prop.newValue || '(empty)'}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
