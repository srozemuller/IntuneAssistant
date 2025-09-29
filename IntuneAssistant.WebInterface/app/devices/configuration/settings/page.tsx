'use client';

import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Filter, Search, X, Settings, List, ChevronDown, ChevronRight } from 'lucide-react';
import { POLICY_SETTINGS_ENDPOINT, GROUP_POLICY_SETTINGS_ENDPOINT, ITEMS_PER_PAGE } from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { useApiRequest } from '@/hooks/useApiRequest';

interface ChildSettingInfo {
    '@odata.type': string;
    name: string;
    value: string;
}

interface PolicySetting extends Record<string, unknown> {
    id: string | null;
    policyId: string | null;
    policyName: string;
    settingName: string;
    settingValue: string;
    childSettingInfo: ChildSettingInfo[] | null;
    settingDefinitions: unknown | null;
    source?: 'configuration' | 'groupPolicy';
}

interface ApiResponse {
    status: string;
    message: string;
    details: string[];
    data: PolicySetting[];
}

export default function PolicySettingsPage() {
    const { instance, accounts } = useMsal();
    const apiRequestWithConsent = useApiRequest();

    const [settings, setSettings] = useState<PolicySetting[]>([]);
    const [filteredSettings, setFilteredSettings] = useState<PolicySetting[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [policyNameFilter, setPolicyNameFilter] = useState<string[]>([]);
    const [sourceFilter, setSourceFilter] = useState<string[]>([]);
    const [settingValueFilter, setSettingValueFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    // Pagination calculations
    const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSettings = filteredSettings.slice(startIndex, endIndex);

    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    useEffect(() => {
        setCurrentPage(1);
    }, [policyNameFilter, sourceFilter, settingValueFilter, searchQuery]);


    useEffect(() => {
        // Only initialize expanded rows when page changes, not when data changes
        if (paginatedSettings.length > 0) {
            setExpandedRows(new Set(Array.from({ length: paginatedSettings.length }, (_, i) => i)));
        }
    }, [currentPage, itemsPerPage]);

    const toggleRowExpansion = (index: number) => {
        setExpandedRows(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(index)) {
                newExpanded.delete(index);
            } else {
                newExpanded.add(index);
            }
            return newExpanded;
        });
    };

    const prepareExportData = (): ExportData => {
        const exportColumns: ExportColumn[] = [
            {
                key: 'policyName',
                label: 'Policy Name',
                width: 30,
                getValue: (row) => String(row.policyName || '')
            },
            {
                key: 'settingName',
                label: 'Setting Name',
                width: 25,
                getValue: (row) => String(row.settingName || '')
            },
            {
                key: 'settingValue',
                label: 'Setting Value',
                width: 20,
                getValue: (row) => String(row.settingValue || '')
            },
            {
                key: 'source',
                label: 'Source',
                width: 15,
                getValue: (row) => row.source === 'groupPolicy' ? 'Group Policy' : 'Configuration Policy'
            },
            {
                key: 'childSettings',
                label: 'Child Settings Count',
                width: 15,
                getValue: (row) => String((row.childSettingInfo as ChildSettingInfo[])?.length || 0)
            }
        ];

        const stats = [
            { label: 'Total Settings', value: filteredSettings.length },
            { label: 'Configuration Policies', value: filteredSettings.filter(s => s.source === 'configuration').length },
            { label: 'Group Policies', value: filteredSettings.filter(s => s.source === 'groupPolicy').length },
            { label: 'Unique Policies', value: new Set(filteredSettings.map(s => s.policyName)).size },
            { label: 'With Child Settings', value: filteredSettings.filter(s => s.childSettingInfo && s.childSettingInfo.length > 0).length }
        ];

        return {
            data: filteredSettings,
            columns: exportColumns,
            filename: 'policy-settings',
            title: 'Policy Settings',
            description: 'Overview of all configuration and group policy settings',
            stats
        };
    };

    const fetchSettings = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Fetch both endpoints simultaneously
            const [configData, groupData] = await Promise.all([
                apiRequestWithConsent<ApiResponse>(POLICY_SETTINGS_ENDPOINT, {}, response.accessToken),
                apiRequestWithConsent<ApiResponse>(GROUP_POLICY_SETTINGS_ENDPOINT, {}, response.accessToken)
            ]);

            if (!configData || !groupData) {
                return;
            }

            // Combine and mark source
            const configSettings = (configData.data || []).map(setting => ({
                ...setting,
                source: 'configuration' as const
            }));

            const groupSettings = (groupData.data || []).map(setting => ({
                ...setting,
                source: 'groupPolicy' as const
            }));

            const combinedSettings = [...configSettings, ...groupSettings];

            setSettings(combinedSettings);
            setFilteredSettings(combinedSettings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    // Filter and search function
    useEffect(() => {
        let filtered = settings;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(setting => {
                // Search in main setting fields
                const mainMatch =
                    setting.policyName?.toLowerCase().includes(query) ||
                    setting.settingName?.toLowerCase().includes(query) ||
                    setting.settingValue?.toLowerCase().includes(query);

                // Search in child settings
                const childMatch = setting.childSettingInfo?.some(child =>
                    child.name?.toLowerCase().includes(query) ||
                    child.value?.toLowerCase().includes(query) ||
                    child['@odata.type']?.toLowerCase().includes(query)
                ) || false;

                return mainMatch || childMatch;
            });
        }

        // Apply dropdown filters
        if (policyNameFilter.length > 0) {
            filtered = filtered.filter(setting => policyNameFilter.includes(setting.policyName));
        }

        if (sourceFilter.length > 0) {
            filtered = filtered.filter(setting => sourceFilter.includes(setting.source || ''));
        }

        if (settingValueFilter.length > 0) {
            filtered = filtered.filter(setting => settingValueFilter.includes(setting.settingValue));
        }

        setFilteredSettings(filtered);
    }, [settings, policyNameFilter, sourceFilter, settingValueFilter, searchQuery]);

    // Get unique values for filters
    const getUniquePolicyNames = (): Option[] => {
        const names = new Set<string>();
        settings.forEach(setting => {
            names.add(setting.policyName);
        });
        return Array.from(names).sort().map(name => ({ label: name, value: name }));
    };

    const getUniqueSources = (): Option[] => [
        { label: 'Configuration Policy', value: 'configuration' },
        { label: 'Group Policy', value: 'groupPolicy' }
    ];

    const getUniqueSettingValues = (): Option[] => {
        const values = new Set<string>();
        settings.forEach(setting => {
            if (setting.settingValue && setting.settingValue !== 'Not Configured') {
                values.add(setting.settingValue);
            }
        });
        return Array.from(values).sort().slice(0, 20).map(value => ({
            label: value.length > 30 ? value.substring(0, 30) + '...' : value,
            value: value
        }));
    };

    const clearFilters = () => {
        setPolicyNameFilter([]);
        setSourceFilter([]);
        setSettingValueFilter([]);
        setSearchQuery('');
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const columns = [
        {
            key: 'policyName' as string,
            label: 'Policy Name',
            width: 200,
            minWidth: 180,
            render: (value: unknown) => {
                const policyName = value ? String(value) : 'N/A';
                return (
                    <span className="font-medium text-sm truncate block w-full" title={policyName}>
                    {policyName}
                </span>
                );
            }
        },
        {
            key: 'settingName' as string,
            label: 'Setting Name',
            width: 180,
            minWidth: 150,
            render: (value: unknown) => {
                const settingName = value ? String(value) : 'N/A';
                return (
                    <span className="font-medium text-sm truncate block w-full" title={settingName}>
                    {settingName}
                </span>
                );
            }
        },
        {
            key: 'settingValue' as string,
            label: 'Setting Value',
            width: 130,
            minWidth: 120,
            render: (value: unknown) => {
                const settingValue = String(value);
                const isConfigured = settingValue !== 'Not Configured';

                return (
                    <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isConfigured
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                        {settingValue}
                    </span>
                    </div>
                );
            }
        },
        {
            key: 'source' as string,
            label: 'Source',
            width: 120,
            minWidth: 100,
            render: (value: unknown) => {
                const source = String(value);
                return (
                    <Badge variant={source === 'groupPolicy' ? 'default' : 'secondary'} className="text-xs whitespace-nowrap">
                        {source === 'groupPolicy' ? 'Group Policy' : 'Configuration Policy'}
                    </Badge>
                );
            }
        },
        {
            key: 'childSettingInfo' as string,
            label: 'Child Settings',
            width: 350,
            minWidth: 300,
            render: (value: unknown, row: Record<string, unknown>, index: number) => {
                const childSettings = value as ChildSettingInfo[] | null;
                if (!childSettings || childSettings.length === 0) {
                    return (
                        <span className="text-sm text-gray-400">No child settings</span>
                    );
                }

                const isExpanded = expandedRows.has(index);

                return (
                    <div className="space-y-2">
                        {/* Header with collapse toggle */}
                        <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {childSettings.length} child setting{childSettings.length > 1 ? 's' : ''}
                    </span>
                            <button
                                onClick={() => toggleRowExpansion(index)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                title={isExpanded ? 'Collapse child settings' : 'Expand child settings'}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>

                        {/* Child settings content */}
                        {isExpanded && (
                            <div className="space-y-1">
                                {childSettings.map((child, childIndex) => (
                                    <div key={childIndex} className="flex flex-col gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs border">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={child.name}>
                                            {child.name}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-300 truncate" title={child.value}>
                                            <span className="font-medium">Value:</span> {child.value}
                                        </div>
                                        <Badge variant="outline" className="text-xs w-fit">
                                            {child['@odata.type']?.replace('#microsoft.graph.deviceManagementConfiguration', '').replace('SettingInstance', '') || 'Unknown'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Collapsed preview */}
                        {!isExpanded && (
                            <div className="text-xs text-gray-500">
                                Click to expand and view child settings
                            </div>
                        )}
                    </div>
                );
            }
        }

    ];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600">Configuration Policies Settings Overview</h1>
                    <p className="text-gray-600 mt-2">
                        View and manage configuration and group policy settings
                    </p>
                </div>
                <div className="flex gap-2">
                    {settings.length > 0 ? (
                        <>
                            <Button onClick={fetchSettings} variant="outline" size="sm" disabled={loading}>
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
                            onClick={fetchSettings}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Load Settings
                        </Button>
                    )}
                </div>
            </div>

            {/* Show welcome card when no settings are loaded and not loading */}
            {settings.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Settings className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-4">
                                Ready to view your policy settings
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Click the &quot;Load Settings&quot; button above to fetch all configuration and group policy settings from your Intune environment.
                            </p>
                            <Button onClick={fetchSettings} className="flex items-center gap-2 mx-auto" size="lg">
                                <List className="h-5 w-5" />
                                Load Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Show loading state */}
            {loading && settings.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Loading Policy Settings
                            </h3>
                            <p className="text-gray-600">
                                Fetching settings from configuration and group policies...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Only show search, filters, and table when settings are loaded or loading */}
            {(settings.length > 0 || loading) && (
                <>
                    {/* Search Section */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search
                            </CardTitle>
                            <CardDescription>
                                Search across policy names, setting names, values, and child settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search by policy name, setting name, setting value, or child settings..."
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
                                        Search: &quot;{searchQuery}&quot;
                                        <X className="h-3 w-3 cursor-pointer" onClick={clearSearch} />
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
                                {(policyNameFilter.length > 0 || sourceFilter.length > 0 || settingValueFilter.length > 0) && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Policy Name Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Policy Name</label>
                                    <MultiSelect
                                        options={getUniquePolicyNames()}
                                        selected={policyNameFilter}
                                        onChange={setPolicyNameFilter}
                                        placeholder="Select policies..."
                                    />
                                </div>

                                {/* Source Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source</label>
                                    <MultiSelect
                                        options={getUniqueSources()}
                                        selected={sourceFilter}
                                        onChange={setSourceFilter}
                                        placeholder="Select source..."
                                    />
                                </div>

                                {/* Setting Value Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Common Values</label>
                                    <MultiSelect
                                        options={getUniqueSettingValues()}
                                        selected={settingValueFilter}
                                        onChange={setSettingValueFilter}
                                        placeholder="Select values..."
                                    />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(policyNameFilter.length > 0 || sourceFilter.length > 0 || settingValueFilter.length > 0) && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    {policyNameFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="text-xs">
                                            Policy: {filter}
                                        </Badge>
                                    ))}
                                    {sourceFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="text-xs">
                                            Source: {filter === 'groupPolicy' ? 'Group Policy' : 'Config Policy'}
                                        </Badge>
                                    ))}
                                    {settingValueFilter.map(filter => (
                                        <Badge key={filter} variant="secondary" className="text-xs">
                                            Value: {filter.length > 20 ? filter.substring(0, 20) + '...' : filter}
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

                    {/* Policy Settings Table */}
                    <Card className="shadow-sm w-full overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span>Policy Settings Details</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const currentPageRowCount = paginatedSettings.length;
                                            const allCurrentPageExpanded = Array.from({ length: currentPageRowCount }, (_, i) => i)
                                                .every(i => expandedRows.has(i));

                                            if (allCurrentPageExpanded) {
                                                // Collapse all rows on current page
                                                setExpandedRows(prev => {
                                                    const newExpanded = new Set(prev);
                                                    for (let i = 0; i < currentPageRowCount; i++) {
                                                        newExpanded.delete(i);
                                                    }
                                                    return newExpanded;
                                                });
                                            } else {
                                                // Expand all rows on current page
                                                setExpandedRows(prev => {
                                                    const newExpanded = new Set(prev);
                                                    for (let i = 0; i < currentPageRowCount; i++) {
                                                        newExpanded.add(i);
                                                    }
                                                    return newExpanded;
                                                });
                                            }
                                        }}
                                    >
                                        {Array.from({ length: paginatedSettings.length }, (_, i) => i).every(i => expandedRows.has(i)) ? 'Collapse All' : 'Expand All'}
                                    </Button>

                                    <span className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredSettings.length)} of {filteredSettings.length} settings
        </span>
                                </div>
                            </CardTitle>

                            <CardDescription>
                                Overview of all configuration and group policy settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-16">
                                    <RefreshCw className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-4" />
                                    <p className="text-gray-600">Loading settings...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            {columns.map((column) => (
                                                <th
                                                    key={column.key}
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                                    style={{ width: column.width, minWidth: column.minWidth }}
                                                >
                                                    {column.label}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedSettings.map((setting, index) => (
                                            <tr key={`${setting.policyName}-${setting.settingName}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                {columns.map((column) => (
                                                    <td key={column.key} className="px-4 py-3 text-sm align-top">
                                                        {column.render ? column.render(setting[column.key], setting, index) : String(setting[column.key] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                                itemsPerPage={itemsPerPage}
                                                totalItems={filteredSettings.length}
                                                onItemsPerPageChange={setItemsPerPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Filtered empty state */}
                    {filteredSettings.length === 0 && !loading && !error && settings.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <Search className="h-12 w-12 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No settings match your filters
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Try adjusting your search terms or clearing some filters to see more results.
                                    </p>
                                    <Button onClick={clearFilters} variant="outline">
                                        Clear All Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
