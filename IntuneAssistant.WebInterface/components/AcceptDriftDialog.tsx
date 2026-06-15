'use client';

import React, { useState, useRef } from 'react';
import { ShieldCheck, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApiRequest } from '@/hooks/useApiRequest';
import { MONITOR_CONFIGURATION_DRIFT_ACCEPT_ENDPOINT } from '@/lib/constants';
import { toast } from 'sonner';

export interface DriftedProperty {
    propertyName: string;
    currentValue: unknown;
    desiredValue: unknown;
}

export interface ConfigurationDrift {
    id: string;
    monitorId: string;
    tenantId: string;
    resourceType: string;
    baselineResourceDisplayName: string;
    firstReportedDateTime: string;
    status: 'active' | 'resolved' | string;
    resourceInstanceIdentifier: Record<string, unknown>;
    driftedProperties: DriftedProperty[];
}

interface AcceptDriftDialogProps {
    drift: ConfigurationDrift | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const MAX_JUSTIFICATION = 500;
const MIN_JUSTIFICATION = 10;

function formatValue(value: unknown): React.ReactNode {
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span className="text-gray-400 italic text-xs">empty list</span>;
        }
        return (
            <div className="flex flex-wrap gap-1">
                {(value as unknown[]).map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-mono">
                        {String(item)}
                    </Badge>
                ))}
            </div>
        );
    }
    if (value === null || value === undefined) {
        return <span className="text-gray-400 italic text-xs">null</span>;
    }
    if (typeof value === 'object') {
        return <code className="text-xs font-mono break-all">{JSON.stringify(value)}</code>;
    }
    return <span className="font-mono text-xs break-all">{String(value)}</span>;
}

function resourceTypeBadgeLabel(resourceType: string): string {
    const map: Record<string, string> = {
        'microsoft.entra.group': 'Entra Group',
        'microsoft.graph.group': 'Entra Group',
        'microsoft.intune.deviceconfiguration': 'Device Config',
        'microsoft.intune.configurationpolicy': 'Config Policy',
    };
    return map[resourceType.toLowerCase()] ?? resourceType;
}

export function AcceptDriftDialog({ drift, open, onOpenChange, onSuccess }: AcceptDriftDialogProps) {
    const { request } = useApiRequest();
    const requestRef = useRef(request);
    React.useEffect(() => { requestRef.current = request; }, [request]);

    const [justification, setJustification] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        if (submitting) return;
        setJustification('');
        setError(null);
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!drift || justification.trim().length < MIN_JUSTIFICATION) return;

        setSubmitting(true);
        setError(null);

        try {
            await requestRef.current(
                MONITOR_CONFIGURATION_DRIFT_ACCEPT_ENDPOINT(drift.id),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ justification: justification.trim() }),
                }
            );

            toast.success('Baseline updated — drift accepted successfully');
            setJustification('');
            setError(null);
            onOpenChange(false);
            onSuccess();
        } catch (e: unknown) {
            const err = e as Error & { data?: { details?: string[]; message?: string } };
            const message =
                err?.data?.details?.[0] ??
                err?.data?.message ??
                err?.message ??
                'Network error — please check your connection and try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const trimmed = justification.trim().length;
    const isValid = trimmed >= MIN_JUSTIFICATION;
    const showCharWarning = justification.length > 0 && !isValid;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-amber-500" />
                        Accept Drift
                    </DialogTitle>
                    <DialogDescription>
                        This will update the baseline to reflect the current state. The change will be
                        recorded in the audit log.
                    </DialogDescription>
                </DialogHeader>

                {drift && (
                    <div className="space-y-5">
                        {/* Resource summary banner */}
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                    {drift.baselineResourceDisplayName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {resourceTypeBadgeLabel(drift.resourceType)}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {drift.driftedProperties.length}{' '}
                                {drift.driftedProperties.length === 1 ? 'property' : 'properties'} will
                                be updated in the baseline
                            </p>
                        </div>

                        {/* Property diffs */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Property Changes
                            </h4>
                            {drift.driftedProperties.map((prop, idx) => (
                                <div
                                    key={idx}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3 bg-white dark:bg-gray-800"
                                >
                                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                        {prop.propertyName}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-start">
                                        {/* Desired (baseline — will be replaced) */}
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Desired (baseline)
                                            </p>
                                            <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded min-h-[2rem]">
                                                {formatValue(prop.desiredValue)}
                                            </div>
                                        </div>
                                        {/* Arrow */}
                                        <div className="flex items-center justify-center pt-5">
                                            <ArrowRight className="h-4 w-4 text-amber-500" />
                                        </div>
                                        {/* Current (actual — becomes new baseline) */}
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                                Current (actual) → new baseline
                                            </p>
                                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded min-h-[2rem]">
                                                {formatValue(prop.currentValue)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* Justification */}
                        <div className="space-y-2">
                            <Label htmlFor="accept-drift-justification" className="text-sm font-medium">
                                Justification{' '}
                                <span className="text-red-500" aria-hidden>*</span>
                            </Label>
                            <Textarea
                                id="accept-drift-justification"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Describe why this drift is being accepted as the new desired state..."
                                maxLength={MAX_JUSTIFICATION}
                                rows={4}
                                disabled={submitting}
                                className={showCharWarning ? 'border-red-400 focus-visible:ring-red-400' : ''}
                            />
                            <div className="flex items-center justify-between text-xs">
                                {showCharWarning ? (
                                    <span className="text-red-500">
                                        Justification is required (min {MIN_JUSTIFICATION} characters)
                                    </span>
                                ) : (
                                    <span className="text-gray-400">Min {MIN_JUSTIFICATION} characters</span>
                                )}
                                <span
                                    className={
                                        justification.length >= MAX_JUSTIFICATION
                                            ? 'text-red-500'
                                            : 'text-gray-400'
                                    }
                                >
                                    {justification.length} / {MAX_JUSTIFICATION}
                                </span>
                            </div>
                        </div>

                        {/* Inline error */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 pt-2">
                    <Button variant="outline" onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Accepting…
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Accept Drift
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

