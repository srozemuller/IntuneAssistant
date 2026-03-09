'use client';
import ReactDOM from 'react-dom';
import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    Upload, FileText, CheckCircle2, XCircle, AlertTriangle,
    Play, RotateCcw, Eye, ArrowRight, ArrowUp, Shield, Users, Info, X, RefreshCw, Circle, Blocks, CheckCircle, FileSpreadsheet, BarChart3
} from 'lucide-react';
import {useMsal} from '@azure/msal-react';
import {
    ASSIGNMENTS_COMPARE_ENDPOINT,
    ASSIGNMENTS_ENDPOINT,
    EXPORT_ENDPOINT,
    GROUPS_ENDPOINT,
    ASSIGNMENTS_FILTERS_ENDPOINT,
    ITEMS_PER_PAGE,
    ROLE_SCOPETAGS_ENDPOINT
} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
import {useGroupDetails} from '@/hooks/useGroupDetails';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';

import {DataTable} from '@/components/DataTable';
import {useApiRequest} from "@/hooks/useApiRequest";
import {UserConsentRequiredError} from '@/lib/errors';
import {PlanProtection} from '@/components/PlanProtection';
import {MultiSelect} from "@/components/ui/multi-select";

interface AssignmentCompareApiResponse {
    status: string;
    message?: {
        url?: string;
        message?: string;
    }
    data?: ComparisonResult[] | string;
    errors?: {
        [key: string]: string[];
    };
}

interface ValidationApiResponse {
    status: string;
    message?: {
        url?: string;
        message?: string;
    }
    data?: ValidationResult[] | string;
    errors?: {
        [key: string]: string[];
    };
}

interface CSVRow {
    PolicyName: string;
    GroupName: string;
    AssignmentDirection: 'Include' | 'Exclude';
    AssignmentAction: 'Add' | 'Remove' | 'NoAssignment' | 'Replace';
    FilterName: string | null;
    FilterType: string | null;
    isValidAction?: boolean;
    originalActionValue?: string;
    validationErrors?: CSVValidationError[]; // Add validation errors
    isValid?: boolean; // Overall row validity
    rowId?: string; // Unique identifier for tracking throughout the process
    [key: string]: unknown;
}

interface Assignment {
    id: string;
    target: {
        groupId: string;
        '@odata.type': string;
        deviceAndAppManagementAssignmentFilterId: string | null;
        deviceAndAppManagementAssignmentFilterType: string;
    };
}

interface PolicySettings {
    [key: string]: unknown;
}

interface AssignedGroup {
    id: string;
    displayName: string;
    type: string;
}

interface ComparisonResult {
    id: string;
    assignmentId: string;
    policy: {
        id: string;
        name: string;
        policyType: string;
        policySubType: string;
        assignments: Assignment[];
        scopeTagIds?: string[];
        platform: string;
    };
    policies?: Array<{
        '@odata.type': string | null;
        type: string | null;
        policyType: string;
        policySubType: string;
        id: string;
        isAssigned: boolean;
        createdDateTime: string;
        description: string;
        lastModifiedDateTime: string;
        name: string;
        assignments: Assignment[];
        settingCount: number;
        platform: string;
        settings: PolicySettings;
    }>;
    providedPolicyName?: string;
    assignedGroups?: AssignedGroup[];
    groupToMigrate?: string;
    assignmentType?: string;
    assignmentDirection?: 'Include' | 'Exclude';
    assignmentAction?: 'Add' | 'Remove' | 'NoAssignment';
    filterToMigrate?: {
        id: string | null;
        createdDateTime: string;
        lastModifiedDateTime: string;
        displayName: string | null;
        description: string | null;
        platform: string | null;
        rule: string | null;
        assignmentFilterManagementType: string | null;
    };
    filterType?: string;
    filterName?: string;
    isMigrated?: boolean;
    excludeGroupFromSource?: boolean;
    removeGroupFromSource?: boolean;
    isReadyForMigration?: boolean;
    migrationCheckResult?: {
        assignmentExists: boolean;
        policyExists: boolean;
        policyIsUnique: boolean;
        groupExists: boolean;
        correctAssignmentTypeProvided: boolean;
        correctAssignmentActionProvided: boolean;
        filterExist: boolean;
        filterIsUnique: boolean;
        correctFilterPlatform: boolean;
        correctFilterTypeProvided: boolean;
        assignmentIsCompatible: boolean;
        compatibilityErrors: string[];
    };
    csvRow?: CSVRow;
    isBackedUp?: boolean;
    validationStatus?: 'pending' | 'valid' | 'invalid' | 'warning';
    validationMessage?: string;
    isCurrentSessionValidation?: boolean;
    // Master tracking fields for comprehensive status
    masterStatus?: 'csv_invalid' | 'csv_uploaded' | 'compare_ready' | 'compare_failed' | 'already_migrated' | 'migration_ready' | 'migration_success' | 'migration_failed' | 'validation_success' | 'validation_failed';
    masterStatusMessage?: string;
    failureReason?: string; // Why this item couldn't proceed
    batchIndex?: number | null; // Which batch this migration was part of
}

interface RoleScopeTag {
    id: string;
    displayName: string;
    description: string;
    isBuildIn: boolean;
    assignments: unknown[];
}


interface MigrationResult {
    id: string;
    providedPolicyName: string;
    policy: null;
    assignmentId: string;
    groupToMigrate: string;
    assignmentType: number;
    assignmentDirection: number;
    assignmentAction: number;
    filterType: string | null;
    filterName: string | null;
    isMigrated: boolean;
    status: 'Success' | 'Failed' | 'Skipped' | 'NotStarted';
    errorMessage: string | null;
    processedAt: string;
    batchIndex: number | null;
    originalPayload?: {
        PolicyId: string;
        PolicyName: string;
        PolicyType: string;
        AssignmentResourceName: string;
        AssignmentDirection: string;
        AssignmentAction: string;
        FilterName: string | null;
        FilterType: string | null;
    };

    [key: string]: unknown;
}


interface ValidationResult {
    id: string;
    hasCorrectAssignment: boolean;
    message?: {
        status?: string;
        reason?: string;
    }
    policy?: {
        id: string;
        name: string;
        policyType: string;
        "policySubType": string;
        "createdDateTime": string,
        "creationSource": string,
        "description": string,
        "lastModifiedDateTime": string,
        "isAssigned": boolean,
        assignments: Assignment[];
        settingCount: number;
        platforms: string;
        settings: PolicySettings;
    }
}

// Add new interface for validation errors
interface CSVValidationError {
    rowIndex: number;
    field: string;
    message: string;
}

interface GroupData {
    id?: string;
    displayName?: string;
    description?: string;
    membershipRule?: string;
    createdDateTime?: string;
    groupCount?: {
        userCount: number;
        deviceCount: number;
        groupCount: number;
    };
    members?: unknown;
    memberOf?: Array<{
        '@odata.type': string;
        id: string;
        displayName: string;
        createdDateTime: string;
        type: string;
    }>;
    error?: string;
}

