'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/DataTable';
import { ExportButton, ExportData } from '@/components/ExportButton';
import { AssignmentsTableSkeleton } from '@/components/AssignmentsTableSkeleton';
import { useApiRequest } from '@/hooks/useApiRequest';
import { ApiError } from '@/lib/apiRequest';
import { INTUNE_RBAC_MAP_ENDPOINT } from '@/lib/constants';
import {
    IntuneRbacAdmin,
    IntuneRbacCellState,
    IntuneRbacEnvelope,
    IntuneRbacFlagKind,
    IntuneRbacGroup,
    IntuneRbacMap,
    IntuneRbacPrincipal,
} from '@/types/rbacMap';
import { AlertTriangle, Info, KeyRound, RefreshCw, Shield, Tags, Users, X } from 'lucide-react';

const EXPORT_FORMATS: ('csv' | 'pdf' | 'html' | 'markdown')[] = ['csv', 'pdf', 'html', 'markdown'];

const FLAG_LABELS: Record<IntuneRbacFlagKind, string> = {
    DefaultTagOnly: 'Default tag only',
    BroadScope: 'All users / all devices',
    DestructiveCustomRole: 'Custom role can wipe/retire/delete',
    EmptyAssignment: 'Empty assignment',
    NestedOnlyAdmin: 'Only through nested groups',
    MembershipUnknown: 'Membership unknown',
    RoleUnknown: 'Role unknown',
};

const SCOPE_TYPE_LABELS: Record<string, string> = {
    resourceScope: 'Scope groups',
    allDevices: 'All devices',
    allLicensedUsers: 'All licensed users',
    allDevicesAndLicensedUsers: 'All devices and all licensed users',
};

function stateLabel(state: IntuneRbacCellState): string {
    if (state === 'Granted') return 'Granted';
    if (state === 'MergedOnly') return 'Merged only';
    return '';
}

function StateBadge({ state }: { state: IntuneRbacCellState }) {
    if (state === 'None') return <span className="text-muted-foreground">-</span>;
    if (state === 'Granted') {
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0">Granted</Badge>;
    }
    return (
        <span title="Granted only because permissions merge across role assignments. Lost under scoped permissions.">
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0" data-testid="merged-only-badge">
                Merged only
            </Badge>
        </span>
    );
}

function groupLabel(group: IntuneRbacGroup): string {
    const count = group.memberCount === null || group.memberCount === undefined ? 'count unknown' : `${group.memberCount} members`;
    return group.found ? `${group.displayName} (${count})` : `${group.displayName} (not found)`;
}

// A 403 is either Microsoft Graph refusing the role read (a ProblemDetails whose `detail` says what is missing) or a
// check before it with a plain `message`. The error banner reads only
// `message`, so the page shows the explanation itself.
function forbiddenMessage(err: ApiError): string {
    let body = err.responseData;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            body = null;
        }
    }
    const detail = (body as { detail?: unknown } | null | undefined)?.detail;
    return typeof detail === 'string' && detail ? detail : err.message;
}

