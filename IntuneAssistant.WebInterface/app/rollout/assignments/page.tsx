'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload, FileText, CheckCircle2, XCircle, AlertTriangle,
    Play, RotateCcw, Eye, ArrowRight, Shield
} from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { ASSIGNMENTS_COMPARE_ENDPOINT, ASSIGNMENTS_ENDPOINT, EXPORT_ENDPOINT } from '@/lib/constants';
import { apiScope } from "@/lib/msalConfig";

interface CSVRow {
    PolicyName: string;
    GroupName: string;
    AssignmentDirection: 'Include' | 'Exclude';
    AssignmentAction: 'Add' | 'Remove';
    AssignmentType: string;
    FilterName: string | null;
    FilterType: string | null;
}

interface ValidationResult {
    id: string;
    hasCorrectAssignment: boolean;
    message?: {
        reason?: string;
        status?: string;
    };
}

interface ComparisonResult {
    id: string;
    assignmentId: string;
    policy: {
        id: string;
        name: string;
        policyType: string;
        policySubType: string;
        assignments: Array<{
            id: string;
            target: {
                groupId: string;
                '@odata.type': string;
                deviceAndAppManagementAssignmentFilterId: string | null;
                deviceAndAppManagementAssignmentFilterType: string;
            };
        }>;
        platforms: string;
    };
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
    csvRow?: CSVRow;
    isReadyForMigration?: boolean;
    isMigrated?: boolean;
    isBackedUp?: boolean;
    validationStatus?: 'pending' | 'valid' | 'invalid' | 'warning';
    validationMessage?: string;
}

