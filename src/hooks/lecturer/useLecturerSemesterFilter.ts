import { useEffect, useState } from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { useCurrentSemester } from '@/hooks/semester/useCurrentSemester';
import { useSemesterStore } from '@/store';

/**
 * Custom hook for managing semester filtering in lecturer dashboard components
 * Handles semester data fetching, default semester selection, and state management
 * Now uses centralized semester store like admin dashboard
 */
export function useLecturerSemesterFilter() {
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [isInitialized, setIsInitialized] = useState(false);
	const { session } = useSessionData();
	const { currentSemester } = useCurrentSemester();

	// Use centralized semester store instead of local state
	const {
		semesters,
		loading: semestersLoading,
		fetchSemesters,
	} = useSemesterStore();

	// Fetch semesters on component mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Set default semester to current semester when available (only on initial load)
	useEffect(() => {
		if (currentSemester?.id && selectedSemester === 'all' && !isInitialized) {
			setSelectedSemester(currentSemester.id);
			setIsInitialized(true);
		}
	}, [currentSemester?.id, selectedSemester, isInitialized]);

	// Wrapper function to handle clear behavior
	const handleSemesterChange = (value: string | null) => {
		if (value === null || value === undefined) {
			// When cleared, set to "all"
			setSelectedSemester('all');
		} else {
			setSelectedSemester(value);
		}
	};

	return {
		semesters,
		selectedSemester,
		setSelectedSemester: handleSemesterChange,
		semestersLoading,
		session,
		currentSemester,
	};
}
