'use client';
import React, { useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Users } from 'lucide-react';
import { useGroupDetails } from '@/hooks/useGroupDetails';

interface GroupDetailsDialogProps {
    groupId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const groupMemberColumns = [
    {
        key: 'displayName' as string,
        label: 'Display Name',
        render: (value: unknown) => (
            <span className="font-medium">{String(value)}</span>
        )
    },
    {
        key: 'type' as string,
        label: 'Type',
        render: (value: unknown) => (
            <Badge variant="outline" className="text-xs">
                {String(value)}
            </Badge>
        )
    },
    {
        key: 'accountEnabled' as string,
        label: 'Account Status',
        render: (value: unknown, row: Record<string, unknown>) => {
            const type = String(row.type).toLowerCase();

            if (type === 'group') {
                return <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>;
            }

            const isEnabled = Boolean(value);
            return (
                <Badge variant={isEnabled ? 'default' : 'secondary'}
                       className={isEnabled ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700' : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
            );
        }
    },
    {
        key: 'id' as string,
        label: 'ID',
        render: (value: unknown) => (
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{String(value)}</span>
        )
    }
];

export function GroupDetailsDialog({ groupId, isOpen, onClose }: GroupDetailsDialogProps) {
    const {
        selectedGroup,
        groupLoading,
        groupError,
        fetchGroupDetails
    } = useGroupDetails();

    const lastFetchedGroupId = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen && groupId && groupId !== lastFetchedGroupId.current) {
            lastFetchedGroupId.current = groupId;
            fetchGroupDetails(groupId);
        }
    }, [isOpen, groupId]);

    useEffect(() => {
        if (!isOpen) {
            lastFetchedGroupId.current = null;
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!w-[90vw] !max-w-[90vw] h-[75vh] max-h-none overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {selectedGroup?.displayName || 'Group Details'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedGroup?.description || 'Group information and members'}
                    </DialogDescription>
                </DialogHeader>

                {groupLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Loading group details...</span>
                        </div>
                    </div>
                ) : groupError ? (
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-md border dark:border-red-800">
                        <span className="font-medium">Error:</span>
                        <span>{groupError}</span>
                    </div>
                ) : selectedGroup ? (
                    <div className="space-y-6">
                        {/* Group Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Group ID</label>
                                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">{selectedGroup.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedGroup.createdDateTime ? new Date(selectedGroup.createdDateTime).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            {selectedGroup.membershipRule && (
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Membership Rule</label>
                                    <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-gray-900 dark:text-gray-100 border dark:border-gray-600">{selectedGroup.membershipRule}</p>
                                </div>
                            )}
                        </div>

                        {/* Group Counts */}
                        {selectedGroup.groupCount && (
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedGroup.groupCount.userCount}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Users</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedGroup.groupCount.deviceCount}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Devices</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedGroup.groupCount.groupCount}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Groups</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Members Table */}
                        {selectedGroup.members && selectedGroup.members.length > 0 ? (
                            <div>
                                <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Group Members</h4>
                                <DataTable
                                    data={selectedGroup.members}
                                    columns={groupMemberColumns}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No members found or unable to load member details.</p>
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