/** Check > RBAC map: who can do what, where, in Intune RBAC. */
export default function IntuneRbacMapPage() {
    // The explanation of a 403, set by onForbidden while `request` runs and read by the caller right after it.
    const forbiddenRef = useRef<string | null>(null);
    const { request } = useApiRequest({ onForbidden: err => { forbiddenRef.current = forbiddenMessage(err); } });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [map, setMap] = useState<IntuneRbacMap | null>(null);

    const [principalLoading, setPrincipalLoading] = useState(false);
    const [principalError, setPrincipalError] = useState<string | null>(null);
    const [principal, setPrincipal] = useState<IntuneRbacPrincipal | null>(null);

    const loadMap = useCallback(async () => {
        setLoading(true);
        setError(null);
        setPrincipal(null);
        forbiddenRef.current = null;
        try {
            const response = await request<IntuneRbacEnvelope<IntuneRbacMap>>(INTUNE_RBAC_MAP_ENDPOINT, { method: 'GET' });
            if (response?.data?.data) {
                setMap(response.data.data);
            } else {
                setError(forbiddenRef.current ?? 'The Intune RBAC map could not be read.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The Intune RBAC map could not be read.');
        } finally {
            setLoading(false);
        }
        // Loads with the first `request`: it gets a new identity after every error, and an effect on it would repeat a failed request.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        void loadMap();
    }, [loadMap]);

    const openAdmin = useCallback(async (admin: IntuneRbacAdmin) => {
        setPrincipalLoading(true);
        setPrincipalError(null);
        setPrincipal(null);
        forbiddenRef.current = null;
        try {
            const response = await request<IntuneRbacEnvelope<IntuneRbacPrincipal>>(
                `${INTUNE_RBAC_MAP_ENDPOINT}/principals/${encodeURIComponent(admin.userId)}`,
                { method: 'GET' }
            );
            if (response?.data?.data) {
                setPrincipal(response.data.data);
            } else {
                setPrincipalError(forbiddenRef.current ?? `The permissions of ${admin.displayName} could not be read.`);
            }
        } catch (err) {
            setPrincipalError(err instanceof Error ? err.message : `The permissions of ${admin.displayName} could not be read.`);
        } finally {
            setPrincipalLoading(false);
        }
    }, [request]);

    // ── table rows ──

    const adminRows = useMemo(() => (map?.admins ?? []).map(a => ({
        ...a,
        roles: a.roleNames.join(', '),
        tags: a.scopeTagNames.join(', '),
        flagLabels: a.flags.map(f => FLAG_LABELS[f]).join(', '),
    })) as unknown as Record<string, unknown>[], [map]);

    const assignmentRows = useMemo(() => (map?.assignments ?? []).map(a => ({
        ...a,
        role: a.roleDisplayName ?? 'Unknown role',
        roleType: a.roleIsBuiltIn === null || a.roleIsBuiltIn === undefined ? '' : a.roleIsBuiltIn ? 'Built-in' : 'Custom',
        members: a.memberGroups.map(g => g.displayName).join(', '),
        scope: a.scopeType === 'resourceScope' ? a.scopeGroups.map(groupLabel).join(', ') : SCOPE_TYPE_LABELS[a.scopeType] ?? a.scopeType,
        tags: a.scopeTags.map(t => t.displayName).join(', '),
        admins: a.membershipUnknown ? `${a.adminCount}+ (membership partly unknown)` : String(a.adminCount),
    })) as unknown as Record<string, unknown>[], [map]);

    const tagAccessRows = useMemo(() => (map?.scopeTagAccess ?? []).map(a => ({
        ...a,
        writeLabel: stateLabel(a.write),
        deleteLabel: stateLabel(a.delete),
        wipeLabel: stateLabel(a.wipe),
    })) as unknown as Record<string, unknown>[], [map]);

    const flagRows = useMemo(() => (map?.flags ?? []).map(f => ({
        ...f,
        kindLabel: FLAG_LABELS[f.kind],
    })) as unknown as Record<string, unknown>[], [map]);

    const matrixRows = useMemo(() => {
        if (!principal) return [] as Record<string, unknown>[];
        return principal.permissions.map(p => {
            const row: Record<string, unknown> = { category: p.category, operation: p.operation, action: p.action };
            principal.scopeTags.forEach(tag => {
                const cell = p.cells.find(c => c.scopeTagId === tag.id);
                row[`tag_${tag.id}`] = cell?.state ?? 'None';
            });
            return row;
        });
    }, [principal]);

    const principalAssignmentRows = useMemo(() => (principal?.assignments ?? []).map(a => ({
        ...a,
        role: `${a.roleDisplayName ?? 'Unknown role'}${a.roleIsBuiltIn === false ? ' (custom)' : ''}`,
        viaLabel: a.via.join('; '),
        scope: a.scopeType === 'resourceScope' ? a.scopeGroups.map(groupLabel).join(', ') || '-' : SCOPE_TYPE_LABELS[a.scopeType] ?? a.scopeType,
        tags: a.scopeTags.map(t => t.displayName).join(', '),
    })) as unknown as Record<string, unknown>[], [principal]);

    const stats = map ? [
        { label: 'Roles', value: map.summary.roleCount },
        { label: 'Custom roles', value: map.summary.customRoleCount },
        { label: 'Assignments', value: map.summary.assignmentCount },
        { label: 'Admins', value: map.summary.adminCount },
        { label: 'Hygiene flags', value: map.summary.flagCount },
    ] : [];

    // ── exports ──

    const adminsExport: ExportData = {
        data: adminRows,
        columns: [
            { key: 'displayName', label: 'Admin' },
            { key: 'userPrincipalName', label: 'UPN' },
            { key: 'assignmentCount', label: 'Assignments' },
            { key: 'path', label: 'Path' },
            { key: 'roles', label: 'Roles' },
            { key: 'tags', label: 'Scope tags' },
            { key: 'flagLabels', label: 'Flags' },
        ],
        filename: 'intune-rbac-map-admins',
        title: 'Intune RBAC map: admins',
        description: 'Every user an Intune role assignment reaches, with the path, roles and scope tags.',
        stats,
    };

    const assignmentsExport: ExportData = {
        data: assignmentRows,
        columns: [
            { key: 'displayName', label: 'Assignment' },
            { key: 'role', label: 'Role' },
            { key: 'roleType', label: 'Role type' },
            { key: 'members', label: 'Member groups' },
            { key: 'scope', label: 'Scope (groups)' },
            { key: 'tags', label: 'Scope tags' },
            { key: 'admins', label: 'Admins' },
        ],
        filename: 'intune-rbac-map-assignments',
        title: 'Intune RBAC map: role assignments',
        stats,
    };

    const tagAccessExport: ExportData = {
        data: tagAccessRows,
        columns: [
            { key: 'scopeTagName', label: 'Scope tag' },
            { key: 'displayName', label: 'Admin' },
            { key: 'userPrincipalName', label: 'UPN' },
            { key: 'writeLabel', label: 'Write' },
            { key: 'deleteLabel', label: 'Delete' },
            { key: 'wipeLabel', label: 'Wipe / retire' },
        ],
        filename: 'intune-rbac-map-scope-tags',
        title: 'Intune RBAC map: who can write, delete or wipe per scope tag',
        description: '"Merged only" means the admin has it only while permissions merge across role assignments.',
    };

    const flagsExport: ExportData = {
        data: flagRows,
        columns: [
            { key: 'kindLabel', label: 'Flag' },
            { key: 'objectType', label: 'Object type' },
            { key: 'objectName', label: 'Object' },
            { key: 'reason', label: 'Reason' },
        ],
        filename: 'intune-rbac-map-hygiene',
        title: 'Intune RBAC map: hygiene flags',
    };

    const principalExport: ExportData | null = principal ? {
        data: matrixRows.map(r => {
            const out: Record<string, unknown> = { ...r };
            principal.scopeTags.forEach(t => { out[`tag_${t.id}`] = stateLabel(r[`tag_${t.id}`] as IntuneRbacCellState); });
            return out;
        }),
        columns: [
            { key: 'category', label: 'Category' },
            { key: 'operation', label: 'Permission' },
            ...principal.scopeTags.map(t => ({ key: `tag_${t.id}`, label: t.displayName })),
        ],
        filename: 'intune-rbac-map-admin',
        title: `Intune RBAC map: ${principal.displayName}`,
        description: `${principal.userPrincipalName ?? ''} - ${principal.mergedOnlyCellCount} permission(s) only through merging.`,
        stats: [
            { label: 'Assignments', value: principal.assignments.length },
            { label: 'Granted', value: principal.grantedCellCount },
            { label: 'Merged only', value: principal.mergedOnlyCellCount },
        ],
    } : null;

    const wouldLoseExport: ExportData | null = principal ? {
        data: principal.wouldLose as unknown as Record<string, unknown>[],
        columns: [
            { key: 'category', label: 'Category' },
            { key: 'operation', label: 'Permission' },
            { key: 'scopeTagName', label: 'Scope tag' },
            { key: 'action', label: 'Action' },
        ],
        filename: 'intune-rbac-map-would-lose',
        title: `Would lose under scoped permissions: ${principal.displayName}`,
    } : null;

    // ── columns ──

    const adminColumns = [
        { key: 'displayName', label: 'Admin', sortable: true, searchable: true, minWidth: 160 },
        { key: 'userPrincipalName', label: 'UPN', sortable: true, searchable: true, minWidth: 200 },
        { key: 'assignmentCount', label: 'Assignments', sortable: true, width: 110 },
        {
            key: 'path', label: 'Path', sortable: true, width: 110,
            render: (value: unknown) => <Badge variant="outline">{String(value)}</Badge>,
        },
        { key: 'roles', label: 'Roles', searchable: true, minWidth: 200 },
        { key: 'tags', label: 'Scope tags', searchable: true, minWidth: 160 },
        {
            key: 'flagLabels', label: 'Flags', minWidth: 160,
            render: (value: unknown) => value ? <span className="text-amber-700 dark:text-amber-400">{String(value)}</span> : <span className="text-muted-foreground">-</span>,
        },
    ];

    const tagAccessColumns = [
        { key: 'scopeTagName', label: 'Scope tag', sortable: true, searchable: true, minWidth: 140 },
        { key: 'displayName', label: 'Admin', sortable: true, searchable: true, minWidth: 160 },
        { key: 'userPrincipalName', label: 'UPN', sortable: true, searchable: true, minWidth: 200 },
        { key: 'write', label: 'Write', width: 120, render: (value: unknown) => <StateBadge state={value as IntuneRbacCellState} /> },
        { key: 'delete', label: 'Delete', width: 120, render: (value: unknown) => <StateBadge state={value as IntuneRbacCellState} /> },
        { key: 'wipe', label: 'Wipe / retire', width: 120, render: (value: unknown) => <StateBadge state={value as IntuneRbacCellState} /> },
    ];

    const flagColumns = [
        { key: 'kindLabel', label: 'Flag', sortable: true, searchable: true, minWidth: 180 },
        { key: 'objectType', label: 'Object type', sortable: true, width: 130 },
        { key: 'objectName', label: 'Object', sortable: true, searchable: true, minWidth: 180 },
        { key: 'reason', label: 'Reason', searchable: true, minWidth: 320 },
    ];

    const principalAssignmentColumns = [
        { key: 'assignmentName', label: 'Assignment', sortable: true, minWidth: 160 },
        { key: 'role', label: 'Role', sortable: true, minWidth: 160 },
        { key: 'path', label: 'Path', width: 100, render: (value: unknown) => <Badge variant="outline">{String(value)}</Badge> },
        { key: 'viaLabel', label: 'Via', minWidth: 180 },
        { key: 'scope', label: 'Scope (groups)', minWidth: 200 },
        { key: 'tags', label: 'Scope tags', minWidth: 140 },
    ];

    const matrixColumns = principal ? [
        { key: 'category', label: 'Category', sortable: true, searchable: true, minWidth: 160 },
        { key: 'operation', label: 'Permission', sortable: true, searchable: true, minWidth: 140 },
        ...principal.scopeTags.map(tag => ({
            key: `tag_${tag.id}`,
            label: tag.displayName,
            width: 130,
            render: (value: unknown) => <StateBadge state={(value as IntuneRbacCellState) ?? 'None'} />,
        })),
    ] : [];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Intune RBAC map</h1>
                    <p className="text-muted-foreground mt-2">
                        Who can do what, where: Intune role assignments, the admins they reach, scope tags and the effect of merging.
                    </p>
                </div>
                <Button onClick={() => void loadMap()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <CardContent className="pt-6 space-y-2 text-sm text-blue-900 dark:text-blue-100">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>
                            <strong>Merged only</strong> marks a permission an admin has only because Intune merges their role assignments today:
                            the action comes from one assignment and the scope tag from another. Under scoped permissions these are lost.
                            The merge rule shown here is IntuneAssistant&apos;s reading of Microsoft&apos;s documentation; check it on a test tenant before acting on it.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>
                            Entra roles that bypass Intune RBAC (Global Administrator, Intune Administrator) are not part of this map; the{' '}
                            <Link href="/rbac/intune-admin-analyzer" className="underline">Admin roles</Link> check covers them.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                    <CardContent className="pt-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">{error}</span>
                    </CardContent>
                </Card>
            )}

            {loading && <AssignmentsTableSkeleton showStats={true} statsCount={4} showFilters={true} tableRows={12} tableColumns={6} />}

            {!loading && map && (
                <>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                        {stats.map(stat => (
                            <Card key={stat.label}>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {map.warnings.length > 0 && (
                        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                            <CardContent className="pt-6 space-y-1 text-sm text-amber-800 dark:text-amber-300">
                                {map.warnings.map(w => (
                                    <div key={w} className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{w}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="admins" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="admins"><Users className="h-4 w-4 mr-2" />By admin</TabsTrigger>
                            <TabsTrigger value="tags"><Tags className="h-4 w-4 mr-2" />By scope tag</TabsTrigger>
                            <TabsTrigger value="hygiene"><AlertTriangle className="h-4 w-4 mr-2" />Hygiene ({map.flags.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="admins" className="space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>Admins</CardTitle>
                                        <CardDescription>Every user an Intune role assignment reaches. Select an admin to see their permission matrix.</CardDescription>
                                    </div>
                                    <ExportButton
                                        variant="outline"
                                        exportOptions={[
                                            { label: 'Admins', data: adminsExport, formats: EXPORT_FORMATS },
                                            { label: 'Role assignments', data: assignmentsExport, formats: EXPORT_FORMATS },
                                        ]}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        data={adminRows}
                                        columns={adminColumns}
                                        showSearch
                                        searchPlaceholder="Search admins, roles or scope tags..."
                                        onRowClick={row => void openAdmin(row as unknown as IntuneRbacAdmin)}
                                    />
                                </CardContent>
                            </Card>

                            {principalLoading && <AssignmentsTableSkeleton showStats={false} showFilters={false} tableRows={8} tableColumns={5} />}

                            {principalError && (
                                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                                    <CardContent className="pt-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        <span className="font-medium">{principalError}</span>
                                    </CardContent>
                                </Card>
                            )}

                            {principal && principalExport && wouldLoseExport && (
                                <Card data-testid="rbac-principal">
                                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <KeyRound className="h-5 w-5" />
                                                {principal.displayName}
                                            </CardTitle>
                                            <CardDescription>
                                                {principal.userPrincipalName} - {principal.assignments.length} assignment(s),{' '}
                                                {principal.grantedCellCount} granted, {principal.mergedOnlyCellCount} merged only
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ExportButton
                                                variant="outline"
                                                exportOptions={[
                                                    { label: 'Permission matrix', data: principalExport, formats: EXPORT_FORMATS },
                                                    { label: 'Would lose', data: wouldLoseExport, formats: EXPORT_FORMATS },
                                                ]}
                                            />
                                            <Button variant="ghost" size="sm" onClick={() => setPrincipal(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {principal.membershipUnknown && (
                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                Some group memberships could not be read, so another assignment may reach this admin too.
                                            </p>
                                        )}

                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Assignments that reach this admin</h3>
                                            <DataTable
                                                data={principalAssignmentRows}
                                                columns={principalAssignmentColumns}
                                                showPagination={false}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Effective permissions per scope tag</h3>
                                            <DataTable
                                                data={matrixRows}
                                                columns={matrixColumns}
                                                showSearch
                                                searchPlaceholder="Search permissions..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Would lose under scoped permissions ({principal.wouldLose.length})</h3>
                                            {principal.wouldLose.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">Nothing: every permission is granted by a single assignment on its own scope tags.</p>
                                            ) : (
                                                <DataTable
                                                    data={principal.wouldLose as unknown as Record<string, unknown>[]}
                                                    columns={[
                                                        { key: 'category', label: 'Category', sortable: true, searchable: true },
                                                        { key: 'operation', label: 'Permission', sortable: true, searchable: true },
                                                        { key: 'scopeTagName', label: 'Scope tag', sortable: true, searchable: true },
                                                    ]}
                                                    showSearch
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="tags">
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>Who can write, delete or wipe, per scope tag</CardTitle>
                                        <CardDescription>Read-only access is left out. &quot;Merged only&quot; is lost under scoped permissions.</CardDescription>
                                    </div>
                                    <ExportButton variant="outline" exportOptions={[{ label: 'By scope tag', data: tagAccessExport, formats: EXPORT_FORMATS }]} />
                                </CardHeader>
                                <CardContent>
                                    <DataTable data={tagAccessRows} columns={tagAccessColumns} showSearch searchPlaceholder="Search scope tags or admins..." />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="hygiene">
                            <Card>
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardTitle>Hygiene flags</CardTitle>
                                        <CardDescription>Objects worth a second look in an access review.</CardDescription>
                                    </div>
                                    <ExportButton variant="outline" exportOptions={[{ label: 'Hygiene flags', data: flagsExport, formats: EXPORT_FORMATS }]} />
                                </CardHeader>
                                <CardContent>
                                    <DataTable data={flagRows} columns={flagColumns} showSearch searchPlaceholder="Search flags..." />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}
