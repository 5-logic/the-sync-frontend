import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';

import { GroupConfirmationModals } from '@/components/common/ConfirmModal';
import groupService from '@/lib/services/groups.service';
import { showNotification } from '@/lib/utils/notification';

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
				showNotification.error('Cannot Delete Group', error, 6);
				break;
			case 404:
				// Group not found: "Group not found"
				showNotification.error(
					'Group Not Found',
					error || "The group you're trying to delete no longer exists.",
					4,
				);
				break;
			default:
				// Generic error - use the actual error message from response
				showNotification.error(
					'Delete Failed',
					error ||
						'Failed to delete the group. Please try again or contact support if the problem persists.',
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
									'Group Deleted Successfully',
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
							// Handle axios error from API
							if (error instanceof AxiosError && error.response?.data) {
								const apiResponse = error.response.data;
								// If API returns structured error response, use it
								if (apiResponse.error && apiResponse.statusCode) {
									handleDeleteError(apiResponse.error, apiResponse.statusCode);
									return;
								}
							}

							// Handle network/server errors
							handleDeleteError(
								'An unexpected error occurred. Please try again.',
								500,
							);
							console.error('Error deleting group:', error);
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
