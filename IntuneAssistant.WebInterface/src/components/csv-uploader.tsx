import React, { useState } from 'react';
import Papa from 'papaparse';

const CsvUploader: React.FC = () => {
    const [jsonData, setJsonData] = useState<any[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('File selected:', file);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    console.log('Parsed results:', results.data);
                    setJsonData(results.data);
                },
            });
        }
    };

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
    );
};

export default CsvUploader;