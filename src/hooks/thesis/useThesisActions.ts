import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ThesisConfirmationModals } from '@/components/common/ConfirmModal';
import { TIMING } from '@/lib/constants/thesis';
import {
	THESIS_ERROR_CONFIGS,
	THESIS_SUCCESS_CONFIGS,
	handleThesisError,
	handleThesisSuccess,
} from '@/lib/utils/thesis-handlers';
import { useThesisStore } from '@/store';

export const useThesisActions = (thesisId: string) => {
	const router = useRouter();
	const { submitThesis, deleteThesis, reviewThesis, theses } = useThesisStore();

	// Loading states
	const [exitLoading, setExitLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [approveLoading, setApproveLoading] = useState(false);
	const [rejectLoading, setRejectLoading] = useState(false);

	// Modal states
	const [showDuplicate, setShowDuplicate] = useState(false);
	const [showRejectConfirm, setShowRejectConfirm] = useState(false);
	const [showApproveConfirm, setShowApproveConfirm] = useState(false);

	const handleExit = async () => {
		setExitLoading(true);
		// Small delay for smooth UX
		await new Promise((resolve) => setTimeout(resolve, TIMING.EXIT_DELAY));
		router.push('/lecturer/thesis-management');
	};

	const handleSubmit = async () => {
		// Find thesis title for confirmation modal
		const thesis = theses.find((t) => t.id === thesisId);
		const thesisTitle = thesis?.englishName ?? 'this thesis';

		// Show confirmation modal before submitting
		ThesisConfirmationModals.submit(thesisTitle, async () => {
			try {
				setSubmitLoading(true);
				const success = await submitThesis(thesisId);

				if (success) {
					handleThesisSuccess(THESIS_SUCCESS_CONFIGS.SUBMIT, router);
				} else {
					throw new Error('Submit failed');
				}
			} catch (error) {
				handleThesisError(error, THESIS_ERROR_CONFIGS.SUBMIT, setSubmitLoading);
			}
		});
	};

	const handleDelete = async () => {
		// Find thesis title for confirmation modal
		const thesis = theses.find((t) => t.id === thesisId);
		const thesisTitle = thesis?.englishName ?? 'this thesis';

		// Show confirmation modal before deleting
		ThesisConfirmationModals.delete(thesisTitle, async () => {
			try {
				setDeleteLoading(true);
				const success = await deleteThesis(thesisId);

				if (success) {
					handleThesisSuccess(THESIS_SUCCESS_CONFIGS.DELETE, router);
				} else {
					throw new Error('Delete failed');
				}
			} catch (error) {
				handleThesisError(error, THESIS_ERROR_CONFIGS.DELETE, setDeleteLoading);
			}
		});
	};

	const handleApprove = async () => {
		try {
			setApproveLoading(true);
			const success = await reviewThesis(thesisId, 'Approved');

			if (success) {
				setShowApproveConfirm(false);
				handleThesisSuccess(THESIS_SUCCESS_CONFIGS.APPROVE, router);
			} else {
				throw new Error('Approve failed');
			}
		} catch (error) {
			handleThesisError(error, THESIS_ERROR_CONFIGS.APPROVE, setApproveLoading);
		}
	};

	const handleReject = async () => {
		try {
			setRejectLoading(true);
			const success = await reviewThesis(thesisId, 'Rejected');

			if (success) {
				setShowRejectConfirm(false);
				handleThesisSuccess(THESIS_SUCCESS_CONFIGS.REJECT, router);
			} else {
				throw new Error('Reject failed');
			}
		} catch (error) {
			handleThesisError(error, THESIS_ERROR_CONFIGS.REJECT, setRejectLoading);
		}
	};

	const handleEdit = () => {
		router.push(`/lecturer/thesis-management/${thesisId}/edit-thesis`);
	};

	return {
		// Loading states
		loadingStates: {
			exitLoading,
			submitLoading,
			deleteLoading,
			approveLoading,
			rejectLoading,
		},

		// Modal states
		modalStates: {
			showDuplicate,
			showRejectConfirm,
			showApproveConfirm,
			setShowDuplicate,
			setShowRejectConfirm,
			setShowApproveConfirm,
		},

		// Action handlers
		actions: {
			handleExit,
			handleSubmit,
			handleDelete,
			handleApprove,
			handleReject,
			handleEdit,
		},
	};
};
