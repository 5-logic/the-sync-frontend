'use client';

import { Suspense, lazy } from 'react';

import { TableLoadingSkeleton } from '@/components/common/loading';

// Lazy load the FormOrJoinGroup component for better performance
const FormOrJoinGroup = lazy(
	() => import('@/components/features/student/FormOrJoinGroup'),
);

/**
 * Client-side page component for form or join group functionality.
 * Uses lazy loading to improve initial page load performance.
 *
 * @returns The FormOrJoinGroup component wrapped in Suspense with loading fallback
 */
export default function FormOrJoinGroupPageClient() {
	return (
		<main role="main" aria-label="Form or Join Group Page">
			<Suspense fallback={<TableLoadingSkeleton />}>
				<FormOrJoinGroup />
			</Suspense>
		</main>
	);
}
