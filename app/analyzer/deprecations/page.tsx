'use client';
import React from 'react';
import { Hourglass } from 'lucide-react';
import { DeprecationRadarPanel } from '@/components/DeprecationRadarPanel';

/** Check > Tenant deprecations: what in this tenant Microsoft is about to stop supporting, and what depends on it. */
export default function TenantDeprecationsPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Hourglass className="h-6 w-6" /> Tenant deprecations</h1>
                <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
                    Groups and assignment filters in your tenant that use something Microsoft is retiring, the date it happens, and the policies, apps and Conditional Access policies that depend on them.
                </p>
            </div>
            <DeprecationRadarPanel />
        </div>
    );
}
