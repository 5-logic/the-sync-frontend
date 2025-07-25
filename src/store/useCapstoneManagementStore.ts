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

	// Helper methods for reducing complexity
	processGroupResponses: (
		responses: unknown[],
	) => Promise<GroupDetailWithMembers[]>;
	enrichGroupWithSupervisions: (
		groupData: GroupDashboard,
	) => Promise<GroupDetailWithMembers>;
	fetchSupervisions: (
		thesisId: string,
	) => Promise<NonNullable<GroupDetailWithMembers['supervisions']>>;
	fetchLecturerForSupervision: (supervision: {
		lecturerId: string;
	}) => Promise<{
		id: string;
		lecturerId: string;
		lecturer: {
			id: string;
			fullName: string;
			email: string;
		};
	} | null>;
	buildTableDataRows: (groups: GroupDetailWithMembers[]) => GroupTableData[];
	calculateRowSpans: (tableData: GroupTableData[]) => void;

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
				const responses = await Promise.all(
					groupIds.map((groupId) => groupService.findOne(groupId)),
				);

				const groupDetails = await get().processGroupResponses(responses);
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

		processGroupResponses: async (responses: unknown[]) => {
			const groupDetails: GroupDetailWithMembers[] = [];

			for (const response of responses) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const result = handleApiResponse(response as any);
				if (!result.success || !result.data) {
					console.error('Failed to fetch group detail:', result.error);
					continue;
				}

				const groupDetail = await get().enrichGroupWithSupervisions(
					result.data as GroupDashboard,
				);
				groupDetails.push(groupDetail);
			}

			return groupDetails;
		},

		enrichGroupWithSupervisions: async (
			groupData: GroupDashboard,
		): Promise<GroupDetailWithMembers> => {
			const groupDetail: GroupDetailWithMembers = {
				...groupData,
				supervisions: [],
			};

			if (!groupDetail.thesis?.id) {
				return groupDetail;
			}

			try {
				const supervisions = await get().fetchSupervisions(
					groupDetail.thesis.id,
				);
				groupDetail.supervisions = supervisions;
			} catch (error) {
				console.error(
					`Failed to fetch supervisions for thesis ${groupDetail.thesis.id}:`,
					error,
				);
			}

			return groupDetail;
		},

		fetchSupervisions: async (thesisId: string) => {
			const supervisionResponse =
				await supervisionService.getByThesisId(thesisId);
			const supervisionResult = handleApiResponse(supervisionResponse);

			if (!supervisionResult.success || !supervisionResult.data) {
				return [];
			}

			const supervisionsWithLecturers = await Promise.all(
				supervisionResult.data.map((supervision: { lecturerId: string }) =>
					get().fetchLecturerForSupervision(supervision),
				),
			);

			return supervisionsWithLecturers.filter(
				(supervision): supervision is NonNullable<typeof supervision> =>
					supervision !== null,
			);
		},

		fetchLecturerForSupervision: async (supervision: {
			lecturerId: string;
		}) => {
			try {
				const lecturerResponse = await lecturerService.findOne(
					supervision.lecturerId,
				);
				const lecturerResult = handleApiResponse(lecturerResponse);

				if (!lecturerResult.success || !lecturerResult.data) {
					return null;
				}

				return {
					id: supervision.lecturerId,
					lecturerId: supervision.lecturerId,
					lecturer: {
						id: lecturerResult.data.id,
						fullName: lecturerResult.data.fullName,
						email: lecturerResult.data.email,
					},
				};
			} catch (error) {
				console.error(
					`Failed to fetch lecturer ${supervision.lecturerId}:`,
					error,
				);
				return null;
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
			const tableData = get().buildTableDataRows(groups);
			get().calculateRowSpans(tableData);
			return tableData;
		},

		buildTableDataRows: (
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

			return tableData;
		},

		calculateRowSpans: (tableData: GroupTableData[]): void => {
			let semesterSpan = 1;
			let groupSpan = 1;
			let majorSpan = 1;

			const updateSemesterSpan = (
				index: number,
				currentSpan: number,
				current: GroupTableData,
				next?: GroupTableData,
			): number => {
				if (next && next.semester === current.semester) {
					return currentSpan + 1;
				}

				// Apply semester span to all rows in this semester
				for (let j = index - currentSpan + 1; j <= index; j++) {
					tableData[j].rowSpanSemester =
						j === index - currentSpan + 1 ? currentSpan : 0;
				}
				return 1;
			};

			const updateGroupSpan = (
				index: number,
				currentSpan: number,
				current: GroupTableData,
				next?: GroupTableData,
			): number => {
				if (next && next.groupId === current.groupId) {
					return currentSpan + 1;
				}

				// Apply group span to all rows in this group
				for (let j = index - currentSpan + 1; j <= index; j++) {
					tableData[j].rowSpanGroup =
						j === index - currentSpan + 1 ? currentSpan : 0;
				}
				return 1;
			};

			const updateMajorSpan = (
				index: number,
				currentSpan: number,
				current: GroupTableData,
				next?: GroupTableData,
			): number => {
				if (
					next &&
					next.major === current.major &&
					next.groupId === current.groupId
				) {
					return currentSpan + 1;
				}

				// Apply major span to all rows in this major within the same group
				for (let j = index - currentSpan + 1; j <= index; j++) {
					tableData[j].rowSpanMajor =
						j === index - currentSpan + 1 ? currentSpan : 0;
				}
				return 1;
			};

			for (let i = 0; i < tableData.length; i++) {
				const current = tableData[i];
				const next = tableData[i + 1];

				// Calculate spans for grouping
				semesterSpan = updateSemesterSpan(i, semesterSpan, current, next);
				groupSpan = updateGroupSpan(i, groupSpan, current, next);
				majorSpan = updateMajorSpan(i, majorSpan, current, next);
			}
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
