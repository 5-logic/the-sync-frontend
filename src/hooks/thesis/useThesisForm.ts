import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useSessionData } from "@/hooks/auth/useAuth";
import { TIMING } from "@/lib/constants/thesis";
import { showNotification } from "@/lib/utils/notification";
import {
	THESIS_SUCCESS_CONFIGS,
	handleThesisSuccess,
} from "@/lib/utils/thesis-handlers";
import {
	ThesisCreate,
	ThesisUpdate,
	ThesisWithRelations,
} from "@/schemas/thesis";
import { useThesisStore } from "@/store";

interface UseThesisFormOptions {
	mode: "create" | "edit";
	thesisId?: string;
	thesis?: ThesisWithRelations | null;
}

export const useThesisForm = ({
	mode,
	thesisId,
	thesis,
}: UseThesisFormOptions) => {
	const router = useRouter();
	const { session } = useSessionData();
	const { createThesis, updateThesis } = useThesisStore();

	const [loading, setLoading] = useState(false);

	// Transform thesis data for form initial values
	const getFormInitialValues = useCallback(() => {
		if (mode === "create" || !thesis) return undefined;

		return {
			englishName: thesis.englishName,
			vietnameseName: thesis.vietnameseName,
			abbreviation: thesis.abbreviation,
			description: thesis.description,
			domain: thesis.domain,
			orientation: thesis.orientation,
		};
	}, [mode, thesis]);

	// Get initial file info for edit mode
	const getInitialFile = useCallback(() => {
		if (mode === "create" || !thesis) return null;

		// Extract supporting document from thesisVersions (latest version)
		const latestVersion = thesis.thesisVersions?.[0];
		if (!latestVersion?.supportingDocument) return null;

		// Extract filename from URL
		const url = latestVersion.supportingDocument;
		const urlParts = url.split("/");
		const lastPart = urlParts[urlParts.length - 1] ?? "";
		const filename = lastPart === "" ? "thesis-document.docx" : lastPart;

		return {
			name: filename,
			size: 0, // We don't have size info from API
			url: url,
		};
	}, [mode, thesis]);

	// Helper functions to reduce cognitive complexity
	const validateAuthentication = useCallback(() => {
		if (!session?.user?.id) {
			showNotification.error("Error", "User not authenticated");
			return false;
		}
		return true;
	}, [session?.user?.id]);

	const handleCreateThesis = useCallback(
		async (values: Record<string, unknown>) => {
			const data = values as ThesisCreate;
			const thesisData: ThesisCreate = { ...data };
			const success = await createThesis(thesisData);

			if (success) {
				handleThesisSuccess(
					{
						...THESIS_SUCCESS_CONFIGS.CREATE,
						redirectDelay: TIMING.REDIRECT_DELAY,
					},
					router,
				);
			}
			// Don't throw error here - let the store handle error notifications
			// The store already shows specific error messages from backend
			return success;
		},
		[createThesis, router],
	);

	const handleEditThesis = useCallback(
		async (values: Record<string, unknown>) => {
			if (!thesisId) throw new Error("Thesis ID is required for update");

			const success = await updateThesis(thesisId, values as ThesisUpdate);

			if (success) {
				showNotification.success("Success", "Thesis updated successfully!");
				router.push("/lecturer/thesis-management");
			}
			// Don't throw error here - let the store handle error notifications
			// The store already shows specific error messages from backend
			return success;
		},
		[thesisId, updateThesis, router],
	);

	// Handle form submission for both create and edit
	const handleSubmit = useCallback(
		async (values: Record<string, unknown>) => {
			if (!validateAuthentication()) return;

			try {
				setLoading(true);

				if (mode === "create") {
					const success = await handleCreateThesis(values);
					// Don't call handleError for create mode - store already handles errors
					if (!success) {
						setLoading(false);
					}
				} else {
					const success = await handleEditThesis(values);
					// Don't call handleError for edit mode either - store already handles errors
					if (!success) {
						setLoading(false);
					}
				}
			} catch (error) {
				// Only handle unexpected errors (like missing thesisId)
				console.error("Unexpected error in thesis form:", error);
				setLoading(false);
			}
		},
		[validateAuthentication, mode, handleCreateThesis, handleEditThesis],
	);

	return {
		loading,
		handleSubmit,
		getFormInitialValues,
		getInitialFile,
	};
};
