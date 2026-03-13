// components/MonitorsListSkeleton.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MonitorsListSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                            <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-7 gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                        {/* Table Rows */}
                        {[...Array(8)].map((_, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-7 gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
                                {/* Monitor Name with Description */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                                </div>
                                {/* Status Badge */}
                                <div className="flex items-center">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                                </div>
                                {/* Drifts Badge */}
                                <div className="flex items-center">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                                </div>
                                {/* Last Run */}
                                <div className="space-y-2">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                </div>
                                {/* Frequency */}
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                </div>
                                {/* Created */}
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
