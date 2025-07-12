'use client';

import { Suspense, lazy } from 'react';

import {
	AssignSupervisorSkeleton,
	AuthLoadingSkeleton,
} from '@/components/common/loading';
import { useModeratorAuth } from '@/hooks/auth';

const AssignSupervisors = lazy(
	() => import('@/components/features/lecturer/AssignSupervisor'),
);

export default function LecturerAssignSupervisorClient() {
	const { isAuthorized, loading } = useModeratorAuth();

	// Show loading skeleton while checking authorization
	if (loading) {
		return <AuthLoadingSkeleton />;
	}

	// If not authorized, return null (will redirect to unauthorized page)
	if (!isAuthorized) {
		return null;
	}

	// Use Suspense for lazy loading the main component
	return (
		<Suspense fallback={<AssignSupervisorSkeleton />}>
			<AssignSupervisors />
		</Suspense>
	);
}
