import { create } from "zustand";
import { devtools } from "zustand/middleware";

import lecturerService from "@/lib/services/lecturers.service";
import semesterService from "@/lib/services/semesters.service";
import supervisionService from "@/lib/services/supervisions.service";
import thesesService from "@/lib/services/theses.service";
import { handleApiError, handleApiResponse } from "@/lib/utils/handleApi";
import { showNotification } from "@/lib/utils/notification";
import { type Lecturer } from "@/schemas/lecturer";
import { type Thesis } from "@/schemas/thesis";
import { useSupervisionStore } from "@/store/useSupervisionStore";

export interface SupervisorAssignmentData {
	id: string;
	thesisTitle: string;
	abbreviation: string;
	semester: string;
	supervisors: string[];
	supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}>;
	thesisId: string;
	groupId: string | null;
	isPicked: boolean;
}

// Helper function to fetch supervisor details for a thesis
const fetchSupervisorDetails = async (
	thesisId: string,
): Promise<
	Array<{
		id: string;
		fullName: string;
		email: string;
	}>
> => {
	try {
		// Get supervisions for this thesis
		const supervisionResponse =
			await supervisionService.getByThesisId(thesisId);
		const supervisionResult = handleApiResponse(supervisionResponse);

		if (!supervisionResult.success || !supervisionResult.data) {
			return [];
		}

		const supervisions = supervisionResult.data as Array<{
			lecturerId: string;
		}>;

		// Get lecturer details for each supervision
		const lecturerPromises = supervisions.map((supervision) =>
			lecturerService.findOne(supervision.lecturerId),
		);

		const lecturerResults = await Promise.allSettled(lecturerPromises);
		const supervisorDetails: Array<{
			id: string;
			fullName: string;
			email: string;
		}> = [];

		for (const result of lecturerResults) {
			if (result.status === "fulfilled") {
				const lecturerApiResponse = handleApiResponse(result.value);

				if (lecturerApiResponse.success && lecturerApiResponse.data) {
					supervisorDetails.push({
						id: lecturerApiResponse.data.id,
						fullName: lecturerApiResponse.data.fullName,
						email: lecturerApiResponse.data.email,
					});
				}
			}
		}

		return supervisorDetails;
	} catch (error) {
		console.warn(`Failed to fetch supervisors for thesis ${thesisId}:`, error);
		return [];
	}
};

// Helper function to show notification based on assignment result
const showAssignmentNotification = (
	successful: number,
	failed: number,
	allAlreadyExists: boolean,
	silent: boolean,
): void => {
	if (silent) return;

	if (successful > 0 && failed === 0) {
		const message = allAlreadyExists
			? `All ${successful} supervisors were already assigned`
			: `All ${successful} supervisors assigned successfully`;

		const notificationType = allAlreadyExists ? "info" : "success";
		const title = allAlreadyExists ? "Already Assigned" : "Assignment Complete";

		showNotification[notificationType](title, message);
	} else if (successful > 0 && failed > 0) {
		showNotification.warning(
			"Partial Success",
			`${successful} assignments succeeded, ${failed} failed`,
		);
	} else {
		showNotification.error("Assignment Failed", "All assignments failed");
	}
};

// Helper function to handle error case
const handleAssignmentError = (
	originalData: SupervisorAssignmentData[],
	setState: (partial: Partial<{ data: SupervisorAssignmentData[] }>) => void,
	silent: boolean,
): void => {
	const supervisionError = useSupervisionStore.getState().lastError;
	const errorMessage = supervisionError || "No response from server";

	setState({ data: originalData });
	if (!silent) {
		showNotification.error("Assignment Failed", errorMessage);
	}
};

// Helper function to handle bulk assignment result
const handleBulkAssignmentResult = (
	result: {
		summary: { successful: number; failed: number };
		results: Array<{ status: string }>;
	} | null,
	silent: boolean,
	originalData: SupervisorAssignmentData[],
	setState: (partial: Partial<{ data: SupervisorAssignmentData[] }>) => void,
): boolean => {
	if (!result) {
		handleAssignmentError(originalData, setState, silent);
		return false;
	}

	const { successful, failed } = result.summary;
	const allAlreadyExists = result.results.every(
		(r: { status: string }) => r.status === "already_exists",
	);

	// Show appropriate notification
	showAssignmentNotification(successful, failed, allAlreadyExists, silent);

	// Handle failed assignments
	if (successful === 0) {
		setState({ data: originalData });
		return false;
	}

	// Return success for partial or full success
	return failed === 0;
};

