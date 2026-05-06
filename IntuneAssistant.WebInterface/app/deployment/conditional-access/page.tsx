'use client';
import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Play,
    RotateCcw, Eye, ArrowRight, Shield, Info, X, RefreshCw,
    CheckCircle, FileSpreadsheet, BarChart3, Circle, ChevronDown, ChevronRight
} from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { API_BASE_URL, CA_ASSIGNMENTS_COMPARE_ENDPOINT, CA_ASSIGNMENTS_MIGRATE_ENDPOINT, ITEMS_PER_PAGE } from '@/lib/constants';

// Dedicated post-migration validation endpoint
const CA_ASSIGNMENTS_VALIDATE_ENDPOINT = `${API_BASE_URL}/assignments/ca/validate`;
import { DataTable } from '@/components/DataTable';
import { useApiRequest } from '@/hooks/useApiRequest';
import { UserConsentRequiredError } from '@/lib/errors';
import { PlanProtection } from '@/components/PlanProtection';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CACsvRow {
    PolicyName: string;
    GroupName: string | null;
    AssignmentDirection: 'Include' | 'Exclude';
    AssignmentAction: 'Add' | 'Remove';
    isValid?: boolean;
    validationErrors?: { field: string; message: string }[];
    rowId?: string;
    [key: string]: unknown;
}

interface CAPolicy { id: string; displayName: string; state: string; }

interface CAMigrationCheck {
    assignmentExists: boolean | null;
    policyExists: boolean;
    policyIsUnique: boolean | null;
    groupExists: boolean | null;
    correctAssignmentTypeProvided: boolean | null;
    correctAssignmentActionProvided: boolean;
    assignmentIsCompatible: boolean | null;
    compatibilityErrors: string[];
}

type MasterStatus =
    | 'csv_invalid' | 'compare_ready' | 'compare_failed' | 'already_migrated'
    | 'migration_success' | 'migration_failed' | 'migration_skipped' | 'migration_notstarted'
    | 'validation_success' | 'validation_failed';

interface CAComparisonResult {
    id: string;
    policy: CAPolicy | null;
    providedPolicyName?: string;
    groupToMigrate?: string;
    assignmentDirection?: string;
    assignmentAction?: string;
    isMigrated?: boolean;
    isReadyForMigration?: boolean | null;
    migrationCheckResult?: CAMigrationCheck;
    warnings?: string[];
    csvRow?: CACsvRow;
    masterStatus?: MasterStatus;
    masterStatusMessage?: string;
    failureReason?: string;
    batchIndex?: number | null;
    correlationIdCompare?: string | null;
    correlationIdMigrate?: string | null;
    correlationIdVerify?: string | null;
    validationResult?: CAValidationResult;
}

interface CAMigrationResult {
    id: string;
    providedPolicyName: string;
    groupToMigrate: string;
    assignmentDirection: number;
    assignmentAction: number;
    status: 'Success' | 'Failed' | 'Skipped' | 'NotStarted';
    errorMessage: string | null;
    processedAt: string;
    batchIndex?: number | null;
    correlationIdMigrate?: string | null;
    [key: string]: unknown;
}

