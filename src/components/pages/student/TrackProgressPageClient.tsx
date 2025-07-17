'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

// Lazy load the TrackProgress component for better performance
const TrackProgress = lazy(
	() => import('@/components/features/student/TrackProgress'),
);

/**
 * Client-side page component for track progress functionality.
 * Uses lazy loading to improve initial page load performance.
 *
 * @returns The TrackProgress component wrapped in Suspense with loading fallback
 */
export default function TrackProgressPageClient() {
	return (
		<main role="main" aria-label="Track Progress Page">
			<Suspense fallback={<TableLoadingSkeleton />}>
				<TrackProgress />
			</Suspense>
		</main>
	);
}