// Helper function to process bulk assignment optimistic updates
const processBulkAssignmentUpdate = (
	assignment: { thesisId: string; lecturerIds: string[] },
	lecturers: Lecturer[],
	updateFunction: (
		thesisId: string,
		supervisors: Array<{ id: string; fullName: string; email: string }>,
	) => void,
): void => {
	const supervisors = assignment.lecturerIds
		.map((id) => lecturers.find((l) => l.id === id))
		.filter(Boolean) as Array<{
		id: string;
		fullName: string;
		email: string;
	}>;

	if (supervisors.length > 0) {
		updateFunction(assignment.thesisId, supervisors);
	}
};
const createAssignmentData = async (
	thesis: Thesis,
	semesterMap: Map<string, string>,
): Promise<SupervisorAssignmentData> => {
	const supervisorDetails = await fetchSupervisorDetails(thesis.id);
	const supervisorNames = supervisorDetails.map((s) => s.fullName);
	const semesterName =
		semesterMap.get(thesis.semesterId) || `Semester ${thesis.semesterId}`;

	return {
		id: thesis.id,
		thesisTitle: thesis.englishName,
		abbreviation: thesis.abbreviation || "No Abbreviation",
		semester: semesterName,
		supervisors: supervisorNames,
		supervisorDetails,
		thesisId: thesis.id,
		groupId: thesis.groupId || null,
		isPicked: thesis.groupId !== null && thesis.groupId !== undefined,
	};
};

interface AssignSupervisorState {
	// Data
	data: SupervisorAssignmentData[];
	lecturers: Lecturer[];

	// Loading states
	loading: boolean;
	refreshing: boolean;
	updating: boolean;

	// Error states
	lastError: string | null;

	// Cache state
	lastFetchTime: number | null;
	cacheExpiry: number; // Cache expiry time in milliseconds (5 minutes)
	currentSemester: string | null; // Track current semester filter

	// Actions
	fetchData: (forceRefresh?: boolean, semesterId?: string) => Promise<void>;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
		silent?: boolean,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
	clearError: () => void;
	isCacheValid: (semesterId?: string) => boolean;

	// Optimistic update methods
	updateAssignmentOptimistically: (
		thesisId: string,
		newSupervisors: Array<{ id: string; fullName: string; email: string }>,
	) => void;
	revertOptimisticUpdate: (
		thesisId: string,
		originalData: SupervisorAssignmentData,
	) => void;

	// Bulk assignment with optimistic updates
	bulkAssignSupervisors: (
		assignments: Array<{
			thesisId: string;
			lecturerIds: string[];
		}>,
		silent?: boolean,
	) => Promise<boolean>;
}

