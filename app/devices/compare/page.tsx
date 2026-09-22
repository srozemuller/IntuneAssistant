'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
;
import { Button } from '@/components/ui/button';
;
import { Badge } from '@/components/ui/badge';
;
import { DataTable } from '@/components/DataTable';
;
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
;
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
;
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
;
import { GitCompare, ChevronDown, ChevronRight, ArrowLeft, Monitor } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
;
import { DEVICES_ENDPOINT, DEVICES_COMPARE_ENDPOINT } from '@/lib/constants';
;

interface DeviceListItem {
    id: string;
    deviceName: string;
    userDisplayName: string;
    operatingSystem: string;
    osVersion: string;
    serialNumber: string;
    lastSyncDateTime: string | null;
}

function formatLastSync(dateString: string | null): string {
    if (!dateString) return 'Never synced';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Never synced';

    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    if (diffDays <= 0) return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    return `${formatted} (${diffDays}d ago)`;
}

interface DeviceComparisonSide {
    deviceId: string;
    deviceName: string;
    userPrincipalName: string | null;
    scopeTags: string[];
}

type DiffStatus = 'Same' | 'Different' | 'OnlyLeft' | 'OnlyRight';

interface DeviceComparisonDiffItem {
    key: string;
    leftValue: string | null;
    rightValue: string | null;
    status: DiffStatus;
    settingsDiff?: DeviceComparisonDiffItem[] | null;
    leftSourcePolicy?: string | null;
    rightSourcePolicy?: string | null;
}

interface DeviceComparisonDiffSection {
    sectionName: string;
    items: DeviceComparisonDiffItem[];
}

interface DeviceComparisonResult {
    left: DeviceComparisonSide;
    right: DeviceComparisonSide;
    sections: DeviceComparisonDiffSection[];
}

interface ApiEnvelope<T> {
    status: string;
    message: string;
    details: string[];
    data: T;
}

