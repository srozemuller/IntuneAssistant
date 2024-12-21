import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { toast, Toaster } from "sonner";
import {CrossIcon, DeleteIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
interface CsvUploaderProps {
    setJsonString: (jsonString: string) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ setJsonString }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            toast('Uploading CSV file...'); // Show toast message for upload start
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const jsonString = JSON.stringify(results.data);
                    setJsonString(jsonString);
                    toast.success('CSV file uploaded successfully!'); // Show success toast message
                },
                error: (error) => {
                    toast.error(`Error uploading CSV file: ${error.message}`); // Show error toast message
                }
            });
        }
    };

    const handleClearFile = () => {
        setFile(null);
        setJsonString('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast('File cleared');
    };

    return (
        <div>
            <Toaster />
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
        </div>
    );
};

export default CsvUploader;