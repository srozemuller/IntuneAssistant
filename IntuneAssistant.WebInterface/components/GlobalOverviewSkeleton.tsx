// components/GlobalOverviewSkeleton.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function GlobalOverviewSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-gray-800">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-gray-800">
                        <CardHeader>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Monitors Table Skeleton */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                        {/* Table Rows */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid grid-cols-5 gap-4 py-3">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
