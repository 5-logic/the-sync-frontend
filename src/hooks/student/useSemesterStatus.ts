import { useCallback, useEffect, useState } from "react";

import { useCurrentSemester } from "@/hooks/semester";

export const useSemesterStatus = () => {
	const { currentSemester, loading: semesterLoading } = useCurrentSemester();
	const [semesterStatus, setSemesterStatus] = useState<string | null>(null);

	useEffect(() => {
		if (currentSemester) {
			setSemesterStatus(currentSemester.status);
		} else {
			setSemesterStatus(null);
		}
	}, [currentSemester]);

	const isPicking = semesterStatus === "Picking";

	// New logic: Allow thesis registration/unregistration in both Picking and Ongoing-ScopeAdjustable
	const canRegisterThesis =
		semesterStatus === "Picking" ||
		(semesterStatus === "Ongoing" &&
			currentSemester?.ongoingPhase === "ScopeAdjustable");

	const refreshStatus = useCallback(() => {
		// Since we're now using useCurrentSemester, we don't need manual refresh
		// The semester store will handle the refresh
		if (currentSemester) {
			setSemesterStatus(currentSemester.status);
		}
	}, [currentSemester]);

	return {
		semesterStatus,
		isPicking,
		canRegisterThesis,
		loading: semesterLoading,
		refreshStatus,
	};
};
