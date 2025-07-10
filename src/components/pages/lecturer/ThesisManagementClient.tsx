'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const ThesisManagement = lazy(
	() => import('@/components/features/lecturer/ThesisManagement'),
);

export default function ThesisManagementClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<ThesisManagement />
		</Suspense>
	);
}
