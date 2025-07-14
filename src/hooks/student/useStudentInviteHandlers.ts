import { useCallback } from 'react';

import { showNotification } from '@/lib/utils/notification';
import {
	createRemoveMemberHandler,
	createStudentSelectHandler,
} from '@/lib/utils/studentInviteHelpers';
import type { Student } from '@/schemas/student';

/**
 * Custom hook for student invite handlers to reduce code duplication
 */
export function useStudentInviteHandlers(
	students: Student[],
	members: Student[],
	onMembersChange: (members: Student[]) => void,
	handleAddMember: (student: Student) => void,
) {
	const handleStudentSelect = useCallback(
		(value: string) => {
			const handler = createStudentSelectHandler(students, handleAddMember);
			handler(value);
		},
		[students, handleAddMember],
	);

	const handleRemoveMember = useCallback(
		(memberId: string) => {
			const handler = createRemoveMemberHandler(
				members,
				onMembersChange,
				showNotification,
			);
			handler(memberId);
		},
		[members, onMembersChange],
	);

	return {
		handleStudentSelect,
		handleRemoveMember,
	};
}
