'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { RefreshCw, Search, X, Filter, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { GROUP_FILTER_ANALYZER_ENDPOINT, ITEMS_PER_PAGE } from '@/lib/constants';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import type { GroupFilterAnalysisSummaryDto, FilterConvertibility } from '@/types/groupFilterAnalyzer';
import type { DynamicGroupFilterAnalysis } from '@/types/dynamicGroupFilterAnalysis';
import { DynamicGroupFilterAnalysisDialog } from '@/components/DynamicGroupFilterAnalysisDialog';

interface ApiResponse {
    status: string;
    message: string;
    data: GroupFilterAnalysisSummaryDto[];
}

const convertibilityConfig: Record<FilterConvertibility, { label: string; icon: React.ReactNode; badgeClass: string }> = {
    NoMappableProperties: {
        label: 'Not Convertible',
        icon: <XCircle className="h-3.5 w-3.5" />,
        badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    },
    PartialConvertible: {
        label: 'Partial',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    },
    FullyConvertible: {
        label: 'Convertible',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        badgeClass: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    },
    NotDynamic: {
        label: 'Not Dynamic',
        icon: <XCircle className="h-3.5 w-3.5" />,
        badgeClass: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
    },
};

export default function GroupFilterAnalyzerPage() {
    const { request } = useApiRequest();
    const [groups, setGroups] = useState<GroupFilterAnalysisSummaryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [convertibilityFilter, setConvertibilityFilter] = useState<string[]>([]);
    const [matchFilter, setMatchFilter] = useState<string[]>([]);

    // Detail dialog
    const [selectedGroup, setSelectedGroup] = useState<GroupFilterAnalysisSummaryDto | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, convertibilityFilter, matchFilter]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await request<ApiResponse>(GROUP_FILTER_ANALYZER_ENDPOINT);
            // Hook wraps response: res.data is the API envelope, res.data.data is the array
            const data = (res?.data as unknown as ApiResponse)?.data;
            setGroups(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const convertibilityOptions: Option[] = [
        { label: 'Convertible', value: 'FullyConvertible' },
        { label: 'Partial', value: 'PartialConvertible' },
        { label: 'Not Convertible', value: 'NoMappableProperties' },
    ];

    const matchOptions: Option[] = [
        { label: 'Has Matching Filter', value: 'matched' },
        { label: 'No Matching Filter', value: 'unmatched' },
    ];

    const filtered = useMemo(() => {
        return groups.filter(g => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!g.groupDisplayName.toLowerCase().includes(q) &&
                    !g.membershipRule.toLowerCase().includes(q)) return false;
            }
            if (convertibilityFilter.length > 0 && !convertibilityFilter.includes(g.filterConvertibility)) return false;
            if (matchFilter.length > 0) {
                const hasMatch = g.matchingExistingFilters?.length > 0;
                if (matchFilter.includes('matched') && !hasMatch) return false;
                if (matchFilter.includes('unmatched') && hasMatch) return false;
            }
            return true;
        });
    }, [groups, searchQuery, convertibilityFilter, matchFilter]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const stats = useMemo(() => ({
        total: groups.length,
        convertible: groups.filter(g => g.filterConvertibility === 'FullyConvertible').length,
        partial: groups.filter(g => g.filterConvertibility === 'PartialConvertible').length,
        notConvertible: groups.filter(g => g.filterConvertibility === 'NoMappableProperties').length,
        withMatch: groups.filter(g => (g.matchingExistingFilters?.length ?? 0) > 0).length,
    }), [groups]);

    const columns = [
        {
            key: 'groupDisplayName' as string,
            label: 'Group Name',
            render: (value: unknown, row: Record<string, unknown>) => {
                const g = row as unknown as GroupFilterAnalysisSummaryDto;
                return (
                    <button
                        onClick={() => setSelectedGroup(g)}
                        className="text-left font-medium text-yellow-400 hover:text-yellow-500 underline underline-offset-2 text-sm"
                    >
                        {g.groupDisplayName}
                    </button>
                );
            }
        },
        {
            key: 'filterConvertibility' as string,
            label: 'Convertibility',
            render: (value: unknown) => {
                const v = value as FilterConvertibility;
                const cfg = convertibilityConfig[v];
                if (!cfg) return null;
                return (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}>
                        {cfg.icon}
                        {cfg.label}
                    </span>
                );
            }
        },
        {
            key: 'matchingExistingFilters' as string,
            label: 'Existing Filter Match',
            render: (value: unknown) => {
                const matches = (value as GroupFilterAnalysisSummaryDto['matchingExistingFilters']) ?? [];
                if (matches.length === 0) return <span className="text-xs text-muted-foreground">None</span>;
                return (
                    <div className="flex flex-col gap-0.5">
                        {matches.slice(0, 2).map(m => (
                            <span key={m.id} className="inline-flex items-center gap-1 text-xs">
                                <Badge variant={m.matchType === 'Exact' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                    {m.matchType}
                                </Badge>
                                <span className="truncate max-w-[180px]" title={m.displayName}>{m.displayName}</span>
                            </span>
                        ))}
                        {matches.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{matches.length - 2} more</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'mappableProperties' as string,
            label: 'Mappable Properties',
            render: (value: unknown) => {
                const props = (value as string[]) ?? [];
                if (props.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {props.map(p => (
                            <code key={p} className="text-[10px] bg-muted rounded px-1 py-0.5">{p}</code>
                        ))}
                    </div>
                );
            }
        },
        {
            key: 'membershipRule' as string,
            label: 'Membership Rule',
            render: (value: unknown) => (
                <code className="text-xs text-muted-foreground truncate block max-w-[300px]" title={String(value)}>
                    {String(value)}
                </code>
            )
        },
    ];

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Group to Filter Analyzer</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Analyzes all dynamic groups and checks if they can be replaced by assignment filters.
                    </p>
                </div>
                <Button onClick={fetchData} disabled={loading} variant="outline" size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Summary cards */}
            {groups.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Dynamic Groups', value: stats.total, cls: 'text-foreground' },
                        { label: 'Convertible', value: stats.convertible, cls: 'text-green-600 dark:text-green-400' },
                        { label: 'Partial', value: stats.partial, cls: 'text-yellow-600 dark:text-yellow-400' },
                        { label: 'Not Convertible', value: stats.notConvertible, cls: 'text-red-600 dark:text-red-400' },
                        { label: 'Filter Match Found', value: stats.withMatch, cls: 'text-blue-600 dark:text-blue-400' },
                    ].map(s => (
                        <Card key={s.label} className="p-3">
                            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsFiltersExpanded(v => !v)}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <CardTitle className="text-base">Filters</CardTitle>
                        </div>
                        {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </CardHeader>
                {isFiltersExpanded && (
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search group name or rule…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5">
                                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                            <MultiSelect
                                options={convertibilityOptions}
                                selected={convertibilityFilter}
                                onChange={setConvertibilityFilter}
                                placeholder="Convertibility"
                                className="min-w-[180px]"
                            />
                            <MultiSelect
                                options={matchOptions}
                                selected={matchFilter}
                                onChange={setMatchFilter}
                                placeholder="Filter match"
                                className="min-w-[180px]"
                            />
                            {(searchQuery || convertibilityFilter.length > 0 || matchFilter.length > 0) && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSearchQuery('');
                                    setConvertibilityFilter([]);
                                    setMatchFilter([]);
                                }}>
                                    <X className="h-4 w-4 mr-1" /> Clear
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Showing {filtered.length} of {groups.length} dynamic groups
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Table */}
            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {loading ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground text-sm">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" />
                        Fetching all dynamic groups and assignment filters…
                    </CardContent>
                </Card>
            ) : (
                <DataTable
                    data={filtered as unknown as Record<string, unknown>[]}
                    columns={columns}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
                />
            )}

            {/* Detail dialog — uses pre-loaded data, no extra fetch */}
            {selectedGroup && (
                <DynamicGroupFilterAnalysisDialog
                    groupId={selectedGroup.groupId.toString()}
                    groupDisplayName={selectedGroup.groupDisplayName}
                    isOpen={!!selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    preloadedAnalysis={selectedGroup as unknown as DynamicGroupFilterAnalysis}
                />
            )}
        </div>
    );
}
