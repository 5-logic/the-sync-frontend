import { useCallback, useState } from 'react';

import submissionService from '@/lib/services/submissions.service';
import { handleApiError } from '@/lib/utils';
import { SubmissionDetail } from '@/schemas/submission';

interface UseSubmissionReturn {
	submission: SubmissionDetail | null;
	loading: boolean;
	error: string | null;
	fetchSubmission: (groupId: string, milestoneId: string) => Promise<void>;
	clearSubmission: () => void;
}

export function useSubmission(): UseSubmissionReturn {
	const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSubmission = useCallback(
		async (groupId: string, milestoneId: string) => {
			if (!groupId || !milestoneId) return;

			setLoading(true);
			setError(null);

			try {
				const response =
					await submissionService.getSubmissionByGroupAndMilestone(
						groupId,
						milestoneId,
					);

				if (response.success) {
					setSubmission(response.data);
				} else {
					const errorDetails = handleApiError(new Error(response.error));
					setError(errorDetails.message);
					setSubmission(null);
				}
			} catch (err) {
				const errorDetails = handleApiError(err);
				setError(errorDetails.message);
				setSubmission(null);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const clearSubmission = useCallback(() => {
		setSubmission(null);
		setError(null);
	}, []);

	return {
		submission,
		loading,
		error,
		fetchSubmission,
		clearSubmission,
	};
}
