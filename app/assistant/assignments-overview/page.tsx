'use client';
import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {useMsal} from '@azure/msal-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DataTable} from '@/components/DataTable';
import {Badge} from '@/components/ui/badge';
import {
    RefreshCw,
    Filter,
    Database,
    Search,
    X,
    Shield,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    List,
    Layers,
    XCircle, Blocks, CircleQuestionMark
} from 'lucide-react';
import {ASSIGNMENTS_ENDPOINT,
    ASSIGNMENTS_FILTERS_ENDPOINT,
    ITEMS_PER_PAGE,
    ROLE_SCOPETAGS_ENDPOINT,
    ASSIGNMENTS_OVERVIEW_VIEW_MODE_KEY
} from '@/lib/constants';

import {MultiSelect, Option} from '@/components/ui/multi-select';

import {ExportButton, ExportData, ExportColumn} from '@/components/ExportButton';
import {GroupDetailsDialog} from '@/components/GroupDetailsDialog';
import {useApiRequest} from "@/hooks/useApiRequest";
import { formatRelativeTime } from "@/lib/time";
import {CancelledCard} from "@/components/CancelledCard";
import {SearchQueryParam} from "@/components/SearchQueryParam";
import {FilterDetailsDialog} from "@/components/FilterDialog";
import {AssignmentWarningIcon} from "@/components/AssignmentWarningIcon";
import {AssignmentsTableSkeleton} from "@/components/AssignmentsTableSkeleton";
import {AssignmentFilter} from "@/types/assignmentFilter";
import { filterRowsBySearchTerm } from '@/lib/tableSearch';


// Simple interface instead of complex schema. Rows are `OverviewAssignmentRow`s from the tenant overview stream
// (the same `CustomAssignmentsModel` shape `GET /v1/assignments` returns); the cast in the component narrows the
// nullable fields this page has always treated as present.
interface Assignments extends Record<string, unknown> {
    resourceType: string;
    subResourceType: string;
    assignmentType: string;
    platform: string | null;
    isAssigned: boolean;
    // Built-in tenant default (e.g. the "All users and all devices" enrollment configurations):
    // effectively applied to everything, but not an assignment an admin made or can remove.
    isTenantDefault?: boolean;
    // Enabled / Disabled / NotConfigured for resources with an on/off state (e.g. Windows Hello for
    // Business, Windows Restore enrollment configs). NotConfigured = assigned but has no effect.
    configurationState?: string | null;
    targetId: string | null;
    targetName: string;
    resourceId: string;
    resourceName: string | null;
    filterId: string | null;
    filterType: string;
    assignmentDirection: string;
    isExcluded: boolean;
    scopeTagIds?: string[];
    warnings?: string[];
    group?: {
        id: string;
        displayName: string;
        description: string;
    };
}

const NOT_CONFIGURED_HINT =
    'This configuration is assigned but its state is Not Configured, so it has no effect on devices or users.';

const TENANT_DEFAULT_HINT =
    'Built-in tenant default. It is effectively applied to the built-in target shown in the Target column, ' +
    'but this is not an assignment an admin created and it cannot be removed.';

interface RoleScopeTag {
    id: string;
    displayName: string;
    description: string;
    isBuildIn: boolean;
    assignments: unknown[];
}

// 'flat' = one row per assignment (the original view). 'byPolicy' = one row per resource, like the
// Intune portal's policy list; unfolding a resource row shows its assignment rows underneath.
type ViewMode = 'flat' | 'byPolicy';

const readStoredViewMode = (): ViewMode => {
    try {
        return localStorage.getItem(ASSIGNMENTS_OVERVIEW_VIEW_MODE_KEY) === 'byPolicy' ? 'byPolicy' : 'flat';
    } catch {
        return 'flat';
    }
};

// A resource row in the "by policy" view. It carries the first assignment's resource-level fields so the
// existing column renderers work unchanged, plus the assignments that currently pass the filters and search.
// `assignments` is a nested array on purpose: DataTable's search walks nested arrays, so searching for a
// group name still finds the resource that is assigned to it.
interface PolicyRow extends Assignments {
    __group: true;
    __key: string;
    assignments: Assignments[];
    assignmentCount: number;
}

// An assignment row rendered under its unfolded resource row.
interface PolicyChildRow extends Assignments {
    __child: true;
}

const policyKeyOf = (a: Assignments): string =>
    a.resourceId ? `${a.resourceType}:${a.resourceId}` : `${a.resourceType}:${a.subResourceType}:${a.resourceName ?? ''}`;

const groupByPolicy = (rows: Assignments[]): PolicyRow[] => {
    const groups = new Map<string, Assignments[]>();
    for (const row of rows) {
        const key = policyKeyOf(row);
        const bucket = groups.get(key);
        if (bucket) bucket.push(row); else groups.set(key, [row]);
    }
    return Array.from(groups.entries()).map(([key, assignments]) => {
        const first = assignments[0];
        const real = assignments.filter(a => a.isAssigned || a.isTenantDefault);
        return {
            ...first,
            __group: true,
            __key: key,
            // The resource is "assigned" when at least one of its assignments is. The unassigned placeholder
            // row (targetName empty, isAssigned false) is not an assignment, so it does not count.
            isAssigned: assignments.some(a => a.isAssigned),
            isTenantDefault: assignments.some(a => a.isTenantDefault),
            // The resource-level fields stay; the assignment-level fields are blanked so a collapsed row only
            // shows Resource, Platform and Status (the column renderers also check `__group`).
            assignmentType: '',
            targetName: '',
            targetId: null,
            filterId: null,
            filterType: 'None',
            assignmentDirection: '',
            isExcluded: false,
            group: undefined,
            warnings: Array.from(new Set(assignments.flatMap(a => a.warnings ?? []))),
            assignments,
            assignmentCount: real.length,
        };
    });
};





