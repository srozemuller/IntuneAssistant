
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload, FileText, CheckCircle2, XCircle, AlertTriangle,
    Play, RotateCcw, Eye, ArrowRight, Shield, Users, Info, X, RefreshCw
} from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import {ASSIGNMENTS_COMPARE_ENDPOINT, ASSIGNMENTS_ENDPOINT,EXPORT_ENDPOINT,GROUPS_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { DataTable } from '@/components/DataTable';
import {useApiRequest} from "@/hooks/useApiRequest";
import { UserConsentRequiredError } from '@/lib/errors';

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


export default function AssignmentRolloutPage() {
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


    // Add pagination logic before the return statement
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = comparisonResults.slice(startIndex, endIndex);
    const totalPages = Math.ceil(comparisonResults.length / itemsPerPage);

    const { showConsent } = useConsent();

    const [migrationSuccessful, setMigrationSuccessful] = useState(false);

    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const uploadColumns = [
        {
            key: 'PolicyName',
            label: 'Policy Name',
            minWidth: 200,
            render: (value: unknown) => (
                <div className="text-sm font-medium cursor-pointer truncate block w-full text-left" title={String(value)}>
                    {String(value)}
                </div>
            )
        },
        {
            key: 'GroupName',
            label: 'Group Name',
            minWidth: 150,
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as unknown as CSVRow;
                return (
                    <div className={`text-sm font-medium cursor-pointer truncate block w-full text-left ${csvRow.AssignmentAction === 'NoAssignment' ? 'text-gray-400' : ''}`} title={String(value)}>
                        {String(value)}
                    </div>
                );
            }
        },
        {
            key: 'AssignmentDirection',
            label: 'Direction',
            render: (value: unknown, row: Record<string, unknown>) => {
                const csvRow = row as CSVRow;
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
                return !csvRow.isValidAction ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive">Excluded</Badge>
                        <span className="text-xs text-red-600">
            Invalid: &quot;{csvRow.originalActionValue}&quot;
          </span>
                    </div>
                ) : (
                    <Badge variant={
                        csvRow.AssignmentAction === 'Add' ? 'default' :
                            csvRow.AssignmentAction === 'Remove' ? 'destructive' : 'secondary'
                    }>
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
    const comparisonColumns = [
        {
            key: '_select',
            label: '',
            width: 50,
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
            key: 'policyName',
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
            key: 'currentAssignments',
            label: 'Current Assignments',
            width: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                const displayPolicy = result.policy || (result.policies ? result.policies[0] : null);
                return displayPolicy ? (
                    <Badge variant="outline">
                        {displayPolicy.assignments?.length || 0} groups
                    </Badge>
                ) : (
                    <Badge variant="destructive">N/A</Badge>
                );
            }
        },
        {
            key: 'targetGroup',
            label: 'Target Group',
            minWidth: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.groupToMigrate || result.csvRow?.GroupName || '-';
            }
        },
        {
            key: 'direction',
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
            key: 'action',
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
            key: 'filter',
            label: 'Filter',
            minWidth: 120,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return result.filterName || result.csvRow?.FilterName || '-';
            }
        },
        {
            key: 'status',
            label: 'Status',
            minWidth: 150,
            render: (_: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ComparisonResult;
                return (
                    <div className="flex flex-col gap-1">
                        {result.isMigrated ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Migrated
                            </Badge>
                        ) : result.isReadyForMigration ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Ready
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Ready
                            </Badge>
                        )}

                        {result.isBackedUp && (
                            <Badge variant="outline" className="text-xs">
                                Backed Up
                            </Badge>
                        )}

                        {!result.isReadyForMigration && result.migrationCheckResult && (
                            <div className="text-xs text-gray-500 mt-1">
                                {!result.migrationCheckResult.policyExists && "Policy not found"}
                                {!result.migrationCheckResult.groupExists && "Group not found"}
                                {!result.migrationCheckResult.policyIsUnique && "Multiple policies found"}
                            </div>
                        )}
                    </div>
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

        return lines.slice(1).map(line => {
            const values = line.split(';');

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

                // If empty, default to 'Add' and mark as valid
                if (!value || value.trim() === '') {
                    return { action: 'Add', isValid: true };
                }

                // If invalid value provided, mark as invalid and don't allow migration
                return {
                    action: 'Add', // Still need to set something for type safety
                    isValid: false,
                    originalValue: value?.trim()
                };
            };

            const actionResult = getAssignmentAction(values[3]);

            return {
                PolicyName: values[0] || '',
                GroupName: values[1] || '',
                AssignmentDirection: getAssignmentDirection(values[2]),
                AssignmentAction: actionResult.action,
                FilterName: nullIfEmpty(values[4]),
                FilterType: nullIfEmpty(values[5]),
                isValidAction: actionResult.isValid,
                originalActionValue: actionResult.originalValue
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
                // Remove this line to stay on upload step
                // setCurrentStep('compare');
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
        const validCsvData = csvData.filter(row => row.isValidAction);
        const invalidRowCount = csvData.length - validCsvData.length;

        if (invalidRowCount > 0) {
            setError(`Error: ${invalidRowCount} rows with invalid assignment actions have been excluded from processing. Please correct these values and re-upload the CSV.`);
        }

        if (validCsvData.length === 0) {
            setError('No valid rows found in CSV. All rows contain invalid assignment action values. Please check your data and try again.');
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

            const enhancedResults = apiResponse.data.map((item: ComparisonResult, index: number) => ({
                ...item,
                csvRow: {
                    ...validCsvData[index],
                },
                isReadyForMigration: item.isReadyForMigration,
                isMigrated: item.isMigrated || false,
                isBackedUp: false,
                validationStatus: 'pending' as const
            }));

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
            const selectedData = comparisonResults.filter(result =>
                selectedRows.includes(result.id)
            );

            const apiResponse = await request<AssignmentCompareApiResponse>(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                method: 'POST',
                body: JSON.stringify(selectedData)
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

            // Update migrated status and wait for state to update
            const updatedResults = comparisonResults.map(result =>
                selectedRows.includes(result.id)
                    ? { ...result, isMigrated: true }
                    : result
            );

            setComparisonResults(updatedResults);

            // Move to validation step
            setCurrentStep('validate');

            // Use the updated results for validation instead of relying on state
            setTimeout(() => {
                validateMigratedAssignments(updatedResults);
            }, 500);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Migration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleConsentComplete = async () => {
        setShowConsentDialog(false);
        setConsentUrl('');
        // Retry the migration after consent is complete
        await migrateSelectedAssignments();
    };


    const validateMigratedAssignments = async (results?: ComparisonResult[]) => {
        if (!accounts.length) return;
        setLoading(true);
        setValidationComplete(false);

        try {
            const currentResults = results || comparisonResults;
            const migratedData = currentResults.filter(result => result.isMigrated);

            if (migratedData.length === 0) {
                setError('No migrated assignments to validate');
                return;
            }

            console.log(`Validating ${migratedData.length} migrated assignments`);

            const validationPayload = migratedData.map(result => ({
                Id: result.id,
                ResourceType: result.policy?.policyType || '',
                SubResourceType: result.policy?.policySubType || '',
                ResourceId: result.policy?.id || result.id,
                AssignmentId: result.assignmentId,
                AssignmentType: result.csvRow?.AssignmentDirection,
                AssignmentAction: result.csvRow?.AssignmentAction || '',
                FilterId: result.filterToMigrate?.id && result.filterToMigrate.id !== "00000000-0000-0000-0000-000000000000"
                    ? result.filterToMigrate.id
                    : null,
                FilterType: result.csvRow?.FilterType || null
            }));

            console.log('Validation payload:', validationPayload);

            // Use AssignmentCompareApiResponse since that's what the API returns
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

            // Cast the data to ValidationResult[] since the API response structure matches
            setValidationResults(validationData.data as unknown as ValidationResult[]);

            setComparisonResults(prev =>
                prev.map(result => {
                    const validation = (validationData.data as unknown as ValidationResult[]).find(
                        (v: ValidationResult) => v.id === result.id
                    );

                    if (validation) {
                        return {
                            ...result,
                            validationStatus: validation.hasCorrectAssignment ? 'valid' : 'invalid',
                            validationMessage: validation.message?.reason || validation.message?.status || ''
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


    // Keep the original function for manual validation
    const validateAssignments = async () => {
        await validateMigratedAssignments();
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


    return (
        <div className="mx-auto p-2 space-y-2 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assignment Rollout</h1>
                    <p className="text-gray-600 mt-2">Upload, compare, and migrate policy assignments</p>
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
                                            isActive ? 'bg-blue-500 border-blue-500 text-white' :
                                                'border-gray-300 text-gray-400'
                                    }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${
                                        isActive && !isValidateComplete ? 'text-blue-600' :
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
                        <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <CardTitle>Upload Assignment CSV</CardTitle>
                        <p className="text-gray-600">
                            Upload a CSV file containing policy assignments to compare and migrate
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragOver
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <FileText className={`h-8 w-8 mx-auto mb-4 ${
                                isDragOver ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                            <p className={`mb-4 ${
                                isDragOver ? 'text-blue-600' : 'text-gray-600'
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
                                {/* Show warning if there are invalid rows */}
                                {csvData.filter(r => !r.isValidAction).length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-red-800">
                                                <p className="font-medium mb-1">Invalid Assignment Actions Detected</p>
                                                <p>
                                                    {csvData.filter(r => !r.isValidAction).length} rows contain invalid assignment action values
                                                    and will be <strong>excluded from migration</strong>.
                                                </p>
                                                <p className="mt-2">
                                                    Valid actions are: <code className="bg-red-100 px-1 rounded">Add</code>,
                                                    <code className="bg-red-100 px-1 rounded ml-1">Remove</code>,
                                                    <code className="bg-red-100 px-1 rounded ml-1">NoAssignment</code>
                                                </p>
                                                <p className="mt-2 font-medium">
                                                    Please correct these values in your CSV and re-upload to include all rows.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">CSV Data Overview ({csvData.length} rows)</h3>
                                    <Button onClick={compareAssignments} disabled={loading}>
                                        {loading ? 'Comparing...' : 'Compare Assignments'}
                                    </Button>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-500">{csvData.length}</div>
                                        <div className="text-sm text-gray-600">Total Rows</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-500">
                                            {csvData.filter(r => r.AssignmentAction === 'Add').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Add Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-500">
                                            {csvData.filter(r => r.AssignmentAction === 'Remove').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Remove Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-500">
                                            {csvData.filter(r => r.AssignmentAction === 'NoAssignment').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Clear Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-500">
                                            {csvData.filter(r => r.FilterName).length}
                                        </div>
                                        <div className="text-sm text-gray-600">With Filters</div>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto overflow-y-visible">
                                        <DataTable
                                            data={csvData}
                                            columns={uploadColumns}
                                            className="text-sm"
                                            currentPage={uploadCurrentPage}
                                            totalPages={Math.ceil(csvData.length / itemsPerPage)}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setUploadCurrentPage}
                                            onItemsPerPageChange={(newItemsPerPage) => {
                                                setItemsPerPage(newItemsPerPage);
                                                setUploadCurrentPage(1); // Reset to first page when changing items per page
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
                                    {comparisonResults.filter(r => r.validationStatus === 'valid').length}
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">Warnings</span>
                                </div>
                                <div className="text-2xl font-bold text-yellow-600 mt-2">
                                    {comparisonResults.filter(r => r.validationStatus === 'warning').length}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-800">Failed</span>
                                </div>
                                <div className="text-2xl font-bold text-red-600 mt-2">
                                    {comparisonResults.filter(r => r.validationStatus === 'invalid').length}
                                </div>
                            </div>
                        </div>

                        {/* Validation Results Table */}
                        {comparisonResults.filter(r => r.isMigrated).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Validated Assignments ({comparisonResults.filter(r => r.isMigrated).length} items)</h3>
                                <div className="border rounded-lg overflow-visible">
                                    <div className="overflow-x-auto overflow-y-visible">
                                        <DataTable
                                            data={comparisonResults.filter(r => r.isMigrated).map(result => result as unknown as Record<string, unknown>)}
                                            columns={validationColumns}
                                            className="text-sm"
                                            currentPage={validationCurrentPage}
                                            totalPages={Math.ceil(comparisonResults.filter(r => r.isMigrated).length / itemsPerPage)}
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
        </div>
    );
}
