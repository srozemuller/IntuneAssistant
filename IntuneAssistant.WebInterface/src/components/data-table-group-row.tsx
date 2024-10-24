// src/components/data-table-group-row.tsx
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { TriangleAlert } from "lucide-react";

interface Assignment {
    id: string;
    sourceId: string;
    target: {
        "@odata.type": string;
        deviceAndAppManagementAssignmentFilterId: string | null;
        deviceAndAppManagementAssignmentFilterType: string;
        groupId: string;
    };
}

interface GroupedRowProps {
    assignments: Assignment[];
}

const GroupedRow: React.FC<GroupedRowProps> = ({ assignments }) => {
    if (!assignments || assignments.length === 0) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex w-[100px] items-center">
                            <TriangleAlert className={`h-5 w-5 text-orange-500`} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>No assignments, is migration needed?</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div>
            {assignments.map((assignment, index) => (
                <span
                    key={assignment.id}
                    className='text-primary'
                >
                    {assignment.target.groupId}
                    {index < assignments.length - 1 && ', '}
                </span>
            ))}
        </div>
    );
};

export { GroupedRow };