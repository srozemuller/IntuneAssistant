'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
    Trash2,
    FileText,
    XCircle
} from 'lucide-react';
import {
    CONFIGURATION_POLICIES_ENDPOINT,
    ASSIGNMENTS_FILTERS_ENDPOINT,
    ITEMS_PER_PAGE,
    CONFIGURATION_POLICIES_BULK_DELETE_ENDPOINT,
    GROUPS_ENDPOINT,
    GROUPS_LIST_ENDPOINT
} from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';
import {useApiRequest} from "@/hooks/useApiRequest";
import { ConsentDialog } from '@/components/ConsentDialog';
import {AssignmentFilter} from "@/types/assignmentFilter";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {UserMember} from "@/hooks/useGroupDetails";
import {CancelledCard} from "@/components/CancelledCard";


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

interface PolicyAssignment {
    id: string;
    sourceId: string;
    target: {
        '@odata.type': string;
        groupId?: string;
        deviceAndAppManagementAssignmentFilterId: string | null;
        deviceAndAppManagementAssignmentFilterType: string;
    };
}


interface ConfigurationPolicy extends Record<string, unknown> {
    '@odata.type': string | null;
    policyType: string;
    policySubType: string;
    createdDateTime: string;
    creationSource: string | null;
    description: string;
    platform: string;
    platforms: string;
    lastModifiedDateTime: string;
    name: string;
    settingCount: number;
    id: string;
    isAssigned: boolean;
    assignments: PolicyAssignment[];
    settings: unknown[];
}

interface ApiResponse {
    status: string;
    message: string;
    details: unknown[];
    data: ConfigurationPolicy[];
}

