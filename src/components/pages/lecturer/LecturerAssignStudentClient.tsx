'use client';

import AssignStudent from '@/components/features/lecturer/AssignStudent';
import { useModeratorAuth } from '@/hooks/auth';

export default function LecturerAssignStudentClient() {
	const { isAuthorized } = useModeratorAuth();

	if (!isAuthorized) {
		return null; // Will redirect to unauthorized page
	}

	return <AssignStudent />;
}
