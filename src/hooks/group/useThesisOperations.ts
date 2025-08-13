import { useCallback } from "react";
import { ConfirmationModal } from "@/components/common/ConfirmModal";
import groupService from "@/lib/services/groups.service";
import thesesService from "@/lib/services/theses.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { GroupDashboard } from "@/schemas/group";
import { Thesis } from "@/schemas/thesis";

interface UseThesisOperationsProps {
	group: GroupDashboard | null;
	groupId: string;
	refreshGroupAndTheses: () => Promise<void>;
	handleThesisOperationError: (
		error: unknown,
		operation: "assign" | "unassign",
	) => void;
	setIsThesisDetailModalOpen: (open: boolean) => void;
	setViewingThesis: (thesis: Thesis | null) => void;
	setUnassignThesisLoading: (loading: boolean) => void;
	unassignThesisLoading: boolean;
}

export const useThesisOperations = ({
	group,
	groupId,
	refreshGroupAndTheses,
	handleThesisOperationError,
	setIsThesisDetailModalOpen,
	setViewingThesis,
	setUnassignThesisLoading,
	unassignThesisLoading,
}: UseThesisOperationsProps) => {
	// Handle thesis selection
	const handleThesisSelection = useCallback(
		(selectedRowKeys: React.Key[], selectedRows: Thesis[]) => {
			return {
				selectedRowKeys,
				selectedThesis: selectedRows[0] || null,
			};
		},
		[],
	);

	// Handle view thesis detail
	const handleViewThesisDetail = useCallback(
		(thesis: Thesis) => {
			setViewingThesis(thesis);
			setIsThesisDetailModalOpen(true);
			return { showUnassignButton: false }; // From AvailableTheses table
		},
		[setViewingThesis, setIsThesisDetailModalOpen],
	);

	// Handle view group's thesis detail
	const handleViewGroupThesisDetail = useCallback(async () => {
		if (group?.thesis?.id) {
			try {
				const response = await thesesService.findOne(group.thesis.id);
				const result = handleApiResponse(response);
				if (result.success && result.data) {
					setViewingThesis(result.data);
					setIsThesisDetailModalOpen(true);
					return { showUnassignButton: true }; // From Group's Thesis card
				}
			} catch (error) {
				console.error("Error fetching thesis details:", error);
				showNotification.error("Error", "Failed to load thesis details");
			}
		}
		// Return default value if no thesis or error
		return { showUnassignButton: false };
	}, [group?.thesis?.id, setViewingThesis, setIsThesisDetailModalOpen]);

	// Handle unassign thesis
	const handleUnassignThesis = useCallback(() => {
		if (!group?.thesis) return;

		ConfirmationModal.show({
			title: "Unassign Thesis",
			message: "Are you sure you want to unassign this thesis from the group?",
			details: `${group.thesis.englishName} (${group.thesis.abbreviation})`,
			note: "This action will remove the thesis assignment from the group. The thesis will become available for other groups.",
			noteType: "warning",
			okText: "Yes, Unassign",
			okType: "danger",
			onOk: async () => {
				try {
					setUnassignThesisLoading(true);
					const response = await groupService.unpickThesis(groupId);
					const result = handleApiResponse(response);

					if (result.success) {
						showNotification.success(
							"Thesis Unassigned",
							"Thesis has been unassigned from the group successfully!",
						);

						setIsThesisDetailModalOpen(false);
						setViewingThesis(null);
						await refreshGroupAndTheses();
					} else {
						showNotification.error(
							"Unassignment Failed",
							result.error?.message || "Failed to unassign thesis from group",
						);
					}
				} catch (error) {
					handleThesisOperationError(error, "unassign");
				} finally {
					setUnassignThesisLoading(false);
				}
			},
			loading: unassignThesisLoading,
		});
	}, [
		group?.thesis,
		groupId,
		refreshGroupAndTheses,
		handleThesisOperationError,
		setIsThesisDetailModalOpen,
		setViewingThesis,
		setUnassignThesisLoading,
		unassignThesisLoading,
	]);

	return {
		handleThesisSelection,
		handleViewThesisDetail,
		handleViewGroupThesisDetail,
		handleUnassignThesis,
	};
};
