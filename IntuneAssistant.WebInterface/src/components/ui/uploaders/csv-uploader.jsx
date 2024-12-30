import React, { useState } from 'react';
import Papa from 'papaparse';

const CsvUploader = () => {
    const [fileData, setFileData] = useState([]);
    const [error, setError] = useState(null);

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            parseCsv(file);
        }
    };

    // Handle drag-and-drop upload
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            parseCsv(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Parse CSV file
    const parseCsv = (file) => {
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setFileData(result.data);
                setError(null);
            },
            error: (err) => {
                setError(`Error parsing CSV: ${err.message}`);
            },
        });
    };

    return (
        <div className="upload-container">
            <h2>Upload Your CSV File</h2>
            <div
                className="file-drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <p>Drag and drop your CSV file here, or click to upload.</p>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-button">
                    Choose File
                </label>
            </div>
            {error && <p className="error">{error}</p>}
            {fileData.length > 0 && (
                <div className="file-preview">
                    <h3>Preview</h3>
                    <table>
                        <thead>
                        <tr>
                            {Object.keys(fileData[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {fileData.map((row, index) => (
                            <tr key={index}>
                                {Object.values(row).map((value, idx) => (
                                    <td key={idx}>{value}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CsvUploader;
