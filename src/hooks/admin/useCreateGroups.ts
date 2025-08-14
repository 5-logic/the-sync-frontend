import { useState } from "react";
import { message } from "antd";

import groupService from "@/lib/services/groups.service";
import { CreateMultipleGroupsRequest, CreatedGroup } from "@/schemas/group";
import { useGroupsStore } from "@/store/useGroupsStore";

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
				throw new Error(response.error || "Failed to create groups");
			}

			// Show success message
			message.success(`Successfully created ${response.data.length} groups`);

			// Refresh groups data to reflect the new groups
			await refetchGroups();

			return response.data;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An unexpected error occurred";
			setError(errorMessage);

			// Show error message
			message.error(errorMessage);

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
