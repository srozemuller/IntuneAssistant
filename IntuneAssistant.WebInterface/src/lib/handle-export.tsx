// src/lib/handle-export.tsx
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Papa from "papaparse";

interface TData {
    displayName: string;
    id: string;
    name: string;
    settingName: string;
    settingValue: string;
    childSettingInfo: { name: string, value: string }[];
}

const flattenObject = (obj: any, parentKey = '', res: any = {}) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const propName = parentKey ? `${parentKey}_${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                flattenObject(obj[key], propName, res);
            } else if (Array.isArray(obj[key])) {
                if (obj[key].length === 0) {
                    res[propName] = '[]';
                } else if (typeof obj[key][0] === 'object') {
                    res[propName] = obj[key].map((item: any) => `${item.name}: ${item.value}`).join('\n');
                } else {
                    res[propName] = JSON.stringify(obj[key]);
                }
            } else {
                res[propName] = obj[key];
            }
        }
    }
    return res;
};

const flattenData = (data: TData[]) => {
    return data.map(item => flattenObject(item));
};

export const handleExport = (rawData: string, table: any, exportOption: string, source: string) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row: any) => row.original.id);
    const parsedRawData = JSON.parse(rawData);

    const dataToExport = parsedRawData.filter((item: TData) =>
        selectedIds.includes(item.id)
    );

    const dataString = JSON.stringify(dataToExport, null, 2);
    const dataCount = dataToExport.length;
    if (dataCount === 0) {
        toast.error("No data to export.");
        return;
    }
    const rowString = dataCount === 1 ? "row" : "rows";

    if (exportOption === "backup") {
        const zip = new JSZip();
        dataToExport.forEach((item: TData, index: number) => {
            const fileName = `${item.displayName}.json`;
            const fileContent = JSON.stringify(item, null, 2);
            zip.file(fileName, fileContent);
        });

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, `${source}-backup.zip`);
            toast.success(`Zip file created and downloaded, selected ${dataCount} ${rowString}.`);
        }).catch((err) => {
            toast.error(`Failed to create zip file: ${err.message}`);
        });
    } else if (exportOption === "idpowertools") {
        const idPowerToolsData = { value: dataToExport };
        navigator.clipboard.writeText(JSON.stringify(idPowerToolsData)).then(() => {
            toast.success(`Data for IDPowerTools copied to clipboard, selected ${dataCount} ${rowString}.`);
        }).catch((err) => {
            toast.error(`Failed to copy data: ${err.message}`);
        });
    } else if (exportOption === "csv") {
        const flattenedData = flattenData(dataToExport);
        const csv = Papa.unparse(flattenedData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${source}-data.csv`);
        toast.success(`CSV file created and downloaded, selected ${dataCount} ${rowString}.`);
    }
};