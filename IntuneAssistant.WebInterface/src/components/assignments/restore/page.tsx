// src/components/assignments/restore/upload-page.tsx
import { useState, useEffect } from 'react';
import JSONUploader from '@/components/json-uploader.tsx';
import { z } from 'zod';
import { type policyRestoreModel, policyRestoreSchema } from '@/components/assignments/restore/schema';
import { DataTable } from '@/components/assignments/restore/data-table.tsx';
import { columns } from '@/components/assignments/restore/columns.tsx';
import {Toaster} from "sonner";

export default function UploadPage() {
    const [jsonString, setJsonString] = useState<string>('');
    const [data, setData] = useState<policyRestoreModel[]>([]);

    useEffect(() => {
        if (jsonString) {
            handleUploadSuccess();
        }
    }, [jsonString]);

    const handleUploadSuccess = () => {
        try {
            if (!jsonString) {
                throw new Error('JSON string is empty');
            }
            const parsedJson = JSON.parse(jsonString);
            if (!Array.isArray(parsedJson)) {
                throw new Error('Expected array, received object');
            }
            const parsedData: policyRestoreModel[] = z.array(policyRestoreSchema).parse(parsedJson);
            setData(parsedData);
            console.log('Uploaded Data:', parsedData);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };

    return (
        <div className="container max-w-[95%] py-6">
            <Toaster />
            <JSONUploader setJsonString={setJsonString} />
            {data.length > 0 && <DataTable columns={columns} data={data} />}
        </div>
    );
}