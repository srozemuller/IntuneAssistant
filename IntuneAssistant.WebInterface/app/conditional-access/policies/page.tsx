'use client';

import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Filter, Search, X, Users, Shield } from 'lucide-react';
import { CA_POLICIES_ENDPOINT, ITEMS_PER_PAGE } from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';
import { NoTenantSelected } from "@/components/NoTenantSelected";
import {useApiRequest} from "@/hooks/useApiRequest";


interface CAGrantControls {
    operator: 'OR' | 'AND';
    builtInControls: string[];
    customAuthenticationFactors: string[];
    termsOfUse: string[];
    authenticationStrengthODataContext: string | null;
    authenticationStrength: Record<string, unknown> | null;
}

interface CAConditions {
    userRiskLevels: string[];
    signInRiskLevels: string[];
    clientAppTypes: string[];
    platforms: {
        includePlatforms: string[];
        excludePlatforms: string[];
    };
    applications: {
        includeApplications: string[];
        excludeApplications: string[];
        includeUserActions: string[];
        includeAuthenticationContextClassReferences: string[];
    };
    users: {
        includeUsers: string[];
        includeUsersReadable: ReadableUser[];
        excludeUsers: string[];
        excludeUsersReadable: ReadableUser[];
        includeGroups: string[];
        includeGroupsReadable: ReadableGroup[];
        includeRoles: string[];
        excludeRoles: string[];
    };
    locations: unknown | null;
    times: unknown | null;
    deviceStates: unknown | null;
    devices: unknown | null;
    clientApplications: unknown | null;
}

interface ReadableUser {
    id: string;
    displayName: string;
    userPrincipalName: string;
    accountEnabled: boolean;
}

interface ReadableGroup {
    id: string;
    displayName: string;
    description: string | null;
    groupCount?: {
        userCount: number;
        deviceCount: number;
        groupCount: number;
    };
}

interface ApiResponse {
    status: string;
    message: string;
    details: string[];
    data: CAPolicy[];
}

interface CAPolicy extends Record<string, unknown> {
    id: string;
    templateId: string | null;
    displayName: string;
    createdDateTime: string | null;
    modifiedDateTime: string;
    state: 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced';
    partialEnablementStrategy: string | null;
    sessionControls: Record<string, unknown> | null;
    conditions: CAConditions;
    grantControls: CAGrantControls;
}