function AssignmentRolloutContent() {
    // API CALLS
    const {instance, accounts} = useMsal();
    const {request, cancel} = useApiRequest();
    // Consent dialog state when not enough permissions
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [consentUrl, setConsentUrl] = useState('');


    const fileInputRef = useRef<HTMLInputElement>(null);

    // State management
    const [currentStep, setCurrentStep] = useState<'upload' | 'compare' | 'migrate' | 'results' | 'validate' | 'summary'>('upload');

    const [csvData, setCsvData] = useState<CSVRow[]>([]);
    const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [migratedRowIds, setMigratedRowIds] = useState<string[]>([]); // frozen snapshot of what was actually migrated
    const [loading, setLoading] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [roleScopeTags, setRoleScopeTags] = useState<RoleScopeTag[]>([]);
    const [retryingRows, setRetryingRows] = useState<Set<string>>(new Set());

    const [error, setError] = useState<string | null>(null);
    const [validationComplete, setValidationComplete] = useState(false);
    const [validatedItemsCount, setValidatedItemsCount] = useState(0); // Store count when validation completes
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([]);

    // Master tracking: All rows from CSV with their complete journey status
    const [masterTrackingData, setMasterTrackingData] = useState<ComparisonResult[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [uploadCurrentPage, setUploadCurrentPage] = useState(1);
    const [compareCurrentPage, setCompareCurrentPage] = useState(1);
    const [validationCurrentPage, setValidationCurrentPage] = useState(1);


    // Group assignments dialog state
    const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
    const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
    const [assignmentGroups, setAssignmentGroups] = useState<{ [key: string]: GroupData }>({});
    const [loadingAssignmentGroups, setLoadingAssignmentGroups] = useState<string[]>([]);

    const [roleScopeTagFilter, setRoleScopeTagFilter] = useState<string[]>([]);
    const [filteredComparisonResults, setFilteredComparisonResults] = useState<ComparisonResult[]>([]);
    const [migrationResultFilter, setMigrationResultFilter] = useState<'all' | 'success' | 'failed' | 'skipped' | 'notstarted'>('all');
    const [compareStatusFilter, setCompareStatusFilter] = useState<'all' | 'ready' | 'migrated' | 'warnings' | 'failed'>('all');
    const [summaryStatusFilter, setSummaryStatusFilter] = useState<'all' | 'csv_invalid' | 'compare_failed' | 'compare_ready' | 'already_migrated' | 'migration_success' | 'migration_failed' | 'validation_success' | 'validation_failed'>('all');

    // Add pagination logic before the return statement
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = comparisonResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(comparisonResults.length / itemsPerPage);


    const [migrationSuccessful, setMigrationSuccessful] = useState(false);

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    // Chunking state for migration
    const [migrationChunkProgress, setMigrationChunkProgress] = useState({
        currentChunk: 0,
        totalChunks: 0,
        processedItems: 0,
        totalItems: 0,
        isProcessing: false
    });

    // Cancellation state for migration
    const [migrationAbortController, setMigrationAbortController] = useState<AbortController | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Track recently updated rows for visual feedback
    const [recentlyUpdatedRows, setRecentlyUpdatedRows] = useState<Set<string>>(new Set());

    // Filter migration results based on status
    const filteredMigrationResults = useMemo(() => {
        if (migrationResultFilter === 'all') {
            return migrationResults;
        } else if (migrationResultFilter === 'success') {
            return migrationResults.filter(r => r.status === 'Success');
        } else if (migrationResultFilter === 'failed') {
            return migrationResults.filter(r => r.status === 'Failed');
        } else if (migrationResultFilter === 'skipped') {
            return migrationResults.filter(r => r.status === 'Skipped');
        } else if (migrationResultFilter === 'notstarted') {
            return migrationResults.filter(r => r.status === 'NotStarted');
        } else {
            return migrationResults;
        }
    }, [migrationResults, migrationResultFilter]);

    // Memoize summary statistics to avoid recalculation
    const summaryStats = useMemo(() => {
        // Use ONLY masterTrackingData as single source of truth to prevent double counting
        // Each row appears ONCE in masterTrackingData with its final status

        // Count items by their status
        const compareFailedItems = masterTrackingData.filter(r => r.masterStatus === 'compare_failed');

        // Items already migrated from previous sessions
        const alreadyMigratedItems = masterTrackingData.filter(r => r.masterStatus === 'already_migrated');

        // Items ready for migration in THIS session
        const compareReadyThisSession = masterTrackingData.filter(r => r.masterStatus === 'compare_ready');

        // Items migrated in THIS session
        const migratedThisSession = masterTrackingData.filter(r =>
            r.masterStatus === 'migration_success' ||
            r.masterStatus === 'migration_failed' ||
            r.masterStatus === 'validation_success' ||
            r.masterStatus === 'validation_failed'
        );

        // Ready for migration = items ready this session + items migrated this session
        const readyForMigrationCount = compareReadyThisSession.length + migratedThisSession.length;

        return {
            // Attention boxes data - all from masterTrackingData
            csvInvalid: masterTrackingData.filter(r => r.masterStatus === 'csv_invalid'),
            compareFailed: compareFailedItems,
            notMigrated: compareReadyThisSession,
            migFailed: masterTrackingData.filter(r => r.masterStatus === 'migration_failed'),
            migNotVerified: masterTrackingData.filter(r => r.masterStatus === 'migration_success'),
            valFailed: masterTrackingData.filter(r => r.masterStatus === 'validation_failed'),
            skipped: migrationResults.filter(r => r.status === 'Skipped'),
            notStarted: migrationResults.filter(r => r.status === 'NotStarted'),
            missing: [],

            // Statistics counts - all from masterTrackingData
            totalUploaded: csvData.length,
            csvInvalidCount: masterTrackingData.filter(r => r.masterStatus === 'csv_invalid').length,
            compareFailedCount: compareFailedItems.length,
            notSelectedCount: compareReadyThisSession.length + alreadyMigratedItems.length,
            readyForMigrationCount: readyForMigrationCount,
            missingCount: 0,
            notStartedCount: migrationResults.filter(r => r.status === 'NotStarted').length,
            migrationSuccessCount: migrationResults.filter(r => r.status === 'Success').length,
            migrationSkippedCount: migrationResults.filter(r => r.status === 'Skipped').length,
            migrationFailedCount: migrationResults.filter(r => r.status === 'Failed').length,
            verifiedCount: masterTrackingData.filter(r => r.masterStatus === 'validation_success').length,
            verifyFailedCount: masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length,
        };
    }, [masterTrackingData, migrationResults, csvData]);

    // Memoize summary table data
    const summaryTableData = useMemo(() => {
        const data = masterTrackingData.map(row => ({
            id: row.id,
            policy: row.csvRow?.PolicyName || row.policy?.name || row.providedPolicyName || '—',
            action: row.csvRow?.AssignmentAction || '—',
            group: row.csvRow?.GroupName || row.groupToMigrate || '—',
            direction: row.csvRow?.AssignmentDirection || '—',
            filter: row.csvRow?.FilterName ? `${row.csvRow.FilterName} (${row.csvRow.FilterType || ''})` : '—',
            status: row.masterStatus || 'unknown',
            batch: row.batchIndex !== null && row.batchIndex !== undefined ? row.batchIndex + 1 : null,
            notes: row.failureReason || row.masterStatusMessage || '—',
        }));

        // Debug: Count statuses
        const statusCounts = data.reduce((acc, row) => {
            acc[row.status] = (acc[row.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log('SUMMARY TABLE STATUS BREAKDOWN:', statusCounts);
        console.log('First 5 masterTrackingData items:', masterTrackingData.slice(0, 5).map(r => ({
            policy: r.csvRow?.PolicyName || r.policy?.name,
            masterStatus: r.masterStatus,
            isMigrated: r.isMigrated,
            batchIndex: r.batchIndex
        })));

        return data;
    }, [masterTrackingData]);

    // Filter summary table data by selected status
    const filteredSummaryTableData = useMemo(() => {
        if (summaryStatusFilter === 'all') {
            return summaryTableData;
        }
        return summaryTableData.filter(row => row.status === summaryStatusFilter);
    }, [summaryTableData, summaryStatusFilter]);

    // Compute validated items for verification results table
    const validatedItems = useMemo(() => {
        // First try items with validation status
        const validationStatusItems = masterTrackingData.filter(r =>
            r.masterStatus === 'validation_success' || r.masterStatus === 'validation_failed'
        );

        if (validationStatusItems.length > 0) {
            return validationStatusItems;
        }

        // If no validation status items but we have validatedItemsCount,
        // try migration_success items
        if (validatedItemsCount > 0) {
            const migrationSuccessItems = masterTrackingData.filter(r => r.masterStatus === 'migration_success');
            if (migrationSuccessItems.length > 0) {
                return migrationSuccessItems;
            }

            // Last resort: use items from migratedRowIds list
            return masterTrackingData.filter(r => migratedRowIds.includes(r.id));
        }

        return [];
    }, [masterTrackingData, validatedItemsCount, migratedRowIds]);

    // Summary Component for consistent display across all steps
    const MigrationSummaryCard = ({ step }: { step: 'upload' | 'compare' | 'migrate' | 'results' | 'validate' }) => {
        const uploadedCount = csvData.length;
        const validCount = csvData.filter(r => r.isValid).length;
        const invalidCount = csvData.filter(r => !r.isValid).length;
        const readyCount = comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length;
        const compareFailedCount = comparisonResults.filter(r => !r.isReadyForMigration && !r.isMigrated).length;
        const migratedSuccessCount = migrationResults.filter(r => r.status === 'Success').length;
        const migratedFailedCount = migrationResults.filter(r => r.status === 'Failed').length;
        const migratedSkippedCount = migrationResults.filter(r => r.status === 'Skipped').length;
        const verifiedCount = comparisonResults.filter(r => r.masterStatus === 'validation_success').length;

        return (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {step === 'upload' && 'Upload Summary'}
                        {step === 'compare' && 'Comparison Summary'}
                        {step === 'migrate' && 'Migration Summary'}
                        {step === 'results' && 'Results Summary'}
                        {step === 'validate' && 'Validation Summary'}
                    </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-sm">
                    {/* Upload Stats */}
                    <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400 text-xs">Rows uploaded using CSV</span>
                        <span className="text-lg font-bold text-purple-600">{uploadedCount}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-600 dark:text-gray-400 text-xs">Rows valid in CSV</span>
                        <span className="text-lg font-bold text-green-600">{validCount}</span>
                    </div>
                    {invalidCount > 0 && (
                        <div className="flex flex-col">
                            <span className="text-gray-600 dark:text-gray-400 text-xs">Row invalid in CSV</span>
                            <span className="text-lg font-bold text-red-600">{invalidCount}</span>
                        </div>
                    )}

                    {/* Compare Stats - show after compare step */}
                    {(step !== 'upload') && (
                        <>
                            <div className="flex flex-col">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Ready for migration</span>
                                <span className="text-lg font-bold text-green-600">{readyCount}</span>
                            </div>
                            {compareFailedCount > 0 && (
                                <div className="flex flex-col">
                                    <span className="text-gray-600 dark:text-gray-400 text-xs">Compare Failed</span>
                                    <span className="text-lg font-bold text-red-600">{compareFailedCount}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Migration Stats - show after migrate step */}
                    {(step === 'migrate' || step === 'results' || step === 'validate') && migrationResults.length > 0 && (
                        <>
                            <div className="flex flex-col">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Migrated</span>
                                <span className="text-lg font-bold text-emerald-600">{migratedSuccessCount}</span>
                            </div>
                            {migratedFailedCount > 0 && (
                                <div className="flex flex-col">
                                    <span className="text-gray-600 dark:text-gray-400 text-xs">Failed</span>
                                    <span className="text-lg font-bold text-red-600">{migratedFailedCount}</span>
                                </div>
                            )}
                            {migratedSkippedCount > 0 && (
                                <div className="flex flex-col">
                                    <span className="text-gray-600 dark:text-gray-400 text-xs">Skipped</span>
                                    <span className="text-lg font-bold text-gray-600">{migratedSkippedCount}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Validation Stats - show after validate step */}
                    {step === 'validate' && verifiedCount > 0 && (
                        <div className="flex flex-col">
                            <span className="text-gray-600 dark:text-gray-400 text-xs">Verified</span>
                            <span className="text-lg font-bold text-teal-600">{verifiedCount}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

// Add this component before the uploadColumns definition
    const ValidationStatusCell = ({csvRow}: { csvRow: CSVRow }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [tooltipPosition, setTooltipPosition] = useState({x: 0, y: 0});
        const iconRef = useRef<HTMLDivElement>(null);

        const handleMouseEnter = () => {
            if (iconRef.current) {
                const rect = iconRef.current.getBoundingClientRect();
                setTooltipPosition({
                    x: rect.left,
                    y: rect.bottom + 8
                });
                setShowTooltip(true);
            }
        };

        if (!csvRow.isValid) {
            return (
                <>
                    <div
                        ref={iconRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="flex items-center justify-center cursor-help"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-500"/>
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div
                                className="absolute -top-1 left-4 w-2 h-2 bg-red-50 dark:bg-red-900 border-l border-t border-red-200 dark:border-red-700 transform rotate-45"></div>
                            <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">Validation
                                Errors:</p>
                            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                                {csvRow.validationErrors?.map((error, idx) => (
                                    <li key={idx} className="leading-relaxed">• {error.message}</li>
                                ))}
                            </ul>
                        </div>,
                        document.body
                    )}
                </>
            );
        }

        return (
            <div className="flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500"/>
            </div>
        );
    };

    const uploadColumns = [
        {
            key: 'validationStatusSort',
            label: 'Status',
            width: 90,
            minWidth: 90,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                // Return 0 for invalid (sorts first), 1 for valid (sorts last)
                return csvRow.isValid ? 1 : 0;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                return <ValidationStatusCell csvRow={csvRow}/>;
            }
        },
        {
            key: 'PolicyName',
            label: 'Policy Name',
            minWidth: 300,
            width: 500,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                const hasError = csvRow.validationErrors?.some(e => e.field === 'PolicyName');
                return (
                    <div className={`text-sm font-medium cursor-pointer truncate block w-full text-left ${
                        hasError ? 'text-red-600 font-bold' : ''
                    }`} title={String(value)}>
                        {String(value) || <span className="text-red-500 italic">Missing</span>}
                    </div>
                );
            }
        },
        {
            key: 'GroupName',
            label: 'Group Name',
            minWidth: 250,
            width: 250,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                const hasError = csvRow.validationErrors?.some(e => e.field === 'GroupName');
                return (
                    <div className={`text-sm font-medium cursor-pointer truncate block w-full text-left ${
                        hasError ? 'text-red-600 font-bold' :
                            csvRow.AssignmentAction === 'NoAssignment' ? 'text-gray-400' : ''
                    }`} title={String(value)}>
                        {String(value) || (hasError ? <span className="text-red-500 italic">Missing</span> : '-')}
                    </div>
                );
            }
        },
        {
            key: 'AssignmentDirection',
            label: 'Direction',
            minWidth: 150,
            width: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                const hasError = csvRow.validationErrors?.some(e => e.field === 'AssignmentDirection');

                if (hasError) {
                    return (
                        <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1"/>
                            Missing
                        </Badge>
                    );
                }

                return (
                    <Badge
                        variant={csvRow.AssignmentDirection === 'Include' ? 'default' : 'destructive'}
                        className={csvRow.AssignmentAction === 'NoAssignment' ? 'opacity-50' : ''}
                    >
                        {csvRow.AssignmentDirection}
                    </Badge>
                );
            }
        },
        {
            key: 'AssignmentAction',
            label: 'Action',
            minWidth: 150,
            width: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                const hasError = csvRow.validationErrors?.some(e => e.field === 'AssignmentAction');

                if (hasError) {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1"/>
                                Invalid
                            </Badge>
                            {csvRow.originalActionValue && (
                                <span className="text-xs text-red-600">
                        &quot;{csvRow.originalActionValue}&quot;
                    </span>
                            )}
                        </div>
                    );
                }

                if (!csvRow.isValidAction) {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive">Invalid</Badge>
                            <span className="text-xs text-red-600">
                    &quot;{csvRow.originalActionValue}&quot;
                </span>
                        </div>
                    );
                }

                return (
                    <Badge
                        variant={
                            csvRow.AssignmentAction === 'Add' ? 'default' :
                                csvRow.AssignmentAction === 'Replace' ? 'default' :
                                    csvRow.AssignmentAction === 'Remove' ? 'destructive' :
                                        csvRow.AssignmentAction === 'NoAssignment' ? 'secondary' : 'secondary'
                        }
                        className={
                            csvRow.AssignmentAction === 'Add' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                csvRow.AssignmentAction === 'Replace' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                    csvRow.AssignmentAction === 'Remove' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                        csvRow.AssignmentAction === 'NoAssignment' ? 'bg-gray-500 hover:bg-gray-600 text-white' : ''
                        }
                    >
                        {csvRow.AssignmentAction}
                    </Badge>
                );
            }
        },
        {
            key: 'FilterName',
            label: 'Filter Name',
            minWidth: 150,
            width: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                return csvRow.FilterName ? (
                    <div
                        className={`max-w-xs truncate ${csvRow.AssignmentAction === 'NoAssignment' ? 'text-gray-400' : ''}`}
                        title={csvRow.FilterName}>
                        {csvRow.FilterName}
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                );
            }
        },
        {
            key: 'FilterType',
            label: 'Filter Type',
            minWidth: 150,
            width: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                return csvRow.FilterType ? (
                    <Badge
                        variant={csvRow.FilterType === 'Include' ? 'default' : 'secondary'}
                        className={csvRow.AssignmentAction === 'NoAssignment' ? 'opacity-50' : ''}
                    >
                        {csvRow.FilterType}
                    </Badge>
                ) : (
                    <span className="text-gray-400">-</span>
                );
            }
        }
    ];

    const MigrationCheckCell = ({result}: { result: ComparisonResult }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [tooltipPosition, setTooltipPosition] = useState({x: 0, y: 0});
        const iconRef = useRef<HTMLDivElement>(null);

        const handleMouseEnter = () => {
            if (iconRef.current) {
                const rect = iconRef.current.getBoundingClientRect();
                setTooltipPosition({
                    x: rect.left,
                    y: rect.bottom + 8
                });
                setShowTooltip(true);
            }
        };

        const check = result.migrationCheckResult;
        if (!check) return null;

        // Check if currently being processed (migration in progress)
        const isProcessing = migrationChunkProgress.isProcessing &&
                           selectedRows.includes(result.id) &&
                           !result.isMigrated &&
                           result.isReadyForMigration;

        // Show pulsing animation for rows being processed
        if (isProcessing) {
            return (
                <>
                    <div
                        ref={iconRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="flex items-center justify-center cursor-help"
                    >
                        <div className="relative">
                            <Play className="h-5 w-5 text-blue-600 animate-pulse" />
                            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-50 animate-ping"></div>
                        </div>
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-blue-50 dark:bg-blue-900 border-l border-t border-blue-200 dark:border-blue-700 transform rotate-45"></div>
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">Processing Migration...</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">This row is being migrated</p>
                        </div>,
                        document.body
                    )}
                </>
            );
        }

        // Check if already migrated
        if (result.isMigrated) {
            return (
                <>
                    <div
                        ref={iconRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="flex items-center justify-center cursor-help"
                    >
                        <Circle className="h-5 w-5 text-blue-500"/>
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div
                                className="absolute -top-1 left-4 w-2 h-2 bg-blue-50 dark:bg-blue-900 border-l border-t border-blue-200 dark:border-blue-700 transform rotate-45"></div>
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">Already Migrated</p>
                        </div>,
                        document.body
                    )}
                </>
            );
        }

        const allChecksPass = check.policyExists && check.policyIsUnique &&
            check.groupExists && check.correctAssignmentTypeProvided &&
            check.correctAssignmentActionProvided && check.assignmentIsCompatible;

        const hasWarnings = check.filterExist === false || check.filterIsUnique === false ||
            check.correctFilterPlatform === false || check.correctFilterTypeProvided === false;

        const errors: string[] = [];
        const warnings: string[] = [];
        const compatibilityErrors: string[] = [];

        if (!check.policyExists) errors.push("Policy not found");
        if (!check.policyIsUnique) errors.push("Multiple policies found");
        if (!check.groupExists) errors.push("Group not found");
        if (!check.correctAssignmentTypeProvided) errors.push("Invalid assignment type");
        if (!check.correctAssignmentActionProvided) errors.push("Invalid assignment action");

        if (check.filterExist === false) warnings.push("Filter not found");
        if (check.filterIsUnique === false) warnings.push("Multiple filters found");
        if (check.correctFilterPlatform === false) warnings.push("Incorrect filter platform");
        if (check.correctFilterTypeProvided === false) warnings.push("Invalid filter type");

        // Add compatibility errors
        if (check.assignmentIsCompatible === false && check.compatibilityErrors && check.compatibilityErrors.length > 0) {
            compatibilityErrors.push(...check.compatibilityErrors);
        }

        // IMPORTANT: If there are compatibility errors, always show red regardless of other checks
        if (compatibilityErrors.length > 0 || !allChecksPass) {
            return (
                <>
                    <div
                        ref={iconRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="flex items-center justify-center cursor-help"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-500"/>
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div
                                className="absolute -top-1 left-4 w-2 h-2 bg-red-50 dark:bg-red-900 border-l border-t border-red-200 dark:border-red-700 transform rotate-45"></div>
                            {errors.length > 0 && (
                                <>
                                    <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">Migration
                                        Check Errors:</p>
                                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 mb-3">
                                        {errors.map((error, idx) => (
                                            <li key={idx} className="leading-relaxed">• {error}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {compatibilityErrors.length > 0 && (
                                <>
                                    <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">Compatibility
                                        Issues:</p>
                                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                                        {compatibilityErrors.map((error, idx) => (
                                            <li key={idx} className="leading-relaxed">• {error}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>,
                        document.body
                    )}
                </>
            );
        }

        // Show yellow warning if all checks pass but there are warnings
        if (allChecksPass && hasWarnings) {
            return (
                <>
                    <div
                        ref={iconRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="flex items-center justify-center cursor-help"
                    >
                        <AlertTriangle className="h-5 w-5 text-yellow-500"/>
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div
                                className="absolute -top-1 left-4 w-2 h-2 bg-yellow-50 dark:bg-yellow-900 border-l border-t border-yellow-200 dark:border-yellow-700 transform rotate-45"></div>
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Filter
                                Warnings:</p>
                            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                                {warnings.map((warning, idx) => (
                                    <li key={idx} className="leading-relaxed">• {warning}</li>
                                ))}
                            </ul>
                        </div>,
                        document.body
                    )}
                </>
            );
        }

        // Show green circle with arrow up for ready-for-migration (not completed yet)
        return (
            <div className="flex items-center justify-center">
                <div className="relative">
                    <Circle className="h-5 w-5 text-green-500 fill-green-100 dark:fill-green-900/30"/>
                    <ArrowUp className="h-3 w-3 text-gray-700 dark:text-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
                </div>
            </div>
        );
    };

    const comparisonColumns = [
        {
            key: '_select',
            label: '',
            width: 50,
            minWidth: 50,
            sortable: false,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const isSelected = selectedRows.includes(result.id);
                const isDisabled = !result.isReadyForMigration || result.isMigrated;

                return (
                    <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
                        <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();

                                const newChecked = e.target.checked;
                                console.log('Before update:', {
                                    resultId: result.id,
                                    newChecked,
                                    currentSelectedRows: selectedRows
                                });

                                setSelectedRows(prev => {
                                    const updated = newChecked
                                        ? (prev.includes(result.id) ? prev : [...prev, result.id])
                                        : prev.filter(id => id !== result.id);

                                    console.log('After update:', updated);
                                    return updated;
                                });
                            }}
                            className={isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        />
                    </div>
                );
            }
        },
        {
            key: 'migrationCheckSortValue',
            label: 'Status',
            width: 80,
            minWidth: 80,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;

                // Check if already migrated first
                if (result.isMigrated) return 3;

                const check = result.migrationCheckResult;
                if (!check) return 2;

                // Check for compatibility errors first
                const hasCompatibilityErrors = check.assignmentIsCompatible === false &&
                    check.compatibilityErrors &&
                    check.compatibilityErrors.length > 0;

                if (hasCompatibilityErrors) return 0;

                const allChecksPass = check.policyExists && check.policyIsUnique &&
                    check.groupExists && check.correctAssignmentTypeProvided &&
                    check.correctAssignmentActionProvided && check.assignmentIsCompatible;

                // If checks fail, return 0 (errors)
                if (!allChecksPass) return 0;

                // Check for warnings
                const hasWarnings = check.filterExist === false ||
                    check.filterIsUnique === false ||
                    check.correctFilterPlatform === false ||
                    check.correctFilterTypeProvided === false;

                // Return 1.5 for warnings, 1.2 for ready (purple arrow), 1 for success (green)
                return hasWarnings ? 1.5 : 1.2;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return <MigrationCheckCell result={result}/>;
            }
        },
        {
            key: 'providedPolicyName',
            label: 'Policy Name',
            minWidth: 200,
            width: 250,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const hasDuplicates = result.policies && result.policies.length > 1;
                const isExpanded = expandedRows.includes(result.id);
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);

                return displayPolicy ? (
                    <div className="flex items-center gap-2">
                        {hasDuplicates && (
                            <button
                                onClick={() => toggleExpanded(result.id)}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium cursor-pointer truncate block w-full text-left"
                                     title={displayPolicy.name || 'Unknown Policy'}>
                                    {displayPolicy.name || 'Unknown Policy'}
                                </div>
                                {hasDuplicates && (
                                    <Badge variant="secondary" className="text-xs">
                                        {result.policies?.length || 0} duplicates
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                {displayPolicy.policyType || 'Unknown Type'} • {displayPolicy.platform || 'Unknown Platform'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-600 text-sm">
                        <XCircle className="h-4 w-4 inline mr-1"/>
                        <div>
                            <div
                                className="text-sm font-medium cursor-pointer truncate block w-full text-left">{result.providedPolicyName || 'Unknown policy name'}</div>
                            <div className="text-xs text-red-500">Policy not found</div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'assignedGroups',
            label: 'Current Assignments',
            width: 150,
            minWidth: 120,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                // Return -1 for N/A cases so they sort first (or use a high number to sort last)
                if (!displayPolicy) return -1;
                return displayPolicy.assignments?.length || 0;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                return displayPolicy ? (
                    <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAssignmentsClick(result);
                        }}
                    >
                        {displayPolicy.assignments?.length || 0} groups
                    </Badge>
                ) : (
                    <Badge variant="destructive">N/A</Badge>
                );
            }
        },
        {
            key: 'groupToMigrate',
            label: 'Target Group',
            minWidth: 120,
            width: 180,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.groupToMigrate || result.csvRow?.GroupName || '-';
            }
        },
        {
            key: 'assignmentDirection',
            label: 'Direction',
            width: 90,
            minWidth: 80,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.assignmentDirection ? (
                    <Badge variant={result.assignmentDirection === 'Include' ? 'default' : 'destructive'}>
                        {result.assignmentDirection}
                    </Badge>
                ) : null;
            }
        },
        {
            key: 'assignmentAction',
            label: 'Action',
            width: 110,
            minWidth: 90,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.assignmentAction ? (
                    <Badge variant={
                        result.assignmentAction === 'Add' ? 'default' :
                            result.assignmentAction === 'NoAssignment' ? 'destructive' : 'secondary'
                    }>
                        {result.assignmentAction}
                    </Badge>
                ) : null;
            }
        },
        {
            key: 'filterName',
            label: 'Filter Name',
            minWidth: 100,
            width: 130,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.filterName || result.csvRow?.FilterName || '-';
            }
        },
        {
            key: 'filterType',
            label: 'Filter Type',
            minWidth: 90,
            width: 110,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                if (!result.filterType) return null;

                if (result.filterType.toLowerCase() === 'none') {
                    return (
                        <Badge variant="outline"
                               className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {result.filterType}
                        </Badge>
                    );
                }

                return (
                    <Badge variant={result.filterType === 'include' ? 'default' : 'destructive'}
                           className={result.filterType === 'include' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                        {result.filterType}
                    </Badge>

                );
            }
        },
        {
            key: 'scopeTagIds',
            label: 'Role Scope Tags',
            width: 140,
            minWidth: 100,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                const scopeTagIds = displayPolicy?.scopeTagIds;
                const tagNames = getRoleScopeTagNames(scopeTagIds);

                if (tagNames.length === 0) {
                    return <span className="text-xs text-gray-500">None</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {tagNames.map((tagName, index) => {
                            const isBuiltIn = roleScopeTags.find(t => t.displayName === tagName)?.isBuildIn;
                            return (
                                <Badge
                                    key={index}
                                    variant={isBuiltIn ? "secondary" : "outline"}
                                    className="text-xs"
                                >
                                    {tagName}
                                </Badge>
                            );
                        })}
                    </div>
                );
            }
        }
    ];

    const migrationResultsColumns = [
        {
            key: 'status',
            label: 'Status',
            width: 80,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                return result.status === 'Success' ? 2 : result.status === 'Skipped' ? 1 : 0;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                if (result.status === 'Success') {
                    return (
                        <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1"/>
                            Success
                        </Badge>
                    );
                } else if (result.status === 'Skipped') {
                    return (
                        <Badge variant="secondary" className="bg-gray-500 text-white">
                            <Circle className="h-3 w-3 mr-1"/>
                            Skipped
                        </Badge>
                    );
                } else {
                    return (
                        <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1"/>
                            Failed
                        </Badge>
                    );
                }
            }
        },
        {
            key: 'batchIndex',
            label: 'Batch',
            width: 80,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                return result.batchIndex ?? -1;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                const batchNumber = result.batchIndex !== null && result.batchIndex !== undefined
                    ? result.batchIndex + 1
                    : null;

                return batchNumber !== null ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        #{batchNumber}
                    </Badge>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                );
            }
        },
        {
            key: 'providedPolicyName',
            label: 'Policy Name',
            minWidth: 200,
            render: (value: unknown) => (
                <span className="text-sm font-medium" title={String(value)}>
                    {String(value)}
                </span>
            )
        },
        {
            key: 'groupToMigrate',
            label: 'Group',
            minWidth: 150,
            render: (value: unknown) => (
                <span className="text-sm" title={String(value)}>
                    {String(value)}
                </span>
            )
        },
        {
            key: 'assignmentAction',
            label: 'Action',
            width: 120,
            render: (value: unknown) => {
                const actionMap: Record<number, string> = {
                    0: 'Add',
                    1: 'Remove',
                    2: 'Replace',
                    3: 'NoAssignment'
                };
                const action = actionMap[Number(value)] || 'Unknown';
                return (
                    <Badge variant={action === 'Add' ? 'default' : 'secondary'}>
                        {action}
                    </Badge>
                );
            }
        },
        {
            key: 'assignmentDirection',
            label: 'Direction',
            width: 120,
            render: (value: unknown) => {
                const actionMap: Record<number, string> = {
                    0: 'NoAssignment',
                    1: 'Include',
                    2: 'Exclude',
                };
                const action = actionMap[Number(value)] || 'Unknown';
                return (
                    <Badge
                        variant={action === 'Include' ? 'default' : action === 'Exclude' ? 'destructive' : 'secondary'}
                        className={action === 'Include' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                        {action}
                    </Badge>
                );
            }
        },
        {
            key: 'filter',
            label: 'Filter',
            minWidth: 180,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                const filterType = result.filterType;
                const filterName = result.filterName;

                // If no filter type or it's 'None', show None badge
                if (!filterType || filterType.toLowerCase() === 'none') {
                    return (
                        <Badge variant="outline"
                               className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            None
                        </Badge>
                    );
                }

                // If filter type exists but no name
                if (!filterName) {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge variant={filterType === 'include' ? 'default' : 'destructive'}
                                   className={filterType === 'include' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                            >
                                {filterType}
                            </Badge>
                            <span className="text-gray-400 text-sm">-</span>
                        </div>
                    );
                }

                // Both type and name exist
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant={filterType === 'include' ? 'default' : 'destructive'}
                               className={filterType === 'include' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                        >
                            {filterType}
                        </Badge>
                        <span className="text-sm truncate max-w-[150px]" title={filterName}>
                           {filterName}
                       </span>
                    </div>
                );
            }
        },
        {
            key: 'errorMessage',
            label: 'Message',
            minWidth: 300,
            render: (value: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                if (result.status === 'Success') {
                    return <span className="text-sm text-green-600">Successfully migrated</span>;
                } else if (result.status === 'Skipped') {
                    return <span className="text-sm text-gray-500">{String(value) || 'Skipped - not selected for migration'}</span>;
                }
                return (
                    <span className="text-sm text-red-600" title={String(value)}>
                        {String(value)}
                    </span>
                );
            }
        },
        {
            key: 'processedAt',
            label: 'Processed',
            width: 180,
            render: (value: unknown) => (
                <span className="text-sm text-gray-500">
                    {new Date(String(value)).toLocaleString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            width: 100,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as MigrationResult;
                const isRetrying = retryingRows.has(result.id);

                // Only show retry button for failed migrations that have original payload
                if (result.status !== 'Failed' || !result.originalPayload) {
                    return null;
                }

                return (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            retryFailedMigration(result.id);
                        }}
                        disabled={isRetrying}
                        className="h-8 px-3"
                    >
                        {isRetrying ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-3 w-3 mr-1"/>
                                Retry
                            </>
                        )}
                    </Button>
                );
            }
        }
    ];

    const validationColumns = [
        {
            key: 'policyName',
            label: 'Policy Name',
            minWidth: 200,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.policy ? (
                    <div className="text-sm font-medium cursor-pointer truncate block w-full text-left"
                         title={result.policy.name}>
                        {result.policy.name}
                    </div>
                ) : (
                    <span className="text-red-600">Policy not found</span>
                );
            }
        },
       {
            key: 'groupName',
            label: 'Group',
            minWidth: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const isNoAssignment = result.csvRow?.AssignmentAction === 'NoAssignment';

                return result.csvRow?.GroupName ? (
                    <div
                        className={`text-sm font-medium cursor-pointer truncate block w-full text-left ${
                            isNoAssignment ? 'italic text-gray-400' : ''
                        }`}
                        title={result.csvRow?.GroupName}
                    >
                        {result.csvRow?.GroupName}
                    </div>
                ) : (
                    <span className="text-red-600">-</span>
                );
            }
        },
        {
            key: 'assignmentAction',
            label: 'Action',
            width: 120,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.csvRow?.AssignmentAction ? (
                    <Badge variant={result.csvRow.AssignmentAction === 'Add' ? 'default' : 'secondary'}>
                        {result.csvRow.AssignmentAction}
                    </Badge>
                ) : null;
            }
        },
        {
            key: 'validationStatus',
            label: 'Validation Status',
            minWidth: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;

                if (result.validationStatus === 'valid') {
                    return (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1"/>
                            Valid
                        </Badge>
                    );
                }
                if (result.validationStatus === 'invalid') {
                    return (
                        <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1"/>
                            Invalid
                        </Badge>
                    );
                }
                if (result.validationStatus === 'warning') {
                    return (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1"/>
                            Warning
                        </Badge>
                    );
                }
                if (result.validationStatus === 'pending') {
                    return <Badge variant="outline">Pending</Badge>;
                }
                return null;
            }
        },
        {
            key: 'validationMessage',
            label: 'Message',
            minWidth: 200,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return (
                    <span className="text-sm font-medium cursor-pointer truncate block w-full text-left">
                    {result.validationMessage || '-'}
                </span>
                );
            }
        }
    ];

    // Drag and drop
    const [isDragOver, setIsDragOver] = useState(false);

