'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const SemesterSettings = lazy(
	() => import('@/components/features/admin/SemesterSettings'),
);

export default function SemesterSettingsClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<SemesterSettings />
		</Suspense>
	);
}
