import React from 'react';
import Papa from 'papaparse';

interface CsvUploaderProps {
    setJsonString: (jsonString: string) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ setJsonString }) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const jsonString = JSON.stringify(results.data);
                    setJsonString(jsonString);
                },
            });
        }
    };

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
    );
};

export default CsvUploader;