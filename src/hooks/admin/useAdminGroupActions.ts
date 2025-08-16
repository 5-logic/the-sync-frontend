import { useState, useCallback } from "react";

import groupService from "@/lib/services/groups.service";
import { showNotification } from "@/lib/utils/notification";
import { GroupConfirmationModals } from "@/components/common/ConfirmModal";

/**
 * Hook for admin-specific group actions like delete
 * Provides clean code patterns and proper error handling
 */
export const useAdminGroupActions = () => {
	const [loading, setLoading] = useState(false);

	/**
	 * Handle different types of delete errors based on backend response
	 */
	const handleDeleteError = useCallback((error: string, statusCode: number) => {
		switch (statusCode) {
			case 400:
				// Group contains students: "Cannot delete group SU25QN004. Group contains 5 student(s)"
				showNotification.error("Cannot Delete Group", error, 6);
				break;
			case 404:
				// Group not found: "Group not found"
				showNotification.error(
					"Group Not Found",
					"The group you're trying to delete no longer exists.",
					4,
				);
				break;
			default:
				// Generic error
				showNotification.error(
					"Delete Failed",
					"Failed to delete the group. Please try again or contact support if the problem persists.",
					4,
				);
		}
	}, []);

	/**
	 * Delete a group with admin privileges
	 * Shows confirmation modal and handles success/error states based on backend response
	 */
	const deleteGroup = useCallback(
		async (
			groupId: string,
			groupName: string,
			onSuccess?: () => void,
		): Promise<void> => {
			return new Promise((resolve) => {
				GroupConfirmationModals.deleteGroup(
					groupName,
					async () => {
						try {
							setLoading(true);

							const response = await groupService.deleteGroupAdmin(groupId);

							if (response.success) {
								// Handle success response: {"success":true,"statusCode":200,"data":true}
								showNotification.success(
									"Group Deleted Successfully",
									`Group "${groupName}" has been permanently deleted.`,
									5,
								);

								// Call success callback to refresh data
								onSuccess?.();
							} else {
								// Handle API error response
								handleDeleteError(response.error, response.statusCode);
							}
						} catch (error: unknown) {
							// Handle network/server errors
							handleDeleteError(
								"An unexpected error occurred. Please try again.",
								500,
							);
							console.error("Error deleting group:", error);
						} finally {
							setLoading(false);
							resolve();
						}
					},
					loading,
					true, // isAdminMode
				);
			});
		},
		[loading, handleDeleteError],
	);

	/**
	 * Check if the current user has admin privileges
	 * (This would typically come from auth context/store)
	 */
	const isAdmin = useCallback(() => {
		// This should be implemented based on your auth system
		// For now, return true assuming admin context
		return true;
	}, []);

	return {
		deleteGroup,
		loading,
		isAdmin,
	};
};
