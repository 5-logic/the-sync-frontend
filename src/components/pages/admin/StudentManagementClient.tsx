'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const StudentManagement = lazy(
	() => import('@/components/features/admin/StudentManagement'),
);

export default function StudentManagementClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<StudentManagement />
		</Suspense>
	);
}
