import { useCallback, useState } from 'react';

import milestoneService from '@/lib/services/milestones.service';
import semesterService from '@/lib/services/semesters.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

interface UseMilestonesReturn {
	milestones: Milestone[];
	selectedMilestone: Milestone | null;
	loading: boolean;
	error: string | null;
	fetchMilestones: (semesterId?: string) => Promise<void>;
	selectMilestone: (milestone: Milestone | null) => void;
	clearMilestones: () => void;
}

export function useMilestones(): UseMilestonesReturn {
	const [milestones, setMilestones] = useState<Milestone[]>([]);
	const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedSemesterId, setLastFetchedSemesterId] = useState<
		string | null
	>(null);

	const fetchMilestones = useCallback(
		async (semesterId?: string) => {
			// Tránh fetch duplicate nếu đã fetch semester này rồi
			if (
				semesterId &&
				lastFetchedSemesterId === semesterId &&
				milestones.length > 0
			) {
				console.log(
					'Skipping duplicate milestone fetch for semester:',
					semesterId,
				);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				let targetSemesterId = semesterId;

				// If no specific semester provided, find the ongoing semester
				if (!targetSemesterId) {
					const semesterResponse = await semesterService.findAll();
					const semesterResult = handleApiResponse(semesterResponse);

					if (!semesterResult.success || !semesterResult.data) {
						throw new Error(
							semesterResult.error?.message || 'Failed to fetch semesters',
						);
					}

					const ongoingSemester = semesterResult.data.find(
						(semester: Semester) => semester.status === 'Ongoing',
					);

					if (!ongoingSemester) {
						// No ongoing semester found, set empty milestones
						setMilestones([]);
						setSelectedMilestone(null);
						return;
					}

					targetSemesterId = ongoingSemester.id;
				}

				// Fetch milestones for the target semester
				const milestoneResponse =
					await milestoneService.findBySemester(targetSemesterId);
				const milestoneResult = handleApiResponse(milestoneResponse);

				if (!milestoneResult.success) {
					throw new Error(
						milestoneResult.error?.message || 'Failed to fetch milestones',
					);
				}

				// Sort milestones by start date (ascending)
				const sortedMilestones = (milestoneResult.data || []).sort(
					(a: Milestone, b: Milestone) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
				);

				setMilestones(sortedMilestones);
				setLastFetchedSemesterId(targetSemesterId);

				// Auto-select the first milestone if none selected và chưa có milestone nào
				setSelectedMilestone((currentSelected) => {
					if (!currentSelected && sortedMilestones.length > 0) {
						return sortedMilestones[0];
					}
					return currentSelected;
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to fetch milestones';
				setError(errorMessage);
				console.error('Error fetching milestones:', error);
			} finally {
				setLoading(false);
			}
		},
		[lastFetchedSemesterId, milestones.length], // Dependencies để check duplicate
	);

	const selectMilestone = useCallback((milestone: Milestone | null) => {
		setSelectedMilestone(milestone);
	}, []);

	const clearMilestones = useCallback(() => {
		setMilestones([]);
		setSelectedMilestone(null);
		setLastFetchedSemesterId(null);
		setError(null);
	}, []);

	// Remove auto-fetch to prevent multiple API calls
	// Components should explicitly call fetchMilestones when needed

	return {
		milestones,
		selectedMilestone,
		loading,
		error,
		fetchMilestones,
		selectMilestone,
		clearMilestones,
	};
}