export default function AssignmentsOverview() {
    // API CALLS
    const { accounts } = useMsal();
    const { request, cancel } = useApiRequest();
    // Consent dialog state when not enough permissions

    const [searchQuery, setSearchQuery] = useState('');
    const applyQueryParam = useCallback((value: string) => setSearchQuery(value), []);
    // Mirrors DataTable's own built-in search box, so exports can match what's actually shown in the table.
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    // Rows come from the assignments endpoint (GET). Filters and scope tags are small lookups and stay page-local.
    const [assignments, setAssignments] = useState<Assignments[]>([]);
    const [fetchedAt, setFetchedAt] = useState<number | null>(null);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
    const [filteredAssignments, setFilteredAssignments] = useState<Assignments[]>([]);
    const [filters, setFilters] = useState<AssignmentFilter[]>([]);
    const [lookupsLoading, setLookupsLoading] = useState(false);
    const [lookupsError, setLookupsError] = useState<string | null>(null);
    const refreshing = assignmentsLoading;
    // Only block the page while the very first rows are still on their way; a refresh keeps the old rows visible.
    const loading = lookupsLoading || (refreshing && assignments.length === 0);
    const error = lookupsError ?? assignmentsError;
    const [roleScopeTags, setRoleScopeTags] = useState<RoleScopeTag[]>([]);

    const [isCancelled, setIsCancelled] = useState(false);

    // Filter dialog states
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<AssignmentFilter | null>(null);

    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    // Filter states
    const [assignmentTypeFilter, setAssignmentTypeFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [resourceTypeFilter, setResourceTypeFilter] = useState<string[]>([]);
    const [filterTypeFilter, setFilterTypeFilter] = useState<string[]>([]);
    const [roleScopeTagFilter, setRoleScopeTagFilter] = useState<string[]>([]);
    const [filterNameFilter, setFilterNameFilter] = useState<string[]>([]);


    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    // View mode: flat rows (default) or grouped by resource. Remembered per browser; read after mount so the
    // server render and the first client render agree.
    const [viewMode, setViewMode] = useState<ViewMode>('flat');
    useEffect(() => { setViewMode(readStoredViewMode()); }, []);
    const changeViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        setCurrentPage(1);
        try { localStorage.setItem(ASSIGNMENTS_OVERVIEW_VIEW_MODE_KEY, mode); } catch { /* storage unavailable */ }
    };
    // Unfolded resource rows in the "by policy" view, keyed by PolicyRow.__key.
    const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(() => new Set());
    const togglePolicy = (key: string) => {
        setExpandedPolicies(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [assignmentTypeFilter, statusFilter, platformFilter, resourceTypeFilter, filterTypeFilter, roleScopeTagFilter, filterNameFilter]);

    const getUniqueFilterTypes = (): Option[] => [
        {label: 'No Filter', value: 'None'},
        {label: 'Include Filter', value: 'include'},
        {label: 'Exclude Filter', value: 'exclude'}
    ];


    const prepareExportData = (): ExportData => {
        const searchFiltered = filterRowsBySearchTerm(getSearchFilteredData(filteredAssignments), tableSearchTerm);

        const exportColumns: ExportColumn[] = [
            {
                key: 'resourceType',
                label: 'Type',
                width: 20,
                getValue: (row) => String(row.resourceType || '')
            },
            {
                key: 'subResourceType',
                label: 'Type',
                width: 20,
                getValue: (row) => String(row.subResourceType || '')
            },
            {
                key: 'resourceName',
                label: 'Resource',
                width: 30,
                getValue: (row) => String(row.resourceName || 'N/A')
            },
            {
                key: 'assignmentType',
                label: 'Assignment',
                width: 25,
                getValue: (row) => String(row.assignmentType || '')
            },
            {
                key: 'targetName',
                label: 'Target',
                width: 30,
                getValue: (row) => String(row.targetName || '')
            },
            {
                key: 'platform',
                label: 'Platform',
                width: 15,
                getValue: (row) => String(row.platform || 'All')
            },
            {
                key: 'isAssigned',
                label: 'Status',
                width: 15,
                getValue: (row) => {
                    const base = row.isTenantDefault ? 'Assigned (Tenant Default)' : (row.isAssigned ? 'Assigned' : 'Not Assigned');
                    return String(row.configurationState ?? '').toLowerCase() === 'notconfigured' ? `${base}, Not Configured` : base;
                }
            },
            {
                key: 'filterId',
                label: 'Filter',
                width: 25,
                getValue: (row) => {
                    const filterId = row.filterId as string | null;
                    if (!filterId || filterId === 'None') return 'None';
                    const filterInfo = getFilterInfo(filterId, String(row.filterType));
                    return filterInfo.displayName;
                }
            },
            {
                key: 'filterType',
                label: 'Filter Type',
                width: 25,
                getValue: (row) => String(row.filterType || '')
            },
            {
                key: 'scopeTagIds',
                label: 'Role Scope Tags',
                width: 30,
                getValue: (row) => {
                    const scopeTagIds = row.scopeTagIds as string[] | undefined;
                    const tagNames = getRoleScopeTagNames(scopeTagIds);
                    return tagNames.length > 0 ? tagNames.join(', ') : 'None';
                }
            }
        ];

        const stats = [
            {label: 'Total Assignments', value: filteredAssignments.length},
            {label: 'Assigned', value: filteredAssignments.filter(a => a.isAssigned).length},
            {label: 'Not Assigned', value: filteredAssignments.filter(a => !a.isAssigned && !a.isTenantDefault).length},
            {label: 'Tenant Default', value: filteredAssignments.filter(a => a.isTenantDefault).length},
            {label: 'Resource Types', value: new Set(filteredAssignments.map(a => a.resourceType)).size},
            {label: 'Platforms', value: new Set(filteredAssignments.map(a => a.platform)).size}
        ];

        return {
            data: searchFiltered,
            columns: exportColumns,
            filename: 'assignments-overview',
            title: 'Assignments Overview',
            description: searchQuery ? `Search results for: "${searchQuery}"` : 'Detailed view of all Intune assignments across your organization',
            stats
        };
    };

    const fetchLookups = async () => {
        if (!accounts.length) return;

        setLookupsLoading(true);
        setLookupsError(null);

        try {
            await Promise.all([fetchFilters(), fetchRoleScopeTags()]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setLookupsError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLookupsLoading(false);
        }
    };

    const fetchAssignmentRows = async () => {
        setAssignmentsLoading(true);
        setAssignmentsError(null);
        try {
            const response = await request<{ status: string; data: Assignments[] | { url: string } }>(ASSIGNMENTS_ENDPOINT, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response) throw new Error('No response received from API');
            if (!Array.isArray(response.data.data)) throw new Error('Invalid data format received from API');
            setAssignments(response.data.data);
            setFetchedAt(Date.now());
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setAssignmentsError(err instanceof Error ? err.message : 'Failed to load assignments');
        } finally {
            setAssignmentsLoading(false);
        }
    };

    const fetchAssignments = async () => {
        if (!accounts.length) return;
        setIsCancelled(false);
        void fetchAssignmentRows();
        await fetchLookups();
    };

    // Filters and scope tags are only needed once rows exist; load them the first time rows arrive (from the
    // cache or from the live stream) without the user pressing anything.
    const lookupsRequestedRef = useRef(false);
    useEffect(() => {
        if (!accounts.length || assignments.length === 0 || lookupsRequestedRef.current) return;
        lookupsRequestedRef.current = true;
        void fetchLookups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignments.length, accounts.length]);

const getSearchFilteredData = (data: Assignments[]): Assignments[] => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(assignment => {
        return (
            assignment.resourceName?.toLowerCase().includes(query) ||
            assignment.targetName?.toLowerCase().includes(query) ||
            assignment.assignmentType?.toLowerCase().includes(query) ||
            assignment.resourceType?.toLowerCase().includes(query) ||
            assignment.platform?.toLowerCase().includes(query) ||
            getFilterInfo(assignment.filterId, assignment.filterType).displayName.toLowerCase().includes(query)
        );
    });
};

// Add this new computed value right after your useEffect hooks
const displayedAssignments = getSearchFilteredData(filteredAssignments);

// "By policy" rows are built from the same filtered + searched assignments, so every existing filter keeps
// working: a resource shows up when at least one of its assignments passes, and unfolding it shows only those.
const policyRows = viewMode === 'byPolicy' ? groupByPolicy(displayedAssignments) : [];
const isGroupRow = (row: Record<string, unknown>): row is PolicyRow => row.__group === true;
const isChildRow = (row: Record<string, unknown>): boolean => row.__child === true;

    const getUniqueRoleScopeTags = (): Option[] => {
        const tagIds = new Set<string>();
        assignments.forEach(assignment => {
            assignment.scopeTagIds?.forEach(id => tagIds.add(id));
        });

        return Array.from(tagIds)
            .map(id => {
                const tag = roleScopeTags.find(t => t.id === id);
                return {
                    label: tag?.displayName || `Unknown (${id})`,
                    value: id
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    };

    const getUniqueFilterNames = (): Option[] => {
        const filterIds = new Set<string>();
        assignments.forEach(assignment => {
            if (assignment.filterId && assignment.filterId !== 'None') {
                filterIds.add(assignment.filterId);
            }
        });

        return Array.from(filterIds)
            .map(id => {
                const filter = filters.find(f => f.id === id);
                return {
                    label: filter?.displayName || `Unknown (${id})`,
                    value: id
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    };

    const getUniqueResourceTypes = (): Option[] => {
        const types = new Set<string>();
        assignments.forEach(assignment => {
            types.add(assignment.resourceType);
        });
        return Array.from(types).sort().map(type => ({label: type, value: type}));
    };

    const handleFilterClick = (filterId: string) => {
        if (filterId && filterId !== 'None') {
            // Find the filter in the already loaded filters
            const filter = filters.find(f => f.id === filterId);
            if (filter) {
                setSelectedFilter(filter);
                setIsFilterDialogOpen(true);
            }
        }
    };

    const fetchFilters = async () => {
        if (!accounts.length) return;

        try {
            const responseData = await request<{ status: number; message: string; details: unknown[]; data: AssignmentFilter[] }>(
                ASSIGNMENTS_FILTERS_ENDPOINT,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            if (!responseData) {
                console.error('No response received from filters API');
                setFilters([]);
                return;
            }

            // Unwrap ApiResponseWithCorrelation → .data is the API envelope, .data.data is the array
            if (Array.isArray(responseData.data.data)) {
                setFilters(responseData.data.data);
            } else {
                console.warn('Unexpected filters response format', responseData);
                setFilters([]);
            }
        } catch (error) {
            console.error('Failed to fetch filters:', error);
            setFilters([]);
        }
    };

    const fetchRoleScopeTags = async () => {
        if (!accounts.length) return;

        try {
            const responseData = await request<{ data: RoleScopeTag[] }>(ROLE_SCOPETAGS_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!responseData) {
                console.error('No response received from role scope tags API');
                setRoleScopeTags([]);
                return;
            }

            // Unwrap ApiResponseWithCorrelation: responseData.data is { data: RoleScopeTag[] }
            if (responseData.data && Array.isArray(responseData.data.data)) {
                setRoleScopeTags(responseData.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch role scope tags:', error);
            setRoleScopeTags([]);
        }
    };

    const getRoleScopeTagNames = (scopeTagIds: string[] | undefined): string[] => {
        if (!scopeTagIds || scopeTagIds.length === 0) return [];

        return scopeTagIds
            .map(id => {
                const tag = roleScopeTags.find(t => t.id === id);
                return tag?.displayName || `Unknown (${id})`;
            })
            .filter(Boolean);
    };

    const getFilterInfo = (filterId: string | null, filterType: string) => {
        if (!filterId || filterId === 'None' || filterType === 'None') {
            return {displayName: 'None', managementType: null, platform: null};
        }

        const filter = filters.find(f => f.id === filterId);
        return {
            displayName: filter?.displayName || 'Unknown Filter',
            managementType: filter?.assignmentFilterManagementType?.toLowerCase() || null,
            platform: filter?.platform || null
        };
    };

    // Filter function
    useEffect(() => {
        let filtered = assignments;

        // Apply dropdown filters
        if (resourceTypeFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) =>
                resourceTypeFilter.includes(assignment.resourceType)
            );
        }

        if (assignmentTypeFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                if (assignment.isTenantDefault) {
                    return assignmentTypeFilter.includes(assignment.assignmentType);
                }
                if (assignmentTypeFilter.includes('Not Assigned')) {
                    return !assignment.isAssigned || assignmentTypeFilter.includes(assignment.assignmentType);
                }
                return assignment.isAssigned && assignmentTypeFilter.includes(assignment.assignmentType);
            });
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                if (assignment.isTenantDefault) {
                    return statusFilter.includes('Tenant Default');
                }
                if (statusFilter.includes('Assigned') && statusFilter.includes('Not Assigned')) {
                    return true;
                }
                if (statusFilter.includes('Assigned')) return assignment.isAssigned;
                if (statusFilter.includes('Not Assigned')) return !assignment.isAssigned;
                return false;
            });
        }

        if (platformFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                const platform = assignment.platform || 'All';
                return platformFilter.includes(platform);
            });
        }

        if (filterTypeFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                const filterType = assignment.filterType;

                // Check for "No Filter" selection
                if (filterTypeFilter.includes('None')) {
                    if (!filterType || filterType === 'None') {
                        return true;
                    }
                }

                // Check for include filter
                if (filterTypeFilter.includes('include') && filterType === 'Include') return true;

                // Check for exclude filter
                if (filterTypeFilter.includes('exclude') && filterType === 'Exclude') return true;

                return false;
            });
        }

        if (roleScopeTagFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                return assignment.scopeTagIds?.some(id => roleScopeTagFilter.includes(id));
            });
        }

        if (filterNameFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                return assignment.filterId ? filterNameFilter.includes(assignment.filterId) : false;
            });
        }

        setFilteredAssignments(filtered);
    }, [assignments, assignmentTypeFilter, resourceTypeFilter, statusFilter, platformFilter, filterTypeFilter, roleScopeTagFilter, filterNameFilter]);


    // Get unique values for filters
    const getUniqueAssignmentTypes = (): Option[] => {
        const types = new Set<string>();
        assignments.forEach(assignment => {
            if (assignment.isAssigned || assignment.isTenantDefault) {
                types.add(assignment.assignmentType);
            } else {
                types.add('Not Assigned');
            }
        });
        return Array.from(types).sort().map(type => ({label: type, value: type}));
    };

    const getUniqueStatuses = (): Option[] => [
        {label: 'Assigned', value: 'Assigned'},
        {label: 'Not Assigned', value: 'Not Assigned'},
        {label: 'Tenant Default', value: 'Tenant Default'}
    ];

    const getUniquePlatforms = (): Option[] => {
        const platforms = new Set<string>();
        assignments.forEach(assignment => {
            platforms.add(assignment.platform || 'All');
        });
        return Array.from(platforms).sort().map(platform => ({label: platform, value: platform}));
    };

    const clearFilters = () => {
        setAssignmentTypeFilter([]);
        setResourceTypeFilter([]);
        setStatusFilter([]);
        setPlatformFilter([]);
        setFilterTypeFilter([]);
        setRoleScopeTagFilter([]);
        setFilterNameFilter([]);
    };

    // Group dialog handlers
    const handleResourceClick = (resourceId: string, assignmentType: string) => {
        if ((assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude' || assignmentType === 'GroupAssignment') && resourceId) {
            setSelectedGroupId(resourceId);
            setIsGroupDialogOpen(true);
        }
    };

    const columns = [
        {
            key: 'resourceName' as string,
            label: 'Resource',
            minWidth: 400,
            width: 400,
            render: (value: unknown, row: Record<string, unknown>) => {
                const resourceName = value ? String(value) : 'N/A';
                const resourceType = String(row.resourceType);
                const subResourceType = String(row.subResourceType);
                const resourceId = String(row.resourceId);
                const warnings = row.warnings as string[] | undefined;
                const warningIcon = <AssignmentWarningIcon warnings={warnings} />;

                if (isGroupRow(row)) {
                    const isOpen = expandedPolicies.has(row.__key);
                    const count = row.assignmentCount;
                    return (
                        <div className="flex items-start gap-2">
                            {isOpen
                                ? <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-gray-500"/>
                                : <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-gray-500"/>}
                            <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-sm truncate" title={resourceName}>
                                        {resourceName}
                                    </span>
                                    {warningIcon}
                                </div>
                                <span className="text-xs text-gray-400 block">
                                    {subResourceType && subResourceType !== 'undefined' && subResourceType !== 'null'
                                        ? `${resourceType} - ${subResourceType}`
                                        : resourceType}
                                    {' · '}{count} {count === 1 ? 'assignment' : 'assignments'}
                                </span>
                            </div>
                        </div>
                    );
                }

                if (isChildRow(row)) {
                    return (
                        <div className="pl-6 flex items-center gap-0.5">
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate" title={resourceName}>
                                {resourceName}
                            </span>
                            {warningIcon}
                        </div>
                    );
                }

                if (resourceType === 'Group' && resourceId && resourceName !== 'N/A') {
                    return (
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={() => handleResourceClick(resourceId, String(row.assignmentType))}
                                    className="text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer truncate text-left"
                                    title={resourceName}
                                >
                                    {resourceName}
                                </button>
                                {warningIcon}
                            </div>
                            <span className="text-xs text-gray-400 block">
                                {subResourceType && subResourceType !== 'undefined' && subResourceType !== 'null'
                                    ? `${resourceType} - ${subResourceType}`
                                    : resourceType}
                            </span>
                        </div>
                    );
                }

                return (
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-0.5">
                            <span className="font-medium text-sm truncate" title={resourceName}>
                                {resourceName}
                            </span>
                            {warningIcon}
                        </div>
                        <span className="text-xs text-gray-400 block">
                            {subResourceType && subResourceType !== 'undefined' && subResourceType !== 'null'
                                ? `${resourceType} - ${subResourceType}`
                                : resourceType}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'assignmentType' as string,
            label: 'Assignment',
            minWidth: 100,
            width: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                if (isGroupRow(row)) return null;
                const isAssigned = Boolean(row.isAssigned);
                const isTenantDefault = Boolean(row.isTenantDefault);
                const isNotConfigured = String(row.configurationState ?? '').toLowerCase() === 'notconfigured';
                const notConfiguredBadge = isNotConfigured ? (
                    <span title={NOT_CONFIGURED_HINT}>
                        <Badge variant="outline" className="text-xs whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                            Not Configured
                        </Badge>
                    </span>
                ) : null;

                if (isTenantDefault) {
                    return (
                        <div className="flex items-center gap-1 flex-wrap">
                            <span title={TENANT_DEFAULT_HINT}>
                                <Badge variant="outline" className="text-xs whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                                    Tenant Default
                                </Badge>
                            </span>
                            {notConfiguredBadge}
                        </div>
                    );
                }
                if (!isAssigned) {
                    return (
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            Not Assigned
                        </Badge>
                    );
                }

                const assignmentType = String(value);
                const isExclude = assignmentType.includes('Exclude');

                return (
                    <div className="flex items-center gap-1 flex-wrap">
                        <Badge
                            variant={isExclude ? "destructive" : "default"}
                            className="text-xs whitespace-nowrap"
                        >
                            {assignmentType}
                        </Badge>
                        {notConfiguredBadge}
                    </div>
                );
            }
        },
        {
            key: 'targetName' as string,
            label: 'Target',
            minWidth: 120,
            width: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                if (isGroupRow(row)) return null;
                const targetName = String(value);
                const assignmentType = String(row.assignmentType);
                const isAssigned = Boolean(row.isAssigned);
                const targetId = row.targetId as string;
                const group = row.group as {
                    id: string;
                    displayName: string;
                    description: string;
                    membershipRule: string | null;
                    groupCount?: { userCount: number; deviceCount: number; groupCount: number }
                } | undefined;

                if (isAssigned && (assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude') && targetId) {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleResourceClick(targetId, assignmentType)}
                                    className="text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer truncate flex-1 text-left bg-transparent hover:bg-transparent border-none p-0"
                                    title={targetName}
                                >
                                    {targetName}
                                </button>
                                {group?.membershipRule && (
                                    <span title="Dynamic Group">
                                        <Blocks className="h-3 w-3 text-purple-500 shrink-0"/>
                                    </span>
                                )}
                            </div>
                            {group?.groupCount && (
                                <div className="flex gap-1 text-xs text-gray-500 items-center">
                                    <span>{group.groupCount.userCount} {group.groupCount.userCount === 1 ? 'user' : 'users'}</span>
                                    <span>{group.groupCount.deviceCount} {group.groupCount.deviceCount === 1 ? 'device' : 'devices'}</span>
                                    <span>{group.groupCount.groupCount} {group.groupCount.groupCount === 1 ? 'group' : 'groups'}</span>
                                    {group.groupCount.groupCount > 0 && (
                                        <span
                                            className="text-amber-500 hover:text-amber-600 cursor-help ml-1"
                                            title="This group contains nested groups. Use the Assignments by Group page to find all nested group assignments."
                                        >
                <CircleQuestionMark className="h-3 w-3" />
            </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <span className="text-sm truncate block w-full" title={targetName}>
                        {targetName}
                    </span>
                );
            }
        },
        {
            key: 'platform' as string,
            label: 'Platform',
            width: 100,
            minWidth: 80,
            render: (value: unknown) => {
                const platform = value ? String(value) : 'All';
                const platformColors: Record<string, string> = {
                    'Windows': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
                    'iOS': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
                    'Android': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
                    'macOS': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
                    'Linux': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
                    'All': 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
                };

                return (
                    <Badge
                        variant="outline"
                        className={`text-xs whitespace-nowrap ${platformColors[platform] || platformColors['All']}`}
                    >
                        {platform}
                    </Badge>
                );
            }
        },
        {
            key: 'isAssigned' as string,
            label: 'Status',
            width: 120,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const isAssigned = Boolean(value);
                if (Boolean(row.isTenantDefault)) {
                    return (
                        <span title={TENANT_DEFAULT_HINT}>
                            <Badge variant="outline" className="text-xs whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                                Assigned (Tenant Default)
                            </Badge>
                        </span>
                    );
                }
                return (
                    <Badge variant={isAssigned ? 'default' : 'secondary'}
                           className={`text-xs whitespace-nowrap ${isAssigned ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                        {isAssigned ? 'Assigned' : 'Not Assigned'}
                    </Badge>
                );
            }
        },
        {
            key: 'filterId' as string,
            label: 'Filter',
            width: 160,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                if (isGroupRow(row)) return null;
                const filterId = value as string | null;
                const filterType = String(row.filterType);
                const filterInfo = getFilterInfo(filterId, filterType);

                if (!filterId || filterId === 'None' || filterType === 'None') {
                    return <span className="text-xs text-gray-500">None</span>;
                }

                const isInclude = filterType === 'Include';

                return (
                    <div className="space-y-1">
                        <button
                            onClick={() => handleFilterClick(filterId)}
                            className="text-yellow-400 hover:text-yellow-500 underline text-xs font-medium cursor-pointer truncate block w-full text-left"
                            title={filterInfo.displayName}
                        >
                            {filterInfo.displayName}
                        </button>
                        <div className="flex items-center">
                            {isInclude ? (
                                <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white border-green-400 dark:border-green-500 px-1 py-0">
                                    <Shield className="h-2 w-2 mr-1" />
                                    Inc
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-red-400 dark:border-red-500 px-1 py-0">
                                    <ShieldCheck className="h-2 w-2 mr-1" />
                                    Exc
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'scopeTagIds' as string,
            label: 'Role Scope Tags',
            width: 180,
            minWidth: 140,
            render: (value: unknown, row: Record<string, unknown>) => {
                if (isGroupRow(row)) return null;
                const scopeTagIds = value as string[] | undefined;
                const tagNames = getRoleScopeTagNames(scopeTagIds);

                if (tagNames.length === 0) {
                    return <span className="text-xs text-gray-500">None</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {tagNames.map((tagName, index) => {
                            const isBuiltIn = roleScopeTags.find(t => t.displayName === tagName)?.isBuildIn;
                            return (
                                <Badge
                                    key={index}
                                    variant={isBuiltIn ? "secondary" : "outline"}
                                    className="text-xs"
                                >
                                    {tagName}
                                </Badge>
                            );
                        })}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <SearchQueryParam onQuery={applyQueryParam} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600 dark:text-white">Assignments
                        Overview</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        See every Intune assignment across your organization
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {assignmentsLoading ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Fetching assignments…</span>
                    ) : fetchedAt !== null && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Assignments fetched {formatRelativeTime(fetchedAt)}
                        </span>
                    )}
                    {assignments.length > 0 ? (
                        <>
                            <span title="Fetch the assignments again from Intune (only the assignment families)">
                                <Button onClick={fetchAssignments} variant="outline" size="sm" disabled={loading || refreshing}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading || refreshing ? 'animate-spin' : ''}`}/>
                                    Refresh
                                </Button>
                            </span>
                            <ExportButton
                                exportOptions={[
                                    {
                                        label: "Standard Export",
                                        data: prepareExportData(),
                                        formats: ['csv', 'pdf', 'html']
                                    }
                                ]}
                                variant="outline"
                                size="sm"
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={fetchAssignments}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>
                                Load Assignments
                            </Button>
                            {loading && (
                                <Button
                                    onClick={() => {
                                        cancel();
                                        setFilteredAssignments([]);
                                        setLookupsError(null);
                                        setLookupsLoading(false);
                                        setIsCancelled(true);
                                    }}
                                    variant="destructive"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <XCircle className="h-4 w-4"/>
                                    Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>

            </div>

            {/* Stream / lookup failure before any rows exist - the in-table error card below only renders with rows */}
            {error && assignments.length === 0 && !loading && (
                <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                                <span className="font-medium">Error:</span>
                                <span>{error}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchAssignments}>Try again</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show welcome card when no assignments are loaded and not loading */}
            {assignments.length === 0 && !loading && !error && (
                <Card className="relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Database className="h-16 w-16 mx-auto"/>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                                Ready to view your Intune assignments
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                                Click &quot;Load Assignments&quot; to fetch every configuration assignment in this tenant.
                            </p>
                            <Button onClick={fetchAssignments} className="flex items-center gap-2 mx-auto" size="lg">
                                <Database className="h-5 w-5"/>
                                Load Assignments
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => {
                        setIsCancelled(false);
                        fetchAssignments();
                    }}
                    title="Loading Cancelled"
                    description="Assignment data loading was cancelled. Click below to load assignments again."
                    buttonText="Load Assignments"
                />
            )}

            {/* Show loading state with skeleton */}
            {loading && (
                <AssignmentsTableSkeleton
                    showStats={true}
                    statsCount={4}
                    showFilters={true}
                    tableRows={10}
                    tableColumns={8}
                />
            )}

            {/* Only show search, filters, and table when assignments are loaded and not loading */}
            {assignments.length > 0 && !loading && (
                <>
                    {/* Filters Section */}
                    <Card className="relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between">
                                <button
                                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                    className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                                >
                                    <Filter className="h-5 w-5"/>
                                    Filters
                                    {isFiltersExpanded ? (
                                        <ChevronUp className="h-4 w-4"/>
                                    ) : (
                                        <ChevronDown className="h-4 w-4"/>
                                    )}
                                </button>
                                <div className="flex items-center gap-2">
                                    {/* Show active filter count when collapsed */}
                                    {!isFiltersExpanded && (
                                        <Badge variant="secondary" className="text-xs">
                                            {resourceTypeFilter.length + assignmentTypeFilter.length + statusFilter.length + platformFilter.length + filterTypeFilter.length + roleScopeTagFilter.length + filterNameFilter.length} active
                                        </Badge>
                                    )}
                                    {(resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0 || roleScopeTagFilter.length > 0 || filterNameFilter.length > 0) && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <X className="h-4 w-4 mr-1"/>
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </CardTitle>
                            {/* Show active filters summary when collapsed */}
                            {!isFiltersExpanded && (resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0 || roleScopeTagFilter.length > 0 || filterNameFilter.length > 0) && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                    {resourceTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Type: {filter}
                                        </Badge>
                                    ))}
                                    {assignmentTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Assignment: {filter}
                                        </Badge>
                                    ))}
                                    {statusFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Status: {filter}
                                        </Badge>
                                    ))}
                                    {platformFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Platform: {filter}
                                        </Badge>
                                    ))}
                                    {filterTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Filter: {filter}
                                        </Badge>
                                    ))}
                                    {roleScopeTagFilter.map(id => (
                                        <Badge key={id} variant="outline" className="text-xs">
                                            Role Scope Tag: {roleScopeTags.find(t => t.id === id)?.displayName || id}
                                        </Badge>
                                    ))}
                                    {filterNameFilter.map(id => (
                                        <Badge key={id} variant="outline" className="text-xs">
                                            Filter: {filters.find(f => f.id === id)?.displayName || id}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardHeader>

                        {/* Collapsible Content */}
                        {isFiltersExpanded && (
                            <CardContent className="space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, type, target, platform…"
                                        className="w-full pl-9 pr-9 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4"/>
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Resource Type Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Resource Type</label>
                                        <MultiSelect
                                            options={getUniqueResourceTypes()}
                                            selected={resourceTypeFilter}
                                            onChange={setResourceTypeFilter}
                                            placeholder="Select resource types..."
                                        />
                                    </div>
                                    {/* Assignment Type Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Assignment
                                            Type</label>
                                        <MultiSelect
                                            options={getUniqueAssignmentTypes()}
                                            selected={assignmentTypeFilter}
                                            onChange={setAssignmentTypeFilter}
                                            placeholder="Select assignment types..."
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Status</label>
                                        <MultiSelect
                                            options={getUniqueStatuses()}
                                            selected={statusFilter}
                                            onChange={setStatusFilter}
                                            placeholder="Select status..."
                                        />
                                    </div>

                                    {/* Platform Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Platform</label>
                                        <MultiSelect
                                            options={getUniquePlatforms()}
                                            selected={platformFilter}
                                            onChange={setPlatformFilter}
                                            placeholder="Select platforms..."
                                        />
                                    </div>

                                    {/* Filters Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Filter Type</label>
                                        <MultiSelect
                                            options={getUniqueFilterTypes()}
                                            selected={filterTypeFilter}
                                            onChange={setFilterTypeFilter}
                                            placeholder="Select filter types..."
                                        />
                                    </div>

                                    {/* Role Scope Tags Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Role Scope Tags</label>
                                        <MultiSelect
                                            options={getUniqueRoleScopeTags()}
                                            selected={roleScopeTagFilter}
                                            onChange={setRoleScopeTagFilter}
                                            placeholder="Select scope tags..."
                                        />
                                    </div>

                                    {/* Filter Name Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Filter</label>
                                        <MultiSelect
                                            options={getUniqueFilterNames()}
                                            selected={filterNameFilter}
                                            onChange={setFilterNameFilter}
                                            placeholder="Select filters..."
                                        />
                                    </div>
                                </div>

                                {/* Active Filters Display */}
                                {(assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0) && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                                        <span className="text-sm text-gray-600">Active filters:</span>
                                        {assignmentTypeFilter.map(filter => (
                                            <Badge key={filter} variant="outline" className="text-xs">
                                                Assignment: {filter}
                                                <button
                                                    onClick={() => setAssignmentTypeFilter(prev => prev.filter(f => f !== filter))}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3"/>
                                                </button>
                                            </Badge>
                                        ))}
                                        {statusFilter.map(filter => (
                                            <Badge key={filter} variant="outline" className="text-xs">
                                                Status: {filter}
                                                <button
                                                    onClick={() => setStatusFilter(prev => prev.filter(f => f !== filter))}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3"/>
                                                </button>
                                            </Badge>
                                        ))}
                                        {platformFilter.map(filter => (
                                            <Badge key={filter} variant="outline" className="text-xs">
                                                Platform: {filter}
                                                <button
                                                    onClick={() => setPlatformFilter(prev => prev.filter(f => f !== filter))}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3"/>
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-red-800">
                                    <span className="font-medium">Error:</span>
                                    <span>{error}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* View mode: flat rows, or one row per resource that unfolds into its assignments */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {viewMode === 'byPolicy'
                                ? `${policyRows.length} resources · ${displayedAssignments.length} assignments`
                                : `${displayedAssignments.length} assignments`}
                        </span>
                        <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden" role="group" aria-label="View mode">
                            <Button
                                variant={viewMode === 'flat' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="rounded-none"
                                onClick={() => changeViewMode('flat')}
                                aria-pressed={viewMode === 'flat'}
                            >
                                <List className="h-4 w-4 mr-2"/>
                                Flat
                            </Button>
                            <Button
                                variant={viewMode === 'byPolicy' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="rounded-none border-l border-gray-300 dark:border-gray-600"
                                onClick={() => changeViewMode('byPolicy')}
                                aria-pressed={viewMode === 'byPolicy'}
                            >
                                <Layers className="h-4 w-4 mr-2"/>
                                By policy
                            </Button>
                        </div>
                    </div>

                    {/* Assignment Details Table */}
                    <div className="relative">
                        {loading ? (
                            <div className="flex items-center justify-center h-32 bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 rounded-lg">
                                <RefreshCw className="h-6 w-6 animate-spin text-yellow-500"/>
                                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading assignments...</span>
                            </div>
                        ) : (
                            <DataTable
                                data={viewMode === 'byPolicy' ? policyRows : displayedAssignments}
                                columns={columns}
                                className="min-w-full"
                                showPagination={true}
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                                onSearchChange={setTableSearchTerm}
                                onRowClick={viewMode === 'byPolicy'
                                    ? (row) => { if (isGroupRow(row)) togglePolicy(row.__key); }
                                    : undefined}
                                childRows={viewMode === 'byPolicy'
                                    ? (row) => (isGroupRow(row) && expandedPolicies.has(row.__key)
                                        ? row.assignments.map((a): PolicyChildRow => ({ ...a, __child: true }))
                                        : null)
                                    : undefined}
                                rowClassName={viewMode === 'byPolicy'
                                    ? (row) => (isChildRow(row) ? 'bg-blue-50/40 dark:bg-blue-900/10' : '')
                                    : undefined}
                            />
                        )}
                    </div>

                    {/* Filtered empty state */}
                    {filteredAssignments.length === 0 && !loading && !error && assignments.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        {searchQuery ? <Search className="h-12 w-12 mx-auto"/> :
                                            <Filter className="h-12 w-12 mx-auto"/>}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchQuery ? 'No assignments match your search' : 'No assignments match your filters'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchQuery
                                            ? 'Try adjusting your search terms or clearing filters.'
                                            : 'Try adjusting your filter criteria or clear all filters to see more results.'}
                                    </p>
                                    <Button onClick={clearFilters} variant="outline">
                                        {searchQuery ? 'Clear Search & Filters' : 'Clear All Filters'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <GroupDetailsDialog
                groupId={selectedGroupId}
                isOpen={isGroupDialogOpen}
                onClose={() => {
                    setIsGroupDialogOpen(false);
                    setSelectedGroupId(null);
                }}
            />

            <FilterDetailsDialog
                filter={selectedFilter}
                isOpen={isFilterDialogOpen}
                onClose={() => {
                    setIsFilterDialogOpen(false);
                    setSelectedFilter(null);
                }}
            />
        </div>
    );
}
