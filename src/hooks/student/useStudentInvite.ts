import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';

export const useStudentInvite = () => {
	const [loading, setLoading] = useState(false);
	const { data: session } = useSession();

	const inviteStudentToGroup = useCallback(
		async (studentId: string, groupId: string) => {
			setLoading(true);
			try {
				// TODO: Implement the actual invite API call
				// This would likely be a POST request to invite a student to a group
				console.log('Inviting student', studentId, 'to group', groupId);

				// Placeholder for the actual API call
				// const response = await groupService.inviteStudent(groupId, studentId);

				showNotification.success(
					'Invitation Sent',
					'Student has been invited to join your group.',
				);

				return true;
			} catch (error) {
				showNotification.error(
					'Invitation Failed',
					error instanceof Error ? error.message : 'Failed to send invitation',
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	// Check if current user is a group leader
	const isCurrentUserGroupLeader = useCallback(
		(groupData?: GroupDashboard) => {
			if (!session?.user?.id || !groupData) return false;

			// Check if current user is the leader of any group
			return groupData.leader?.userId === session.user.id;
		},
		[session?.user?.id],
	);

	return {
		inviteStudentToGroup,
		isCurrentUserGroupLeader,
		loading,
	};
};
