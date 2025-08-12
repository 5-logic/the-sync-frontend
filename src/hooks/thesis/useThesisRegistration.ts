import { useCallback, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import groupService from "@/lib/services/groups.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";

export const useThesisRegistration = () => {
	const [isRegistering, setIsRegistering] = useState(false);
	const { group } = useStudentGroupStatus();
	const { refreshStatus } = useSemesterStatus();

	// Common success handler for both register and unregister
	const handleSuccessResponse = useCallback(
		(
			result: { success: boolean; error?: { message?: string } },
			successTitle: string,
			successMessage: string,
			errorMessage: string,
			onSuccess?: () => void,
		) => {
			if (result.success) {
				showNotification.success(successTitle, successMessage);
				// Refresh semester status and group data
				refreshStatus();
				// Call success callback to refresh UI
				onSuccess?.();
			} else {
				throw new Error(result.error?.message || errorMessage);
			}
		},
		[refreshStatus],
	);

	const registerThesis = useCallback(
		async (thesisId: string, thesisTitle?: string, onSuccess?: () => void) => {
			// Check if user has group and is leader
			if (!group) {
				showNotification.error(
					"No Group Found",
					"You must be in a group to register for a thesis.",
				);
				return;
			}

			// Show confirmation modal immediately
			ConfirmationModal.show({
				title: "Register Thesis",
				message:
					"Are you sure you want to register your group for this thesis?",
				details: thesisTitle || "Selected thesis",
				note: "This action will assign the thesis to your group and cannot be easily undone.",
				noteType: "warning",
				okText: "Register",
				cancelText: "Cancel",
				okType: "primary",
				loading: isRegistering,
				onOk: async () => {
					try {
						setIsRegistering(true);

						// Call the pick-thesis API
						const response = await groupService.pickThesis(group.id, thesisId);
						const result = handleApiResponse(response, "Success");

						handleSuccessResponse(
							result,
							"Registration Successful",
							"Your group has been registered for this thesis successfully!",
							"Registration failed",
							onSuccess,
						);
					} catch (error) {
						console.error("Error registering thesis:", error);
						showNotification.error(
							"Registration Failed",
							"Failed to register for this thesis. Please try again.",
						);
					} finally {
						setIsRegistering(false);
					}
				},
			});
		},
		[group, isRegistering, handleSuccessResponse],
	);

	const unregisterThesis = useCallback(
		async (thesisTitle?: string, onSuccess?: () => void) => {
			// Check if user has group and is leader
			if (!group) {
				showNotification.error(
					"No Group Found",
					"You must be in a group to unregister from a thesis.",
				);
				return;
			}

			// Show confirmation modal immediately
			ConfirmationModal.show({
				title: "Unregister Thesis",
				message:
					"Are you sure you want to unregister your group from this thesis?",
				details: thesisTitle || "Current thesis",
				note: "This action will remove the thesis assignment from your group.",
				noteType: "warning",
				okText: "Unregister",
				cancelText: "Cancel",
				okType: "danger",
				loading: isRegistering,
				onOk: async () => {
					try {
						setIsRegistering(true);

						// Call the unpick-thesis API
						const response = await groupService.unpickThesis(group.id);
						const result = handleApiResponse(response);

						if (result.success) {
							showNotification.success(
								"Unregistration Successful",
								"Your group has been unregistered from the thesis successfully!",
							);
							onSuccess?.();
						} else {
							// Show error message from backend
							showNotification.error(
								"Unregistration Failed",
								result.error?.message ||
									"Failed to unregister from this thesis. Please try again.",
							);
						}
					} catch (error) {
						console.error("Error unregistering thesis:", error);
						showNotification.error(
							"Unregistration Failed",
							"An unexpected error occurred. Please try again.",
						);
					} finally {
						setIsRegistering(false);
					}
				},
			});
		},
		[group, isRegistering],
	);

	return {
		registerThesis,
		unregisterThesis,
		isRegistering,
	};
};
