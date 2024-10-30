import React from 'react';
import Papa from 'papaparse';
import {toast, Toaster} from "sonner";

interface CsvUploaderProps {
    setJsonString: (jsonString: string) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ setJsonString }) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast('Uploading CSV file...'); // Show toast message for upload start
            Papa.parse(file, {
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

    return (
        <div>
            <Toaster />
            <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
    );
};

export default CsvUploader;