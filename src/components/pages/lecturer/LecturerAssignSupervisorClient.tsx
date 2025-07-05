'use client';

import AssignSupervisors from '@/components/features/lecturer/AssignSupervisor';
import { useModeratorAuth } from '@/hooks/auth';

export default function LecturerAssignSupervisorClient() {
	const { isAuthorized } = useModeratorAuth();

	if (!isAuthorized) {
		return null; // Will redirect to unauthorized page
	}

	return <AssignSupervisors />;
}