// Add these drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target?.result as string;
                        const parsed = parseCSV(content);
                        setCsvData(parsed);
                        setError(null);
                    } catch (err) {
                        setError('Failed to parse CSV file. Please check the format.');
                    }
                };
                reader.readAsText(file);
            } else {
                setError('Please drop a CSV file.');
            }
        }
    }, []);

    const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

    const handleRowClick = (row: Record<string, unknown>, index: number, event?: React.MouseEvent) => {
        const result = row as unknown as ComparisonResult;
        const isDisabled = !result.isReadyForMigration || result.isMigrated;

        if (isDisabled) return;

        // Handle shift-click for range selection/deselection
        if (event?.shiftKey && lastClickedIndex !== null) {
            const currentIndex = index;
            const start = Math.min(lastClickedIndex, currentIndex);
            const end = Math.max(lastClickedIndex, currentIndex);

            const rowsInRange = comparisonResults
                .slice(start, end + 1)
                .filter(r => r.isReadyForMigration && !r.isMigrated)
                .map(r => r.id);

            // Check if all rows in range are already selected
            const allSelected = rowsInRange.every(id => selectedRows.includes(id));

            setSelectedRows(prev => {
                if (allSelected) {
                    // Deselect all rows in range
                    return prev.filter(id => !rowsInRange.includes(id));
                } else {
                    // Select all rows in range
                    const newSelection = [...prev];
                    rowsInRange.forEach(id => {
                        if (!newSelection.includes(id)) {
                            newSelection.push(id);
                        }
                    });
                    return newSelection;
                }
            });
        } else {
            // Normal click - toggle single row selection
            setSelectedRows(prev =>
                prev.includes(result.id)
                    ? prev.filter(id => id !== result.id)
                    : [...prev, result.id]
            );
        }

        setLastClickedIndex(index);
    };

    const toggleExpanded = (resultId: string) => {
        setExpandedRows(prev =>
            prev.includes(resultId)
                ? prev.filter(id => id !== resultId)
                : [...prev, resultId]
        );
    };

    // CSV File Processing
    const parseCSV = (content: string): CSVRow[] => {
        const lines = content.split('\n').filter(line => line.trim());
        const headers = lines[0].split(';').map(h => h.trim());

        return lines.slice(1).map((line, index) => {
            const values = line.split(';');
            const validationErrors: CSVValidationError[] = [];

            const nullIfEmpty = (value: string) => value?.trim() === '' ? null : value?.trim() || null;

            const getAssignmentDirection = (value: string): 'Include' | 'Exclude' => {
                const normalized = value?.trim().toLowerCase();
                return normalized === 'exclude' ? 'Exclude' : 'Include';
            };

            const getAssignmentAction = (value: string): {
                action: 'Add' | 'Remove' | 'NoAssignment' | 'Replace';
                isValid: boolean;
                originalValue?: string
            } => {
                const normalized = value?.trim().toLowerCase();
                if (normalized === 'add') return {action: 'Add', isValid: true};
                if (normalized === 'replace') return {action: 'Replace', isValid: true};
                if (normalized === 'remove') return {action: 'Remove', isValid: true};
                if (normalized === 'noassignment') return {action: 'NoAssignment', isValid: true};

                if (!value || value.trim() === '') {
                    return {action: 'Add', isValid: true};
                }

                return {
                    action: 'Add',
                    isValid: false,
                    originalValue: value?.trim()
                };
            };

            console.log('CSV Line:', line);
            console.log('Values:', values);
            console.log('FilterName raw value:', values[4]);
            console.log('FilterName after nullIfEmpty:', nullIfEmpty(values[4]));

            // Validate required fields
            const policyName = values[0]?.trim() || '';
            const groupName = values[1]?.trim() || '';
            const assignmentDirection = values[2]?.trim() || '';
            const assignmentAction = values[3]?.trim() || '';

            // Get action result first to determine if other fields are needed
            const actionResult = getAssignmentAction(assignmentAction);

            // Check PolicyName (always required)
            if (!policyName) {
                validationErrors.push({
                    rowIndex: index + 2,
                    field: 'PolicyName',
                    message: 'Policy Name is required'
                });
            }

            // Only validate GroupName and AssignmentDirection if action is not 'NoAssignment'
            if (actionResult.action !== 'NoAssignment') {
                // Check GroupName
                if (!groupName) {
                    validationErrors.push({
                        rowIndex: index + 2,
                        field: 'GroupName',
                        message: 'Group Name is required for Add/Remove actions. You can also use All Users or All Devices.'
                    });
                }

                // Check AssignmentDirection
                if (!assignmentDirection) {
                    validationErrors.push({
                        rowIndex: index + 2,
                        field: 'AssignmentDirection',
                        message: 'Assignment Direction is required for Add/Remove actions'
                    });
                }
            }

            // Check AssignmentAction validity
            if (!assignmentAction) {
                validationErrors.push({
                    rowIndex: index + 2,
                    field: 'AssignmentAction',
                    message: 'Assignment Action is required'
                });
            } else if (!actionResult.isValid) {
                validationErrors.push({
                    rowIndex: index + 2,
                    field: 'AssignmentAction',
                    message: `Invalid Assignment Action: "${actionResult.originalValue}". Must be Add, Remove, Replace, or NoAssignment`
                });
            }

            return {
                PolicyName: policyName,
                GroupName: groupName,
                AssignmentDirection: getAssignmentDirection(assignmentDirection),
                AssignmentAction: actionResult.action,
                FilterName: nullIfEmpty(values[4]),
                FilterType: nullIfEmpty(values[5]),
                isValidAction: actionResult.isValid,
                originalActionValue: actionResult.originalValue,
                validationErrors,
                isValid: validationErrors.length === 0,
                validationStatusSort: validationErrors.length === 0 ? 1 : 0,
                rowId: `csv-row-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique ID
            };
        });
    };


    const fetchRoleScopeTags = async () => {
        if (!accounts.length) return;

        try {
            const responseData = await request<{ data: RoleScopeTag[] }>(ROLE_SCOPETAGS_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!responseData) {
                console.error('No response received from role scope tags API');
                setRoleScopeTags([]);
                return;
            }

            if (responseData.data && Array.isArray(responseData.data)) {
                setRoleScopeTags(responseData.data);
            }
        } catch (error) {
            console.error('Failed to fetch role scope tags:', error);
            setRoleScopeTags([]);
        }
    };

    const getRoleScopeTagNames = (scopeTagIds: string[] | undefined): string[] => {
        if (!scopeTagIds || scopeTagIds.length === 0) return [];

        return scopeTagIds
            .map(id => {
                const tag = roleScopeTags.find(t => t.id === id);
                return tag?.displayName || `Unknown (${id})`;
            })
            .filter(Boolean);
    };
    const getUniqueRoleScopeTags = (): Array<{ label: string; value: string }> => {
        const tagIds = new Set<string>();
        // Use all comparison results to show all available tags
        comparisonResults.forEach(result => {
            const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
            displayPolicy?.scopeTagIds?.forEach(id => tagIds.add(id));
        });

        return Array.from(tagIds)
            .map(id => {
                const tag = roleScopeTags.find(t => t.id === id);
                return {
                    label: tag?.displayName || `Unknown (${id})`,
                    value: id
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    };
    // Backup rows
    const downloadBackups = async () => {
        const readyForMigration = comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated);

        if (readyForMigration.length === 0) {
            alert('No policies ready for migration to backup');
            return;
        }

        setBackupLoading(true);

        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const backupResults: { [id: string]: boolean } = {};
            const tenantId = accounts[0]?.tenantId || 'unknown-tenant';
            const loggedInUser = accounts[0]?.username || accounts[0]?.name || 'unknown-user';
            const backupTimestamp = new Date().toISOString();

            for (const policy of readyForMigration) {
                try {
                    const response = await instance.acquireTokenSilent({
                        scopes: [apiScope],
                        account: accounts[0]
                    });

                    const apiResponse = await fetch(`${EXPORT_ENDPOINT}/${policy.policy.policyType}/${policy.policy.id}`, {
                        headers: {
                            'Authorization': `Bearer ${response.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (apiResponse.ok) {
                        const backupData = await apiResponse.json();
                        const folderPath = `${policy.policy.policyType}/${policy.policy.name}_${policy.policy.id}.json`;
                        zip.file(folderPath, JSON.stringify(backupData, null, 2));
                        backupResults[policy.id] = true;
                    } else {
                        console.error(`Failed to backup policy ${policy.policy.id}`);
                        backupResults[policy.id] = false;
                    }
                } catch (error) {
                    console.error(`Failed to backup policy ${policy.policy.id}:`, error);
                    backupResults[policy.id] = false;
                }
            }

            // Create metadata
            const metadata = {
                backupInfo: {
                    createdAt: backupTimestamp,
                    createdBy: loggedInUser,
                    tenantId: tenantId,
                    backupType: 'policy_assignments',
                    version: '1.0'
                },
                tenantInfo: {
                    tenantId: tenantId,
                    userPrincipalName: accounts[0]?.username || 'unknown',
                    displayName: accounts[0]?.name || 'unknown'
                },
                statistics: {
                    totalPoliciesRequested: readyForMigration.length,
                    totalPoliciesBackedUp: Object.values(backupResults).filter(success => success).length,
                    totalPoliciesFailed: Object.values(backupResults).filter(success => !success).length,
                    policyTypeBreakdown: readyForMigration.reduce((acc, policy) => {
                        const type = policy.policy.policyType;
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>)
                },
                policies: readyForMigration.map(policy => ({
                    id: policy.policy.id,
                    name: policy.policy.name,
                    type: policy.policy.policyType,
                    platform: policy.policy.platform,
                    backupSuccessful: backupResults[policy.id] === true,
                    assignmentAction: policy.assignmentAction,
                    targetGroup: policy.groupToMigrate
                }))
            };

            // Add metadata file to root of ZIP
            console.log('Adding metadata to ZIP:', metadata);
            zip.file('backup_metadata.json', JSON.stringify(metadata, null, 2));
            console.log('ZIP contents after adding metadata:', Object.keys(zip.files));


            setComparisonResults(prev =>
                prev.map(result => ({
                    ...result,
                    isBackedUp: backupResults[result.id] === true
                }))
            );

            const content = await zip.generateAsync({type: 'blob'});
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `policy_backups_${tenantId}_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            const successCount = Object.values(backupResults).filter(success => success).length;
            const totalCount = Object.keys(backupResults).length;
            alert(`Backup completed: ${successCount}/${totalCount} policies backed up successfully`);

        } catch (error) {
            console.error('Backup failed:', error);
            alert('Backup failed. Please try again.');
        } finally {
            setBackupLoading(false);
        }
    };

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = parseCSV(content);
                setCsvData(parsed);
                setError(null);
            } catch (err) {
                setError('Failed to parse CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    }, []);


    // API Calls
    const compareAssignments = async () => {
        if (!accounts.length || !csvData.length) return;

        const validCsvData = csvData.filter(row => row.isValid);
        const invalidRowCount = csvData.length - validCsvData.length;

        if (invalidRowCount > 0) {
            console.log(`Excluding ${invalidRowCount} invalid rows from comparison`);
        }

        if (validCsvData.length === 0) {
            setError('No valid rows found in CSV. Please correct the validation errors and re-upload.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch role scope tags first
            await fetchRoleScopeTags();

            const payloadData = validCsvData.map(row => ({
                PolicyName: row.PolicyName,
                GroupName: row.AssignmentAction === 'NoAssignment' ? null : row.GroupName,
                AssignmentDirection: row.AssignmentDirection,
                AssignmentAction: row.AssignmentAction,
                FilterName: row.FilterName,
                FilterType: row.FilterType
            }));

            console.log('Payload being sent to API:', payloadData);

            const apiResponse = await request<AssignmentCompareApiResponse>(ASSIGNMENTS_COMPARE_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(payloadData)
            });

            if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
                setError('Invalid data format received from server');
                setLoading(false);
                return;
            }

            const enhancedResults = apiResponse.data.map((item: ComparisonResult, index: number) => {
                // Get the original CSV row to preserve its unique rowId
                const originalCsvRow = validCsvData[index];

                // Use the API's isReadyForMigration flag to determine status
                let masterStatus: ComparisonResult['masterStatus'];
                let masterStatusMessage = '';
                let failureReason = '';

                if (item.isReadyForMigration) {
                    // Check if already migrated from a previous session
                    if (item.isMigrated) {
                        masterStatus = 'already_migrated';
                        masterStatusMessage = 'Already migrated in previous session';
                    } else {
                        masterStatus = 'compare_ready';
                        masterStatusMessage = 'Ready for migration';
                    }
                } else {
                    masterStatus = 'compare_failed';

                    // Build detailed failure reason from migrationCheckResult
                    const check = item.migrationCheckResult;
                    if (check) {
                        const failures: string[] = [];
                        if (!check.policyExists) failures.push('Policy not found');
                        if (!check.policyIsUnique) failures.push('Multiple policies found with same name');
                        if (!check.groupExists) failures.push('Group not found');
                        if (!check.correctAssignmentTypeProvided) failures.push('Invalid assignment type');
                        if (!check.correctAssignmentActionProvided) failures.push('Invalid assignment action');
                        if (!check.assignmentIsCompatible && check.compatibilityErrors) {
                            failures.push(...check.compatibilityErrors);
                        }
                        failureReason = failures.join('; ');
                    } else {
                        failureReason = 'Validation failed';
                    }
                    masterStatusMessage = `Cannot migrate: ${failureReason}`;
                }

                return {
                    ...item,
                    id: originalCsvRow.rowId || item.id, // Use original CSV rowId for tracking
                    csvRow: originalCsvRow,
                    isReadyForMigration: item.isReadyForMigration,
                    isMigrated: item.isMigrated || false,
                    isBackedUp: false,
                    validationStatus: 'pending' as const,
                    masterStatus,
                    masterStatusMessage,
                    failureReason
                };
            });

            // Also track invalid CSV rows that never made it to comparison
            const invalidCsvRows = csvData.filter(row => !row.isValid).map((row): ComparisonResult => ({
                id: row.rowId || `invalid-${Date.now()}-${Math.random()}`, // Use original rowId
                assignmentId: '',
                policy: {
                    id: '',
                    name: row.PolicyName,
                    policyType: '',
                    policySubType: '',
                    assignments: [],
                    platform: ''
                },
                csvRow: row,
                isReadyForMigration: false,
                isMigrated: false,
                masterStatus: 'csv_invalid',
                masterStatusMessage: 'Invalid CSV data',
                failureReason: row.validationErrors?.map(e => e.message).join('; ') || 'Invalid CSV format'
            }));

            // Combine valid comparisons with invalid rows for complete tracking
            const allTrackedResults = [...enhancedResults, ...invalidCsvRows];

            setComparisonResults(enhancedResults);
            setMasterTrackingData(allTrackedResults);
            setCurrentStep('migrate');
        } catch (error) {
            if (!(error instanceof UserConsentRequiredError)) {
                setError(error instanceof Error ? error.message : 'Failed to compare assignments');
            }
        } finally {
            setLoading(false);
        }
    };
    const migrateSelectedAssignments = async () => {
        if (!accounts.length || !selectedRows.length) return;

        setLoading(true);
        setIsCancelling(false);
        const CHUNK_SIZE = 20;

        // Create new AbortController for this migration
        const abortController = new AbortController();
        setMigrationAbortController(abortController);

        try {
            const selectedComparisonResults = comparisonResults.filter(result =>
                selectedRows.includes(result.id)
            );

            const migrationPayload = selectedComparisonResults.map(result => ({
                PolicyId: result.policy?.id || '',
                PolicyName: result.policy?.name || result.providedPolicyName || '',
                PolicyType: result.policy?.policyType || '',
                AssignmentResourceName: result.csvRow?.GroupName || result.groupToMigrate || '',
                AssignmentDirection: result.csvRow?.AssignmentDirection || result.assignmentDirection || 'Include',
                AssignmentAction: result.csvRow?.AssignmentAction || result.assignmentAction || 'Add',
                FilterName: result.csvRow?.FilterName || result.filterName || null,
                FilterType: result.csvRow?.FilterType || result.filterType || 'none'
            }));

            // Split into chunks of max 20 items
            const chunks = [];
            for (let i = 0; i < migrationPayload.length; i += CHUNK_SIZE) {
                chunks.push(migrationPayload.slice(i, i + CHUNK_SIZE));
            }

            console.log(`Processing ${migrationPayload.length} items in ${chunks.length} chunks of max ${CHUNK_SIZE}`);

            // Initialize chunk progress
            setMigrationChunkProgress({
                currentChunk: 0,
                totalChunks: chunks.length,
                processedItems: 0,
                totalItems: migrationPayload.length,
                isProcessing: true
            });

            // Process chunks sequentially
            const allResults: MigrationResult[] = [];

            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                // Check if cancellation was requested
                if (abortController.signal.aborted) {
                    console.log('Migration cancelled by user');
                    setError('Migration cancelled by user');
                    break;
                }

                const chunk = chunks[chunkIndex];

                console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} items`);

                // Update progress
                setMigrationChunkProgress(prev => ({
                    ...prev,
                    currentChunk: chunkIndex + 1
                }));

                const apiResponse = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                    method: 'POST',
                    body: JSON.stringify(chunk),
                    signal: abortController.signal
                });

                if (!apiResponse || !apiResponse.data) {
                    throw new Error(`Failed to get response from server for chunk ${chunkIndex + 1}`);
                }

                if (apiResponse.status === 'Error' && apiResponse.message?.message === 'User challenge required') {
                    setConsentUrl(apiResponse.message.url || '');
                    setShowConsentDialog(true);
                    setLoading(false);
                    setMigrationChunkProgress(prev => ({ ...prev, isProcessing: false }));
                    return;
                }

                // Store results from this chunk
                const chunkResults = (apiResponse.data as unknown as MigrationResult[]).map(result => {
                    const originalPayload = chunk.find(p =>
                        p.PolicyName === result.providedPolicyName &&
                        p.AssignmentResourceName === result.groupToMigrate
                    );
                    return {
                        ...result,
                        batchIndex: chunkIndex,
                        originalPayload
                    };
                });

                allResults.push(...chunkResults);

                // Update progress with processed items
                setMigrationChunkProgress(prev => ({
                    ...prev,
                    processedItems: allResults.length
                }));

                console.log(`Chunk ${chunkIndex + 1} completed. Total processed: ${allResults.length}/${migrationPayload.length}`);
                console.log(`Results breakdown: Success=${chunkResults.filter(r => r.status === 'Success').length}, Failed=${chunkResults.filter(r => r.status === 'Failed').length}, Skipped=${chunkResults.filter(r => r.status === 'Skipped').length}`);

                // Update table rows in real-time after each chunk completes
                setMigrationResults([...allResults]); // Create new array to force re-render
                console.log('Migration results updated, total results:', allResults.length);

                // Track which rows were just updated
                const updatedRowIds = new Set(chunkResults.map(r => r.id));
                setRecentlyUpdatedRows(updatedRowIds);

                // Clear recently updated status after animation duration
                setTimeout(() => {
                    setRecentlyUpdatedRows(new Set());
                }, 1500);

                setComparisonResults(prev =>
                    prev.map(result => {
                        const migrationResult = allResults.find(mr => mr.id === result.id);
                        if (migrationResult) {
                            const isSuccess = migrationResult.status === 'Success';
                            return {
                                ...result,
                                isMigrated: isSuccess,
                                validationStatus: isSuccess ? 'pending' as const : result.validationStatus,
                                isCurrentSessionValidation: isSuccess,
                                masterStatus: isSuccess ? 'migration_success' as const : 'migration_failed' as const,
                                masterStatusMessage: isSuccess
                                    ? 'Successfully migrated - pending validation'
                                    : `Migration failed: ${migrationResult.errorMessage || 'Unknown error'}`,
                                failureReason: isSuccess ? undefined : (migrationResult.errorMessage || 'Migration failed')
                            };
                        }
                        return result;
                    })
                );

                setMasterTrackingData(prev =>
                    prev.map(result => {
                        const migrationResult = allResults.find(mr => mr.id === result.id);
                        if (migrationResult) {
                            const isSuccess = migrationResult.status === 'Success';
                            return {
                                ...result,
                                isMigrated: isSuccess,
                                validationStatus: isSuccess ? 'pending' as const : result.validationStatus,
                                isCurrentSessionValidation: isSuccess,
                                masterStatus: isSuccess ? 'migration_success' as const : 'migration_failed' as const,
                                masterStatusMessage: isSuccess
                                    ? 'Successfully migrated - pending validation'
                                    : `Migration failed: ${migrationResult.errorMessage || 'Unknown error'}`,
                                failureReason: isSuccess ? undefined : (migrationResult.errorMessage || 'Migration failed'),
                                batchIndex: migrationResult.batchIndex // Add batch index from migration result
                            };
                        }
                        return result;
                    })
                );

                // Add small delay to ensure UI updates are visible between chunks
                if (chunkIndex < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            // All chunks processed
            console.log(`Migration complete. Processed ${allResults.length} items in ${chunks.length} chunks`);

            // Check for 429 rate limit errors and retry them
            const rateLimitedItems = allResults.filter(r =>
                r.status === 'Failed' &&
                r.errorMessage &&
                (r.errorMessage.includes('429') || r.errorMessage.toLowerCase().includes('rate limit'))
            );

            if (rateLimitedItems.length > 0) {
                console.log(`Found ${rateLimitedItems.length} rate-limited items. Waiting 5 seconds before retry...`);

                // Update UI to show retry preparation
                setMigrationChunkProgress(prev => ({
                    ...prev,
                    currentChunk: 0,
                    totalChunks: 0,
                    processedItems: 0,
                    totalItems: rateLimitedItems.length,
                    isProcessing: true
                }));

                // Wait 5 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Prepare retry payload from original payloads
                const retryPayload = rateLimitedItems
                    .filter(item => item.originalPayload)
                    .map(item => item.originalPayload!);

                if (retryPayload.length > 0) {
                    console.log(`Retrying ${retryPayload.length} rate-limited items in batches...`);

                    // Split into chunks for retry
                    const retryChunks = [];
                    for (let i = 0; i < retryPayload.length; i += CHUNK_SIZE) {
                        retryChunks.push(retryPayload.slice(i, i + CHUNK_SIZE));
                    }

                    setMigrationChunkProgress(prev => ({
                        ...prev,
                        totalChunks: retryChunks.length
                    }));

                    // Process retry chunks
                    for (let chunkIndex = 0; chunkIndex < retryChunks.length; chunkIndex++) {
                        // Check if cancellation was requested
                        if (abortController.signal.aborted) {
                            console.log('Migration retry cancelled by user');
                            setError('Migration retry cancelled by user');
                            break;
                        }

                        const retryChunk = retryChunks[chunkIndex];

                        console.log(`Retrying chunk ${chunkIndex + 1}/${retryChunks.length} with ${retryChunk.length} items`);

                        setMigrationChunkProgress(prev => ({
                            ...prev,
                            currentChunk: chunkIndex + 1
                        }));

                        const retryResponse = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                            method: 'POST',
                            body: JSON.stringify(retryChunk),
                            signal: abortController.signal
                        });

                        if (retryResponse && retryResponse.data) {
                            const retryResults = (retryResponse.data as unknown as MigrationResult[]).map(result => {
                                const originalPayload = retryChunk.find(p =>
                                    p.PolicyName === result.providedPolicyName &&
                                    p.AssignmentResourceName === result.groupToMigrate
                                );
                                // Find the original result to preserve its batchIndex
                                const originalResult = allResults.find(r => r.id === result.id);
                                return {
                                    ...result,
                                    batchIndex: originalResult?.batchIndex ?? null,
                                    originalPayload
                                };
                            });

                            // Update allResults with retry results
                            retryResults.forEach(retryResult => {
                                const originalIndex = allResults.findIndex(r => r.id === retryResult.id);
                                if (originalIndex !== -1) {
                                    allResults[originalIndex] = retryResult;
                                }
                            });

                            // Update progress
                            setMigrationChunkProgress(prev => ({
                                ...prev,
                                processedItems: (chunkIndex + 1) * CHUNK_SIZE
                            }));

                            // Update UI with retry results
                            setMigrationResults([...allResults]);

                            // Track updated rows
                            const updatedRowIds = new Set(retryResults.map(r => r.id));
                            setRecentlyUpdatedRows(updatedRowIds);

                            setTimeout(() => {
                                setRecentlyUpdatedRows(new Set());
                            }, 1500);

                            // Update comparison results
                            setComparisonResults(prev =>
                                prev.map(result => {
                                    const migrationResult = allResults.find(mr => mr.id === result.id);
                                    if (migrationResult) {
                                        const isSuccess = migrationResult.status === 'Success';
                                        return {
                                            ...result,
                                            isMigrated: isSuccess,
                                            validationStatus: isSuccess ? 'pending' as const : result.validationStatus,
                                            isCurrentSessionValidation: isSuccess,
                                            masterStatus: isSuccess ? 'migration_success' as const : 'migration_failed' as const,
                                            masterStatusMessage: isSuccess
                                                ? 'Successfully migrated - pending validation'
                                                : `Migration failed: ${migrationResult.errorMessage || 'Unknown error'}`,
                                            failureReason: isSuccess ? undefined : (migrationResult.errorMessage || 'Migration failed')
                                        };
                                    }
                                    return result;
                                })
                            );

                            setMasterTrackingData(prev =>
                                prev.map(result => {
                                    const migrationResult = allResults.find(mr => mr.id === result.id);
                                    if (migrationResult) {
                                        const isSuccess = migrationResult.status === 'Success';
                                        return {
                                            ...result,
                                            isMigrated: isSuccess,
                                            validationStatus: isSuccess ? 'pending' as const : result.validationStatus,
                                            isCurrentSessionValidation: isSuccess,
                                            masterStatus: isSuccess ? 'migration_success' as const : 'migration_failed' as const,
                                            masterStatusMessage: isSuccess
                                                ? 'Successfully migrated - pending validation'
                                                : `Migration failed: ${migrationResult.errorMessage || 'Unknown error'}`,
                                            failureReason: isSuccess ? undefined : (migrationResult.errorMessage || 'Migration failed'),
                                            batchIndex: migrationResult.batchIndex // Add batch index from migration result
                                        };
                                    }
                                    return result;
                                })
                            );

                            console.log(`Retry chunk ${chunkIndex + 1} completed. Success=${retryResults.filter(r => r.status === 'Success').length}, Failed=${retryResults.filter(r => r.status === 'Failed').length}`);

                            // Add small delay between retry chunks
                            if (chunkIndex < retryChunks.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, 300));
                            }
                        }
                    }

                    console.log(`Retry complete. Total retried: ${rateLimitedItems.length} items`);
                }
            }

            setCurrentStep('results');
            setMigratedRowIds([...selectedRows]); // freeze the migrated row IDs for validation
            setSelectedRows([]);

        } catch (error) {
            // Handle abort/cancellation
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Migration was cancelled');
                setError('Migration cancelled by user');
            } else {
                setError(error instanceof Error ? error.message : 'Migration failed');
            }
        } finally {
            setLoading(false);
            setIsCancelling(false);
            setMigrationAbortController(null);
            setMigrationChunkProgress(prev => ({ ...prev, isProcessing: false }));
        }
    };

    const cancelMigration = () => {
        if (migrationAbortController) {
            console.log('Cancelling migration...');
            setIsCancelling(true);
            migrationAbortController.abort();
        }
    };

    const retryFailedMigration = async (resultId: string) => {
        if (!accounts.length) return;

        const failedResult = migrationResults.find(r => r.id === resultId);
        if (!failedResult || !failedResult.originalPayload) {
            setError('Cannot retry: Original migration data not found');
            return;
        }

        setRetryingRows(prev => new Set(prev).add(resultId));

        try {
            const apiResponse = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                method: 'POST',
                body: JSON.stringify([failedResult.originalPayload])
            });

            if (!apiResponse || !apiResponse.data) {
                setError('Failed to get response from server');
                return;
            }

            if (apiResponse.status === 'Error' && apiResponse.message?.message === 'User challenge required') {
                setConsentUrl(apiResponse.message.url || '');
                setShowConsentDialog(true);
                setRetryingRows(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(resultId);
                    return newSet;
                });
                return;
            }

            const retryResult = (apiResponse.data as unknown as MigrationResult[])[0];

            if (retryResult) {
                // Update the migration results with the retry result
                setMigrationResults(prev =>
                    prev.map(r =>
                        r.id === resultId
                            ? {
                                ...retryResult,
                                batchIndex: r.batchIndex, // Preserve original batch index
                                originalPayload: failedResult.originalPayload,
                                processedAt: new Date().toISOString()
                            }
                            : r
                    )
                );

                // Update comparison results if successful
                if (retryResult.status === 'Success') {
                    setComparisonResults(prev =>
                        prev.map(result => {
                            if (result.id === resultId) {
                                return {
                                    ...result,
                                    isMigrated: true,
                                    validationStatus: 'pending' as const,
                                    isCurrentSessionValidation: true
                                };
                            }
                            return result;
                        })
                    );
                }
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Retry failed');
        } finally {
            setRetryingRows(prev => {
                const newSet = new Set(prev);
                newSet.delete(resultId);
                return newSet;
            });
        }
    };

    const validateMigratedAssignments = async () => {
        if (!accounts.length) return;

        console.log('=== VALIDATION DEBUG ===');
        console.log('migrationResults.length:', migrationResults.length);
        console.log('migratedRowIds.length:', migratedRowIds.length);
        console.log('comparisonResults.length:', comparisonResults.length);
        console.log('masterTrackingData.length:', masterTrackingData.length);

        // Use migratedRowIds as the primary source of truth for what was migrated
        // Then verify these rows were actually successful in migrationResults
        const successfulMigrationIds = migrationResults
            .filter(r => r.status === 'Success')
            .map(r => r.id);

        console.log('successfulMigrationIds from migrationResults:', successfulMigrationIds.length);
        console.log('successfulMigrationIds:', successfulMigrationIds);

        // Log sample IDs from each array for comparison
        if (migrationResults.length > 0) {
            console.log('Sample migrationResult ID:', migrationResults[0].id);
            console.log('Sample migrationResult:', migrationResults[0]);
        }
        if (comparisonResults.length > 0) {
            console.log('Sample comparisonResult ID:', comparisonResults[0].id);
        }
        if (masterTrackingData.length > 0) {
            console.log('Sample masterTrackingData ID:', masterTrackingData[0].id);
            console.log('Sample masterTrackingData status:', masterTrackingData[0].masterStatus);
        }
        if (migratedRowIds.length > 0) {
            console.log('Sample migratedRowId:', migratedRowIds[0]);
        }

        // If migrationResults is empty but we have migratedRowIds, use those
        const idsToValidate = successfulMigrationIds.length > 0
            ? successfulMigrationIds
            : migratedRowIds.filter(id => {
                // Check masterTrackingData to confirm these were successful
                const item = masterTrackingData.find(r => r.id === id);
                console.log(`Checking migratedRowId ${id} in masterTrackingData:`, item?.masterStatus);
                return item?.masterStatus === 'migration_success';
            });

        console.log('idsToValidate after fallback:', idsToValidate.length);
        console.log('idsToValidate:', idsToValidate);

        // Get comparison results for these IDs - try both comparisonResults and masterTrackingData
        let selectedComparisonResults = comparisonResults.filter(result =>
            idsToValidate.includes(result.id)
        );

        console.log('selectedComparisonResults from comparisonResults:', selectedComparisonResults.length);

        // Fallback: if comparisonResults doesn't have them, try masterTrackingData
        if (selectedComparisonResults.length === 0 && idsToValidate.length > 0) {
            console.log('Using masterTrackingData as fallback');
            selectedComparisonResults = masterTrackingData.filter(result =>
                idsToValidate.includes(result.id) && result.masterStatus === 'migration_success'
            );
            console.log('selectedComparisonResults from masterTrackingData:', selectedComparisonResults.length);
        }

        // FINAL FALLBACK: Just use migratedRowIds directly if we have them
        if (selectedComparisonResults.length === 0 && migratedRowIds.length > 0) {
            console.log('FINAL FALLBACK: Using migratedRowIds directly');
            // Get items from masterTrackingData by migratedRowIds, regardless of status
            selectedComparisonResults = masterTrackingData.filter(result =>
                migratedRowIds.includes(result.id)
            );
            console.log('selectedComparisonResults from masterTrackingData (by migratedRowIds):', selectedComparisonResults.length);

            // If still nothing, try comparisonResults
            if (selectedComparisonResults.length === 0) {
                selectedComparisonResults = comparisonResults.filter(result =>
                    migratedRowIds.includes(result.id)
                );
                console.log('selectedComparisonResults from comparisonResults (by migratedRowIds):', selectedComparisonResults.length);
            }
        }

        if (selectedComparisonResults.length === 0) {
            console.error('No items found to validate!');
            console.error('Debug info:', {
                migrationResultsCount: migrationResults.length,
                migratedRowIdsCount: migratedRowIds.length,
                comparisonResultsCount: comparisonResults.length,
                masterTrackingDataCount: masterTrackingData.length,
                successfulInMigrationResults: migrationResults.filter(r => r.status === 'Success').length,
                successfulInMasterTracking: masterTrackingData.filter(r => r.masterStatus === 'migration_success').length,
                sampleMigrationResultId: migrationResults[0]?.id,
                sampleComparisonResultId: comparisonResults[0]?.id,
                sampleMasterTrackingDataId: masterTrackingData[0]?.id,
                sampleMigratedRowId: migratedRowIds[0]
            });
            setError(`No successfully migrated rows found to validate. This may be a data consistency issue. Try refreshing and re-running the migration.`);
            return;
        }

        setLoading(true);
        setValidationComplete(false);

        try {
            console.log(`Validating ${selectedComparisonResults.length} successfully migrated items (out of ${migrationResults.length} total migration attempts)`);

            // Build payload from the selected comparison results (same as migration payload source)
            const validationPayload = selectedComparisonResults.map(result => ({
                PolicyName: result.csvRow?.PolicyName || result.providedPolicyName || result.policy?.name || '',
                GroupName: (result.csvRow?.AssignmentAction === 'NoAssignment' || result.assignmentAction === 'NoAssignment')
                    ? null
                    : result.csvRow?.GroupName || result.groupToMigrate || null,
                AssignmentDirection: result.csvRow?.AssignmentDirection || result.assignmentDirection || 'Include',
                AssignmentAction: result.csvRow?.AssignmentAction || result.assignmentAction || 'Add',
                FilterName: result.csvRow?.FilterName || result.filterName || null,
                FilterType: result.csvRow?.FilterType || result.filterType || 'none'
            }));

            console.log('Validation payload (selected rows only):', validationPayload);

            const validationData = await request<AssignmentCompareApiResponse>(ASSIGNMENTS_COMPARE_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(validationPayload)
            });

            if (!validationData) {
                setError('Failed to get response from server');
                return;
            }

            if (validationData.status === 'Error' &&
                validationData.message?.message === 'User challenge required') {

                setConsentUrl(validationData.message.url || '');
                setShowConsentDialog(true);
                setLoading(false);
                return;
            }

            if (!validationData.data || !Array.isArray(validationData.data)) {
                setError('Invalid data format received from server');
                return;
            }

            const validationResults = validationData.data as ComparisonResult[];
            setValidationResults(validationResults as unknown as ValidationResult[]);

            // Helper: resolve validation status from a matching validation result
            const resolveValidationFields = (result: ComparisonResult, matchingValidation: ComparisonResult) => {
                const wasSuccessfullyMigrated = result.masterStatus === 'migration_success';
                let validationStatus: 'valid' | 'invalid' | 'warning';
                let masterStatus: ComparisonResult['masterStatus'];
                let masterStatusMessage: string;
                let failureReason: string | undefined;

                if (matchingValidation.isMigrated) {
                    validationStatus = 'valid';
                    masterStatus = 'validation_success';
                    masterStatusMessage = 'Assignment verified in environment';
                    failureReason = undefined;
                } else if (wasSuccessfullyMigrated && !matchingValidation.isMigrated) {
                    validationStatus = 'invalid';
                    masterStatus = 'validation_failed';
                    masterStatusMessage = 'Assignment not found after migration';
                    failureReason = 'Migration was reported successful but assignment not found in re-check';
                } else if (matchingValidation.isReadyForMigration && !wasSuccessfullyMigrated) {
                    validationStatus = 'warning';
                    masterStatus = result.masterStatus;
                    masterStatusMessage = 'Ready for migration but was not migrated';
                    failureReason = undefined;
                } else {
                    validationStatus = 'invalid';
                    masterStatus = 'validation_failed';
                    const check = matchingValidation.migrationCheckResult;
                    const failures: string[] = [];
                    if (check) {
                        if (!check.policyExists) failures.push('Policy not found');
                        if (!check.policyIsUnique) failures.push('Multiple policies found');
                        if (!check.groupExists) failures.push('Group not found');
                        if (!check.assignmentIsCompatible && check.compatibilityErrors) {
                            failures.push(...check.compatibilityErrors);
                        }
                    }
                    failureReason = failures.length > 0 ? failures.join('; ') : 'Validation check failed';
                    masterStatusMessage = `Validation failed: ${failureReason}`;
                }

                return {
                    validationStatus,
                    validationMessage: masterStatusMessage,
                    isCurrentSessionValidation: true,
                    masterStatus,
                    masterStatusMessage,
                    failureReason,
                    policy: matchingValidation.policy || result.policy,
                    isMigrated: matchingValidation.isMigrated,
                    isReadyForMigration: matchingValidation.isReadyForMigration,
                    migrationCheckResult: matchingValidation.migrationCheckResult
                };
            };

            // Use the items that were actually validated (those we sent in the validation payload)
            // These are the ones in selectedComparisonResults
            const validatedItemIds = selectedComparisonResults.map(r => r.id);

            console.log(`Updating ${validatedItemIds.length} items with validation results`);
            console.log('validatedItemIds:', validatedItemIds);
            console.log('validationResults.length:', validationResults.length);

            // Only update rows that were in this validation batch
            setComparisonResults(prev =>
                prev.map(result => {
                    // Skip rows that were not part of this validation
                    if (!validatedItemIds.includes(result.id)) return result;

                    const matchingValidation = validationResults.find(vr => {
                        const validationPolicyName = vr.providedPolicyName || vr.policy?.name;
                        const resultPolicyName = result.csvRow?.PolicyName || result.policy?.name;
                        const validationGroupName = vr.groupToMigrate;
                        const resultGroupName = result.csvRow?.GroupName || result.groupToMigrate;
                        return validationPolicyName === resultPolicyName &&
                               validationGroupName === resultGroupName;
                    });

                    if (!matchingValidation) {
                        console.log(`No matching validation found for ${result.csvRow?.PolicyName || result.policy?.name}`);
                        return result;
                    }

                    const updated = { ...result, ...resolveValidationFields(result, matchingValidation) };
                    console.log(`Updated validation for ${result.csvRow?.PolicyName || result.policy?.name}, isCurrentSessionValidation:`, updated.isCurrentSessionValidation);
                    return updated;
                })
            );

            // Only update master tracking for validated rows
            setMasterTrackingData(prev => {
                const updated = prev.map(result => {
                    if (!validatedItemIds.includes(result.id)) return result;

                    const matchingValidation = validationResults.find(vr => {
                        const validationPolicyName = vr.providedPolicyName || vr.policy?.name;
                        const resultPolicyName = result.csvRow?.PolicyName || result.policy?.name;
                        const validationGroupName = vr.groupToMigrate;
                        const resultGroupName = result.csvRow?.GroupName || result.groupToMigrate;
                        return validationPolicyName === resultPolicyName &&
                               validationGroupName === resultGroupName;
                    });

                    if (!matchingValidation) {
                        console.log(`No matching validation found for: ${result.csvRow?.PolicyName || result.policy?.name}`);
                        return result;
                    }

                    const validationFields = resolveValidationFields(result, matchingValidation);

                    console.log(`Validation update for ${result.csvRow?.PolicyName || result.policy?.name}:`, {
                        oldStatus: result.masterStatus,
                        newStatus: validationFields.masterStatus,
                        wasSuccessfullyMigrated: result.masterStatus === 'migration_success',
                        isMigrated: matchingValidation.isMigrated,
                        isReadyForMigration: matchingValidation.isReadyForMigration
                    });

                    return { ...result, ...validationFields };
                });

                console.log('Master tracking updated with validation results');
                return updated;
            });

            // Store the count of validated items
            setValidatedItemsCount(validationResults.length);
            setValidationComplete(true);
            console.log(`Validation completed for ${validationResults.length} selected items`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Validation failed');
            console.error('Validation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignmentGroupDetails = async (groupId: string) => {
        if (assignmentGroups[groupId] || loadingAssignmentGroups.includes(groupId)) {
            return;
        }

        setLoadingAssignmentGroups(prev => [...prev, groupId]);

        try {
            interface GroupApiResponse {
                status: string;
                message: string;
                details: string;
                data: GroupData;
            }

            const response = await request<GroupApiResponse>(`${GROUPS_ENDPOINT}/${groupId}`, {
                method: 'GET'
            });

            if (response?.data) {
                setAssignmentGroups(prev => ({
                    ...prev,
                    [groupId]: response.data
                }));
            }
        } catch (error) {
            console.error(`Failed to fetch group details for ${groupId}:`, error);
            setAssignmentGroups(prev => ({
                ...prev,
                [groupId]: {
                    error: 'Failed to load group details'
                } as GroupData
            }));
        } finally {
            setLoadingAssignmentGroups(prev => prev.filter(id => id !== groupId));
        }
    };

    const handleAssignmentsClick = async (result: ComparisonResult) => {
        const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
        if (!displayPolicy?.assignments) return;

        setSelectedAssignments(displayPolicy.assignments);
        setShowAssignmentsDialog(true);

        // Fetch group details for all group assignments
        for (const assignment of displayPolicy.assignments) {
            if (assignment.target?.groupId && assignment.target['@odata.type']?.includes('groupAssignmentTarget')) {
                await fetchAssignmentGroupDetails(assignment.target.groupId);
            }
        }
    };

const validateAssignments = async () => {
    console.log('validateAssignments called');
    console.log('migrationResults:', migrationResults);
    console.log('migrationResults.length:', migrationResults.length);
    console.log('migratedRowIds:', migratedRowIds);
    console.log('migratedRowIds.length:', migratedRowIds.length);
    console.log('masterTrackingData with migration_success:', masterTrackingData.filter(r => r.masterStatus === 'migration_success').length);

    // First check migrationResults
    let successfulMigrations = migrationResults.filter(r => r.status === 'Success');
    console.log('successfulMigrations from migrationResults:', successfulMigrations.length);

    // If migrationResults is empty but we have migratedRowIds, try to reconstruct from masterTrackingData
    if (successfulMigrations.length === 0 && migratedRowIds.length > 0) {
        console.log('Attempting to reconstruct migration results from masterTrackingData');
        const successfullyMigrated = masterTrackingData.filter(r =>
            r.masterStatus === 'migration_success' && migratedRowIds.includes(r.id)
        );

        if (successfullyMigrated.length > 0) {
            console.log(`Found ${successfullyMigrated.length} successfully migrated items in masterTrackingData`);
            // Reconstruct migrationResults from masterTrackingData
            const reconstructedResults: MigrationResult[] = successfullyMigrated.map(item => ({
                id: item.id,
                providedPolicyName: item.csvRow?.PolicyName || item.providedPolicyName || '',
                policy: null,
                assignmentId: '',
                groupToMigrate: item.csvRow?.GroupName || item.groupToMigrate || '',
                assignmentType: 0,
                assignmentDirection: 0,
                assignmentAction: 0,
                filterType: item.csvRow?.FilterType || null,
                filterName: item.csvRow?.FilterName || null,
                isMigrated: true,
                status: 'Success' as const,
                errorMessage: null,
                processedAt: new Date().toISOString(),
                batchIndex: null
            }));

            setMigrationResults(reconstructedResults);
            successfulMigrations = reconstructedResults;
            console.log('Reconstructed migration results:', reconstructedResults.length);
        }
    }

    if (successfulMigrations.length === 0) {
        // Check if we have migrated rows tracked in migratedRowIds
        if (migratedRowIds.length > 0) {
            console.error('Found migratedRowIds but no successful migrations found in either migrationResults or masterTrackingData');
            setError(`Migration tracking error: ${migratedRowIds.length} row(s) were marked as migrated but validation data is unavailable. This may happen if you refreshed the page. Please re-run the migration.`);
        } else {
            setError('No successfully migrated rows to validate. All migrations failed or were skipped.');
        }
        return;
    }

    console.log(`Validation will re-run comparison for ${successfulMigrations.length} successfully migrated rows`);
    await validateMigratedAssignments();
};

    const resetProcess = () => {
        // Reset step and basic state
        setCurrentStep('upload');

        // Clear all data arrays (used in useMemo calculations)
        setCsvData([]);
        setComparisonResults([]);
        setFilteredComparisonResults([]);
        setMasterTrackingData([]);
        setMigrationResults([]);
        setValidationResults([]);

        // Clear selection and tracking
        setSelectedRows([]);
        setMigratedRowIds([]);

        // Reset filters
        setRoleScopeTagFilter([]);
        setCompareStatusFilter('all');
        setMigrationResultFilter('all');

        // Reset validation state
        setValidationComplete(false);

        // Reset pagination
        setCurrentPage(1);
        setItemsPerPage(10);

        // Clear errors
        setError(null);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        console.log('🔄 Process reset - all state and memoized data cleared');
    };

    const {
        selectedGroup,
        groupLoading,
        groupError,
        isDialogOpen,
        fetchGroupDetails,
        closeDialog
    } = useGroupDetails();

    const AssignmentsDialog = () => (
        <Dialog open={showAssignmentsDialog} onOpenChange={setShowAssignmentsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5"/>
                        Current Assignments ({selectedAssignments.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {selectedAssignments.map((assignment) => {
                        const isGroupAssignment = assignment.target?.['@odata.type']?.includes('groupAssignmentTarget');
                        const isExcludeAssignment = assignment.target?.['@odata.type']?.includes('exclusionGroupAssignmentTarget');
                        const groupId = assignment.target?.groupId;
                        const groupData = groupId ? assignmentGroups[groupId] : null;
                        const isLoading = groupId ? loadingAssignmentGroups.includes(groupId) : false;

                        // Determine assignment direction
                        const assignmentDirection = isExcludeAssignment ? 'Exclude' : 'Include';
                        const directionColor = isExcludeAssignment ? 'destructive' : 'default';

                        return (
                            <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-500"/>
                                        <span className="font-medium">
                                        {isGroupAssignment ? 'Group Assignment' : 'All Users/Devices'}
                                    </span>
                                        <Badge variant={directionColor} className="text-xs">
                                            {assignmentDirection}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {assignment.target?.deviceAndAppManagementAssignmentFilterType !== 'None' && (
                                            <Badge variant="outline" className="text-xs">
                                                Filtered
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {isGroupAssignment && groupId && (
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin"/>
                                                <span className="text-sm">Loading group details...</span>
                                            </div>
                                        ) : groupData?.error ? (
                                            <div className="text-sm text-red-500">
                                                Failed to load group details
                                            </div>
                                        ) : groupData ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-sm flex items-center gap-1">
                                                        {groupData.displayName}
                                                        {groupData.membershipRule && groupData.membershipRule.trim() !== '' && (
                                                            <Blocks className="h-3 w-3 text-purple-500 flex-shrink-0"/>
                                                        )}
                                                    </h4>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowAssignmentsDialog(false);
                                                            fetchGroupDetails(groupId);
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1"/>
                                                        View Details
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {groupData.description || 'No description available'}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span>ID: {groupData.id}</span>
                                                    {groupData.groupCount && (
                                                        <>
                                                            <span>Users: {groupData.groupCount.userCount}</span>
                                                            <span>Devices: {groupData.groupCount.deviceCount}</span>
                                                            <span>Groups: {groupData.groupCount.groupCount}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                Group ID: {groupId}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isGroupAssignment && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-500"/>
                                            <span className="text-sm font-medium">All Users and Devices</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            This assignment applies to all users and devices in your organization
                                        </p>
                                    </div>
                                )}

                                {assignment.target?.deviceAndAppManagementAssignmentFilterId && (
                                    <div className="text-xs text-gray-500">
                                        <span
                                            className="font-medium">Filter:</span> {assignment.target.deviceAndAppManagementAssignmentFilterType}
                                        <span
                                            className="ml-2">ID: {assignment.target.deviceAndAppManagementAssignmentFilterId}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );

    useEffect(() => {
        let filtered = comparisonResults;

        console.log('📊 Compare Filter Debug:', {
            totalComparisonResults: comparisonResults.length,
            compareStatusFilter,
            statusBreakdown: {
                ready: comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length,
                migrated: comparisonResults.filter(r => r.isMigrated).length,
                warnings: comparisonResults.filter(r => !r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'compare_failed').length,
                failed: comparisonResults.filter(r => r.masterStatus === 'compare_failed' || (!r.isReadyForMigration && !r.isMigrated)).length,
            }
        });

        // Apply role scope tag filter
        if (roleScopeTagFilter.length > 0) {
            filtered = filtered.filter((result) => {
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                return displayPolicy?.scopeTagIds?.some(id => roleScopeTagFilter.includes(id));
            });
        }

        // Apply compare status filter
        if (compareStatusFilter === 'ready') {
            filtered = filtered.filter(r => r.isReadyForMigration && !r.isMigrated);
        } else if (compareStatusFilter === 'migrated') {
            filtered = filtered.filter(r => r.isMigrated);
        } else if (compareStatusFilter === 'warnings') {
            filtered = filtered.filter(r => !r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'compare_failed');
        } else if (compareStatusFilter === 'failed') {
            filtered = filtered.filter(r => r.masterStatus === 'compare_failed');
        }
        // 'all' doesn't need additional filtering

        console.log('Filtered results:', filtered.length);
        setFilteredComparisonResults(filtered);
    }, [comparisonResults, roleScopeTagFilter, compareStatusFilter]);

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Assignments Manager</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload, compare, and migrate policy assignments in bulk using a CSV file.
                    </p>
                </div>
                <Button onClick={resetProcess} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2"/>
                    Start Over
                </Button>
            </div>

            {/* Progress Steps */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        {[
                            {key: 'upload', label: 'Upload CSV', icon: Upload},
                            {key: 'compare', label: 'Compare', icon: Eye},
                            {key: 'migrate', label: 'Migrate', icon: Play},
                            {key: 'results', label: 'Results', icon: CheckCircle2},
                            {key: 'validate', label: 'Verification', icon: RefreshCw},
                            {key: 'summary', label: 'Summary', icon: FileText}
                        ].map((step, index) => {
                            const stepKeys = ['upload', 'compare', 'migrate', 'results', 'validate', 'summary'];
                            const currentStepIndex = stepKeys.indexOf(currentStep);
                            const thisStepIndex = stepKeys.indexOf(step.key);

                            const isActive = currentStep === step.key;
                            const isCompleted = thisStepIndex < currentStepIndex;
                            const Icon = step.icon;

                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex items-center">
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                                                isActive
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : isCompleted
                                                        ? 'border-green-600 bg-green-600 text-white'
                                                        : 'border-gray-300 bg-white text-gray-400'
                                            }`}>
                                            <Icon className="h-5 w-5"/>
                                        </div>
                                        <span className={`ml-3 text-sm font-medium ${
                                            isActive
                                                ? 'text-blue-600'
                                                : isCompleted
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                        }`}>
                    {step.label}
                </span>
                                    </div>
                                    {index < 5 && (
                                        <ArrowRight className={`h-4 w-4 mx-4 ${
                                            isCompleted ? 'text-green-600' : 'text-gray-300'
                                        }`}/>
                                    )}
                                </React.Fragment>
                            );
                        })}

                    </div>
                </CardContent>
            </Card>

            {/* Step-specific Error Display */}
            {error && (
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <X className="h-5 w-5"/>
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>

                        {/* Step-specific error content */}
                        {currentStep === 'upload' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred while processing the CSV file. Please check the file format and try
                                    again.
                                </p>
                                <Button
                                    onClick={() => setError(null)}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2"/>
                                    Clear Error
                                </Button>
                            </>
                        )}

                        {currentStep === 'compare' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred while comparing assignments. Please check your connection and try
                                    again.
                                </p>
                                <Button
                                    onClick={compareAssignments}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2"/>
                                    Try Comparison Again
                                </Button>
                            </>
                        )}

                        {currentStep === 'migrate' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred during migration. The operation may be partially completed.
                                </p>
                                <Button
                                    onClick={migrateSelectedAssignments}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2"/>
                                    Retry Migration
                                </Button>
                            </>
                        )}

                        {currentStep === 'validate' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred while validating assignments. This doesn&apos;t affect your
                                    migrations.
                                </p>
                                <Button
                                    onClick={validateAssignments}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2"/>
                                    Retry Validation
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}


            {/* Step Content */}
            {currentStep === 'upload' && (
                <Card>
                    <CardHeader className="text-center">
                        <Upload className="h-12 w-12 text-yellow-500 mx-auto mb-4"/>
                        <CardTitle>Upload Assignment CSV</CardTitle>
                        <p className="text-gray-600">
                            Upload a CSV file containing policy assignments to compare and migrate
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragOver
                                    ? 'border-yellow-500 bg-blue-50'
                                    : 'border-gray-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <FileText className={`h-8 w-8 mx-auto mb-4 ${
                                isDragOver ? 'text-yellow-500' : 'text-gray-400'
                            }`}/>
                            <p className={`mb-4 ${
                                isDragOver ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                                {isDragOver ? 'Drop your CSV file here' : 'Drop your CSV file here or click to browse'}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Select CSV File
                            </Button>
                        </div>


                        {csvData.length > 0 && (
                            <div className="space-y-4">
                                {/* Validation Summary */}
                                {csvData.filter(r => !r.isValid).length > 0 && (
                                    <div
                                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0"/>
                                            <div className="flex-1">
                                                <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                                                    {csvData.filter(r => !r.isValid).length} Invalid {csvData.filter(r => !r.isValid).length === 1 ? 'Row' : 'Rows'} Detected
                                                </p>
                                                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                                    These rows will be <strong>excluded from migration</strong> due to
                                                    missing or invalid required fields.
                                                </p>

                                                {/* Group errors by field */}
                                                <div className="space-y-2">
                                                    {Array.from(new Set(
                                                        csvData.flatMap(r => r.validationErrors?.map(e => e.field) || [])
                                                    )).map(field => {
                                                        const count = csvData.filter(r =>
                                                            r.validationErrors?.some(e => e.field === field)
                                                        ).length;
                                                        return (
                                                            <div key={field}
                                                                 className="text-sm text-red-700 dark:text-red-300">
                                                                • <strong>{count}</strong> row{count !== 1 ? 's' : ''} missing
                                                                or invalid <code
                                                                className="bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded">{field}</code>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-medium">
                                                    💡 Hover over the warning icon (⚠️) in each row to see specific
                                                    validation errors.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary Card */}
                                <MigrationSummaryCard step="upload" />

                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        CSV Data Overview ({csvData.filter(r => r.isValid).length} valid
                                        / {csvData.length} total rows)
                                    </h3>
                                    <Button
                                        onClick={compareAssignments}
                                        disabled={loading || csvData.filter(r => r.isValid).length === 0}
                                    >
                                        {loading ? 'Comparing...' : `Compare ${csvData.filter(r => r.isValid).length} Valid Rows`}
                                    </Button>
                                </div>

                                {/* Summary Stats - only count valid rows */}
                                <div className="space-y-3">
                                    {/* Clear indicator that this is CSV data, not live environment data */}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                CSV Upload Summary
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                This data is from your uploaded CSV file, not live environment data. Click &ldquo;Compare&rdquo; to check against your actual Intune assignments.
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-blue-500">{csvData.filter(r => r.isValid).length}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Valid Rows in CSV</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-500">
                                                {csvData.filter(r => r.isValid && r.AssignmentAction === 'Add').length}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Add Actions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-500">
                                                {csvData.filter(r => r.isValid && r.AssignmentAction === 'Remove').length}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Remove Actions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-500">
                                                {csvData.filter(r => r.isValid && r.AssignmentAction === 'NoAssignment').length}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Clear Actions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-500">
                                                {csvData.filter(r => r.isValid && r.FilterName).length}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">With Filters</div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="border rounded-lg overflow-visible"> {/* Changed from overflow-hidden */}
                                    <div className="overflow-x-auto"> {/* Only horizontal scroll */}
                                        <DataTable
                                            data={csvData}
                                            columns={uploadColumns}
                                            currentPage={uploadCurrentPage}
                                            totalPages={Math.ceil(csvData.length / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setUploadCurrentPage}
                                            onItemsPerPageChange={(newItemsPerPage) => {
                                                setItemsPerPage(newItemsPerPage);
                                                setUploadCurrentPage(1);
                                            }}
                                            showPagination={true}
                                            searchPlaceholder="Search CSV data..."
                                        />
                                    </div>
                                </div>

                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {currentStep === 'compare' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Comparison</CardTitle>
                        <p className="text-gray-600">
                            Review current assignments vs. planned changes
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={compareAssignments}
                                disabled={loading || csvData.filter(r => r.isValidAction).length === 0}>
                            {loading ? 'Comparing...' :
                                csvData.filter(r => !r.isValidAction).length > 0
                                    ? `Compare ${csvData.filter(r => r.isValidAction).length} Valid Rows (${csvData.filter(r => !r.isValidAction).length} Excluded)`
                                    : `Compare ${csvData.filter(r => r.isValidAction).length} Assignments`
                            }
                        </Button>
                    </CardContent>
                </Card>
            )}

            {currentStep === 'migrate' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Migration Ready</CardTitle>
                                <p className="text-gray-600">
                                    Select assignments to migrate
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const readyIds = filteredComparisonResults
                                            .filter(r => r.isReadyForMigration && !r.isMigrated)
                                            .map(r => r.id);
                                        setSelectedRows(readyIds);
                                    }}
                                    disabled={filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length === 0}
                                >
                                    Select All Ready
                                    ({filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length})
                                </Button>


                                <Button
                                    onClick={downloadBackups}
                                    disabled={loading || comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length === 0}
                                    variant="outline"
                                >
                                    {backupLoading ? 'Creating Backup...' : 'Backup Ready Policies'}
                                </Button>

                                {!loading && (
                                    <Button
                                        onClick={migrateSelectedAssignments}
                                        disabled={
                                            selectedRows.filter(id => {
                                                const result = comparisonResults.find(r => r.id === id);
                                                return result?.isReadyForMigration && !result?.isMigrated;
                                            }).length === 0
                                        }
                                    >
                                        {`Migrate ${
                                            selectedRows.filter(id => {
                                                const result = comparisonResults.find(r => r.id === id);
                                                return result?.isReadyForMigration && !result?.isMigrated;
                                            }).length
                                        } Selected`}
                                    </Button>
                                )}

                                {loading && (
                                    <Button
                                        onClick={cancelMigration}
                                        disabled={isCancelling}
                                        variant="destructive"
                                    >
                                        {isCancelling ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Cancelling...
                                            </>
                                        ) : (
                                            <>
                                                <X className="h-4 w-4 mr-2"/>
                                                Cancel Migration
                                            </>
                                        )}
                                    </Button>
                                )}

                            </div>
                        </div>
                    </CardHeader>

                    {/* Chunk Progress Display */}
                    {migrationChunkProgress.isProcessing && (
                        <div className="mx-6 mt-6 mb-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                            {migrationChunkProgress.totalChunks === 0 && migrationChunkProgress.currentChunk === 0
                                                ? 'Preparing to Retry Rate-Limited Items...'
                                                : migrationChunkProgress.currentChunk > 0 && migrationResults.filter(r => r.status === 'Failed' && (r.errorMessage?.includes('429') || r.errorMessage?.toLowerCase().includes('rate limit'))).length > 0
                                                    ? 'Retrying Rate-Limited Items'
                                                    : 'Migration in Progress'
                                            }
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        {migrationChunkProgress.totalChunks > 0 ? (
                                            <>
                                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                    Chunk {migrationChunkProgress.currentChunk} of {migrationChunkProgress.totalChunks}
                                                </div>
                                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                                    Processing in batches of 20
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                                Waiting 5 seconds before retry...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Main Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-medium text-blue-800 dark:text-blue-200">
                                        <span>Overall Progress</span>
                                        <span className="text-2xl font-bold">
                                            {Math.round((migrationChunkProgress.processedItems / migrationChunkProgress.totalItems) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-4 shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                            style={{
                                                width: `${(migrationChunkProgress.processedItems / migrationChunkProgress.totalItems) * 100}%`
                                            }}
                                        >
                                            {migrationChunkProgress.processedItems > 0 && (
                                                <span className="text-xs font-bold text-white drop-shadow">
                                                    {migrationChunkProgress.processedItems}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                                        <span className="font-medium">
                                            {migrationChunkProgress.processedItems} of {migrationChunkProgress.totalItems} items processed
                                        </span>
                                        <span>
                                            {migrationChunkProgress.totalItems - migrationChunkProgress.processedItems} remaining
                                        </span>
                                    </div>
                                </div>

                                {/* Statistics */}
                                {migrationResults.length > 0 && (
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-300 dark:border-blue-700">
                                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg transition-all duration-300">
                                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300">
                                                {migrationResults.filter(r => r.status === 'Success').length}
                                            </div>
                                            <div className="text-xs font-medium text-green-700 dark:text-green-500">Successful</div>
                                        </div>
                                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg transition-all duration-300">
                                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 transition-all duration-300">
                                                {migrationResults.filter(r => r.status === 'Failed').length}
                                            </div>
                                            <div className="text-xs font-medium text-red-700 dark:text-red-500">Failed</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all duration-300">
                                            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 transition-all duration-300">
                                                {migrationResults.filter(r => r.status === 'Skipped').length}
                                            </div>
                                            <div className="text-xs font-medium text-gray-700 dark:text-gray-500">Skipped</div>
                                        </div>
                                    </div>
                                )}

                                {/* Info message */}
                                <div className="text-xs text-blue-600 dark:text-blue-400 text-center pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <Info className="h-3 w-3 inline mr-1" />
                                    {migrationChunkProgress.totalChunks === 0 && migrationChunkProgress.currentChunk === 0
                                        ? 'Detected rate-limited items. Waiting 5 seconds before automatic retry...'
                                        : 'Table rows are updating in real-time as each batch completes'}
                                </div>
                            </div>
                        </div>
                    )}

                    <CardContent>

                        {/* Summary Card */}
                        <MigrationSummaryCard step="migrate" />

                        {/* Filter by Compare Status */}
                        <div className="mb-6 flex gap-2 flex-wrap">
                            <Button
                                onClick={() => setCompareStatusFilter('all')}
                                variant={compareStatusFilter === 'all' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <Circle className="h-4 w-4"/>
                                All ({comparisonResults.length})
                            </Button>
                            <Button
                                onClick={() => setCompareStatusFilter('ready')}
                                variant={compareStatusFilter === 'ready' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <div className="relative">
                                    <Circle className="h-5 w-5 text-green-500 fill-green-100 dark:fill-green-900/30"/>
                                    <ArrowUp className="h-3 w-3 text-gray-700 dark:text-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
                                </div>
                                Ready for Migration ({comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length})
                            </Button>
                            <Button
                                onClick={() => setCompareStatusFilter('migrated')}
                                variant={compareStatusFilter === 'migrated' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <CheckCircle className="h-4 w-4 text-blue-500"/>
                                Already Migrated ({comparisonResults.filter(r => r.isMigrated).length})
                            </Button>
                            <Button
                                onClick={() => setCompareStatusFilter('failed')}
                                variant={compareStatusFilter === 'failed' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <XCircle className="h-4 w-4 text-red-500"/>
                                Compare Failed ({comparisonResults.filter(r => r.masterStatus === 'compare_failed').length})
                            </Button>
                            <Button
                                onClick={() => setCompareStatusFilter('warnings')}
                                variant={compareStatusFilter === 'warnings' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <AlertTriangle className="h-4 w-4 text-orange-500"/>
                                Warnings ({comparisonResults.filter(r => !r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'compare_failed').length})
                            </Button>
                        </div>

                        <div className="mb-4 flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium dark:text-gray-200 mb-2 block">
                                    Filter by Role Scope Tags
                                </label>
                                <MultiSelect
                                    options={getUniqueRoleScopeTags()}
                                    selected={roleScopeTagFilter}
                                    onChange={setRoleScopeTagFilter}
                                    placeholder="Select scope tags..."
                                />
                            </div>
                            {roleScopeTagFilter.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRoleScopeTagFilter([])}
                                >
                                    Clear Filter
                                </Button>
                            )}
                        </div>

                        {/* Info badges - update to use filteredComparisonResults */}
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                        <strong>{filteredComparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length}</strong> ready for migration
                    </span>
                                <span>
                        <strong>{filteredComparisonResults.filter(r => r.isMigrated).length}</strong> migrated
                    </span>
                                <span>
                        <strong>{selectedRows.length}</strong> selected
                    </span>
                            </div>
                        </div>

                        {/* Comparison Results Table */}
                        {comparisonResults.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Comparison Results
                                        ({comparisonResults.length} policies)</h3>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                const readyRows = comparisonResults
                                                    .filter(r => r.isReadyForMigration && !r.isMigrated)
                                                    .map(r => r.id);

                                                if (e.target.checked) {
                                                    setSelectedRows([...selectedRows, ...readyRows.filter(id => !selectedRows.includes(id))]);
                                                } else {
                                                    setSelectedRows(selectedRows.filter(id => !readyRows.includes(id)));
                                                }
                                            }}
                                            checked={(() => {
                                                const readyRows = comparisonResults
                                                    .filter(r => r.isReadyForMigration && !r.isMigrated)
                                                    .map(r => r.id);
                                                return readyRows.length > 0 && readyRows.every(id => selectedRows.includes(id));
                                            })()}
                                            className="mr-2"
                                        />
                                        <label className="text-sm text-gray-600">Select all ready for migration</label>
                                    </div>
                                </div>
                                <DataTable
                                    key={`compare-table-${migrationResults.length}-${migrationChunkProgress.processedItems}`}
                                    data={filteredComparisonResults.map(result => result as unknown as Record<string, unknown>)}
                                    columns={comparisonColumns}
                                    className="text-sm"
                                    selectedRows={selectedRows}
                                    onRowClick={(row, index, event) => handleRowClick(row, index, event)}
                                    currentPage={compareCurrentPage}
                                    totalPages={Math.ceil(filteredComparisonResults.length / itemsPerPage)}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCompareCurrentPage}
                                    onItemsPerPageChange={(newItemsPerPage) => {
                                        setItemsPerPage(newItemsPerPage);
                                        setCompareCurrentPage(1);
                                    }}
                                    showPagination={true}
                                    onSelectionChange={setSelectedRows}
                                    searchPlaceholder="Search policies..."
                                    rowClassName={(row) => {
                                        const result = row as unknown as ComparisonResult;
                                        const isProcessing = migrationChunkProgress.isProcessing &&
                                                           selectedRows.includes(result.id) &&
                                                           !result.isMigrated &&
                                                           result.isReadyForMigration;
                                        const isRecentlyUpdated = recentlyUpdatedRows.has(result.id);

                                        // Add pulsing blue background for rows being processed
                                        if (isProcessing) {
                                            return 'bg-blue-50 dark:bg-blue-900/20 animate-pulse border-l-4 border-blue-500';
                                        }
                                        // Add flash effect for recently updated rows
                                        if (isRecentlyUpdated && result.isMigrated) {
                                            return 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 transition-all duration-1000';
                                        }
                                        // Add green tint for successfully migrated rows
                                        if (result.isMigrated) {
                                            return 'bg-green-50/50 dark:bg-green-900/10 transition-all duration-500';
                                        }
                                        return '';
                                    }}
                                />
                                {/* Summary */}
                                <div
                                    className="flex items-center justify-between bg-gray-50 p-4 dark:bg-neutral-900 rounded-lg">
                                    <div className="flex gap-4 text-sm">
                <span>
                    <strong>{comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length}</strong> ready for migration
                </span>
                                        <span>
                    <strong>{comparisonResults.filter(r => r.isMigrated).length}</strong> migrated
                </span>
                                        <span>
                    <strong>{selectedRows.length}</strong> selected
                </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No comparison results available. Please run the comparison first.</p>
                            </div>
                        )}

                    </CardContent>
                </Card>
            )}

            {currentStep === 'results' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Migration Results</CardTitle>
                                <p className="text-gray-600">
                                    Review the outcome of the migration process
                                </p>
                            </div>
                            <Button
                                onClick={() => setCurrentStep('validate')}
                            >
                                <RefreshCw className="h-4 w-4 mr-2"/>
                                Proceed to Verification
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Summary Card */}
                        <MigrationSummaryCard step="results" />

                        {/* Filter Buttons */}
                        <div className="mb-6 flex gap-2">
                            <Button
                                onClick={() => setMigrationResultFilter('all')}
                                variant={migrationResultFilter === 'all' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                            >
                                <Circle className="h-4 w-4"/>
                                All ({migrationResults.length})
                            </Button>
                            <Button
                                onClick={() => setMigrationResultFilter('success')}
                                variant={migrationResultFilter === 'success' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="h-4 w-4"/>
                                Successful ({migrationResults.filter(r => r.status === 'Success').length})
                            </Button>
                            <Button
                                onClick={() => setMigrationResultFilter('failed')}
                                variant={migrationResultFilter === 'failed' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                            >
                                <XCircle className="h-4 w-4"/>
                                Failed ({migrationResults.filter(r => r.status === 'Failed').length})
                            </Button>
                            <Button
                                onClick={() => setMigrationResultFilter('skipped')}
                                variant={migrationResultFilter === 'skipped' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                            >
                                <Circle className="h-4 w-4"/>
                                Skipped ({migrationResults.filter(r => r.status === 'Skipped').length})
                            </Button>
                            <Button
                                onClick={() => setMigrationResultFilter('notstarted')}
                                variant={migrationResultFilter === 'notstarted' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                            >
                                <AlertTriangle className="h-4 w-4"/>
                                Not Started ({migrationResults.filter(r => r.status === 'NotStarted').length})
                            </Button>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50/60 to-emerald-50/40 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200/30 dark:border-green-700/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg backdrop-blur-sm">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400"/>
                                    </div>
                                    <span className="font-semibold text-green-700 dark:text-green-300">Successful</span>
                                </div>
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {migrationResults.filter(r => r.status === 'Success').length}
                                </div>
                            </div>
                            <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-red-50/60 to-rose-50/40 dark:from-red-900/20 dark:to-rose-900/10 border border-red-200/30 dark:border-red-700/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg backdrop-blur-sm">
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400"/>
                                    </div>
                                    <span className="font-semibold text-red-700 dark:text-red-300">Failed</span>
                                </div>
                                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {migrationResults.filter(r => r.status === 'Failed').length}
                                </div>
                            </div>
                            <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-50/60 to-slate-50/40 dark:from-gray-900/20 dark:to-slate-900/10 border border-gray-200/30 dark:border-gray-700/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-gray-500/10 dark:bg-gray-500/20 rounded-lg backdrop-blur-sm">
                                        <Circle className="h-5 w-5 text-gray-600 dark:text-gray-400"/>
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Skipped</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                                    {migrationResults.filter(r => r.status === 'Skipped').length}
                                </div>
                            </div>
                            <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-yellow-50/60 to-amber-50/40 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200/30 dark:border-yellow-700/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg backdrop-blur-sm">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                                    </div>
                                    <span className="font-semibold text-yellow-700 dark:text-yellow-300">Not Started</span>
                                </div>
                                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {migrationResults.filter(r => r.status === 'NotStarted').length}
                                </div>
                            </div>
                            <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200/30 dark:border-blue-700/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg backdrop-blur-sm">
                                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                                    </div>
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">Total</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {migrationResults.length}
                                </div>
                            </div>
                        </div>

                        {/* Filtered count indicator */}
                        {migrationResultFilter !== 'all' && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Showing <strong>{filteredMigrationResults.length}</strong> of <strong>{migrationResults.length}</strong> results
                                    {migrationResultFilter === 'success' && ' (Successful only)'}
                                    {migrationResultFilter === 'failed' && ' (Failed only)'}
                                    {migrationResultFilter === 'skipped' && ' (Skipped only)'}
                                    {migrationResultFilter === 'notstarted' && ' (Not Started only)'}
                                </p>
                            </div>
                        )}

                        {/* Results Table */}
                        <DataTable
                            columns={migrationResultsColumns}
                            data={filteredMigrationResults}
                            itemsPerPage={itemsPerPage}
                            showPagination={true}
                            onItemsPerPageChange={setItemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </CardContent>
                </Card>
            )}

            {currentStep === 'validate' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Final Verification</CardTitle>
                                <p className="text-gray-600">
                                    Re-run comparison to verify all assignments in their final state
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {!validationComplete && (
                                    <Button onClick={validateAssignments} disabled={loading}>
                                        {loading ? (
                                            <div className="flex items-center">
                                                <div
                                                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Verifying...
                                            </div>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2"/>
                                                Run Verification
                                            </>
                                        )}
                                    </Button>
                                )}
                                {validationComplete && (
                                    <Button onClick={() => setCurrentStep('summary')}>
                                        <FileText className="h-4 w-4 mr-2"/>
                                        View Summary
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Summary Card */}
                        {validationComplete && <MigrationSummaryCard step="validate" />}

                        {/* Info banner explaining the validation process */}
                        {!validationComplete && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0"/>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                            How Verification Works
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            This step re-runs the comparison check for the <strong>{migratedRowIds.length}</strong> rows
                                            that were migrated in this session against your current Intune environment to verify the final state.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {validationComplete && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0"/>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                                            Verification Complete
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            All {validatedItemsCount} items have been verified. Click &ldquo;View Summary&rdquo; to see the complete report.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Results Table - Same look as compare step */}
                        {validationComplete && validatedItemsCount > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Verification Results
                                        ({validatedItemsCount} items)</h3>
                                    <Badge variant="outline" className="text-xs">
                                        Re-compared against live environment
                                    </Badge>
                                </div>

                                {validatedItems.length === 0 && (
                                    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            No validation results found in table data. Check browser console for debug info.
                                        </p>
                                    </div>
                                )}

                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto overflow-y-visible">
                                        <DataTable
                                            data={validatedItems.map(result => result as unknown as Record<string, unknown>)}
                                            columns={validationColumns}
                                            className="text-sm"
                                            currentPage={validationCurrentPage}
                                            totalPages={Math.ceil(validatedItemsCount / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setValidationCurrentPage}
                                            onItemsPerPageChange={(newItemsPerPage) => {
                                                setItemsPerPage(newItemsPerPage);
                                                setValidationCurrentPage(1);
                                            }}
                                            showPagination={true}
                                            searchPlaceholder="Search verified items..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Summary Step - Final Overview */}
            {currentStep === 'summary' && (
                <>
                    {/* ── TOP: Flow overview ───────────────────────────── */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <CheckCircle2 className="h-6 w-6 text-white"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Migration Summary</CardTitle>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            End-to-end overview of what happened to every row in your CSV
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const rows = masterTrackingData.map(row => ({
                                                Policy:     row.csvRow?.PolicyName   || row.policy?.name || row.providedPolicyName || '',
                                                Group:      row.csvRow?.GroupName    || row.groupToMigrate || '',
                                                Action:     row.csvRow?.AssignmentAction    || '',
                                                Direction:  row.csvRow?.AssignmentDirection || '',
                                                Filter:     row.csvRow?.FilterName   || '',
                                                FilterType: row.csvRow?.FilterType   || '',
                                                Batch:      row.batchIndex !== null && row.batchIndex !== undefined ? (row.batchIndex + 1).toString() : '',
                                                FinalStatus: row.masterStatus        || '',
                                                Notes:      row.failureReason        || row.masterStatusMessage || '',
                                            }));
                                            const csv = [
                                                Object.keys(rows[0] || {}),
                                                ...rows.map(r => Object.values(r))
                                            ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                                            const a = document.createElement('a');
                                            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                                            a.download = `migration-summary-${new Date().toISOString().split('T')[0]}.csv`;
                                            a.click();
                                        }}
                                    >
                                        <FileText className="h-4 w-4 mr-2"/>Export CSV
                                    </Button>
                                    <Button variant="outline" onClick={resetProcess}>
                                        <RotateCcw className="h-4 w-4 mr-2"/>New Migration
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">


                            {/* ── Attention boxes (only when there are issues) ── */}
                            {(() => {
                                const { csvInvalid, compareFailed, notMigrated, migFailed, migNotVerified, valFailed, skipped, notStarted } = summaryStats;
                                const hasIssues = csvInvalid.length + compareFailed.length + notMigrated.length + migFailed.length + migNotVerified.length + valFailed.length + skipped.length + notStarted.length > 0;
                                if (!hasIssues) return null;
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {csvInvalid.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{csvInvalid.length} CSV invalid</p>
                                                    <p className="text-xs text-orange-600 dark:text-orange-400">Bad format / missing required fields</p>
                                                </div>
                                            </div>
                                        )}
                                        {compareFailed.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">{compareFailed.length} Compare failed</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">Policy or group not found / duplicate</p>
                                                </div>
                                            </div>
                                        )}
                                        {notStarted.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">{notStarted.length} Not Started</p>
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Sent to API but never processed 👻</p>
                                                </div>
                                            </div>
                                        )}
                                        {migFailed.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">{migFailed.length} Migration failed</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">API / permission error during migrate</p>
                                                </div>
                                            </div>
                                        )}
                                        {migNotVerified.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{migNotVerified.length} Migrated, not verified</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">Run verification or check portal</p>
                                                </div>
                                            </div>
                                        )}
                                        {valFailed.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">{valFailed.length} Verification failed</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">Not found after migration — check portal</p>
                                                </div>
                                            </div>
                                        )}
                                        {skipped.length > 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <Circle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0"/>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{skipped.length} Skipped</p>
                                                    <p className="text-xs text-gray-500">Not selected for migration</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ── Migration Statistics Summary ── */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600"/>
                                    Migration Statistics
                                </h3>
                                {(() => {
                                    const {
                                        totalUploaded,
                                        csvInvalidCount,
                                        compareFailedCount,
                                        notSelectedCount,
                                        readyForMigrationCount,
                                        notStartedCount,
                                        migrationSuccessCount,
                                        migrationSkippedCount,
                                        migrationFailedCount,
                                        verifiedCount,
                                        verifyFailedCount
                                    } = summaryStats;

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left column - Upload & Filtering */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <Upload className="h-4 w-4 text-blue-500"/>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Uploaded</span>
                                                    </div>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalUploaded}</span>
                                                </div>

                                                {csvInvalidCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <XCircle className="h-4 w-4 text-red-500"/>
                                                            <span className="text-sm text-red-700 dark:text-red-300">CSV Invalid</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-red-700 dark:text-red-300">{csvInvalidCount}</span>
                                                    </div>
                                                )}

                                                {compareFailedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-orange-500"/>
                                                            <span className="text-sm text-orange-700 dark:text-orange-300">Compare Failed</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{compareFailedCount}</span>
                                                    </div>
                                                )}

                                                {notSelectedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <Circle className="h-4 w-4 text-gray-400"/>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Not Selected for Migration</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{notSelectedCount}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-400 dark:border-blue-600 ml-4">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-blue-600"/>
                                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Ready for Migration</span>
                                                    </div>
                                                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">{readyForMigrationCount}</span>
                                                </div>
                                            </div>

                                            {/* Right column - Migration Results */}
                                            <div className="space-y-3">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <ArrowRight className="h-4 w-4"/>
                                                    From {readyForMigrationCount} ready:
                                                </div>

                                                {/* Show total processed to verify math */}
                                                {(migrationSuccessCount + migrationSkippedCount + migrationFailedCount + notStartedCount) > 0 && (
                                                    <div className="flex items-center justify-between p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-200/50 dark:border-blue-800/50 ml-4">
                                                        <span className="text-xs text-blue-600 dark:text-blue-400">Total Accounted:</span>
                                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                                            {migrationSuccessCount + migrationSkippedCount + migrationFailedCount + notStartedCount} / {readyForMigrationCount}
                                                            {(migrationSuccessCount + migrationSkippedCount + migrationFailedCount + notStartedCount) !== readyForMigrationCount && (
                                                                <span className="ml-2 text-orange-600">⚠️</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {migrationSuccessCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600"/>
                                                            <span className="text-sm text-green-700 dark:text-green-300">Successfully Migrated</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-green-700 dark:text-green-300">{migrationSuccessCount}</span>
                                                    </div>
                                                )}

                                                {migrationSkippedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <Circle className="h-4 w-4 text-gray-400"/>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">Skipped</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{migrationSkippedCount}</span>
                                                    </div>
                                                )}

                                                {notStartedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-yellow-600"/>
                                                            <span className="text-sm text-yellow-700 dark:text-yellow-300">Not Started 👻</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{notStartedCount}</span>
                                                    </div>
                                                )}

                                                {migrationFailedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <XCircle className="h-4 w-4 text-red-500"/>
                                                            <span className="text-sm text-red-700 dark:text-red-300">Migration Failed</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-red-700 dark:text-red-300">{migrationFailedCount}</span>
                                                    </div>
                                                )}

                                                {verifiedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-2 border-emerald-400 dark:border-emerald-600 ml-4 mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-600"/>
                                                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Verified in Intune</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{verifiedCount}</span>
                                                    </div>
                                                )}

                                                {verifyFailedCount > 0 && (
                                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ml-4">
                                                        <div className="flex items-center gap-2">
                                                            <XCircle className="h-4 w-4 text-red-500"/>
                                                            <span className="text-sm text-red-700 dark:text-red-300">Verification Failed</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-red-700 dark:text-red-300">{verifyFailedCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* ── Success banner ── */}
                            {summaryStats.verifiedCount > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0"/>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        <strong>{summaryStats.verifiedCount}</strong> assignment(s) successfully migrated and verified in Intune.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── BOTTOM: Per-row changelog table ───────────────── */}
                    {masterTrackingData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-blue-500"/>
                                    Row Changelog
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                                        — every CSV row and its final state
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Status Filter Buttons */}
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Button
                                        onClick={() => setSummaryStatusFilter('all')}
                                        variant={summaryStatusFilter === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Circle className="h-3 w-3"/>
                                        All ({summaryTableData.length})
                                    </Button>
                                    {summaryStats.csvInvalidCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('csv_invalid')}
                                            variant={summaryStatusFilter === 'csv_invalid' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <XCircle className="h-3 w-3 text-red-500"/>
                                            CSV Invalid ({summaryStats.csvInvalidCount})
                                        </Button>
                                    )}
                                    {summaryStats.compareFailedCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('compare_failed')}
                                            variant={summaryStatusFilter === 'compare_failed' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <AlertTriangle className="h-3 w-3 text-orange-500"/>
                                            Compare Failed ({summaryStats.compareFailedCount})
                                        </Button>
                                    )}
                                    {summaryStats.notSelectedCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('compare_ready')}
                                            variant={summaryStatusFilter === 'compare_ready' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Circle className="h-3 w-3 text-gray-400"/>
                                            Not Selected ({summaryStats.notSelectedCount})
                                        </Button>
                                    )}
                                    {summaryStats.migrationSuccessCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('migration_success')}
                                            variant={summaryStatusFilter === 'migration_success' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="h-3 w-3 text-blue-500"/>
                                            Migrated ({summaryStats.migrationSuccessCount})
                                        </Button>
                                    )}
                                    {summaryStats.migrationFailedCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('migration_failed')}
                                            variant={summaryStatusFilter === 'migration_failed' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <XCircle className="h-3 w-3 text-red-500"/>
                                            Migration Failed ({summaryStats.migrationFailedCount})
                                        </Button>
                                    )}
                                    {summaryStats.verifiedCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('validation_success')}
                                            variant={summaryStatusFilter === 'validation_success' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500"/>
                                            Verified ({summaryStats.verifiedCount})
                                        </Button>
                                    )}
                                    {summaryStats.verifyFailedCount > 0 && (
                                        <Button
                                            onClick={() => setSummaryStatusFilter('validation_failed')}
                                            variant={summaryStatusFilter === 'validation_failed' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <XCircle className="h-3 w-3 text-red-500"/>
                                            Verify Failed ({summaryStats.verifyFailedCount})
                                        </Button>
                                    )}
                                </div>

                                {/* Filter indicator */}
                                {summaryStatusFilter !== 'all' && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Showing <strong>{filteredSummaryTableData.length}</strong> of <strong>{summaryTableData.length}</strong> rows
                                            {summaryStatusFilter === 'csv_invalid' && ' (CSV Invalid only)'}
                                            {summaryStatusFilter === 'compare_failed' && ' (Compare Failed only)'}
                                            {summaryStatusFilter === 'compare_ready' && ' (Not Selected only)'}
                                            {summaryStatusFilter === 'migration_success' && ' (Migrated only)'}
                                            {summaryStatusFilter === 'migration_failed' && ' (Migration Failed only)'}
                                            {summaryStatusFilter === 'validation_success' && ' (Verified only)'}
                                            {summaryStatusFilter === 'validation_failed' && ' (Verify Failed only)'}
                                        </p>
                                    </div>
                                )}

                                <DataTable
                                    data={filteredSummaryTableData}
                                    columns={[
                                        {
                                            key: 'policy',
                                            label: 'Policy',
                                            render: (v) => (
                                                <span className="text-sm font-medium truncate block max-w-xs" title={String(v)}>{String(v)}</span>
                                            )
                                        },
                                        {
                                            key: 'action',
                                            label: 'Action',
                                            render: (v) => {
                                                const val = String(v);
                                                const map: Record<string, string> = {
                                                    Add: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
                                                    Remove: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                                                    Replace: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                                                    NoAssignment: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                                                };
                                                return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[val] ?? 'bg-gray-100 text-gray-700'}`}>{val}</span>;
                                            }
                                        },
                                        {
                                            key: 'group',
                                            label: 'Group',
                                            render: (v) => <span className="text-sm truncate block max-w-xs" title={String(v)}>{String(v)}</span>
                                        },
                                        {
                                            key: 'direction',
                                            label: 'Direction',
                                            render: (v) => {
                                                const val = String(v);
                                                return <span className={`px-2 py-0.5 rounded text-xs font-medium ${val === 'Include' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' : val === 'Exclude' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-gray-100 text-gray-600'}`}>{val}</span>;
                                            }
                                        },
                                        {
                                            key: 'filter',
                                            label: 'Filter',
                                            render: (v) => <span className="text-xs text-gray-500 dark:text-gray-400">{String(v)}</span>
                                        },
                                        {
                                            key: 'status',
                                            label: 'Final Status',
                                            render: (v) => {
                                                const val = String(v);
                                                const map: Record<string, { label: string; cls: string }> = {
                                                    csv_invalid:         { label: 'CSV Invalid',        cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
                                                    csv_uploaded:        { label: 'Status Unknown',     cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
                                                    compare_ready:       { label: 'Ready (Not Migrated)', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
                                                    compare_failed:      { label: 'Compare Failed',     cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
                                                    already_migrated:    { label: 'Already Migrated',   cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
                                                    migration_ready:     { label: 'Ready',              cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
                                                    migration_success:   { label: 'Migrated',         cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
                                                    migration_failed:    { label: 'Migration Failed',   cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
                                                    validation_success:  { label: 'Verified',         cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
                                                    validation_failed:   { label: 'Verify Failed',      cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
                                                };
                                                const entry = map[val] ?? { label: val, cls: 'bg-gray-100 text-gray-600' };
                                                return <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${entry.cls}`}>{entry.label}</span>;
                                            }
                                        },
                                        {
                                            key: 'batch',
                                            label: 'Batch',
                                            render: (v) => {
                                                if (v === null || v === undefined) return <span className="text-xs text-gray-400">—</span>;
                                                return (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                                        #{String(v)}
                                                    </span>
                                                );
                                            }
                                        },
                                        {
                                            key: 'notes',
                                            label: 'Notes',
                                            render: (v) => {
                                                const val = String(v);
                                                if (val === '—') return <span className="text-xs text-gray-400">—</span>;
                                                return <span className="text-xs text-gray-600 dark:text-gray-400 truncate block max-w-sm" title={val}>{val}</span>;
                                            }
                                        },
                                    ]}
                                    showPagination={true}
                                    itemsPerPage={25}
                                    searchPlaceholder="Search rows..."
                                />
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default function AssignmentRolloutPage() {
    return <AssignmentRolloutContent />;
}
