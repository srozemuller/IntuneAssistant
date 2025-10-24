'use client';

import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, List, ChevronDown, ChevronRight, X } from 'lucide-react';
import { POLICY_SETTINGS_ENDPOINT, GROUP_POLICY_SETTINGS_ENDPOINT } from '@/lib/constants';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { useApiRequest } from '@/hooks/useApiRequest';
import { DataTable } from '@/components/DataTable';

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
    const { request } = useApiRequest();

    const [settings, setSettings] = useState<PolicySetting[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRowExpansion = (settingId: string) => {
        setExpandedRows(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(settingId)) {
                newExpanded.delete(settingId);
            } else {
                newExpanded.add(settingId);
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
                width: 30,
                getValue: (row) => String(row.settingName || '')
            },
            {
                key: 'settingValue',
                label: 'Setting Value',
                width: 25,
                getValue: (row) => String(row.settingValue || '')
            },
            {
                key: 'source',
                label: 'Source',
                width: 15,
                getValue: (row) => String(row.source || 'N/A')
            }
        ];

        const stats = [
            { label: 'Total Settings', value: settings.length },
            { label: 'Configuration Policies', value: settings.filter(s => s.source === 'configuration').length },
            { label: 'Group Policies', value: settings.filter(s => s.source === 'groupPolicy').length },
        ];

        return {
            data: settings,
            columns: exportColumns,
            filename: 'policy-settings',
            title: 'Policy Settings',
            description: 'Overview of all policy settings from configuration and group policies',
            stats
        };
    };

    const fetchSettings = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            const [configResponse, groupResponse] = await Promise.all([
                request<ApiResponse>(POLICY_SETTINGS_ENDPOINT, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                request<ApiResponse>(GROUP_POLICY_SETTINGS_ENDPOINT, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            const configSettings = configResponse?.data || [];
            const groupSettings = groupResponse?.data || [];

            const combinedSettings = [
                ...configSettings.map(setting => ({ ...setting, source: 'configuration' as const })),
                ...groupSettings.map(setting => ({ ...setting, source: 'groupPolicy' as const }))
            ];

            setSettings(combinedSettings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'policyName',
            label: 'Policy Name',
            width: 250,
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policyName = value ? String(value) : 'N/A';
                const source = row.source as string;

                return (
                    <div className="space-y-1">
                        <div className="font-medium text-foreground truncate">
                            {policyName}
                        </div>
                        <Badge
                            variant="outline"
                            className={`text-xs ${source === 'configuration' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}
                        >
                            {source === 'configuration' ? 'Config Policy' : 'Group Policy'}
                        </Badge>
                    </div>
                );
            }
        },
        {
            key: 'settingName',
            label: 'Setting Name',
            width: 250,
            minWidth: 200,
            render: (value: unknown) => (
                <div className="font-medium text-foreground">
                    {String(value)}
                </div>
            )
        },
        {
            key: 'settingValue',
            label: 'Setting Value',
            width: 200,
            minWidth: 150,
            render: (value: unknown) => {
                const stringValue = String(value);
                const truncatedValue = stringValue.length > 50
                    ? `${stringValue.slice(0, 50)}...`
                    : stringValue;

                return (
                    <div
                        className="text-sm text-muted-foreground"
                        title={stringValue}
                    >
                        {truncatedValue}
                    </div>
                );
            }
        },
        {
            key: 'childSettingInfo',
            label: 'Child Settings',
            width: 150,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const childSettings = value as ChildSettingInfo[] | null;
                const settingId = String(row.id || '');
                const hasChildren = childSettings && childSettings.length > 0;

                if (!hasChildren) {
                    return (
                        <span className="text-xs text-muted-foreground">No child settings</span>
                    );
                }

                const isExpanded = expandedRows.has(settingId);

                return (
                    <div className="space-y-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(settingId);
                            }}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                            {childSettings.length} child settings
                        </button>

                        {isExpanded && (
                            <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                                {childSettings.map((child, index) => (
                                    <div key={index} className="text-xs">
                                        <div className="font-medium text-gray-700">{child.name}</div>
                                        <div className="text-gray-500 truncate" title={child.value}>
                                            {child.value.length > 30 ? `${child.value.slice(0, 30)}...` : child.value}
                                        </div>
                                    </div>
                                ))}
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
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Policy Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage settings from configuration and group policies
                    </p>
                </div>
                <div className="flex gap-2">
                    {settings.length > 0 ? (
                        <>
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
                            <Button onClick={fetchSettings} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </>
                    ) : (
                        <Button onClick={fetchSettings} disabled={loading}>
                            <Settings className="h-4 w-4 mr-2" />
                            {loading ? "Loading..." : "Load Settings"}
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
                    </CardContent>
                </Card>
            )}

            {/* Welcome card when no settings are loaded */}
            {settings.length === 0 && !loading && !error && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-muted-foreground mb-6">
                                <Settings className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground mb-4">
                                Ready to view your policy settings
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Click the &quot;Load Settings&quot; button above to fetch all policy settings from your Intune environment.
                            </p>
                            <Button onClick={fetchSettings} className="flex items-center gap-2 mx-auto" size="lg">
                                <Settings className="h-5 w-5" />
                                Load Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading state */}
            {loading && settings.length === 0 && (
                <Card className="shadow-sm">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <h3 className="text-lg font-medium text-foreground mb-2">Loading Settings</h3>
                            <p className="text-muted-foreground">
                                Fetching policy settings from Intune...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* DataTable */}
            {(settings.length > 0 || loading) && !error && (
                <DataTable
                    data={settings}
                    columns={columns}
                    showPagination={true}
                    showSearch={true}
                    searchPlaceholder="Search policy settings..."
                    className="shadow-sm"
                />
            )}
        </div>
    );
}
