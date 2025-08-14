"use client";

import { Suspense, lazy } from "react";

import { TableLoadingSkeleton } from "@/components/common/loading";

const RequestApplyThesis = lazy(
	() => import("@/components/features/lecturer/RequestApplyThesis"),
);

export default function RequestApplyThesisClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<RequestApplyThesis />
		</Suspense>
	);
}
