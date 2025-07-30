import { AxiosError, AxiosResponse } from 'axios';

export interface DefenseResultsApiError {
	message: string;
	statusCode?: number;
}

export interface DefenseResultsApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: DefenseResultsApiError;
}

/**
 * Extract error message from API response following project pattern
 */
export const extractApiErrorMessage = (error: unknown): string => {
	const defaultMessage = 'Failed to update defense results. Please try again.';

	// Handle Axios errors
	if (error && typeof error === 'object' && 'response' in error) {
		const axiosError = error as AxiosError<{
			error?: string;
			message?: string;
		}>;
		return (
			axiosError.response?.data?.error ||
			axiosError.response?.data?.message ||
			axiosError.message ||
			defaultMessage
		);
	}

	// Handle string errors
	if (typeof error === 'string') {
		return error;
	}

	// Handle generic errors
	if (error instanceof Error) {
		return error.message;
	}

	return defaultMessage;
};

/**
 * Extract success message from API response following project pattern
 */
export const extractApiSuccessMessage = (
	response: unknown,
	defaultMessage: string,
): string => {
	if (response && typeof response === 'object') {
		// Handle Axios response
		if ('data' in response) {
			const axiosResponse = response as AxiosResponse<{
				message?: string;
				data?: { message?: string };
			}>;
			return (
				axiosResponse.data?.message ||
				axiosResponse.data?.data?.message ||
				defaultMessage
			);
		}

		// Handle direct API response
		const apiResponse = response as { message?: string };
		return apiResponse.message || defaultMessage;
	}

	return defaultMessage;
};

/**
 * Semester status utilities
 */
export interface SemesterStatus {
	status: string;
	ongoingPhase?: string | null;
}

export const SemesterPhase = {
	NOT_YET: 'NotYet',
	PREPARING: 'Preparing',
	PICKING: 'Picking',
	ONGOING: 'Ongoing',
	END: 'End',
} as const;

export const OngoingPhase = {
	SCOPE_ADJUSTABLE: 'ScopeAdjustable',
	SCOPE_LOCKED: 'ScopeLocked',
} as const;

/**
 * Determine default dropdown status based on semester phase
 * Business rule: Defense phase only during Ongoing+ScopeLocked OR End status
 */
export const getDefaultStatusBySemester = (
	semester: SemesterStatus | null,
): 'NotYet' | 'Ongoing' => {
	if (!semester) return 'NotYet';

	const { status, ongoingPhase } = semester;

	// Defense phase conditions
	const isDefensePhase =
		(status === SemesterPhase.ONGOING &&
			ongoingPhase === OngoingPhase.SCOPE_LOCKED) ||
		status === SemesterPhase.END;

	return isDefensePhase ? 'Ongoing' : 'NotYet';
};

/**
 * Create status update summary for confirmations
 */
export const createStatusUpdateSummary = (
	statusUpdates: Record<string, string>,
): string => {
	const counts = Object.values(statusUpdates).reduce(
		(acc, status) => {
			if (status === 'Passed') acc.passed++;
			if (status === 'Failed') acc.failed++;
			return acc;
		},
		{ passed: 0, failed: 0 },
	);

	const parts: string[] = [];
	if (counts.passed > 0)
		parts.push(`${counts.passed} student(s) will be marked as Passed`);
	if (counts.failed > 0)
		parts.push(`${counts.failed} student(s) will be marked as Failed`);

	return parts.join(', ');
};
