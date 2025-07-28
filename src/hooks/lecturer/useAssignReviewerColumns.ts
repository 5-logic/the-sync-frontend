import { useMemo, useState } from 'react';

import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';
import {
	TABLE_WIDTHS,
	baseColumns,
	createActionRenderer,
	createReviewerRenderer,
} from '@/components/features/lecturer/AssignLecturerReview/ReviewerColumns';
import { SubmissionItem } from '@/lib/services/submission.service';
import { DraftReviewerAssignment } from '@/store/useDraftReviewerAssignmentStore';

interface UseAssignReviewerColumnsProps {
	submissions: SubmissionItem[];
	draftCount: number;
	getDraftReviewerAssignment: (
		submissionId: string,
	) => DraftReviewerAssignment | undefined;
	removeDraftReviewerAssignment: (submissionId: string) => void;
}

/**
 * Custom hook for managing table columns with draft support
 */
export const useAssignReviewerColumns = ({
	submissions,
	draftCount,
	getDraftReviewerAssignment,
	removeDraftReviewerAssignment,
}: UseAssignReviewerColumnsProps) => {
	const [selectedGroup, setSelectedGroup] = useState<GroupTableProps | null>(
		null,
	);

	// Handle group selection for assignment modal
	const handleGroupSelect = (record: GroupTableProps) => {
		const submission = submissions.find((s) => s.group.id === record.id);
		if (submission) {
			const submissionGroup = submission.group;
			setSelectedGroup({
				...submissionGroup,
				title: submission.thesis?.englishName || '',
				phase: String(submission.milestone),
				supervisors: submission.thesis?.supervisors || [],
				reviewers: submission.reviewLecturers,
				submissionId: submission.id,
			});
		}
	};

	// Memoized columns to prevent unnecessary re-renders
	const columns = useMemo(() => {
		// Create custom reviewer renderer with draft support
		const reviewerRenderer = createReviewerRenderer(getDraftReviewerAssignment);

		// Create custom action renderer with draft delete support
		const actionRenderer = createActionRenderer(
			handleGroupSelect,
			getDraftReviewerAssignment,
			removeDraftReviewerAssignment,
		);

		// Replace reviewer column with draft-aware version
		const baseColumnsWithDrafts = baseColumns.map((column) => {
			if (column.key === 'reviewers') {
				return {
					...column,
					render: reviewerRenderer,
				};
			}
			return column;
		});

		return [
			...baseColumnsWithDrafts,
			{
				title: 'Action',
				key: 'action',
				width: TABLE_WIDTHS.ACTIONS,
				align: 'center' as const,
				render: actionRenderer,
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		submissions,
		getDraftReviewerAssignment,
		removeDraftReviewerAssignment,
		draftCount,
	]);

	return {
		columns,
		selectedGroup,
		setSelectedGroup,
	};
};
