'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const ProfileSettingsPage = lazy(
	() => import('@/components/features/lecturer/ProfileSetting'),
);

export default function ProfileSettingsClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<ProfileSettingsPage />
		</Suspense>
	);
}
