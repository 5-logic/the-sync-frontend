'use client';

import AssignLecturerReview from '@/components/features/lecturer/AssignLecturerReview';
import { useModeratorAuth } from '@/hooks/auth';

export default function LecturerAssignLecturerReviewClient() {
	const { isAuthorized } = useModeratorAuth();

	if (!isAuthorized) {
		return null; // Will redirect to unauthorized page
	}

	return <AssignLecturerReview />;
}
