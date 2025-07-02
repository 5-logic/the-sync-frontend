'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const FormOrJoinGroup = lazy(
	() => import('@/components/features/student/FormOrJoinGroup'),
);

export default function FormOrJoinGroupPageClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<FormOrJoinGroup />
		</Suspense>
	);
}