export default function ConditionalAccessPage() {
    const { request, cancel } = useApiRequest();

    const { selectedTenant } = useTenant();
    const [policies, setPolicies] = useState<CAPolicy[]>([]);
    const [filteredPolicies, setFilteredPolicies] = useState<CAPolicy[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [stateFilter, setStateFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [controlFilter, setControlFilter] = useState<string[]>([]);
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

    const [selectedPolicy, setSelectedPolicy] = useState<CAPolicy | null>(null);
    const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);


    useEffect(() => {
        setCurrentPage(1);
    }, [stateFilter, platformFilter, controlFilter, searchQuery]);

    const handlePolicyClick = (policy: CAPolicy) => {
        setSelectedPolicy(policy);
        setIsPolicyDialogOpen(true);
    };

    const getStateVariant = (state: string) => {
        switch (state) {
            case 'enabled': return 'default'; // This will be styled as green
            case 'disabled': return 'destructive'; // This will be styled as red
            case 'enabledForReportingButNotEnforced': return 'secondary'; // This will be styled as orange
            default: return 'secondary';
        }
    };


    const prepareExportData = (): ExportData => {
        const exportColumns: ExportColumn[] = [
            {
                key: 'displayName',
                label: 'Policy Name',
                width: 30,
                getValue: (row) => String(row.displayName || '')
            },
            {
                key: 'state',
                label: 'State',
                width: 15,
                getValue: (row) => String(row.state || '')
            },
            {
                key: 'platforms',
                label: 'Platforms',
                width: 20,
                getValue: (row) => {
                    const policy = row as CAPolicy;
                    return policy.conditions?.platforms?.includePlatforms?.join(', ') || 'All platforms';
                }
            },
            {
                key: 'grantControls',
                label: 'Grant Controls',
                width: 20,
                getValue: (row) => {
                    const policy = row as CAPolicy;
                    return policy.grantControls?.builtInControls?.join(', ') || 'None';
                }
            },
            {
                key: 'userCount',
                label: 'Target Users',
                width: 15,
                getValue: (row) => {
                    const policy = row as CAPolicy;
                    const includeUsers = policy.conditions?.users?.includeUsers?.length || 0;
                    const includeGroups = policy.conditions?.users?.includeGroups?.length || 0;
                    return `${includeUsers + includeGroups} targets`;
                }
            },
            {
                key: 'modifiedDateTime',
                label: 'Last Modified',
                width: 20,
                getValue: (row) => new Date(String(row.modifiedDateTime)).toLocaleDateString()
            }
        ];

        const stats = [
            { label: 'Total Policies', value: filteredPolicies.length },
            { label: 'Enabled', value: filteredPolicies.filter(p => p.state === 'enabled').length },
            { label: 'Disabled', value: filteredPolicies.filter(p => p.state === 'disabled').length },
            { label: 'Report Only', value: filteredPolicies.filter(p => p.state === 'enabledForReportingButNotEnforced').length }
        ];

        return {
            data: filteredPolicies,
            columns: exportColumns,
            filename: 'conditional-access-policies',
            title: 'Conditional Access Policies',
            description: 'Overview of all Conditional Access policies and their configurations',
            stats
        };
    };
    const fetchPolicies = async () => {
        setLoading(true);
        setError(null); // Clear previous errors

        try {
            const response = await request<ApiResponse>(CA_POLICIES_ENDPOINT);
            if (response && response.status === 'Success') {
                if (Array.isArray(response.data)) {
                    setPolicies(response.data);
                    // If data is empty but response is successful, don't show error
                    if (response.data.length === 0) {
                        setError(null); // Ensure no error is shown for empty but successful response
                    }
                } else {
                    setError('Invalid response format received');
                }
            } else {
                setError(response?.message || 'Failed to fetch policies');
            }
        } catch (error) {
            console.error('Failed to fetch policies:', error);
            setError('Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    };


// Cleanup on unmount
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    // Filter and search function
    useEffect(() => {
        let filtered = policies;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(policy =>
                policy.displayName?.toLowerCase().includes(query) ||
                policy.state.toLowerCase().includes(query) ||
                policy.conditions?.platforms?.includePlatforms?.some((p: string) => p.toLowerCase().includes(query)) ||
                policy.grantControls?.builtInControls?.some((c: string) => c.toLowerCase().includes(query))
            );
        }

        // Apply dropdown filters
        if (stateFilter.length > 0) {
            filtered = filtered.filter(policy => stateFilter.includes(policy.state));
        }

        if (platformFilter.length > 0) {
            filtered = filtered.filter(policy => {
                const platforms = policy.conditions?.platforms?.includePlatforms || [];
                return platformFilter.some(filter => platforms.includes(filter));
            });
        }

        if (controlFilter.length > 0) {
            filtered = filtered.filter(policy => {
                const controls = policy.grantControls?.builtInControls || [];
                return controlFilter.some(filter => controls.includes(filter));
            });
        }

        setFilteredPolicies(filtered);
    }, [policies, stateFilter, platformFilter, controlFilter, searchQuery]);
    // Get unique values for filters
    const getUniqueStates = (): Option[] => [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled' },
        { label: 'Report Only', value: 'enabledForReportingButNotEnforced' }
    ];

    const getUniquePlatforms = (): Option[] => {
        const platforms = new Set<string>();
        policies.forEach(policy => {
            policy.conditions?.platforms?.includePlatforms?.forEach(platform => {
                platforms.add(platform);
            });
        });
        return Array.from(platforms).sort().map(platform => ({ label: platform, value: platform }));
    };

    const getUniqueControls = (): Option[] => {
        const controls = new Set<string>();
        policies.forEach(policy => {
            policy.grantControls?.builtInControls?.forEach((control: string) => {
                controls.add(control);
            });
        });
        return Array.from(controls).sort().map((control: string) => ({ label: control, value: control }));
    };

    const clearFilters = () => {
        setStateFilter([]);
        setPlatformFilter([]);
        setControlFilter([]);
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

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'enabled': return 'Enabled';
            case 'disabled': return 'Disabled';
            case 'enabledForReportingButNotEnforced': return 'Report Only';
            default: return state;
        }
    };

    const columns = [
        {
            key: 'displayName' as string,
            label: 'Policy Name',
            width: 250,
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policyName = value ? String(value) : 'N/A';
                const policy = row as CAPolicy;

                return (
                    <div className="space-y-1">
                        <button
                            onClick={() => handlePolicyClick(policy)}
                            className="font-medium text-sm truncate block w-full text-left hover:text-blue-600 hover:underline cursor-pointer"
                            title={`Click to view details: ${policyName}`}
                        >
                            {policyName}
                        </button>
                    </div>
                );
            }
        },
        {
            key: 'state' as string,
            label: 'State',
            width: 120,
            minWidth: 100,
            render: (value: unknown) => {
                const state = String(value);

                const getStateStyle = (state: string) => {
                    switch (state) {
                        case 'enabled':
                            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
                        case 'disabled':
                            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
                        case 'enabledForReportingButNotEnforced':
                            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700';
                        default:
                            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700';
                    }
                };

                return (
                    <Badge
                        variant="outline"
                        className={`text-xs whitespace-nowrap ${getStateStyle(state)}`}
                    >
                        {getStateLabel(state)}
                    </Badge>
                );
            }
        },
        {
            key: 'platforms' as string, // Changed from 'conditions' to 'platforms'
            label: 'Platforms',
            width: 150,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policy = row as CAPolicy;
                const platforms = policy.conditions?.platforms?.includePlatforms || [];

                if (platforms.length === 0) {
                    return <span className="text-sm text-gray-500">All platforms</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {platforms.slice(0, 2).map((platform, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {platform}
                            </Badge>
                        ))}
                        {platforms.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{platforms.length - 2}
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'grantControls' as string,
            label: 'Grant Controls',
            width: 180,
            minWidth: 150,
            render: (value: unknown) => {
                const grantControls = value as CAGrantControls;
                const controls = grantControls?.builtInControls || [];

                if (controls.length === 0) {
                    return <span className="text-sm text-gray-500">No controls</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {controls.slice(0, 2).map((control: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {control}
                            </Badge>
                        ))}
                        {controls.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{controls.length - 2}
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'targetUsers' as string, // Changed from 'conditions' to 'targetUsers'
            label: 'Target Users/Groups',
            width: 160,
            minWidth: 140,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policy = row as CAPolicy;
                const conditions = policy.conditions;
                const includeUsers = conditions?.users?.includeUsers?.length || 0;
                const includeGroups = conditions?.users?.includeGroups?.length || 0;
                const includeGroupsReadable = conditions?.users?.includeGroupsReadable || [];

                if (includeUsers === 0 && includeGroups === 0) {
                    return (
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-muted-foreground">All users</span>
                        </div>
                    );
                }

                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{includeUsers + includeGroups} targets</span>
                        </div>
                        {includeGroupsReadable.slice(0, 2).map((group: ReadableGroup, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <button
                                    onClick={() => handleGroupClick(group.id)}
                                    className="text-xs text-blue-600 hover:underline truncate"
                                    title={`Click to view group: ${group.displayName}`}
                                >
                                    {group.displayName}
                                </button>
                            </div>
                        ))}
                        {includeGroupsReadable.length > 2 && (
                            <span className="text-xs text-gray-500">+{includeGroupsReadable.length - 2} more</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'modifiedDateTime' as string,
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

    // if (!selectedTenant) {
    //     return (
    //         <NoTenantSelected
    //             icon={Shield}
    //             feature="Conditional Access policies"
    //         />
    //     );
    // }
    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600">Conditional Access Policies</h1>
                    <p className="text-gray-600 mt-2">
                        Manage and monitor your Azure AD Conditional Access policies
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
                            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                            Load Policies
                        </Button>
                    )}
                </div>
            </div>

            {/* Welcome card when no policies are loaded */}
            {policies.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Shield className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-4">
                                No Conditional Access policies found
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                No conditional access policies are currently configured in your Entra ID environment for {selectedTenant?.displayName}.
                            </p>
                            <Button onClick={fetchPolicies} className="flex items-center gap-2 mx-auto" size="lg" variant="outline">
                                <RefreshCw className="h-5 w-5" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Loading state */}
            {loading && policies.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Loading Policies
                            </h3>
                            <p className="text-gray-600">
                                Fetching conditional access data from your Entra ID environment...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error state with GDAP context */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Error occurred while accessing policies
                        </p>
                        <Button onClick={fetchPolicies} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}



            {/* Search and filters section */}
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
                                    placeholder="Search by policy name, state, platform, or grant controls..."
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
                                        Searching: &apos;{searchQuery}&apos;
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
                                {(stateFilter.length > 0 || platformFilter.length > 0 || controlFilter.length > 0) && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* State Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">State</label>
                                    <MultiSelect
                                        options={getUniqueStates()}
                                        selected={stateFilter}
                                        onChange={setStateFilter}
                                        placeholder="Select states..."
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

                                {/* Grant Controls Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Grant Controls</label>
                                    <MultiSelect
                                        options={getUniqueControls()}
                                        selected={controlFilter}
                                        onChange={setControlFilter}
                                        placeholder="Select controls..."
                                    />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(stateFilter.length > 0 || platformFilter.length > 0 || controlFilter.length > 0) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {stateFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {getStateLabel(filter)}
                                            <button
                                                onClick={() => setStateFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {platformFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {filter}
                                            <button
                                                onClick={() => setPlatformFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    {controlFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                                            {filter}
                                            <button
                                                onClick={() => setControlFilter(prev => prev.filter(f => f !== filter))}
                                                className="ml-1 hover:text-red-600"
                                            >
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

                    {/* Policies Table */}
                    <Card className="shadow-sm w-full overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span>Conditional Access Policy Details</span>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredPolicies.length)} of {filteredPolicies.length}</span>
                                </div>
                            </CardTitle>
                            <CardDescription>
                                Overview of all Conditional Access policies and their configurations
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
                                    <DataTable
                                        data={paginatedPolicies}
                                        columns={columns}
                                    />
                                    {totalPages > 1 && (
                                        <div className="mt-4">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                totalItems={filteredPolicies.length}
                                                itemsPerPage={itemsPerPage}
                                                onPageChange={setCurrentPage}
                                                onItemsPerPageChange={setItemsPerPage}
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
                                            ? `Try adjusting your search term or clearing the current search.`
                                            : 'Try adjusting your filter criteria or clear all filters to see all policies.'
                                        }
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

            {/* Policy Details Dialog */}
            <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {selectedPolicy?.displayName || 'Policy Details'}
                        </DialogTitle>
                        <DialogDescription>
                            Conditional Access policy configuration and conditions
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
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">State</label>
                                    <Badge variant={getStateVariant(selectedPolicy.state)} className="text-xs">
                                        {getStateLabel(selectedPolicy.state)}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Modified</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(selectedPolicy.modifiedDateTime).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Conditions */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100">Conditions</h4>

                                {/* Platforms */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Platforms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPolicy.conditions?.platforms?.includePlatforms?.length > 0 ? (
                                            selectedPolicy.conditions.platforms.includePlatforms.map((platform, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {platform}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">All platforms</span>
                                        )}
                                    </div>
                                </div>

                                {/* Applications */}
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Applications</label>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-xs font-medium text-gray-500">Include:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedPolicy.conditions?.applications?.includeApplications?.length > 0 ? (
                                                    selectedPolicy.conditions.applications.includeApplications.map((app, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs font-mono">
                                                            {app}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-500">All applications</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Users and Groups */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-3">Users and Groups</label>
                                    <div className="space-y-3">
                                        {selectedPolicy.conditions?.users?.includeGroupsReadable?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-500">Include Groups:</span>
                                                <div className="space-y-1 mt-1">
                                                    {selectedPolicy.conditions.users.includeGroupsReadable.map((group: ReadableGroup, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border">
                                                            <button
                                                                onClick={() => handleGroupClick(group.id)}
                                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                            >
                                                                {group.displayName}
                                                            </button>
                                                            <span className="text-xs text-gray-500">
                        ({group.groupCount?.userCount || 0} users)
                    </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedPolicy.conditions?.users?.excludeUsersReadable?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-500">Exclude Users:</span>
                                                <div className="space-y-1 mt-1">
                                                    {selectedPolicy.conditions.users.excludeUsersReadable.map((user: ReadableUser, index: number) => (
                                                        <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                                                            <span className="text-sm font-medium">{user.displayName}</span>
                                                            <span className="text-xs text-gray-500 ml-2">({user.userPrincipalName})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Grant Controls */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                                <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-3">Grant Controls</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Controls ({selectedPolicy.grantControls?.operator}):</span>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPolicy.grantControls?.builtInControls?.map((control: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {control}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Session Controls */}
                            {selectedPolicy.sessionControls && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                    <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-3">Session Controls</h4>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto">
                                        {JSON.stringify(selectedPolicy.sessionControls, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* Technical Details */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3">Technical Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">Template ID</label>
                                        <p className="font-mono text-gray-900 dark:text-gray-100">{selectedPolicy.templateId || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">Created</label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {selectedPolicy.createdDateTime ? new Date(selectedPolicy.createdDateTime).toLocaleString() : 'N/A'}
                                        </p>
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
