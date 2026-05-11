'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft, Download, RefreshCw, Edit2, RotateCcw,
    Search, Shield, ShieldCheck, Users, FileSpreadsheet, CheckCircle2,
    Filter, X, ChevronDown, ChevronUp, CirclePlus, CircleMinus, Sparkles,
    Eye, SendHorizonal, AlertTriangle, Monitor, Crown, ExternalLink,
} from 'lucide-react';
import {
    ASSIGNMENTS_FILTERS_ENDPOINT,
    GROUPS_LIST_ENDPOINT,
    ROLE_SCOPETAGS_ENDPOINT,
    MIGRATION_BUILDER_SESSION_KEY,
    MIGRATION_BUILDER_DEPLOYMENT_KEY,
} from '@/lib/constants';
import { useApiRequest } from '@/hooks/useApiRequest';
import { AssignmentFilter } from '@/types/assignmentFilter';
import { useCustomer, hasAssignmentsManagerLicense } from '@/contexts/CustomerContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SourceAssignment extends Record<string, unknown> {
    resourceType: string;
    subResourceType: string;
    assignmentType: string;
    platform: string | null;
    isAssigned: boolean;
    targetId: string | null;
    targetName: string;
    resourceId: string;
    resourceName: string | null;
    filterId: string | null;
    filterType: string;
    assignmentDirection: string;
    isExcluded: boolean;
    scopeTagIds?: string[];
}

interface GroupItem {
    id: string;
    displayName: string;
    description: string | null;
    membershipRule: string | null;
}

interface RoleScopeTag {
    id: string;
    displayName: string;
    isBuildIn: boolean;
}

type AssignmentAction = 'Add' | 'Remove' | 'NoAssignment' | 'Replace';
type FilterType = 'Include' | 'Exclude' | 'None';

interface EditableFields {
    groupName: string;
    groupId: string | null;
    assignmentAction: AssignmentAction;
    filterName: string | null;
    filterId: string | null;
    filterType: FilterType;
    scopeTagIds: string[];
}

interface BuilderRow extends EditableFields {
    id: string;
    policyName: string;
    resourceType: string;
    platform: string;
    assignmentDirection: string;
    original: EditableFields;
    isModified: boolean;
    isGenerated?: boolean;
    ringLabel?: string;
}

interface RingTemplate {
    name: string;
    groupName: string;
    groupId: string | null;
    assignmentAction: AssignmentAction;
    filterId: string | null;
    filterName: string | null;
    filterType: FilterType;
    scopeTagIds: string[];
}

const EMPTY_TEMPLATE: RingTemplate = {
    name: 'Ring 1',
    groupName: '', groupId: null,
    assignmentAction: 'Add',
    filterId: null, filterName: null, filterType: 'None',
    scopeTagIds: [],
};

const SPECIAL_TARGETS = ['All Users', 'All Devices'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeFilterType(ft: string): FilterType {
    if (!ft || ft === 'None') return 'None';
    const l = ft.toLowerCase();
    if (l === 'include') return 'Include';
    if (l === 'exclude') return 'Exclude';
    return 'None';
}

function toBuilderRows(assignments: SourceAssignment[]): BuilderRow[] {
    return assignments.map((a, i) => {
        const filterType = normalizeFilterType(a.filterType);
        const base: EditableFields = {
            groupName: a.targetName || '',
            groupId: a.targetId || null,
            assignmentAction: a.targetName ? 'Add' : 'NoAssignment',
            filterName: null,
            filterId: a.filterId && a.filterId !== 'None' ? a.filterId : null,
            filterType,
            scopeTagIds: a.scopeTagIds || [],
        };
        return {
            id: `row-${i}-${Date.now()}`,
            policyName: a.resourceName || '',
            resourceType: a.resourceType,
            platform: a.platform || 'Unknown',
            assignmentDirection: a.assignmentDirection || 'Include',
            ...base,
            original: { ...base },
            isModified: false,
        };
    });
}

function rowIsModified(row: BuilderRow, next: Partial<EditableFields>): boolean {
    const merged = { ...row, ...next };
    return (
        merged.groupName !== row.original.groupName ||
        merged.assignmentAction !== row.original.assignmentAction ||
        merged.filterId !== row.original.filterId ||
        merged.filterType !== row.original.filterType ||
        JSON.stringify([...merged.scopeTagIds].sort()) !== JSON.stringify([...row.original.scopeTagIds].sort())
    );
}

// ─── Shared picker components (stable refs — outside page component) ──────────

interface GroupPickerProps {
    search: string; onSearch: (v: string) => void;
    selectedId: string | null; selectedName: string;
    onSelect: (name: string, id: string | null) => void;
    groups: GroupItem[];
}
function GroupPicker({ search, onSearch, selectedId, selectedName, onSelect, groups }: GroupPickerProps) {
    const filtered = useMemo(() => {
        const lq = search.toLowerCase().trim();
        if (!lq) return groups.slice(0, 60);
        return groups.filter(g => g.displayName.toLowerCase().includes(lq)).slice(0, 60);
    }, [groups, search]);
    return (
        <div className="space-y-1.5">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-sm" placeholder="Search groups…" value={search}
                    onChange={e => onSearch(e.target.value)} autoComplete="off" />
            </div>
            <div className="border rounded-md max-h-44 overflow-y-auto divide-y">
                {search.trim() && (
                    <button className="w-full text-left px-3 py-1.5 hover:bg-muted text-xs"
                        onClick={() => onSelect(search.trim(), null)}>
                        Use &quot;<strong>{search.trim()}</strong>&quot; as-is
                    </button>
                )}
                {SPECIAL_TARGETS.filter(s => !search.trim() || s.toLowerCase().includes(search.toLowerCase())).map(s => (
                    <button key={s} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted ${selectedName === s && !selectedId ? 'bg-muted font-semibold' : ''}`}
                        onClick={() => onSelect(s, null)}>{s}</button>
                ))}
                {filtered.length === 0 && !search.trim() && (
                    <p className="text-xs text-muted-foreground px-3 py-2">Type to search groups…</p>
                )}
                {filtered.map(g => (
                    <button key={g.id} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted ${selectedId === g.id ? 'bg-muted font-semibold' : ''}`}
                        onClick={() => onSelect(g.displayName, g.id)}>
                        <div>{g.displayName}</div>
                        {g.membershipRule && <div className="text-[10px] text-purple-500">Dynamic group</div>}
                    </button>
                ))}
            </div>
            {selectedName && <p className="text-[11px] text-muted-foreground">Selected: <strong>{selectedName}</strong></p>}
        </div>
    );
}

