'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const LecturerManagement = lazy(
	() => import('@/components/features/admin/LecturerManagement'),
);

export default function LecturerManagementClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<LecturerManagement />
		</Suspense>
	);
}
