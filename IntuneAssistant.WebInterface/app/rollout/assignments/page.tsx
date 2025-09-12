
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
import {ASSIGNMENTS_COMPARE_ENDPOINT, ASSIGNMENTS_ENDPOINT,EXPORT_ENDPOINT,GROUPS_ENDPOINT, ASSIGNMENTS_FILTERS_ENDPOINT, ITEMS_PER_PAGE} from '@/lib/constants';
import {apiScope} from "@/lib/msalConfig";

interface CSVRow {
    PolicyName: string;
    GroupName: string;
    AssignmentDirection: 'Include' | 'Exclude';
    AssignmentAction: 'Add' | 'Remove';
    AssignmentType: string;
    FilterName: string | null;
    FilterType: string | null;
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
    const [validationComplete, setValidationComplete] = useState(false);
    const [validationResults, setValidationResults] = useState<any[]>([]);


    // CSV File Processing
    const parseCSV = (content: string): CSVRow[] => {
        const lines = content.split('\n').filter(line => line.trim());
        return lines.slice(1).map(line => {
            const values = line.split(';');

            // Helper function to convert empty strings to null
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

            const responseData = await apiResponse.json();

            // Process and enhance the comparison results - use API response values directly
            const enhancedResults = responseData.data.map((item: any, index: number) => ({
                ...item,
                csvRow: {
                    ...csvData[index],
                    AssignmentType: item.assignmentType || csvData[index].AssignmentType || 'GroupAssignment'
                },
                // Use the API's isReadyForMigration value directly
                isReadyForMigration: item.isReadyForMigration,
                isMigrated: item.isMigrated || false,
                isBackedUp: false,
                validationStatus: 'pending' as const
            }));

            setComparisonResults(enhancedResults);
            // Move to migrate step after successful comparison
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

    const validateMigratedAssignments = async (results?: ComparisonResult[]) => {
        if (!accounts.length) return;

        setLoading(true);
        setValidationComplete(false); // Reset completion status

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Use passed results or current state
            const currentResults = results || comparisonResults;
            const migratedData = currentResults.filter(result => result.isMigrated);

            if (migratedData.length === 0) {
                setError('No migrated assignments to validate');
                return;
            }

            console.log(`Validating ${migratedData.length} migrated assignments`);

            // Transform the data to match the expected payload format
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

            const validationData = await apiResponse.json();
            setValidationResults(validationData.data || []);

            // Update comparison results with validation status
            setComparisonResults(prev =>
                prev.map(result => {
                    const validation = validationData.data?.find((v: any) => v.id === result.id);
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

            // Mark validation as complete
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
                                        {loading ? 'Comparing...' : 'Compare Assignments'}
                                    </Button>
                                </div>
                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {csvData.length}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Rows</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {csvData.filter(r => r.AssignmentAction === 'Add').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Add Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {csvData.filter(r => r.AssignmentAction === 'Remove').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Remove Actions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {csvData.filter(r => r.FilterName).length}
                                        </div>
                                        <div className="text-sm text-gray-600">With Filters</div>
                                    </div>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="text-left p-3 border-b">#</th>
                                                <th className="text-left p-3 border-b">Policy Name</th>
                                                <th className="text-left p-3 border-b">Group Name</th>
                                                <th className="text-left p-3 border-b">Direction</th>
                                                <th className="text-left p-3 border-b">Action</th>
                                                <th className="text-left p-3 border-b">Assignment Type</th>
                                                <th className="text-left p-3 border-b">Filter Name</th>
                                                <th className="text-left p-3 border-b">Filter Type</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {csvData.map((row, index) => (
                                                <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="p-3 text-gray-500">{index + 1}</td>
                                                    <td className="p-3">
                                                        <div className="max-w-xs truncate" title={row.PolicyName}>
                                                            {row.PolicyName}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="max-w-xs truncate" title={row.GroupName}>
                                                            {row.GroupName}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant={row.AssignmentDirection === 'Include' ? 'default' : 'destructive'}>
                                                            {row.AssignmentDirection}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant={row.AssignmentAction === 'Add' ? 'default' : 'secondary'}>
                                                            {row.AssignmentAction}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline">
                                                            {row.AssignmentType}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        {row.FilterName ? (
                                                            <div className="max-w-xs truncate" title={row.FilterName}>
                                                                {row.FilterName}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {row.FilterType ? (
                                                            <Badge variant="outline" className="text-xs">
                                                                {row.FilterType}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
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
                                        const readyRows = comparisonResults
                                            .filter(r => r.isReadyForMigration && !r.isMigrated)
                                            .map(r => r.id);
                                        setSelectedRows(readyRows);
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

                        {/* Comparison Results Table */}
                        {comparisonResults.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Comparison Results ({comparisonResults.length} policies)</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-3">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRows(comparisonResults.map(r => r.id));
                                                        } else {
                                                            setSelectedRows([]);
                                                        }
                                                    }}
                                                    checked={selectedRows.length === comparisonResults.length && comparisonResults.length > 0}
                                                />
                                            </th>
                                            <th className="text-left p-3">Policy Name</th>
                                            <th className="text-left p-3">Current Assignments</th>
                                            <th className="text-left p-3">Target Group</th>
                                            <th className="text-left p-3">Direction</th>
                                            <th className="text-left p-3">Action</th>
                                            <th className="text-left p-3">Filter</th>
                                            <th className="text-left p-3">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {comparisonResults.map((result, index) => (
                                            <tr key={result.id}
                                                className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="p-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(result.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedRows([...selectedRows, result.id]);
                                                            } else {
                                                                setSelectedRows(selectedRows.filter(id => id !== result.id));
                                                            }
                                                        }}
                                                        disabled={!result.isReadyForMigration || result.isMigrated}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    {result.policy ? (
                                                        <>
                                                            <div className="max-w-xs truncate"
                                                                 title={result.policy.name || 'Unknown Policy'}>
                                                                {result.policy.name || 'Unknown Policy'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {result.policy.policyType || 'Unknown Type'} • {result.policy.platforms || 'Unknown Platform'}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-red-600 text-sm">
                                                            <XCircle className="h-4 w-4 inline mr-1"/>
                                                            <div>
                                                                <div className="font-medium"> {result.csvRow?.PolicyName || 'Unknown policy name'}</div>
                                                                <div className="text-xs text-red-500">
                                                                    Policy not found
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {result.policy ? (
                                                        <Badge variant="outline">
                                                            {result.policy.assignments?.length || 0} groups
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            N/A
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {result.csvRow?.GroupName || '-'}
                                                </td>
                                                <td className="p-3">
                                                    {result.csvRow?.AssignmentDirection && (
                                                        <Badge
                                                            variant={result.csvRow.AssignmentDirection === 'Include' ? 'default' : 'destructive'}>
                                                            {result.csvRow.AssignmentDirection}
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    {result.csvRow?.AssignmentAction && (
                                                        <Badge
                                                            variant={result.csvRow.AssignmentAction === 'Add' ? 'default' : 'secondary'}>
                                                            {result.csvRow.AssignmentAction}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {result.csvRow?.FilterName || '-'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        {!result.policy && (
                                                            <Badge variant="destructive" className="text-xs w-fit">
                                                                <XCircle className="h-3 w-3 mr-1"/>
                                                                Policy Missing
                                                            </Badge>
                                                        )}
                                                        {result.policy && result.isReadyForMigration && !result.isMigrated && (
                                                            <Badge variant="default" className="text-xs w-fit">
                                                                <CheckCircle2 className="h-3 w-3 mr-1"/>
                                                                Ready
                                                            </Badge>
                                                        )}
                                                        {result.isMigrated && (
                                                            <Badge variant="default"
                                                                   className="text-xs bg-green-100 text-green-800 w-fit">
                                                                <CheckCircle2 className="h-3 w-3 mr-1"/>
                                                                Migrated
                                                            </Badge>
                                                        )}
                                                        {/* Always show backup badge */}
                                                        {result.isBackedUp ? (
                                                            <Badge variant="default" className="text-xs bg-green-100 text-green-800 w-fit">
                                                                <Shield className="h-3 w-3 mr-1"/>
                                                                Backed Up
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs w-fit">
                                                                <Shield className="h-3 w-3 mr-1"/>
                                                                No Backup
                                                            </Badge>
                                                        )}

                                                        {result.policy && !result.isReadyForMigration && !result.isMigrated && (
                                                            <Badge variant="secondary" className="text-xs w-fit">
                                                                <AlertTriangle className="h-3 w-3 mr-1"/>
                                                                Not Ready
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary */}
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
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
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-3">Policy Name</th>
                                            <th className="text-left p-3">Group</th>
                                            <th className="text-left p-3">Action</th>
                                            <th className="text-left p-3">Validation Status</th>
                                            <th className="text-left p-3">Message</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {comparisonResults.filter(r => r.isMigrated).map((result, index) => (
                                            <tr key={result.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="p-3">
                                                    {result.policy ? (
                                                        <div className="max-w-xs truncate" title={result.policy.name}>
                                                            {result.policy.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-red-600">Policy not found</span>
                                                    )}
                                                </td>
                                                <td className="p-3">{result.csvRow?.GroupName || '-'}</td>
                                                <td className="p-3">
                                                    {result.csvRow?.AssignmentAction && (
                                                        <Badge variant={result.csvRow.AssignmentAction === 'Add' ? 'default' : 'secondary'}>
                                                            {result.csvRow.AssignmentAction}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {result.validationStatus === 'valid' && (
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
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
                                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Warning
                                                        </Badge>
                                                    )}
                                                    {result.validationStatus === 'pending' && (
                                                        <Badge variant="outline">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                        <span className="text-sm text-gray-600">
                                            {result.validationMessage || '-'}
                                        </span>
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
