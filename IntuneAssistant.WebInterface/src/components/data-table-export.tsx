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

interface ExportButtonProps {
    data: string | any[];
    fileName?: string;
}

export function DataTableExport({
                                    data,
                                    fileName = "exported-data",
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
                <Button variant="outline" size="sm" className="h-8 gap-1">
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
                    Export to JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToHTML}>
                    Export to HTML
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}