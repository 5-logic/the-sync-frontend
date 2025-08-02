import { useEffect, useState } from 'react';

import { useMilestoneStore, useSemesterStore } from '@/store';

/**
 * Custom hook for managing semester and milestone selection
 * Handles automatic selection of default semester and milestone
 */
export const useAssignReviewerSemesterMilestone = () => {
	const [semester, setSemester] = useState('');
	const [milestone, setMilestone] = useState('');

	// Semester store
	const {
		semesters,
		fetchSemesters,
		loading: loadingSemesters,
	} = useSemesterStore();

	// Milestone store
	const {
		milestones,
		fetchMilestonesBySemester,
		loading: loadingMilestones,
	} = useMilestoneStore();

	// Fetch semesters when hook mounts
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Auto-select first valid semester when semesters are loaded
	useEffect(() => {
		if (semesters && semesters.length > 0) {
			const filtered = semesters.filter(
				(s) => s.status !== 'NotYet' && s.status !== 'End',
			);
			const defaultSemester = filtered.length > 0 ? filtered[0].id : '';
			if (defaultSemester && defaultSemester !== semester) {
				setSemester(defaultSemester);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [semesters]);

	// Fetch milestones when semester changes
	useEffect(() => {
		if (semester) {
			fetchMilestonesBySemester(semester);
		} else {
			setMilestone('');
		}
	}, [semester, fetchMilestonesBySemester]);

	// Auto-select default milestone (closest future milestone or latest past one)
	useEffect(() => {
		if (milestones && milestones.length > 0) {
			const now = new Date();
			const futureMilestones = milestones.filter((m) => {
				if (!m.startDate) return false;
				return new Date(m.startDate) >= now;
			});

			let defaultMilestone = '';
			if (futureMilestones.length > 0) {
				// Sort by start date ascending and pick the first one
				futureMilestones.sort(
					(a, b) =>
						new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
				);
				defaultMilestone = futureMilestones[0].id;
			} else {
				// No future milestones, pick the latest past one
				const sorted = [...milestones].sort(
					(a, b) =>
						new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
				);
				if (sorted.length > 0) defaultMilestone = sorted[0].id;
			}
			setMilestone(defaultMilestone);
		} else {
			setMilestone('NO_MILESTONE');
		}
	}, [milestones]);

	return {
		semester,
		setSemester,
		milestone,
		setMilestone,
		semesters,
		milestones,
		loadingSemesters,
		loadingMilestones,
	};
};
