import { useCallback, useState } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmModal";
import { useCurrentSemester } from "@/hooks/semester";
import { useSemesterStatus } from "@/hooks/student/useSemesterStatus";
import { useStudentGroupStatus } from "@/hooks/student/useStudentGroupStatus";
import groupService from "@/lib/services/groups.service";
import thesisService from "@/lib/services/theses.service";
import { handleApiResponse, handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";

export const useThesisRegistration = () => {
	const [isRegistering, setIsRegistering] = useState(false);
	const { group } = useStudentGroupStatus();
	const { refreshStatus } = useSemesterStatus();
	const { currentSemester } = useCurrentSemester();

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
				title: "Submit Application",
				message:
					"Are you sure you want to submit an application for this thesis?",
				details: thesisTitle || "Selected thesis",
				note: "Your application will be reviewed by the lecturer. You can track its status in the Apply Thesis Request page.",
				noteType: "info",
				okText: "Submit Application",
				cancelText: "Cancel",
				okType: "primary",
				loading: isRegistering,
				onOk: async () => {
					try {
						setIsRegistering(true);

						// Check if current semester is available
						if (!currentSemester) {
							throw new Error("Current semester not found");
						}

						// Call the new thesis-application API
						const response = await thesisService.applyForThesis(
							currentSemester.id,
							group.id,
							thesisId,
						);
						const result = handleApiResponse(response, "Success");

						handleSuccessResponse(
							result,
							"Application Submitted",
							"Your thesis application has been submitted successfully! You can track its status in the Apply Thesis Request page.",
							"Application submission failed",
							() => {
								// Call the success callback immediately to update UI
								onSuccess?.();
							},
						);
					} catch (error) {
						console.error("Error registering thesis:", error);

						// Use handleApiError to extract error message from backend
						const apiError = handleApiError(
							error,
							"Failed to register for this thesis. Please try again.",
						);

						showNotification.error("Registration Failed", apiError.message);
					} finally {
						setIsRegistering(false);
					}
				},
			});
		},
		[group, currentSemester, isRegistering, handleSuccessResponse],
	);

	const unregisterThesis = useCallback(
		async (thesisTitle?: string, onSuccess?: () => void) => {
			// Check if user has group and is leader
			if (!group) {
				showNotification.error(
					"No Group Found",
					"You must be in a group to unpick a thesis.",
				);
				return;
			}

			// Show confirmation modal immediately
			ConfirmationModal.show({
				title: "Unpick Thesis",
				message: "Are you sure you want to unpick this thesis from your group?",
				details: thesisTitle || "Current thesis",
				note: "This action will remove the thesis assignment from your group.",
				noteType: "warning",
				okText: "Unpick",
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
								"Thesis Unpicked Successfully",
								"Your group has unpicked the thesis successfully!",
							);
							onSuccess?.();
						} else {
							// Show error message from backend
							showNotification.error(
								"Unpick Failed",
								result.error?.message ||
									"Failed to unpick this thesis. Please try again.",
							);
						}
					} catch (error) {
						console.error("Error unpicking thesis:", error);
						showNotification.error(
							"Unpick Failed",
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
