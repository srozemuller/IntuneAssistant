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
                return <span className="text-xs text-gray-500">N/A</span>;
            }

            const isEnabled = Boolean(value);
            return (
                <Badge variant={isEnabled ? 'default' : 'secondary'}
                       className={isEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
            );
        }
    },
    {
        key: 'id' as string,
        label: 'ID',
        render: (value: unknown) => (
            <span className="font-mono text-xs text-gray-500">{String(value)}</span>
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

    // Fetch group details when dialog opens and groupId changes
    useEffect(() => {
        if (isOpen && groupId && groupId !== lastFetchedGroupId.current) {
            lastFetchedGroupId.current = groupId;
            fetchGroupDetails(groupId);
        }
    }, [isOpen, groupId]); // Remove fetchGroupDetails from dependencies

    // Reset the ref when dialog closes
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
                    <div className="flex items-center gap-2 text-red-500 p-4 bg-red-50 rounded-md">
                        <span className="font-medium">Error:</span>
                        <span>{groupError}</span>
                    </div>
                ) : selectedGroup ? (
                    <div className="space-y-6">
                        {/* Group Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Group ID</label>
                                <p className="font-mono text-sm">{selectedGroup.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Created</label>
                                <p className="text-sm">{selectedGroup.createdDateTime ? new Date(selectedGroup.createdDateTime).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            {selectedGroup.membershipRule && (
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Membership Rule</label>
                                    <p className="text-sm bg-gray-100 p-2 rounded font-mono">{selectedGroup.membershipRule}</p>
                                </div>
                            )}
                        </div>

                        {/* Group Counts */}
                        {selectedGroup.groupCount && (
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{selectedGroup.groupCount.userCount}</div>
                                        <div className="text-sm text-gray-600">Users</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-green-600">{selectedGroup.groupCount.deviceCount}</div>
                                        <div className="text-sm text-gray-600">Devices</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-2xl font-bold text-purple-600">{selectedGroup.groupCount.groupCount}</div>
                                        <div className="text-sm text-gray-600">Groups</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Members Table */}
                        {selectedGroup.members && selectedGroup.members.length > 0 ? (
                            <div>
                                <h4 className="text-lg font-medium mb-4">Group Members</h4>
                                <DataTable
                                    data={selectedGroup.members}
                                    columns={groupMemberColumns}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
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
