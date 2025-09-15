'use client';

import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Download, Filter, Database, Search, X, Users, ExternalLink, Settings, Shield, ShieldCheck } from 'lucide-react';
import { CONFIGURATION_POLICIES_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT, ITEMS_PER_PAGE } from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';

interface PolicyAssignment {
    id: string;
    sourceId: string;
    target: {
        groupId: string;
        '@odata.type': string;
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
    platforms: string;
    lastModifiedDateTime: string;
    name: string;
    settingCount: number;
    id: string;
    isAssigned: boolean;
    assignments: PolicyAssignment[];
    settings: any[];
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

interface ApiResponse {
    status: string;
    message: string;
    details: any[];
    data: ConfigurationPolicy[];
}

export default function ConfigurationPoliciesPage() {
    const { instance, accounts } = useMsal();
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

    // Add pagination calculations
    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    const [selectedPolicy, setSelectedPolicy] = useState<ConfigurationPolicy | null>(null);
    const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [policyTypeFilter, statusFilter, platformFilter, searchQuery]);


    const handlePolicyClick = (policy: ConfigurationPolicy) => {
        setSelectedPolicy(policy);
        setIsPolicyDialogOpen(true);
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
            { label: 'Policy Types', value: new Set(filteredPolicies.map(p => p.policyType)).size },
            { label: 'Platforms', value: new Set(filteredPolicies.map(p => p.platforms)).size }
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

        try {
            await Promise.all([fetchPoliciesData(), fetchFilters()]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPoliciesData = async () => {
        if (!accounts.length) return;

        const response = await instance.acquireTokenSilent({
            scopes: [apiScope],
            account: accounts[0]
        });

        const apiResponse = await fetch(CONFIGURATION_POLICIES_ENDPOINT, {
            headers: {
                'Authorization': `Bearer ${response.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!apiResponse.ok) {
            throw new Error(`API call failed: ${apiResponse.statusText}`);
        }

        const responseData: ApiResponse = await apiResponse.json();
        const policiesData = responseData.data;

        if (Array.isArray(policiesData)) {
            setPolicies(policiesData);
            setFilteredPolicies(policiesData);
        } else {
            console.error('API response data is not an array:', policiesData);
            setPolicies([]);
            setFilteredPolicies([]);
            throw new Error('Invalid data format received from API');
        }
    };

    const fetchFilters = async () => {
        if (!accounts.length) return;

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(ASSIGNMENTS_FILTERS_ENDPOINT, {
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!apiResponse.ok) {
                throw new Error(`Failed to fetch filters: ${apiResponse.statusText}`);
            }

            const filtersData = await apiResponse.json();

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
            filtered = filtered.filter(policy => platformFilter.includes(policy.platforms));
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
            platforms.add(policy.platforms);
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

    const columns = [
        {
            key: 'name' as string,
            label: 'Policy Name',
            width: 250,
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policyName = value ? String(value) : 'N/A';
                const description = row.description as string;
                const policy = row as ConfigurationPolicy;

                return (
                    <div className="space-y-1">
                        <button
                            onClick={() => handlePolicyClick(policy)}
                            className="font-medium text-sm truncate block w-full text-left hover:text-blue-600 hover:underline cursor-pointer"
                            title={`Click to view details: ${policyName}`}
                        >
                            {policyName}
                        </button>
                        {description && (
                            <span className="text-xs text-gray-500 line-clamp-2 max-w-md">
                        {description.replace(/\|/g, '').replace(/\n/g, ' ').substring(0, 100)}...
                    </span>
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
                    {String(value).replace('groupPolicyConfigurations', 'Group Policy')}
                </Badge>
            )
        },
        {
            key: 'platforms' as string,
            label: 'Platform',
            width: 100,
            minWidth: 80,
            render: (value: unknown) => {
                const platform = String(value);
                const getPlatformColor = (platform: string) => {
                    switch (platform.toLowerCase()) {
                        case 'windows': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
                        case 'ios': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
                        case 'android': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                        case 'macos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
                        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
                    }
                };

                return (
                    <Badge variant="secondary" className={`text-xs whitespace-nowrap ${getPlatformColor(platform)}`}>
                        {platform}
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
                const isAssigned = Boolean(row.isAssigned);

                if (!isAssigned || !assignments || assignments.length === 0) {
                    return (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                        </div>
                    );
                }

                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{assignments.length} groups</span>
                        </div>
                        <div className="space-y-1">
                            {assignments.slice(0, 2).map((assignment) => (
                                <button
                                    key={assignment.id}
                                    onClick={() => handleGroupClick(assignment.target.groupId)}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer truncate block w-full text-left"
                                    title={assignment.target.groupId}
                                >
                                    {assignment.target.groupId}
                                </button>
                            ))}
                            {assignments.length > 2 && (
                                <span className="text-xs text-gray-500">
                                    +{assignments.length - 2} more
                                </span>
                            )}
                        </div>
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
                <span className="text-sm text-gray-600 whitespace-nowrap">
                    {String(value) || '0'}
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
            key: 'createdDateTime' as string,
            label: 'Created',
            width: 140,
            minWidth: 120,
            render: (value: unknown) => {
                const date = new Date(String(value));
                return (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
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
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                );
            }
        }
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600">Configuration Policies</h1>
                    <p className="text-gray-600 mt-2">
                        Manage and monitor your Intune configuration policies
                    </p>
                </div>
                <div className="flex gap-2">
                    {policies.length > 0 ? (
                        <>
                            <Button onClick={fetchPolicies} variant="outline" size="sm" disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <ExportButton
                                exportData={prepareExportData()}
                                variant="outline"
                                size="sm"
                            />
                        </>
                    ) : (
                        <Button
                            onClick={fetchPolicies}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Load Policies
                        </Button>
                    )}
                </div>
            </div>

            {/* Show welcome card when no policies are loaded and not loading */}
            {policies.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Settings className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-4">
                                Ready to view your configuration policies
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
            {loading && policies.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Loading Configuration Policies
                            </h3>
                            <p className="text-gray-600">
                                Fetching policy data from your Intune environment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Only show search, filters, and table when policies are loaded or loading */}
            {(policies.length > 0 || loading) && (
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
                                    placeholder="Search by policy name, type, platform, or description..."
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
                                {(policyTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0) && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Policy Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Policy Type</label>
                                    <MultiSelect
                                        options={getUniquePolicyTypes()}
                                        selected={policyTypeFilter}
                                        onChange={setPolicyTypeFilter}
                                        placeholder="Select policy types..."
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
                            {(policyTypeFilter.length > 0 || statusFilter.length > 0 || platformFilter.length > 0) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {policyTypeFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {filter}
                                            <button onClick={() => setPolicyTypeFilter(prev => prev.filter(f => f !== filter))}>
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

                    {/* Configuration Policies Table */}
                    <Card className="shadow-sm w-full overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span>Configuration Policy Details</span>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredPolicies.length)} of {filteredPolicies.length}</span>
                                </div>
                            </CardTitle>
                            <CardDescription>
                                Overview of all configuration policies and their assignment status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                                    <span className="ml-2 text-gray-600">Loading policies...</span>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="overflow-x-auto">
                                        <DataTable
                                            data={paginatedPolicies}
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
                                                totalItems={filteredPolicies.length}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Filtered empty state */}
                    {filteredPolicies.length === 0 && !loading && !error && policies.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        {searchQuery ? <Search className="h-12 w-12 mx-auto" /> : <Filter className="h-12 w-12 mx-auto" />}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchQuery ? 'No policies match your search' : 'No policies match your filters'}
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
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
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
            {/* Policy Details Dialog */}
            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {selectedPolicy?.name || 'Policy Details'}
                        </DialogTitle>
                        <DialogDescription>
                            Configuration policy information and settings
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPolicy ? (
                        <div className="space-y-6">
                            {/* Policy Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Policy ID</label>
                                    <p className="font-mono text-xs break-all text-gray-900 dark:text-gray-100">{selectedPolicy.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
                                    <Badge variant="outline" className="text-xs">
                                        {selectedPolicy.policyType.replace('groupPolicyConfigurations', 'Group Policy')}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform</label>
                                    <Badge variant="secondary" className="text-xs">
                                        {selectedPolicy.platforms}
                                    </Badge>
                                </div>
                            </div>

                            {/* Policy Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Assignment Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={selectedPolicy.isAssigned ? 'default' : 'secondary'}
                                               className={selectedPolicy.isAssigned ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {selectedPolicy.isAssigned ? 'Assigned' : 'Not Assigned'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Assignment Count</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedPolicy.assignments?.length || 0}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Settings Count</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {selectedPolicy.settingCount || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedPolicy.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Description</label>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                            {selectedPolicy.description.split('\n').map((line, index) => {
                                                // Handle markdown table rows
                                                if (line.includes('|')) {
                                                    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                                                    if (cells.length >= 2) {
                                                        return (
                                                            <div key={index} className="flex gap-4 mb-2">
                                                                <strong className="min-w-[120px]">{cells[0]}:</strong>
                                                                <span className="flex-1">{cells[1]}</span>
                                                            </div>
                                                        );
                                                    }
                                                }
                                                // Handle regular lines
                                                return line.trim() ? (
                                                    <p key={index} className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                                                        {line}
                                                    </p>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Assignments Details */}
                            {selectedPolicy.assignments && selectedPolicy.assignments.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-3">
                                        Assignments ({selectedPolicy.assignments.length})
                                    </label>
                                    <div className="space-y-3">
                                        {selectedPolicy.assignments.map((assignment, index) => {
                                            const filterInfo = getFilterInfo(
                                                assignment.target.deviceAndAppManagementAssignmentFilterId,
                                                assignment.target.deviceAndAppManagementAssignmentFilterType
                                            );

                                            return (
                                                <div key={assignment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Group ID</label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleGroupClick(assignment.target.groupId)}
                                                                    className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    {assignment.target.groupId}
                                                                </button>
                                                                <ExternalLink className="h-3 w-3 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Assignment Filter</label>
                                                            {filterInfo.displayName === 'None' ? (
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">None</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleFilterClick(assignment.target.deviceAndAppManagementAssignmentFilterId!)}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    {filterInfo.displayName}
                                                                    {filterInfo.managementType && (
                                                                        <Badge variant="outline" className="ml-2 text-xs">
                                                                            {filterInfo.managementType}
                                                                        </Badge>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(selectedPolicy.createdDateTime).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Modified</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(selectedPolicy.lastModifiedDateTime).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Technical Details */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">Technical Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">Policy Subtype</label>
                                        <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPolicy.policySubType}</p>
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">OData Type</label>
                                        <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPolicy['@odata.type'] || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">Creation Source</label>
                                        <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPolicy.creationSource || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">Settings Available</label>
                                        <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPolicy.settings?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Policy not found</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
