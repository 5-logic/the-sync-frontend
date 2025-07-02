'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

const FormOrJoinGroup = lazy(
	() => import('@/components/features/student/FormOrJoinGroup'),
);

/**
 * Client-side page component for form or join group functionality.
 * Uses lazy loading to improve initial page load performance.
 *
 * @returns {JSX.Element} The FormOrJoinGroup component wrapped in Suspense
 */
export default function FormOrJoinGroupPageClient(): JSX.Element {
	return (
		<main role="main" aria-label="Form or Join Group Page">
			<Suspense fallback={<TableLoadingSkeleton />}>
				<FormOrJoinGroup />
			</Suspense>
		</main>
	);
}
