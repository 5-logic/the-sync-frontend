import { useEffect, useMemo } from 'react';

import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import { useSubmissionStore } from '@/store';

/**
 * Custom hook for managing submission data and group transformations
 */
export const useAssignReviewerSubmissions = (milestone: string) => {
	const {
		submissions,
		fetchByMilestone,
		loading: loadingSubmissions,
	} = useSubmissionStore();

	// Fetch submissions when milestone changes
	useEffect(() => {
		if (milestone && milestone !== 'NO_MILESTONE') {
			fetchByMilestone(milestone);
		}
	}, [fetchByMilestone, milestone]);

	// Transform submissions to group table format
	const groupsInSemester = useMemo((): GroupTableProps[] => {
		if (milestone === 'NO_MILESTONE') return [];

		return submissions.map((s) => ({
			id: s.group.id,
			code: s.group.code,
			name: s.group.name,
			title: s.thesis?.englishName || '',
			supervisors: s.thesis?.supervisors || [],
			reviewers: s.reviewLecturers || [],
			submissionId: s.id,
			phase: String(s.milestone),
		}));
	}, [submissions, milestone]);

	// Refresh function
	const handleRefresh = () => {
		if (milestone && milestone !== 'NO_MILESTONE') {
			fetchByMilestone(milestone, true);
		}
	};

	// Reload specific submission
	const reloadSubmissionById = async (submissionId: string) => {
		if (!submissionId) return;
		// For now, reload all submissions for the milestone
		// This can be optimized with a custom fetch for single submission if available
		if (milestone && milestone !== 'NO_MILESTONE') {
			await fetchByMilestone(milestone, true);
		}
	};

	return {
		submissions,
		groupsInSemester,
		loadingSubmissions,
		handleRefresh,
		reloadSubmissionById,
	};
};
