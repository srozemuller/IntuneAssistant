// components/AssignmentsTableSkeleton.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AssignmentsTableSkeletonProps {
    showStats?: boolean;
    statsCount?: number;
    showFilters?: boolean;
    tableRows?: number;
    tableColumns?: number;
}

export function AssignmentsTableSkeleton({
    showStats = true,
    statsCount = 4,
    showFilters = true,
    tableRows = 10,
    tableColumns = 8
}: AssignmentsTableSkeletonProps) {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Cards Skeleton */}
            {showStats && (
                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(statsCount, 4)} gap-4`}>
                    {[...Array(statsCount)].map((_, i) => (
                        <Card key={i} className="bg-white dark:bg-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3 flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                                    </div>
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters Section Skeleton */}
            {showFilters && (
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search Bar Skeleton */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>

            {/* Table Skeleton */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Table Header */}
                        <div className={`grid grid-cols-${tableColumns} gap-4 pb-3 border-b border-gray-200 dark:border-gray-700`}>
                            {[...Array(tableColumns)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>

                        {/* Table Rows */}
                        {[...Array(tableRows)].map((_, rowIndex) => (
                            <div key={rowIndex} className={`grid grid-cols-${tableColumns} gap-4 py-3 border-b border-gray-100 dark:border-gray-800`}>
                                {[...Array(tableColumns)].map((_, colIndex) => {
                                    // Vary the widths for more realistic look
                                    const widths = ['w-32', 'w-40', 'w-24', 'w-28', 'w-20', 'w-36', 'w-16', 'w-24'];
                                    const width = widths[colIndex % widths.length];

                                    // First column - make it look like a resource name
                                    if (colIndex === 0) {
                                        return (
                                            <div key={colIndex} className="space-y-1">
                                                <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${width}`}></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                            </div>
                                        );
                                    }

                                    // Some columns as badges
                                    if (colIndex === 1 || colIndex === 3 || colIndex === 4) {
                                        return (
                                            <div key={colIndex} className="flex items-center">
                                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                                            </div>
                                        );
                                    }

                                    // Regular cells
                                    return (
                                        <div key={colIndex} className="flex items-center">
                                            <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${width}`}></div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Pagination Skeleton */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
