'use client';
import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Download, Filter, Database, Search, X, Users, ExternalLink, Settings, Shield, ShieldCheck } from 'lucide-react';
import {ASSIGNMENTS_ENDPOINT, GROUPS_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';

// Simple interface instead of complex schema
interface Assignments extends Record<string, unknown> {
    resourceType: string;
    assignmentType: string;
    platform: string | null;
    isAssigned: boolean;
    targetId: string | null;
    targetName: string;
    resourceId: string;
    resourceName: string | null;
    filterId: string | null;
    filterType: string;
    assignmentDirection: string;
    isExcluded: boolean;
    group?: {
        id: string;
        displayName: string;
        description: string;
    };
}

interface UserMember extends Record<string, unknown> {
    id: string;
    displayName: string;
    accountEnabled: boolean;
    type: string;
}

interface GroupDetails {
    id: string;
    displayName: string;
    description: string | null;
    membershipRule: string | null;
    createdDateTime: string;
    groupCount: {
        userCount: number;
        deviceCount: number;
        groupCount: number;
    } | null;
    members: UserMember[] | null;
}

interface AssignmentFilter {
    id: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    displayName: string;
    description: string;
    platform: number;
    rule: string;
    assignmentFilterManagementType: number;
    payloads: unknown[];
    roleScopeTags: string[];
    additionalData: Record<string, unknown>;
    backingStore: Record<string, unknown>;
    odataType: string | null;
}

export default function AssignmentsOverview() {
    const { instance, accounts } = useMsal();
    const [assignments, setAssignments] = useState<Assignments[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<Assignments[]>([]);
    const [filters, setFilters] = useState<AssignmentFilter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [groupLoading, setGroupLoading] = useState(false);
    const [groupError, setGroupError] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);

    const [groupSearchInput, setGroupSearchInput] = useState<string>('');
    const [searchedGroup, setSearchedGroup] = useState<GroupDetails | null>(null);
    const [groupSearchLoading, setGroupSearchLoading] = useState(false);
    const [groupSearchError, setGroupSearchError] = useState<string | null>(null);

    const isValidGuid = (str: string): boolean => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(str);
    };

    // Group details dialog states
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    // Filter dialog states
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<AssignmentFilter | null>(null);
    const [filterLoading, setFilterLoading] = useState(false);
    const [filterError, setFilterError] = useState<string | null>(null);

    // Filter states
    const [assignmentTypeFilter, setAssignmentTypeFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterIdFilter, setFilterIdFilter] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    // Add pagination calculations
    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [assignmentTypeFilter, statusFilter, platformFilter, searchQuery]);

    const searchGroup = async () => {
        if (!accounts.length || !groupSearchInput.trim()) return;

        setGroupSearchLoading(true);
        setGroupSearchError(null);
        setSearchedGroup(null);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const queryParam = isValidGuid(groupSearchInput.trim())
                ? `groupId=${groupSearchInput.trim()}`
                : `groupName=${encodeURIComponent(groupSearchInput.trim())}`;

            const apiResponse = await fetch(`${GROUPS_ENDPOINT}?${queryParam}`, {
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!apiResponse.ok) {
                throw new Error(`API call failed: ${apiResponse.statusText}`);
            }

            const responseData = await apiResponse.json();

            if (responseData.status === 0 && responseData.data) {
                setSearchedGroup(responseData.data);
            } else {
                throw new Error(responseData.message || 'Failed to find group');
            }
        } catch (error) {
            console.error('Failed to search group:', error);
            setGroupSearchError(error instanceof Error ? error.message : 'Failed to search group');
        } finally {
            setGroupSearchLoading(false);
        }
    };

    const fetchGroupAssignments = async (groupId: string) => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Fetch both group assignments and filters in parallel
            const [assignmentsResponse, filtersResponse] = await Promise.all([
                fetch(`${ASSIGNMENTS_ENDPOINT}/groups/${groupId}`, {
                    headers: {
                        'Authorization': `Bearer ${response.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(ASSIGNMENTS_FILTERS_ENDPOINT, {
                    headers: {
                        'Authorization': `Bearer ${response.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (!assignmentsResponse.ok) {
                throw new Error(`Failed to fetch assignments: ${assignmentsResponse.statusText}`);
            }

            if (!filtersResponse.ok) {
                console.warn('Failed to fetch filters:', filtersResponse.statusText);
            }

            // Process assignments
            const assignmentsData = await assignmentsResponse.json();
            const assignments = assignmentsData.data || assignmentsData;

            if (Array.isArray(assignments)) {
                setAssignments(assignments);
                setFilteredAssignments(assignments);
            } else {
                console.error('API response data is not an array:', assignments);
                setAssignments([]);
                setFilteredAssignments([]);
                throw new Error('Invalid data format received from API');
            }

            // Process filters (even if it fails, continue with assignments)
            try {
                const filtersData = await filtersResponse.json();
                if (Array.isArray(filtersData)) {
                    setFilters(filtersData);
                } else if (filtersData.data && Array.isArray(filtersData.data)) {
                    setFilters(filtersData.data);
                } else {
                    console.error('Filters API response is not an array:', filtersData);
                    setFilters([]);
                }
            } catch (filterError) {
                console.error('Failed to process filters:', filterError);
                setFilters([]);
            }

        } catch (error) {
            console.error('Failed to fetch group assignments:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch group assignments');
        } finally {
            setLoading(false);
        }
    };


    const prepareExportData = (): ExportData => {
        const exportColumns: ExportColumn[] = [
            {
                key: 'resourceType',
                label: 'Type',
                width: 20,
                getValue: (row) => String(row.resourceType || '')
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
                getValue: (row) => row.isAssigned ? 'Assigned' : 'Not Assigned'
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
            }
        ];

        const stats = [
            { label: 'Total Assignments', value: filteredAssignments.length },
            { label: 'Assigned', value: filteredAssignments.filter(a => a.isAssigned).length },
            { label: 'Not Assigned', value: filteredAssignments.filter(a => !a.isAssigned).length },
            { label: 'Resource Types', value: new Set(filteredAssignments.map(a => a.resourceType)).size },
            { label: 'Platforms', value: new Set(filteredAssignments.map(a => a.platform)).size }
        ];

        return {
            data: filteredAssignments,
            columns: exportColumns,
            filename: 'assignments-overview',
            title: 'Assignments Overview',
            description: 'Detailed view of all Intune assignments across your organization',
            stats
        };
    };
    const fetchAssignments = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch both assignments and filters
            await Promise.all([fetchAssignmentsData(), fetchFilters()]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignmentsData = async () => {
        if (!accounts.length) return;

        // Get access token
        const response = await instance.acquireTokenSilent({
            scopes: [apiScope],
            account: accounts[0]
        });

        // Call your API
        const apiResponse = await fetch(ASSIGNMENTS_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${response.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!apiResponse.ok) {
            throw new Error(`API call failed: ${apiResponse.statusText}`);
        }

        const responseData = await apiResponse.json();
        const assignmentsData = responseData.data;

        if (Array.isArray(assignmentsData)) {
            setAssignments(assignmentsData);
            setFilteredAssignments(assignmentsData);
        } else {
            console.error('API response data is not an array:', assignmentsData);
            setAssignments([]);
            setFilteredAssignments([]);
            throw new Error('Invalid data format received from API');
        }
    };

    // Group dialog handlers
    const handleResourceClick = (resourceId: string, assignmentType: string) => {
        if ((assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude' || assignmentType === 'GroupAssignment') && resourceId) {
            setSelectedGroupId(resourceId);
            setIsGroupDialogOpen(true);
        }
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
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${ASSIGNMENTS_FILTERS_ENDPOINT}`, {
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to fetch filters: ${apiResponse.statusText}`);
            }

            const filtersData = await apiResponse.json();

            // Handle direct array response (not wrapped in .data)
            if (Array.isArray(filtersData)) {
                setFilters(filtersData);
            } else if (filtersData.data && Array.isArray(filtersData.data)) {
                setFilters(filtersData.data);
            } else {
                console.error('Filters API response is not an array:', filtersData);
                setFilters([]);
            }
        } catch (error) {
            console.error('Failed to fetch filters:', error);
            setFilters([]);
        }
    };

    const getFilterInfo = (filterId: string | null, filterType: string) => {
        if (!filterId || filterId === 'None' || filterType === 'None') {
            return { displayName: 'None', managementType: null, platform: null };
        }

        const filter = filters.find(f => f.id === filterId);
        return {
            displayName: filter?.displayName || 'Unknown Filter',
            managementType: filter?.assignmentFilterManagementType === 0 ? 'include' : 'exclude',
            platform: filter?.platform
        };
    };

    // Filter and search function
    useEffect(() => {
        let filtered = assignments;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(assignment =>
                assignment.resourceName?.toLowerCase().includes(query) ||
                assignment.resourceType.toLowerCase().includes(query) ||
                assignment.targetName.toLowerCase().includes(query) ||
                assignment.assignmentType.toLowerCase().includes(query) ||
                assignment.platform?.toLowerCase().includes(query) ||
                assignment.filterType.toLowerCase().includes(query)
            );
        }

        // Apply dropdown filters
        if (assignmentTypeFilter.length > 0) {
            filtered = filtered.filter(assignment => {
                if (assignmentTypeFilter.includes('Not Assigned')) {
                    return !assignment.isAssigned || assignmentTypeFilter.includes(assignment.assignmentType);
                }
                return assignment.isAssigned && assignmentTypeFilter.includes(assignment.assignmentType);
            });
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter(assignment => {
                if (statusFilter.includes('Assigned') && statusFilter.includes('Not Assigned')) {
                    return true;
                }
                if (statusFilter.includes('Assigned')) return assignment.isAssigned;
                if (statusFilter.includes('Not Assigned')) return !assignment.isAssigned;
                return false;
            });
        }

        if (platformFilter.length > 0) {
            filtered = filtered.filter(assignment => {
                const platform = assignment.platform || 'All';
                return platformFilter.includes(platform);
            });
        }

        setFilteredAssignments(filtered);
    }, [assignments, assignmentTypeFilter, statusFilter, platformFilter, searchQuery]);

    // Get unique values for filters
    const getUniqueAssignmentTypes = (): Option[] => {
        const types = new Set<string>();
        assignments.forEach(assignment => {
            if (assignment.isAssigned) {
                types.add(assignment.assignmentType);
            } else {
                types.add('Not Assigned');
            }
        });
        return Array.from(types).sort().map(type => ({ label: type, value: type }));
    };

    const getUniqueStatuses = (): Option[] => [
        { label: 'Assigned', value: 'Assigned' },
        { label: 'Not Assigned', value: 'Not Assigned' }
    ];

    const getUniquePlatforms = (): Option[] => {
        const platforms = new Set<string>();
        assignments.forEach(assignment => {
            platforms.add(assignment.platform || 'All');
        });
        return Array.from(platforms).sort().map(platform => ({ label: platform, value: platform }));
    };

    const clearFilters = () => {
        setAssignmentTypeFilter([]);
        setStatusFilter([]);
        setPlatformFilter([]);
        setSearchQuery('');
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const clearAssignments = () => {
        setAssignments([]);
        setFilteredAssignments([]);
        setSearchedGroup(null);
        setGroupSearchInput('');
        setGroupSearchError(null);
        setError(null);
        // Also clear any applied filters
        clearFilters();
    };

    const groupMemberColumns = [
        {
            key: 'displayName' as string,
            label: 'Display Name',
            render: (value: unknown) => (
                <span className="font-medium">{String(value)}</span>
            )
        },
        {
            key: 'type' as string,
            label: 'Type',
            render: (value: unknown) => (
                <Badge variant="outline" className="text-xs">
                    {String(value)}
                </Badge>
            )
        },
        {
            key: 'accountEnabled' as string,
            label: 'Account Status',
            render: (value: unknown) => {
                const isEnabled = Boolean(value);
                return (
                    <Badge variant={isEnabled ? 'default' : 'secondary'}
                           className={isEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                );
            }
        },
        {
            key: 'id' as string,
            label: 'ID',
            render: (value: unknown) => (
                <span className="font-mono text-xs text-gray-500">{String(value)}</span>
            )
        }
    ];

    const columns = [
        {
            key: 'resourceType' as string,
            label: 'Type',
            width: 120,
            minWidth: 80,
            render: (value: unknown) => (
                <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
                    {String(value)}
                </Badge>
            )
        },
        {
            key: 'resourceName' as string,
            label: 'Resource',
            width: 200,
            minWidth: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const resourceName = value ? String(value) : 'N/A';
                const resourceType = String(row.resourceType);
                const resourceId = String(row.resourceId);

                if (resourceType === 'Group' && resourceId && resourceName !== 'N/A') {
                    return (
                        <button
                            onClick={() => handleResourceClick(resourceId, String(row.assignmentType))}
                            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer truncate block w-full text-left"
                            title={resourceName}
                        >
                            {resourceName}
                        </button>
                    );
                }

                return (
                    <span className="font-medium text-sm truncate block w-full" title={resourceName}>
                    {resourceName}
                </span>
                );
            }
        },
        {
            key: 'assignmentType' as string,
            label: 'Assignment',
            width: 140,
            minWidth: 100,
            render: (value: unknown, row: Record<string, unknown>) => {
                const isAssigned = Boolean(row.isAssigned);
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
                    <Badge
                        variant={isExclude ? "destructive" : "default"}
                        className="text-xs whitespace-nowrap"
                    >
                        {assignmentType}
                    </Badge>
                );
            }
        },
        {
            key: 'targetName' as string,
            label: 'Target',
            width: 180,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const targetName = String(value);
                const assignmentType = String(row.assignmentType);
                const isAssigned = Boolean(row.isAssigned);
                const targetId = row.targetId as string;
                const group = row.group as { groupCount?: { userCount: number; deviceCount: number; groupCount: number } } | undefined;

                if (isAssigned && (assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude') && targetId) {
                    return (
                        <div className="space-y-1">
                            <button
                                onClick={() => handleResourceClick(targetId, assignmentType)}
                                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium cursor-pointer truncate block w-full text-left"
                                title={targetName}
                            >
                                {targetName}
                            </button>
                            {group?.groupCount && (
                                <div className="flex gap-1 text-xs text-gray-500">
                                    <span>{group.groupCount.userCount} {group.groupCount.userCount === 1 ? 'user' : 'users'}</span>
                                    <span>{group.groupCount.deviceCount} {group.groupCount.deviceCount === 1 ? 'device' : 'devices'}</span>
                                    <span>{group.groupCount.groupCount} {group.groupCount.groupCount === 1 ? 'group' : 'groups'}</span>
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
            render: (value: unknown) => (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                {value ? String(value) : 'All'}
            </span>
            )
        },
        {
            key: 'isAssigned' as string,
            label: 'Status',
            width: 120,
            minWidth: 90,
            render: (value: unknown) => {
                const isAssigned = Boolean(value);
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
                const filterId = value as string | null;
                const filterType = String(row.filterType);
                const filterInfo = getFilterInfo(filterId, filterType);

                if (!filterId || filterId === 'None' || filterType === 'None') {
                    return <span className="text-xs text-gray-500">None</span>;
                }

                const isInclude = filterInfo.managementType === 'include';

                return (
                    <div className="space-y-1">
                        <button
                            onClick={() => handleFilterClick(filterId)}
                            className="text-blue-600 hover:text-blue-800 underline text-xs font-medium cursor-pointer truncate block w-full text-left"
                            title={filterInfo.displayName}
                        >
                            {filterInfo.displayName}
                        </button>
                        <div className="flex items-center">
                            {isInclude ? (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 px-1 py-0">
                                    <Shield className="h-2 w-2 mr-1" />
                                    Inc
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 border-red-200 px-1 py-0">
                                    <ShieldCheck className="h-2 w-2 mr-1" />
                                    Exc
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            }
        }
    ];



    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600">Group assignments Overview</h1>
                    <p className="text-gray-600 mt-2">
                        View all Intune assignments across your organization for a specific group. Search for a group or load all assignments to get started.
                    </p>
                </div>
                <div className="flex gap-2">
                    {assignments.length > 0 ? (
                        <>
                            <Button onClick={fetchAssignments} variant="outline" size="sm" disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button onClick={clearAssignments} variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                            <ExportButton
                                exportData={prepareExportData()}
                                variant="outline"
                                size="sm"
                            />
                        </>
                    ) : (
                        <Button
                            onClick={fetchAssignments}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Load Assignments
                        </Button>
                    )}
                </div>
            </div>

            {/* Show welcome card when no assignments are loaded and not loading */}
            {assignments.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardHeader className="text-center pb-4">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <CardTitle className="text-xl">Group Assignments</CardTitle>
                        <CardDescription className="text-gray-600 max-w-md mx-auto">
                            Search for a specific group to view its assignments, or load all assignments to get a comprehensive overview.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Group Search Section */}
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">Search for a Group</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter a group name or GUID to find and view its assignments
                                </p>
                            </div>

                            <div className="flex gap-2 max-w-md mx-auto">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={groupSearchInput}
                                        onChange={(e) => setGroupSearchInput(e.target.value)}
                                        placeholder="Enter group name or GUID"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                searchGroup();
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={searchGroup}
                                    disabled={!groupSearchInput.trim() || groupSearchLoading}
                                    className="px-6"
                                >
                                    {groupSearchLoading ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Search'
                                    )}
                                </Button>
                            </div>

                            {/* Group Search Results */}
                            {groupSearchError && (
                                <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{groupSearchError}</p>
                                </div>
                            )}

                            {searchedGroup && (
                                <div className="max-w-2xl mx-auto">
                                    <Card className="border-blue-200 bg-blue-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-blue-600" />
                                                {searchedGroup.displayName}
                                            </CardTitle>
                                            <CardDescription>
                                                {searchedGroup.description || 'No description available'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Group ID:</span>
                                                    <p className="font-mono text-xs mt-1 break-all">{searchedGroup.id}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Created:</span>
                                                    <p className="mt-1">{new Date(searchedGroup.createdDateTime).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {searchedGroup.groupCount && (
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-2xl font-bold text-blue-600">{searchedGroup.groupCount.userCount}</div>
                                                        <div className="text-xs text-gray-600">Users</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-2xl font-bold text-green-600">{searchedGroup.groupCount.deviceCount}</div>
                                                        <div className="text-xs text-gray-600">Devices</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-2xl font-bold text-purple-600">{searchedGroup.groupCount.groupCount}</div>
                                                        <div className="text-xs text-gray-600">Groups</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 justify-center pt-4">
                                                <Button
                                                    onClick={() => fetchGroupAssignments(searchedGroup.id)}
                                                    className="inline-flex items-center gap-2"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Database className="h-4 w-4" />
                                                    )}
                                                    Load Group Assignments
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSearchedGroup(null);
                                                        setGroupSearchInput('');
                                                        setGroupSearchError(null);
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Load All Assignments */}
                        <div className="text-center">
                            <Button onClick={fetchAssignments} className="inline-flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Load All Assignments
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                                Load all group assignments in your organization
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show loading state */}
            {loading && assignments.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Loading Assignments
                            </h3>
                            <p className="text-gray-600">
                                Fetching assignment data from your Intune environment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Only show search, filters, and table when assignments are loaded or loading */}
            {(assignments.length > 0 || loading) && (
                <>
                    {/* Search Section */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search by resource name, type, target, assignment type, platform, or filter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            {searchQuery && (
                                <div className="mt-2">
                                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                        <Search className="h-3 w-3" />
                                        Searching: &quot;{searchQuery}&quot;
                                        <button onClick={clearSearch} className="ml-1 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Filters Section */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </span>
                                {(assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0) && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Assignment Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assignment Type</label>
                                    <MultiSelect
                                        options={getUniqueAssignmentTypes()}
                                        selected={assignmentTypeFilter}
                                        onChange={setAssignmentTypeFilter}
                                        placeholder="Select assignment types..."
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <MultiSelect
                                        options={getUniqueStatuses()}
                                        selected={statusFilter}
                                        onChange={setStatusFilter}
                                        placeholder="Select status..."
                                    />
                                </div>

                                {/* Platform Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Platform</label>
                                    <MultiSelect
                                        options={getUniquePlatforms()}
                                        selected={platformFilter}
                                        onChange={setPlatformFilter}
                                        placeholder="Select platforms..."
                                    />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {assignmentTypeFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {filter}
                                            <button onClick={() => setAssignmentTypeFilter(prev => prev.filter(f => f !== filter))}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {statusFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {filter}
                                            <button onClick={() => setStatusFilter(prev => prev.filter(f => f !== filter))}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {platformFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {filter}
                                            <button onClick={() => setPlatformFilter(prev => prev.filter(f => f !== filter))}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
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

                    {/* Assignment Details Table */}
                    <Card className="shadow-sm w-full overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span>Assignment Details</span>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredAssignments.length)} of {filteredAssignments.length}</span>
                                </div>
                            </CardTitle>
                            <CardDescription>
                                Detailed view of all assignments with their targets and configurations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                    <span className="ml-2 text-gray-600">Loading assignments...</span>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="overflow-x-auto">
                                        <DataTable
                                            data={paginatedAssignments}
                                            columns={columns}
                                            className="min-w-full"
                                        />
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="border-t p-4">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                                itemsPerPage={itemsPerPage}
                                                onItemsPerPageChange={setItemsPerPage}
                                                totalItems={filteredAssignments.length}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>


                    {/* Filtered empty state */}
                    {filteredAssignments.length === 0 && !loading && !error && assignments.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        {searchQuery ? <Search className="h-12 w-12 mx-auto" /> : <Filter className="h-12 w-12 mx-auto" />}
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

            {/* Filter Details Dialog */}
            {/* Filter Details Dialog */}
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {selectedFilter?.displayName || 'Filter Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedFilter?.description || 'Assignment filter information and rules'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFilter ? (
                        <div className="space-y-6">
                            {/* Filter Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter ID</label>
                                    <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">{selectedFilter.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Management Type</label>
                                    <div className="flex items-center gap-2">
                                        {selectedFilter.assignmentFilterManagementType === 0 ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Include
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                Exclude
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {selectedFilter.platform === 0 ? 'All' :
                                            selectedFilter.platform === 1 ? 'Android' :
                                                selectedFilter.platform === 2 ? 'iOS' :
                                                    selectedFilter.platform === 3 ? 'macOS' :
                                                        selectedFilter.platform === 4 ? 'Windows' :
                                                            `Platform ${selectedFilter.platform}`}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedFilter.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Description</label>
                                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                         <code className="whitespace-pre-wrap break-all">
                                             {selectedFilter.description}

                                         </code>
                                    </pre>
                                </div>
                            )}

                            {/* Filter Rule */}
                            {selectedFilter.rule && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Filter Rule</label>
                                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                        <code className="whitespace-pre-wrap break-all">{selectedFilter.rule}</code>
                                    </pre>
                                </div>
                            )}

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                        <p className="text-sm">{new Date(selectedFilter.createdDateTime).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Last Modified</label>
                                        <p className="text-sm">{new Date(selectedFilter.lastModifiedDateTime).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Role Scope Tags */}
                                <div>
                                    <label className="text-sm font-medium text-gray-600 block mb-2">Role Scope Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFilter.roleScopeTags && selectedFilter.roleScopeTags.length > 0 ? (
                                            selectedFilter.roleScopeTags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No role scope tags</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Filter not found</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
