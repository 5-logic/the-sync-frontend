'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const ThesesRegistration = lazy(
	() => import('@/components/features/lecturer/ThesesRegistration'),
);

export default function ThesesRegistrationClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<ThesesRegistration />
		</Suspense>
	);
}
