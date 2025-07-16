'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const CreateNewStudent = lazy(
	() => import('@/components/features/admin/CreateNewUser/CreateNewStudent'),
);

export default function CreateNewStudentClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<CreateNewStudent />
		</Suspense>
	);
}
