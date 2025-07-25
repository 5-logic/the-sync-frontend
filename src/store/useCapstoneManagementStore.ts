import { create } from 'zustand';

import groupService, { Group } from '@/lib/services/groups.service';
import lecturerService from '@/lib/services/lecturers.service';
import semesterService from '@/lib/services/semesters.service';
import supervisionService from '@/lib/services/supervisions.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { GroupDashboard } from '@/schemas/group';
import { Semester as SemesterType } from '@/schemas/semester';

export interface GroupDetailWithMembers extends GroupDashboard {
	supervisions?: Array<{
		id: string;
		lecturerId: string;
		lecturer: {
			id: string;
			fullName: string;
			email: string;
		};
	}>;
}

export interface GroupTableData {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	semester: string;
	groupId: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
	rowSpanSemester: number;
	abbreviation?: string;
	supervisor?: string;
	status?: string;
}

interface CapstoneManagementState {
	// Data
	groups: Group[];
	groupsWithDetails: GroupDetailWithMembers[];
	tableData: GroupTableData[];
	semesters: SemesterType[];
	selectedSemester: string;

	// UI State
	loading: boolean;
	loadingDetails: boolean;
	lastError: string | null;

	// Actions
	fetchGroups: (forceRefresh?: boolean) => Promise<void>;
	fetchGroupDetails: (
		groupIds: string[],
		forceRefresh?: boolean,
	) => Promise<void>;
	fetchSemesters: (forceRefresh?: boolean) => Promise<void>;
	refresh: () => Promise<void>;
	setSelectedSemester: (semesterId: string) => void;
	transformGroupsToTableData: (
		groups: GroupDetailWithMembers[],
	) => GroupTableData[];
	getFilteredTableData: (
		searchTerm?: string,
		semesterFilter?: string,
	) => GroupTableData[];
	clearError: () => void;
	reset: () => void;
}

