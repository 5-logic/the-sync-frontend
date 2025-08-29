import { useEffect, useState } from 'react';

import { useCurrentSemester } from '@/hooks/semester/useCurrentSemester';
import { useSemesterStore } from '@/store';

/**
 * Custom hook for managing semester filtering in milestones timeline component
 * Different from useLecturerSemesterFilter as it doesn't support "all" option
 * Each semester has its own specific milestones
 */
export function useMilestonesSemesterFilter() {
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const { currentSemester } = useCurrentSemester();

	// Use centralized semester store
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
	} = useSemesterStore();

	// Fetch semesters on component mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Set default semester to current semester when available
	useEffect(() => {
		if (currentSemester?.id && !selectedSemester) {
			setSelectedSemester(currentSemester.id);
		}
	}, [currentSemester?.id, selectedSemester]);

	return {
		semesters,
		selectedSemester,
		setSelectedSemester,
		semestersLoading,
		currentSemester,
	};
}
