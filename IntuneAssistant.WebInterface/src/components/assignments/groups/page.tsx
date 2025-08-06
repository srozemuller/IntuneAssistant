import { useState } from 'react';
import { DataTable } from './data-table.tsx';
import authDataMiddleware, { createCancelTokenSource } from "@/components/middleware/fetchData";
import { ASSIGNMENTS_GROUP_ENDPOINT, GROUPS_ENDPOINT } from "@/components/constants/apiUrls.js";
import { columns } from "@/components/assignments/groups/columns.tsx";
import { z } from "zod";
import { assignmentSchema, type Assignment } from "@/components/assignments/groups/schema";
import { type GroupModel, groupSchema } from "@/schemas/groupSchema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { withOnboardingCheck } from "@/components/with-onboarded-check.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toastPosition, toastDuration } from "@/config/toastConfig.ts";
import { showLoadingToast } from '@/utils/toastUtils';

import GroupSearchCard from "@/components/group-search.tsx";

function GroupAssignmentsPage() {
    const [groupId, setGroupId] = useState<string>('');
    const [groupInfo, setGroupInfo] = useState<any>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
    const [membersDialogOpen, setMembersDialogOpen] = useState<boolean>(false);

    const fetchGroupInfo = async () => {
        if (!groupId.trim()) {
            toast.error("Please enter a group ID or name");
            return;
        }


        const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(groupId);
        const queryParam = isGuid ? `groupId=${groupId}` : `groupName=${groupId}`;

        const toastId = showLoadingToast("Fetching group information", () => {});
        const cancelSource = createCancelTokenSource();

        try {
            setLoading(true);
            setError('');
            setGroupInfo(null);
            setAssignments([]);

            const response = await authDataMiddleware(`${GROUPS_ENDPOINT}?${queryParam}`, 'GET', {}, cancelSource as any);
            const groupData = response?.data?.data;

            if (groupData) {
                setGroupInfo(groupData);
                toast.update(toastId, {
                    render: "Group information fetched successfully",
                    type: 'success',
                    isLoading: false,
                    autoClose: toastDuration
                });
            } else {
                throw new Error("Group not found or invalid response");
            }
        } catch (error) {
            console.error('Error fetching group:', error);
            const errorMessage = `Failed to fetch group. ${(error as Error).message}`;
            setError(errorMessage);
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: toastDuration
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupMembers = async () => {
        if (!groupInfo) {
            toast.error("Group information not available");
            return;
        }

        const toastId = showLoadingToast("Fetching group members", () => {});
        const cancelSource = createCancelTokenSource();

        try {
            setLoadingMembers(true);

            const response = await authDataMiddleware(`${GROUPS_ENDPOINT}/${groupInfo.id}/members`,'GET',{},cancelSource as any );

            setGroupMembers(response?.data || []);

            toast.update(toastId, {
                render: "Group members fetched successfully",
                type: 'success',
                isLoading: false,
                autoClose: toastDuration
            });
        } catch (error) {
            console.error('Error fetching group members:', error);
            const errorMessage = `Failed to fetch group members. ${(error as Error).message}`;
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: toastDuration
            });
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchGroupAssignments = async () => {
        if (!groupInfo) {
            toast.error("Group information not available");
            return;
        }

        const toastId = showLoadingToast("Fetching group assignments", () => {});
        const cancelSource = createCancelTokenSource();

        try {
            setLoading(true);
            setError('');
            setAssignments([]);

            const response = await authDataMiddleware(`${ASSIGNMENTS_GROUP_ENDPOINT}/${groupInfo.id}`, 'GET', {}, cancelSource as any);

            const parsedData = z.array(assignmentSchema).parse(response?.data?.data || []);
            setAssignments(parsedData);

            toast.update(toastId, {
                render: "Group assignments fetched successfully",
                type: 'success',
                isLoading: false,
                autoClose: toastDuration
            });
        } catch (error) {
            console.error('Error fetching assignments:', error);
            const errorMessage = `Failed to fetch assignments. ${(error as Error).message}`;
            setError(errorMessage);
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: toastDuration
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-[95%] py-6">
            <ToastContainer autoClose={toastDuration} position={toastPosition}/>
            <GroupSearchCard
                groupId={groupId}
                setGroupId={setGroupId}
                fetchGroupInfo={fetchGroupInfo}
                loading={loading}
            />
            {groupInfo && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{groupInfo.displayName}</CardTitle>
                        <CardDescription>{groupInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Group ID</p>
                                <p className="font-medium">{groupInfo.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created Date</p>
                                <p className="font-medium">{new Date(groupInfo.createdDateTime).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Membership Rule</p>
                                <p className="font-medium">
                                    {groupInfo.membershipRule ? groupInfo.membershipRule : "Not applicable"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Member Count</p>
                                <p className="font-medium">
                                    {groupInfo.groupCount?.userCount || 0} Users,
                                    {groupInfo.groupCount?.deviceCount || 0} Devices,
                                    {groupInfo.groupCount?.groupCount || 0} Groups
                                </p>

                                <Button
                                    onClick={async () => {
                                        await fetchGroupMembers();
                                        setMembersDialogOpen(true);
                                    }}
                                    disabled={loadingMembers}
                                    variant="secondary"
                                >
                                    Show Group Members
                                </Button>
                            </div>
                        </div>
                        <Button onClick={fetchGroupAssignments} disabled={loading}>
                            Find Assignments
                        </Button>
                    </CardContent>
                </Card>
            )}

            {assignments.length > 0 && (
                <DataTable
                    columns={columns(groupInfo ? [groupInfo] : [])}
                    data={assignments}
                    source="assignments_groups"
                    rawData={JSON.stringify(assignments)}
                    fetchData={fetchGroupAssignments}
                    groupData={groupInfo}
                />
            )}

            {/* Dialog for displaying group members */}
            <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Group Members - {groupInfo?.displayName}</DialogTitle>
                    </DialogHeader>

                    {loadingMembers ? (
                        <div className="flex justify-center py-4">Loading members...</div>
                    ) : groupMembers.length > 0 ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Total members: {groupMembers.length}</p>
                            <div className="border rounded-md">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left">Display Name</th>
                                        <th className="p-2 text-left">User Principal Name</th>
                                        <th className="p-2 text-left">Type</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {groupMembers.map((member, index) => (
                                        <tr key={member.id || index} className={index !== groupMembers.length - 1 ? "border-b" : ""}>
                                            <td className="p-2">{member.displayName}</td>
                                            <td className="p-2">{member.userPrincipalName || '-'}</td>
                                            <td className="p-2">{member.type || 'User'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>No members found in this group.</p>
                    )}
                </DialogContent>
            </Dialog>

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}

export default withOnboardingCheck(GroupAssignmentsPage);