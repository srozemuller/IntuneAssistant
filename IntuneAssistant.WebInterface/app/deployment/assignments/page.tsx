'use client';
import ReactDOM from 'react-dom';
import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    Upload, FileText, CheckCircle2, XCircle, AlertTriangle,
    Play, RotateCcw, Eye, ArrowRight, ArrowUp, Shield, Users, Info, X, RefreshCw, Circle, Blocks, CheckCircle, FileSpreadsheet
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
    masterStatus?: 'csv_uploaded' | 'compare_ready' | 'compare_failed' | 'migration_ready' | 'migration_success' | 'migration_failed' | 'validation_success' | 'validation_failed';
    masterStatusMessage?: string;
    failureReason?: string; // Why this item couldn't proceed
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
    status: 'Success' | 'Failed' | 'Skipped';
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
    const [loading, setLoading] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [roleScopeTags, setRoleScopeTags] = useState<RoleScopeTag[]>([]);
    const [retryingRows, setRetryingRows] = useState<Set<string>>(new Set());

    const [error, setError] = useState<string | null>(null);
    const [validationComplete, setValidationComplete] = useState(false);
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
    const [migrationResultFilter, setMigrationResultFilter] = useState<'all' | 'success' | 'failed' | 'skipped'>('all');
    const [compareStatusFilter, setCompareStatusFilter] = useState<'all' | 'ready' | 'migrated' | 'warnings'>('all');

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

    // Filter migration results based on status
    const filteredMigrationResults = useMemo(() => {
        if (migrationResultFilter === 'all') {
            return migrationResults;
        } else if (migrationResultFilter === 'success') {
            return migrationResults.filter(r => r.status === 'Success');
        } else if (migrationResultFilter === 'failed') {
            return migrationResults.filter(r => r.status === 'Failed');
        } else {
            return migrationResults.filter(r => r.status === 'Skipped');
        }
    }, [migrationResults, migrationResultFilter]);

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

        // Show purple arrow up for ready-for-migration (not completed yet)
        return (
            <div className="flex items-center justify-center">
                <ArrowUp className="h-5 w-5 text-purple-500"/>
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
            minWidth: 300,
            width: 300,
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
            width: 200,
            minWidth: 200,
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
            minWidth: 150,
            width: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.groupToMigrate || result.csvRow?.GroupName || '-';
            }
        },
        {
            key: 'assignmentDirection',
            label: 'Direction',
            width: 100,
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
            width: 120,
            minWidth: 120,
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
            minWidth: 120,
            width: 120,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.filterName || result.csvRow?.FilterName || '-';
            }
        },
        {
            key: 'filterType',
            label: 'Filter Type',
            minWidth: 120,
            width: 120,
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
            width: 100,
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
                const check = item.migrationCheckResult;
                let migrationCheckSortValue = 2;
                let masterStatus: ComparisonResult['masterStatus'] = 'csv_uploaded';
                let masterStatusMessage = '';
                let failureReason = '';

                if (check) {
                    const allChecksPass = check.policyExists && check.policyIsUnique &&
                        check.groupExists && check.correctAssignmentTypeProvided &&
                        check.correctAssignmentActionProvided && check.assignmentIsCompatible;

                    if (allChecksPass) {
                        migrationCheckSortValue = 1;
                        masterStatus = 'compare_ready';
                        masterStatusMessage = 'Ready for migration';
                    } else {
                        migrationCheckSortValue = 0;
                        masterStatus = 'compare_failed';

                        // Build detailed failure reason
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
                        masterStatusMessage = `Cannot migrate: ${failureReason}`;
                    }
                }

                return {
                    ...item,
                    csvRow: {
                        ...validCsvData[index],
                    },
                    isReadyForMigration: item.isReadyForMigration,
                    isMigrated: item.isMigrated || false,
                    isBackedUp: false,
                    validationStatus: 'pending' as const,
                    migrationCheckSortValue,
                    masterStatus,
                    masterStatusMessage,
                    failureReason
                };
            });

            // Also track invalid CSV rows that never made it to comparison
            const invalidCsvRows = csvData.filter(row => !row.isValid).map((row, index): ComparisonResult => ({
                id: `invalid-${index}-${Date.now()}`,
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
                masterStatus: 'compare_failed',
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
        const CHUNK_SIZE = 20;

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
                const chunk = chunks[chunkIndex];

                console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} items`);

                // Update progress
                setMigrationChunkProgress(prev => ({
                    ...prev,
                    currentChunk: chunkIndex + 1
                }));

                const apiResponse = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                    method: 'POST',
                    body: JSON.stringify(chunk)
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

                // Update table rows in real-time after each chunk completes
                setMigrationResults(allResults);

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
                                failureReason: isSuccess ? undefined : (migrationResult.errorMessage || 'Migration failed')
                            };
                        }
                        return result;
                    })
                );
            }

            // All chunks processed
            console.log(`Migration complete. Processed ${allResults.length} items in ${chunks.length} chunks`);

            setCurrentStep('results');
            setSelectedRows([]);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Migration failed');
        } finally {
            setLoading(false);
            setMigrationChunkProgress(prev => ({ ...prev, isProcessing: false }));
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

        // Re-run compare for ALL valid CSV rows to check final state
        const validCsvRows = csvData.filter(row => row.isValid);

        if (validCsvRows.length === 0) {
            setError('No valid rows to validate');
            return;
        }

        setLoading(true);
        setValidationComplete(false);

        try {
            console.log(`Validating ${validCsvRows.length} items by re-running comparison`);

            // Use the same payload structure as initial compare
            const validationPayload = validCsvRows.map(row => ({
                PolicyName: row.PolicyName,
                GroupName: row.AssignmentAction === 'NoAssignment' ? null : row.GroupName,
                AssignmentDirection: row.AssignmentDirection,
                AssignmentAction: row.AssignmentAction,
                FilterName: row.FilterName,
                FilterType: row.FilterType
            }));

            console.log('Validation payload (using compare endpoint):', validationPayload);

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

            // Map validation results back to original comparison results by matching policy and group names
            setComparisonResults(prev =>
                prev.map(result => {
                    // Find matching validation result by comparing policy name and group name
                    // Use providedPolicyName or policy.name from validation result to match
                    const matchingValidation = validationResults.find(vr => {
                        const validationPolicyName = vr.providedPolicyName || vr.policy?.name;
                        const resultPolicyName = result.csvRow?.PolicyName || result.policy?.name;
                        const validationGroupName = vr.groupToMigrate;
                        const resultGroupName = result.csvRow?.GroupName || result.groupToMigrate;

                        return validationPolicyName === resultPolicyName &&
                               validationGroupName === resultGroupName;
                    });

                    if (matchingValidation) {
                        // Interpret the comparison result as validation:
                        // - If isMigrated is true, the assignment already exists = validation success
                        // - If isReadyForMigration is true and was previously migrated, verify it's still there
                        const wasSuccessfullyMigrated = result.masterStatus === 'migration_success';

                        let validationStatus: 'valid' | 'invalid' | 'warning';
                        let masterStatus: ComparisonResult['masterStatus'];
                        let masterStatusMessage: string;
                        let failureReason: string | undefined;

                        if (matchingValidation.isMigrated) {
                            // Assignment exists and matches expectations
                            validationStatus = 'valid';
                            masterStatus = 'validation_success';
                            masterStatusMessage = 'Assignment verified in environment';
                            failureReason = undefined;
                        } else if (wasSuccessfullyMigrated && !matchingValidation.isMigrated) {
                            // Was migrated but now doesn't show as existing - validation failed
                            validationStatus = 'invalid';
                            masterStatus = 'validation_failed';
                            masterStatusMessage = 'Assignment not found after migration';
                            failureReason = 'Migration was reported successful but assignment not found in re-check';
                        } else if (matchingValidation.isReadyForMigration && !wasSuccessfullyMigrated) {
                            // Item is ready but was never migrated - mark as warning
                            validationStatus = 'warning';
                            masterStatus = result.masterStatus; // Keep original status
                            masterStatusMessage = 'Ready for migration but was not migrated';
                            failureReason = undefined;
                        } else {
                            // Check failed - policy or group issues
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
                            ...result,
                            validationStatus,
                            validationMessage: masterStatusMessage,
                            isCurrentSessionValidation: true,
                            masterStatus,
                            masterStatusMessage,
                            failureReason,
                            // Update with latest comparison data
                            policy: matchingValidation.policy || result.policy,
                            isMigrated: matchingValidation.isMigrated,
                            isReadyForMigration: matchingValidation.isReadyForMigration,
                            migrationCheckResult: matchingValidation.migrationCheckResult
                        };
                    }
                    return result;
                })
            );

            // Update master tracking
            setMasterTrackingData(prev =>
                prev.map(result => {
                    // Find matching validation result by policy and group name
                    const matchingValidation = validationResults.find(vr => {
                        const validationPolicyName = vr.providedPolicyName || vr.policy?.name;
                        const resultPolicyName = result.csvRow?.PolicyName || result.policy?.name;
                        const validationGroupName = vr.groupToMigrate;
                        const resultGroupName = result.csvRow?.GroupName || result.groupToMigrate;

                        return validationPolicyName === resultPolicyName &&
                               validationGroupName === resultGroupName;
                    });

                    if (matchingValidation) {
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
                            ...result,
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
                    }
                    return result;
                })
            );

            setValidationComplete(true);
            console.log(`Validation completed for ${validationResults.length} items`);
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
    // Re-run compare for all valid CSV rows to verify final state
    const validCsvRows = csvData.filter(row => row.isValid);

    if (validCsvRows.length === 0) {
        setError('No valid rows to validate');
        return;
    }

    console.log(`Validation will re-run comparison for ${validCsvRows.length} valid CSV rows`);
    await validateMigratedAssignments();
};

    const resetProcess = () => {
        setCurrentStep('upload');
        setCsvData([]);
        setComparisonResults([]);
        setFilteredComparisonResults([]);
        setSelectedRows([]);
        setValidationResults([]);
        setValidationComplete(false);
        setRoleScopeTagFilter([]);
        setCompareStatusFilter('all');
        setMasterTrackingData([]);
        setMigrationResults([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
            filtered = filtered.filter(r => !r.isReadyForMigration && !r.isMigrated);
        }
        // 'all' doesn't need additional filtering

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
                            {key: 'validate', label: 'Verify', icon: RefreshCw},
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
                                <Button
                                    onClick={migrateSelectedAssignments}
                                    disabled={
                                        selectedRows.filter(id => {
                                            const result = comparisonResults.find(r => r.id === id);
                                            return result?.isReadyForMigration && !result?.isMigrated;
                                        }).length === 0 || loading
                                    }
                                >
                                    {loading ? 'Migrating...' : `Migrate ${
                                        selectedRows.filter(id => {
                                            const result = comparisonResults.find(r => r.id === id);
                                            return result?.isReadyForMigration && !result?.isMigrated;
                                        }).length
                                    } Selected`}
                                </Button>

                            </div>
                        </div>
                    </CardHeader>

                    {/* Chunk Progress Display */}
                    {migrationChunkProgress.isProcessing && (
                        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-blue-900 dark:text-blue-100">
                                        Processing Migration in Chunks
                                    </span>
                                    <span className="text-blue-700 dark:text-blue-300">
                                        Chunk {migrationChunkProgress.currentChunk} of {migrationChunkProgress.totalChunks}
                                    </span>
                                </div>
                                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(migrationChunkProgress.processedItems / migrationChunkProgress.totalItems) * 100}%`
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                                    <span>
                                        {migrationChunkProgress.processedItems} of {migrationChunkProgress.totalItems} items processed
                                    </span>
                                    <span>
                                        {Math.round((migrationChunkProgress.processedItems / migrationChunkProgress.totalItems) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <CardContent>

                        {/* Filter by Compare Status */}
                        <div className="mb-6 flex gap-2">
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
                                <ArrowUp className="h-4 w-4 text-purple-500"/>
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
                                onClick={() => setCompareStatusFilter('warnings')}
                                variant={compareStatusFilter === 'warnings' ? 'default' : 'outline'}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <AlertTriangle className="h-4 w-4 text-amber-500"/>
                                Warnings ({comparisonResults.filter(r => !r.isReadyForMigration && !r.isMigrated).length})
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
                                    data={filteredComparisonResults.map(result => result as unknown as Record<string, unknown>)}
                                    columns={comparisonColumns}
                                    className="text-sm"
                                    // Instead of using key, pass selectedRows as a prop
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
                                Proceed to Validation
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                                            This step re-runs the comparison check for all {csvData.filter(r => r.isValid).length} valid CSV rows
                                            against your current Intune environment to verify the final state.
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
                                            All {comparisonResults.filter(r => r.isCurrentSessionValidation).length} items have been verified. Click &ldquo;View Summary&rdquo; to see the complete report.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Results Table - Same look as compare step */}
                        {comparisonResults.filter(r => r.isCurrentSessionValidation).length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Verification Results
                                        ({comparisonResults.filter(r => r.isCurrentSessionValidation).length} items)</h3>
                                    <Badge variant="outline" className="text-xs">
                                        Re-compared against live environment
                                    </Badge>
                                </div>
                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto overflow-y-visible">
                                        <DataTable
                                            data={comparisonResults.filter(r => r.isCurrentSessionValidation).map(result => result as unknown as Record<string, unknown>)}
                                            columns={comparisonColumns}
                                            className="text-sm"
                                            currentPage={validationCurrentPage}
                                            totalPages={Math.ceil(comparisonResults.filter(r => r.isCurrentSessionValidation).length / itemsPerPage)}
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
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <CheckCircle2 className="h-6 w-6 text-white"/>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Migration Summary</CardTitle>
                                        <p className="text-gray-600">
                                            Complete overview of your assignment migration process
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={resetProcess} variant="outline">
                                    <RotateCcw className="h-4 w-4 mr-2"/>
                                    Start New Migration
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* High-Level Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Upload className="h-5 w-5 text-blue-600"/>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded</span>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {csvData.length}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total CSV rows</p>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600"/>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid</span>
                                    </div>
                                    <div className="text-3xl font-bold text-green-600">
                                        {csvData.filter(r => r.isValid).length}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Passed CSV validation</p>
                                </div>

                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Play className="h-5 w-5 text-purple-600"/>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Migrated</span>
                                    </div>
                                    <div className="text-3xl font-bold text-purple-600">
                                        {migrationResults.filter(r => r.status === 'Success').length}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Successfully migrated</p>
                                </div>

                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-600"/>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</span>
                                    </div>
                                    <div className="text-3xl font-bold text-emerald-600">
                                        {masterTrackingData.filter(r => r.masterStatus === 'validation_success').length}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Confirmed in environment</p>
                                </div>
                            </div>

                            {/* Process Flow Summary */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-blue-500"/>
                                    Process Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">1. Upload</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <div>Total: <strong>{csvData.length}</strong></div>
                                            <div className="text-green-600">Valid: <strong>{csvData.filter(r => r.isValid).length}</strong></div>
                                            <div className="text-red-600">Invalid: <strong>{csvData.filter(r => !r.isValid).length}</strong></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">2. Compare</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <div className="text-green-600">Ready: <strong>{comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length}</strong></div>
                                            <div className="text-red-600">Failed: <strong>{masterTrackingData.filter(r => r.masterStatus === 'compare_failed').length}</strong></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">3. Migrate</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <div>Selected: <strong>{migrationResults.length}</strong></div>
                                            <div className="text-green-600">Success: <strong>{migrationResults.filter(r => r.status === 'Success').length}</strong></div>
                                            <div className="text-red-600">Failed: <strong>{migrationResults.filter(r => r.status === 'Failed').length}</strong></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">4. Results</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <div>Processed: <strong>{migrationResults.length}</strong></div>
                                            <div className="text-blue-600">Rate: <strong>{migrationResults.length > 0 ? Math.round((migrationResults.filter(r => r.status === 'Success').length / migrationResults.length) * 100) : 0}%</strong></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">5. Verify</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <div>Checked: <strong>{comparisonResults.filter(r => r.isCurrentSessionValidation).length}</strong></div>
                                            <div className="text-emerald-600">Verified: <strong>{masterTrackingData.filter(r => r.masterStatus === 'validation_success').length}</strong></div>
                                            <div className="text-red-600">Issues: <strong>{masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Requiring Manual Action */}
                            {(masterTrackingData.filter(r =>
                                r.masterStatus === 'compare_failed' ||
                                r.masterStatus === 'migration_failed' ||
                                r.masterStatus === 'validation_failed'
                            ).length > 0 ||
                            comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'validation_success').length > 0 ||
                            masterTrackingData.filter(r => r.masterStatus === 'migration_success').length > 0) && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"/>
                                        <div>
                                            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                                                Items Status Overview
                                            </h3>
                                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                Review the status of all items from your migration process.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {masterTrackingData.filter(r => r.masterStatus === 'compare_failed').length > 0 && (
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                                                <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-500"/>
                                                    Compare Failed ({masterTrackingData.filter(r => r.masterStatus === 'compare_failed').length})
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    ❌ Policies or groups not found, duplicates detected, or validation errors in CSV.
                                                    <br/><strong>Action:</strong> Fix manually in Intune portal.
                                                </p>
                                            </div>
                                        )}

                                        {comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'validation_success').length > 0 && (
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-700">
                                                <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <Circle className="h-4 w-4 text-yellow-500"/>
                                                    Ready but Not Migrated ({comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'validation_success').length})
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    ⚠️ Items were ready but not selected for migration.
                                                    <br/><strong>Action:</strong> Review and migrate manually if needed.
                                                </p>
                                            </div>
                                        )}

                                        {masterTrackingData.filter(r => r.masterStatus === 'migration_failed').length > 0 && (
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                                                <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-500"/>
                                                    Migration Failed ({masterTrackingData.filter(r => r.masterStatus === 'migration_failed').length})
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    ❌ API errors, permission issues, or timeouts during migration.
                                                    <br/><strong>Action:</strong> Check errors and retry or fix manually.
                                                </p>
                                            </div>
                                        )}

                                        {masterTrackingData.filter(r => r.masterStatus === 'migration_success').length > 0 && (
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                                                <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-blue-500"/>
                                                    Migrated but Not Verified ({masterTrackingData.filter(r => r.masterStatus === 'migration_success').length})
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    ⏳ Migration reported successful but verification not completed.
                                                    <br/><strong>Action:</strong> Run verification step or check manually in portal.
                                                </p>
                                            </div>
                                        )}

                                        {masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length > 0 && (
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                                                <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-500"/>
                                                    Verification Failed ({masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length})
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    ❌ Assignments not found after migration or environment changed.
                                                    <br/><strong>Action:</strong> Check in Intune portal and fix manually.
                                                </p>
                                            </div>
                                        )}

                                        {migrationResults.filter(r => r.status === 'Skipped').length > 0 && (
                                            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <Circle className="h-4 w-4 text-gray-500"/>
                                                    Skipped ({migrationResults.filter(r => r.status === 'Skipped').length})
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    ⊘ Items that were not selected for migration.
                                                    <br/><strong>Action:</strong> No action needed unless you want to migrate them.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {masterTrackingData.filter(r => r.masterStatus === 'validation_success').length > 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0"/>
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                                                ✅ Successfully Completed
                                            </h3>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                <strong>{masterTrackingData.filter(r => r.masterStatus === 'validation_success').length}</strong> assignment(s)
                                                were successfully migrated AND verified in your Intune environment. These are ready to use!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Master Status Overview - Shows complete journey of ALL CSV rows */}
            {masterTrackingData.length > 0 && currentStep === 'summary' && (
                <Card className="border-2 border-blue-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <FileSpreadsheet className="h-6 w-6 text-white"/>
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Detailed Status Report</CardTitle>
                                    <p className="text-gray-600 text-sm">
                                        Complete status of all {masterTrackingData.length} rows from your CSV file
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    const summary = masterTrackingData.map(row => ({
                                        PolicyName: row.csvRow?.PolicyName || row.policy?.name || row.providedPolicyName || 'Unknown',
                                        GroupName: row.csvRow?.GroupName || row.groupToMigrate || 'N/A',
                                        Action: row.csvRow?.AssignmentAction || 'N/A',
                                        Direction: row.csvRow?.AssignmentDirection || 'N/A',
                                        Status: row.masterStatus || 'Unknown',
                                        StatusMessage: row.masterStatusMessage || '',
                                        FailureReason: row.failureReason || ''
                                    }));

                                    const csvContent = [
                                        ['Policy Name', 'Group Name', 'Action', 'Direction', 'Status', 'Status Message', 'Failure Reason'],
                                        ...summary.map(row => [
                                            row.PolicyName,
                                            row.GroupName,
                                            row.Action,
                                            row.Direction,
                                            row.Status,
                                            row.StatusMessage,
                                            row.FailureReason
                                        ])
                                    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `assignment-migration-summary-${new Date().toISOString().split('T')[0]}.csv`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                <FileText className="h-4 w-4 mr-2"/>
                                Export Complete Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Overall Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Upload className="h-5 w-5 text-blue-600"/>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-600">
                                    {csvData.length}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total CSV rows</p>
                            </div>

                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600"/>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Valid</span>
                                </div>
                                <div className="text-3xl font-bold text-green-600">
                                    {csvData.filter(r => r.isValid).length}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Passed CSV validation</p>
                            </div>

                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Play className="h-5 w-5 text-purple-600"/>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Migrated</span>
                                </div>
                                <div className="text-3xl font-bold text-purple-600">
                                    {migrationResults.filter(r => r.status === 'Success').length}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Successfully migrated</p>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600"/>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified</span>
                                </div>
                                <div className="text-3xl font-bold text-emerald-600">
                                    {masterTrackingData.filter(r => r.masterStatus === 'validation_success').length}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Confirmed in environment</p>
                            </div>
                        </div>

                        {/* Process Flow Summary */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500"/>
                                Process Overview
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">1. Upload</div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <div>Total: <strong>{csvData.length}</strong></div>
                                        <div className="text-green-600">Valid: <strong>{csvData.filter(r => r.isValid).length}</strong></div>
                                        <div className="text-red-600">Invalid: <strong>{csvData.filter(r => !r.isValid).length}</strong></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">2. Compare</div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <div className="text-green-600">Ready: <strong>{comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length}</strong></div>
                                        <div className="text-red-600">Failed: <strong>{masterTrackingData.filter(r => r.masterStatus === 'compare_failed').length}</strong></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">3. Migrate</div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <div>Selected: <strong>{migrationResults.length}</strong></div>
                                        <div className="text-green-600">Success: <strong>{migrationResults.filter(r => r.status === 'Success').length}</strong></div>
                                        <div className="text-red-600">Failed: <strong>{migrationResults.filter(r => r.status === 'Failed').length}</strong></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">4. Results</div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <div>Processed: <strong>{migrationResults.length}</strong></div>
                                        <div className="text-blue-600">Rate: <strong>{migrationResults.length > 0 ? Math.round((migrationResults.filter(r => r.status === 'Success').length / migrationResults.length) * 100) : 0}%</strong></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">5. Verify</div>
                                    <div className="text-gray-600 dark:text-gray-400">
                                        <div>Checked: <strong>{comparisonResults.filter(r => r.isCurrentSessionValidation).length}</strong></div>
                                        <div className="text-emerald-600">Verified: <strong>{masterTrackingData.filter(r => r.masterStatus === 'validation_success').length}</strong></div>
                                        <div className="text-red-600">Issues: <strong>{masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Requiring Manual Action */}
                        {(masterTrackingData.filter(r =>
                            r.masterStatus === 'compare_failed' ||
                            r.masterStatus === 'migration_failed' ||
                            r.masterStatus === 'validation_failed'
                        ).length > 0 ||
                        comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'validation_success').length > 0 ||
                        masterTrackingData.filter(r => r.masterStatus === 'migration_success').length > 0) && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"/>
                                    <div>
                                        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                                            Items Status Overview
                                        </h3>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                            Review the status of all items from your migration process.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {masterTrackingData.filter(r => r.masterStatus === 'compare_failed').length > 0 && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                                            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500"/>
                                                Compare Failed ({masterTrackingData.filter(r => r.masterStatus === 'compare_failed').length})
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ❌ Policies or groups not found, duplicates detected, or validation errors in CSV.
                                                <br/><strong>Action:</strong> Fix manually in Intune portal.
                                            </p>
                                        </div>
                                    )}

                                    {comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'validation_success').length > 0 && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-700">
                                            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Circle className="h-4 w-4 text-yellow-500"/>
                                                Ready but Not Migrated ({comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated && r.masterStatus !== 'validation_success').length})
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ⚠️ Items were ready but not selected for migration.
                                                <br/><strong>Action:</strong> Review and migrate manually if needed.
                                            </p>
                                        </div>
                                    )}

                                    {masterTrackingData.filter(r => r.masterStatus === 'migration_failed').length > 0 && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                                            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500"/>
                                                Migration Failed ({masterTrackingData.filter(r => r.masterStatus === 'migration_failed').length})
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ❌ API errors, permission issues, or timeouts during migration.
                                                <br/><strong>Action:</strong> Check errors and retry or fix manually.
                                            </p>
                                        </div>
                                    )}

                                    {masterTrackingData.filter(r => r.masterStatus === 'migration_success').length > 0 && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                                            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-blue-500"/>
                                                Migrated but Not Verified ({masterTrackingData.filter(r => r.masterStatus === 'migration_success').length})
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ⏳ Migration reported successful but verification not completed.
                                                <br/><strong>Action:</strong> Run verification step or check manually in portal.
                                            </p>
                                        </div>
                                    )}

                                    {masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length > 0 && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-700">
                                            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500"/>
                                                Verification Failed ({masterTrackingData.filter(r => r.masterStatus === 'validation_failed').length})
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ❌ Assignments not found after migration or environment changed.
                                                <br/><strong>Action:</strong> Check in Intune portal and fix manually.
                                            </p>
                                        </div>
                                    )}

                                    {migrationResults.filter(r => r.status === 'Skipped').length > 0 && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Circle className="h-4 w-4 text-gray-500"/>
                                                Skipped ({migrationResults.filter(r => r.status === 'Skipped').length})
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ⊘ Items that were not selected for migration.
                                                <br/><strong>Action:</strong> No action needed unless you want to migrate them.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                            {masterTrackingData.filter(r => r.masterStatus === 'validation_success').length > 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0"/>
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                                                ✅ Successfully Completed
                                            </h3>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                <strong>{masterTrackingData.filter(r => r.masterStatus === 'validation_success').length}</strong> assignment(s)
                                                were successfully migrated AND verified in your Intune environment. These are ready to use!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
            )}
        </div>
    );
}

export default function AssignmentRolloutPage() {
    return <AssignmentRolloutContent />;
}