export default function ConfigurationPoliciesPage() {
    const { instance, accounts } = useMsal();
    const { request, cancel } = useApiRequest();
    const [isCancelled, setIsCancelled] = useState(false);

    const [policies, setPolicies] = useState<ConfigurationPolicy[]>([]);
    const [filteredPolicies, setFilteredPolicies] = useState<ConfigurationPolicy[]>([]);
    const [filters, setFilters] = useState<AssignmentFilter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter dialog states
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<AssignmentFilter | null>(null);

    // Filter states
    const [policyTypeFilter, setPolicyTypeFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    const [groups, setGroups] = useState<GroupDetails[]>([]);

    // Add pagination calculations for DataTable
    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    const [selectedPolicy, setSelectedPolicy] = useState<ConfigurationPolicy | null>(null);
    const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);

    // Selection states - matching device selection exactly
    const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);


    useEffect(() => {
        setCurrentPage(1);
    }, [policyTypeFilter, statusFilter, platformFilter, searchQuery]);

    const handlePolicyClick = (policy: Record<string, unknown>) => {
        setSelectedPolicy(policy as ConfigurationPolicy);
        setIsPolicyDialogOpen(true);
    };

    const handleBulkExport = () => {
        const selectedPolicyData = policies.filter(policy => selectedPolicies.includes(policy.id));
        const exportData: ExportData = {
            ...prepareExportData(),
            data: selectedPolicyData,
            filename: `selected-configuration-policies-${selectedPolicyData.length}`,
            title: `Selected Configuration Policies (${selectedPolicyData.length})`,
            description: `Export of ${selectedPolicyData.length} selected configuration policies`
        };

        // Create a temporary ExportButton to trigger export
        const tempExportButton = document.createElement('div');
        document.body.appendChild(tempExportButton);
        // Remove after use
        document.body.removeChild(tempExportButton);
    };


    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedPolicies.length} selected policies? This action cannot be undone.`)) {
            return;
        }

        setBulkActionLoading(true);
        try {
            const selectedPolicyData = policies.filter(policy => selectedPolicies.includes(policy.id));

            const response = await request<ConfigurationPolicy>(
                CONFIGURATION_POLICIES_BULK_DELETE_ENDPOINT,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        policyIds: selectedPolicies,
                        policies: selectedPolicyData
                    })
                }
            );

            if (!response) {
                throw new Error('No response received from API');
            }

            // Refresh policies after successful deletion
            await fetchPolicies();
            setSelectedPolicies([]);
        } catch (error) {
            console.error('Failed to delete policies:', error);
            setError(`Failed to delete selected policies: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setBulkActionLoading(false);
        }
    };

    const prepareExportData = (): ExportData => {
        const exportColumns: ExportColumn[] = [
            {
                key: 'name',
                label: 'Policy Name',
                width: 30,
                getValue: (row) => String(row.name || '')
            },
            {
                key: 'policyType',
                label: 'Type',
                width: 20,
                getValue: (row) => String(row.policyType || '')
            },
            {
                key: 'platforms',
                label: 'Platform',
                width: 15,
                getValue: (row) => String(row.platforms || '')
            },
            {
                key: 'isAssigned',
                label: 'Assignment Status',
                width: 15,
                getValue: (row) => row.isAssigned ? 'Assigned' : 'Not Assigned'
            },
            {
                key: 'assignmentCount',
                label: 'Assignment Count',
                width: 15,
                getValue: (row) => String((row.assignments as PolicyAssignment[])?.length || 0)
            },
            {
                key: 'settingCount',
                label: 'Settings Count',
                width: 15,
                getValue: (row) => String(row.settingCount || 0)
            },
            {
                key: 'createdDateTime',
                label: 'Created',
                width: 20,
                getValue: (row) => new Date(String(row.createdDateTime)).toLocaleDateString()
            },
            {
                key: 'lastModifiedDateTime',
                label: 'Last Modified',
                width: 20,
                getValue: (row) => new Date(String(row.lastModifiedDateTime)).toLocaleDateString()
            }
        ];

        const stats = [
            { label: 'Total Policies', value: filteredPolicies.length },
            { label: 'Assigned', value: filteredPolicies.filter(p => p.isAssigned).length },
            { label: 'Not Assigned', value: filteredPolicies.filter(p => !p.isAssigned).length },
        ];

        return {
            data: filteredPolicies,
            columns: exportColumns,
            filename: 'configuration-policies',
            title: 'Configuration Policies',
            description: 'Overview of all Intune configuration policies and their assignments',
            stats
        };
    };

    const fetchPolicies = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);
        setIsCancelled(false);

        try {
            await Promise.all([fetchPoliciesData(), fetchFilters(), fetchGroups()]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPoliciesData = async () => {
        if (!accounts.length) return;

        const response = await request<ApiResponse>(
            CONFIGURATION_POLICIES_ENDPOINT,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response) {
            throw new Error('No response received from API');
        }

        // Unwrap ApiResponseWithCorrelation → .data is ApiResponse envelope, .data.data is the array
        if (!Array.isArray(response.data.data)) {
            throw new Error('Invalid data format received from API');
        }

        const policiesData = response.data.data;
        setPolicies(policiesData);
        setFilteredPolicies(policiesData);
    };

    const fetchGroups = async () => {
        if (!accounts.length) return;

        try {
            const groupResponse = await request<{ message: string; details: unknown; data: GroupDetails[] }>(
                GROUPS_LIST_ENDPOINT,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            // Unwrap ApiResponseWithCorrelation → .data is the envelope, .data.data is the array
            if (groupResponse && Array.isArray(groupResponse.data.data)) {
                setGroups(groupResponse.data.data);
            } else {
                console.warn('Invalid groups response format:', groupResponse);
                setGroups([]);
            }
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            setGroups([]);
        }
    };



    const fetchFilters = async () => {
        if (!accounts.length) return;

        try {
            const filtersData = await request<{ status: number; message: string; details: unknown[]; data: AssignmentFilter[] }>(
                ASSIGNMENTS_FILTERS_ENDPOINT,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            // Unwrap ApiResponseWithCorrelation → .data.data is the AssignmentFilter array
            if (filtersData && Array.isArray(filtersData.data.data)) {
                setFilters(filtersData.data.data);
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
            managementType: filter?.assignmentFilterManagementType?.toLowerCase() || null,
            platform: filter?.platform || null
        };
    };

    const getTargetDisplay = (target: PolicyAssignment['target']): { label: string; groupId?: string; isBuiltIn: boolean } => {
        const odataType = target['@odata.type'] || '';

        if (odataType.endsWith('allDevicesAssignmentTarget')) {
            return { label: 'All Devices', isBuiltIn: true };
        }
        if (odataType.endsWith('allLicensedUsersAssignmentTarget')) {
            return { label: 'All Users', isBuiltIn: true };
        }

        // Resolve groupId — check multiple possible paths and casings
        const raw = target as unknown as Record<string, unknown>;
        let groupId = target.groupId || '';

        // Try alternative casings and nested paths
        if (!groupId) {
            groupId = (raw['GroupId'] || raw['groupid'] || raw['group_id'] ||
                      raw['groupID'] || raw['GROUPID'] || '') as string;
        }

        // Some responses nest it under 'target' or 'Target'
        if (!groupId && raw['target'] && typeof raw['target'] === 'object') {
            const nested = raw['target'] as Record<string, unknown>;
            groupId = (nested['groupId'] || nested['GroupId'] || nested['id'] || '') as string;
        }

        // Try to find it anywhere in the object as a last resort
        if (!groupId) {
            const allValues = Object.values(raw);
            // Look for a string that looks like a GUID and might be in groups
            const possibleId = allValues.find(v =>
                typeof v === 'string' &&
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) &&
                groups.some(g => g.id === v)
            );
            if (possibleId) {
                groupId = possibleId as string;
            }
        }

        if (groupId) {
            const group = groups.find(g => g.id === groupId);
            return {
                label: group?.displayName || (groups.length === 0 ? 'Loading…' : `Group ${groupId.substring(0, 8)}…`),
                groupId,
                isBuiltIn: false
            };
        }

        // Debug: log when we can't find groupId for a group-type assignment
        if (odataType.toLowerCase().includes('group')) {
            console.warn('Could not resolve groupId for group assignment target:', {
                odataType,
                target,
                availableKeys: Object.keys(raw),
                groupsLoaded: groups.length > 0
            });
        }

        // odata type contains "group" but no groupId resolved — show as non-clickable
        if (odataType.toLowerCase().includes('group')) {
            return { label: 'Unknown Group', isBuiltIn: true };
        }

        const shortType = odataType.replace('#microsoft.graph.', '').replace(/AssignmentTarget$/i, '') || 'Unknown';
        return { label: shortType, isBuiltIn: true };
    };

    const handleFilterClick = (filterId: string) => {
        if (filterId && filterId !== 'None') {
            const filter = filters.find(f => f.id === filterId);
            if (filter) {
                setSelectedFilter(filter);
                setIsFilterDialogOpen(true);
            }
        }
    };

    // Filter and search function
    useEffect(() => {
        let filtered = policies;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(policy =>
                policy.name?.toLowerCase().includes(query) ||
                policy.policyType.toLowerCase().includes(query) ||
                policy.platforms?.toLowerCase().includes(query) ||
                policy.description?.toLowerCase().includes(query)
            );
        }

        // Apply dropdown filters
        if (policyTypeFilter.length > 0) {
            filtered = filtered.filter(policy => policyTypeFilter.includes(policy.policyType));
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter(policy => {
                if (statusFilter.includes('Assigned') && statusFilter.includes('Not Assigned')) {
                    return true;
                }
                if (statusFilter.includes('Assigned')) return policy.isAssigned;
                if (statusFilter.includes('Not Assigned')) return !policy.isAssigned;
                return false;
            });
        }

        if (platformFilter.length > 0) {
            filtered = filtered.filter(policy => platformFilter.includes(policy.platform || policy.platforms));
        }

        setFilteredPolicies(filtered);
    }, [policies, policyTypeFilter, statusFilter, platformFilter, searchQuery]);

    // Get unique values for filters
    const getUniquePolicyTypes = (): Option[] => {
        const types = new Set<string>();
        policies.forEach(policy => {
            types.add(policy.policyType);
        });
        return Array.from(types).sort().map(type => ({ label: type, value: type }));
    };

    const getUniqueStatuses = (): Option[] => [
        { label: 'Assigned', value: 'Assigned' },
        { label: 'Not Assigned', value: 'Not Assigned' }
    ];

    const getUniquePlatforms = (): Option[] => {
        const platforms = new Set<string>();
        policies.forEach(policy => {
            const p = policy.platform || policy.platforms;
            if (p) platforms.add(p);
        });
        return Array.from(platforms).sort().map(platform => ({ label: platform, value: platform }));
    };

    const clearFilters = () => {
        setPolicyTypeFilter([]);
        setStatusFilter([]);
        setPlatformFilter([]);
        setSearchQuery('');
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    // Group dialog handlers
    const handleGroupClick = (groupId: string) => {
        if (groupId) {
            setSelectedGroupId(groupId);
            setIsGroupDialogOpen(true);
        }
    };

    const columns = useMemo(() => [
        {
            key: 'name' as string,
            label: 'Policy Name',
            width: 250,
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policyName = value ? String(value) : 'N/A';
                const description = row.description as string;

                // Calculate max description length based on column width
                // Base: 200px = 100 chars, scale proportionally
                const columnWidth = 250; // Current width
                const maxDescriptionLength = Math.floor((columnWidth - 150) / 0.8); // ~125 chars for 250px width

                const truncatedDescription = description && description.length > maxDescriptionLength
                    ? `${description.slice(0, maxDescriptionLength)}...`
                    : description;

                return (
                    <div className="space-y-1">
                        <div className="font-medium text-foreground truncate">
                            {policyName}
                        </div>
                        {description && (
                            <div
                                className="text-xs text-muted-foreground leading-tight"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    wordBreak: 'break-word'
                                }}
                                title={description}
                            >
                                {truncatedDescription}
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'policyType' as string,
            label: 'Type',
            width: 150,
            minWidth: 120,
            render: (value: unknown) => (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {String(value)}
                </Badge>
            )
        },
        {
            key: 'platform' as string,
            label: 'Platform',
            width: 100,
            minWidth: 80,
            render: (value: unknown, row: Record<string, unknown>) => {
                const platform = String(value || row.platforms || '');
                const getPlatformColor = (p: string) => {
                    switch (p.toLowerCase()) {
                        case 'windows10': case 'windows10andlater': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                        case 'android': case 'androidforwork': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                        case 'ios': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                        case 'macos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                    }
                };
                return (
                    <Badge className={`text-xs ${getPlatformColor(platform)}`}>
                        {platform || '—'}
                    </Badge>
                );
            }
        },
        {
            key: 'assignments' as string,
            label: 'Assignments',
            width: 160,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const assignments = value as PolicyAssignment[];

                if (!assignments || assignments.length === 0) {
                    return (
                        <Badge variant="secondary" className="text-xs">
                            No Assignments
                        </Badge>
                    );
                }

                return (
                    <div className="space-y-1">
                        {assignments.slice(0, 2).map((assignment, index) => {
                            const target = getTargetDisplay(assignment.target);
                            const isExcluded = assignment.target['@odata.type']?.endsWith('exclusionGroupAssignmentTarget');

                            if (target.isBuiltIn) {
                                return (
                                    <Badge key={index} variant="outline" className="text-xs block">
                                        {target.label}
                                    </Badge>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => target.groupId && handleGroupClick(target.groupId)}
                                    className={`text-xs hover:underline block truncate max-w-full text-left ${
                                        isExcluded
                                            ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                                            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                    }`}
                                    title={`${isExcluded ? '[Excluded] ' : ''}${target.label}`}
                                >
                                    {isExcluded ? '⊖ ' : ''}{target.label}
                                </button>
                            );
                        })}
                        {assignments.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                                +{assignments.length - 2} more
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'settingCount' as string,
            label: 'Settings',
            width: 80,
            minWidth: 60,
            render: (value: unknown) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {String(value)}
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
                    <Badge
                        variant={isAssigned ? "default" : "secondary"}
                        className={`text-xs ${
                            isAssigned
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                        {isAssigned ? 'Assigned' : 'Not Assigned'}
                    </Badge>
                );
            }
        },
        {
            key: 'createdDateTime' as string,
            label: 'Created',
            width: 140,
            minWidth: 120,
            render: (value: unknown) => {
                const date = new Date(String(value));
                return (
                    <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString()}
                    </div>
                );
            }
        },
        {
            key: 'lastModifiedDateTime' as string,
            label: 'Modified',
            width: 140,
            minWidth: 120,
            render: (value: unknown) => {
                const date = new Date(String(value));
                return (
                    <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString()}
                    </div>
                );
            }
        }
    ], [groups, filters]);

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Intune Policy Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and monitor your Intune configuration policies
                    </p>
                </div>
                <div className="flex gap-2">
                    {policies.length > 0 ? (
                        <>
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
                            <Button onClick={fetchPolicies} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={fetchPolicies} disabled={loading}>
                                <Database className="h-4 w-4 mr-2" />
                                {loading ? "Loading..." : "Load Policies"}
                            </Button>
                            {loading && (
                                <Button
                                    onClick={() => {
                                        cancel();
                                        setPolicies([]);
                                        setFilteredPolicies([]);
                                        setError(null);
                                        setLoading(false);
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

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Error occurred while accessing policies
                        </p>
                        <Button onClick={fetchPolicies} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => {
                        setIsCancelled(false);
                        fetchPolicies();
                    }}
                    title="Loading Cancelled"
                    description="Data loading was cancelled. Click below to load assignments again."
                    buttonText="Load Policies"
                />
            )}

            {/* Bulk Actions Bar */}
            {selectedPolicies.length > 0 && !loading && !error && (
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    {selectedPolicies.length} policies selected
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPolicies([])}
                                    className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-800"
                                >
                                    Clear Selection
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBulkExport}
                                    className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-800"
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Export Selected
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={bulkActionLoading}
                                >
                                    {bulkActionLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-1" />
                                    )}
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show welcome card when no policies are loaded and not loading */}
            {policies.length === 0 && !loading && !error && (
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-muted-foreground mb-6">
                                <Settings className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground mb-4">
                                Ready to view your configuration policies
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Click the &quot;Load Policies&quot; button above to fetch all configuration policies from your Intune environment.
                            </p>
                            <Button onClick={fetchPolicies} className="flex items-center gap-2 mx-auto" size="lg">
                                <Settings className="h-5 w-5" />
                                Load Policies
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show loading state */}
            {loading && (
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <h3 className="text-lg font-medium text-foreground mb-2">Loading Policies</h3>
                            <p className="text-muted-foreground">
                                Fetching configuration policies from Intune...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters and DataTable */}
            {(policies.length > 0 || loading) && !error && (
                <>
                    {/* Filters */}
                    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-medium">Filters</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    disabled={loading}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search policies..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                                            disabled={loading}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={clearSearch}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                disabled={loading}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Policy Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Policy Type</label>
                                    <MultiSelect
                                        options={getUniquePolicyTypes()}
                                        selected={policyTypeFilter}
                                        onChange={setPolicyTypeFilter}
                                        placeholder="Select types..."
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Status</label>
                                    <MultiSelect
                                        options={getUniqueStatuses()}
                                        selected={statusFilter}
                                        onChange={setStatusFilter}
                                        placeholder="Select status..."
                                    />
                                </div>

                                {/* Platform Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Platform</label>
                                    <MultiSelect
                                        options={getUniquePlatforms()}
                                        selected={platformFilter}
                                        onChange={setPlatformFilter}
                                        placeholder="Select platforms..."
                                    />
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {(policyTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0 || searchQuery) && (
                                <div className="text-sm text-muted-foreground">
                                    Showing {filteredPolicies.length} of {policies.length} policies
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* DataTable */}
                    <DataTable
                        data={filteredPolicies}
                        columns={columns}
                        onRowClick={handlePolicyClick}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        showPagination={true}
                        showSearch={false}
                        selectedRows={selectedPolicies}
                        onSelectionChange={setSelectedPolicies}
                        className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10"
                    />
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
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Assignment Filter Details
                        </DialogTitle>
                        <DialogDescription>
                            View the details and rules for this assignment filter
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFilter && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-foreground mb-2">Filter Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Name:</span>
                                            <span className="ml-2">{selectedFilter.displayName}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Description:</span>
                                            <span className="ml-2">{selectedFilter.description || 'No description'}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Platform:</span>
                                            <span className="ml-2">{selectedFilter.platform || 'All'}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Management Type:</span>
                                            <Badge variant="default" className="ml-2">
                                                {selectedFilter.assignmentFilterManagementType || 'Devices'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-foreground mb-2">Filter Rule</h4>
                                <div className="bg-muted p-4 rounded-md">
                                    <code className="text-sm text-foreground whitespace-pre-wrap break-all">
                                        {selectedFilter.rule}
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Policy Details Dialog */}
            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Policy Details
                        </DialogTitle>
                        <DialogDescription>
                            View detailed information about this configuration policy
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPolicy && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-foreground mb-3">Policy Information</h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="font-medium text-muted-foreground">Name:</span>
                                            <div className="mt-1">{selectedPolicy.name}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Description:</span>
                                            <div className="mt-1">{selectedPolicy.description || 'No description'}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Type:</span>
                                            <div className="mt-1">
                                                <Badge variant="outline">{selectedPolicy.policyType}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Platform:</span>
                                            <div className="mt-1">
                                                <Badge>{selectedPolicy.platform || selectedPolicy.platforms}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Settings Count:</span>
                                            <div className="mt-1">{selectedPolicy.settingCount}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-foreground mb-3">Timestamps</h4>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="font-medium text-muted-foreground">Created:</span>
                                            <div className="mt-1">{new Date(selectedPolicy.createdDateTime).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Last Modified:</span>
                                            <div className="mt-1">{new Date(selectedPolicy.lastModifiedDateTime).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-muted-foreground">Assignment Status:</span>
                                            <div className="mt-1">
                                                <Badge variant={selectedPolicy.isAssigned ? "default" : "secondary"}>
                                                    {selectedPolicy.isAssigned ? 'Assigned' : 'Not Assigned'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assignments */}
                            {selectedPolicy.assignments && selectedPolicy.assignments.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-foreground mb-3">Assignments ({selectedPolicy.assignments.length})</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                        {selectedPolicy.assignments.map((assignment, index) => {
                                            const target = getTargetDisplay(assignment.target);
                                            const isExcluded = assignment.target['@odata.type']?.endsWith('exclusionGroupAssignmentTarget');
                                            const filterInfo = getFilterInfo(
                                                assignment.target.deviceAndAppManagementAssignmentFilterId,
                                                assignment.target.deviceAndAppManagementAssignmentFilterType
                                            );

                                            return (
                                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    <div className="flex items-center gap-3">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        {target.isBuiltIn ? (
                                                            <Badge variant="outline" className="text-xs">{target.label}</Badge>
                                                        ) : (
                                                            <button
                                                                onClick={() => target.groupId && handleGroupClick(target.groupId)}
                                                                className={`hover:underline text-sm ${isExcluded ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}
                                                            >
                                                                {isExcluded ? '⊖ ' : ''}{target.label}
                                                            </button>
                                                        )}
                                                        {filterInfo.displayName !== 'None' && (
                                                            <button
                                                                onClick={() => handleFilterClick(assignment.target.deviceAndAppManagementAssignmentFilterId || '')}
                                                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:underline text-xs"
                                                            >
                                                                Filter: {filterInfo.displayName}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Settings */}
                            {selectedPolicy.settings && (selectedPolicy.settings as unknown[]).length > 0 && (
                                <div>
                                    <h4 className="font-medium text-foreground mb-3">Settings ({(selectedPolicy.settings as unknown[]).length})</h4>
                                    <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto">
                                        <pre className="text-sm text-foreground whitespace-pre-wrap">
                                            {JSON.stringify(selectedPolicy.settings, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
