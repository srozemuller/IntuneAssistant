
'use client';
import ReactDOM from 'react-dom';
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload, FileText, CheckCircle2, XCircle, AlertTriangle,
    Play, RotateCcw, Eye, ArrowRight, Shield, Users, Info, X, RefreshCw, Circle, Blocks
} from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import {ASSIGNMENTS_COMPARE_ENDPOINT, ASSIGNMENTS_ENDPOINT,EXPORT_ENDPOINT,GROUPS_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { DataTable } from '@/components/DataTable';
import {useApiRequest} from "@/hooks/useApiRequest";
import { UserConsentRequiredError } from '@/lib/errors';
import { PlanProtection } from '@/components/PlanProtection';
import { useConsent } from "@/contexts/ConsentContext";

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
    AssignmentAction: 'Add' | 'Remove' | 'NoAssignment';
    FilterName: string | null;
    FilterType: string | null;
    isValidAction?: boolean;
    originalActionValue?: string;
    validationErrors?: CSVValidationError[]; // Add validation errors
    isValid?: boolean; // Overall row validity
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
        platforms: string;
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
        platforms: string;
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
    };
    csvRow?: CSVRow;
    isBackedUp?: boolean;
    validationStatus?: 'pending' | 'valid' | 'invalid' | 'warning';
    validationMessage?: string;
    isCurrentSessionValidation?: boolean;
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
    const { instance, accounts } = useMsal();
    const { request, cancel } = useApiRequest();
    // Consent dialog state when not enough permissions
    const [showConsentDialog, setShowConsentDialog] = useState(false);
    const [consentUrl, setConsentUrl] = useState('');


    const fileInputRef = useRef<HTMLInputElement>(null);

    // State management
    const [currentStep, setCurrentStep] = useState<'upload' | 'compare' | 'migrate' | 'validate'>('upload');
    const [csvData, setCsvData] = useState<CSVRow[]>([]);
    const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [migrationProgress, setMigrationProgress] = useState(0);
    const [validationComplete, setValidationComplete] = useState(false);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [uploadCurrentPage, setUploadCurrentPage] = useState(1);
    const [compareCurrentPage, setCompareCurrentPage] = useState(1);
    const [validationCurrentPage, setValidationCurrentPage] = useState(1);


    // Group assignments dialog state
    const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
    const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
    const [assignmentGroups, setAssignmentGroups] = useState<{[key: string]: GroupData}>({});
    const [loadingAssignmentGroups, setLoadingAssignmentGroups] = useState<string[]>([]);


    // Add pagination logic before the return statement
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = comparisonResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(comparisonResults.length / itemsPerPage);

    const { showConsent } = useConsent();

    const [migrationSuccessful, setMigrationSuccessful] = useState(false);

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

