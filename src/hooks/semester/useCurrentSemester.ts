import { useEffect, useState } from 'react';

import { Semester } from '@/schemas/semester';
import { useSemesterStore } from '@/store';

/**
 * Hook to get current semester based on priority order:
 * Preparing -> Picking -> Ongoing
 * Excludes: NotYet, End
 */
export const useCurrentSemester = () => {
	const { semesters, fetchSemesters, loading } = useSemesterStore();
	const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);

	useEffect(() => {
		// Fetch semesters on mount
		fetchSemesters();
	}, [fetchSemesters]);

	useEffect(() => {
		// Find current semester based on priority order
		const findCurrentSemester = () => {
			// Priority order: Preparing -> Picking -> Ongoing
			const priorityOrder = ['Preparing', 'Picking', 'Ongoing'];

			for (const status of priorityOrder) {
				const semester = semesters.find((sem) => sem.status === status);
				if (semester) {
					return semester;
				}
			}

			return null;
		};

		const current = findCurrentSemester();
		setCurrentSemester(current);
	}, [semesters]);

	return {
		currentSemester,
		loading,
		refetch: fetchSemesters,
	};
};
