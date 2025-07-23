'use client';

import { Suspense, lazy } from 'react';

import {
	AuthLoadingSkeleton,
	PageContentSkeleton,
} from '@/components/common/loading';
import { useModeratorAuth } from '@/hooks/auth';

const AssignListPublishThesisPage = lazy(
	() => import('@/components/features/lecturer/AssignListPublishThesis'),
);

export default function LecturerListPublishThesisClient() {
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
		<Suspense fallback={<PageContentSkeleton />}>
			<AssignListPublishThesisPage />
		</Suspense>
	);
}
