import { useCallback, useState } from "react";

import { useCurrentSemester } from "@/hooks/semester";
import thesisApplicationService, {
	ThesisApplication,
} from "@/lib/services/thesis-application.service";
import { handleApiResponse, handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";

export const useRequestApplyThesis = () => {
	const [applications, setApplications] = useState<ThesisApplication[]>([]);
	const [loading, setLoading] = useState(false);
	const { currentSemester } = useCurrentSemester();

	// Fetch thesis applications by semester
	const fetchApplications = useCallback(async () => {
		if (!currentSemester) return;

		try {
			setLoading(true);
			const response =
				await thesisApplicationService.getThesisApplicationsBySemester(
					currentSemester.id,
				);
			const result = handleApiResponse(response, "Success");

			if (result.success && result.data) {
				setApplications(result.data);
			}
		} catch (error) {
			console.error("Error fetching thesis applications:", error);
			const apiError = handleApiError(
				error,
				"Failed to fetch thesis applications.",
			);
			showNotification.error("Error", apiError.message);
		} finally {
			setLoading(false);
		}
	}, [currentSemester]);

	// Update application status (approve/reject)
	const updateApplicationStatus = useCallback(
		async (
			groupId: string,
			thesisId: string,
			status: "Approved" | "Rejected",
		) => {
			try {
				const response =
					await thesisApplicationService.updateThesisApplicationStatus(
						groupId,
						thesisId,
						status,
					);
				const result = handleApiResponse(response, "Success");

				if (result.success) {
					showNotification.success(
						"Status Updated",
						`Application has been ${status.toLowerCase()} successfully!`,
					);
					// Refresh applications
					fetchApplications();
				}
			} catch (error) {
				console.error("Error updating application status:", error);
				const apiError = handleApiError(
					error,
					`Failed to ${status.toLowerCase()} application.`,
				);
				showNotification.error("Error", apiError.message);
			}
		},
		[fetchApplications],
	);

	return {
		applications,
		loading,
		fetchApplications,
		updateApplicationStatus,
	};
};