function statusBadge(status: DeviceComparisonDiffItem['status']) {
    switch (status) {
        case 'Same':
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">Same</Badge>;
        case 'Different':
            return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">Different</Badge>;
        case 'OnlyLeft':
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">Only left device</Badge>;
        case 'OnlyRight':
            return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400">Only right device</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function DevicePicker({
    label,
    devices,
    selectedId,
    onSelect,
}: {
    label: string;
    devices: DeviceListItem[];
    selectedId: string | null;
    onSelect: (device: DeviceListItem) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const selected = devices.find(d => d.id === selectedId) ?? null;

    const filtered = devices
        .filter(d => {
            if (!search.trim()) return true;
            const term = search.toLowerCase();
            return (
                d.deviceName?.toLowerCase().includes(term) ||
                d.userDisplayName?.toLowerCase().includes(term) ||
                d.serialNumber?.toLowerCase().includes(term)
            );
        })
        .sort((a, b) => {
            const aTime = a.lastSyncDateTime ? new Date(a.lastSyncDateTime).getTime() : 0;
            const bTime = b.lastSyncDateTime ? new Date(b.lastSyncDateTime).getTime() : 0;
            return bTime - aTime;
        });

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-[40px]"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Monitor className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-left truncate">
                                {selected ? selected.deviceName : 'Search and select a device...'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {selected && (
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                    {formatLastSync(selected.lastSyncDateTime)}
                                </span>
                            )}
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[460px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search by device name, user, or serial..."
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList>
                            <CommandEmpty>No devices found.</CommandEmpty>
                            <CommandGroup heading="Sorted by most recently synced">
                                {filtered.slice(0, 50).map(device => (
                                    <CommandItem
                                        key={device.id}
                                        value={device.id}
                                        onSelect={() => {
                                            onSelect(device);
                                            setOpen(false);
                                        }}
                                        className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span className="font-medium truncate">{device.deviceName}</span>
                                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                                {formatLastSync(device.lastSyncDateTime)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {device.userDisplayName} &middot; {device.operatingSystem} {device.osVersion}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default function DeviceComparePage() {
    const { request } = useApiRequest();
    const [devices, setDevices] = useState<DeviceListItem[]>([]);
    const [leftDeviceId, setLeftDeviceId] = useState<string | null>(null);
    const [rightDeviceId, setRightDeviceId] = useState<string | null>(null);
    const [result, setResult] = useState<DeviceComparisonResult | null>(null);
    const [loadingDevices, setLoadingDevices] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [settingsStatusFilter, setSettingsStatusFilter] = useState<'All' | DiffStatus>('All');

    const toggleExpandedRow = (rowKey: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(rowKey)) next.delete(rowKey);
            else next.add(rowKey);
            return next;
        });
    };

    const renderSectionCard = (section: DeviceComparisonDiffSection, deviceLeftName: string, deviceRightName: string) => {
        const hasSettings = section.items.some(i => i.settingsDiff && i.settingsDiff.length > 0);
        const hasSourcePolicy = section.items.some(i => i.leftSourcePolicy || i.rightSourcePolicy);
        const hasExpandableDetail = hasSettings || hasSourcePolicy;

        return (
            <Card key={section.sectionName}>
                <CardHeader>
                    <CardTitle className="text-lg">{section.sectionName}</CardTitle>
                    <CardDescription>
                        {section.items.filter(i => i.status !== 'Same').length} difference(s) out of {section.items.length}
                        {hasSettings && ' — click a row to see its settings'}
                        {!hasSettings && hasSourcePolicy && ' — click a row to see which policy delivers it'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={section.items as unknown as Record<string, unknown>[]}
                        columns={[
                            {
                                key: 'key',
                                label: 'Item',
                                sortable: true,
                                searchable: true,
                                render: (v, row) => {
                                    const item = row as unknown as DeviceComparisonDiffItem;
                                    const isExpandable = !!item.settingsDiff?.length || !!item.leftSourcePolicy || !!item.rightSourcePolicy;
                                    return (
                                        <span className="flex items-center gap-1.5">
                                            {isExpandable && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                                            <span>{v as string}</span>
                                        </span>
                                    );
                                },
                            },
                            { key: 'leftValue', label: deviceLeftName, render: (v) => (v as string) ?? '-' },
                            { key: 'rightValue', label: deviceRightName, render: (v) => (v as string) ?? '-' },
                            {
                                key: 'status',
                                label: 'Status',
                                sortable: true,
                                render: (v) => statusBadge(v as DiffStatus),
                            },
                        ]}
                        showSearch
                        showPagination={section.items.length > 10}
                        onRowClick={hasExpandableDetail ? (row) => {
                            const item = row as unknown as DeviceComparisonDiffItem;
                            if (item.settingsDiff?.length || item.leftSourcePolicy || item.rightSourcePolicy) {
                                toggleExpandedRow(`${section.sectionName}::${item.key}`);
                            }
                        } : undefined}
                        expandedRowRender={hasExpandableDetail ? (row) => {
                            const item = row as unknown as DeviceComparisonDiffItem;
                            const rowKey = `${section.sectionName}::${item.key}`;
                            if (!expandedRows.has(rowKey)) return null;

                            if (item.settingsDiff?.length) {
                                return (
                                    <div className="px-6 py-3">
                                        <div className="text-xs font-semibold mb-2 text-muted-foreground">
                                            Settings for {item.key}
                                        </div>
                                        <table className="w-full text-xs border rounded">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="text-left px-3 py-1.5 font-medium">Setting</th>
                                                    <th className="text-left px-3 py-1.5 font-medium">{deviceLeftName}</th>
                                                    <th className="text-left px-3 py-1.5 font-medium">{deviceRightName}</th>
                                                    <th className="text-left px-3 py-1.5 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {item.settingsDiff.map((setting, idx) => (
                                                    <tr key={idx} className="border-t border-border/50">
                                                        <td className="px-3 py-1.5">{setting.key}</td>
                                                        <td className="px-3 py-1.5 font-mono">{setting.leftValue ?? '-'}</td>
                                                        <td className="px-3 py-1.5 font-mono">{setting.rightValue ?? '-'}</td>
                                                        <td className="px-3 py-1.5">{statusBadge(setting.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }

                            if (item.leftSourcePolicy || item.rightSourcePolicy) {
                                return (
                                    <div className="px-6 py-3">
                                        <div className="text-xs font-semibold mb-2 text-muted-foreground">
                                            Delivered via policy
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <div className="text-muted-foreground mb-0.5">{deviceLeftName}</div>
                                                <div className="font-medium">{item.leftSourcePolicy ?? 'Not assigned'}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground mb-0.5">{deviceRightName}</div>
                                                <div className="font-medium">{item.rightSourcePolicy ?? 'Not assigned'}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        } : undefined}
                    />
                </CardContent>
            </Card>
        );
    };

    useEffect(() => {
        (async () => {
            setLoadingDevices(true);
            const response = await request<ApiEnvelope<DeviceListItem[]>>(DEVICES_ENDPOINT);
            if (response?.data?.data) {
                setDevices(response.data.data);
            }
            setLoadingDevices(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runComparison = useCallback(async (deviceIdA: string, deviceIdB: string) => {
        setLoadingComparison(true);
        setResult(null);
        const url = `${DEVICES_COMPARE_ENDPOINT}?deviceIdA=${deviceIdA}&deviceIdB=${deviceIdB}`;
        const response = await request<ApiEnvelope<DeviceComparisonResult>>(url);
        if (response?.data?.data) {
            setResult(response.data.data);
        }
        setLoadingComparison(false);
    }, [request]);

    useEffect(() => {
        if (leftDeviceId && rightDeviceId && leftDeviceId !== rightDeviceId) {
            runComparison(leftDeviceId, rightDeviceId);
        } else {
            setResult(null);
        }
    }, [leftDeviceId, rightDeviceId, runComparison]);

    const allSettingsSection = result?.sections.find(s => s.sectionName === 'All Settings');
    const otherSections = result?.sections.filter(s => s.sectionName !== 'All Settings') ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/devices" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
                        <ArrowLeft className="h-3 w-3" /> Back to Devices
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GitCompare className="h-6 w-6" />
                        Device Compare
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Compare two devices to see differences in configuration, compliance, apps, filters, scope tags and update rings.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select devices</CardTitle>
                    <CardDescription>Pick two devices to compare their assignments and configuration.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DevicePicker
                        label="Left device"
                        devices={devices}
                        selectedId={leftDeviceId}
                        onSelect={(device) => setLeftDeviceId(device.id)}
                    />
                    <DevicePicker
                        label="Right device"
                        devices={devices}
                        selectedId={rightDeviceId}
                        onSelect={(device) => setRightDeviceId(device.id)}
                    />
                </CardContent>
            </Card>

            {loadingDevices && !result && (
                <AssignmentsTableSkeleton showStats={false} showFilters={false} tableRows={4} tableColumns={2} />
            )}

            {leftDeviceId && rightDeviceId && leftDeviceId === rightDeviceId && (
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        Please select two different devices to compare.
                    </CardContent>
                </Card>
            )}

            {loadingComparison && (
                <AssignmentsTableSkeleton showStats={false} showFilters={true} tableRows={12} tableColumns={6} />
            )}

            {result && !loadingComparison && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{result.left.deviceName}</CardTitle>
                                <CardDescription>{result.left.userPrincipalName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {result.left.scopeTags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{result.right.deviceName}</CardTitle>
                                <CardDescription>{result.right.userPrincipalName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {result.right.scopeTags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="settings">
                                Settings
                                {allSettingsSection && (
                                    <Badge variant="secondary" className="ml-1.5">
                                        {allSettingsSection.items.filter(i => i.status !== 'Same').length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-4">
                            {otherSections.map(section => renderSectionCard(section, result.left.deviceName, result.right.deviceName))}
                        </TabsContent>

                        <TabsContent value="settings" className="mt-4">
                            {allSettingsSection ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Every configured setting across all Settings Catalog and Administrative Template
                                        policies on either device, matched by its underlying setting definition — so the
                                        same setting still lines up even when it&apos;s delivered by a differently-named policy
                                        on each side. Click a row to see which policy delivers it.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(['All', 'Same', 'Different', 'OnlyLeft', 'OnlyRight'] as const).map(statusOption => (
                                            <Button
                                                key={statusOption}
                                                size="sm"
                                                variant={settingsStatusFilter === statusOption ? 'default' : 'outline'}
                                                onClick={() => setSettingsStatusFilter(statusOption)}
                                            >
                                                {statusOption === 'OnlyLeft' ? 'Only left'
                                                    : statusOption === 'OnlyRight' ? 'Only right'
                                                        : statusOption}
                                            </Button>
                                        ))}
                                    </div>
                                    {renderSectionCard(
                                        {
                                            ...allSettingsSection,
                                            items: settingsStatusFilter === 'All'
                                                ? allSettingsSection.items
                                                : allSettingsSection.items.filter(i => i.status === settingsStatusFilter),
                                        },
                                        result.left.deviceName,
                                        result.right.deviceName
                                    )}
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-sm text-muted-foreground">
                                        No comparable settings found for these devices.
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
