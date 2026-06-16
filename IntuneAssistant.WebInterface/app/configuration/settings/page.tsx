'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    RefreshCw, ChevronDown, ChevronRight, ChevronUp, X, AlertTriangle,
    Copy, Database, XCircle, Filter, Users, Archive
} from 'lucide-react';
import {
    POLICY_SETTINGS_CATALOG_ENDPOINT,
    POLICY_SETTINGS_DEVICECONFIG_ENDPOINT,
    POLICY_SETTINGS_GROUPPOLICY_ENDPOINT,
    GROUPS_ENDPOINT,
} from '@/lib/constants';
import { ExportButton, ExportData, ExportColumn } from '@/components/ExportButton';
import { useApiRequest } from '@/hooks/useApiRequest';
import { DataTable } from '@/components/DataTable';
import { CancelledCard } from '@/components/CancelledCard';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GroupDetailsDialog } from '@/components/GroupDetailsDialog';
import {OmaCatalogMigrationInfo, OmaMigrationBanner} from "@/components/OmaMigrationBanner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SettingDefinition {
    id: string;
    name: string | null;
    displayName: string | null;
    description: string | null;
    keywords: string[] | null;
}

interface SettingsCatalogSetting {
    id: string;
    policyId: string;
    policyName: string;
    settingName: string | null;
    settingValue: string | null;
    childSettingInfo: { name: string; value: string | null }[] | null;
    settingDefinitions: SettingDefinition[] | null;
}

interface DeviceConfigSetting {
    name: string;
    value: string | null;
    omaUri: string | null;         // non-null → OMA-URI setting
    odataType: string | null;
    catalogMigrationInfo: OmaCatalogMigrationInfo | null;  // non-null → catalog equivalent found
}

interface GroupPolicySetting {
    id: string;
    enabled: boolean;
    definition: { displayName: string; classType: string };
}

interface PolicyAssignment {
    id?: string;
    target?: {
        groupId?: string;
        deviceAndAppManagementAssignmentFilterId?: string;
        deviceAndAppManagementAssignmentFilterType?: string;
        '@odata.type'?: string;
    };
}

interface PolicyResponse {
    id: string;
    name: string;
    policyType: string;
    policySubType: string | null;
    platform: string;
    isAssigned: boolean;
    assignments: PolicyAssignment[] | null;
    settings: SettingsCatalogSetting[] | null;
    deviceConfigSettings: DeviceConfigSetting[] | null;
    groupPolicySettings: GroupPolicySetting[] | null;
}

interface ApiResponse {
    status: string;
    message: string;
    data: PolicyResponse[];
}

