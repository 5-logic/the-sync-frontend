import { useState } from "react";
import { AxiosError } from "axios";

import groupService from "@/lib/services/groups.service";
import { CreateMultipleGroupsRequest, CreatedGroup } from "@/schemas/group";
import { useGroupsStore } from "@/store/useGroupsStore";
import { showNotification } from "@/lib/utils/notification";

interface UseCreateGroupsResult {
	createGroups: (
		request: CreateMultipleGroupsRequest,
	) => Promise<CreatedGroup[] | null>;
	isCreating: boolean;
	error: string | null;
}

/**
 * Helper function to get error details based on status code
 */
const getErrorDetails = (statusCode: number, errorMessage: string) => {
	if (statusCode === 404) {
		return {
			title: "Semester Not Found",
			description:
				errorMessage ||
				"The selected semester does not exist. Please refresh and try again.",
		};
	}
	if (statusCode === 400) {
		return {
			title: "Cannot Create Groups",
			description: errorMessage,
		};
	}
	if (statusCode === 403) {
		return {
			title: "Access Denied",
			description:
				errorMessage ||
				"You don't have permission to create groups. Admin access required.",
		};
	}
	if (statusCode >= 500) {
		return {
			title: "Server Error",
			description:
				errorMessage ||
				"A server error occurred. Please try again later or contact support.",
		};
	}
	return {
		title: "Group Creation Failed",
		description: errorMessage,
	};
};

/**
 * Helper function to handle API response errors
 */
const handleApiResponseError = (
	response: { success: boolean; error?: string; statusCode?: number },
	setError: (error: string) => void,
) => {
	const errorMessage = response.error || "Failed to create groups";
	setError(errorMessage);

	const { title: errorTitle, description: errorDescription } = getErrorDetails(
		response.statusCode || 0,
		errorMessage,
	);

	showNotification.error(errorTitle, errorDescription);
	return null;
};

/**
 * Helper function to handle axios errors
 */
const handleAxiosError = (
	err: AxiosError,
	setError: (error: string) => void,
) => {
	const apiResponse = err.response?.data as {
		error?: string;
		statusCode?: number;
	};
	if (apiResponse?.error && apiResponse?.statusCode) {
		const { title: errorTitle, description: errorDescription } =
			getErrorDetails(apiResponse.statusCode, apiResponse.error);
		setError(apiResponse.error);
		showNotification.error(errorTitle, errorDescription);
		return true; // Handled
	}
	return false; // Not handled
};

/**
 * Helper function to get error message and title based on error type
 */
const getErrorMessageAndTitle = (err: Error) => {
	let errorMessage = err.message;
	let errorTitle = "Group Creation Failed";

	if (err.message.includes("Network Error") || err.message.includes("fetch")) {
		errorTitle = "Connection Error";
		errorMessage =
			"Unable to connect to the server. Please check your internet connection and try again.";
	} else if (err.message.includes("timeout")) {
		errorTitle = "Request Timeout";
		errorMessage = "The request took too long to complete. Please try again.";
	} else if (err.message.includes("required")) {
		errorTitle = "Missing Information";
		// Keep the original validation message
	}

	return { errorMessage, errorTitle };
};

/**
 * Hook for creating multiple groups (Admin only)
 * Handles the API call, loading state, error handling, and store updates
 */
export const useCreateGroups = (): UseCreateGroupsResult => {
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { refetch: refetchGroups } = useGroupsStore();

	const createGroups = async (
		request: CreateMultipleGroupsRequest,
	): Promise<CreatedGroup[] | null> => {
		setIsCreating(true);
		setError(null);

		try {
			// Validate input
			if (!request.semesterId || !request.numberOfGroup) {
				throw new Error("Semester ID and number of groups are required");
			}

			if (request.numberOfGroup < 1) {
				throw new Error("Number of groups must be at least 1");
			}

			const response = await groupService.createMultipleGroups(request);

			if (!response.success) {
				return handleApiResponseError(response, setError);
			}

			// Show success notification with backend response data
			const groupCodes = response.data.map((group) => group.code).join(", ");

			showNotification.success(
				"Groups Created Successfully",
				`Successfully created ${response.data.length} groups: ${groupCodes}`,
				6, // Show longer for user to read group codes
			);

			// Refresh groups data to reflect the new groups
			await refetchGroups();

			return response.data;
		} catch (err) {
			// Handle axios error from API
			if (err instanceof AxiosError && err.response?.data) {
				const wasHandled = handleAxiosError(err, setError);
				if (wasHandled) {
					return null;
				}
			}

			// Handle other error types
			const defaultErrorMessage = "An unexpected error occurred";
			let errorMessage = defaultErrorMessage;
			let errorTitle = "Group Creation Failed";

			if (err instanceof Error) {
				const { errorMessage: msg, errorTitle: title } =
					getErrorMessageAndTitle(err);
				errorMessage = msg;
				errorTitle = title;
			}

			setError(errorMessage);
			showNotification.error(errorTitle, errorMessage);
			return null;
		} finally {
			setIsCreating(false);
		}
	};

	return {
		createGroups,
		isCreating,
		error,
	};
};
