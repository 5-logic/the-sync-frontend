'use client';

import { Suspense, lazy } from 'react';

const CreateNewStudent = lazy(
	() => import('@/components/features/admin/CreateNewUser/CreateNewStudent'),
);

export default function StudentManagementClient() {
	return (
		<Suspense>
			<CreateNewStudent />
		</Suspense>
	);
}
