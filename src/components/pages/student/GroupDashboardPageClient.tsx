'use client';

import { Suspense, lazy } from 'react';

import GroupStatusGuard from '@/components/common/GroupStatusGuard';
import { TableLoadingSkeleton } from '@/components/common/loading';

// Lazy load the GroupDashboard component for better performance
const GroupDashboard = lazy(
	() => import('@/components/features/student/GroupDashboard/GroupDashboard'),
);

/**
 * Client-side page component for group dashboard functionality.
 * Uses lazy loading to improve initial page load performance.
 *
 * @returns The GroupDashboard component wrapped in GroupStatusGuard and Suspense with loading fallback
 */
export default function GroupDashboardPageClient() {
	return (
		<main role="main" aria-label="Group Dashboard Page">
			<GroupStatusGuard requiresGroup={true}>
				<Suspense fallback={<TableLoadingSkeleton />}>
					<GroupDashboard />
				</Suspense>
			</GroupStatusGuard>
		</main>
	);
}
