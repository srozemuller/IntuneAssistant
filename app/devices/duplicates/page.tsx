'use client';

import React, { useState, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/DataTable';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import {
    Copy,
    RefreshCw,
    X,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    Filter,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { DEVICES_DUPLICATES_ENDPOINT } from '@/lib/constants';
import { DeviceDuplicateGroupDialog, DeviceDuplicate } from '@/components/DeviceDuplicateGroupDialog';

const MATCHED_ON_LABELS: Record<string, string> = {
    SerialNumber: 'Serial Number',
    WiFiMacAddress: 'Wi-Fi MAC Address',
};

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export default function DeviceDuplicatesPage() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();

    const [devices, setDevices] = useState<DeviceDuplicate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duplicatesOnly, setDuplicatesOnly] = useState(true);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [matchedOnFilter, setMatchedOnFilter] = useState<string[]>([]);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    const fetchDuplicates = async () => {
        if (!accounts.length) return;

        setLoading(true);
        setError(null);

        try {
            const response = await request<ApiResponse<DeviceDuplicate[]>>(DEVICES_DUPLICATES_ENDPOINT);

            if (!response?.data?.data) {
                throw new Error('No response received from API');
            }

            setDevices(response.data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to scan for duplicate devices');
        } finally {
            setLoading(false);
        }
    };

    const openGroup = (groupId: string) => {
        setSelectedGroupId(groupId);
        setIsGroupDialogOpen(true);
    };

    const handleGroupDialogClosed = () => {
        setSelectedGroupId(null);
    };

    const duplicateDevices = devices.filter(d => d.isDuplicate);
    const duplicateGroupCount = new Set(duplicateDevices.map(d => d.duplicateGroupId)).size;

    const platformOptions = useMemo((): Option[] => {
        const platforms = new Set(devices.map(d => d.operatingSystem).filter(Boolean));
        return Array.from(platforms).sort().map(platform => ({ label: platform, value: platform }));
    }, [devices]);

    const matchedOnOptions = useMemo((): Option[] => {
        const fields = new Set(duplicateDevices.flatMap(d => d.matchedOn));
        return Array.from(fields).sort().map(field => ({
            label: MATCHED_ON_LABELS[field] ?? field,
            value: field,
        }));
    }, [duplicateDevices]);

    const activeFilterCount = platformFilter.length + matchedOnFilter.length;

    const clearFilters = () => {
        setPlatformFilter([]);
        setMatchedOnFilter([]);
    };

    const visibleDevices = (duplicatesOnly ? duplicateDevices : devices).filter(device => {
        if (platformFilter.length > 0 && !platformFilter.includes(device.operatingSystem)) {
            return false;
        }
        if (matchedOnFilter.length > 0 && !matchedOnFilter.some(field => device.matchedOn.includes(field))) {
            return false;
        }
        return true;
    });

    const columns = [
        {
            key: 'deviceName',
            label: 'Device',
            minWidth: 220,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceDuplicate;
                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium max-w-xs truncate" title={device.deviceName}>
                                {device.deviceName || '(unnamed)'}
                            </span>
                            {device.isDuplicate && (
                                <Badge variant="destructive" className="text-xs">
                                    <Copy className="h-3 w-3 mr-1" />
                                    Duplicate
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate" title={device.serialNumber}>
                            {device.serialNumber || 'No serial number'}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'userDisplayName',
            label: 'User',
            minWidth: 180,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceDuplicate;
                return (
                    <div>
                        <div className="max-w-xs truncate" title={device.userDisplayName}>
                            {device.userDisplayName || 'Unassigned'}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={device.userPrincipalName}>
                            {device.userPrincipalName}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'complianceState',
            label: 'Compliance',
            minWidth: 140,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceDuplicate;
                return (
                    <Badge variant={
                        device.complianceState === 'Compliant' ? 'default' :
                            device.complianceState === 'Noncompliant' ? 'destructive' : 'secondary'
                    }>
                        {device.complianceState === 'Compliant' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {device.complianceState === 'Noncompliant' && <XCircle className="h-3 w-3 mr-1" />}
                        {device.complianceState !== 'Compliant' && device.complianceState !== 'Noncompliant' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {device.complianceState || 'Unknown'}
                    </Badge>
                );
            }
        },
        {
            key: 'lastSyncDateTime',
            label: 'Last Sync',
            minWidth: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceDuplicate;
                return (
                    <span className="text-sm">
                        {device.lastSyncDateTime ? new Date(device.lastSyncDateTime).toLocaleDateString() : 'Never'}
                    </span>
                );
            }
        },
        {
            key: 'matchedOn',
            label: 'Matched On',
            minWidth: 160,
            sortable: false,
            searchable: false,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceDuplicate;
                if (!device.isDuplicate || device.matchedOn.length === 0) {
                    return <span className="text-gray-400 text-xs">—</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {device.matchedOn.map(field => (
                            <Badge key={field} variant="outline" className="text-xs">
                                {field === 'SerialNumber' ? 'Serial' : 'Wi-Fi MAC'}
                            </Badge>
                        ))}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            minWidth: 140,
            sortable: false,
            searchable: false,
            render: (value: unknown, row: Record<string, unknown>) => {
                const device = row as unknown as DeviceDuplicate;
                if (!device.isDuplicate || !device.duplicateGroupId) {
                    return null;
                }
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openGroup(device.duplicateGroupId as string)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        View Duplicates
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600 dark:text-white">Duplicate Devices</h1>
                    <p className="text-gray-600 mt-2">
                        Find managed devices that share the same hardware identity, even after a rename
                    </p>
                </div>
                <Button onClick={fetchDuplicates} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Scanning...' : devices.length > 0 ? 'Rescan' : 'Scan for Duplicates'}
                </Button>
            </div>

            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                        <Button onClick={fetchDuplicates} className="mt-4" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {devices.length === 0 && !loading && !error && (
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6">
                                <Copy className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600 dark:text-white mb-4">
                                Ready to scan for duplicate devices
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                We&apos;ll group devices by serial number and Wi-Fi MAC address — the hardware
                                identifiers that survive a rename — to find duplicate enrollment records.
                            </p>
                            <Button onClick={fetchDuplicates} className="flex items-center gap-2 mx-auto" size="lg">
                                <Copy className="h-5 w-5" />
                                Scan for Duplicates
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <AssignmentsTableSkeleton
                    showStats={true}
                    statsCount={3}
                    showFilters={false}
                    tableRows={12}
                    tableColumns={6}
                />
            )}

            {!loading && devices.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
                                <div className="text-sm text-gray-600">Total Devices Scanned</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{duplicateDevices.length}</div>
                                <div className="text-sm text-gray-600">Duplicate Devices</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">{duplicateGroupCount}</div>
                                <div className="text-sm text-gray-600">Duplicate Groups</div>
                            </CardContent>
                        </Card>
                    </div>

                    {duplicateDevices.length === 0 ? (
                        <Card className="border-green-200">
                            <CardContent className="p-6 text-center">
                                <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" />
                                <p className="text-gray-600 dark:text-gray-300">
                                    No duplicate devices found — every device has a unique hardware identity.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <button
                                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                        className="flex items-center gap-2 hover:text-primary transition-colors"
                                    >
                                        <Filter className="h-5 w-5" />
                                        Filters
                                        {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {!isFiltersExpanded && activeFilterCount > 0 && (
                                            <Badge variant="secondary">{activeFilterCount} active</Badge>
                                        )}
                                        {activeFilterCount > 0 && (
                                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                                Clear All
                                            </Button>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            {isFiltersExpanded && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Platform</label>
                                            <MultiSelect
                                                options={platformOptions}
                                                selected={platformFilter}
                                                onChange={setPlatformFilter}
                                                placeholder="Select platforms..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Matched On</label>
                                            <MultiSelect
                                                options={matchedOnOptions}
                                                selected={matchedOnFilter}
                                                onChange={setMatchedOnFilter}
                                                placeholder="Select matched fields..."
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            )}

                            <CardContent className={isFiltersExpanded ? 'pt-0' : undefined}>
                                <div className="flex items-center gap-2">
                                    <Switch id="duplicates-only" checked={duplicatesOnly} onCheckedChange={setDuplicatesOnly} />
                                    <Label htmlFor="duplicates-only" className="text-sm">
                                        Show duplicates only
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {visibleDevices.length > 0 && (
                        <DataTable
                            data={visibleDevices as unknown as Record<string, unknown>[]}
                            columns={columns}
                        />
                    )}
                </>
            )}

            <DeviceDuplicateGroupDialog
                groupId={selectedGroupId}
                open={isGroupDialogOpen}
                onOpenChange={setIsGroupDialogOpen}
                onClosed={handleGroupDialogClosed}
            />
        </div>
    );
}
