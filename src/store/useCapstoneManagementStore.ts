import { create } from 'zustand';

import semesterService, {
	GroupWithDetails,
} from '@/lib/services/semesters.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { Semester as SemesterType } from '@/schemas/semester';

export interface GroupTableData {
	stt: number;
	studentId: string;
	userId: string;
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
	semesters: SemesterType[];
	groupsBySemseter: GroupWithDetails[];
	tableData: GroupTableData[];
	selectedSemesterId: string;

	// UI State
	loading: boolean;
	loadingGroups: boolean;
	lastError: string | null;

	// Actions
	fetchSemesters: (forceRefresh?: boolean) => Promise<void>;
	fetchGroupsBySemester: (
		semesterId: string,
		forceRefresh?: boolean,
	) => Promise<void>;
	setSelectedSemester: (semesterId: string) => void;
	transformGroupsToTableData: (groups: GroupWithDetails[]) => GroupTableData[];
	refresh: () => Promise<void>;

	// Helper methods
	buildTableDataRows: (groups: GroupWithDetails[]) => GroupTableData[];
	calculateRowSpans: (tableData: GroupTableData[]) => void;

	clearError: () => void;
	reset: () => void;
}

export const useCapstoneManagementStore = create<CapstoneManagementState>(
	(set, get) => ({
		// Initial state
		semesters: [],
		groupsBySemseter: [],
		tableData: [],
		selectedSemesterId: '',
		loading: false,
		loadingGroups: false,
		lastError: null,

		// Actions
		fetchSemesters: async (forceRefresh = false) => {
			const { semesters } = get();
			if (!forceRefresh && semesters.length > 0) {
				return; // Use cached data
			}

			set({ loading: true, lastError: null });
			try {
				const response = await semesterService.findAll();

				const result = handleApiResponse(response);
				if (result.success && result.data) {
					set({ semesters: result.data, loading: false });
				} else {
					set({
						lastError: result.error?.message || 'Failed to fetch semesters',
						loading: false,
					});
					showNotification.error(
						'Failed to fetch semesters',
						result.error?.message ||
							'An error occurred while fetching semesters',
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to fetch semesters';
				set({ lastError: errorMessage, loading: false });
				showNotification.error('Failed to fetch semesters', errorMessage);
			}
		},

		fetchGroupsBySemester: async (semesterId: string, forceRefresh = false) => {
			const { groupsBySemseter, selectedSemesterId } = get();
			if (
				!forceRefresh &&
				groupsBySemseter.length > 0 &&
				selectedSemesterId === semesterId
			) {
				return; // Use cached data
			}

			set({ loadingGroups: true, lastError: null });
			try {
				const response = await semesterService.getGroupsBySemester(semesterId);

				const result = handleApiResponse(response);
				if (result.success && result.data) {
					const tableData = get().transformGroupsToTableData(result.data);
					set({
						groupsBySemseter: result.data,
						tableData,
						selectedSemesterId: semesterId,
						loadingGroups: false,
					});
				} else {
					set({
						lastError: result.error?.message || 'Failed to fetch groups',
						loadingGroups: false,
					});
					showNotification.error(
						'Failed to fetch groups',
						result.error?.message || 'An error occurred while fetching groups',
					);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to fetch groups';
				set({ lastError: errorMessage, loadingGroups: false });
				showNotification.error('Failed to fetch groups', errorMessage);
			}
		},

		setSelectedSemester: (semesterId: string) => {
			set({ selectedSemesterId: semesterId });
		},

		transformGroupsToTableData: (
			groups: GroupWithDetails[],
		): GroupTableData[] => {
			const tableData = get().buildTableDataRows(groups);
			get().calculateRowSpans(tableData);
			return tableData;
		},

		buildTableDataRows: (groups: GroupWithDetails[]): GroupTableData[] => {
			const tableData: GroupTableData[] = [];
			let stt = 1;

			// Sort groups by group name
			const sortedGroups = groups.toSorted((a, b) =>
				a.name.localeCompare(b.name),
			);

			// Get current semester info to populate semester field
			const { semesters, selectedSemesterId } = get();
			const currentSemester = semesters.find(
				(s) => s.id === selectedSemesterId,
			);

			sortedGroups.forEach((group) => {
				// Get supervisors from thesis supervisions - join multiple supervisors with comma
				const supervisors =
					group.thesis?.supervisions
						?.map((supervision) => supervision.lecturer.user.fullName)
						.join(', ') || '';

				// Try to find semester info from group data first, then fallback to selected semester
				const groupSemester = semesters.find((s) => s.id === group.semesterId);
				const semesterToUse = groupSemester || currentSemester;
				const semesterDisplay =
					semesterToUse?.code ||
					semesterToUse?.name ||
					selectedSemesterId ||
					'Unknown';

				group.studentGroupParticipations.forEach((participation) => {
					const student = participation.student;
					const enrollment = student.enrollments?.[0]; // Get first enrollment

					tableData.push({
						stt: stt++,
						studentId: student.studentCode,
						userId: student.userId,
						name: student.user.fullName,
						major: student.major.name,
						thesisName: group.thesis?.englishName || 'Not assigned',
						semester: semesterDisplay,
						groupId: group.id,
						rowSpanGroup: 0, // Will be calculated later
						rowSpanMajor: 0, // Will be calculated later
						rowSpanSemester: 0, // Will be calculated later
						abbreviation: group.thesis?.abbreviation || '-',
						supervisor: supervisors,
						status: enrollment?.status || 'Ongoing', // Use enrollment status
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

		refresh: async () => {
			const { selectedSemesterId } = get();
			try {
				await get().fetchSemesters(true);

				// Re-fetch groups if a semester is selected
				if (selectedSemesterId) {
					await get().fetchGroupsBySemester(selectedSemesterId, true);
				}
			} catch (error) {
				console.error('Failed to refresh data:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'Failed to refresh data';
				showNotification.error('Failed to refresh data', errorMessage);
			}
		},

		clearError: () => {
			set({ lastError: null });
		},

		reset: () => {
			set({
				semesters: [],
				groupsBySemseter: [],
				tableData: [],
				selectedSemesterId: '',
				loading: false,
				loadingGroups: false,
				lastError: null,
			});
		},
	}),
);
