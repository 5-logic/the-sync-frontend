import { useCallback, useState } from "react";

import { useCurrentSemester } from "@/hooks/semester";
import { ThesisWithRequests } from "@/types/thesis-requests";
import httpClient from "@/lib/services/_httpClient";
import { ApiResponse } from "@/schemas/_common";
import { handleApiResponse, handleApiError } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";

export const useThesisRequests = () => {
	const [thesesWithRequests, setThesesWithRequests] = useState<
		ThesisWithRequests[]
	>([]);
	const [loading, setLoading] = useState(false);
	const { currentSemester } = useCurrentSemester();

	// Fetch thesis requests by semester
	const fetchThesisRequests = useCallback(async () => {
		if (!currentSemester) return;

		try {
			setLoading(true);
			const response = await httpClient.get<ApiResponse<ThesisWithRequests[]>>(
				`/thesis-application/${currentSemester.id}`,
			);
			const result = handleApiResponse(response.data, "Success");

			if (result.success && result.data) {
				setThesesWithRequests(result.data);
			}
		} catch (error) {
			console.error("Error fetching thesis requests:", error);
			const apiError = handleApiError(
				error,
				"Failed to fetch thesis requests.",
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
				const response = await httpClient.patch<ApiResponse<unknown>>(
					`/thesis-application/status`,
					{
						groupId,
						thesisId,
						status,
					},
				);

				const result = handleApiResponse(response.data, "Success");

				if (result.success) {
					showNotification.success(
						"Success",
						`Application ${status.toLowerCase()} successfully.`,
					);
					// Refresh data after status update
					await fetchThesisRequests();
				}
			} catch (error) {
				console.error("Error updating application status:", error);
				const apiError = handleApiError(
					error,
					"Failed to update application status.",
				);
				showNotification.error("Error", apiError.message);
			}
		},
		[fetchThesisRequests],
	);

	return {
		thesesWithRequests,
		loading,
		fetchThesisRequests,
		updateApplicationStatus,
	};
};