// Add this component before the uploadColumns definition
    const ValidationStatusCell = ({ csvRow }: { csvRow: CSVRow }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-red-50 dark:bg-red-900 border-l border-t border-red-200 dark:border-red-700 transform rotate-45"></div>
                            <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">Validation Errors:</p>
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
                <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
        );
    };

    const uploadColumns = [
        {
            key: 'validationStatusSort',
            label: 'Status',
            width: 25,
            maxWidth: 25,
            minWidth: 25,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                // Return 0 for invalid (sorts first), 1 for valid (sorts last)
                return csvRow.isValid ? 1 : 0;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                return <ValidationStatusCell csvRow={csvRow} />;
            }
        },
        {
            key: 'PolicyName',
            label: 'Policy Name',
            minWidth: 200,
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
            minWidth: 150,
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
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                const hasError = csvRow.validationErrors?.some(e => e.field === 'AssignmentDirection');

                if (hasError) {
                    return (
                        <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
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
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                const hasError = csvRow.validationErrors?.some(e => e.field === 'AssignmentAction');

                if (hasError) {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
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
                                csvRow.AssignmentAction === 'Remove' ? 'destructive' : 'secondary'
                        }
                        className={
                            csvRow.AssignmentAction === 'Add' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                csvRow.AssignmentAction === 'Remove' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                    'bg-red-500 hover:bg-red-600 text-white'
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
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
                return csvRow.FilterName ? (
                    <div className={`max-w-xs truncate ${csvRow.AssignmentAction === 'NoAssignment' ? 'text-gray-400' : ''}`} title={csvRow.FilterName}>
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

    const MigrationCheckCell = ({ result }: { result: ComparisonResult }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
                        <Circle className="h-5 w-5 text-blue-500" />
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
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">Already Migrated</p>
                        </div>,
                        document.body
                    )}
                </>
            );
        }

        const allChecksPass = check.policyExists && check.policyIsUnique &&
            check.groupExists && check.correctAssignmentTypeProvided &&
            check.correctAssignmentActionProvided;

        const hasWarnings = check.filterExist === false || check.filterIsUnique === false ||
            check.correctFilterPlatform === false || check.correctFilterTypeProvided === false;

        const errors: string[] = [];
        const warnings: string[] = [];

        if (!check.policyExists) errors.push("Policy not found");
        if (!check.policyIsUnique) errors.push("Multiple policies found");
        if (!check.groupExists) errors.push("Group not found");
        if (!check.correctAssignmentTypeProvided) errors.push("Invalid assignment type");
        if (!check.correctAssignmentActionProvided) errors.push("Invalid assignment action");

        if (check.filterExist === false) warnings.push("Filter not found");
        if (check.filterIsUnique === false) warnings.push("Multiple filters found");
        if (check.correctFilterPlatform === false) warnings.push("Incorrect filter platform");
        if (check.correctFilterTypeProvided === false) warnings.push("Invalid filter type");

        if (allChecksPass && !hasWarnings) {
            return (
                <div className="flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
            );
        }

        if (allChecksPass && hasWarnings) {
            return (
                <>
                    <div
                        ref={iconRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="flex items-center justify-center cursor-help"
                    >
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    {showTooltip && ReactDOM.createPortal(
                        <div
                            className="fixed z-[10000] bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`
                            }}
                        >
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-yellow-50 dark:bg-yellow-900 border-l border-t border-yellow-200 dark:border-yellow-700 transform rotate-45"></div>
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Filter Warnings:</p>
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

        return (
            <>
                <div
                    ref={iconRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="flex items-center justify-center cursor-help"
                >
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                {showTooltip && ReactDOM.createPortal(
                    <div
                        className="fixed z-[10000] bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 shadow-xl min-w-[280px] max-w-[400px]"
                        style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`
                        }}
                    >
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-red-50 dark:bg-red-900 border-l border-t border-red-200 dark:border-red-700 transform rotate-45"></div>
                        <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">Migration Check Errors:</p>
                        <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                            {errors.map((error, idx) => (
                                <li key={idx} className="leading-relaxed">• {error}</li>
                            ))}
                        </ul>
                    </div>,
                    document.body
                )}
            </>
        );
    };



    const comparisonColumns = [
        {
            key: '_select',
            label: '',
            width: 10,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const isSelected = selectedRows.includes(result.id);
                const isDisabled = !result.isReadyForMigration || result.isMigrated;

                return (
                    <div onClick={(e) => e.stopPropagation()}>
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
            width: 25,
            sortable: true,
            sortValue: (row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const check = result.migrationCheckResult;
                if (!check) return 2;

                const allChecksPass = check.policyExists && check.policyIsUnique &&
                    check.groupExists && check.correctAssignmentTypeProvided &&
                    check.correctAssignmentActionProvided;
                return allChecksPass ? 1 : 0;
            },
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return <MigrationCheckCell result={result} />;
            }
        },
        {
            key: 'providedPolicyName',
            label: 'Policy Name',
            minWidth: 250,
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
                                <div className="text-sm font-medium cursor-pointer truncate block w-full text-left" title={displayPolicy.name || 'Unknown Policy'}>
                                    {displayPolicy.name || 'Unknown Policy'}
                                </div>
                                {hasDuplicates && (
                                    <Badge variant="secondary" className="text-xs">
                                        {result.policies?.length || 0} duplicates
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                {displayPolicy.policyType || 'Unknown Type'} • {displayPolicy.platforms || 'Unknown Platform'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-600 text-sm">
                        <XCircle className="h-4 w-4 inline mr-1"/>
                        <div>
                            <div className="text-sm font-medium cursor-pointer truncate block w-full text-left">{result.providedPolicyName || 'Unknown policy name'}</div>
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
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.filterName || result.csvRow?.FilterName || '-';
            }
        },
        {
            key: 'filterType',
            label: 'Filter Type',
            minWidth: 120,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                if (!result.filterType) return null;

                if (result.filterType.toLowerCase() === 'none') {
                    return (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {result.filterType}
                        </Badge>
                    );
                }

                return (
                    <Badge variant={result.filterType === 'Include' ? 'default' : 'destructive'}>
                        {result.filterType}
                    </Badge>
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
                    <div className="text-sm font-medium cursor-pointer truncate block w-full text-left" title={result.policy.name}>
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
                return result.csvRow?.GroupName ? (
                    <div className="text-sm font-medium cursor-pointer truncate block w-full text-left" title={result.csvRow?.GroupName}>
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
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valid
                        </Badge>
                    );
                }
                if (result.validationStatus === 'invalid') {
                    return (
                        <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Invalid
                        </Badge>
                    );
                }
                if (result.validationStatus === 'warning') {
                    return (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
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

            const getAssignmentAction = (value: string): { action: 'Add' | 'Remove' | 'NoAssignment'; isValid: boolean; originalValue?: string } => {
                const normalized = value?.trim().toLowerCase();
                if (normalized === 'add') return { action: 'Add', isValid: true };
                if (normalized === 'remove') return { action: 'Remove', isValid: true };
                if (normalized === 'noassignment') return { action: 'NoAssignment', isValid: true };

                if (!value || value.trim() === '') {
                    return { action: 'Add', isValid: true };
                }

                return {
                    action: 'Add',
                    isValid: false,
                    originalValue: value?.trim()
                };
            };

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
                    message: `Invalid Assignment Action: "${actionResult.originalValue}". Must be Add, Remove, or NoAssignment`
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
                validationStatusSort: validationErrors.length === 0 ? 1 : 0
            };
        });
    };



    // Backup rows
    const downloadBackups = async () => {
        const readyForMigration = comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated);

        if (readyForMigration.length === 0) {
            alert('No policies ready for migration to backup');
            return;
        }

        setLoading(true);

        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const backupResults: { [id: string]: boolean } = {};

            for (const policy of readyForMigration) {
                try {
                    const response = await instance.acquireTokenSilent({
                        scopes: [apiScope],
                        account: accounts[0]
                    });

                    const apiResponse = await fetch(`${EXPORT_ENDPOINT}/${policy.policy.policySubType}/${policy.policy.id}`, {
                        headers: {
                            'Authorization': `Bearer ${response.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (apiResponse.ok) {
                        const backupData = await apiResponse.json();
                        zip.file(`${policy.policy.name}_${policy.policy.id}.json`, JSON.stringify(backupData, null, 2));
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

            setComparisonResults(prev =>
                prev.map(result => ({
                    ...result,
                    isBackedUp: backupResults[result.id] === true
                }))
            );

            const content = await zip.generateAsync({ type: 'blob' });
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `policy_backups_${new Date().toISOString().split('T')[0]}.zip`;
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
            setLoading(false);
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

        // Filter out invalid rows before sending to API
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
            // The UserConsentRequiredError will be caught and handled by the useApiRequest hook
            // which will automatically call showConsent with the consentUrl
            const apiResponse = await request<AssignmentCompareApiResponse>(ASSIGNMENTS_COMPARE_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(validCsvData)
            });

            if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
                setError('Invalid data format received from server');
                setLoading(false);
                return;
            }
            const enhancedResults = apiResponse.data.map((item: ComparisonResult, index: number) => {
                const check = item.migrationCheckResult;
                let migrationCheckSortValue = 2; // default for no check data

                if (check) {
                    const allChecksPass = check.policyExists && check.policyIsUnique &&
                        check.groupExists && check.correctAssignmentTypeProvided &&
                        check.correctAssignmentActionProvided;
                    migrationCheckSortValue = allChecksPass ? 1 : 0;
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
                    migrationCheckSortValue
                };
            });
            setComparisonResults(enhancedResults);
            setCurrentStep('migrate');
        } catch (error) {
            // Don't set an error if it was a consent error (already handled)
            if (!(error instanceof UserConsentRequiredError)) {
                setError(error instanceof Error ? error.message : 'Failed to compare assignments');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMigrationSuccess = () => {
        setMigrationSuccessful(true);
        // Reset after clearing error
        setTimeout(() => setMigrationSuccessful(false), 100);
    };


    const migrateSelectedAssignments = async () => {
        if (!accounts.length || !selectedRows.length) return;

        setLoading(true);
        setMigrationProgress(0);

        try {
            // Get the selected comparison results first
            const selectedComparisonResults = comparisonResults.filter(result =>
                selectedRows.includes(result.id)
            );

            // Create the API payload with the correct structure
            const migrationPayload = selectedComparisonResults.map(result => ({
                PolicyId: result.policy?.id || '',
                PolicyName: result.policy?.name || result.providedPolicyName || '',
                PolicyType: result.policy?.policySubType || '', // Use policySubType for PolicyType field
                AssignmentResourceName: result.csvRow?.GroupName || result.groupToMigrate || '',
                AssignmentDirection: result.csvRow?.AssignmentDirection || result.assignmentDirection || 'Include',
                AssignmentAction: result.csvRow?.AssignmentAction || result.assignmentAction || 'Add',
                FilterName: result.csvRow?.FilterName || result.filterName || null,
                FilterType: result.csvRow?.FilterType || result.filterType || 'none'
            }));

            const apiResponse = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                method: 'POST',
                body: JSON.stringify(migrationPayload)
            });

            // Add null check for apiResponse
            if (!apiResponse) {
                setError('Failed to get response from server');
                return;
            }

            // Check if this is an error response
            if (apiResponse.status === 'Error' &&
                apiResponse.message?.message === 'User challenge required') {

                setConsentUrl(apiResponse.message.url || '');
                setShowConsentDialog(true);
                setLoading(false);
                return;
            }

            // Add null check for apiResponse.data
            if (!apiResponse.data) {
                setError('No data received from server');
                return;
            }
            if (!Array.isArray(apiResponse.data)) {
                setError('Invalid data format received from server');
                return;
            }

            // Simulate migration progress
            for (let i = 0; i <= 100; i += 10) {
                setMigrationProgress(i);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Update migrated status
            setComparisonResults(prev =>
                prev.map(result =>
                    selectedRows.includes(result.id)
                        ? { ...result, isMigrated: true }
                        : result
                )
            );

            // Move to validation step
            setCurrentStep('validate');

            // Clear selected rows to prevent confusion
            setSelectedRows([]);

            // Validate only the items that were just migrated
            setTimeout(() => {
                validateMigratedAssignments(selectedComparisonResults);
            }, 500);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Migration failed');
        } finally {
            setLoading(false);
        }
    };


    const validateMigratedAssignments = async (results?: ComparisonResult[]) => {
        if (!accounts.length) return;

        // If no specific results are passed, don't validate anything
        if (!results || results.length === 0) {
            setError('No specific assignments provided for validation');
            return;
        }

        setLoading(true);
        setValidationComplete(false);

        try {
            console.log(`Validating ${results.length} specific assignments`);

            const validationPayload = results.map(result => ({
                Id: result.id,
                ResourceType: result.policy?.policyType || '',
                SubResourceType: result.policy?.policySubType || '',
                ResourceId: result.policy?.id || result.id,
                AssignmentId: result.assignmentId,
                AssignmentType: result.assignmentType,
                AssignmentDirection: result.csvRow?.AssignmentDirection,
                AssignmentAction: result.csvRow?.AssignmentAction || '',
                FilterId: result.filterToMigrate?.id && result.filterToMigrate.id !== "00000000-0000-0000-0000-000000000000"
                    ? result.filterToMigrate.id
                    : null,
                FilterType: result.csvRow?.FilterType || null
            }));

            console.log('Validation payload:', validationPayload);

            const validationData = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/validate`, {
                method: 'POST',
                body: JSON.stringify(validationPayload)
            });

            if (!validationData) {
                setError('Failed to get response from server');
                return;
            }

            if (validationData.status === 'Error' &&
                validationData.message?.message === 'Additional permissions required') {

                setConsentUrl(validationData.message.url || '');
                setShowConsentDialog(true);
                setLoading(false);
                return;
            }

            if (!validationData.data || !Array.isArray(validationData.data)) {
                setError('Invalid data format received from server');
                return;
            }

            setValidationResults(validationData.data as unknown as ValidationResult[]);

            // Only update the specific results that were validated
            setComparisonResults(prev =>
                prev.map(result => {
                    const validation = (validationData.data as unknown as ValidationResult[]).find(
                        (v: ValidationResult) => v.id === result.id
                    );

                    if (validation) {
                        return {
                            ...result,
                            validationStatus: validation.hasCorrectAssignment ? 'valid' : 'invalid',
                            validationMessage: validation.message?.reason || validation.message?.status || '',
                            isCurrentSessionValidation: true // Mark as current session
                        };
                    }
                    return result;
                })
            );

            setValidationComplete(true);
            console.log(`Validation completed for ${validationData.data?.length || 0} items`);
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
        // Only validate items that were just migrated in this session
        const recentlyMigrated = comparisonResults.filter(result =>
            result.isMigrated && result.validationStatus === 'pending'
        );

        if (recentlyMigrated.length === 0) {
            setError('No recently migrated assignments to validate');
            return;
        }

        await validateMigratedAssignments(recentlyMigrated);
    };

    const resetProcess = () => {
        setCurrentStep('upload');
        setCsvData([]);
        setComparisonResults([]);
        setSelectedRows([]);
        setMigrationProgress(0);
        setValidationResults([]);
        setValidationComplete(false);
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

    // Update the handleResourceClick function to handle GroupAssignment:
    const handleResourceClick = (resourceId: string, assignmentType: string) => {
        if (assignmentType === 'GroupAssignment' && resourceId) {
            fetchGroupDetails(resourceId);
        } else if ((assignmentType === 'Entra ID Group' || assignmentType === 'Entra ID Group Exclude') && resourceId) {
            fetchGroupDetails(resourceId);
        }
    };

    const AssignmentsDialog = () => (
        <Dialog open={showAssignmentsDialog} onOpenChange={setShowAssignmentsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
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
                                        <Shield className="h-4 w-4 text-blue-500" />
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
                                                <RefreshCw className="h-4 w-4 animate-spin" />
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
                                                            <Blocks className="h-3 w-3 text-purple-500 flex-shrink-0" />
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
                                                        <Eye className="h-3 w-3 mr-1" />
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
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-medium">All Users and Devices</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            This assignment applies to all users and devices in your organization
                                        </p>
                                    </div>
                                )}

                                {assignment.target?.deviceAndAppManagementAssignmentFilterId && (
                                    <div className="text-xs text-gray-500">
                                        <span className="font-medium">Filter:</span> {assignment.target.deviceAndAppManagementAssignmentFilterType}
                                        <span className="ml-2">ID: {assignment.target.deviceAndAppManagementAssignmentFilterId}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Assignment Rollout</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload, compare, and migrate policy assignments
                    </p>
                </div>
                <Button onClick={resetProcess} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                </Button>
            </div>

            {/* Progress Steps */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        {[
                            { key: 'upload', label: 'Upload CSV', icon: Upload },
                            { key: 'compare', label: 'Compare', icon: Eye },
                            { key: 'migrate', label: 'Migrate', icon: Play },
                            { key: 'validate', label: 'Validate', icon: CheckCircle2 }
                        ].map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.key;
                            const stepOrder = ['upload', 'compare', 'migrate', 'validate'];
                            const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.key);

                            // Special case for validate step - show green if validation is complete
                            const isValidateComplete = step.key === 'validate' && validationComplete;

                            return (
                                <div key={step.key} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                        isCompleted || isValidateComplete ? 'bg-green-500 border-green-500 text-white' :
                                            isActive ? 'bgyellow-500 border-yellow-500 text-white' :
                                                'border-gray-300 text-gray-400'
                                    }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${
                                        isActive && !isValidateComplete ? 'text-yellow-600' :
                                            isCompleted || isValidateComplete ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                            {step.label}
                        </span>
                                    {index < 3 && (
                                        <ArrowRight className="h-4 w-4 mx-4 text-gray-300" />
                                    )}
                                </div>
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
                            <X className="h-5 w-5" />
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>

                        {/* Step-specific error content */}
                        {currentStep === 'upload' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred while processing the CSV file. Please check the file format and try again.
                                </p>
                                <Button
                                    onClick={() => setError(null)}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Clear Error
                                </Button>
                            </>
                        )}

                        {currentStep === 'compare' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred while comparing assignments. Please check your connection and try again.
                                </p>
                                <Button
                                    onClick={compareAssignments}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
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
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry Migration
                                </Button>
                            </>
                        )}

                        {currentStep === 'validate' && (
                            <>
                                <p className="text-sm text-gray-600 mt-2">
                                    Error occurred while validating assignments. This doesn&apos;t affect your migrations.
                                </p>
                                <Button
                                    onClick={validateAssignments}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
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
                        <Upload className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
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
                            }`} />
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
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                                                    {csvData.filter(r => !r.isValid).length} Invalid {csvData.filter(r => !r.isValid).length === 1 ? 'Row' : 'Rows'} Detected
                                                </p>
                                                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                                    These rows will be <strong>excluded from migration</strong> due to missing or invalid required fields.
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
                                                            <div key={field} className="text-sm text-red-700 dark:text-red-300">
                                                                • <strong>{count}</strong> row{count !== 1 ? 's' : ''} missing or invalid <code className="bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded">{field}</code>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-medium">
                                                    💡 Hover over the warning icon (⚠️) in each row to see specific validation errors.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        CSV Data Overview ({csvData.filter(r => r.isValid).length} valid / {csvData.length} total rows)
                                    </h3>
                                    <Button
                                        onClick={compareAssignments}
                                        disabled={loading || csvData.filter(r => r.isValid).length === 0}
                                    >
                                        {loading ? 'Comparing...' : `Compare ${csvData.filter(r => r.isValid).length} Valid Rows`}
                                    </Button>
                                </div>

                                {/* Summary Stats - only count valid rows */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-500">{csvData.filter(r => r.isValid).length}</div>
                                        <div className="text-sm text-gray-600">Valid Rows</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-500">
                                            {csvData.filter(r => r.isValid && r.AssignmentAction === 'Add').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Add Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-500">
                                            {csvData.filter(r => r.isValid && r.AssignmentAction === 'Remove').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Remove Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-500">
                                            {csvData.filter(r => r.isValid && r.AssignmentAction === 'NoAssignment').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Clear Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-500">
                                            {csvData.filter(r => r.isValid && r.FilterName).length}
                                        </div>
                                        <div className="text-sm text-gray-600">With Filters</div>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-visible"> {/* Changed from overflow-hidden */}
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
                        <Button onClick={compareAssignments} disabled={loading || csvData.filter(r => r.isValidAction).length === 0}>
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
                                    onClick={() => {
                                        const readyRows = comparisonResults
                                            .filter(r => r.isReadyForMigration && !r.isMigrated)
                                            .map(r => r.id);

                                        // Check if all ready rows are already selected
                                        const allReadySelected = readyRows.length > 0 &&
                                            readyRows.every(id => selectedRows.includes(id));

                                        if (allReadySelected) {
                                            // Deselect all ready rows
                                            setSelectedRows(selectedRows.filter(id => !readyRows.includes(id)));
                                        } else {
                                            // Select all ready rows
                                            const newSelection = [...new Set([...selectedRows, ...readyRows])];
                                            setSelectedRows(newSelection);
                                        }
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    {(() => {
                                        const readyRows = comparisonResults
                                            .filter(r => r.isReadyForMigration && !r.isMigrated)
                                            .map(r => r.id);
                                        const allReadySelected = readyRows.length > 0 &&
                                            readyRows.every(id => selectedRows.includes(id));

                                        return allReadySelected
                                            ? `Deselect All Ready (${readyRows.length})`
                                            : `Select All Ready (${readyRows.length})`;
                                    })()}
                                </Button>


                                <Button
                                    onClick={downloadBackups}
                                    disabled={loading || comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length === 0}
                                    variant="outline"
                                >
                                    {loading ? 'Creating Backup...' : 'Backup Ready Policies'}
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
                    <CardContent>
                        {migrationProgress > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Migration Progress</span>
                                    <span className="text-sm text-gray-600">{migrationProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${migrationProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Comparison Results Table */}
                        {comparisonResults.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Comparison Results ({comparisonResults.length} policies)</h3>
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
                                    data={comparisonResults.map(result => result as unknown as Record<string, unknown>)}
                                    columns={comparisonColumns}
                                    className="text-sm"
                                    // Instead of using key, pass selectedRows as a prop
                                    selectedRows={selectedRows}
                                    onRowClick={(row, index, event) => handleRowClick(row, index, event)}
                                    currentPage={compareCurrentPage}
                                    totalPages={Math.ceil(comparisonResults.length / itemsPerPage)}
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
                                <div className="flex items-center justify-between bg-gray-50 p-4 dark:bg-neutral-900 rounded-lg">
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


            {currentStep === 'validate' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Validation Results</CardTitle>
                                <p className="text-gray-600">
                                    Verify migrated assignments
                                </p>
                            </div>
                            {!validationComplete && (
                                <Button onClick={validateAssignments} disabled={loading}>
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Validating...
                                        </div>
                                    ) : (
                                        'Run Validation'
                                    )}
                                </Button>
                            )}
                            {validationComplete && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Validation Complete</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-green-800">Successful</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600 mt-2">
                                    {comparisonResults.filter(r => r.isCurrentSessionValidation && r.validationStatus === 'valid').length}
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">Warnings</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-600 mt-2">
                                    {comparisonResults.filter(r => r.isCurrentSessionValidation && r.validationStatus === 'warning').length}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-800">Failed</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600 mt-2">
                                    {comparisonResults.filter(r => r.isCurrentSessionValidation && r.validationStatus === 'invalid').length}
                                </div>
                            </div>
                        </div>


                        {/* Validation Results Table */}
                        {comparisonResults.filter(r => r.isCurrentSessionValidation).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Validated Assignments ({comparisonResults.filter(r => r.isCurrentSessionValidation).length} items)</h3>
                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto overflow-y-visible">
                                        <DataTable
                                            data={comparisonResults.filter(r => r.isCurrentSessionValidation).map(result => result as unknown as Record<string, unknown>)}
                                            columns={validationColumns}
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
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            {/* Group Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Group Details
                        </DialogTitle>
                    </DialogHeader>

                    {groupLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading group details...</span>
                        </div>
                    )}

                    {groupError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                <span>{groupError}</span>
                            </div>
                        </div>
                    )}

                    {selectedGroup && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Display Name</label>
                                    <p className="text-sm font-semibold">{selectedGroup.displayName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Group ID</label>
                                    <p className="text-sm font-mono text-gray-600">{selectedGroup.id}</p>
                                </div>
                            </div>

                            {selectedGroup.description && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                                </div>
                            )}

                            {selectedGroup.groupCount && (
                                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {selectedGroup.groupCount.userCount}
                                        </div>
                                        <div className="text-sm text-gray-600">Users</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {selectedGroup.groupCount.deviceCount}
                                        </div>
                                        <div className="text-sm text-gray-600">Devices</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {selectedGroup.groupCount.groupCount}
                                        </div>
                                        <div className="text-sm text-gray-600">Groups</div>
                                    </div>
                                </div>
                            )}

                            {selectedGroup.members && selectedGroup.members.length > 0 ? (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">
                                        Members ({selectedGroup.members.length})
                                    </label>
                                    <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="text-left p-3 border-b">Name</th>
                                                <th className="text-left p-3 border-b">Type</th>
                                                <th className="text-left p-3 border-b">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedGroup.members.map((member, index) => (
                                                <tr key={member.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="p-3 border-b">
                                                        <div className="font-medium">{member.displayName || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-500">{member.id || 'No ID'}</div>
                                                    </td>
                                                    <td className="p-3 border-b">
                                                        <Badge variant="outline">{member.type || 'Unknown'}</Badge>
                                                    </td>
                                                    <td className="p-3 border-b">
                                                        <Badge variant={member.accountEnabled ? 'default' : 'secondary'}>
                                                            {member.accountEnabled ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-600">No members found or unable to load member details.</p>
                                </div>
                            )}

                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AssignmentsDialog />
        </div>
    );
}

export default function AssignmentRolloutPage() {
    return (
        <PlanProtection requiredPlan="extensions" featureName="Assignments Manager">
            <AssignmentRolloutContent />
        </PlanProtection>
    );
}