import { useEffect, useState } from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { useCurrentSemester } from '@/hooks/semester/useCurrentSemester';
import semestersService from '@/lib/services/semesters.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Semester } from '@/schemas/semester';

/**
 * Custom hook for managing semester filtering in lecturer dashboard components
 * Handles semester data fetching, default semester selection, and state management
 */
export function useLecturerSemesterFilter() {
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [semestersLoading, setSemestersLoading] = useState(true);
	const { session } = useSessionData();
	const { currentSemester } = useCurrentSemester();

	// Set default semester to current semester when available
	useEffect(() => {
		if (currentSemester?.id && selectedSemester === 'all') {
			setSelectedSemester(currentSemester.id);
		}
	}, [currentSemester?.id, selectedSemester]);

	// Fetch semesters for filter
	useEffect(() => {
		const fetchSemesters = async () => {
			try {
				setSemestersLoading(true);
				const response = await semestersService.findAll();
				const result = handleApiResponse(response);
				if (result.success) {
					setSemesters(result.data || []);
				}
			} catch (error) {
				console.error('Error fetching semesters:', error);
			} finally {
				setSemestersLoading(false);
			}
		};

		fetchSemesters();
	}, []);

	return {
		semesters,
		selectedSemester,
		setSelectedSemester,
		semestersLoading,
		session,
		currentSemester,
	};
}
