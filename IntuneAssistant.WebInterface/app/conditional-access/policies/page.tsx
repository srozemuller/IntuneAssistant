'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Filter, Search, X, Users, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { CA_POLICIES_ENDPOINT, ITEMS_PER_PAGE } from '@/lib/constants';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';
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
        applicationFilter: unknown | null;
    };
    users: {
        includeUsers: string[];
        includeUsersReadable: ReadableUser[];
        excludeUsers: string[];
        excludeUsersReadable: ReadableUser[];
        includeGroups: string[];
        includeGroupsReadable: ReadableGroup[];
        excludeGroups: string[];
        excludeGroupsReadable: ReadableGroup[];
        includeRoles: string[];
        excludeRoles: string[];
    };
    locations: {
        includeLocations: string[];
        excludeLocations: string[];
    } | null;
    times: unknown | null;
    deviceStates: unknown | null;
    devices: unknown | null;
    clientApplications: unknown | null;
}

interface SessionControls {
    disableResilienceDefaults: boolean | null;
    applicationEnforcedRestrictions: Record<string, unknown> | null;
    cloudAppSecurity: Record<string, unknown> | null;
    persistentBrowser: Record<string, unknown> | null;
    continuousAccessEvaluation: Record<string, unknown> | null;
    secureSignInSession: Record<string, unknown> | null;
    signInFrequency: {
        value: number;
        type: string;
        authenticationType: string;
        frequencyInterval: string;
        isEnabled: boolean;
    } | null;
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
    sessionControls: SessionControls | null;
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
    const [userGroupFilter, setUserGroupFilter] = useState<string>(''); // Filter by user/group name
    const [exclusionFilter, setExclusionFilter] = useState<boolean>(false); // Show only policies with exclusions
    const [showIncluded, setShowIncluded] = useState<boolean>(true); // Show policies with inclusions
    const [showExcluded, setShowExcluded] = useState<boolean>(true); // Show policies with exclusions
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // Track expanded rows

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
    }, [stateFilter, platformFilter, controlFilter, searchQuery, userGroupFilter, exclusionFilter, showIncluded, showExcluded]);

    const handlePolicyClick = (policy: CAPolicy) => {
        setSelectedPolicy(policy);
        setIsPolicyDialogOpen(true);
    };

    const toggleRowExpansion = (policyId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(policyId)) {
                newSet.delete(policyId);
            } else {
                newSet.add(policyId);
            }
            return newSet;
        });
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
        setError(null);

        try {
            const response = await request<ApiResponse>(CA_POLICIES_ENDPOINT);

            // Unwrap ApiResponseWithCorrelation → response.data is the ApiResponse envelope
            if (response && response.data) {
                const envelope = response.data;

                if (envelope.status === 'Success' && Array.isArray(envelope.data)) {
                    setPolicies(envelope.data);
                    if (envelope.data.length === 0) {
                        setError(null); // No error for empty but successful response
                    }
                } else {
                    setError('Invalid response format received');
                }
            } else {
                setError('No response received from API');
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

        // Apply user/group filter - search in both included and excluded users/groups
        if (userGroupFilter.trim()) {
            const query = userGroupFilter.toLowerCase().trim();
            filtered = filtered.filter(policy => {
                const includeUsers = policy.conditions?.users?.includeUsersReadable || [];
                const excludeUsers = policy.conditions?.users?.excludeUsersReadable || [];
                const includeGroups = policy.conditions?.users?.includeGroupsReadable || [];
                const excludeGroups = policy.conditions?.users?.excludeGroupsReadable || [];

                return (
                    includeUsers.some((u: ReadableUser) =>
                        u.displayName?.toLowerCase().includes(query) ||
                        u.userPrincipalName?.toLowerCase().includes(query)
                    ) ||
                    excludeUsers.some((u: ReadableUser) =>
                        u.displayName?.toLowerCase().includes(query) ||
                        u.userPrincipalName?.toLowerCase().includes(query)
                    ) ||
                    includeGroups.some((g: ReadableGroup) =>
                        g.displayName?.toLowerCase().includes(query)
                    ) ||
                    excludeGroups.some((g: ReadableGroup) =>
                        g.displayName?.toLowerCase().includes(query)
                    )
                );
            });
        }

        // Apply exclusion filter - show only policies with exclusions
        if (exclusionFilter) {
            filtered = filtered.filter(policy => {
                const excludeUsers = policy.conditions?.users?.excludeUsers?.length || 0;
                const excludeGroups = policy.conditions?.users?.excludeGroups?.length || 0;
                return excludeUsers > 0 || excludeGroups > 0;
            });
        }

        // Apply include/exclude resource filters
        if (!showIncluded || !showExcluded) {
            filtered = filtered.filter(policy => {
                const hasIncludes = (policy.conditions?.users?.includeUsers?.length || 0) > 0 ||
                                   (policy.conditions?.users?.includeGroups?.length || 0) > 0;
                const hasExcludes = (policy.conditions?.users?.excludeUsers?.length || 0) > 0 ||
                                   (policy.conditions?.users?.excludeGroups?.length || 0) > 0;

                if (!showIncluded && !showExcluded) {
                    return false; // If both are off, show nothing
                }
                if (!showIncluded) {
                    return hasExcludes; // Only show policies with exclusions
                }
                if (!showExcluded) {
                    return hasIncludes; // Only show policies with inclusions
                }
                return true;
            });
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
    }, [policies, stateFilter, platformFilter, controlFilter, searchQuery, userGroupFilter, exclusionFilter, showIncluded, showExcluded]);
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
        setUserGroupFilter('');
        setExclusionFilter(false);
        setShowIncluded(true);
        setShowExcluded(true);
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
            width: 300,
            minWidth: 250,
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
            width: 130,
            minWidth: 130,
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
            key: 'platforms' as string,
            label: 'Platforms',
            width: 160,
            minWidth: 140,
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
            width: 200,
            minWidth: 180,
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
            key: 'targetUsers' as string,
            label: 'Target Users/Groups',
            width: 280,
            minWidth: 280,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policy = row as CAPolicy;
                const conditions = policy.conditions;
                const includeUsers = conditions?.users?.includeUsers?.length || 0;
                const includeGroups = conditions?.users?.includeGroups?.length || 0;
                const excludeUsers = conditions?.users?.excludeUsers?.length || 0;
                const excludeGroups = conditions?.users?.excludeGroups?.length || 0;
                const includeUsersReadable = conditions?.users?.includeUsersReadable || [];
                const includeGroupsReadable = conditions?.users?.includeGroupsReadable || [];
                const excludeUsersReadable = conditions?.users?.excludeUsersReadable || [];
                const excludeGroupsReadable = conditions?.users?.excludeGroupsReadable || [];

                const hasAllUsers = conditions?.users?.includeUsers?.includes('All');
                const isExpanded = expandedRows.has(policy.id);

                const totalInclude = includeUsers + includeGroups;
                const totalExclude = excludeUsers + excludeGroups;
                const showExpandButton = totalInclude > 1 || totalExclude > 1;

                return (
                    <div className="w-full" style={{ maxWidth: '280px' }}>
                        <div className={`space-y-2 ${isExpanded ? 'max-h-64 overflow-y-auto pr-2' : ''}`}>
                            {/* Include Section */}
                            {(hasAllUsers || totalInclude > 0) && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Include</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {hasAllUsers ? (
                                            <Badge className="text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 border-0">
                                                All Users
                                            </Badge>
                                        ) : (
                                            <>
                                                {/* Show included users */}
                                                {(isExpanded ? includeUsersReadable : includeUsersReadable.slice(0, 1)).map((user: ReadableUser, index: number) => (
                                                    <Badge
                                                        key={`include-user-${index}`}
                                                        className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 border-0 max-w-full truncate"
                                                        title={user.displayName}
                                                    >
                                                        {user.displayName}
                                                    </Badge>
                                                ))}
                                                {/* Show included groups */}
                                                {(isExpanded ? includeGroupsReadable : includeGroupsReadable.slice(0, 1)).map((group: ReadableGroup, index: number) => (
                                                    <Badge
                                                        key={`include-group-${index}`}
                                                        className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 border-0 cursor-pointer max-w-full truncate"
                                                        onClick={() => handleGroupClick(group.id)}
                                                        title={group.displayName}
                                                    >
                                                        {group.displayName}
                                                    </Badge>
                                                ))}
                                                {/* Show count if more and not expanded */}
                                                {!isExpanded && totalInclude > 1 && (
                                                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                                        +{totalInclude - 1} more
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Exclude Section */}
                            {totalExclude > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Exclude</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {/* Show excluded users */}
                                        {(isExpanded ? excludeUsersReadable : excludeUsersReadable.slice(0, 1)).map((user: ReadableUser, index: number) => (
                                            <Badge
                                                key={`exclude-user-${index}`}
                                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 border-0 max-w-full truncate"
                                                title={user.displayName}
                                            >
                                                {user.displayName}
                                            </Badge>
                                        ))}
                                        {/* Show excluded groups */}
                                        {(isExpanded ? excludeGroupsReadable : excludeGroupsReadable.slice(0, 1)).map((group: ReadableGroup, index: number) => (
                                            <Badge
                                                key={`exclude-group-${index}`}
                                                className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 border-0 cursor-pointer max-w-full truncate"
                                                onClick={() => handleGroupClick(group.id)}
                                                title={group.displayName}
                                            >
                                                {group.displayName}
                                            </Badge>
                                        ))}
                                        {/* Show count if more and not expanded */}
                                        {!isExpanded && totalExclude > 1 && (
                                            <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                                +{totalExclude - 1} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expand/Collapse Button */}
                        {showExpandButton && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpansion(policy.id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 mt-1"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3" />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3" />
                                        Show all ({totalInclude + totalExclude} total)
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'modifiedDateTime' as string,
            label: 'Modified',
            width: 150,
            minWidth: 140,
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
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Conditional Access Policies</h1>
                    <p className="text-muted-foreground mt-2">
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
                                exportOptions={[
                                    {
                                        label: "Standard Export",
                                        data: prepareExportData(),
                                        formats: ['csv', 'pdf', 'html'] // All formats (optional, defaults to all)
                                    }
                                ]}
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
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Shield className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground mb-4">
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
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-yellow-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
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
                    {/* Legend Card */}
                    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4" />
                                Badge Legend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-600 dark:text-gray-400">Resource Types</p>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">User</Badge>
                                        <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-0">Group</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Same colors for included and excluded</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-600 dark:text-gray-400">Special</p>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge className="text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-0">All Users</Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-600 dark:text-gray-400">Actions</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        • Click <strong>group badges</strong> to view details<br/>
                                        • Click <strong>Show all</strong> to expand full list
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search Section */}
                    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search & Quick Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Main Search */}
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Search Policies</label>
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
                            </div>

                            {/* User/Group Search */}
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Search by User or Group Name</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search policies by included or excluded user/group..."
                                        value={userGroupFilter}
                                        onChange={(e) => setUserGroupFilter(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {userGroupFilter && (
                                        <button
                                            onClick={() => setUserGroupFilter('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Resource Type Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                                    <input
                                        type="checkbox"
                                        id="showIncluded"
                                        checked={showIncluded}
                                        onChange={(e) => setShowIncluded(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="showIncluded" className="text-sm font-medium cursor-pointer">
                                        Show policies with included resources
                                    </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                                    <input
                                        type="checkbox"
                                        id="showExcluded"
                                        checked={showExcluded}
                                        onChange={(e) => setShowExcluded(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="showExcluded" className="text-sm font-medium cursor-pointer">
                                        Show policies with excluded resources
                                    </label>
                                </div>
                            </div>

                            {/* Exclusion Toggle */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                                <input
                                    type="checkbox"
                                    id="exclusionFilter"
                                    checked={exclusionFilter}
                                    onChange={(e) => setExclusionFilter(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="exclusionFilter" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    Show only policies with exclusions
                                </label>
                            </div>

                            {/* Active Search/Filters Display */}
                            {(searchQuery || userGroupFilter || exclusionFilter || !showIncluded || !showExcluded) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                                    {searchQuery && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Search className="h-3 w-3" />
                                            Search: &apos;{searchQuery}&apos;
                                            <button onClick={clearSearch} className="ml-1 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {userGroupFilter && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            User/Group: &apos;{userGroupFilter}&apos;
                                            <button onClick={() => setUserGroupFilter('')} className="ml-1 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {!showIncluded && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <span>Included Hidden</span>
                                            <button onClick={() => setShowIncluded(true)} className="ml-1 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {!showExcluded && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <span>Excluded Hidden</span>
                                            <button onClick={() => setShowExcluded(true)} className="ml-1 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {exclusionFilter && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            With Exclusions
                                            <button onClick={() => setExclusionFilter(false)} className="ml-1 hover:text-red-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Filters Section */}
                    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
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
                    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 w-full">
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
                                    <RefreshCw className="h-6 w-6 animate-spin text-yellow-500" />
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
                <DialogContent className="!w-[90vw] !max-w-[90vw] h-[85vh] max-h-none overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {selectedPolicy?.displayName || 'Policy Details'}
                        </DialogTitle>
                        <DialogDescription>
                            Comprehensive view of Conditional Access policy configuration and conditions
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
                                    <div className="mt-1">
                                        <Badge variant={getStateVariant(selectedPolicy.state)} className="text-xs">
                                            {getStateLabel(selectedPolicy.state)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Modified</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(selectedPolicy.modifiedDateTime).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Conditions Section */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100 border-b pb-2">Conditions</h4>

                                {/* Risk Levels */}
                                {(selectedPolicy.conditions?.userRiskLevels?.length > 0 || selectedPolicy.conditions?.signInRiskLevels?.length > 0) && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100 block mb-2">Risk Levels</label>
                                        <div className="space-y-2">
                                            {selectedPolicy.conditions.userRiskLevels?.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">User Risk:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {selectedPolicy.conditions.userRiskLevels.map((level, index) => (
                                                            <Badge key={index} variant="destructive" className="text-xs">
                                                                {level}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedPolicy.conditions.signInRiskLevels?.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Sign-in Risk:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {selectedPolicy.conditions.signInRiskLevels.map((level, index) => (
                                                            <Badge key={index} variant="destructive" className="text-xs">
                                                                {level}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Platforms */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 block mb-2">Platforms</label>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Include:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedPolicy.conditions?.platforms?.includePlatforms?.length > 0 ? (
                                                    selectedPolicy.conditions.platforms.includePlatforms.map((platform, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs bg-blue-100 dark:bg-blue-800">
                                                            {platform}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-500">All platforms</span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedPolicy.conditions?.platforms?.excludePlatforms?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Exclude:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedPolicy.conditions.platforms.excludePlatforms.map((platform, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                                                            {platform}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Client App Types */}
                                {selectedPolicy.conditions?.clientAppTypes?.length > 0 && (
                                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-700">
                                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100 block mb-2">Client App Types</label>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPolicy.conditions.clientAppTypes.map((type, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Locations */}
                                {selectedPolicy.conditions?.locations && (
                                    <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-700">
                                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100 block mb-2">Locations</label>
                                        <div className="space-y-2">
                                            {selectedPolicy.conditions.locations.includeLocations?.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Include:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(selectedPolicy.conditions.locations.includeLocations as string[]).map((location, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs bg-teal-100 dark:bg-teal-800">
                                                                {location}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedPolicy.conditions.locations.excludeLocations?.length > 0 && (
                                                <div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Exclude:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(selectedPolicy.conditions.locations.excludeLocations as string[]).map((location, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {location}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Applications */}
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 block mb-2">Applications</label>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Include:</span>
                                            <div className="flex flex-wrap gap-1 mt-1 max-h-32 overflow-y-auto">
                                                {selectedPolicy.conditions?.applications?.includeApplications?.length > 0 ? (
                                                    <>
                                                        {(selectedPolicy.conditions.applications.includeApplications as string[]).map((app, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs font-mono break-all">
                                                                {app}
                                                            </Badge>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-500">All applications</span>
                                                )}
                                            </div>
                                        </div>
                                        {selectedPolicy.conditions?.applications?.excludeApplications && selectedPolicy.conditions.applications.excludeApplications.length > 0 ? (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Exclude:</span>
                                                <div className="flex flex-wrap gap-1 mt-1 max-h-32 overflow-y-auto">
                                                    {(selectedPolicy.conditions.applications.excludeApplications as string[]).map((app, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs font-mono break-all bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                                                            {app}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Users and Groups */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 block mb-3">Users and Groups</label>
                                    <div className="space-y-3">
                                        {/* Include Users */}
                                        {selectedPolicy.conditions?.users?.includeUsersReadable?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Include Users:</span>
                                                <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                                                    {selectedPolicy.conditions.users.includeUsersReadable.map((user: ReadableUser, index: number) => (
                                                        <div key={index} className="p-2 bg-white dark:bg-gray-700 rounded border flex items-center gap-2">
                                                            <span className="text-xs">👤</span>
                                                            <div>
                                                                <span className="text-sm font-medium">{user.displayName}</span>
                                                                <span className="text-xs text-gray-500 ml-2">({user.userPrincipalName || 'N/A'})</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Include Groups */}
                                        {selectedPolicy.conditions?.users?.includeGroupsReadable?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Include Groups:</span>
                                                <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                                                    {selectedPolicy.conditions.users.includeGroupsReadable.map((group: ReadableGroup, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border">
                                                            <span className="text-xs">👥</span>
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
                                        {/* Exclude Users */}
                                        {selectedPolicy.conditions?.users?.excludeUsersReadable?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Exclude Users:</span>
                                                <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                                                    {selectedPolicy.conditions.users.excludeUsersReadable.map((user: ReadableUser, index: number) => (
                                                        <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700 flex items-center gap-2">
                                                            <span className="text-xs">👤</span>
                                                            <div>
                                                                <span className="text-sm font-medium">{user.displayName}</span>
                                                                <span className="text-xs text-gray-500 ml-2">({user.userPrincipalName})</span>
                                                                {!user.accountEnabled && (
                                                                    <Badge variant="secondary" className="ml-2 text-xs">Disabled</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Exclude Groups */}
                                        {selectedPolicy.conditions?.users?.excludeGroupsReadable?.length > 0 && (
                                            <div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Exclude Groups:</span>
                                                <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                                                    {selectedPolicy.conditions.users.excludeGroupsReadable.map((group: ReadableGroup, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                                                            <span className="text-xs">👥</span>
                                                            <button
                                                                onClick={() => handleGroupClick(group.id)}
                                                                className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium"
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
                                    </div>
                                </div>
                            </div>

                            {/* Grant Controls */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                                <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-3 border-b pb-2">Grant Controls</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium">Operator:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {selectedPolicy.grantControls?.operator || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium">Built-in Controls:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedPolicy.grantControls?.builtInControls?.length > 0 ? (
                                                selectedPolicy.grantControls.builtInControls.map((control: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {control}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">None</span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedPolicy.grantControls?.authenticationStrength && (
                                        <div>
                                            <span className="text-sm font-medium">Authentication Strength:</span>
                                            <div className="mt-1 text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                                                <pre>{JSON.stringify(selectedPolicy.grantControls.authenticationStrength, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Session Controls */}
                            {selectedPolicy.sessionControls && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                    <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-3 border-b pb-2">Session Controls</h4>
                                    <div className="space-y-3">
                                        {/* Sign-in Frequency */}
                                        {selectedPolicy.sessionControls.signInFrequency?.isEnabled ? (
                                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Sign-in Frequency</span>
                                                <div className="mt-2 space-y-1 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {selectedPolicy.sessionControls.signInFrequency.value} {selectedPolicy.sessionControls.signInFrequency.type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400">Authentication Type:</span>
                                                        <span className="text-gray-900 dark:text-gray-100">{selectedPolicy.sessionControls.signInFrequency.authenticationType}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 dark:text-gray-400">Interval:</span>
                                                        <span className="text-gray-900 dark:text-gray-100">{selectedPolicy.sessionControls.signInFrequency.frequencyInterval}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                        {/* Persistent Browser */}
                                        {selectedPolicy.sessionControls.persistentBrowser ? (
                                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                                <span className="text-sm font-medium">Persistent Browser</span>
                                                <pre className="text-xs mt-2 text-gray-900 dark:text-gray-100">
                                                    {JSON.stringify(selectedPolicy.sessionControls.persistentBrowser, null, 2)}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {/* Cloud App Security */}
                                        {selectedPolicy.sessionControls.cloudAppSecurity ? (
                                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                                <span className="text-sm font-medium">Cloud App Security</span>
                                                <pre className="text-xs mt-2 text-gray-900 dark:text-gray-100">
                                                    {JSON.stringify(selectedPolicy.sessionControls.cloudAppSecurity, null, 2)}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {/* Application Enforced Restrictions */}
                                        {selectedPolicy.sessionControls.applicationEnforcedRestrictions ? (
                                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                                <span className="text-sm font-medium">Application Enforced Restrictions</span>
                                                <pre className="text-xs mt-2 text-gray-900 dark:text-gray-100">
                                                    {JSON.stringify(selectedPolicy.sessionControls.applicationEnforcedRestrictions, null, 2)}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {/* Continuous Access Evaluation */}
                                        {selectedPolicy.sessionControls.continuousAccessEvaluation ? (
                                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                                <span className="text-sm font-medium">Continuous Access Evaluation</span>
                                                <pre className="text-xs mt-2 text-gray-900 dark:text-gray-100">
                                                    {JSON.stringify(selectedPolicy.sessionControls.continuousAccessEvaluation, null, 2)}
                                                </pre>
                                            </div>
                                        ) : null}
                                        {/* Disable Resilience Defaults */}
                                        {selectedPolicy.sessionControls.disableResilienceDefaults !== null ? (
                                            <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">Disable Resilience Defaults:</span>
                                                    <Badge variant={selectedPolicy.sessionControls.disableResilienceDefaults ? "destructive" : "secondary"} className="text-xs">
                                                        {selectedPolicy.sessionControls.disableResilienceDefaults ? 'Yes' : 'No'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            {/* Technical Details */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-3 border-b pb-2">Technical Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="font-medium text-gray-600 dark:text-gray-400">Template ID</label>
                                        <p className="font-mono text-gray-900 dark:text-gray-100 break-all">{selectedPolicy.templateId || 'N/A'}</p>
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
