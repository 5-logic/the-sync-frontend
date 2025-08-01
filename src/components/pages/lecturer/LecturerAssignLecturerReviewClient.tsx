'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';
import { useModeratorAuth } from '@/hooks/auth';

const AssignLecturerReview = lazy(
	() => import('@/components/features/lecturer/AssignLecturerReview'),
);
export default function LecturerAssignLecturerReviewClient() {
	const { isAuthorized } = useModeratorAuth();

	if (!isAuthorized) {
		return null; // Will redirect to unauthorized page
	}

	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<AssignLecturerReview />
		</Suspense>
	);
}
