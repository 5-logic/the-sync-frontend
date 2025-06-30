'use client';

import { Suspense, lazy } from 'react';

const CreateNewLecturer = lazy(
	() => import('@/components/features/admin/CreateNewUser/CreateNewLecturer'),
);

export default function CreateNewLecturerClient() {
	return (
		<Suspense>
			<CreateNewLecturer />
		</Suspense>
	);
}
