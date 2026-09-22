// components/AssignmentWarningIcon.tsx
'use client';

import React from 'react';
import { TriangleAlert } from 'lucide-react';

interface AssignmentWarningIconProps {
    warnings?: string[];
}

// Flags assignment integrity issues (e.g. a target group or filter that no longer exists in
// Entra/Intune) the same way across every assignments page - see IHasWarnings.Warnings on the API side.
export function AssignmentWarningIcon({ warnings }: AssignmentWarningIconProps) {
    const list = warnings ?? [];
    if (list.length === 0) {
        return null;
    }

    return (
        <span
            title={list.join('\n')}
            className="inline-flex shrink-0 items-center cursor-help ml-1"
        >
            <TriangleAlert className="h-3 w-3 text-amber-400 dark:text-amber-500" />
        </span>
    );
}
