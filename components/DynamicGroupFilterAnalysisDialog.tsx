'use client';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApiRequest } from '@/hooks/useApiRequest';
import { ASSIGNMENTS_GROUP_FILTER_ANALYSIS_ENDPOINT } from '@/lib/constants';
import type { DynamicGroupFilterAnalysis, FilterConvertibility } from '@/types/dynamicGroupFilterAnalysis';

interface Props {
    groupId: string;
    groupDisplayName: string;
    policyPlatform?: string;
    isOpen: boolean;
    onClose: () => void;
    preloadedAnalysis?: DynamicGroupFilterAnalysis;
}

const convertibilityBadge: Record<FilterConvertibility, { label: string; className: string }> = {
    NotDynamic: { label: 'Not Dynamic', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    NoMappableProperties: { label: 'Not Convertible', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    PartialConvertible: { label: 'Partially Convertible', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    FullyConvertible: { label: 'Fully Convertible', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
};

export function DynamicGroupFilterAnalysisDialog({ groupId, groupDisplayName, policyPlatform, isOpen, onClose, preloadedAnalysis }: Props) {
    const { request } = useApiRequest();
    const [fetched, setFetched] = useState<DynamicGroupFilterAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use preloaded data if available; only fetch when not preloaded
    const analysis = preloadedAnalysis ?? fetched;

    useEffect(() => {
        if (!isOpen || !groupId || preloadedAnalysis) return;
        setFetched(null);
        setError(null);
        setLoading(true);

        const params = policyPlatform ? `?platform=${encodeURIComponent(policyPlatform)}` : '';
        request(`${ASSIGNMENTS_GROUP_FILTER_ANALYSIS_ENDPOINT}/${groupId}/filter-analysis${params}`)
            .then((res) => setFetched(((res as { data: { data: DynamicGroupFilterAnalysis } }).data?.data) ?? (res as { data: DynamicGroupFilterAnalysis }).data))
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
    }, [isOpen, groupId, policyPlatform, preloadedAnalysis]);

    const badge = analysis ? convertibilityBadge[analysis.filterConvertibility] : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assignment Filter Analysis</DialogTitle>
                    <DialogDescription>
                        Dynamic group: <span className="font-medium">{groupDisplayName}</span>
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                        <span className="animate-spin">⟳</span> Analyzing group rule…
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                {analysis && !loading && (
                    <div className="space-y-4 text-sm">
                        {/* Convertibility status */}
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Filter convertibility:</span>
                            {badge && (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                                    {badge.label}
                                </span>
                            )}
                        </div>

                        {/* Membership rule */}
                        {analysis.membershipRule && (
                            <div>
                                <p className="font-medium mb-1 text-muted-foreground">Group membership rule</p>
                                <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
                                    {analysis.membershipRule}
                                </code>
                            </div>
                        )}

                        {/* Suggested filter rule */}
                        {analysis.suggestedFilterRule && (
                            <div>
                                <p className="font-medium mb-1 text-muted-foreground">Suggested assignment filter rule</p>
                                <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
                                    {analysis.suggestedFilterRule}
                                </code>
                            </div>
                        )}

                        {/* Unmappable properties */}
                        {(analysis.unmappableProperties?.length ?? 0) > 0 && (
                            <div>
                                <p className="font-medium mb-1 text-muted-foreground">Properties that cannot be converted</p>
                                <ul className="list-disc list-inside space-y-0.5 text-yellow-700 dark:text-yellow-400">
                                    {(analysis.unmappableProperties ?? []).map((p) => (
                                        <li key={p} className="text-xs">{p}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Existing matching filters */}
                        {(analysis.matchingExistingFilters?.length ?? 0) > 0 && (
                            <div>
                                <p className="font-medium mb-2 text-muted-foreground">Matching existing filters</p>
                                <div className="space-y-2">
                                    {(analysis.matchingExistingFilters ?? []).map((f) => (
                                        <div key={f.id} className="rounded border p-3 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-sm">{f.displayName}</span>
                                                <Badge variant={f.matchType === 'Exact' ? 'default' : 'secondary'} className="text-xs shrink-0">
                                                    {f.matchType} match
                                                </Badge>
                                            </div>
                                            {f.platform && (
                                                <p className="text-xs text-muted-foreground">Platform: {f.platform}</p>
                                            )}
                                            {f.rule && (
                                                <code className="block text-xs text-muted-foreground break-all">{f.rule}</code>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes (only when fetched from single-group endpoint) */}
                        {(analysis.notes?.length ?? 0) > 0 && (
                            <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 space-y-1">
                                {(analysis.notes ?? []).map((note, i) => (
                                    <p key={i} className="text-xs text-blue-700 dark:text-blue-300">{note}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
