// src/components/json-uploader.tsx
import React, { type ChangeEvent } from 'react';

interface JSONUploaderProps {
    setJsonString: (jsonString: string) => void;
}

const JSONUploader: React.FC<JSONUploaderProps> = ({ setJsonString }) => {
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const readers = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                readers.push(
                    new Promise<any>((resolve, reject) => {
                        reader.onload = (e) => {
                            try {
                                const json = JSON.parse(e.target?.result as string);
                                resolve(json);
                            } catch (error) {
                                reject(error);
                            }
                        };
                        reader.onerror = reject;
                        reader.readAsText(file);
                    })
                );
            }
            try {
                const jsonObjects = await Promise.all(readers);
                const combinedJsonArrayString = JSON.stringify(jsonObjects, null, 2);
                setJsonString(combinedJsonArrayString);
                console.log('Combined JSON Array String:', combinedJsonArrayString); // Log the combined JSON array string to the console
                return combinedJsonArrayString; // Return the combined JSON array string
            } catch (error) {
                console.error('Error reading files:', error);
            }
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".json"
                multiple
                onChange={handleFileChange}
            />
        </div>
    );
};

export default JSONUploader;