'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

// Lazy load the component
const MilestoneManagement = lazy(
	() => import('@/components/features/admin/MilestoneManagement'),
);

export default function MilestoneManagementClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<MilestoneManagement />
		</Suspense>
	);
}