interface FlatSetting extends Record<string, unknown> {
    _id: string;
    policyId: string;
    policyName: string;
    policyType: string;
    platform: string;
    isAssigned: boolean;
    assignments: PolicyAssignment[];
    settingName: string;
    settingValue: string;
    source: 'catalog' | 'deviceconfig' | 'grouppolicy';
    childSettingInfo: { name: string; value: string }[] | null;
    /** Pre-flattened text of all child settings for full-text search. */
    _searchText?: string;
    omaUri?: string | null;
    catalogMigrationInfo?: OmaCatalogMigrationInfo | null;
    settingId?: string;
    assignmentTargets: string[];
    status: 'ok' | 'duplicate' | 'conflict';
    conflictPeers: { policyId: string; policyName: string; settingValue: string; source: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAssignmentTargets(policy: PolicyResponse): string[] {
    if (!policy.assignments?.length) return [];
    return policy.assignments
        .map(a => a.target?.groupId ?? a.target?.['@odata.type'] ?? '')
        .filter(Boolean);
}

function flattenPolicies(policies: PolicyResponse[], source: FlatSetting['source']): FlatSetting[] {
    const rows: FlatSetting[] = [];
    for (const policy of policies) {
        const assignmentTargets = getAssignmentTargets(policy);
        const assignments = policy.assignments ?? [];

        if (source === 'catalog' && policy.settings) {
            for (const s of policy.settings) {
                const matchingDef = s.settingDefinitions?.find(d => d.id === s.id);
                const resolvedName = s.settingName ?? matchingDef?.displayName ?? matchingDef?.name ?? s.id ?? '';
                const resolvedValue = s.settingValue
                    ?? (s.childSettingInfo?.filter(c => c.value != null).map(c => `${c.name}: ${c.value}`).join(', '))
                    ?? '';
                const childInfo = s.childSettingInfo?.filter(c => c.name != null).map(c => ({
                    name: c.name,
                    value: c.value ?? '',
                })) ?? null;

                // Pre-computed search blob — includes child setting names + values so
                // DataTable search can find them even without expanding the row.
                const childSearchText = childInfo
                    ? childInfo.map(c => `${c.name} ${c.value}`).join(' ')
                    : '';

                rows.push({
                    _id: `${source}-${policy.id}-${s.id}`,
                    policyId: policy.id, policyName: policy.name ?? '',
                    policyType: policy.policyType ?? '', platform: policy.platform ?? '',
                    isAssigned: policy.isAssigned, assignments,
                    settingName: resolvedName, settingValue: resolvedValue,
                    settingId: s.id, source,
                    childSettingInfo: childInfo?.length ? childInfo : null,
                    _searchText: childSearchText,
                    assignmentTargets, status: 'ok', conflictPeers: [],
                });
            }
        } else if (source === 'deviceconfig' && policy.deviceConfigSettings) {
            for (const s of policy.deviceConfigSettings) {
                rows.push({
                    _id: `${source}-${policy.id}-${s.omaUri ?? s.name}`,
                    policyId: policy.id, policyName: policy.name ?? '',
                    policyType: policy.policyType ?? '', platform: policy.platform ?? '',
                    isAssigned: policy.isAssigned, assignments,
                    settingName: s.name ?? '', settingValue: s.value ?? '',
                    omaUri: s.omaUri,
                    catalogMigrationInfo: s.catalogMigrationInfo,
                    source, childSettingInfo: null,
                    assignmentTargets, status: 'ok', conflictPeers: [],
                });
            }
        } else if (source === 'grouppolicy' && policy.groupPolicySettings) {
            for (const s of policy.groupPolicySettings) {
                rows.push({
                    _id: `${source}-${policy.id}-${s.id}`,
                    policyId: policy.id, policyName: policy.name ?? '',
                    policyType: policy.policyType ?? '', platform: policy.platform ?? '',
                    isAssigned: policy.isAssigned, assignments,
                    settingName: s.definition?.displayName ?? s.id ?? '',
                    settingValue: s.enabled ? 'Enabled' : 'Disabled',
                    source, childSettingInfo: null,
                    assignmentTargets, status: 'ok', conflictPeers: [],
                });
            }
        }
    }
    return rows;
}

function hasAssignmentOverlap(a: FlatSetting, b: FlatSetting): boolean {
    if (!a.assignmentTargets.length || !b.assignmentTargets.length) return false;
    const setA = new Set(a.assignmentTargets);
    return b.assignmentTargets.some(t => setA.has(t));
}

function markDuplicatesAndConflicts(rows: FlatSetting[]): FlatSetting[] {
    const byName = new Map<string, FlatSetting[]>();
    for (const row of rows) {
        const key = (row.settingName ?? '').toLowerCase();
        if (!key) continue;
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key)!.push(row);
    }
    return rows.map(row => {
        const key = (row.settingName ?? '').toLowerCase();
        if (!key) return row;
        const siblings = byName.get(key);
        if (!siblings || siblings.length <= 1) return row;
        const overlapping = siblings.filter(s => s.policyId !== row.policyId && hasAssignmentOverlap(row, s));
        if (!overlapping.length) return row;
        const rowValue = (row.settingValue ?? '').toLowerCase();
        const hasConflict = overlapping.some(s => (s.settingValue ?? '').toLowerCase() !== rowValue);
        const conflictPeers = overlapping.map(s => ({
            policyId: s.policyId,
            policyName: s.policyName,
            settingValue: s.settingValue,
            source: s.source,
        }));
        return { ...row, status: (hasConflict ? 'conflict' : 'duplicate') as FlatSetting['status'], conflictPeers };
    });
}

const FETCH_STEPS = [
    { label: 'Settings Catalog', endpoint: POLICY_SETTINGS_CATALOG_ENDPOINT, source: 'catalog' as const },
    { label: 'Device Configuration', endpoint: POLICY_SETTINGS_DEVICECONFIG_ENDPOINT, source: 'deviceconfig' as const },
    { label: 'Group Policy', endpoint: POLICY_SETTINGS_GROUPPOLICY_ENDPOINT, source: 'grouppolicy' as const },
];

// ── Conflict / Duplicate Peers Dialog ─────────────────────────────────────────

interface PeersDialogInfo {
    settingName: string;
    settingValue: string;
    policyName: string;
    status: 'duplicate' | 'conflict';
    peers: { policyId: string; policyName: string; settingValue: string; source: string }[];
}

const sourceLabelMap: Record<string, string> = {
    catalog: 'Settings Catalog',
    deviceconfig: 'Device Config',
    grouppolicy: 'Group Policy',
};

function ConflictPeersDialog({ info, onClose }: { info: PeersDialogInfo | null; onClose: () => void }) {
    if (!info) return null;
    const isConflict = info.status === 'conflict';
    return (
        <Dialog open={!!info} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isConflict
                            ? <AlertTriangle className="h-5 w-5 text-red-500" />
                            : <Copy className="h-5 w-5 text-yellow-500" />}
                        {isConflict ? 'Conflicting' : 'Duplicate'} Setting
                    </DialogTitle>
                    <DialogDescription>
                        Setting <span className="font-semibold text-foreground">{info.settingName}</span> appears in multiple policies with overlapping assignments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current policy */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">THIS POLICY</p>
                        <div className={`p-3 rounded border-2 ${isConflict ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'}`}>
                            <div className="font-medium text-sm text-foreground">{info.policyName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Value: <span className="font-mono font-semibold text-foreground">{info.settingValue || '(empty)'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Conflicting / duplicate peers */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {isConflict ? 'CONFLICTING' : 'DUPLICATE'} IN {info.peers.length} OTHER POLIC{info.peers.length === 1 ? 'Y' : 'IES'}
                        </p>
                        <div className="space-y-2">
                            {info.peers.map((peer, i) => {
                                const valuesDiffer = peer.settingValue.toLowerCase() !== info.settingValue.toLowerCase();
                                return (
                                    <div key={i} className={`p-3 rounded border ${valuesDiffer ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10' : 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10'}`}>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="font-medium text-sm text-foreground">{peer.policyName}</div>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {sourceLabelMap[peer.source] ?? peer.source}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            Value: <span className={`font-mono font-semibold ${valuesDiffer ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                                {peer.settingValue || '(empty)'}
                                            </span>
                                            {valuesDiffer && <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Assignment Dialog ──────────────────────────────────────────────────────────

interface AssignmentInfo {
    policyName: string;
    assignments: PolicyAssignment[];
}

interface GroupInfo {
    displayName: string;
    loading: boolean;
    error?: string;
}

function AssignmentsDialog({ info, onClose, onGroupClick }: {
    info: AssignmentInfo | null;
    onClose: () => void;
    onGroupClick: (groupId: string) => void;
}) {
    const { request } = useApiRequest();
    const [groupNames, setGroupNames] = useState<Record<string, GroupInfo>>({});
    const fetchedRef = useRef<Set<string>>(new Set());

    const groupAssignments = useMemo(
        () => (info?.assignments ?? []).filter(a => a.target?.groupId),
        [info]
    );
    const otherAssignments = useMemo(
        () => (info?.assignments ?? []).filter(a => !a.target?.groupId),
        [info]
    );

    // Fetch display names for all group IDs when dialog opens
    useEffect(() => {
        if (!info) {
            fetchedRef.current.clear();
            setGroupNames({});
            return;
        }
        const ids = groupAssignments.map(a => a.target!.groupId!).filter(id => !fetchedRef.current.has(id));
        if (!ids.length) return;

        ids.forEach(id => {
            fetchedRef.current.add(id);
            setGroupNames(prev => ({ ...prev, [id]: { displayName: id, loading: true } }));

            request<{ data: { id: string; displayName: string } }>(`${GROUPS_ENDPOINT}?groupId=${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }).then(resp => {
                const displayName = resp?.data?.data?.displayName ?? id;
                setGroupNames(prev => ({ ...prev, [id]: { displayName, loading: false } }));
            }).catch(() => {
                setGroupNames(prev => ({ ...prev, [id]: { displayName: id, loading: false, error: 'Failed to load' } }));
            });
        });
    }, [info, groupAssignments, request]);

    if (!info) return null;

    return (
        <Dialog open={!!info} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Assignments — {info.policyName}
                    </DialogTitle>
                    <DialogDescription>
                        {info.assignments.length} assignment{info.assignments.length !== 1 ? 's' : ''} configured
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {groupAssignments.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Group Assignments</h4>
                            {groupAssignments.map((a, i) => {
                                const groupId = a.target!.groupId!;
                                const groupInfo = groupNames[groupId];
                                const isLoading = groupInfo?.loading ?? true;
                                const displayName = groupInfo?.displayName ?? groupId;
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded border bg-muted/30 gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="min-w-0">
                                                {isLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="font-medium text-sm text-foreground truncate">{displayName}</div>
                                                        <div className="text-xs font-mono text-muted-foreground truncate">{groupId}</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-7 shrink-0"
                                            disabled={isLoading}
                                            onClick={() => onGroupClick(groupId)}
                                        >
                                            View Group
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {otherAssignments.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Other Assignments</h4>
                            {otherAssignments.map((a, i) => (
                                <div key={i} className="p-2 rounded border bg-muted/30 text-xs font-mono text-muted-foreground">
                                    {a.target?.['@odata.type'] ?? JSON.stringify(a.target)}
                                </div>
                            ))}
                        </div>
                    )}
                    {info.assignments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No assignments configured.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PolicySettingsPage() {
    const { instance, accounts } = useMsal();
    const { request, cancel } = useApiRequest();

    const [settings, setSettings] = useState<FlatSetting[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [activeSearch, setActiveSearch] = useState('');
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [completedSteps, setCompletedSteps] = useState(0);

    // Filters
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [sourceFilter, setSourceFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [assignedFilter, setAssignedFilter] = useState<string[]>([]);

    // Assignment dialog
    const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo | null>(null);
    // Conflict/duplicate peers dialog
    const [peersDialogInfo, setPeersDialogInfo] = useState<PeersDialogInfo | null>(null);
    // Group dialog
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    const toggleRowExpansion = useCallback((id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const fetchSettings = useCallback(async () => {
        if (!accounts.length) return;
        setLoading(true);
        setError(null);
        setIsCancelled(false);
        setSettings([]);
        setProgress(0);
        setCompletedSteps(0);
        const allRows: FlatSetting[] = [];
        try {
            for (let i = 0; i < FETCH_STEPS.length; i++) {
                const step = FETCH_STEPS[i];
                setProgressLabel(`Fetching ${step.label}…`);
                setProgress(Math.round((i / FETCH_STEPS.length) * 100));
                const response = await request<ApiResponse>(step.endpoint, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const policies: PolicyResponse[] = response?.data?.data ?? [];
                allRows.push(...flattenPolicies(policies, step.source));
                setCompletedSteps(i + 1);
                setProgress(Math.round(((i + 1) / FETCH_STEPS.length) * 100));
            }
            setSettings(markDuplicatesAndConflicts(allRows));
            setProgressLabel('Done');
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    }, [accounts, request]);

    // ── Filter options (memoised) ──────────────────────────────────────────────

    const sourceOptions = useMemo<Option[]>(() => [
        { label: 'Settings Catalog', value: 'catalog' },
        { label: 'Device Config', value: 'deviceconfig' },
        { label: 'Group Policy', value: 'grouppolicy' },
    ], []);

    const platformOptions = useMemo<Option[]>(() => {
        const platforms = new Set<string>();
        settings.forEach(s => { if (s.platform) platforms.add(s.platform); });
        return Array.from(platforms).sort().map(p => ({ label: p, value: p }));
    }, [settings]);

    const statusOptions = useMemo<Option[]>(() => [
        { label: 'OK', value: 'ok' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Conflict', value: 'conflict' },
        { label: 'Deprecated', value: 'deprecated' },
    ], []);

    const assignedOptions = useMemo<Option[]>(() => [
        { label: 'Assigned', value: 'true' },
        { label: 'Not Assigned', value: 'false' },
    ], []);

    const clearFilters = useCallback(() => {
        setSourceFilter([]);
        setPlatformFilter([]);
        setStatusFilter([]);
        setAssignedFilter([]);
    }, []);

    const activeFilterCount = sourceFilter.length + platformFilter.length + statusFilter.length + assignedFilter.length;

    // ── Filtered data (memoised) ───────────────────────────────────────────────

    const filteredSettings = useMemo(() => {
        let data = settings;
        if (sourceFilter.length) data = data.filter(s => sourceFilter.includes(s.source));
        if (platformFilter.length) data = data.filter(s => platformFilter.includes(s.platform));
        if (statusFilter.length) {
            data = data.filter(s => {
                const regularStatuses = statusFilter.filter(f => f !== 'deprecated');
                if (regularStatuses.includes(s.status)) return true;
                return statusFilter.includes('deprecated') && s.settingName.startsWith('[Deprecated]');
            });
        }
        if (assignedFilter.length) data = data.filter(s => assignedFilter.includes(String(s.isAssigned)));
        return data;
    }, [settings, sourceFilter, platformFilter, statusFilter, assignedFilter]);

    // ── Stats (memoised) ──────────────────────────────────────────────────────

    const stats = useMemo(() => ({
        total: settings.length,
        catalog: settings.filter(s => s.source === 'catalog').length,
        deviceconfig: settings.filter(s => s.source === 'deviceconfig').length,
        grouppolicy: settings.filter(s => s.source === 'grouppolicy').length,
        duplicates: settings.filter(s => s.status === 'duplicate').length,
        conflicts: settings.filter(s => s.status === 'conflict').length,
        deprecated: settings.filter(s => s.settingName.startsWith('[Deprecated]')).length,
    }), [settings]);

    const exportData = useMemo((): ExportData => {
        const exportColumns: ExportColumn[] = [
            { key: 'policyName', label: 'Policy Name', width: 30, getValue: row => String(row.policyName ?? '') },
            { key: 'settingName', label: 'Setting Name', width: 30, getValue: row => String(row.settingName ?? '') },
            { key: 'settingValue', label: 'Setting Value', width: 25, getValue: row => String(row.settingValue ?? '') },
            { key: 'omaUri', label: 'OMA-URI', width: 30, getValue: row => String(row.omaUri ?? '') },
            { key: 'source', label: 'Source', width: 15, getValue: row => String(row.source ?? '') },
            { key: 'platform', label: 'Platform', width: 12, getValue: row => String(row.platform ?? '') },
            { key: 'isAssigned', label: 'Assigned', width: 10, getValue: row => String(row.isAssigned ?? false) },
            { key: 'status', label: 'Status', width: 12, getValue: row => String(row.status ?? 'ok') },
        ];
        return {
            data: filteredSettings,
            columns: exportColumns,
            filename: 'policy-settings',
            title: 'Policy Settings',
            description: 'Overview of all policy settings',
            stats: [
                { label: 'Total', value: stats.total },
                { label: 'Catalog', value: stats.catalog },
                { label: 'Device Config', value: stats.deviceconfig },
                { label: 'Group Policy', value: stats.grouppolicy },
                { label: 'Duplicates', value: stats.duplicates },
                { label: 'Conflicts', value: stats.conflicts },
            ],
        };
    }, [filteredSettings, stats]);

    const sourceLabel = useMemo<Record<string, string>>(() => ({
        catalog: 'Settings Catalog',
        deviceconfig: 'Device Config',
        grouppolicy: 'Group Policy',
    }), []);

    const sourceBadgeClass = useMemo<Record<string, string>>(() => ({
        catalog: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        deviceconfig: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        grouppolicy: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    }), []);

    // ── Columns (memoised) ────────────────────────────────────────────────────

    const columns = useMemo(() => [
        {
            key: 'policyName',
            label: 'Policy Name',
            width: 260,
            minWidth: 180,
            render: (value: unknown, row: Record<string, unknown>) => {
                const src = row.source as string;
                const status = row.status as string;
                const peers = row.conflictPeers as PeersDialogInfo['peers'];
                const settingName = String(row.settingName ?? '');
                const settingValue = String(row.settingValue ?? '');
                const policyName = String(value ?? 'N/A');
                const isDeprecated = settingName.startsWith('[Deprecated]');
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-foreground truncate">{policyName}</div>
                        <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className={`text-xs ${sourceBadgeClass[src] ?? ''}`}>
                                {sourceLabel[src] ?? src}
                            </Badge>
                            {isDeprecated && (
                                <button onClick={() => setStatusFilter(prev =>
                                    prev.includes('deprecated') ? prev : [...prev, 'deprecated']
                                )}>
                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 hover:bg-slate-100 cursor-pointer flex items-center gap-1 border-slate-300 dark:border-slate-600">
                                        <Archive className="h-3 w-3" /> Deprecated
                                    </Badge>
                                </button>
                            )}
                            {status === 'duplicate' && (
                                <button onClick={() => setPeersDialogInfo({ settingName, settingValue, policyName, status: 'duplicate', peers })}>
                                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 cursor-pointer flex items-center gap-1">
                                        <Copy className="h-3 w-3" /> Duplicate
                                    </Badge>
                                </button>
                            )}
                            {status === 'conflict' && (
                                <button onClick={() => setPeersDialogInfo({ settingName, settingValue, policyName, status: 'conflict', peers })}>
                                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 cursor-pointer flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Conflict
                                    </Badge>
                                </button>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'settingName',
            label: 'Setting Name',
            width: 240,
            minWidth: 160,
            render: (value: unknown, row: Record<string, unknown>) => {
                const omaUri = row.omaUri as string | null | undefined;
                const settingId = row.settingId as string | undefined;
                const catalogMigrationInfo = row.catalogMigrationInfo as OmaCatalogMigrationInfo | null | undefined;
                const name = String(value ?? '');
                const showId = settingId && name === settingId;
                return (
                    <div>
                        <div className="font-medium text-foreground">{name}</div>
                        {omaUri && <div className="text-xs text-muted-foreground truncate" title={omaUri}>{omaUri}</div>}
                        {showId && <div className="text-xs text-muted-foreground truncate" title={settingId}>{settingId}</div>}
                        {/* OMA-URI badge — shown for all OMA-URI settings without a catalog match */}
                        {omaUri && !catalogMigrationInfo && (
                            <Badge
                                variant="outline"
                                className="mt-1 text-xs text-gray-500 border-gray-300 dark:text-gray-400 dark:border-gray-600"
                            >
                                OMA-URI
                            </Badge>
                        )}
                        {/* Amber indicator for OMA-URI settings that have a catalog migration available */}
                        {omaUri && catalogMigrationInfo && (
                            <Badge
                                variant="outline"
                                className="mt-1 text-xs border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20"
                            >
                                ⚠ Migration available
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'settingValue',
            label: 'Setting Value',
            width: 180,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const str = String(value ?? '');
                const status = row.status as string;
                return (
                    <div className={`text-sm ${status === 'conflict' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`} title={str}>
                        {str.length > 50 ? `${str.slice(0, 50)}…` : str}
                    </div>
                );
            }
        },
        {
            key: 'platform',
            label: 'Platform',
            width: 100,
            minWidth: 80,
            render: (value: unknown) => (
                <span className="text-xs text-muted-foreground">{String(value ?? 'N/A')}</span>
            )
        },
        {
            key: 'isAssigned',
            label: 'Assigned',
            width: 110,
            minWidth: 90,
            render: (value: unknown, row: Record<string, unknown>) => {
                const isAssigned = Boolean(value);
                const assignments = row.assignments as PolicyAssignment[];
                const policyName = String(row.policyName ?? '');
                if (!isAssigned) {
                    return <Badge variant="secondary" className="text-xs">Not Assigned</Badge>;
                }
                return (
                    <button
                        onClick={() => setAssignmentInfo({ policyName, assignments: assignments ?? [] })}
                        className="text-left"
                    >
                        <Badge
                            variant="default"
                            className="text-xs bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer flex items-center gap-1"
                        >
                            <Users className="h-3 w-3" />
                            Assigned
                        </Badge>
                    </button>
                );
            }
        },
        {
            key: 'childSettingInfo',
            label: 'Child Settings',
            width: 160,
            minWidth: 120,
            render: (value: unknown, row: Record<string, unknown>) => {
                const children = value as { name: string; value: string }[] | null;
                const rowId = String(row._id ?? '');
                if (!children || children.length === 0) {
                    return <span className="text-xs text-muted-foreground">—</span>;
                }
                const searchLower = activeSearch.toLowerCase().trim();
                const matching = searchLower
                    ? children.filter(c => c.name.toLowerCase().includes(searchLower) || c.value.toLowerCase().includes(searchLower))
                    : [];
                const isExpanded = expandedRows.has(rowId) || matching.length > 0;
                return (
                    <div className="space-y-1">
                        <button
                            onClick={e => { e.stopPropagation(); toggleRowExpansion(rowId); }}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            {children.length} child settings
                            {matching.length > 0 && <span className="text-amber-600 font-semibold">({matching.length} match)</span>}
                        </button>
                        {isExpanded && (
                            <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                                {children.map((c, i) => {
                                    const isMatch = !!(searchLower && (c.name.toLowerCase().includes(searchLower) || c.value.toLowerCase().includes(searchLower)));
                                    return (
                                        <div key={i} className={`text-xs rounded px-1 ${isMatch ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                                            <div className={`font-medium ${isMatch ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{c.name}</div>
                                            <div className="text-gray-500 truncate" title={c.value}>{c.value.length > 30 ? `${c.value.slice(0, 30)}…` : c.value}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            }
        }
    ], [activeSearch, expandedRows, sourceLabel, sourceBadgeClass, toggleRowExpansion, setPeersDialogInfo]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600 dark:text-white">Policy Settings</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        View all settings across Settings Catalog, Device Configuration and Group Policy
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
                                exportOptions={[{ label: 'Export', data: exportData, formats: ['csv', 'pdf', 'html'] }]}
                                variant="outline"
                                size="sm"
                                tenantId={instance.getActiveAccount()?.tenantId || accounts[0]?.tenantId || ''}
                            />
                        </>
                    ) : (
                        <>
                            <Button onClick={fetchSettings} disabled={loading} className="flex items-center gap-2">
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Load Settings
                            </Button>
                            {loading && (
                                <Button
                                    onClick={() => { cancel(); setSettings([]); setError(null); setLoading(false); setIsCancelled(true); }}
                                    variant="destructive" size="sm" className="flex items-center gap-2"
                                >
                                    <XCircle className="h-4 w-4" /> Cancel
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Welcome / empty state */}
            {settings.length === 0 && !loading && !error && !isCancelled && (
                <Card className="relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-6"><Database className="h-16 w-16 mx-auto" /></div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Ready to view your policy settings</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                                Click &quot;Load Settings&quot; to fetch all settings across Settings Catalog, Device Configuration and Group Policy.
                            </p>
                            <Button onClick={fetchSettings} className="flex items-center gap-2 mx-auto" size="lg">
                                <Database className="h-5 w-5" /> Load Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress */}
            {loading && (
                <>
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{progressLabel}</span>
                                <span className="text-muted-foreground font-mono">{completedSteps}/{FETCH_STEPS.length}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex gap-6">
                                {FETCH_STEPS.map((step, i) => (
                                    <div key={step.source} className={`flex items-center gap-1 text-xs ${i < completedSteps ? 'text-green-600 dark:text-green-400' : i === completedSteps ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-muted-foreground'}`}>
                                        {i < completedSteps ? '✓' : i === completedSteps ? '⟳' : '○'} {step.label}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <AssignmentsTableSkeleton showStats={false} showFilters={false} tableRows={12} tableColumns={6} />
                </>
            )}

            {/* Error */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-4 flex items-center gap-2 text-red-600">
                        <X className="h-5 w-5" /><span className="font-medium">Error:</span><span>{error}</span>
                    </CardContent>
                </Card>
            )}

            {/* Cancelled */}
            {isCancelled && !loading && (
                <CancelledCard
                    onRetry={() => { setIsCancelled(false); fetchSettings(); }}
                    title="Loading Cancelled"
                    description="Settings loading was cancelled. Click below to load settings again."
                    buttonText="Load Settings"
                />
            )}

            {/* Stats + Filters */}
            {settings.length > 0 && !loading && (
                <>
                    {/* Filters card */}
                    <Card className="relative transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between">
                                <button
                                    onClick={() => setIsFiltersExpanded(v => !v)}
                                    className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
                                >
                                    <Filter className="h-5 w-5" />
                                    Filters
                                    {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <div className="flex items-center gap-2">
                                    {!isFiltersExpanded && (
                                        <Badge variant="secondary" className="text-xs">{activeFilterCount} active</Badge>
                                    )}
                                    {activeFilterCount > 0 && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <X className="h-4 w-4 mr-1" /> Clear All
                                        </Button>
                                    )}
                                </div>
                            </CardTitle>
                            {/* Collapsed active filter chips */}
                            {!isFiltersExpanded && activeFilterCount > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                    {sourceFilter.map(f => <Badge key={f} variant="outline" className="text-xs">Source: {sourceLabel[f] ?? f}</Badge>)}
                                    {platformFilter.map(f => <Badge key={f} variant="outline" className="text-xs">Platform: {f}</Badge>)}
                                    {statusFilter.map(f => <Badge key={f} variant="outline" className="text-xs">Status: {f}</Badge>)}
                                    {assignedFilter.map(f => <Badge key={f} variant="outline" className="text-xs">Assigned: {f === 'true' ? 'Yes' : 'No'}</Badge>)}
                                </div>
                            )}
                        </CardHeader>

                        {isFiltersExpanded && (
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Source</label>
                                        <MultiSelect options={sourceOptions} selected={sourceFilter} onChange={setSourceFilter} placeholder="All sources…" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Platform</label>
                                        <MultiSelect options={platformOptions} selected={platformFilter} onChange={setPlatformFilter} placeholder="All platforms…" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Status</label>
                                        <MultiSelect options={statusOptions} selected={statusFilter} onChange={setStatusFilter} placeholder="All statuses…" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Assignment</label>
                                        <MultiSelect options={assignedOptions} selected={assignedFilter} onChange={setAssignedFilter} placeholder="All…" />
                                    </div>
                                </div>
                                {activeFilterCount > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Showing {filteredSettings.length} of {stats.total} settings
                                    </p>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    {/* Clickable stats summary — below the filter card */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {/* Total — clears all source/status filters */}
                        <button
                            onClick={clearFilters}
                            title="Show all settings"
                            className="focus:outline-none"
                        >
                            <Badge
                                variant={activeFilterCount === 0 ? 'default' : 'secondary'}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {stats.total} total settings
                            </Badge>
                        </button>

                        {/* Source badges */}
                        {(
                            [
                                { value: 'catalog',      count: stats.catalog,      label: 'Settings Catalog', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
                                { value: 'deviceconfig', count: stats.deviceconfig, label: 'Device Config',     cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700' },
                                { value: 'grouppolicy',  count: stats.grouppolicy,  label: 'Group Policy',      cls: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700' },
                            ] as const
                        ).map(({ value, count, label, cls }) => {
                            const active = sourceFilter.includes(value);
                            return (
                                <button
                                    key={value}
                                    onClick={() => setSourceFilter(active ? sourceFilter.filter(f => f !== value) : [...sourceFilter, value])}
                                    title={active ? `Remove "${label}" filter` : `Filter by ${label}`}
                                    className="focus:outline-none"
                                >
                                    <Badge
                                        variant="outline"
                                        className={`cursor-pointer hover:opacity-80 transition-opacity ${cls} ${active ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                                    >
                                        {count} {label}
                                    </Badge>
                                </button>
                            );
                        })}

                        {/* Duplicate badge */}
                        {stats.duplicates > 0 && (() => {
                            const active = statusFilter.includes('duplicate');
                            return (
                                <button
                                    onClick={() => setStatusFilter(active ? statusFilter.filter(f => f !== 'duplicate') : [...statusFilter, 'duplicate'])}
                                    title={active ? 'Remove duplicate filter' : 'Filter duplicates'}
                                    className="focus:outline-none"
                                >
                                    <Badge
                                        variant="outline"
                                        className={`cursor-pointer hover:opacity-80 transition-opacity bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-yellow-500' : ''}`}
                                    >
                                        <Copy className="h-3 w-3" /> {stats.duplicates} duplicate{stats.duplicates !== 1 ? 's' : ''}
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* Conflict badge */}
                        {stats.conflicts > 0 && (() => {
                            const active = statusFilter.includes('conflict');
                            return (
                                <button
                                    onClick={() => setStatusFilter(active ? statusFilter.filter(f => f !== 'conflict') : [...statusFilter, 'conflict'])}
                                    title={active ? 'Remove conflict filter' : 'Filter conflicts'}
                                    className="focus:outline-none"
                                >
                                    <Badge
                                        variant="outline"
                                        className={`cursor-pointer hover:opacity-80 transition-opacity bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-red-500' : ''}`}
                                    >
                                        <AlertTriangle className="h-3 w-3" /> {stats.conflicts} conflict{stats.conflicts !== 1 ? 's' : ''}
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* Deprecated badge */}
                        {stats.deprecated > 0 && (() => {
                            const active = statusFilter.includes('deprecated');
                            return (
                                <button
                                    onClick={() => setStatusFilter(active ? statusFilter.filter(f => f !== 'deprecated') : [...statusFilter, 'deprecated'])}
                                    title={active ? 'Remove deprecated filter' : 'Filter deprecated'}
                                    className="focus:outline-none"
                                >
                                    <Badge
                                        variant="outline"
                                        className={`cursor-pointer hover:opacity-80 transition-opacity bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 border-slate-300 dark:border-slate-600 flex items-center gap-1 ${active ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                                    >
                                        <Archive className="h-3 w-3" /> {stats.deprecated} deprecated
                                    </Badge>
                                </button>
                            );
                        })()}

                        {/* Showing X of Y when any filter active */}
                        {activeFilterCount > 0 && (
                            <span className="text-xs text-muted-foreground self-center ml-1">
                                — showing {filteredSettings.length} of {stats.total}
                            </span>
                        )}
                    </div>
                </>
            )}

            {/* Table */}
            {settings.length > 0 && !error && (
                <DataTable
                    data={filteredSettings}
                    columns={columns}
                    showPagination={true}
                    showSearch={true}
                    searchPlaceholder="Search settings, policies, values…"
                    onSearchChange={setActiveSearch}
                    className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10"
                    expandedRowRender={(row) => {
                        const migrationInfo = row.catalogMigrationInfo as OmaCatalogMigrationInfo | null | undefined;
                        const omaUri = row.omaUri as string | null | undefined;
                        if (!omaUri || !migrationInfo) return null;
                        return (
                            <OmaMigrationBanner
                                info={migrationInfo}
                                settingName={String(row.settingName ?? '')}
                            />
                        );
                    }}
                />
            )}

            {/* Conflict/Duplicate peers dialog */}
            <ConflictPeersDialog
                info={peersDialogInfo}
                onClose={() => setPeersDialogInfo(null)}
            />

            {/* Assignments dialog */}
            <AssignmentsDialog
                info={assignmentInfo}
                onClose={() => setAssignmentInfo(null)}
                onGroupClick={(groupId) => {
                    setAssignmentInfo(null);
                    setSelectedGroupId(groupId);
                    setIsGroupDialogOpen(true);
                }}
            />

            {/* Group details dialog */}
            <GroupDetailsDialog
                groupId={selectedGroupId}
                isOpen={isGroupDialogOpen}
                onClose={() => { setIsGroupDialogOpen(false); setSelectedGroupId(null); }}
            />
        </div>
    );
}
