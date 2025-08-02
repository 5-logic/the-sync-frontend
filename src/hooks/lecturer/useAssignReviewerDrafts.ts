import { useState } from 'react';

import { showNotification } from '@/lib/utils/notification';
import { useDraftReviewerAssignmentStore } from '@/store/useDraftReviewerAssignmentStore';
import { useReviewStore } from '@/store/useReviewStore';

/**
 * Custom hook for managing draft reviewer assignments and bulk operations
 */
export const useAssignReviewerDrafts = () => {
	const [updating, setUpdating] = useState(false);

	// Draft reviewer store
	const {
		addDraftReviewerAssignment,
		getDraftReviewerAssignmentsList,
		clearAllDraftReviewerDrafts,
		getDraftReviewerAssignment,
		removeDraftReviewerAssignment,
	} = useDraftReviewerAssignmentStore();

	// Review store for bulk operations
	const { assignBulkReviewers } = useReviewStore();

	/**
	 * Handle bulk assignment of all draft reviewers
	 */
	const handleAssignAllDrafts = async (
		milestone: string,
		handleRefresh: () => void,
	) => {
		setUpdating(true);
		const drafts = getDraftReviewerAssignmentsList();

		if (!drafts.length) {
			setUpdating(false);
			showNotification.warning(
				'No Drafts to Assign',
				'There are no draft reviewer assignments to process.',
			);
			return;
		}

		try {
			if (!assignBulkReviewers) {
				throw new Error('Bulk assignment service is not available');
			}

			const result = await assignBulkReviewers({
				assignments: drafts.map((draft) => {
					const reviewerAssignments = [];
					if (draft.mainReviewerId) {
						reviewerAssignments.push({
							lecturerId: draft.mainReviewerId,
							isMainReviewer: true,
						});
					}
					if (draft.secondaryReviewerId) {
						reviewerAssignments.push({
							lecturerId: draft.secondaryReviewerId,
							isMainReviewer: false,
						});
					}
					return {
						submissionId: draft.submissionId,
						reviewerAssignments,
					};
				}),
			});

			if (result) {
				clearAllDraftReviewerDrafts();
				showNotification.success(
					'All Drafts Assigned Successfully',
					`Successfully assigned reviewers for ${result.submissionCount} group${result.submissionCount > 1 ? 's' : ''} with ${result.totalAssignedCount} total reviewer assignment${result.totalAssignedCount > 1 ? 's' : ''}.`,
				);

				// Refresh the submissions to reflect the changes
				if (milestone) {
					handleRefresh();
				}
			} else {
				showNotification.error(
					'Assignment Failed',
					'Failed to assign draft reviewers. Please try again.',
				);
			}
		} catch (error) {
			console.error('Failed to assign all draft reviewers:', error);

			const errorMessage =
				error instanceof Error ? error.message : 'An unexpected error occurred';
			showNotification.error('Bulk Assignment Failed', errorMessage);
		} finally {
			setUpdating(false);
		}
	};

	/**
	 * Save draft reviewer assignment
	 */
	const saveDraftReviewerAssignment = (
		submissionId: string,
		groupName: string,
		thesisTitle: string,
		mainReviewerId?: string,
		mainReviewerName?: string,
		secondaryReviewerId?: string,
		secondaryReviewerName?: string,
	) => {
		addDraftReviewerAssignment({
			submissionId,
			thesisTitle,
			groupName,
			mainReviewerId,
			mainReviewerName,
			secondaryReviewerId,
			secondaryReviewerName,
		});

		showNotification.success(
			'Draft Saved Successfully',
			'Reviewer assignment has been saved as draft and can be assigned later.',
		);
	};

	// Calculate draft count for force re-render
	const draftCount = getDraftReviewerAssignmentsList().length;

	return {
		updating,
		draftCount,
		getDraftReviewerAssignment,
		getDraftReviewerAssignmentsList,
		removeDraftReviewerAssignment,
		handleAssignAllDrafts,
		saveDraftReviewerAssignment,
	};
};
