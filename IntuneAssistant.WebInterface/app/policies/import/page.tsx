'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    RefreshCw,
    Settings,
    Clock
} from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
    IMPORT_ENDPOINT
} from '@/lib/constants';
interface PolicyFile extends Record<string, unknown> {
    id: string;
    file: File;
    name: string;
    displayName?: string;
    description?: string;
    platforms?: string;
    settingCount?: number;
    content: PolicyContent | null;
    isValid: boolean;
    validationError?: string;
}


interface PolicyContent {
    name?: string;
    displayName?: string;
    description?: string;
    platforms?: string;
    settingCount?: number;
    settings?: unknown[];
    '@odata.type'?: string;
    [key: string]: unknown;
}

interface ImportResultData {
    '@odata.context'?: string;
    id?: string;
    name?: string;
    description?: string;
    platforms?: string;
    technologies?: string;
    createdDateTime?: string;
    lastModifiedDateTime?: string;
    settingCount?: number;
    creationSource?: string | null;
    roleScopeTagIds?: string[];
    priorityMetaData?: unknown;
    templateReference?: {
        templateId: string;
        templateFamily: string;
        templateDisplayName?: string; // Changed from string | null to optional string
        templateDisplayVersion?: string; // Changed from string | null to optional string
    };
    [key: string]: unknown;
}

interface ImportResult extends Record<string, unknown> {
    index: number;
    policyName: string;
    endpoint: string;
    success: boolean;
    data?: ImportResultData;
    createdId?: string;
    error?: string;
}

interface ImportResponse {
    message: string;
    details: string;
    data: {
        results: ImportResult[];
        successCount: number;
        failureCount: number;
        processedCount: number;
        processingTime: string;
    };
    status: number;
}

