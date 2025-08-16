"use client";

import { Suspense, lazy } from "react";

import { TableLoadingSkeleton } from "@/components/common/loading";

const NewRequestApplyThesis = lazy(
	() =>
		import(
			"@/components/features/lecturer/RequestApplyThesis/NewRequestApplyThesis"
		),
);

export default function RequestApplyThesisClient() {
	return (
		<Suspense fallback={<TableLoadingSkeleton />}>
			<NewRequestApplyThesis />
		</Suspense>
	);
}
