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
				const errorMessage = response.error || "Failed to create groups";
				setError(errorMessage);

				// Get error details based on status code
				const { title: errorTitle, description: errorDescription } =
					getErrorDetails(response.statusCode || 0, errorMessage);

				showNotification.error(errorTitle, errorDescription);

				return null;
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
			let errorMessage = "An unexpected error occurred";
			let errorTitle = "Group Creation Failed";

			// Handle axios error from API
			if (err instanceof AxiosError && err.response?.data) {
				const apiResponse = err.response.data;
				// If API returns structured error response, use it
				if (apiResponse.error && apiResponse.statusCode) {
					const { title: errorTitle, description: errorDescription } =
						getErrorDetails(apiResponse.statusCode, apiResponse.error);
					setError(apiResponse.error);
					showNotification.error(errorTitle, errorDescription);
					return null;
				}
			}

			if (err instanceof Error) {
				errorMessage = err.message;

				// Handle specific error types
				if (
					err.message.includes("Network Error") ||
					err.message.includes("fetch")
				) {
					errorTitle = "Connection Error";
					errorMessage =
						"Unable to connect to the server. Please check your internet connection and try again.";
				} else if (err.message.includes("timeout")) {
					errorTitle = "Request Timeout";
					errorMessage =
						"The request took too long to complete. Please try again.";
				} else if (err.message.includes("required")) {
					errorTitle = "Missing Information";
					// Keep the original validation message
				}
			}

			setError(errorMessage);

			// Show error notification
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
