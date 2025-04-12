import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { CrossIcon, DeleteIcon, UploadCloudIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog.tsx";
import { Progress } from "@/components/ui/progress.tsx";

interface CsvUploaderProps {
    setRows: (rows: object[]) => void;
}

interface Metadata {
    [key: string]: string;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ setRows }) => {
    const [file, setFile] = useState<File | null>(null);
    const [conflictingRows, setConflictingRows] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [metadata, setMetadata] = useState<Metadata>({});

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setIsProcessing(true);
        setProcessingProgress(10); // Start with some initial progress
        toast('Uploading CSV file...');

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            // Check for metadata section
            const metadataSection = content.match(/^# METADATA\s+([\s\S]*?)(?=# DATA)/m);
            let parsedMetadata: Metadata = {};

            if (metadataSection && metadataSection[1]) {
                const metadataLines = metadataSection[1].trim().split('\n');
                const metadataHeader = metadataLines[0].split(';');

                for (let i = 1; i < metadataLines.length; i++) {
                    const values = metadataLines[i].split(';');
                    if (values.length >= 2) {
                        parsedMetadata[values[0]] = values[1];
                    }
                }
                setMetadata(parsedMetadata);
            }

            // Find the data section and parse it
            const dataMatch = content.match(/^# DATA\s+([\s\S]*)/m);
            if (dataMatch && dataMatch[1]) {
                const dataSection = dataMatch[1];

                Papa.parse(dataSection, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        handleParsedData(results.data as object[]);
                    },
                    error: (error) => {
                        toast.error(`Error parsing CSV data: ${error.message}`);
                        setIsProcessing(false);
                    }
                });
            } else {
                // If no specific sections found, parse the whole file as data
                Papa.parse(content, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        handleParsedData(results.data as object[]);
                    },
                    error: (error) => {
                        toast.error(`Error parsing CSV file: ${error.message}`);
                        setIsProcessing(false);
                    }
                });
            }
        };

        reader.readAsText(selectedFile);
    };

    const handleParsedData = (parsedData: object[]) => {
        setProcessingProgress(30); // Update progress after parsing

        // Check for required columns in the CSV file
        const requiredColumns = ["PolicyName", "GroupName", "AssignmentDirection", "AssignmentAction"];
        const headers = Object.keys(parsedData[0] || {});
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
            toast.error(`CSV file is missing required columns: ${missingColumns.join(", ")}`);
            setIsProcessing(false);
            return;
        }
        setProcessingProgress(50); // Update progress before conflict check

        setTimeout(() => {
            const conflicts = checkForConflicts(parsedData);
            setProcessingProgress(90); // Almost done

            setTimeout(() => {
                if (conflicts.length > 0) {
                    setConflictingRows(conflicts);
                    setIsDialogOpen(true);
                    toast.error('Conflicts found. Please review the conflicting rows.');
                } else {
                    setRows(parsedData);
                    toast.success('CSV file uploaded successfully!');
                }
                setProcessingProgress(100);
                setTimeout(() => setIsProcessing(false), 500); // Hide progress after a short delay
            }, 200);
        }, 200);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv')) {
                processFile(droppedFile);
            } else {
                toast.error('Please upload a CSV file');
            }
        }
    }, []);

    const checkForConflicts = (data: object[]) => {
        const conflicts: string[] = [];
        const seen: { [key: string]: { action: string, row: number, filterName?: string, filterType?: string } } = {};

        // Keep track of policies with All Users/Devices
        const policiesWithAllDevices = new Map<string, number>();
        const policiesWithAllUsers = new Map<string, number>();
        // Keep track of policies with specific groups
        const policiesWithSpecificGroups = new Map<string, number[]>();

        data.forEach((row: any, index: number) => {
            const key = `${row.PolicyName}-${row.GroupName}`;
            const filterKey = `${row.PolicyName}-${row.GroupName}-${row.FilterName || 'noFilter'}-${row.FilterType || 'noFilterType'}`;

            // Track policies with All Users/Devices
            if (row.GroupName?.toLowerCase() === "all devices") {
                policiesWithAllDevices.set(row.PolicyName, index);
            }

            if (row.GroupName?.toLowerCase() === "all users") {
                policiesWithAllUsers.set(row.PolicyName, index);
            }

            // Track policies with specific groups
            if (row.GroupName?.toLowerCase() !== "all devices" && row.GroupName?.toLowerCase() !== "all users") {
                if (!policiesWithSpecificGroups.has(row.PolicyName)) {
                    policiesWithSpecificGroups.set(row.PolicyName, []);
                }
                policiesWithSpecificGroups.get(row.PolicyName)?.push(index);
            }

            // Check for invalid "All Devices/Users" with exclude combinations
            if (row.GroupName?.toLowerCase() === "all devices" && row.AssignmentAction?.toLowerCase() === "exclude") {
                conflicts.push(`[Invalid assignment] - Row ${index + 1}: Cannot exclude "All Devices" for policy "${row.PolicyName}"`);
            }

            if (row.GroupName?.toLowerCase() === "all users" && row.AssignmentAction?.toLowerCase() === "exclude") {
                conflicts.push(`[Invalid assignment] - Row ${index + 1}: Cannot exclude "All Users" for policy "${row.PolicyName}"`);
            }

            // Check for conflicts based on policy name and assignment action
            if (seen[key] && seen[key].action !== row.AssignmentAction) {
                conflicts.push(`[Assignment action conflict] - Row ${index + 1}: Policy: ${row.PolicyName} with action '${row.AssignmentAction}' conflicts with Row ${seen[key].row + 1} with action '${seen[key].action}'`);
            }

            // Check for conflicts based on policy name, group name, and filter settings
            if (seen[filterKey] && (row.FilterName || row.FilterType)) {
                conflicts.push(`[Group conflict] - Row ${index + 1}: Policy: ${row.PolicyName}, Group: ${row.GroupName}, Filter: ${row.FilterName}, Type: ${row.FilterType} conflicts with Row ${seen[filterKey].row + 1}`);
            }
            if (seen[key] && (seen[key].filterName || seen[key].filterType) !== (row.FilterName || row.FilterType)) {
                conflicts.push(`[Filter conflict] - Row ${index + 1}: Policy: ${row.PolicyName}, Group: ${row.GroupName} conflicts with Row ${seen[key].row + 1} due to filter mismatch`);
            }

            // Store the current row in the seen object
            seen[filterKey] = { action: row.AssignmentAction, row: index, filterName: row.FilterName, filterType: row.FilterType };
            seen[key] = { action: row.AssignmentAction, row: index, filterName: row.FilterName, filterType: row.FilterType };
        });

        // Check for conflicts between All Devices/Users and specific groups for the same policy
        policiesWithSpecificGroups.forEach((specificGroupRows, policyName) => {
            // Check for All Devices conflict
            if (policiesWithAllDevices.has(policyName)) {
                const allDevicesRow = policiesWithAllDevices.get(policyName)!;
                specificGroupRows.forEach(specificGroupRow => {
                    conflicts.push(
                        `[Assignment conflict] - Row ${specificGroupRow + 1}: Policy: "${policyName}" has a specific group assignment that conflicts with "All Devices" assignment in Row ${allDevicesRow + 1}`
                    );
                });
            }

            // Check for All Users conflict
            if (policiesWithAllUsers.has(policyName)) {
                const allUsersRow = policiesWithAllUsers.get(policyName)!;
                specificGroupRows.forEach(specificGroupRow => {
                    conflicts.push(
                        `[Assignment conflict] - Row ${specificGroupRow + 1}: Policy: "${policyName}" has a specific group assignment that conflicts with "All Users" assignment in Row ${allUsersRow + 1}`
                    );
                });
            }
        });

        return conflicts;
    };

    const handleClearFile = () => {
        setFile(null);
        setRows([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileSelector = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div>
            <div
                className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFileSelector}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <UploadCloudIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-lg font-medium">
                        {file ? file.name : 'Drag & drop your CSV file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {file ? `${(file.size / 1024).toFixed(2)} KB` : 'or click to browse'}
                    </p>
                </div>
            </div>

            {file && (
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => handleClearFile()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Clear
                        <DeleteIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}

            {file && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => handleClearFile()}
                            className="h-8 px-2 lg:px-3"
                        >
                            Clear
                            <DeleteIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    {/* Display metadata if available */}
                    {Object.keys(metadata).length > 0 && (
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <h3 className="text-sm font-medium mb-2">Metadata</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(metadata).map(([key, value]) => (
                                    <div key={key} className="flex">
                                        <span className="text-xs font-medium text-gray-600 mr-2">{key}:</span>
                                        <span className="text-xs text-gray-800">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ToastContainer
                toastClassName={() =>
                    "bg-gray-500 text-white text-sm p-3 rounded-md shadow-md"
                }
                className={() => "text-sm"} // Changed from bodyClassName to className
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogTitle>Conflicting Rows</DialogTitle>
                    <DialogDescription>
                        The following rows have conflicts:
                        <ul>
                            {conflictingRows.map((conflict, index) => (
                                <li key={index}>- {conflict}</li>
                            ))}
                        </ul>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CsvUploader;