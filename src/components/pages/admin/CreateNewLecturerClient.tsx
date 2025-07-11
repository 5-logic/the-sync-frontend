'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const CreateNewLecturer = lazy(
	() => import('@/components/features/admin/CreateNewUser/CreateNewLecturer'),
);

export default function CreateNewLecturerClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<CreateNewLecturer />
		</Suspense>
	);
}
