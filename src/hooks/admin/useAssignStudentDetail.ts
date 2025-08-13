import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useCurrentSemester } from "@/hooks/semester/useCurrentSemester";
import groupService from "@/lib/services/groups.service";
import thesesService from "@/lib/services/theses.service";
import { handleApiError, handleApiResponse } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { GroupDashboard } from "@/schemas/group";
import { Thesis } from "@/schemas/thesis";
import { useMajorStore } from "@/store/useMajorStore";
import { useSemesterStore } from "@/store/useSemesterStore";
import { useStudentStore } from "@/store/useStudentStore";

export const useAssignStudentDetail = () => {
	const params = useParams();
	const groupId = params.id as string;

	// State
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [filters, setFilters] = useState({
		keyword: "",
		major: "All",
	});
	const [thesisFilters, setThesisFilters] = useState({
		keyword: "",
		semester: "All",
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [group, setGroup] = useState<GroupDashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [assignLoading, setAssignLoading] = useState(false);

	// Thesis-related states
	const [availableTheses, setAvailableTheses] = useState<Thesis[]>([]);
	const [selectedThesisKeys, setSelectedThesisKeys] = useState<React.Key[]>([]);
	const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
	const [thesesLoading, setThesesLoading] = useState(false);
	const [isThesisDetailModalOpen, setIsThesisDetailModalOpen] = useState(false);
	const [isAssignThesisModalOpen, setIsAssignThesisModalOpen] = useState(false);
	const [viewingThesis, setViewingThesis] = useState<Thesis | null>(null);
	const [showUnassignButton, setShowUnassignButton] = useState(false);
	const [assignThesisLoading, setAssignThesisLoading] = useState(false);
	const [unassignThesisLoading, setUnassignThesisLoading] = useState(false);

	// Stores
	const {
		students,
		fetchStudentsWithoutGroup,
		loading: studentsLoading,
	} = useStudentStore();
	const { majors, fetchMajors } = useMajorStore();
	const { semesters, fetchSemesters } = useSemesterStore();
	const { currentSemester } = useCurrentSemester();

	// Helper function to handle thesis operation errors
	const handleThesisOperationError = useCallback(
		(error: unknown, operation: "assign" | "unassign") => {
			const operationText = operation === "assign" ? "assign" : "unassign";
			const titleText = operation === "assign" ? "Assignment" : "Unassignment";

			console.error(`Error ${operationText}ing thesis:`, error);
			const { message } = handleApiError(
				error,
				`Failed to ${operationText} thesis ${operation === "assign" ? "to" : "from"} group`,
			);
			showNotification.error(`${titleText} Failed`, message);
		},
		[],
	);

	// Fetch available theses
	const fetchAvailableTheses = useCallback(async () => {
		try {
			setThesesLoading(true);
			const response = await thesesService.findAllWithSemester();
			const result = handleApiResponse(response);

			if (result.success && result.data) {
				const availableTheses = result.data.filter(
					(thesis) => thesis.status === "Approved" && !thesis.groupId,
				);
				setAvailableTheses(availableTheses);
			}
		} catch (error) {
			console.error("Error fetching available theses:", error);
		} finally {
			setThesesLoading(false);
		}
	}, []);

	// Helper function to refresh group data and available theses
	const refreshGroupAndTheses = useCallback(async () => {
		const groupResponse = await groupService.findOne(groupId);
		const groupResult = handleApiResponse(groupResponse);
		if (groupResult.success && groupResult.data) {
			setGroup(groupResult.data);
		}
		fetchAvailableTheses();
	}, [groupId, fetchAvailableTheses]);

	// Fetch group data
	useEffect(() => {
		const fetchGroupData = async () => {
			try {
				setLoading(true);
				const response = await groupService.findOne(groupId);
				const result = handleApiResponse(response, "Success");

				if (result.success && result.data) {
					setGroup(result.data);
					if (result.data.semester?.id) {
						fetchStudentsWithoutGroup(result.data.semester.id);
					}
				} else {
					console.error("Failed to fetch group:", result.error);
				}
			} catch (error) {
				console.error("Error fetching group:", error);
			} finally {
				setLoading(false);
			}
		};

		if (groupId) {
			fetchGroupData();
			fetchMajors();
			fetchSemesters();
			fetchAvailableTheses();
		}
	}, [
		groupId,
		fetchMajors,
		fetchSemesters,
		fetchStudentsWithoutGroup,
		fetchAvailableTheses,
	]);

	// Set default semester filter when current semester is available
	useEffect(() => {
		if (currentSemester && thesisFilters.semester === "All") {
			setThesisFilters((prev) => ({ ...prev, semester: currentSemester.id }));
		}
	}, [currentSemester, thesisFilters.semester]);

	// Student assignment actions
	const handleConfirmAssign = useCallback(async () => {
		try {
			setAssignLoading(true);

			if (group?.members && group.members.length >= 6) {
				showNotification.error(
					"Group Full",
					"This group has reached maximum capacity (6 members)",
				);
				return;
			}

			const studentId = selectedStudentIds[0];
			if (!studentId) {
				showNotification.error(
					"Selection Required",
					"Please select a student to assign",
				);
				return;
			}

			const response = await groupService.assignStudent(groupId, studentId);
			const result = handleApiResponse(response);

			if (result.success) {
				showNotification.success(
					"Student Assigned",
					"Student assigned to group successfully!",
				);
				setIsModalOpen(false);
				setSelectedStudentIds([]);

				try {
					const groupResponse = await groupService.findOne(groupId);
					const groupResult = handleApiResponse(groupResponse);
					if (groupResult.success && groupResult.data) {
						setGroup(groupResult.data);
					}
				} catch (error) {
					console.error("Error refreshing group data:", error);
				}

				if (group?.semester?.id) {
					fetchStudentsWithoutGroup(group.semester.id, true);
				}
			} else {
				showNotification.error(
					"Assignment Failed",
					result.error?.message || "Failed to assign student to group",
				);
			}
		} catch (error) {
			console.error("Error assigning student:", error);
			const { message } = handleApiError(
				error,
				"Failed to assign student to group",
			);
			showNotification.error("Assignment Failed", message);
		} finally {
			setAssignLoading(false);
		}
	}, [group, selectedStudentIds, groupId, fetchStudentsWithoutGroup]);

	// Thesis assignment actions
	const handleConfirmAssignThesis = useCallback(async () => {
		if (!selectedThesis) {
			showNotification.error(
				"Selection Required",
				"Please select a thesis to assign",
			);
			return;
		}

		try {
			setAssignThesisLoading(true);
			const response = await thesesService.assignToGroup(
				selectedThesis.id,
				groupId,
			);
			const result = handleApiResponse(response);

			if (result.success) {
				showNotification.success(
					"Thesis Assigned",
					"Thesis assigned to group successfully!",
				);
				setIsAssignThesisModalOpen(false);
				setSelectedThesisKeys([]);
				setSelectedThesis(null);
				await refreshGroupAndTheses();
			} else {
				showNotification.error(
					"Assignment Failed",
					result.error?.message || "Failed to assign thesis to group",
				);
			}
		} catch (error) {
			handleThesisOperationError(error, "assign");
		} finally {
			setAssignThesisLoading(false);
		}
	}, [
		selectedThesis,
		groupId,
		refreshGroupAndTheses,
		handleThesisOperationError,
	]);

	return {
		// Group data
		group,
		loading,
		groupId,

		// Student assignment
		selectedStudentIds,
		setSelectedStudentIds,
		filters,
		setFilters,
		isModalOpen,
		setIsModalOpen,
		assignLoading,
		handleConfirmAssign,

		// Thesis assignment
		availableTheses,
		selectedThesisKeys,
		setSelectedThesisKeys,
		selectedThesis,
		setSelectedThesis,
		thesisFilters,
		setThesisFilters,
		thesesLoading,
		isThesisDetailModalOpen,
		setIsThesisDetailModalOpen,
		isAssignThesisModalOpen,
		setIsAssignThesisModalOpen,
		viewingThesis,
		setViewingThesis,
		showUnassignButton,
		setShowUnassignButton,
		assignThesisLoading,
		setAssignThesisLoading,
		unassignThesisLoading,
		setUnassignThesisLoading,
		handleConfirmAssignThesis,

		// Store data
		students,
		majors,
		semesters,
		studentsLoading,

		// Helper functions
		refreshGroupAndTheses,
		handleThesisOperationError,
		fetchAvailableTheses,
		fetchStudentsWithoutGroup,
	};
};
