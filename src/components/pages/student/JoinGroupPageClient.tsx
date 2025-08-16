"use client";

import { Suspense, lazy } from "react";

import { TableLoadingSkeleton } from "@/components/common/loading";

// Lazy load the FormOrJoinGroup component for better performance
const JoinGroup = lazy(
	() => import("@/components/features/student/FormOrJoinGroup"),
);

/**
 * Client-side page component for join group functionality.
 * Uses lazy loading to improve initial page load performance.
 *
 * @returns The JoinGroup component wrapped in Suspense with loading fallback
 */
export default function JoinGroupPageClient() {
	return (
		<main role="main" aria-label="Join Group Page">
			<Suspense fallback={<TableLoadingSkeleton />}>
				<JoinGroup />
			</Suspense>
		</main>
	);
}
