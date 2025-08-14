import { useState } from "react";

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

				// Show more specific error messages based on status code
				let errorTitle = "Group Creation Failed";
				let errorDescription = errorMessage;

				// Handle specific error cases
				if (response.statusCode === 404) {
					errorTitle = "Semester Not Found";
					errorDescription =
						"The selected semester does not exist. Please refresh and try again.";
				} else if (response.statusCode === 400) {
					errorTitle = "Invalid Request";
					errorDescription = errorMessage;
				} else if (response.statusCode === 403) {
					errorTitle = "Access Denied";
					errorDescription =
						"You don't have permission to create groups. Admin access required.";
				} else if (response.statusCode >= 500) {
					errorTitle = "Server Error";
					errorDescription =
						"A server error occurred. Please try again later or contact support.";
				}

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