interface FilterPickerProps {
    search: string; onSearch: (v: string) => void;
    selectedId: string | null;
    onSelect: (id: string, name: string) => void; onClear: () => void;
    filters: AssignmentFilter[];
}
function FilterPicker({ search, onSearch, selectedId, onSelect, onClear, filters }: FilterPickerProps) {
    const filtered = useMemo(() => {
        const lq = search.toLowerCase().trim();
        if (!lq) return filters.slice(0, 60);
        return filters.filter(f => f.displayName.toLowerCase().includes(lq)).slice(0, 60);
    }, [filters, search]);
    return (
        <div className="space-y-1.5">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pl-8 h-8 text-sm" placeholder="Search filters…" value={search}
                    onChange={e => onSearch(e.target.value)} autoComplete="off" />
            </div>
            <div className="border rounded-md max-h-36 overflow-y-auto divide-y">
                <button className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted ${!selectedId ? 'bg-muted font-semibold' : ''}`} onClick={onClear}>
                    <span className="text-muted-foreground">— No Filter —</span>
                </button>
                {filtered.map(f => (
                    <button key={f.id} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted ${selectedId === f.id ? 'bg-muted font-semibold' : ''}`}
                        onClick={() => onSelect(f.id, f.displayName)}>
                        <div>{f.displayName}</div>
                        <div className="text-[10px] text-muted-foreground">{f.platform} · {f.assignmentFilterManagementType}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MigrationBuilderPage() {
    const router = useRouter();
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const { customerData } = useCustomer();
    const hasBuilderAccess = hasAssignmentsManagerLicense(customerData);

    const [rows, setRows] = useState<BuilderRow[]>([]);
    const [groups, setGroups] = useState<GroupItem[]>([]);
    const [filters, setFilters] = useState<AssignmentFilter[]>([]);
    const [scopeTags, setScopeTags] = useState<RoleScopeTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Template
    const [template, setTemplate] = useState<RingTemplate>({ ...EMPTY_TEMPLATE });
    const [templatePanelOpen, setTemplatePanelOpen] = useState(true);
    const [templateGroupSearch, setTemplateGroupSearch] = useState('');
    const [templateFilterSearch, setTemplateFilterSearch] = useState('');

    // Filters
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [policySearch, setPolicySearch] = useState('');
    const [scopeTagFilter, setScopeTagFilter] = useState<string[]>([]);
    const [resourceTypeFilter, setResourceTypeFilter] = useState<string[]>([]);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [actionFilter, setActionFilter] = useState<string[]>([]);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Review dialog
    const [reviewOpen, setReviewOpen] = useState(false);

    // Single-row edit dialog
    const [editingRow, setEditingRow] = useState<BuilderRow | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editGroupSearch, setEditGroupSearch] = useState('');
    const [editFilterSearch, setEditFilterSearch] = useState('');

    // ── Load from sessionStorage ──────────────────────────────────────────────
    useEffect(() => {
        const stored = sessionStorage.getItem(MIGRATION_BUILDER_SESSION_KEY);
        if (!stored) return;
        try {
            setRows(toBuilderRows(JSON.parse(stored)));
        } catch (e) {
            console.error('Failed to parse stored assignments', e);
        }
    }, []);

    useEffect(() => {
        if (!filters.length || !rows.length) return;
        setRows(prev => prev.map(row => {
            if (!row.filterId) return row;
            const f = filters.find(f => f.id === row.filterId);
            if (!f || f.displayName === row.filterName) return row;
            return { ...row, filterName: f.displayName, original: { ...row.original, filterName: f.displayName } };
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // ── Fetch reference data ──────────────────────────────────────────────────
    const fetchReferenceData = async () => {
        if (!accounts.length) return;
        setLoading(true);
        try {
            const [gRes, fRes, tRes] = await Promise.all([
                request<{ data: GroupItem[] }>(GROUPS_LIST_ENDPOINT, { method: 'GET' }),
                request<{ data: AssignmentFilter[] }>(ASSIGNMENTS_FILTERS_ENDPOINT, { method: 'GET' }),
                request<{ data: RoleScopeTag[] }>(ROLE_SCOPETAGS_ENDPOINT, { method: 'GET' }),
            ]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const asArray = <T,>(res: any): T[] => { const d = res?.data?.data; return Array.isArray(d) ? d as T[] : []; };
            setGroups(asArray<GroupItem>(gRes));
            setFilters(asArray<AssignmentFilter>(fRes));
            setScopeTags(asArray<RoleScopeTag>(tRes));
            setDataLoaded(true);
        } finally { setLoading(false); }
    };

    // ── Derived options ───────────────────────────────────────────────────────
    const scopeTagOptions = useMemo(() => scopeTags.map(t => ({ label: t.displayName, value: t.id })), [scopeTags]);
    const resourceTypeOptions = useMemo(() => {
        const types = [...new Set(rows.map(r => r.resourceType))].filter(Boolean).sort();
        return types.map(t => ({ label: t, value: t }));
    }, [rows]);
    const platformOptions = useMemo(() => {
        const platforms = [...new Set(rows.map(r => r.platform))].filter(Boolean).sort();
        return platforms.map(p => ({ label: p, value: p }));
    }, [rows]);
    const actionOptions = [
        { label: 'Add', value: 'Add' }, { label: 'Remove', value: 'Remove' },
        { label: 'Replace', value: 'Replace' }, { label: 'NoAssignment', value: 'NoAssignment' },
    ];

    const displayedRows = useMemo(() => {
        let r = rows;
        if (policySearch.trim()) {
            const q = policySearch.toLowerCase();
            r = r.filter(row => row.policyName.toLowerCase().includes(q) || row.groupName.toLowerCase().includes(q));
        }
        if (scopeTagFilter.length) r = r.filter(row => scopeTagFilter.some(id => row.scopeTagIds.includes(id)));
        if (resourceTypeFilter.length) r = r.filter(row => resourceTypeFilter.includes(row.resourceType));
        if (platformFilter.length) r = r.filter(row => platformFilter.includes(row.platform));
        if (actionFilter.length) r = r.filter(row => actionFilter.includes(row.assignmentAction));
        return r;
    }, [rows, policySearch, scopeTagFilter, resourceTypeFilter, platformFilter, actionFilter]);

    const activeFilterCount = scopeTagFilter.length + resourceTypeFilter.length + platformFilter.length + actionFilter.length;
    const generatedRows = useMemo(() => rows.filter(r => r.isGenerated), [rows]);
    const modifiedCount = rows.filter(r => r.isModified).length;
    const allDisplayedSelected = displayedRows.length > 0 && displayedRows.every(r => selectedIds.has(r.id));
    const someDisplayedSelected = displayedRows.some(r => selectedIds.has(r.id));
    const templateReady = !!template.groupName;

    // Grouped summary for Review dialog
    const reviewGroups = useMemo(() => {
        const byPolicy = new Map<string, { include: BuilderRow[]; exclude: BuilderRow[] }>();
        for (const row of generatedRows) {
            if (!byPolicy.has(row.policyName)) byPolicy.set(row.policyName, { include: [], exclude: [] });
            const entry = byPolicy.get(row.policyName)!;
            if (row.assignmentDirection === 'Exclude') entry.exclude.push(row);
            else entry.include.push(row);
        }
        return Array.from(byPolicy.entries()).map(([policy, sides]) => ({ policy, ...sides }));
    }, [generatedRows]);

    // ── Selection ─────────────────────────────────────────────────────────────
    const toggleRow = (id: string) => setSelectedIds(prev => {
        const n = new Set(prev);
        if (n.has(id)) { n.delete(id); } else { n.add(id); }
        return n;
    });
    const toggleAll = () => {
        if (allDisplayedSelected) {
            setSelectedIds(prev => { const n = new Set(prev); displayedRows.forEach(r => n.delete(r.id)); return n; });
        } else {
            setSelectedIds(prev => { const n = new Set(prev); displayedRows.forEach(r => n.add(r.id)); return n; });
        }
    };
    const clearSelection = () => setSelectedIds(new Set());

    // ── Generate ring rows ────────────────────────────────────────────────────
    const generateRows = (direction: 'Include' | 'Exclude') => {
        const selected = rows.filter(r => selectedIds.has(r.id));
        const seen = new Set<string>();
        const newRows: BuilderRow[] = [];
        for (const r of selected) {
            if (seen.has(r.policyName)) continue;
            seen.add(r.policyName);
            const base: EditableFields = {
                groupName: template.groupName, groupId: template.groupId,
                assignmentAction: template.assignmentAction,
                filterId: template.filterId, filterName: template.filterName,
                filterType: template.filterType, scopeTagIds: template.scopeTagIds,
            };
            newRows.push({
                id: `ring-${direction.toLowerCase()}-${r.policyName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                policyName: r.policyName, resourceType: r.resourceType, platform: r.platform,
                assignmentDirection: direction,
                ...base, original: { ...base }, isModified: false, isGenerated: true,
                ringLabel: `${template.name} – ${direction}`,
            });
        }
        setRows(prev => [...prev, ...newRows]);
        clearSelection();
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const openEdit = (row: BuilderRow) => { setEditingRow({ ...row }); setEditGroupSearch(''); setEditFilterSearch(''); setEditDialogOpen(true); };
    const saveEdit = () => {
        if (!editingRow) return;
        setRows(prev => prev.map(r => r.id !== editingRow.id ? r : { ...editingRow, isModified: rowIsModified(r, editingRow) }));
        setEditDialogOpen(false); setEditingRow(null);
    };
    const resetRow = (rowId: string) => setRows(prev => prev.map(r => r.id !== rowId ? r : { ...r, ...r.original, isModified: false }));
    const deleteRow = (rowId: string) => { setRows(prev => prev.filter(r => r.id !== rowId)); setSelectedIds(prev => { const n = new Set(prev); n.delete(rowId); return n; }); };

    // ── Export / Send ─────────────────────────────────────────────────────────
    const buildCSVContent = (sourceRows = rows) => {
        const resolveTagNames = (ids: string[]) => ids.map(id => scopeTags.find(t => t.id === id)?.displayName || id).join(', ') || 'None';
        const header = 'PolicyName;GroupName;AssignmentDirection;AssignmentAction;Filter;Filter Type;Role Scope Tags';
        const csvRows = sourceRows.map(r => [
            r.policyName, r.groupName, r.assignmentDirection, r.assignmentAction,
            r.filterName || '', r.filterType === 'None' ? '' : r.filterType,
            resolveTagNames(r.scopeTagIds),
        ].join(';'));
        return [header, ...csvRows].join('\n');
    };
    const exportCSV = () => {
        const blob = new Blob([buildCSVContent()], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'assignment-migration.csv';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };
    const sendToDeployment = () => {
        sessionStorage.setItem(MIGRATION_BUILDER_DEPLOYMENT_KEY, buildCSVContent(generatedRows));
        router.push('/deployment/assignments');
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const resolvedScopeTagNames = (ids: string[]) => ids.map(id => scopeTags.find(t => t.id === id)?.displayName || id).join(', ') || 'None';
    const actionBadgeVariant = (action: AssignmentAction) => {
        if (action === 'Add' || action === 'Replace') return 'default' as const;
        if (action === 'Remove') return 'destructive' as const;
        return 'secondary' as const;
    };
    const clearAllFilters = () => { setScopeTagFilter([]); setResourceTypeFilter([]); setPlatformFilter([]); setActionFilter([]); setPolicySearch(''); };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 lg:p-8 space-y-5 w-full max-w-none">

            {/* ── License gate banner ──────────────────────────────────────── */}
            {!hasBuilderAccess && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 px-4 py-4">
                    <Crown className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800 dark:text-amber-200">Assignments Manager license required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                            The Migration Builder is part of the <strong>Assignments Manager</strong> add-on.
                            You can explore the interface, but sending data to Deployment is disabled until a valid license is active.
                        </p>
                        <a href="/plans" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-amber-100">
                            View plans &amp; upgrade <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>
            )}

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-600 dark:text-white">Assignment Migration Builder</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Configure a ring template → select policies → generate Include &amp; Exclude rows → review → deploy
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0 items-center">
                    <Button onClick={fetchReferenceData} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {dataLoaded ? 'Refresh Data' : 'Load Reference Data'}
                    </Button>
                    {dataLoaded && (
                        <Badge variant="outline" className="h-8 px-3 flex items-center gap-1 text-green-600 border-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {groups.length}g · {filters.length}f · {scopeTags.length}t
                        </Badge>
                    )}
                    <Button onClick={exportCSV} size="sm" variant="outline" disabled={rows.length === 0}>
                        <Download className="h-4 w-4 mr-2" />Export CSV
                    </Button>
                    {generatedRows.length > 0 && (
                        <Button onClick={() => setReviewOpen(true)} size="sm" variant="outline" className="border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                            <Eye className="h-4 w-4 mr-2" />
                            Review ({generatedRows.length})
                        </Button>
                    )}
                    <Button onClick={() => setReviewOpen(true)} size="sm"
                        disabled={generatedRows.length === 0 || !hasBuilderAccess}
                        title={!hasBuilderAccess ? 'Assignments Manager license required' : generatedRows.length === 0 ? 'Generate ring rows first (Steps 2 & 3)' : 'Review generated rows before sending to Deployment'}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />Send to Deployment
                    </Button>
                </div>
            </div>

            {/* ── Status strip ─────────────────────────────────────────────── */}
            {rows.length > 0 && (
                <div className="flex gap-2 flex-wrap items-center">
                    <Badge variant="secondary">{rows.length} source rows</Badge>
                    {displayedRows.length !== rows.length && <Badge variant="outline">{displayedRows.length} shown</Badge>}
                    {modifiedCount > 0 && <Badge className="bg-yellow-500 hover:bg-yellow-600">{modifiedCount} modified</Badge>}
                    {generatedRows.length > 0 && (
                        <Badge className="bg-purple-600 hover:bg-purple-700 cursor-pointer" onClick={() => setReviewOpen(true)}>
                            {generatedRows.length} generated — click to review
                        </Badge>
                    )}
                    {selectedIds.size > 0 && <Badge className="bg-blue-600 hover:bg-blue-700">{selectedIds.size} selected</Badge>}
                    {!dataLoaded && <Badge variant="outline" className="text-orange-500 border-orange-400">⚠ Load reference data to enable editing</Badge>}
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {rows.length === 0 && (
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="py-16 text-center">
                        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No assignments loaded</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
                            Go to Assignments Overview, apply your filters, then click <strong>&quot;Open in Migration Builder&quot;</strong>.
                        </p>
                        <Button onClick={() => router.push('/assistant/assignments-overview')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />Go to Assignments Overview
                        </Button>
                    </CardContent>
                </Card>
            )}

            {rows.length > 0 && (<>

                {/* ══ STEP 1 – Template ════════════════════════════════════════ */}
                <Card className={`border-2 transition-colors ${templateReady ? 'border-purple-400 dark:border-purple-600' : 'border-dashed border-muted-foreground/30'} bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg`}>
                    <CardHeader className="pb-2 pt-3 px-4">
                        <div className="flex items-center justify-between">
                            <button className="flex items-center gap-2 text-sm font-semibold hover:text-purple-500 transition-colors"
                                onClick={() => setTemplatePanelOpen(p => !p)}>
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                Step 1 — Configure Ring Template
                                {templateReady
                                    ? <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 text-[10px]">{template.name} · {template.groupName}</Badge>
                                    : <Badge variant="outline" className="text-orange-500 border-orange-400 text-[10px]">not configured</Badge>}
                                {templatePanelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {templateReady && (
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground"
                                    onClick={() => setTemplate({ ...EMPTY_TEMPLATE })}>
                                    <RotateCcw className="h-3 w-3 mr-1" />Reset
                                </Button>
                            )}
                        </div>
                        {!templatePanelOpen && templateReady && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
                                <span>Group: <strong className="text-foreground">{template.groupName}</strong></span>
                                <span>·</span>
                                <span>Action: <strong className="text-foreground">{template.assignmentAction}</strong></span>
                                {template.filterName && <span>·</span>}
                                {template.filterName && <span>Filter: <strong className="text-foreground">{template.filterName} ({template.filterType})</strong></span>}
                                {template.scopeTagIds.length > 0 && <><span>·</span><span>Tags: <strong className="text-foreground">{resolvedScopeTagNames(template.scopeTagIds)}</strong></span></>}
                            </div>
                        )}
                    </CardHeader>
                    {templatePanelOpen && (
                        <CardContent className="px-4 pb-5 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Template Name</Label>
                                    <Input className="h-8 text-sm" placeholder="e.g. Ring 1" value={template.name}
                                        onChange={e => setTemplate(p => ({ ...p, name: e.target.value }))} />
                                    <p className="text-[11px] text-muted-foreground">Label shown on generated rows.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Group <span className="text-red-500">*</span></Label>
                                    <GroupPicker search={templateGroupSearch} onSearch={setTemplateGroupSearch}
                                        selectedId={template.groupId} selectedName={template.groupName} groups={groups}
                                        onSelect={(name, id) => setTemplate(p => ({ ...p, groupName: name, groupId: id }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Assignment Action</Label>
                                    <Select value={template.assignmentAction} onValueChange={v => setTemplate(p => ({ ...p, assignmentAction: v as AssignmentAction }))}>
                                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Add">Add</SelectItem>
                                            <SelectItem value="Remove">Remove</SelectItem>
                                            <SelectItem value="Replace">Replace</SelectItem>
                                            <SelectItem value="NoAssignment">NoAssignment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Separator className="my-2" />
                                    <Label className="text-xs font-medium">Filter <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                    <FilterPicker search={templateFilterSearch} onSearch={setTemplateFilterSearch}
                                        selectedId={template.filterId} filters={filters}
                                        onSelect={(id, name) => setTemplate(p => ({ ...p, filterId: id, filterName: name, filterType: p.filterType === 'None' ? 'Include' : p.filterType }))}
                                        onClear={() => setTemplate(p => ({ ...p, filterId: null, filterName: null, filterType: 'None' }))} />
                                    {template.filterId && (
                                        <div className="space-y-1 mt-2">
                                            <Label className="text-xs font-medium">Filter Type</Label>
                                            <Select value={template.filterType} onValueChange={v => setTemplate(p => ({ ...p, filterType: v as FilterType }))}>
                                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Include">Include</SelectItem>
                                                    <SelectItem value="Exclude">Exclude</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Scope Tags <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                    <MultiSelect options={scopeTagOptions} selected={template.scopeTagIds}
                                        onChange={ids => setTemplate(p => ({ ...p, scopeTagIds: ids }))} placeholder="Select scope tags…" />
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* ── Always-visible search + collapsible filters ───────────── */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10">
                    <CardContent className="px-4 pt-3 pb-3">
                        {/* Search always visible */}
                        <div className="flex gap-3 items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9 h-9" placeholder="Search policies or groups…"
                                    value={policySearch} onChange={e => setPolicySearch(e.target.value)} autoComplete="off" />
                                {policySearch && (
                                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setPolicySearch('')}><X className="h-3.5 w-3.5" /></button>
                                )}
                            </div>
                            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setFilterPanelOpen(p => !p)}>
                                <Filter className="h-4 w-4" />
                                Filters
                                {activeFilterCount > 0 && <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0">{activeFilterCount}</Badge>}
                                {filterPanelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {(activeFilterCount > 0 || policySearch) && (
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={clearAllFilters}>
                                    <X className="h-3 w-3 mr-1" />Clear all
                                </Button>
                            )}
                        </div>
                        {/* Collapsible advanced filters */}
                        {filterPanelOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium flex items-center gap-1"><Monitor className="h-3 w-3" />Platform</Label>
                                    <MultiSelect options={platformOptions} selected={platformFilter}
                                        onChange={setPlatformFilter} placeholder="All platforms…" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Resource Type</Label>
                                    <MultiSelect options={resourceTypeOptions} selected={resourceTypeFilter}
                                        onChange={setResourceTypeFilter} placeholder="All types…" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Scope Tags</Label>
                                    <MultiSelect options={scopeTagOptions} selected={scopeTagFilter}
                                        onChange={setScopeTagFilter} placeholder="All tags…" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Assignment Action</Label>
                                    <MultiSelect options={actionOptions} selected={actionFilter}
                                        onChange={setActionFilter} placeholder="All actions…" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ══ Selection bar (Steps 2 & 3) ══════════════════════════════ */}
                {selectedIds.size > 0 && (
                    <Card className="border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-900/20">
                        <CardContent className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {selectedIds.size} polic{selectedIds.size === 1 ? 'y' : 'ies'} selected
                                </span>
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                    disabled={!templateReady || !dataLoaded}
                                    title={!templateReady ? 'Configure template first' : !dataLoaded ? 'Load reference data first' : 'Generate Include assignment rows'}
                                    onClick={() => generateRows('Include')}>
                                    <CirclePlus className="h-3.5 w-3.5" />Step 2 — Add as Include
                                </Button>
                                <Button size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white gap-1.5"
                                    disabled={!templateReady || !dataLoaded}
                                    title={!templateReady ? 'Configure template first' : !dataLoaded ? 'Load reference data first' : 'Generate Exclude assignment rows'}
                                    onClick={() => generateRows('Exclude')}>
                                    <CircleMinus className="h-3.5 w-3.5" />Step 3 — Add as Exclude
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 gap-1.5" disabled={!dataLoaded}
                                    onClick={() => { const first = rows.find(r => selectedIds.has(r.id)); if (first) openEdit(first); }}>
                                    <Edit2 className="h-3.5 w-3.5" />Edit first selected
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={clearSelection}>
                                    <X className="h-3 w-3 mr-1" />Deselect all
                                </Button>
                                {!templateReady && <span className="text-xs text-orange-500">⚠ Configure template first</span>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Table ────────────────────────────────────────────────── */}
                <Card className="bg-white/60 dark:bg-gray-900/30 backdrop-blur-lg border border-white/30 dark:border-white/10 overflow-hidden">
                    <CardHeader className="pb-2 border-b px-4 pt-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Policies — {displayedRows.length}{displayedRows.length !== rows.length ? ` of ${rows.length}` : ''} rows
                                <span className="ml-2 text-[11px] font-normal text-muted-foreground">click to select · use Steps 2 &amp; 3 to generate ring rows</span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="px-3 py-2.5 w-8">
                                            <Checkbox checked={allDisplayedSelected}
                                                data-state={someDisplayedSelected && !allDisplayedSelected ? 'indeterminate' : undefined}
                                                onCheckedChange={toggleAll} aria-label="Select all" />
                                        </th>
                                        <th className="px-2 py-2.5 w-5" />
                                        <th className="px-3 py-2.5 text-left font-medium text-xs min-w-52">Policy</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs w-24">Platform</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs min-w-36">Group</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs w-22">Direction</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs w-22">Action</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs min-w-32">Filter</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs w-22">Filter Type</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs min-w-32">Scope Tags</th>
                                        <th className="px-3 py-2.5 text-left font-medium text-xs w-16">Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedRows.map((row, idx) => {
                                        const isSelected = selectedIds.has(row.id);
                                        return (
                                            <tr key={row.id}
                                                className={[
                                                    'border-b transition-colors cursor-pointer',
                                                    isSelected ? 'bg-blue-50/70 dark:bg-blue-900/15' :
                                                        row.isGenerated
                                                            ? row.assignmentDirection === 'Include' ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'
                                                            : row.isModified ? 'bg-yellow-50/50 dark:bg-yellow-900/10'
                                                                : idx % 2 === 0 ? '' : 'bg-muted/10',
                                                    'hover:bg-muted/20',
                                                ].join(' ')}
                                                onClick={() => toggleRow(row.id)}>

                                                <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                                                    <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(row.id)} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    {row.isGenerated
                                                        ? <div className={`h-2 w-2 rounded-full mx-auto ${row.assignmentDirection === 'Include' ? 'bg-green-500' : 'bg-red-500'}`} title={row.ringLabel} />
                                                        : row.isModified ? <div className="h-2 w-2 rounded-full bg-yellow-500 mx-auto" title="Modified" /> : null}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="font-medium truncate max-w-64 text-xs" title={row.policyName}>
                                                        {row.policyName || <span className="text-muted-foreground italic">—</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                                        <span className="text-[10px] text-muted-foreground">{row.resourceType}</span>
                                                        {row.ringLabel && (
                                                            <Badge className={`text-[9px] py-0 px-1 border ${row.assignmentDirection === 'Include' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300'}`}>
                                                                {row.ringLabel}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="text-[10px] text-muted-foreground">{row.platform}</span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="truncate block max-w-40 text-xs" title={row.groupName}>
                                                        {row.groupName || <span className="text-muted-foreground italic">None</span>}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Badge variant={row.assignmentDirection === 'Exclude' ? 'destructive' : 'default'} className="text-[10px] py-0 px-1.5">
                                                        {row.assignmentDirection}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Badge variant={actionBadgeVariant(row.assignmentAction)} className="text-[10px] py-0 px-1.5">
                                                        {row.assignmentAction}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="truncate block max-w-36 text-xs" title={row.filterName || ''}>
                                                        {row.filterName || <span className="text-muted-foreground text-[10px]">—</span>}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    {row.filterType !== 'None' && row.filterName ? (
                                                        <Badge variant={row.filterType === 'Include' ? 'default' : 'destructive'} className="text-[10px] py-0 px-1.5">
                                                            {row.filterType === 'Include' ? <Shield className="h-2 w-2 mr-0.5 inline" /> : <ShieldCheck className="h-2 w-2 mr-0.5 inline" />}
                                                            {row.filterType}
                                                        </Badge>
                                                    ) : <span className="text-muted-foreground text-[10px]">—</span>}
                                                </td>
                                                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-36 truncate">
                                                    {row.scopeTagIds.length > 0 ? resolvedScopeTagNames(row.scopeTagIds) : '—'}
                                                </td>
                                                <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => openEdit(row)} disabled={!dataLoaded}>
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                        {row.isModified && !row.isGenerated && (
                                                            <Button size="sm" variant="ghost" className="h-6 px-2 text-muted-foreground" onClick={() => resetRow(row.id)} title="Reset">
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        {row.isGenerated && (
                                                            <Button size="sm" variant="ghost" className="h-6 px-2 text-red-500 hover:text-red-600" onClick={() => deleteRow(row.id)} title="Remove">
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {displayedRows.length === 0 && (
                                <div className="py-12 text-center text-sm text-muted-foreground">No rows match the current filters.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </>)}

            {/* ══ Review Dialog ════════════════════════════════════════════════ */}
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-purple-500" />
                            Review — {generatedRows.length} generated assignment{generatedRows.length !== 1 ? 's' : ''}
                        </DialogTitle>
                        <DialogDescription>
                            These are the rows that will be sent to Deployment. Review carefully before continuing.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Template summary */}
                    <div className="shrink-0 rounded-lg border border-purple-200 bg-purple-50/60 dark:border-purple-800 dark:bg-purple-900/20 px-4 py-3 text-sm space-y-1">
                        <p className="font-medium text-purple-800 dark:text-purple-200">Template: <span className="font-bold">{template.name}</span></p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-purple-700 dark:text-purple-300">
                            <span>Group: <strong>{template.groupName || '—'}</strong></span>
                            <span>·</span>
                            <span>Action: <strong>{template.assignmentAction}</strong></span>
                            {template.filterName && <span>Filter: <strong>{template.filterName} ({template.filterType})</strong></span>}
                            {template.scopeTagIds.length > 0 && <span>Tags: <strong>{resolvedScopeTagNames(template.scopeTagIds)}</strong></span>}
                        </div>
                    </div>

                    {/* Warnings */}
                    {reviewGroups.some(g => g.include.length === 0 || g.exclude.length === 0) && (
                        <div className="shrink-0 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50/60 dark:border-orange-800 dark:bg-orange-900/20 px-4 py-3 text-xs text-orange-700 dark:text-orange-300">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>Some policies only have an Include <em>or</em> an Exclude row — not both. Go back if you need to add the missing side.</span>
                        </div>
                    )}

                    {/* Policy list */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {reviewGroups.map(({ policy, include, exclude }) => (
                            <div key={policy} className="rounded-lg border bg-card">
                                <div className="px-4 py-2.5 border-b bg-muted/30">
                                    <p className="text-sm font-semibold truncate" title={policy}>{policy}</p>
                                    {include[0] && <p className="text-[11px] text-muted-foreground">{include[0].resourceType} · {include[0].platform}</p>}
                                </div>
                                <div className="px-4 py-3 space-y-2">
                                    {include.map(r => (
                                        <div key={r.id} className="flex items-center gap-3 text-xs">
                                            <Badge className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-300 shrink-0">Include</Badge>
                                            <span className="font-medium">{r.groupName}</span>
                                            <Badge variant="outline" className="text-[9px]">{r.assignmentAction}</Badge>
                                            {r.filterName && <span className="text-muted-foreground">{r.filterName} ({r.filterType})</span>}
                                        </div>
                                    ))}
                                    {exclude.map(r => (
                                        <div key={r.id} className="flex items-center gap-3 text-xs">
                                            <Badge className="text-[9px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 shrink-0">Exclude</Badge>
                                            <span className="font-medium">{r.groupName}</span>
                                            <Badge variant="outline" className="text-[9px]">{r.assignmentAction}</Badge>
                                            {r.filterName && <span className="text-muted-foreground">{r.filterName} ({r.filterType})</span>}
                                        </div>
                                    ))}
                                    {include.length === 0 && (
                                        <div className="flex items-center gap-2 text-[11px] text-orange-500">
                                            <AlertTriangle className="h-3 w-3" />No Include row
                                        </div>
                                    )}
                                    {exclude.length === 0 && (
                                        <div className="flex items-center gap-2 text-[11px] text-orange-500">
                                            <AlertTriangle className="h-3 w-3" />No Exclude row
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center justify-between pt-3 border-t">
                        <Button variant="outline" size="sm" onClick={() => setReviewOpen(false)}>
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back to Builder
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { exportCSV(); }}>
                                <Download className="h-3.5 w-3.5 mr-1.5" />Export CSV
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                                disabled={!hasBuilderAccess}
                                title={!hasBuilderAccess ? 'Assignments Manager license required' : undefined}
                                onClick={() => { setReviewOpen(false); sendToDeployment(); }}>
                                <SendHorizonal className="h-3.5 w-3.5" />
                                Send {generatedRows.length} rows to Deployment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Single-row Edit Dialog ────────────────────────────────────── */}
            <Dialog open={editDialogOpen} onOpenChange={open => { if (!open) setEditDialogOpen(false); }}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base">Edit Assignment Row</DialogTitle>
                        {editingRow && <p className="text-xs text-muted-foreground truncate pt-1">{editingRow.policyName}</p>}
                    </DialogHeader>
                    {editingRow && (
                        <div className="space-y-5 pt-1">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Group (Target Name)</Label>
                                <GroupPicker search={editGroupSearch} onSearch={setEditGroupSearch}
                                    selectedId={editingRow.groupId} selectedName={editingRow.groupName} groups={groups}
                                    onSelect={(name, id) => setEditingRow(p => p ? { ...p, groupName: name, groupId: id } : null)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Assignment Action</Label>
                                <Select value={editingRow.assignmentAction} onValueChange={v => setEditingRow(p => p ? { ...p, assignmentAction: v as AssignmentAction } : null)}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Add">Add</SelectItem>
                                        <SelectItem value="Remove">Remove</SelectItem>
                                        <SelectItem value="Replace">Replace</SelectItem>
                                        <SelectItem value="NoAssignment">NoAssignment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Filter</Label>
                                <FilterPicker search={editFilterSearch} onSearch={setEditFilterSearch}
                                    selectedId={editingRow.filterId} filters={filters}
                                    onSelect={(id, name) => setEditingRow(p => p ? { ...p, filterId: id, filterName: name, filterType: p.filterType === 'None' ? 'Include' : p.filterType } : null)}
                                    onClear={() => setEditingRow(p => p ? { ...p, filterId: null, filterName: null, filterType: 'None' } : null)} />
                            </div>
                            {editingRow.filterId && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Filter Type</Label>
                                    <Select value={editingRow.filterType} onValueChange={v => setEditingRow(p => p ? { ...p, filterType: v as FilterType } : null)}>
                                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Include">Include</SelectItem>
                                            <SelectItem value="Exclude">Exclude</SelectItem>
                                            <SelectItem value="None">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Scope Tags</Label>
                                <MultiSelect options={scopeTagOptions} selected={editingRow.scopeTagIds}
                                    onChange={ids => setEditingRow(p => p ? { ...p, scopeTagIds: ids } : null)} placeholder="Select scope tags…" />
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <Button variant="ghost" size="sm" className="text-muted-foreground"
                                    onClick={() => setEditingRow(p => p ? { ...p, ...p.original } : null)}>
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />Reset to Original
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                                    <Button size="sm" onClick={saveEdit}>Save Changes</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