interface CAValidationResult {
    id: string;
    hasCorrectAssignment: boolean;
    providedPolicyName: string;
    groupName: string;
    assignmentDirection: string;
    assignmentAction: string;
    message: {
        status: string;
        reason: string;
    };
    policy: CAPolicy | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId() { return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function parseCSV(text: string): CACsvRow[] {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).filter(l => l.trim()).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const r: Record<string, string> = {};
        headers.forEach((h, i) => { r[h] = vals[i] ?? ''; });
        const errors: { field: string; message: string }[] = [];
        const policyName = r['PolicyName'] || r['policyName'] || '';
        const groupName = r['GroupName'] || r['groupName'] || null;
        const rawDir = (r['AssignmentDirection'] || r['assignmentDirection'] || '').trim();
        const rawAct = (r['AssignmentAction'] || r['assignmentAction'] || '').trim();
        if (!policyName) errors.push({ field: 'PolicyName', message: 'Policy name is required' });
        const dir = ['Include', 'Exclude'].find(d => d.toLowerCase() === rawDir.toLowerCase()) as 'Include' | 'Exclude' | undefined;
        if (!dir) errors.push({ field: 'AssignmentDirection', message: `Invalid direction: "${rawDir}". Must be Include or Exclude` });
        const act = ['Add', 'Remove'].find(a => a.toLowerCase() === rawAct.toLowerCase()) as 'Add' | 'Remove' | undefined;
        if (!act) errors.push({ field: 'AssignmentAction', message: `Invalid action: "${rawAct}". Must be Add or Remove` });
        return { PolicyName: policyName, GroupName: groupName, AssignmentDirection: dir || 'Include', AssignmentAction: act || 'Add', isValid: errors.length === 0, validationErrors: errors, rowId: genId() };
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

type Step = 'upload' | 'compare' | 'migrate' | 'results' | 'validate' | 'summary';

function CAAssignmentMigrationContent() {
    const { accounts } = useMsal();
    const { request } = useApiRequest();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentStep, setCurrentStep] = useState<Step>('upload');
    const [csvData, setCsvData] = useState<CACsvRow[]>([]);
    const [comparisonResults, setComparisonResults] = useState<CAComparisonResult[]>([]);
    const [filteredComparisonResults, setFilteredComparisonResults] = useState<CAComparisonResult[]>([]);
    const [migrationResults, setMigrationResults] = useState<CAMigrationResult[]>([]);
    const [masterTrackingData, setMasterTrackingData] = useState<CAComparisonResult[]>([]);
    const [migratedRowIds, setMigratedRowIds] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [validationComplete, setValidationComplete] = useState(false);
    const [validatedItemsCount, setValidatedItemsCount] = useState(0);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [compareStatusFilter, setCompareStatusFilter] = useState<'all' | 'ready' | 'migrated' | 'failed' | 'warnings'>('all');
    const [migrationResultFilter, setMigrationResultFilter] = useState<'all' | 'success' | 'failed' | 'skipped' | 'notstarted'>('all');
    const [summaryStatusFilter, setSummaryStatusFilter] = useState<'all' | MasterStatus>('all');
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const [uploadCurrentPage, setUploadCurrentPage] = useState(1);
    const [compareCurrentPage, setCompareCurrentPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [validationCurrentPage, setValidationCurrentPage] = useState(1);
    const [migrationChunkProgress, setMigrationChunkProgress] = useState({ currentChunk: 0, totalChunks: 0, processedItems: 0, totalItems: 0, isProcessing: false });
    const [isCancelling, setIsCancelling] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    // ── Derived ──────────────────────────────────────────────────────────────

    const filteredMigrationResults = useMemo(() => {
        if (migrationResultFilter === 'success') return migrationResults.filter(r => r.status === 'Success');
        if (migrationResultFilter === 'failed') return migrationResults.filter(r => r.status === 'Failed');
        if (migrationResultFilter === 'skipped') return migrationResults.filter(r => r.status === 'Skipped');
        if (migrationResultFilter === 'notstarted') return migrationResults.filter(r => r.status === 'NotStarted');
        return migrationResults;
    }, [migrationResults, migrationResultFilter]);

    const validatedItems = useMemo(() =>
        masterTrackingData.filter(r => r.masterStatus === 'validation_success' || r.masterStatus === 'validation_failed'),
        [masterTrackingData]);

    const summaryStats = useMemo(() => {
        const csvInvalid = masterTrackingData.filter(r => r.masterStatus === 'csv_invalid');
        const compareFailed = masterTrackingData.filter(r => r.masterStatus === 'compare_failed');
        const notMigrated = masterTrackingData.filter(r => r.masterStatus === 'compare_ready');
        const alreadyMigrated = masterTrackingData.filter(r => r.masterStatus === 'already_migrated');
        const migSuccess = masterTrackingData.filter(r => r.masterStatus === 'migration_success');
        const migFailed = masterTrackingData.filter(r => r.masterStatus === 'migration_failed');
        const migSkipped = masterTrackingData.filter(r => r.masterStatus === 'migration_skipped');
        const valSuccess = masterTrackingData.filter(r => r.masterStatus === 'validation_success');
        const valFailed = masterTrackingData.filter(r => r.masterStatus === 'validation_failed');
        return {
            csvInvalid, compareFailed, notMigrated, alreadyMigrated, migSuccess, migFailed, migSkipped, valSuccess, valFailed,
            migNotVerified: migSuccess,
            totalUploaded: csvData.length,
            csvInvalidCount: csvInvalid.length, compareFailedCount: compareFailed.length,
            notSelectedCount: notMigrated.length, alreadyMigratedCount: alreadyMigrated.length,
            readyForMigrationCount: notMigrated.length + migSuccess.length + migFailed.length + migSkipped.length + valSuccess.length + valFailed.length,
            migrationSuccessCount: migSuccess.length, migrationFailedCount: migFailed.length,
            migrationSkippedCount: migSkipped.length, verifiedCount: valSuccess.length, verifyFailedCount: valFailed.length,
        };
    }, [masterTrackingData, csvData]);

    const summaryTableData = useMemo(() => masterTrackingData.map(row => ({
        id: row.id,
        policy: row.csvRow?.PolicyName || row.policy?.displayName || row.providedPolicyName || '—',
        group: row.csvRow?.GroupName || row.groupToMigrate || '—',
        action: row.csvRow?.AssignmentAction || '—',
        direction: row.csvRow?.AssignmentDirection || '—',
        status: row.masterStatus || 'unknown',
        batch: row.batchIndex !== null && row.batchIndex !== undefined ? row.batchIndex + 1 : null,
        batchIndexRaw: row.batchIndex,
        notes: row.failureReason || row.masterStatusMessage || '—',
    })), [masterTrackingData]);

    const filteredSummaryTableData = useMemo(() =>
        summaryStatusFilter === 'all' ? summaryTableData : summaryTableData.filter(r => r.status === summaryStatusFilter),
        [summaryTableData, summaryStatusFilter]);

    // ── CSV ───────────────────────────────────────────────────────────────────

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            setCsvData(parseCSV(ev.target?.result as string));
            setComparisonResults([]); setFilteredComparisonResults([]); setMigrationResults([]);
            setMasterTrackingData([]); setSelectedRows([]); setError(null); setCurrentStep('upload');
        };
        reader.readAsText(file); e.target.value = '';
    };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false);
        const file = e.dataTransfer.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { setCsvData(parseCSV(ev.target?.result as string)); setCurrentStep('upload'); };
        reader.readAsText(file);
    };

    // ── Compare ───────────────────────────────────────────────────────────────

    const compareAssignments = async () => {
        const validRows = csvData.filter(r => r.isValid);
        if (!accounts.length || !validRows.length) return;
        setLoading(true); setError(null);
        try {
            const payload = validRows.map(r => ({ policyName: r.PolicyName, groupName: r.GroupName || null, assignmentDirection: r.AssignmentDirection, assignmentAction: r.AssignmentAction }));
            const res = await request<{ data: CAComparisonResult[] }>(CA_ASSIGNMENTS_COMPARE_ENDPOINT, { method: 'POST', body: JSON.stringify(payload) });
            const data: CAComparisonResult[] = (res?.data?.data as CAComparisonResult[]) ?? [];
            const corrId = res?.correlationId;
            const enhanced: CAComparisonResult[] = data.map((item, i) => {
                const csvRow = validRows[i];
                const check = item.migrationCheckResult;
                const ready = item.isReadyForMigration === true || (item.isReadyForMigration === null && !!check && check.policyExists && check.policyIsUnique !== false && check.groupExists !== false && check.correctAssignmentTypeProvided !== false && check.correctAssignmentActionProvided && check.assignmentIsCompatible !== false);
                let masterStatus: MasterStatus; let masterStatusMessage = ''; let failureReason = '';
                if (ready) {
                    masterStatus = item.isMigrated ? 'already_migrated' : 'compare_ready';
                    masterStatusMessage = item.isMigrated ? 'Already migrated' : 'Ready for migration';
                } else {
                    masterStatus = 'compare_failed';
                    if (check) {
                        const f: string[] = [];
                        if (!check.policyExists) f.push('Policy not found');
                        if (check.policyIsUnique === false) f.push('Duplicate policy name');
                        if (check.groupExists === false) f.push('Group not found');
                        if (!check.correctAssignmentActionProvided) f.push('Invalid action');
                        if (check.assignmentIsCompatible === false) f.push(...check.compatibilityErrors);
                        failureReason = f.join('; ');
                    } else { failureReason = 'Validation failed'; }
                    masterStatusMessage = `Cannot migrate: ${failureReason}`;
                }
                return { ...item, id: csvRow.rowId || item.id, csvRow, isReadyForMigration: ready, isMigrated: item.isMigrated || false, masterStatus, masterStatusMessage, failureReason, correlationIdCompare: corrId };
            });
            const invalidRows: CAComparisonResult[] = csvData.filter(r => !r.isValid).map(r => ({
                id: r.rowId || genId(), policy: null, csvRow: r, isReadyForMigration: false, isMigrated: false,
                masterStatus: 'csv_invalid' as MasterStatus, masterStatusMessage: 'Invalid CSV row',
                failureReason: r.validationErrors?.map(e => e.message).join('; ')
            }));
            setComparisonResults(enhanced); setFilteredComparisonResults(enhanced);
            setMasterTrackingData([...enhanced, ...invalidRows]);
            setSelectedRows(enhanced.filter(r => r.masterStatus === 'compare_ready').map(r => r.id));
            setCurrentStep('migrate');
        } catch (err) { if (!(err instanceof UserConsentRequiredError)) setError(err instanceof Error ? err.message : 'Compare failed'); }
        finally { setLoading(false); }
    };

    const applyCompareFilter = (filter: typeof compareStatusFilter, results: CAComparisonResult[]) => {
        if (filter === 'ready') return results.filter(r => r.isReadyForMigration && !r.isMigrated);
        if (filter === 'migrated') return results.filter(r => r.isMigrated);
        if (filter === 'failed') return results.filter(r => r.masterStatus === 'compare_failed');
        if (filter === 'warnings') return results.filter(r => !r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'compare_failed');
        return results;
    };
    const handleCompareFilter = (f: typeof compareStatusFilter) => {
        setCompareStatusFilter(f);
        setFilteredComparisonResults(applyCompareFilter(f, comparisonResults));
        setCompareCurrentPage(1);
    };

    // ── Migrate ───────────────────────────────────────────────────────────────

    const migrateSelectedAssignments = async () => {
        if (!accounts.length || !selectedRows.length) return;
        const snapshot = [...selectedRows]; const CHUNK = 20;
        setLoading(true); setIsCancelling(false);
        const ctrl = new AbortController(); abortRef.current = ctrl;
        try {
            const items = comparisonResults.filter(r => snapshot.includes(r.id));
            const payload = items.map(r => ({ policyName: r.csvRow?.PolicyName || r.providedPolicyName || '', groupName: r.csvRow?.GroupName || r.groupToMigrate || null, assignmentDirection: r.csvRow?.AssignmentDirection || r.assignmentDirection || 'Include', assignmentAction: r.csvRow?.AssignmentAction || r.assignmentAction || 'Add' }));
            const chunks: typeof payload[] = [];
            for (let i = 0; i < payload.length; i += CHUNK) chunks.push(payload.slice(i, i + CHUNK));
            setMigrationChunkProgress({ currentChunk: 0, totalChunks: chunks.length, processedItems: 0, totalItems: payload.length, isProcessing: true });
            const all: CAMigrationResult[] = [];
            for (let ci = 0; ci < chunks.length; ci++) {
                if (ctrl.signal.aborted) break;
                setMigrationChunkProgress(p => ({ ...p, currentChunk: ci + 1 }));
                const res = await request<{ data: CAMigrationResult[] }>(CA_ASSIGNMENTS_MIGRATE_ENDPOINT, { method: 'POST', body: JSON.stringify(chunks[ci]), signal: ctrl.signal });
                const corrId = res?.correlationId;
                const chunk: CAMigrationResult[] = ((res?.data?.data as CAMigrationResult[]) ?? []).map((r: CAMigrationResult) => ({ ...r, batchIndex: ci, correlationIdMigrate: corrId }));
                all.push(...chunk);
                setMigrationResults([...all]);
                setMigrationChunkProgress(p => ({ ...p, processedItems: all.length }));
                const updateResult = (result: CAComparisonResult): CAComparisonResult => {
                    if (!snapshot.includes(result.id)) return result;
                    const mr = all.find(r => r.id === result.id) || all.find(r => r.providedPolicyName === (result.csvRow?.PolicyName || result.providedPolicyName) && r.groupToMigrate === (result.csvRow?.GroupName || result.groupToMigrate));
                    if (!mr) return result;
                    const ok = mr.status === 'Success';
                    return { ...result, isMigrated: ok, masterStatus: ok ? 'migration_success' : mr.status === 'Skipped' ? 'migration_skipped' : mr.status === 'NotStarted' ? 'migration_notstarted' : 'migration_failed', masterStatusMessage: ok ? 'Successfully migrated' : mr.errorMessage || mr.status, failureReason: ok ? undefined : mr.errorMessage || mr.status, batchIndex: mr.batchIndex, correlationIdMigrate: mr.correlationIdMigrate };
                };
                setComparisonResults(p => p.map(updateResult));
                setMasterTrackingData(p => p.map(updateResult));
            }
            setMigratedRowIds(all.filter(r => r.status === 'Success').map(r => r.id));
            setCurrentStep('results');
        } catch (err) { if (!(err instanceof UserConsentRequiredError)) setError(err instanceof Error ? err.message : 'Migration failed'); }
        finally { setLoading(false); setMigrationChunkProgress(p => ({ ...p, isProcessing: false })); abortRef.current = null; }
    };

    const cancelMigration = () => { setIsCancelling(true); abortRef.current?.abort(); };

    // ── Validate ──────────────────────────────────────────────────────────────

    const validateAssignments = async () => {
        if (!accounts.length) return;
        const successIds = migrationResults.filter(r => r.status === 'Success').map(r => r.id);
        const idsToCheck = successIds.length > 0 ? successIds : migratedRowIds;
        let items = comparisonResults.filter(r => idsToCheck.includes(r.id));
        if (!items.length) items = masterTrackingData.filter(r => r.masterStatus === 'migration_success');
        if (!items.length) { setError('No successfully migrated items to validate.'); return; }
        setLoading(true); setValidationComplete(false); setError(null);
        try {
            const payload = items.map(r => ({
                policyName: r.csvRow?.PolicyName || r.providedPolicyName || '',
                groupName: r.csvRow?.GroupName || r.groupToMigrate || null,
                assignmentDirection: r.csvRow?.AssignmentDirection || r.assignmentDirection || 'Include',
                assignmentAction: r.csvRow?.AssignmentAction || r.assignmentAction || 'Add'
            }));
            const res = await request<{ data: CAValidationResult[] }>(
                CA_ASSIGNMENTS_VALIDATE_ENDPOINT,
                { method: 'POST', body: JSON.stringify(payload) }
            );
            const data: CAValidationResult[] = (res?.data?.data as CAValidationResult[]) ?? [];
            const corrId = res?.correlationId;
            const ids = items.map(r => r.id);
            setMasterTrackingData(prev => prev.map(result => {
                if (!ids.includes(result.id)) return result;
                const vr = data[ids.indexOf(result.id)];
                if (!vr) return result;
                const ok = vr.hasCorrectAssignment === true;
                return {
                    ...result,
                    masterStatus: ok ? 'validation_success' : 'validation_failed',
                    masterStatusMessage: ok
                        ? `${vr.message.status}: ${vr.message.reason}`
                        : `${vr.message.status}: ${vr.message.reason}`,
                    failureReason: ok ? result.failureReason : vr.message.reason,
                    correlationIdVerify: corrId,
                    validationResult: vr,
                };
            }));
            setValidatedItemsCount(items.length);
            setValidationComplete(true);
            setCurrentStep('validate');
        } catch (err) { if (!(err instanceof UserConsentRequiredError)) setError(err instanceof Error ? err.message : 'Validation failed'); }
        finally { setLoading(false); }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────

    const resetProcess = () => {
        setCsvData([]); setComparisonResults([]); setFilteredComparisonResults([]); setMigrationResults([]);
        setMasterTrackingData([]); setMigratedRowIds([]); setSelectedRows([]); setError(null);
        setCurrentStep('upload'); setValidationComplete(false); setValidatedItemsCount(0);
        setCompareStatusFilter('all'); setMigrationResultFilter('all'); setSummaryStatusFilter('all');
        setMigrationChunkProgress({ currentChunk: 0, totalChunks: 0, processedItems: 0, totalItems: 0, isProcessing: false });
    };

    // ── Columns ───────────────────────────────────────────────────────────────

    const uploadColumns = [
        { key: '_valid', label: 'Status', width: 80, sortable: true, sortValue: (row: Record<string, unknown>) => ((row as unknown as CACsvRow).isValid ? 1 : 0), render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CACsvRow; return r.isValid ? <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" /> : <span title={r.validationErrors?.map(e => e.message).join('; ')}><AlertTriangle className="h-5 w-5 text-red-500 mx-auto" /></span>; } },
        { key: 'PolicyName', label: 'Policy Name', minWidth: 300, render: (v: unknown, row: Record<string, unknown>) => { const r = row as unknown as CACsvRow; const e = r.validationErrors?.some(x => x.field === 'PolicyName'); return <span className={`text-sm font-medium ${e ? 'text-red-600' : ''}`}>{String(v || '')}</span>; } },
        { key: 'GroupName', label: 'Group Name', minWidth: 220, render: (v: unknown) => <span className="text-sm">{String(v || '—')}</span> },
        { key: 'AssignmentDirection', label: 'Direction', width: 120, render: (v: unknown) => <Badge variant={v === 'Include' ? 'default' : 'destructive'}>{String(v)}</Badge> },
        { key: 'AssignmentAction', label: 'Action', width: 110, render: (v: unknown) => <Badge className={v === 'Add' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>{String(v)}</Badge> },
    ];

    const comparisonColumns = [
        { key: '_status', label: 'Status', width: 160, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; if (r.masterStatus === 'already_migrated') return <Badge className="bg-blue-500 text-white">Already Migrated</Badge>; if (r.masterStatus === 'migration_success') return <Badge className="bg-emerald-500 text-white">Migrated</Badge>; if (r.masterStatus === 'migration_failed') return <Badge variant="destructive">Failed</Badge>; if (r.masterStatus === 'migration_skipped') return <Badge variant="secondary">Skipped</Badge>; if (r.masterStatus === 'compare_failed') return <Badge variant="destructive">Not Ready</Badge>; if (r.isReadyForMigration) return <Badge className="bg-green-500 text-white">Ready</Badge>; return <Badge variant="secondary">Unknown</Badge>; } },
        { key: '_policy', label: 'Policy Name', minWidth: 320, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; return <span className="text-sm font-medium">{r.policy?.displayName || r.providedPolicyName || '—'}</span>; } },
        { key: '_group', label: 'Group', minWidth: 200, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; return <span className="text-sm">{r.groupToMigrate || r.csvRow?.GroupName || '—'}</span>; } },
        { key: '_dir', label: 'Direction', width: 110, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; const d = r.csvRow?.AssignmentDirection || r.assignmentDirection; return d ? <Badge variant={d === 'Include' ? 'default' : 'destructive'}>{d}</Badge> : <span>—</span>; } },
        { key: '_act', label: 'Action', width: 100, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; const a = r.csvRow?.AssignmentAction || r.assignmentAction; return a ? <Badge className={a === 'Add' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>{a}</Badge> : <span>—</span>; } },
        { key: '_state', label: 'Policy State', width: 160, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; const s = r.policy?.state; if (!s) return <span className="text-xs text-gray-400">—</span>; const cls: Record<string, string> = { enabled: 'bg-green-500 text-white', disabled: 'bg-gray-500 text-white', enabledForReportingButNotEnforced: 'bg-yellow-500 text-white' }; return <Badge className={cls[s] || ''}>{s === 'enabledForReportingButNotEnforced' ? 'Report Only' : s}</Badge>; } },
        { key: '_details', label: 'Details', minWidth: 200, render: (_: unknown, row: Record<string, unknown>) => { const r = row as unknown as CAComparisonResult; if (r.masterStatus === 'compare_failed' && r.failureReason) return <span className="text-xs text-red-600">{r.failureReason}</span>; if (r.masterStatus === 'already_migrated') return <span className="text-xs text-blue-600">Assignment already exists</span>; if (r.warnings?.length) return <span className="text-xs text-orange-600">{r.warnings.join(', ')}</span>; return <span className="text-xs text-gray-400">—</span>; } },
    ];

    const migrationResultsColumns = [
        { key: 'status', label: 'Status', width: 120, render: (v: unknown) => { const s = String(v); const cls: Record<string, string> = { Success: 'bg-emerald-500 text-white', Failed: 'bg-red-500 text-white', Skipped: 'bg-yellow-500 text-white', NotStarted: 'bg-gray-400 text-white' }; return <Badge className={cls[s] || ''}>{s}</Badge>; } },
        { key: 'providedPolicyName', label: 'Policy Name', minWidth: 320, render: (v: unknown) => <span className="text-sm font-medium">{String(v || '—')}</span> },
        { key: 'groupToMigrate', label: 'Group', minWidth: 200, render: (v: unknown) => <span className="text-sm">{String(v || '—')}</span> },
        { key: 'assignmentDirection', label: 'Direction', width: 110, render: (v: unknown) => { const m: Record<number, string> = { 1: 'Include', 2: 'Exclude' }; const l = m[v as number] || String(v); return <Badge variant={l === 'Include' ? 'default' : 'destructive'}>{l}</Badge>; } },
        { key: 'assignmentAction', label: 'Action', width: 100, render: (v: unknown) => { const m: Record<number, string> = { 0: 'Add', 1: 'Remove' }; const l = m[v as number] || String(v); return <Badge className={l === 'Add' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>{l}</Badge>; } },
        { key: 'errorMessage', label: 'Message', minWidth: 200, render: (v: unknown) => v ? <span className="text-xs text-red-600">{String(v)}</span> : <span className="text-xs text-gray-400">—</span> },
        { key: 'processedAt', label: 'Processed At', width: 170, render: (v: unknown) => v ? <span className="text-xs">{new Date(String(v)).toLocaleString()}</span> : <span>—</span> },
    ];

    const validationColumns = [
        {
            key: '_vstatus', label: 'Status', width: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const vr = r.validationResult;
                if (r.masterStatus === 'validation_success')
                    return <Badge className="bg-emerald-600 text-white">Verified ✓</Badge>;
                if (r.masterStatus === 'validation_failed')
                    return <Badge variant="destructive">{vr?.message?.status || 'Failed'}</Badge>;
                return <Badge variant="secondary">Pending</Badge>;
            }
        },
        {
            key: '_vpolicy', label: 'Policy Name', minWidth: 300,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const name = r.validationResult?.policy?.displayName
                    || r.validationResult?.providedPolicyName
                    || r.policy?.displayName
                    || r.providedPolicyName
                    || r.csvRow?.PolicyName || '—';
                return <span className="text-sm font-medium">{name}</span>;
            }
        },
        {
            key: '_vgroup', label: 'Group', minWidth: 200,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const g = r.validationResult?.groupName || r.groupToMigrate || r.csvRow?.GroupName || '—';
                return <span className="text-sm">{g}</span>;
            }
        },
        {
            key: '_vdir', label: 'Direction', width: 110,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const d = r.validationResult?.assignmentDirection
                    || r.csvRow?.AssignmentDirection
                    || r.assignmentDirection;
                return d
                    ? <Badge variant={d === 'Include' ? 'default' : 'destructive'}>{d}</Badge>
                    : <span>—</span>;
            }
        },
        {
            key: '_vaction', label: 'Action', width: 100,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const a = r.validationResult?.assignmentAction
                    || r.csvRow?.AssignmentAction
                    || r.assignmentAction;
                return a
                    ? <Badge className={a === 'Add' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>{a}</Badge>
                    : <span>—</span>;
            }
        },
        {
            key: '_vpolicystate', label: 'Policy State', width: 140,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const s = r.validationResult?.policy?.state || r.policy?.state;
                if (!s) return <span className="text-xs text-gray-400">—</span>;
                const cls: Record<string, string> = {
                    enabled: 'bg-green-500 text-white',
                    disabled: 'bg-gray-500 text-white',
                    enabledForReportingButNotEnforced: 'bg-yellow-500 text-white'
                };
                return <Badge className={cls[s] || ''}>{s === 'enabledForReportingButNotEnforced' ? 'Report Only' : s}</Badge>;
            }
        },
        {
            key: '_vreason', label: 'Reason', minWidth: 220,
            render: (_: unknown, row: Record<string, unknown>) => {
                const r = row as unknown as CAComparisonResult;
                const reason = r.validationResult?.message?.reason || r.masterStatusMessage || '—';
                const ok = r.masterStatus === 'validation_success';
                return <span className={`text-xs ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{reason}</span>;
            }
        },
    ];

    // ── MigrationSummaryCard ──────────────────────────────────────────────────

    const MigrationSummaryCard = ({ step }: { step: 'upload' | 'migrate' | 'results' | 'validate' }) => {
        const validCount = csvData.filter(r => r.isValid).length;
        const invalidCount = csvData.filter(r => !r.isValid).length;
        const readyCount = comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length;
        const compareFailedCount = comparisonResults.filter(r => !r.isReadyForMigration && !r.isMigrated).length;
        const migratedSuccessCount = migrationResults.filter(r => r.status === 'Success').length;
        const migratedFailedCount = migrationResults.filter(r => r.status === 'Failed').length;
        const migratedSkippedCount = migrationResults.filter(r => r.status === 'Skipped').length;
        const verifiedCount = masterTrackingData.filter(r => r.masterStatus === 'validation_success').length;
        return (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {step === 'upload' ? 'Upload Summary' : step === 'migrate' ? 'Comparison Summary' : step === 'results' ? 'Migration Summary' : 'Verification Summary'}
                    </h3>
                </div>
                {step === 'validate' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Items validated</span><span className="text-lg font-bold text-blue-600">{validatedItemsCount}</span></div>
                        {verifiedCount > 0 && <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Verified</span><span className="text-lg font-bold text-emerald-600">{verifiedCount}</span></div>}
                        {masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length > 0 && <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Failed</span><span className="text-lg font-bold text-red-600">{masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length}</span></div>}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                        <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Uploaded</span><span className="text-lg font-bold text-purple-600">{csvData.length}</span></div>
                        <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Valid CSV</span><span className="text-lg font-bold text-green-600">{validCount}</span></div>
                        {invalidCount > 0 && <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Invalid CSV</span><span className="text-lg font-bold text-red-600">{invalidCount}</span></div>}
                        {step !== 'upload' && <>
                            <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Ready</span><span className="text-lg font-bold text-green-600">{readyCount}</span></div>
                            {compareFailedCount > 0 && <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Compare Failed</span><span className="text-lg font-bold text-red-600">{compareFailedCount}</span></div>}
                        </>}
                        {step === 'results' && migrationResults.length > 0 && <>
                            <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Migrated</span><span className="text-lg font-bold text-emerald-600">{migratedSuccessCount}</span></div>
                            {migratedFailedCount > 0 && <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Failed</span><span className="text-lg font-bold text-red-600">{migratedFailedCount}</span></div>}
                            {migratedSkippedCount > 0 && <div className="flex flex-col"><span className="text-gray-600 dark:text-gray-400 text-xs">Skipped</span><span className="text-lg font-bold text-gray-600">{migratedSkippedCount}</span></div>}
                        </>}
                    </div>
                )}
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const STEPS = [
        { key: 'upload', label: 'Upload CSV', icon: Upload },
        { key: 'compare', label: 'Compare', icon: Eye },
        { key: 'migrate', label: 'Migrate', icon: Play },
        { key: 'results', label: 'Results', icon: CheckCircle2 },
        { key: 'validate', label: 'Verification', icon: RefreshCw },
        { key: 'summary', label: 'Summary', icon: FileText },
    ] as const;
    const stepKeys = STEPS.map(s => s.key);
    const currentStepIndex = stepKeys.indexOf(currentStep);

    return (
        <PlanProtection requiredPlan="extensions" featureName="CA Assignment Migration">
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Shield className="h-8 w-8 text-orange-500" />
                        CA Assignment Migration
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Upload, compare, and migrate Conditional Access policy assignments in bulk using a CSV file.
                    </p>
                </div>
                <Button onClick={resetProcess} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />Start Over
                </Button>
            </div>

            {/* ── Progress Steps ── */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => {
                            const isActive = currentStep === step.key;
                            const isCompleted = stepKeys.indexOf(step.key) < currentStepIndex;
                            const Icon = step.icon;
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex items-center">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${isActive ? 'border-blue-600 bg-blue-600 text-white' : isCompleted ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <ArrowRight className={`h-4 w-4 mx-4 ${stepKeys.indexOf(step.key) < currentStepIndex ? 'text-green-600' : 'text-gray-300'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ── Error Card ── */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5" /><span className="font-medium">Error:</span><span>{error}</span>
                        </div>
                        {currentStep === 'upload' && <Button onClick={() => setError(null)} className="mt-4" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Clear Error</Button>}
                        {currentStep === 'migrate' && <Button onClick={compareAssignments} className="mt-4" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Try Comparison Again</Button>}
                        {currentStep === 'results' && <Button onClick={migrateSelectedAssignments} className="mt-4" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Retry Migration</Button>}
                        {currentStep === 'validate' && <Button onClick={validateAssignments} className="mt-4" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Retry Validation</Button>}
                    </CardContent>
                </Card>
            )}

            {/* ── UPLOAD STEP ── */}
            {currentStep === 'upload' && (
                <Card>
                    <CardHeader className="text-center">
                        <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                        <CardTitle>Upload Assignment CSV</CardTitle>
                        <p className="text-gray-600">Upload a CSV file containing Conditional Access policy assignments to compare and migrate</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300'}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        >
                            <FileText className={`h-8 w-8 mx-auto mb-4 ${isDragOver ? 'text-orange-500' : 'text-gray-400'}`} />
                            <p className={`mb-4 ${isDragOver ? 'text-orange-600' : 'text-gray-600'}`}>
                                {isDragOver ? 'Drop your CSV file here' : 'Drop your CSV file here or click to browse'}
                            </p>
                            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                            <Button onClick={() => fileInputRef.current?.click()}>Select CSV File</Button>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Required CSV columns</p>
                                    <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded block">PolicyName, GroupName, AssignmentDirection (Include/Exclude), AssignmentAction (Add/Remove)</code>
                                </div>
                            </div>
                        </div>

                        {csvData.length > 0 && (
                            <div className="space-y-4">
                                {csvData.filter(r => !r.isValid).length > 0 && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                                                    {csvData.filter(r => !r.isValid).length} Invalid {csvData.filter(r => !r.isValid).length === 1 ? 'Row' : 'Rows'} Detected
                                                </p>
                                                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                                    These rows will be <strong>excluded from migration</strong> due to missing or invalid required fields.
                                                </p>
                                                <div className="space-y-2">
                                                    {Array.from(new Set(csvData.flatMap(r => r.validationErrors?.map(e => e.field) || []))).map(field => {
                                                        const count = csvData.filter(r => r.validationErrors?.some(e => e.field === field)).length;
                                                        return (
                                                            <div key={field} className="text-sm text-red-700 dark:text-red-300">
                                                                • <strong>{count}</strong> row{count !== 1 ? 's' : ''} missing or invalid <code className="bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded">{field}</code>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-medium">💡 Hover over the warning icon in each row to see specific errors.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <MigrationSummaryCard step="upload" />

                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        CSV Data Overview ({csvData.filter(r => r.isValid).length} valid / {csvData.length} total rows)
                                    </h3>
                                    <Button onClick={compareAssignments} disabled={loading || csvData.filter(r => r.isValid).length === 0}>
                                        {loading ? 'Comparing...' : `Compare ${csvData.filter(r => r.isValid).length} Valid Rows`}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">CSV Upload Summary</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                This data is from your uploaded CSV file. Click &ldquo;Compare&rdquo; to check against your live Entra ID environment.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                                        <div className="text-center"><div className="text-2xl font-bold text-blue-500">{csvData.filter(r => r.isValid).length}</div><div className="text-sm text-gray-600 dark:text-gray-400">Valid Rows</div></div>
                                        <div className="text-center"><div className="text-2xl font-bold text-green-500">{csvData.filter(r => r.isValid && r.AssignmentAction === 'Add').length}</div><div className="text-sm text-gray-600 dark:text-gray-400">Add Actions</div></div>
                                        <div className="text-center"><div className="text-2xl font-bold text-orange-500">{csvData.filter(r => r.isValid && r.AssignmentAction === 'Remove').length}</div><div className="text-sm text-gray-600 dark:text-gray-400">Remove Actions</div></div>
                                        <div className="text-center"><div className="text-2xl font-bold text-red-500">{csvData.filter(r => !r.isValid).length}</div><div className="text-sm text-gray-600 dark:text-gray-400">Invalid Rows</div></div>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto">
                                        <DataTable
                                            data={csvData as unknown as Record<string, unknown>[]}
                                            columns={uploadColumns}
                                            currentPage={uploadCurrentPage}
                                            totalPages={Math.ceil(csvData.length / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setUploadCurrentPage}
                                            onItemsPerPageChange={v => { setItemsPerPage(v); setUploadCurrentPage(1); }}
                                            showPagination
                                            searchPlaceholder="Search CSV data..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ── COMPARE (transitional) ── */}
            {currentStep === 'compare' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Comparison</CardTitle>
                        <p className="text-gray-600">Comparing assignments against live Entra ID environment…</p>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={compareAssignments} disabled={loading || csvData.filter(r => r.isValid).length === 0}>
                            {loading ? 'Comparing...' : `Compare ${csvData.filter(r => r.isValid).length} Valid Rows`}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── MIGRATE STEP ── */}
            {currentStep === 'migrate' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Migration Ready</CardTitle>
                                <p className="text-gray-600">Select assignments to migrate</p>
                            </div>
                            <div className="flex items-center gap-2 w-full ml-4">
                                {loading && (
                                    <Button onClick={cancelMigration} disabled={isCancelling} variant="destructive">
                                        {isCancelling
                                            ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Cancelling...</>
                                            : <><X className="h-4 w-4 mr-2" />Cancel Migration</>}
                                    </Button>
                                )}
                                <div className="flex gap-2 ml-auto">
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => setSelectedRows(filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).map(r => r.id))}
                                        disabled={filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length === 0}
                                    >
                                        Select All Ready ({filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length})
                                    </Button>
                                    {!loading && (
                                        <Button
                                            onClick={migrateSelectedAssignments}
                                            disabled={selectedRows.filter(id => { const r = comparisonResults.find(x => x.id === id); return r?.isReadyForMigration && !r?.isMigrated; }).length === 0}
                                        >
                                            Migrate {selectedRows.filter(id => { const r = comparisonResults.find(x => x.id === id); return r?.isReadyForMigration && !r?.isMigrated; }).length} Selected
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Chunk Progress — lives between CardHeader and CardContent, same as source */}
                    {migrationChunkProgress.isProcessing && (
                        <div className="mx-6 mt-6 mb-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                                        <span className="text-lg font-bold text-blue-900 dark:text-blue-100">Migration in Progress</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Chunk {migrationChunkProgress.currentChunk} of {migrationChunkProgress.totalChunks}</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">Processing in batches of 20</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-medium text-blue-800 dark:text-blue-200">
                                        <span>Overall Progress</span>
                                        <span className="text-2xl font-bold">{Math.round((migrationChunkProgress.processedItems / (migrationChunkProgress.totalItems || 1)) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-4 shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                            style={{ width: `${(migrationChunkProgress.processedItems / (migrationChunkProgress.totalItems || 1)) * 100}%` }}
                                        >
                                            {migrationChunkProgress.processedItems > 0 && <span className="text-xs font-bold text-white drop-shadow">{migrationChunkProgress.processedItems}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                                        <span className="font-medium">{migrationChunkProgress.processedItems} of {migrationChunkProgress.totalItems} items processed</span>
                                        <span>{migrationChunkProgress.totalItems - migrationChunkProgress.processedItems} remaining</span>
                                    </div>
                                </div>
                                {migrationResults.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-300 dark:border-blue-700">
                                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"><div className="text-3xl font-bold text-green-600">{migrationResults.filter(r => r.status === 'Success').length}</div><div className="text-xs font-medium text-green-700">Successful</div></div>
                                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"><div className="text-3xl font-bold text-red-600">{migrationResults.filter(r => r.status === 'Failed').length}</div><div className="text-xs font-medium text-red-700">Failed</div></div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><div className="text-3xl font-bold text-gray-600">{migrationResults.filter(r => r.status === 'Skipped').length}</div><div className="text-xs font-medium text-gray-700">Skipped</div></div>
                                    </div>
                                )}
                                <div className="text-xs text-blue-600 dark:text-blue-400 text-center pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <Info className="h-3 w-3 inline mr-1" />Table rows are updating in real-time as each batch completes
                                </div>
                            </div>
                        </div>
                    )}

                    <CardContent>
                        <MigrationSummaryCard step="migrate" />

                        <div className="mb-6 flex gap-2 flex-wrap">
                            <Button onClick={() => handleCompareFilter('all')} variant={compareStatusFilter === 'all' ? 'default' : 'outline'} className="flex items-center gap-2" size="sm"><Circle className="h-4 w-4" />All ({comparisonResults.length})</Button>
                            <Button onClick={() => handleCompareFilter('ready')} variant={compareStatusFilter === 'ready' ? 'default' : 'outline'} className="flex items-center gap-2" size="sm"><CheckCircle className="h-4 w-4 text-green-500" />Ready ({comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length})</Button>
                            <Button onClick={() => handleCompareFilter('migrated')} variant={compareStatusFilter === 'migrated' ? 'default' : 'outline'} className="flex items-center gap-2" size="sm"><CheckCircle className="h-4 w-4 text-blue-500" />Already Migrated ({comparisonResults.filter(r => r.isMigrated).length})</Button>
                            <Button onClick={() => handleCompareFilter('failed')} variant={compareStatusFilter === 'failed' ? 'default' : 'outline'} className="flex items-center gap-2" size="sm"><XCircle className="h-4 w-4 text-red-500" />Compare Failed ({comparisonResults.filter(r => r.masterStatus === 'compare_failed').length})</Button>
                            <Button onClick={() => handleCompareFilter('warnings')} variant={compareStatusFilter === 'warnings' ? 'default' : 'outline'} className="flex items-center gap-2" size="sm"><AlertTriangle className="h-4 w-4 text-orange-500" />Warnings ({comparisonResults.filter(r => !r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'compare_failed').length})</Button>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <span><strong>{filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length}</strong> ready for migration</span>
                                <span><strong>{filteredComparisonResults.filter(r => r.isMigrated).length}</strong> migrated</span>
                                <span><strong>{selectedRows.length}</strong> selected</span>
                            </div>
                        </div>

                        {comparisonResults.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Comparison Results ({comparisonResults.length} policies)</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={e => {
                                                const ids = comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).map(r => r.id);
                                                if (e.target.checked) setSelectedRows(prev => [...prev, ...ids.filter(id => !prev.includes(id))]);
                                                else setSelectedRows(prev => prev.filter(id => !ids.includes(id)));
                                            }}
                                            checked={(() => { const ids = comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).map(r => r.id); return ids.length > 0 && ids.every(id => selectedRows.includes(id)); })()}
                                            className="mr-2"
                                        />
                                        <label className="text-sm text-gray-600">Select all ready for migration</label>
                                    </div>
                                </div>
                                <DataTable
                                    key={`compare-${migrationResults.length}`}
                                    data={filteredComparisonResults as unknown as Record<string, unknown>[]}
                                    columns={comparisonColumns}
                                    className="text-sm"
                                    selectedRows={selectedRows}
                                    onSelectionChange={setSelectedRows}
                                    currentPage={compareCurrentPage}
                                    totalPages={Math.ceil(filteredComparisonResults.length / itemsPerPage)}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCompareCurrentPage}
                                    onItemsPerPageChange={v => { setItemsPerPage(v); setCompareCurrentPage(1); }}
                                    showPagination
                                    searchPlaceholder="Search policies..."
                                    rowClassName={row => { const r = row as unknown as CAComparisonResult; return r.isMigrated ? 'bg-green-50/50 dark:bg-green-900/10' : ''; }}
                                />
                                <div className="flex items-center justify-between bg-gray-50 p-4 dark:bg-neutral-900 rounded-lg">
                                    <div className="flex gap-4 text-sm">
                                        <span><strong>{comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length}</strong> ready</span>
                                        <span><strong>{comparisonResults.filter(r => r.isMigrated).length}</strong> migrated</span>
                                        <span><strong>{selectedRows.length}</strong> selected</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500"><p>No comparison results. Please run the comparison first.</p></div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ── RESULTS STEP ── */}
            {currentStep === 'results' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div><CardTitle>Migration Results</CardTitle><p className="text-gray-600">Review the outcome of the migration process</p></div>
                            <Button onClick={() => setCurrentStep('validate')}><RefreshCw className="h-4 w-4 mr-2" />Proceed to Verification</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <MigrationSummaryCard step="results" />

                        <div className="mb-6 flex gap-2">
                            <Button onClick={() => setMigrationResultFilter('all')} variant={migrationResultFilter === 'all' ? 'default' : 'outline'} className="flex items-center gap-2"><Circle className="h-4 w-4" />All ({migrationResults.length})</Button>
                            <Button onClick={() => setMigrationResultFilter('success')} variant={migrationResultFilter === 'success' ? 'default' : 'outline'} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Successful ({migrationResults.filter(r => r.status === 'Success').length})</Button>
                            <Button onClick={() => setMigrationResultFilter('failed')} variant={migrationResultFilter === 'failed' ? 'default' : 'outline'} className="flex items-center gap-2"><XCircle className="h-4 w-4" />Failed ({migrationResults.filter(r => r.status === 'Failed').length})</Button>
                            <Button onClick={() => setMigrationResultFilter('skipped')} variant={migrationResultFilter === 'skipped' ? 'default' : 'outline'} className="flex items-center gap-2"><Circle className="h-4 w-4" />Skipped ({migrationResults.filter(r => r.status === 'Skipped').length})</Button>
                            <Button onClick={() => setMigrationResultFilter('notstarted')} variant={migrationResultFilter === 'notstarted' ? 'default' : 'outline'} className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Not Started ({migrationResults.filter(r => r.status === 'NotStarted').length})</Button>
                        </div>

                        {/* Glass-card stats — identical to source */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <div className="p-6 bg-gradient-to-br from-green-50/60 to-emerald-50/40 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200/30 dark:border-green-700/30 rounded-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-2 mb-3"><div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><span className="font-semibold text-green-700 dark:text-green-300">Successful</span></div>
                                <div className="text-3xl font-bold text-green-600">{migrationResults.filter(r => r.status === 'Success').length}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-red-50/60 to-rose-50/40 dark:from-red-900/20 dark:to-rose-900/10 border border-red-200/30 dark:border-red-700/30 rounded-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-2 mb-3"><div className="p-2 bg-red-500/10 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div><span className="font-semibold text-red-700 dark:text-red-300">Failed</span></div>
                                <div className="text-3xl font-bold text-red-600">{migrationResults.filter(r => r.status === 'Failed').length}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-gray-50/60 to-slate-50/40 dark:from-gray-900/20 dark:to-slate-900/10 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-2 mb-3"><div className="p-2 bg-gray-500/10 rounded-lg"><Circle className="h-5 w-5 text-gray-600" /></div><span className="font-semibold text-gray-700 dark:text-gray-300">Skipped</span></div>
                                <div className="text-3xl font-bold text-gray-600">{migrationResults.filter(r => r.status === 'Skipped').length}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-yellow-50/60 to-amber-50/40 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200/30 dark:border-yellow-700/30 rounded-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-2 mb-3"><div className="p-2 bg-yellow-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-yellow-600" /></div><span className="font-semibold text-yellow-700 dark:text-yellow-300">Not Started</span></div>
                                <div className="text-3xl font-bold text-yellow-600">{migrationResults.filter(r => r.status === 'NotStarted').length}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200/30 dark:border-blue-700/30 rounded-lg hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-2 mb-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Info className="h-5 w-5 text-blue-600" /></div><span className="font-semibold text-blue-700 dark:text-blue-300">Total</span></div>
                                <div className="text-3xl font-bold text-blue-600">{migrationResults.length}</div>
                            </div>
                        </div>

                        {migrationResultFilter !== 'all' && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">Showing <strong>{filteredMigrationResults.length}</strong> of <strong>{migrationResults.length}</strong> results</p>
                            </div>
                        )}
                        <DataTable columns={migrationResultsColumns} data={filteredMigrationResults as unknown as Record<string, unknown>[]} itemsPerPage={itemsPerPage} showPagination onItemsPerPageChange={setItemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
                    </CardContent>
                </Card>
            )}

            {/* ── VALIDATE STEP ── */}
            {currentStep === 'validate' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div><CardTitle>Final Verification</CardTitle><p className="text-gray-600">Re-run comparison to verify all assignments in their final state</p></div>
                            <div className="flex gap-2">
                                {!validationComplete && (
                                    <Button onClick={validateAssignments} disabled={loading}>
                                        {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Verifying...</> : <><RefreshCw className="h-4 w-4 mr-2" />Run Verification</>}
                                    </Button>
                                )}
                                {validationComplete && <Button onClick={() => setCurrentStep('summary')}><FileText className="h-4 w-4 mr-2" />View Summary</Button>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {validationComplete && <MigrationSummaryCard step="validate" />}

                        {!validationComplete && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">How Verification Works</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            This step re-runs the comparison check for the <strong>{migratedRowIds.length}</strong> rows migrated in this session against your live Entra ID environment to verify the final state.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {validationComplete && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Verification Complete</p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            All {validatedItemsCount} items have been verified. Click &ldquo;View Summary&rdquo; to see the complete report.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {validationComplete && validatedItemsCount > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Verification Results ({validatedItemsCount} items)</h3>
                                    <Badge variant="outline" className="text-xs">Re-compared against live Entra ID</Badge>
                                </div>
                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto overflow-y-visible">
                                        <DataTable
                                            data={validatedItems as unknown as Record<string, unknown>[]}
                                            columns={validationColumns}
                                            className="text-sm"
                                            currentPage={validationCurrentPage}
                                            totalPages={Math.ceil(validatedItemsCount / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setValidationCurrentPage}
                                            onItemsPerPageChange={v => { setItemsPerPage(v); setValidationCurrentPage(1); }}
                                            showPagination
                                            searchPlaceholder="Search verified items..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ── SUMMARY STEP ── */}
            {currentStep === 'summary' && (
                <>
                    {/* Card 1: stats + attention boxes */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg"><CheckCircle2 className="h-6 w-6 text-white" /></div>
                                    <div>
                                        <CardTitle className="text-2xl">Migration Summary</CardTitle>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">End-to-end overview of every row in your CSV</p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={resetProcess}><RotateCcw className="h-4 w-4 mr-2" />New Migration</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Attention boxes */}
                            {(() => {
                                const { csvInvalid, compareFailed, migFailed, migNotVerified, valFailed, migSkipped } = summaryStats;
                                const hasIssues = csvInvalid.length + compareFailed.length + migFailed.length + migNotVerified.length + valFailed.length + migSkipped.length > 0;
                                if (!hasIssues) return null;
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {csvInvalid.length > 0 && <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"><AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{csvInvalid.length} CSV invalid</p><p className="text-xs text-orange-600 dark:text-orange-400">Bad format / missing fields</p></div></div>}
                                        {compareFailed.length > 0 && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-red-800 dark:text-red-200">{compareFailed.length} Compare failed</p><p className="text-xs text-red-600 dark:text-red-400">Policy or group not found</p></div></div>}
                                        {migFailed.length > 0 && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-red-800 dark:text-red-200">{migFailed.length} Migration failed</p><p className="text-xs text-red-600 dark:text-red-400">API / permission error</p></div></div>}
                                        {migNotVerified.length > 0 && <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"><AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{migNotVerified.length} Migrated, not verified</p><p className="text-xs text-blue-600 dark:text-blue-400">Run verification or check portal</p></div></div>}
                                        {valFailed.length > 0 && <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-red-800 dark:text-red-200">{valFailed.length} Verification failed</p><p className="text-xs text-red-600 dark:text-red-400">Not found after migration</p></div></div>}
                                        {migSkipped.length > 0 && <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"><Circle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /><div><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{migSkipped.length} Skipped</p><p className="text-xs text-gray-500">Not selected / skipped by API</p></div></div>}
                                    </div>
                                );
                            })()}

                            {/* Collapsible migration statistics */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <button onClick={() => setIsSummaryExpanded(p => !p)} className="w-full flex items-center justify-between p-6 text-left">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />Migration Statistics
                                    </h3>
                                    {isSummaryExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                </button>
                                {isSummaryExpanded && (
                                    <div className="px-6 pb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-2"><Upload className="h-4 w-4 text-blue-500" /><span className="text-sm font-medium">Total Uploaded</span></div><span className="text-lg font-bold">{summaryStats.totalUploaded}</span></div>
                                                {summaryStats.csvInvalidCount > 0 && <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ml-4"><div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /><span className="text-sm text-red-700 dark:text-red-300">CSV Invalid</span></div><span className="text-sm font-bold text-red-700">{summaryStats.csvInvalidCount}</span></div>}
                                                {summaryStats.compareFailedCount > 0 && <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 ml-4"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /><span className="text-sm text-orange-700 dark:text-orange-300">Compare Failed</span></div><span className="text-sm font-bold text-orange-700">{summaryStats.compareFailedCount}</span></div>}
                                                {summaryStats.notSelectedCount > 0 && <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 ml-4"><div className="flex items-center gap-2"><Circle className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600 dark:text-gray-400">Not Selected</span></div><span className="text-sm font-bold text-gray-600">{summaryStats.notSelectedCount}</span></div>}
                                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-400 dark:border-blue-600 ml-4"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-600" /><span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Ready for Migration</span></div><span className="text-lg font-bold text-blue-700">{summaryStats.readyForMigrationCount}</span></div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2"><ArrowRight className="h-4 w-4" />From {summaryStats.readyForMigrationCount} ready:</div>
                                                {summaryStats.migrationSuccessCount + summaryStats.verifiedCount + summaryStats.verifyFailedCount > 0 && <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ml-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-sm text-green-700 dark:text-green-300">Successfully Migrated</span></div><span className="text-lg font-bold text-green-700">{summaryStats.migrationSuccessCount + summaryStats.verifiedCount + summaryStats.verifyFailedCount}</span></div>}
                                                {summaryStats.migrationSkippedCount > 0 && <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 ml-4"><div className="flex items-center gap-2"><Circle className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-600 dark:text-gray-400">Skipped</span></div><span className="text-sm font-bold text-gray-600">{summaryStats.migrationSkippedCount}</span></div>}
                                                {summaryStats.migrationFailedCount > 0 && <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ml-4"><div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /><span className="text-sm text-red-700 dark:text-red-300">Migration Failed</span></div><span className="text-sm font-bold text-red-700">{summaryStats.migrationFailedCount}</span></div>}
                                                {summaryStats.verifiedCount > 0 && <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-2 border-emerald-400 dark:border-emerald-600 ml-4 mt-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Verified in Entra ID</span></div><span className="text-lg font-bold text-emerald-700">{summaryStats.verifiedCount}</span></div>}
                                                {summaryStats.verifyFailedCount > 0 && <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ml-4"><div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /><span className="text-sm text-red-700 dark:text-red-300">Verification Failed</span></div><span className="text-sm font-bold text-red-700">{summaryStats.verifyFailedCount}</span></div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {summaryStats.verifiedCount > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        <strong>{summaryStats.verifiedCount}</strong> assignment(s) successfully migrated and verified in Entra ID.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card 2: row changelog */}
                    {masterTrackingData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                                    Row Changelog
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">— every CSV row and its final state</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Button onClick={() => setSummaryStatusFilter('all')} variant={summaryStatusFilter === 'all' ? 'default' : 'outline'} size="sm" className="flex items-center gap-2"><Circle className="h-3 w-3" />All ({summaryTableData.length})</Button>
                                    {summaryStats.csvInvalidCount > 0 && <Button onClick={() => setSummaryStatusFilter('csv_invalid')} variant={summaryStatusFilter === 'csv_invalid' ? 'default' : 'outline'} size="sm"><XCircle className="h-3 w-3 text-red-500 mr-1" />CSV Invalid ({summaryStats.csvInvalidCount})</Button>}
                                    {summaryStats.compareFailedCount > 0 && <Button onClick={() => setSummaryStatusFilter('compare_failed')} variant={summaryStatusFilter === 'compare_failed' ? 'default' : 'outline'} size="sm"><AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />Compare Failed ({summaryStats.compareFailedCount})</Button>}
                                    {summaryStats.notSelectedCount > 0 && <Button onClick={() => setSummaryStatusFilter('compare_ready')} variant={summaryStatusFilter === 'compare_ready' ? 'default' : 'outline'} size="sm"><Circle className="h-3 w-3 text-gray-400 mr-1" />Not Selected ({summaryStats.notSelectedCount})</Button>}
                                    {summaryStats.alreadyMigratedCount > 0 && <Button onClick={() => setSummaryStatusFilter('already_migrated')} variant={summaryStatusFilter === 'already_migrated' ? 'default' : 'outline'} size="sm"><CheckCircle2 className="h-3 w-3 text-blue-500 mr-1" />Already Migrated ({summaryStats.alreadyMigratedCount})</Button>}
                                    {summaryStats.migrationSuccessCount > 0 && <Button onClick={() => setSummaryStatusFilter('migration_success')} variant={summaryStatusFilter === 'migration_success' ? 'default' : 'outline'} size="sm"><CheckCircle2 className="h-3 w-3 text-blue-500 mr-1" />Migrated (Not Verified) ({summaryStats.migrationSuccessCount})</Button>}
                                    {summaryStats.verifiedCount > 0 && <Button onClick={() => setSummaryStatusFilter('validation_success')} variant={summaryStatusFilter === 'validation_success' ? 'default' : 'outline'} size="sm"><CheckCircle2 className="h-3 w-3 text-emerald-500 mr-1" />Migrated (Verified) ({summaryStats.verifiedCount})</Button>}
                                    {summaryStats.migrationFailedCount > 0 && <Button onClick={() => setSummaryStatusFilter('migration_failed')} variant={summaryStatusFilter === 'migration_failed' ? 'default' : 'outline'} size="sm"><XCircle className="h-3 w-3 text-red-500 mr-1" />Migration Failed ({summaryStats.migrationFailedCount})</Button>}
                                    {summaryStats.migrationSkippedCount > 0 && <Button onClick={() => setSummaryStatusFilter('migration_skipped')} variant={summaryStatusFilter === 'migration_skipped' ? 'default' : 'outline'} size="sm"><Circle className="h-3 w-3 text-gray-500 mr-1" />Skipped ({summaryStats.migrationSkippedCount})</Button>}
                                    {summaryStats.verifyFailedCount > 0 && <Button onClick={() => setSummaryStatusFilter('validation_failed')} variant={summaryStatusFilter === 'validation_failed' ? 'default' : 'outline'} size="sm"><XCircle className="h-3 w-3 text-red-500 mr-1" />Verify Failed ({summaryStats.verifyFailedCount})</Button>}
                                </div>
                                {summaryStatusFilter !== 'all' && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Showing <strong>{filteredSummaryTableData.length}</strong> of <strong>{summaryTableData.length}</strong> rows</p>
                                    </div>
                                )}
                                <DataTable
                                    data={filteredSummaryTableData}
                                    columns={[
                                        { key: 'batch', label: 'Batch', width: 80, sortable: true, sortValue: (r: Record<string, unknown>) => (r.batchIndexRaw as number) ?? -1, render: v => v !== null && v !== undefined ? <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">#{String(v)}</Badge> : <span className="text-sm text-gray-400">-</span> },
                                        { key: 'policy', label: 'Policy', render: v => <span className="text-sm font-medium truncate block" title={String(v)}>{String(v)}</span> },
                                        { key: 'action', label: 'Action', render: v => { const m: Record<string, string> = { Add: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', Remove: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }; return <span className={`px-2 py-0.5 rounded text-xs font-medium ${m[String(v)] ?? 'bg-gray-100 text-gray-700'}`}>{String(v)}</span>; } },
                                        { key: 'group', label: 'Group', render: v => <span className="text-sm truncate block" title={String(v)}>{String(v)}</span> },
                                        { key: 'direction', label: 'Direction', render: v => { const val = String(v); return <span className={`px-2 py-0.5 rounded text-xs font-medium ${val === 'Include' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' : val === 'Exclude' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-gray-100 text-gray-600'}`}>{val}</span>; } },
                                        { key: 'status', label: 'Final Status', render: v => { const val = String(v); const m: Record<string, { label: string; cls: string }> = { csv_invalid: { label: 'CSV Invalid', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }, compare_ready: { label: 'Ready (Not Migrated)', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }, compare_failed: { label: 'Compare Failed', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }, already_migrated: { label: 'Already Migrated', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' }, migration_success: { label: 'Migrated', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' }, migration_failed: { label: 'Migration Failed', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }, migration_skipped: { label: 'Skipped', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }, migration_notstarted: { label: 'Not Started', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' }, validation_success: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' }, validation_failed: { label: 'Verify Failed', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' } }; const e = m[val] ?? { label: val, cls: 'bg-gray-100 text-gray-600' }; return <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${e.cls}`}>{e.label}</span>; } },
                                        { key: 'notes', label: 'Notes', render: v => { const val = String(v); if (val === '—') return <span className="text-xs text-gray-400">—</span>; return <span className="text-xs text-gray-600 dark:text-gray-400 truncate block max-w-sm" title={val}>{val}</span>; } },
                                    ]}
                                    showPagination
                                    itemsPerPage={25}
                                    searchPlaceholder="Search rows..."
                                />
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

        </div>
        </PlanProtection>
    );
}

export default function CAAssignmentMigrationPage() {
    return <CAAssignmentMigrationContent />;
}