export default function AssignmentRolloutPage() {
    const { instance, accounts } = useMsal();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State management
    const [currentStep, setCurrentStep] = useState<'upload' | 'compare' | 'migrate' | 'validate'>('upload');
    const [csvData, setCsvData] = useState<CSVRow[]>([]);
    const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [migrationProgress, setMigrationProgress] = useState(0);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

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

    // CSV File Processing
    const parseCSV = (content: string): CSVRow[] => {
        const lines = content.split('\n').filter(line => line.trim());
        return lines.slice(1).map(line => {
            const values = line.split(';');

            const nullIfEmpty = (value: string) => value?.trim() === '' ? null : value?.trim() || null;

            return {
                PolicyName: values[0] || '',
                GroupName: values[1] || '',
                AssignmentDirection: (values[2] as 'Include' | 'Exclude') || 'Include',
                AssignmentAction: (values[3] as 'Add' | 'Remove') || 'Add',
                AssignmentType: values[6] || 'GroupAssignment',
                FilterName: nullIfEmpty(values[4]),
                FilterType: nullIfEmpty(values[5])
            };
        });
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
            } catch {
                setError('Failed to parse CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    }, []);

    // API Calls
    const compareAssignments = async () => {
        if (!accounts.length || !csvData.length) return;

        setLoading(true);
        setError(null);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const apiResponse = await fetch(`${ASSIGNMENTS_COMPARE_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(csvData)
            });

            if (!apiResponse.ok) {
                throw new Error(`API call failed: ${apiResponse.statusText}`);
            }

            const responseData: { data: ComparisonResult[] } = await apiResponse.json();

            const enhancedResults = responseData.data.map((item: ComparisonResult, index: number) => ({
                ...item,
                csvRow: {
                    ...csvData[index],
                    AssignmentType: item.csvRow?.AssignmentType || csvData[index].AssignmentType || 'GroupAssignment'
                },
                isReadyForMigration: item.isReadyForMigration,
                isMigrated: item.isMigrated || false,
                validationStatus: 'pending' as const
            }));

            setComparisonResults(enhancedResults);
            setCurrentStep('migrate');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to compare assignments');
        } finally {
            setLoading(false);
        }
    };

    const migrateSelectedAssignments = async () => {
        if (!accounts.length || !selectedRows.length) return;

        setLoading(true);
        setMigrationProgress(0);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            const selectedData = comparisonResults.filter(result =>
                selectedRows.includes(result.id)
            );

            const apiResponse = await fetch(`${ASSIGNMENTS_ENDPOINT}/migrate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedData)
            });

            if (!apiResponse.ok) {
                throw new Error(`Migration failed: ${apiResponse.statusText}`);
            }

            for (let i = 0; i <= 100; i += 10) {
                setMigrationProgress(i);
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            const updatedResults = comparisonResults.map(result =>
                selectedRows.includes(result.id)
                    ? { ...result, isMigrated: true }
                    : result
            );

            setComparisonResults(updatedResults);
            setCurrentStep('validate');

            setTimeout(() => {
                validateMigratedAssignments(updatedResults);
            }, 500);

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Migration failed');
        } finally {
            setLoading(false);
        }
    };

    const validateMigratedAssignments = async (results?: ComparisonResult[]) => {
        if (!accounts.length) return;

        setLoading(true);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

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
                AssignmentType: result.csvRow?.AssignmentType || 'GroupAssignment',
                AssignmentAction: result.csvRow?.AssignmentAction || "Add",
                FilterId: result.filterToMigrate?.id && result.filterToMigrate.id !== "00000000-0000-0000-0000-000000000000"
                    ? result.filterToMigrate.id
                    : null,
                FilterType: result.csvRow?.FilterType || null
            }));

            console.log('Validation payload:', validationPayload);

            const apiResponse = await fetch(`${ASSIGNMENTS_ENDPOINT}/validate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${response.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(validationPayload)
            });

            if (!apiResponse.ok) {
                throw new Error(`Validation failed: ${apiResponse.statusText}`);
            }

            const validationData: { data: ValidationResult[] } = await apiResponse.json();
            setValidationResults(validationData.data || []);

            setComparisonResults(prev =>
                prev.map(result => {
                    const validation = validationData.data?.find((v: ValidationResult) => v.id === result.id);
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

            console.log(`Validation completed for ${validationData.data?.length || 0} items`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Validation failed');
            console.error('Validation error:', error);
        } finally {
            setLoading(false);
        }
    };

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
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
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
                            { key: 'validate', label: 'Validate', icon: Shield }
                        ].map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.key;
                            const stepOrder = ['upload', 'compare', 'migrate', 'validate'];
                            const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.key);

                            const isValidationCompleted = step.key === 'validate' &&
                                currentStep === 'validate' &&
                                comparisonResults.filter(r => r.isMigrated).length > 0 &&
                                comparisonResults.filter(r => r.isMigrated).every(r =>
                                    r.validationStatus && r.validationStatus !== 'pending'
                                ) &&
                                validationResults.length > 0;

                            return (
                                <div key={step.key} className="flex items-center">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-2 
                                        ${isActive ? 'border-blue-500 bg-blue-500 text-white' :
                                        isCompleted || isValidationCompleted ? 'border-green-500 bg-green-500 text-white' :
                                            'border-gray-300 bg-white text-gray-400'}
                                    `}>
                                        {isCompleted || isValidationCompleted ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <Icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {step.label}
                                        </p>
                                    </div>
                                    {index < 3 && (
                                        <ArrowRight className="h-5 w-5 text-gray-300 mx-4" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
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
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                                Drop your CSV file here or click to browse
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
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">CSV Data Overview ({csvData.length} rows)</h3>
                                    <Button onClick={compareAssignments} disabled={loading}>
                                        {loading ? 'Processing...' : 'Next: Compare'}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {new Set(csvData.map(row => row.PolicyName)).size}
                                        </div>
                                        <div className="text-sm text-gray-600">Unique Policies</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {csvData.filter(row => row.AssignmentAction === 'Add').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Add Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {csvData.filter(row => row.AssignmentAction === 'Remove').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Remove Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {csvData.filter(row => row.FilterName).length}
                                        </div>
                                        <div className="text-sm text-gray-600">With Filters</div>
                                    </div>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Policy Name</th>
                                                <th className="px-4 py-2 text-left">Group Name</th>
                                                <th className="px-4 py-2 text-left">Direction</th>
                                                <th className="px-4 py-2 text-left">Action</th>
                                                <th className="px-4 py-2 text-left">Filter Name</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {csvData.slice(0, 10).map((row, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-4 py-2">{row.PolicyName}</td>
                                                    <td className="px-4 py-2">{row.GroupName}</td>
                                                    <td className="px-4 py-2">
                                                        <Badge variant={row.AssignmentDirection === 'Include' ? 'default' : 'secondary'}>
                                                            {row.AssignmentDirection}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Badge variant={row.AssignmentAction === 'Add' ? 'default' : 'destructive'}>
                                                            {row.AssignmentAction}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-2">{row.FilterName || '-'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        {csvData.length > 10 && (
                                            <div className="p-4 text-center text-gray-500">
                                                ... and {csvData.length - 10} more rows
                                            </div>
                                        )}
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
                        <Button onClick={compareAssignments} disabled={loading} className="mb-4">
                            {loading ? 'Comparing...' : 'Run Comparison'}
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
                                        const readyIds = comparisonResults
                                            .filter(r => r.isReadyForMigration && !r.isMigrated)
                                            .map(r => r.id);
                                        setSelectedRows(readyIds);
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Select Ready
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
                                    disabled={!selectedRows.length || loading}
                                >
                                    {loading ? 'Migrating...' : `Migrate ${selectedRows.length} Selected`}
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

                        {comparisonResults.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Comparison Results ({comparisonResults.length} policies)</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.length === comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length && comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRows(comparisonResults.filter(r => r.isReadyForMigration && !r.isMigrated).map(r => r.id));
                                                        } else {
                                                            setSelectedRows([]);
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th className="px-4 py-2 text-left">Policy Name</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Ready</th>
                                            <th className="px-4 py-2 text-left">Backup</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {comparisonResults.map((result) => (
                                            <tr key={result.id} className="border-b">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(result.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedRows(prev => [...prev, result.id]);
                                                            } else {
                                                                setSelectedRows(prev => prev.filter(id => id !== result.id));
                                                            }
                                                        }}
                                                        disabled={!result.isReadyForMigration || result.isMigrated}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 font-medium">{result.policy.name}</td>
                                                <td className="px-4 py-2">{result.policy.policySubType}</td>
                                                <td className="px-4 py-2">
                                                    <Badge variant={result.csvRow?.AssignmentAction === 'Add' ? 'default' : 'destructive'}>
                                                        {result.csvRow?.AssignmentAction}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {result.isMigrated ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            Migrated
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {result.isReadyForMigration ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {result.isBackedUp ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Total: </span>
                                            <span>{comparisonResults.length}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Ready: </span>
                                            <span className="text-green-600">{comparisonResults.filter(r => r.isReadyForMigration).length}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Selected: </span>
                                            <span className="text-blue-600">{selectedRows.length}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Migrated: </span>
                                            <span className="text-purple-600">{comparisonResults.filter(r => r.isMigrated).length}</span>
                                        </div>
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
                            <Button
                                onClick={validateAssignments}
                                disabled={loading || (
                                    comparisonResults.filter(r => r.isMigrated).length > 0 &&
                                    validationResults.length > 0 &&
                                    comparisonResults.filter(r => r.isMigrated).every(r =>
                                        r.validationStatus && r.validationStatus !== 'pending'
                                    )
                                )}
                            >
                                {loading ? 'Validating...' : 'Run Validation'}
                            </Button>
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

                        {comparisonResults.filter(r => r.isMigrated).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Validated Assignments ({comparisonResults.filter(r => r.isMigrated).length} items)</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Policy Name</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                            <th className="px-4 py-2 text-left">Validation Status</th>
                                            <th className="px-4 py-2 text-left">Message</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {comparisonResults.filter(r => r.isMigrated).map((result) => (
                                            <tr key={result.id} className="border-b">
                                                <td className="px-4 py-2 font-medium">{result.policy.name}</td>
                                                <td className="px-4 py-2">
                                                    <Badge variant={result.csvRow?.AssignmentAction === 'Add' ? 'default' : 'destructive'}>
                                                        {result.csvRow?.AssignmentAction}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {result.validationStatus === 'valid' && (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Valid
                                                        </Badge>
                                                    )}
                                                    {result.validationStatus === 'invalid' && (
                                                        <Badge variant="destructive">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Invalid
                                                        </Badge>
                                                    )}
                                                    {result.validationStatus === 'warning' && (
                                                        <Badge className="bg-yellow-100 text-yellow-800">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Warning
                                                        </Badge>
                                                    )}
                                                    {result.validationStatus === 'pending' && (
                                                        <Badge variant="secondary">Pending</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-gray-600">
                                                    {result.validationMessage || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
