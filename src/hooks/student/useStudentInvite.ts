import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

import { GroupDashboard } from '@/schemas/group';

export const useStudentInvite = () => {
	const { data: session } = useSession();

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
		isCurrentUserGroupLeader,
	};
};
