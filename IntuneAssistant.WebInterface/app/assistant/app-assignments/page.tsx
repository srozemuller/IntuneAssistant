'use client';
import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    RefreshCw,
    Download,
    Filter,
    Database,
    Search,
    X,
    Users,
    ExternalLink,
    Settings,
    Shield,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    XCircle, Computer, Blocks
} from 'lucide-react';
import {ASSIGNMENTS_ENDPOINT, GROUPS_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';
import {useApiRequest} from "@/hooks/useApiRequest";

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: Assignments[] | { url: string; message: string }; // Updated to handle both cases
}


// Simple interface instead of complex schema
interface Assignments extends Record<string, unknown> {
    resourceType: string;
    assignmentType: string;
    platform: string | null;
    isAssigned: boolean;
    enrollmentType: string;
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
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [consentUrl, setConsentUrl] = useState('');
    const { request } = useApiRequest();

    const [assignments, setAssignments] = useState<Assignments[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<Assignments[]>([]);
    const [filters, setFilters] = useState<AssignmentFilter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter dialog states
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<AssignmentFilter | null>(null);
    const [filterLoading, setFilterLoading] = useState(false);
    const [filterError, setFilterError] = useState<string | null>(null);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);


    // Filter states
    const [assignmentTypeFilter, setAssignmentTypeFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterIdFilter, setFilterIdFilter] = useState<string[]>([]);
    const [resourceTypeFilter, setResourceTypeFilter] = useState<string[]>([]);
    const [filterTypeFilter, setFilterTypeFilter] = useState<string[]>([]);
    const [installTypeFilter, setInstallTypeFilter] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);


    useEffect(() => {
        setCurrentPage(1);
    }, [assignmentTypeFilter, statusFilter, platformFilter, installTypeFilter, resourceTypeFilter, filterTypeFilter]);

    const getUniqueResourceTypes = (): Option[] => {
        const types = new Set<string>();
        assignments.forEach(assignment => {
            types.add(assignment.resourceType);
        });
        return Array.from(types).sort().map(type => ({ label: type, value: type }));
    };

    const getUniqueInstallTypes = (): Option[] => {
        const types = new Set<string>();
        assignments.forEach(assignment => {
            types.add(assignment.enrollmentType);
        });
        return Array.from(types).sort().map(type => ({ label: type, value: type }));
    };

    const getUniqueFilterTypes = (): Option[] => [
        { label: 'No Filter', value: 'none' },
        { label: 'Include Filter', value: 'include' },
        { label: 'Exclude Filter', value: 'exclude' }
    ];

    const prepareRolloutExportData = (): ExportData => {
        const exportColumns: ExportColumn[] = [
            {
                key: 'resourceName',
                label: 'PolicyName',
                width: 30,
                getValue: (row) => String(row.resourceName || 'N/A')
            },
            {
                key: 'targetName',
                label: 'GroupName',
                width: 30,
                getValue: (row) => String(row.targetName || 'N/A')
            },
            {
                key: 'assignmentType',
                label: 'AssignmentDirection',
                width: 25,
                getValue: (row) => String(row.assignmentDirection || '')
            },
            {
                key: '',
                label: 'AssignmentAction',
                width: 25,
                getValue: () => String('Add') // or whatever default action you want
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
            }
        ];

        const rolloutStats = [
            { label: 'Total Rollouts', value: filteredAssignments.length },
            { label: 'Assigned Policies', value: filteredAssignments.filter(a => a.isAssigned).length },
            { label: 'Groups Targeted', value: new Set(filteredAssignments.map(a => a.targetName)).size },
            { label: 'Resource Types', value: new Set(filteredAssignments.map(a => a.resourceType)).size }
        ];

        return {
            data: filteredAssignments, // Use your filtered assignments data
            columns: exportColumns,
            filename: 'rollouts-overview',
            title: 'Rollouts Overview',
            description: 'Detailed view of all Intune rollouts across your organization',
            stats: rolloutStats
        };
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
            },
            {
                key: 'filterType',
                label: 'Filter Type',
                width: 25,
                getValue: (row) => String(row.filterType || '')
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
            filename: 'apps-assignments-overview',
            title: 'Apps Assignments Overview',
            description: 'Detailed view of all Intune application assignments across your organization',
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

        try {
            const responseData = await request<ApiResponse>(`${ASSIGNMENTS_ENDPOINT}/apps`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if response exists and for consent requirements
            if (!responseData) {
                throw new Error('No response received from API');
            }

            // Handle successful response
            if (responseData.status === 'Success' && responseData.data) {
                const assignments = responseData.data;

                if (Array.isArray(assignments)) {
                    setAssignments(assignments);
                    setFilteredAssignments(assignments);
                } else {
                    console.error('API response data is not an array:', assignments);
                    setAssignments([]);
                    setFilteredAssignments([]);
                    throw new Error('Invalid data format received from API');
                }
            } else {
                throw new Error(responseData.message || 'Failed to fetch assignments');
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
            throw error;
        }
    };



    const handleFilterClick = (filterId: string) => {
        if (filterId && filterId !== 'none') {
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
            const responseData = await request<AssignmentFilter[]>(`${ASSIGNMENTS_FILTERS_ENDPOINT}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if response exists
            if (!responseData) {
                console.error('No response received from filters API');
                setFilters([]);
                return;
            }

            // Handle successful response - filters endpoint returns array directly
            if (Array.isArray(responseData)) {
                setFilters(responseData);
            } else {
                // If it's not an array, it might be an error response with consent info
                const errorResponse = responseData as unknown as ApiResponse;

                console.error('Filters API response is not an array:', responseData);
                setFilters([]);
            }
        } catch (error) {
            console.error('Failed to fetch filters:', error);
            setFilters([]);
        }
    };


    const getFilterInfo = (filterId: string | null, filterType: string) => {
        if (!filterId || filterId === 'none' || filterType === 'none') {
            return { displayName: 'None', managementType: null, platform: null };
        }

        const filter = filters.find(f => f.id === filterId);
        return {
            displayName: filter?.displayName || 'Unknown Filter',
            managementType: filter?.assignmentFilterManagementType === 0 ? 'include' : 'exclude',
            platform: filter?.platform
        };
    };

    const handleResourceClick = (resourceId: string, assignmentType: string) => {
        if ((assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude' || assignmentType === 'GroupAssignment') && resourceId) {
            setSelectedGroupId(resourceId);
            setIsGroupDialogOpen(true);
        }
    };


    // Filter and search function
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
                if (assignmentTypeFilter.includes('Not Assigned')) {
                    return !assignment.isAssigned || assignmentTypeFilter.includes(assignment.assignmentType);
                }
                return assignment.isAssigned && assignmentTypeFilter.includes(assignment.assignmentType);
            });
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
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
                if (filterTypeFilter.includes('none')) {
                    if (!filterType || filterType === 'none' || filterType === 'None') {
                        return true;
                    }
                }

                // Check for include filter
                if (filterTypeFilter.includes('include') && filterType === 'include') {
                    return true;
                }

                // Check for exclude filter
                if (filterTypeFilter.includes('exclude') && filterType === 'exclude') {
                    return true;
                }

                return false;
            });
        }
        if (installTypeFilter.length > 0) {
            filtered = filtered.filter((assignment: Assignments) => {
                const enrollmentType = assignment.enrollmentType || 'All';
                return installTypeFilter.includes(enrollmentType);
            });
        }

        setFilteredAssignments(filtered);
    }, [assignments, assignmentTypeFilter, resourceTypeFilter, statusFilter, platformFilter, filterTypeFilter, installTypeFilter]);


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
        setResourceTypeFilter([]);
        setStatusFilter([]);
        setPlatformFilter([]);
        setFilterTypeFilter([]);
        setInstallTypeFilter([]);
    };


    const columns = [
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
                            className="text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer truncate block w-full text-left"
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
                                    className="text-yellow-400 hover:text-yellow-500 underline text-sm font-medium cursor-pointer truncate flex-1 text-left"
                                    title={targetName}
                                >
                                    {targetName}
                                </button>
                                {group?.membershipRule && (
                                    <span title="Dynamic Group">
            <Blocks className="h-3 w-3 text-purple-500 flex-shrink-0"/>
        </span>
                                )}
                            </div>
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
            key: 'enrollmentType' as string,
            label: 'Install Type',
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

                const isInclude = filterType === 'include';
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
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 px-1 py-0">
                                    <Shield className="h-2 w-2 mr-1" />
                                    Inc
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="text-xs bg-red-100 text-white border-red-200 px-1 py-0">
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
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Assignments Overview</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        View all Intune applications assignments across your organization
                    </p>
                </div>
                <div className="flex gap-2">
                    {assignments.length > 0 ? (
                        <>
                            <Button onClick={fetchAssignments} variant="outline" size="sm" disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <ExportButton
                                exportOptions={[
                                    {
                                        label: "Standard Export",
                                        data: prepareExportData(),
                                        formats: ['csv', 'pdf', 'html'] // All formats (optional, defaults to all)
                                    },
                                    {
                                        label: "Export for bulk assignments",
                                        data: prepareRolloutExportData(),
                                        formats: ['csv'] // Only CSV for rollout
                                    }
                                ]}
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
            {/* Error Display */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            Error occurred while fetching assignments. Please try again.
                        </p>
                        <Button onClick={fetchAssignments} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Welcome card */}
            {assignments.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 dark:text-gray-500 mb-6">
                                <Database className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Ready to view your Intune assignments
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                                Click the &quot;Load Assignments&quot; button above to fetch all assignment configurations from your Intune environment.
                            </p>
                            <Button onClick={fetchAssignments} className="flex items-center gap-2 mx-auto" size="lg">
                                <Database className="h-5 w-5" />
                                Load Assignments
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading state */}
            {loading && assignments.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-400 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Loading Assignments
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching assignment data from your Intune environment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters and content sections */}
            {(assignments.length > 0 || loading) && (
                <>
                    {/* Filters Section */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between">
                                <button
                                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                    className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                                >
                                    <Filter className="h-5 w-5" />
                                    Filters
                                    {isFiltersExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>
                                <div className="flex items-center gap-2">
                                    {!isFiltersExpanded && (
                                        <Badge variant="secondary" className="text-xs">
                                            {resourceTypeFilter.length + assignmentTypeFilter.length + statusFilter.length + platformFilter.length + filterTypeFilter.length + installTypeFilter.length} active
                                        </Badge>
                                    )}
                                    {(resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0 || installTypeFilter.length > 0) && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </CardTitle>
                            {/* Show active filters summary when collapsed */}
                            {!isFiltersExpanded && (resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0 || installTypeFilter.length > 0) && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                    {resourceTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Resource: {filter}
                                            <button
                                                onClick={() => setResourceTypeFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {assignmentTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Assignment: {filter}
                                            <button
                                                onClick={() => setAssignmentTypeFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
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
                                                <X className="h-3 w-3" />
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
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {filterTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Filter: {filter}
                                            <button
                                                onClick={() => setFilterTypeFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {installTypeFilter.map(filter => (
                                        <Badge key={filter} variant="outline" className="text-xs">
                                            Install: {filter}
                                            <button
                                                onClick={() => setInstallTypeFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardHeader>

                        {/* Collapsible Content */}
                        {isFiltersExpanded && (
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Resource Type</label>
                                        <MultiSelect
                                            options={getUniqueResourceTypes()}
                                            selected={resourceTypeFilter}
                                            onChange={setResourceTypeFilter}
                                            placeholder="Select resource types..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Assignment Type</label>
                                        <MultiSelect
                                            options={getUniqueAssignmentTypes()}
                                            selected={assignmentTypeFilter}
                                            onChange={setAssignmentTypeFilter}
                                            placeholder="Select assignment types..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
                                        <MultiSelect
                                            options={getUniqueStatuses()}
                                            selected={statusFilter}
                                            onChange={setStatusFilter}
                                            placeholder="Select status..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Platform</label>
                                        <MultiSelect
                                            options={getUniquePlatforms()}
                                            selected={platformFilter}
                                            onChange={setPlatformFilter}
                                            placeholder="Select platforms..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter Type</label>
                                        <MultiSelect
                                            options={getUniqueFilterTypes()}
                                            selected={filterTypeFilter}
                                            onChange={setFilterTypeFilter}
                                            placeholder="Select filter types..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Install Type</label>
                                        <MultiSelect
                                            options={getUniqueInstallTypes()}
                                            selected={installTypeFilter}
                                            onChange={setInstallTypeFilter}
                                            placeholder="Select install types..."
                                        />
                                    </div>
                                </div>

                                {(resourceTypeFilter.length > 0 || assignmentTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || filterTypeFilter.length > 0 || installTypeFilter.length > 0) && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Active filters:</span>
                                        {resourceTypeFilter.map(filter => (
                                            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                                {filter}
                                                <button onClick={() => setResourceTypeFilter(prev => prev.filter(f => f !== filter))}>
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
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
                                        {filterTypeFilter.map(filter => (
                                            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                                {filter}
                                                <button onClick={() => setFilterTypeFilter(prev => prev.filter(f => f !== filter))}>
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        {installTypeFilter.map(filter => (
                                            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                                {filter}
                                                <button onClick={() => setInstallTypeFilter(prev => prev.filter(f => f !== filter))}>
                                                    <X className="h-3 w-3" />
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

                    {/* Assignment Details Table */}
                    <Card className="shadow-sm w-full overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span>Assignment Details</span>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                </div>
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                                Detailed view of all assignments with their targets and configurations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <RefreshCw className="h-6 w-6 animate-spin text-yellow-400" />
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">Loading assignments...</span>
                                </div>
                            ) : (
                                <DataTable
                                    data={filteredAssignments}
                                    columns={columns}
                                    className="min-w-full"
                                    showPagination={true}
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Filtered empty state */}
                    {filteredAssignments.length === 0 && !loading && !error && assignments.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                                        {searchQuery ? <Search className="h-12 w-12 mx-auto" /> : <Filter className="h-12 w-12 mx-auto" />}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        {searchQuery ? 'No assignments match your search' : 'No assignments match your filters'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
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
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {selectedFilter?.displayName || 'Filter Details'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-300">
                            {selectedFilter?.description || 'Assignment filter information and rules'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFilter ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter ID</label>
                                    <p className="font-mono text-sm break-all text-gray-900 dark:text-gray-100">{selectedFilter.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Management Type</label>
                                    <div className="flex items-center gap-2">
                                        {selectedFilter.assignmentFilterManagementType === 0 ? (
                                            <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
                                                <Computer className="h-3 w-3 mr-1" />
                                                Devices
                                            </Badge>
                                        ) : (
                                            <Badge variant="default" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700">
                                                <Blocks className="h-3 w-3 mr-1" />
                                                Apps
                                            </Badge>
                                        )}

                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">    {selectedFilter.platform === 0 ? 'All' :
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

                            {selectedFilter.rule && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Filter Rule</label>
                                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                    <code className="whitespace-pre-wrap break-all">{selectedFilter.rule}</code>
                                </pre>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(selectedFilter.createdDateTime).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Modified</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(selectedFilter.lastModifiedDateTime).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Role Scope Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFilter.roleScopeTags && selectedFilter.roleScopeTags.length > 0 ? (
                                            selectedFilter.roleScopeTags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">No role scope tags</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">Filter not found</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
