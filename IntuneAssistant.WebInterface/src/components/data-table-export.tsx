import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import JSZip from 'jszip';

interface ExportButtonProps {
    data: string | any[];
    fileName?: string;
    rawData?: any[]; // Add rawData prop for original data objects
    selectedRows?: any[]; // Add selectedRows for ids that are selected
    disabled?: boolean;
    sessionData?: any;
}

interface User {
    id: string;
    displayName: string;
    userType: string;
    [key: string]: any; // For other properties
}

interface Group {
    id: string;
    displayName: string;
    [key: string]: any; // For other properties
}

export function DataTableExport({
                                    data,
                                    fileName = "exported-data",
                                    rawData = [],
                                    selectedRows = [],
                                    disabled = false,
                                    sessionData = null,
                                }: ExportButtonProps) {
    // Parse data if it's a string
    const parseData = (): any[] => {
        if (typeof data === "string") {
            try {
                return JSON.parse(data).data || JSON.parse(data);
            } catch (e) {
                console.error("Failed to parse data:", e);
                return [];
            }
        }
        return Array.isArray(data) ? data : [];
    };

    const exportToCSV = () => {
        const parsedData = parseData();
        if (!parsedData.length) {
            console.error("No data to export");
            return;
        }

        try {
            const csv = Papa.unparse(parsedData);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, `${fileName}.csv`);
        } catch (err) {
            console.error("CSV export failed:", err);
        }
    };

    const exportToJSON = () => {
        const parsedData = parseData();
        if (!parsedData.length) return;

        const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: "application/json" });
        saveAs(blob, `${fileName}.json`);
    };

    const exportSelectedAsIndividualJSONFiles = () => {
        if (!rawData.length || !selectedRows.length) {
            console.error("No data to export or no rows selected");
            return;
        }

        // Find the original raw data objects that match the selected rows
        const selectedIds = selectedRows.map(row => row.id);
        const selectedData = rawData.filter(item => selectedIds.includes(item.id));

        // Extract domain from sessionStorage
        let domain = "";
        try {
            const sessionDataStr = sessionStorage.getItem('accountInfo');

            if (sessionDataStr) {
                const parsedSessionData = JSON.parse(sessionDataStr);

                // Check if username exists directly in parsedSessionData or in accountInfo
                const username = parsedSessionData.username ||
                    (parsedSessionData.accountInfo && parsedSessionData.accountInfo.username);

                if (username) {
                    console.log("session username:", username);
                    // Extract domain from email (everything after @)
                    const domainMatch = username.match(/@(.+)$/);
                    if (domainMatch && domainMatch[1]) {
                        domain = domainMatch[1];
                        console.log("Extracted domain:", domain);
                    } else {
                        // If no @ symbol found, use the username as is
                        console.log("No domain found in username, using as is");
                        domain = username;
                    }
                }
            }
        } catch (error) {
            console.error("Error reading from sessionStorage:", error);
        }


        // Add domain to folder name if available
        const folderName = domain ? `${domain}-${fileName}-json-files` : `${fileName}-json-files`;

        // Create a new zip file
        const zip = new JSZip();
        // Create a folder in the zip
        const folder = zip.folder(folderName);

        // Export each selected item as a separate JSON file with simplified readable arrays
        selectedData.forEach(item => {
            // Create a deep copy to avoid modifying the original data
            const cleanedItem = JSON.parse(JSON.stringify(item));

            // Simplify the readable arrays by removing detailed user objects
            if (cleanedItem.conditions?.users?.includeUsersReadable) {
                cleanedItem.conditions.users.includeUsersReadable =
                    cleanedItem.conditions.users.includeUsersReadable.map((user: User) => ({
                        id: user.id,
                        displayName: user.displayName,
                        userType: user.userType
                    }));
            }

            if (cleanedItem.conditions?.users?.excludeUsersReadable) {
                cleanedItem.conditions.users.excludeUsersReadable =
                    cleanedItem.conditions.users.excludeUsersReadable.map((user: User) => ({
                        id: user.id,
                        displayName: user.displayName,
                        userType: user.userType
                    }));
            }

            if (cleanedItem.conditions?.users?.includeGroupsReadable) {
                cleanedItem.conditions.users.includeGroupsReadable =
                    cleanedItem.conditions.users.includeGroupsReadable.map((group : Group) => ({
                        id: group.id,
                        displayName: group.displayName
                    }));
            }

            if (cleanedItem.conditions?.users?.excludeGroupsReadable) {
                cleanedItem.conditions.users.excludeGroupsReadable =
                    cleanedItem.conditions.users.excludeGroupsReadable.map((group : Group) => ({
                        id: group.id,
                        displayName: group.displayName
                    }));
            }

            const itemFileName = `${item.displayName || item.id}`;
            const sanitizedFileName = itemFileName.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 100);
            const folder = zip.folder(folderName);
            // Add file to the folder in the zip
            if (folder) {
                // Export each selected item as a separate JSON file
                selectedData.forEach(item => {
                    // ...existing code...
                    folder.file(`${sanitizedFileName}.json`, JSON.stringify(cleanedItem, null, 2));
                });
            }

        });
        const zipFileName = domain ? `${domain}-${fileName}-json-files.zip` : `${fileName}-json-files.zip`;
        // Generate the zip file and save it with the domain-prefixed name
        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                saveAs(content, zipFileName);
            });
    };

    const exportToHTML = () => {
        const parsedData = parseData();
        if (!parsedData.length) return;

        const headers = Object.keys(parsedData[0]);

        let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${fileName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8f8f8; }
      </style>
    </head>
    <body>
      <h1>${fileName}</h1>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${parsedData.map(row => `
            <tr>
              ${headers.map(header => `<td>${row[header] ?? ""}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
    `;

        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
        saveAs(blob, `${fileName}.html`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1" disabled={disabled}>
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV}>
                    Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                    Export to JSON (Combined)
                </DropdownMenuItem>
                {selectedRows.length > 0 && (
                    <DropdownMenuItem onClick={exportSelectedAsIndividualJSONFiles}>
                        Export Selected as Individual JSON Files
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={exportToHTML}>
                    Export to HTML
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}