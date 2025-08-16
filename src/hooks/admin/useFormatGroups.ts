import { useState, useCallback } from "react";
import groupService from "@/lib/services/groups.service";
import { handleApiResponse, handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { ConfirmationModal } from "@/components/common/ConfirmModal";

export interface UseFormatGroupsReturn {
	isFormatting: boolean;
	formatGroups: (semesterId: string, semesterName: string) => Promise<void>;
}

/**
 * Custom hook to handle formatting groups in a semester (Admin only)
 * Provides formatted group organization functionality with proper error handling
 */
export const useFormatGroups = (): UseFormatGroupsReturn => {
	const [isFormatting, setIsFormatting] = useState(false);

	const formatGroups = useCallback(
		async (semesterId: string, semesterName: string) => {
			// Return a promise that resolves when the user confirms and the operation completes
			return new Promise<void>((resolve, reject) => {
				// Show confirmation modal before proceeding
				ConfirmationModal.show({
					title: "Format Groups",
					message: `Are you sure you want to format all groups in "${semesterName}"?`,
					details:
						"This will reorganize group codes and prioritize groups with students.",
					note: "Groups with students will be placed first, empty groups will be placed at the end. Group codes will be updated to follow the standardized format.",
					noteType: "warning",
					okText: "Yes, Format Groups",
					okType: "primary",
					onOk: async () => {
						try {
							setIsFormatting(true);

							const response =
								await groupService.formatGroupsInSemester(semesterId);
							const result = handleApiResponse(response);

							if (result.success && result.data) {
								const formattedCount = result.data.length;
								showNotification.success(
									"Groups Formatted Successfully",
									`${formattedCount} groups in "${semesterName}" have been reorganized and their codes have been updated.`,
								);
								resolve(); // Resolve the promise on success
							} else {
								showNotification.error(
									"Format Failed",
									result.error?.message || "Failed to format groups",
								);
								reject(
									new Error(result.error?.message || "Failed to format groups"),
								);
							}
						} catch (error) {
							const { message } = handleApiError(
								error,
								"Failed to format groups",
							);
							showNotification.error("Format Failed", message);
							reject(error instanceof Error ? error : new Error(message));
						} finally {
							setIsFormatting(false);
						}
					},
					onCancel: () => {
						// Reject when user cancels the operation
						reject(new Error("User cancelled the operation"));
					},
				});
			});
		},
		[],
	);

	return {
		isFormatting,
		formatGroups,
	};
};