export const useCapstoneManagementStore = create<CapstoneManagementState>(
	(set, get) => ({
		// Initial state
		groups: [],
		groupsWithDetails: [],
		tableData: [],
		semesters: [],
		selectedSemester: '',
		loading: false,
		loadingDetails: false,
		lastError: null,

		// Actions
		fetchGroups: async (forceRefresh = false) => {
			const { groups } = get();
			if (!forceRefresh && groups.length > 0) {
				return; // Use cached data
			}

			set({ loading: true, lastError: null });
			try {
				const response = await groupService.findAll();

				const result = handleApiResponse(response);
				if (result.success && result.data) {
					set({ groups: result.data, loading: false });
				} else {
					set({
						lastError: result.error?.message || 'Failed to fetch groups',
						loading: false,
					});
					showNotification.error(
						'Failed to fetch groups',
						result.error?.message || 'An error occurred while fetching groups',
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to fetch groups';
				set({ lastError: errorMessage, loading: false });
				showNotification.error('Failed to fetch groups', errorMessage);
			}
		},

		fetchGroupDetails: async (groupIds: string[], forceRefresh = false) => {
			const { groupsWithDetails } = get();
			if (!forceRefresh && groupsWithDetails.length > 0) {
				return; // Use cached data
			}

			set({ loadingDetails: true, lastError: null });
			try {
				const detailPromises = groupIds.map((groupId) =>
					groupService.findOne(groupId),
				);
				const responses = await Promise.all(detailPromises);

				const groupDetails: GroupDetailWithMembers[] = [];

				for (const response of responses) {
					const result = handleApiResponse(response);
					if (result.success && result.data) {
						const groupDetail: GroupDetailWithMembers = {
							...result.data,
							supervisions: [], // Initialize with empty array
						};

						// Fetch supervision data if thesis exists
						if (groupDetail.thesis?.id) {
							try {
								const supervisionResponse =
									await supervisionService.getByThesisId(groupDetail.thesis.id);
								const supervisionResult =
									handleApiResponse(supervisionResponse);

								if (supervisionResult.success && supervisionResult.data) {
									// Fetch lecturer details for each supervision
									const supervisionsWithLecturers = await Promise.all(
										supervisionResult.data.map(async (supervision) => {
											try {
												const lecturerResponse = await lecturerService.findOne(
													supervision.lecturerId,
												);
												const lecturerResult =
													handleApiResponse(lecturerResponse);

												if (lecturerResult.success && lecturerResult.data) {
													return {
														id: supervision.lecturerId, // Use lecturerId as supervision id for now
														lecturerId: supervision.lecturerId,
														lecturer: {
															id: lecturerResult.data.id,
															fullName: lecturerResult.data.fullName,
															email: lecturerResult.data.email,
														},
													};
												}
												return null;
											} catch (error) {
												console.error(
													`Failed to fetch lecturer ${supervision.lecturerId}:`,
													error,
												);
												return null;
											}
										}),
									);

									// Filter out null results
									groupDetail.supervisions = supervisionsWithLecturers.filter(
										(supervision) => supervision !== null,
									);
								}
							} catch (error) {
								console.error(
									`Failed to fetch supervisions for thesis ${groupDetail.thesis.id}:`,
									error,
								);
							}
						}

						groupDetails.push(groupDetail);
					} else {
						console.error('Failed to fetch group detail:', result.error);
					}
				}

				const tableData = get().transformGroupsToTableData(groupDetails);
				set({
					groupsWithDetails: groupDetails,
					tableData,
					loadingDetails: false,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to fetch group details';
				set({ lastError: errorMessage, loadingDetails: false });
				showNotification.error('Failed to fetch group details', errorMessage);
			}
		},

		fetchSemesters: async (forceRefresh = false) => {
			const { semesters } = get();
			if (!forceRefresh && semesters.length > 0) {
				return; // Use cached data
			}

			try {
				const response = await semesterService.findAll();

				const result = handleApiResponse(response);
				if (result.success && result.data) {
					set({ semesters: result.data });
				} else {
					console.error('Failed to fetch semesters:', result.error);
					showNotification.error(
						'Failed to fetch semesters',
						result.error?.message ||
							'An error occurred while fetching semesters',
					);
				}
			} catch (error) {
				console.error('Failed to fetch semesters:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to fetch semesters';
				showNotification.error('Failed to fetch semesters', errorMessage);
			}
		},

		refresh: async () => {
			try {
				await Promise.all([
					get().fetchSemesters(true),
					get().fetchGroups(true),
				]);

				// Re-fetch group details if groups exist
				const currentGroups = get().groups;
				if (currentGroups.length > 0) {
					const groupIds = currentGroups.map((group: Group) => group.id);
					await get().fetchGroupDetails(groupIds, true);
				}
			} catch (error) {
				console.error('Failed to refresh data:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to refresh data';
				showNotification.error('Failed to refresh data', errorMessage);
			}
		},

		setSelectedSemester: (semesterId: string) => {
			set({ selectedSemester: semesterId });
		},

		transformGroupsToTableData: (
			groups: GroupDetailWithMembers[],
		): GroupTableData[] => {
			const tableData: GroupTableData[] = [];
			let stt = 1;

			// Sort groups by semester, then by group name
			const sortedGroups = groups.toSorted((a, b) => {
				const semesterCompare = a.semester.name.localeCompare(b.semester.name);
				if (semesterCompare !== 0) return semesterCompare;
				return a.name.localeCompare(b.name);
			});

			sortedGroups.forEach((group) => {
				// Get supervisors from supervisions - join multiple supervisors with comma
				const supervisors =
					group.supervisions
						?.map((supervision) => supervision.lecturer.fullName)
						.join(', ') || '';

				group.members.forEach((member) => {
					tableData.push({
						stt: stt++,
						studentId: member.studentCode,
						name: member.user.fullName,
						major: member.major.code,
						thesisName: group.thesis?.englishName || 'Not assigned',
						semester: group.semester.name,
						groupId: group.id,
						rowSpanGroup: 0, // Will be calculated later
						rowSpanMajor: 0, // Will be calculated later
						rowSpanSemester: 0, // Will be calculated later
						abbreviation: group.thesis?.abbreviation || group.code,
						supervisor: supervisors,
						status: 'Ongoing', // Default status
					});
				});
			});

			// Calculate row spans
			let semesterSpan = 1;
			let groupSpan = 1;
			let majorSpan = 1;

			for (let i = 0; i < tableData.length; i++) {
				const current = tableData[i];
				const next = tableData[i + 1];

				// Calculate spans for grouping
				if (next && next.semester === current.semester) {
					semesterSpan++;
				} else {
					// Apply semester span to all rows in this semester
					for (let j = i - semesterSpan + 1; j <= i; j++) {
						tableData[j].rowSpanSemester =
							j === i - semesterSpan + 1 ? semesterSpan : 0;
					}
					semesterSpan = 1;
				}

				if (next && next.groupId === current.groupId) {
					groupSpan++;
				} else {
					// Apply group span to all rows in this group
					for (let j = i - groupSpan + 1; j <= i; j++) {
						tableData[j].rowSpanGroup = j === i - groupSpan + 1 ? groupSpan : 0;
					}
					groupSpan = 1;
				}

				if (
					next &&
					next.major === current.major &&
					next.groupId === current.groupId
				) {
					majorSpan++;
				} else {
					// Apply major span to all rows in this major within the same group
					for (let j = i - majorSpan + 1; j <= i; j++) {
						tableData[j].rowSpanMajor = j === i - majorSpan + 1 ? majorSpan : 0;
					}
					majorSpan = 1;
				}
			}

			return tableData;
		},

		getFilteredTableData: (
			searchTerm?: string,
			semesterFilter?: string,
		): GroupTableData[] => {
			const { tableData } = get();

			let filtered = [...tableData]; // Create a copy to avoid mutation

			// Apply semester filter only if not 'all' or undefined
			if (semesterFilter && semesterFilter !== 'all') {
				filtered = filtered.filter((item) => item.semester === semesterFilter);
			}

			// Apply search filter
			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				filtered = filtered.filter(
					(item) =>
						item.name.toLowerCase().includes(term) ||
						item.studentId.toLowerCase().includes(term) ||
						item.major.toLowerCase().includes(term) ||
						item.thesisName.toLowerCase().includes(term) ||
						item.supervisor?.toLowerCase().includes(term),
				);
			}

			return filtered;
		},

		clearError: () => {
			set({ lastError: null });
		},

		reset: () => {
			set({
				groups: [],
				groupsWithDetails: [],
				tableData: [],
				semesters: [],
				selectedSemester: '',
				loading: false,
				loadingDetails: false,
				lastError: null,
			});
		},
	}),
);
