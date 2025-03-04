// src/components/data-table-refresh.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DataTableRefreshProps {
    fetchData: () => Promise<void>;
    resourceName?: string;
}

export function DataTableRefresh({
                                     fetchData,
                                     resourceName = "data"
                                 }: DataTableRefreshProps) {
    const handleRefresh = () => {
        toast.promise(fetchData(), {
            loading: `Searching for ${resourceName}...`,
            success: `${resourceName} fetched successfully`,
            error: (err) => `Failed to get ${resourceName} because: ${err.message}`,
        });
    };

    return (
        <Button
            variant="outline"
            onClick={handleRefresh}
            size="sm"
            className="h-8 gap-1"
        >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
        </Button>
    );
}