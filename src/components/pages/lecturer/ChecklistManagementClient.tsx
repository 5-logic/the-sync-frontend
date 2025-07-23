'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const ChecklistManagement = lazy(
	() => import('@/components/features/lecturer/ChecklistManagement'),
);

export default function ChecklistManagementClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<ChecklistManagement />
		</Suspense>
	);
}
