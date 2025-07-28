import { useEffect, useState } from 'react';

import { mockReviews } from '@/data/review';
import lecturerService from '@/lib/services/lecturers.service';
import { Lecturer } from '@/schemas/lecturer';

/**
 * Custom hook for managing lecturer data and reviewer information
 */
export const useAssignReviewerLecturers = () => {
	const [lecturers, setLecturers] = useState<Lecturer[]>([]);

	// Fetch lecturers when hook mounts
	useEffect(() => {
		lecturerService.findAll().then((response) => {
			if (response.success && response.data) {
				setLecturers(response.data);
			}
		});
	}, []);

	/**
	 * Get current reviewers for a specific group and milestone
	 * This function uses mock data for now, but should be replaced with actual API calls
	 */
	const getReviewersForGroup = (
		groupId: string,
		milestone: string,
		filteredGroups: Array<{
			id: string;
			phase?: string;
			submissionId?: string;
		}>,
	): string[] => {
		const submission = filteredGroups.find(
			(g) => g.id === groupId && g.phase === milestone,
		);
		if (!submission || !submission.submissionId) return [];

		return mockReviews
			.filter((r) => r.submissionId === submission.submissionId)
			.map((r) => {
				const lecturer = lecturers.find((l) => l.id === r.lecturerId);
				return lecturer?.fullName;
			})
			.filter(Boolean) as string[];
	};

	/**
	 * Find lecturer name by ID
	 */
	const getLecturerNameById = (lecturerId: string): string | undefined => {
		return lecturers.find((l) => l.id === lecturerId)?.fullName;
	};

	return {
		lecturers,
		getReviewersForGroup,
		getLecturerNameById,
	};
};