export const useAssignSupervisorStore = create<AssignSupervisorState>()(
	devtools(
		(set, get) => ({
			// Initial state
			data: [],
			lecturers: [],
			loading: false,
			refreshing: false,
			updating: false,
			lastError: null,
			lastFetchTime: null,
			cacheExpiry: 5 * 60 * 1000, // 5 minutes
			currentSemester: null,

			// Check if cache is valid
			isCacheValid: (semesterId?: string): boolean => {
				const { lastFetchTime, cacheExpiry, currentSemester } = get();
				if (!lastFetchTime) return false;

				// Check if semester has changed
				if (currentSemester !== (semesterId || null)) return false;

				return Date.now() - lastFetchTime < cacheExpiry;
			},

			// Fetch all data
			fetchData: async (
				forceRefresh = false,
				semesterId?: string,
			): Promise<void> => {
				// Skip fetch if cache is valid and not forcing refresh
				if (
					!forceRefresh &&
					get().isCacheValid(semesterId) &&
					get().data.length > 0
				) {
					return;
				}

				set({ loading: true, lastError: null });

				try {
					const [thesesResponse, lecturersResponse, semestersResponse] =
						await Promise.all([
							semesterId
								? thesesService.findBySemester(semesterId)
								: thesesService.findAll(),
							lecturerService.findAll(),
							semesterService.findAll(),
						]);

					const thesesResult = handleApiResponse(thesesResponse);
					const lecturersResult = handleApiResponse(lecturersResponse);
					const semestersResult = handleApiResponse(semestersResponse);

					if (!thesesResult.success) {
						console.error("Theses fetch failed:", thesesResult.error);
						throw new Error(
							thesesResult.error?.message || "Failed to fetch theses",
						);
					}

					if (!lecturersResult.success) {
						console.error("Lecturers fetch failed:", lecturersResult.error);
						throw new Error(
							lecturersResult.error?.message || "Failed to fetch lecturers",
						);
					}

					if (!semestersResult.success) {
						console.error("Semesters fetch failed:", semestersResult.error);
						throw new Error(
							semestersResult.error?.message || "Failed to fetch semesters",
						);
					}

					set({ lecturers: lecturersResult.data || [] });

					// Create semester map for lookup
					const semesterMap = new Map<string, string>();
					(semestersResult.data || []).forEach(
						(semester: { id: string; name: string }) => {
							semesterMap.set(semester.id, semester.name);
						},
					);

					// Filter only approved theses
					const filteredTheses = (thesesResult.data || []).filter(
						(thesis: Thesis) => thesis.status === "Approved",
					);

					// Process each thesis to get supervisor data
					const thesesWithData = await Promise.all(
						filteredTheses.map(async (thesis) => {
							return createAssignmentData(thesis, semesterMap);
						}),
					);

					set({
						data: thesesWithData,
						loading: false,
						lastFetchTime: Date.now(),
						currentSemester: semesterId || null,
					});
				} catch (err) {
					console.error("Error in fetchData:", err);
					const { message } = handleApiError(
						err,
						"Failed to fetch assign supervisor data",
					);
					set({ lastError: message, loading: false });
					showNotification.error("Error", message);
				}
			},

			// Change supervisor with optimistic updates (uses assign API internally)
			changeSupervisor: async (
				thesisId: string,
				currentSupervisorId: string,
				newSupervisorId: string,
				silent = false,
			) => {
				// Find original data for potential rollback
				const originalAssignment = get().data.find(
					(item) => item.thesisId === thesisId,
				);
				if (!originalAssignment) return false;

				// Find new lecturer details
				const newLecturer = get().lecturers.find(
					(l) => l.id === newSupervisorId,
				);
				if (!newLecturer) return false;

				// Optimistic update
				const updatedSupervisorDetails =
					originalAssignment.supervisorDetails.map((supervisor) =>
						supervisor.id === currentSupervisorId
							? {
									id: newLecturer.id,
									fullName: newLecturer.fullName,
									email: newLecturer.email,
								}
							: supervisor,
					);

				get().updateAssignmentOptimistically(
					thesisId,
					updatedSupervisorDetails,
				);

				try {
					const supervisionStore = useSupervisionStore.getState();
					const success = await supervisionStore.changeSupervisor(thesisId, {
						currentSupervisorId,
						newSupervisorId,
					});

					if (!success) {
						// Revert optimistic update on failure
						get().revertOptimisticUpdate(thesisId, originalAssignment);

						// Get error from supervision store if available
						const supervisionError = supervisionStore.lastError;
						const errorMessage =
							supervisionError || "Failed to change supervisor";

						if (!silent) {
							showNotification.error("Error", errorMessage);
						}
						return false;
					}

					if (!silent) {
						showNotification.success(
							"Success",
							"Supervisor changed successfully",
						);
					}
					return true;
				} catch (error) {
					// Revert optimistic update on error
					get().revertOptimisticUpdate(thesisId, originalAssignment);
					const { message } = handleApiError(
						error,
						"Failed to change supervisor",
					);
					if (!silent) {
						showNotification.error("Error", message);
					}
					return false;
				}
			},

			// Optimistic update assignment
			updateAssignmentOptimistically: (
				thesisId: string,
				newSupervisors: Array<{ id: string; fullName: string; email: string }>,
			): void => {
				const supervisorNames = newSupervisors.map((s) => s.fullName);

				set((state) => ({
					data: state.data.map((item) => {
						if (item.thesisId !== thesisId) return item;

						return {
							...item,
							supervisorDetails: newSupervisors,
							supervisors: supervisorNames,
						};
					}),
				}));
			},

			// Revert optimistic update
			revertOptimisticUpdate: (
				thesisId: string,
				originalData: SupervisorAssignmentData,
			): void => {
				set((state) => ({
					data: state.data.map((item) =>
						item.thesisId === thesisId ? originalData : item,
					),
				}));
			},

			// Bulk assign supervisors with optimistic updates
			bulkAssignSupervisors: async (
				assignments: Array<{
					thesisId: string;
					lecturerIds: string[];
				}>,
				silent = false,
			) => {
				set({ updating: true });

				// Store original data for potential rollback
				const originalData = get().data;

				try {
					// Optimistic updates for all assignments
					const { lecturers, updateAssignmentOptimistically } = get();
					assignments.forEach((assignment) => {
						processBulkAssignmentUpdate(
							assignment,
							lecturers,
							updateAssignmentOptimistically,
						);
					});

					// Call API
					const supervisionStore = useSupervisionStore.getState();
					const result = await supervisionStore.bulkAssignSupervisors({
						assignments,
					});

					// Handle the result using helper function
					return handleBulkAssignmentResult(result, silent, originalData, set);
				} catch (error) {
					// Revert all optimistic updates on error
					set({ data: originalData });
					const { message } = handleApiError(
						error,
						"Failed to bulk assign supervisors",
					);
					if (!silent) {
						showNotification.error("Error", message);
					}
					return false;
				} finally {
					set({ updating: false });
				}
			},

			// Refresh data
			refreshData: async (): Promise<void> => {
				set({ refreshing: true });
				await get().fetchData(true); // Force refresh
				set({ refreshing: false });
			},

			// Clear error
			clearError: (): void => set({ lastError: null }),
		}),
		{
			name: "assign-supervisor-store",
		},
	),
);
