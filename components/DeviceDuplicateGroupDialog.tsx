'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Copy } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApiRequest } from '@/hooks/useApiRequest';
import { DEVICES_DUPLICATE_GROUP_ENDPOINT } from '@/lib/constants';

export interface DeviceDuplicate {
    id: string;
    deviceName: string;
    userDisplayName: string;
    userPrincipalName: string;
    operatingSystem: string;
    osVersion: string;
    complianceState: string;
    managementState: string;
    enrolledDateTime: string | null;
    lastSyncDateTime: string | null;
    serialNumber: string;
    wiFiMacAddress: string;
    azureAdDeviceId: string;
    isDuplicate: boolean;
    duplicateGroupId: string | null;
    matchedOn: string[];
}

interface DeviceDuplicateGroup {
    groupId: string;
    matchedOn: string[];
    devices: DeviceDuplicate[];
}

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

interface DeviceDuplicateGroupDialogProps {
    groupId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClosed: () => void;
}

function formatDate(value: string | null): string {
    if (!value) return 'Never';
    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function DeviceDuplicateGroupDialog({ groupId, open, onOpenChange, onClosed }: DeviceDuplicateGroupDialogProps) {
    const { request } = useApiRequest();
    const requestRef = useRef(request);
    useEffect(() => { requestRef.current = request; }, [request]);

    const [group, setGroup] = useState<DeviceDuplicateGroup | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGroup = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await requestRef.current<ApiResponse<DeviceDuplicateGroup>>(
                DEVICES_DUPLICATE_GROUP_ENDPOINT(id)
            );
            if (response?.data?.data) {
                setGroup(response.data.data);
            }
        } catch (e: unknown) {
            const err = e as Error & { data?: { details?: string[]; message?: string } };
            setError(err?.data?.details?.[0] ?? err?.data?.message ?? err?.message ?? 'Failed to load duplicate group');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open && groupId) {
            fetchGroup(groupId);
        } else if (!open) {
            setGroup(null);
            setError(null);
        }
    }, [open, groupId, fetchGroup]);

    const handleClose = () => {
        onOpenChange(false);
        onClosed();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="h-5 w-5 text-amber-500" />
                        Duplicate Devices
                    </DialogTitle>
                    <DialogDescription>
                        These devices share the same hardware identity. Compare them to find out which
                        one is the stale entry, then clean it up in the Intune admin center.
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-10 text-gray-500">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Loading duplicate group…
                    </div>
                )}

                {!loading && group && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                            {group.matchedOn.map(field => (
                                <Badge key={field} variant="outline" className="text-xs">
                                    Matched on {field === 'SerialNumber' ? 'Serial Number' : 'Wi-Fi MAC Address'}
                                </Badge>
                            ))}
                        </div>

                        {group.devices.map(device => (
                            <div
                                key={device.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-800"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate" title={device.deviceName}>
                                            {device.deviceName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {device.userDisplayName || 'Unassigned'} · {device.operatingSystem} {device.osVersion}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Serial Number</p>
                                        <p className="font-mono truncate">{device.serialNumber || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Wi-Fi MAC</p>
                                        <p className="font-mono truncate">{device.wiFiMacAddress || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Compliance</p>
                                        <p className="truncate">{device.complianceState}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Last Sync</p>
                                        <p className="truncate">{formatDate(device.lastSyncDateTime)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <Separator />

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
