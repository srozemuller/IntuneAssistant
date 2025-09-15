import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { GROUPS_ENDPOINT } from '@/lib/constants';
import { apiScope } from '@/lib/msalConfig';

export interface UserMember extends Record<string, unknown> {
    id: string;
    displayName: string;
    accountEnabled: boolean;
    type: string;
    userPrincipalName?: string | null;
}

export interface GroupDetails {
    id: string;
    displayName: string;
    description: string | null;
    membershipRule: string | null;
    createdDateTime: string;
    groupCount: {
        userCount: number;
        deviceCount: number;
        groupCount: number;
    } | null;
    members: UserMember[] | null;
}

export const useGroupDetails = () => {
    const { instance, accounts } = useMsal();
    const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
    const [groupLoading, setGroupLoading] = useState(false);
    const [groupError, setGroupError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchGroupDetails = async (resourceId: string) => {
        if (!accounts.length) return;

        // Open dialog immediately with loading state
        setSelectedGroup({
            id: resourceId,
            displayName: 'Loading...',
            description: null,
            membershipRule: null,
            createdDateTime: '',
            groupCount: null,
            members: null
        });
        setIsDialogOpen(true);
        setGroupLoading(true);
        setGroupError(null);

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [apiScope],
                account: accounts[0]
            });

            // Make both API calls in parallel
            const [groupResponse, membersResponse] = await Promise.all([
                fetch(`${GROUPS_ENDPOINT}?groupId=${resourceId}`, {
                    headers: {
                        'Authorization': `Bearer ${response.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${GROUPS_ENDPOINT}/${resourceId}/members`, {
                    headers: {
                        'Authorization': `Bearer ${response.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (!groupResponse.ok) {
                throw new Error(`Failed to fetch group details: ${groupResponse.statusText}`);
            }

            if (!membersResponse.ok) {
                throw new Error(`Failed to fetch group members: ${membersResponse.statusText}`);
            }

            const groupData = await groupResponse.json();
            const membersArray = await membersResponse.json();

            // Extract group details from the API response structure
            const group = groupData.data;

            // Process members data
            const processedMembers = membersArray.map((member: any): UserMember => ({
                id: member.id || '',
                displayName: member.displayName || member.userPrincipalName || 'Unknown',
                type: member.type || (member['@odata.type']?.includes('.user') ? 'User' :
                    member['@odata.type']?.includes('.group') ? 'Group' : 'Device'),
                accountEnabled: member.accountEnabled !== undefined ? member.accountEnabled : true,
                userPrincipalName: member.userPrincipalName || null
            }));

            // Merge group details with members
            const groupWithMembers = {
                id: group.id,
                displayName: group.displayName,
                description: group.description,
                membershipRule: group.membershipRule,
                createdDateTime: group.createdDateTime,
                groupCount: group.groupCount,
                members: processedMembers
            };

            setSelectedGroup(groupWithMembers);

        } catch (error) {
            console.error('Failed to fetch group details:', error);
            setGroupError(error instanceof Error ? error.message : 'Failed to fetch group details');
        } finally {
            setGroupLoading(false);
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedGroup(null);
        setGroupError(null);
    };

    return {
        selectedGroup,
        groupLoading,
        groupError,
        isDialogOpen,
        fetchGroupDetails,
        closeDialog
    };
};
