import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { CrossIcon, DeleteIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog.tsx";

interface CsvUploaderProps {
    setRows: (rows: object[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ setRows }) => {
    const [file, setFile] = useState<File | null>(null);
    const [conflictingRows, setConflictingRows] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            toast('Uploading CSV file...');
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data as object[];
                    const conflicts = checkForConflicts(parsedData);
                    if (conflicts.length > 0) {
                        setConflictingRows(conflicts);
                        setIsDialogOpen(true);
                        toast.error('Conflicts found. Please review the conflicting rows.');
                    } else {
                        setRows(parsedData);
                        toast.success('CSV file uploaded successfully!');
                    }
                },
                error: (error) => {
                    toast.error(`Error uploading CSV file: ${error.message}`);
                }
            });
        }
    };

    const checkForConflicts = (data: object[]) => {
        const conflicts: string[] = [];
        const seen: { [key: string]: { action: string, row: number, filterName?: string, filterType?: string } } = {};

        data.forEach((row: any, index: number) => {
            const key = `${row.PolicyName}-${row.GroupName}`;
            const filterKey = `${row.PolicyName}-${row.GroupName}-${row.FilterName || 'noFilter'}-${row.FilterType || 'noFilterType'}`;

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

        return conflicts;
    };

    const handleClearFile = () => {
        setFile(null);
        setRows([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="btn btn-secondary"
            />
            {file && (
                <Button
                    variant="ghost"
                    onClick={() => handleClearFile()}
                    className="h-8 px-2 lg:px-3"
                >
                    Clear
                    <DeleteIcon className="ml-2 h-4 w-4" />
                </Button>
            )}
            <ToastContainer
                toastClassName={() =>
                    "bg-gray-500 text-white text-sm p-3 rounded-md shadow-md"
                }
                bodyClassName={() => "text-sm"}
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