export default function PolicyImportPage() {
    const { request } = useApiRequest();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedFiles, setUploadedFiles] = useState<PolicyFile[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState<ImportResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [importSummary, setImportSummary] = useState<{
        successCount: number;
        failureCount: number;
        processedCount: number;
        processingTime: string;
        message: string;
    } | null>(null);

    const validatePolicyFile = (content: PolicyContent | null): { isValid: boolean; error?: string } => {
        try {
            if (!content) {
                return { isValid: false, error: 'Empty or invalid content' };
            }

            // Check if it's a valid policy JSON structure
            if (!content.name && !content.displayName) {
                return { isValid: false, error: 'Policy must have a name or displayName' };
            }

            if (!content.platforms && !content['@odata.type']) {
                return { isValid: false, error: 'Policy must specify platforms or @odata.type' };
            }

            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: 'Invalid JSON structure' };
        }
    };


    const handleFileUpload = useCallback((files: FileList) => {
        Array.from(files).forEach(file => {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content: PolicyContent = JSON.parse(e.target?.result as string);
                        const validation = validatePolicyFile(content);

                        const policyFile: PolicyFile = {
                            id: `${file.name}-${Date.now()}-${Math.random()}`,
                            file,
                            name: file.name,
                            displayName: content.name || content.displayName || file.name,
                            description: content.description || 'No description available',
                            platforms: content.platforms || 'Unknown',
                            settingCount: content.settingCount || content.settings?.length || 0,
                            content,
                            isValid: validation.isValid,
                            validationError: validation.error
                        };

                        setUploadedFiles(prev => [...prev, policyFile]);
                    } catch (error) {
                        console.error('Failed to parse JSON file:', file.name, error);
                        const policyFile: PolicyFile = {
                            id: `${file.name}-${Date.now()}-${Math.random()}`,
                            file,
                            name: file.name,
                            displayName: file.name,
                            description: 'Failed to parse JSON',
                            platforms: 'Unknown',
                            content: null,
                            isValid: false,
                            validationError: 'Invalid JSON format'
                        };
                        setUploadedFiles(prev => [...prev, policyFile]);
                    }
                };
                reader.readAsText(file);
            }
        });
    }, []);


    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        handleFileUpload(files);
    }, [handleFileUpload]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            handleFileUpload(files);
        }
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        setSelectedFiles(prev => prev.filter(id => id !== fileId));
    };

    const clearAllFiles = () => {
        setUploadedFiles([]);
        setSelectedFiles([]);
        setImportResults([]);
        setShowResults(false);
        setImportSummary(null);
    };

    const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

    const handleRowClick = (row: Record<string, unknown>, index: number, event?: React.MouseEvent) => {
        const fileId = row.id as string;

        if (event?.shiftKey && lastClickedIndex !== null) {
            // Shift-click for range selection
            const startIndex = Math.min(lastClickedIndex, index);
            const endIndex = Math.max(lastClickedIndex, index);
            const rangeIds = uploadedFiles.slice(startIndex, endIndex + 1).map(f => f.id);

            if (selectedFiles.includes(fileId)) {
                setSelectedFiles(prev => prev.filter(id => !rangeIds.includes(id)));
            } else {
                setSelectedFiles(prev => [...new Set([...prev, ...rangeIds])]);
            }
        } else {
            // Normal click - toggle single selection
            setSelectedFiles(prev =>
                prev.includes(fileId)
                    ? prev.filter(id => id !== fileId)
                    : [...prev, fileId]
            );
        }

        setLastClickedIndex(index);
    };

    const handleImport = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to import');
            return;
        }

        const selectedPolicies = uploadedFiles.filter(f => selectedFiles.includes(f.id));
        const invalidPolicies = selectedPolicies.filter(f => !f.isValid);

        if (invalidPolicies.length > 0) {
            if (!confirm(`${invalidPolicies.length} selected policies have validation errors. Continue anyway?`)) {
                return;
            }
        }

        setImporting(true);
        try {
            const policyContents = selectedPolicies.map(f => f.content);

            const response = await request<ImportResponse>(
                `${IMPORT_ENDPOINT}/policies/bulk`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(policyContents)
                }
            );

            if (!response) {
                throw new Error('No response received from API');
            }

            setImportResults(response.data.results);
            setImportSummary({
                successCount: response.data.successCount,
                failureCount: response.data.failureCount,
                processedCount: response.data.processedCount,
                processingTime: response.data.processingTime,
                message: response.message
            });
            setShowResults(true);
        } catch (error) {
            console.error('Import failed:', error);
            alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setImporting(false);
        }
    };

    const columns = [
        {
            key: 'displayName',
            label: 'Policy Name',
            width: 300,
            minWidth: 200,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policyFile = row as unknown as PolicyFile;
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-foreground">
                            {String(value)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {policyFile.name}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'description',
            label: 'Description',
            width: 400,
            minWidth: 300,
            render: (value: unknown) => {
                const desc = String(value);
                const maxLength = 150;
                const truncated = desc.length > maxLength ? `${desc.slice(0, maxLength)}...` : desc;

                return (
                    <div
                        className="text-sm text-muted-foreground"
                        title={desc}
                    >
                        {truncated}
                    </div>
                );
            }
        },
        {
            key: 'platforms',
            label: 'Platform',
            width: 120,
            minWidth: 100,
            render: (value: unknown) => {
                const platform = String(value);
                const getPlatformColor = (platform: string) => {
                    switch (platform.toLowerCase()) {
                        case 'windows10': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                        case 'android': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                        case 'ios': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                        case 'macos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                    }
                };

                return (
                    <Badge className={`text-xs ${getPlatformColor(platform)}`}>
                        {platform}
                    </Badge>
                );
            }
        },
        {
            key: 'settingCount',
            label: 'Settings',
            width: 100,
            minWidth: 80,
            render: (value: unknown) => (
                <span className="text-sm text-muted-foreground">
                    {String(value || 0)}
                </span>
            )
        },
        {
            key: 'isValid',
            label: 'Status',
            width: 120,
            minWidth: 100,
            render: (value: unknown, row: Record<string, unknown>) => {
                const policyFile = row as unknown as PolicyFile;
                const isValid = Boolean(value);

                return (
                    <div className="flex items-center gap-2">
                        {isValid ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-600 dark:text-green-400">Valid</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span
                                    className="text-xs text-red-600 dark:text-red-400 cursor-help"
                                    title={policyFile.validationError || undefined} // Fixed null handling
                                >
                            Invalid
                        </span>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            width: 80,
            minWidth: 60,
            sortable: false,
            render: (_: unknown, row: Record<string, unknown>) => {
                const policyFile = row as unknown as PolicyFile;

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFile(policyFile.id);
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                );
            }
        }
    ];

    const resultsColumns = [
        {
            key: 'policyName',
            label: 'Policy Name',
            width: 300,
            minWidth: 200
        },
        {
            key: 'endpoint',
            label: 'Endpoint',
            width: 250,
            minWidth: 200
        },
        {
            key: 'success',
            label: 'Status',
            width: 120,
            minWidth: 100,
            render: (value: unknown, row: Record<string, unknown>) => {
                const result = row as unknown as ImportResult;
                const success = Boolean(value);

                return (
                    <div className="flex items-center gap-2">
                        {success ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-600 dark:text-green-400">Success</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span
                                    className="text-xs text-red-600 dark:text-red-400 cursor-help"
                                    title={result.error || undefined} // Fixed null handling
                                >
                            Failed
                        </span>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'createdId',
            label: 'Created ID',
            width: 200,
            minWidth: 150,
            render: (value: unknown) => {
                if (!value) return <span className="text-muted-foreground">-</span>;
                return (
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                        {String(value)}
                    </code>
                );
            }
        },
        {
            key: 'error',
            label: 'Error',
            width: 300,
            minWidth: 200,
            render: (value: unknown) => {
                if (!value) return <span className="text-muted-foreground">-</span>;
                return (
                    <div className="text-xs text-red-600 dark:text-red-400">
                        {String(value)}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6 w-full max-w-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Import Policies</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload and import Intune policy JSON files
                    </p>
                </div>
            </div>

            {/* File Upload Area */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Policy Files
                    </CardTitle>
                    <CardDescription>
                        Select or drag and drop JSON policy files to upload. Only .json files are accepted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">Drop JSON files here</p>
                        <p className="text-muted-foreground mb-4">or click to browse</p>
                        <Button onClick={() => fileInputRef.current?.click()}>
                            Browse Files
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".json,application/json"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Uploaded Files ({uploadedFiles.length})
                                </CardTitle>
                                <Button variant="outline" size="sm" onClick={clearAllFiles}>
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            </div>
                            {selectedFiles.length > 0 && (
                                <CardDescription>
                                    {selectedFiles.length} files selected for import
                                </CardDescription>
                            )}
                        </CardHeader>
                    </Card>

                    {/* Bulk Actions */}
                    {selectedFiles.length > 0 && (
                        <Card className="shadow-sm border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                            <CardContent className="py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            {selectedFiles.length} files selected
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedFiles([])}
                                            className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-800"
                                        >
                                            Clear Selection
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleImport}
                                        disabled={importing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {importing ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-1" />
                                                Import Selected ({selectedFiles.length})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <DataTable
                        data={uploadedFiles}
                        columns={columns}
                        onRowClick={handleRowClick}
                        selectedRows={selectedFiles}
                        onSelectionChange={setSelectedFiles}
                        showPagination={true}
                        showSearch={true}
                        searchPlaceholder="Search policy files..."
                        className="shadow-sm"
                    />
                </>
            )}

            {/* Import Results Dialog */}
            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent className="!w-[95vw] !max-w-[95vw] h-[80vh] max-h-none overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Import Results
                        </DialogTitle>
                        <DialogDescription>
                            Review the results of your policy import operation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                        {/* Summary */}
                        {importSummary && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {importSummary.successCount}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Successful</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {importSummary.failureCount}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Failed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {importSummary.processedCount}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Processed</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                                                <Clock className="h-5 w-5" />
                                                {importSummary.processingTime}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Processing Time</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                {importSummary.message}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Results Table */}
                        <div className="flex-1 overflow-hidden">
                            <DataTable
                                data={importResults}
                                columns={resultsColumns}
                                showPagination={true}
                                showSearch={true}
                                searchPlaceholder="Search import results..."
                                className="shadow-sm h-full"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
