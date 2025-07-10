import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { AuthService } from '@/lib/services/auth';
import semesterService from '@/lib/services/semesters.service';
import studentService from '@/lib/services/students.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { ApiResponse, PasswordChange } from '@/schemas/_common';
import {
	ImportStudent,
	Student,
	StudentCreate,
	StudentProfile,
	StudentSelfUpdate,
	StudentToggleStatus,
	StudentUpdate,
} from '@/schemas/student';
import {
	cacheInvalidation,
	cacheUtils,
	createCachedFetchAction,
} from '@/store/helpers/cacheHelpers';
import {
	commonStoreUtilities,
	createBatchCreateAction,
	createCreateAction,
	createErrorState,
	createFetchBySemesterAction,
	createSearchFilter,
	createUpdateAction,
	handleActionError,
	handleResultError,
} from '@/store/helpers/storeHelpers';
import { createStudentToggleFunction } from '@/store/helpers/studentToggleHelpers';
import { type ToggleOperationData } from '@/store/helpers/toggleHelpers';

// Constants
const ENTITY_NAME = 'student';
const STORE_NAME = 'student-store';

interface StudentState {
	// Data
	students: Student[];
	filteredStudents: Student[];
	currentProfile: StudentProfile | null;

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	deleting: boolean;
	creatingMany: boolean; // Legacy field for backward compatibility
	creatingManyStudents: boolean; // New field for consistency
	togglingStatus: boolean;
	changingPassword: boolean;
	updatingProfile: boolean;
	loadingProfile: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// Internal state for spam protection
	_toggleOperations: Map<string, ToggleOperationData>;

	// Individual loading states for each student
	_studentLoadingStates: Map<string, boolean>;

	// Background refresh management
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;

	// UI states
	selectedSemesterId: string | null;
	selectedMajorId: string | null;
	selectedStatus: string;
	searchText: string;
	lastSemesterId: string | null; // Track which semester data is currently loaded

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchStudents: (force?: boolean) => Promise<void>;
	fetchStudentsBySemester: (
		semesterId: string,
		force?: boolean,
	) => Promise<void>;
	fetchStudentsWithoutGroup: (semesterId: string) => Promise<void>;
	fetchStudentsWithoutGroupAuto: () => Promise<void>;
	fetchProfile: (id: string, force?: boolean) => Promise<StudentProfile | null>;
	createStudent: (data: StudentCreate) => Promise<boolean>;
	createManyStudents: (data: ImportStudent) => Promise<boolean>;
	updateStudent: (id: string, data: StudentUpdate) => Promise<boolean>;
	deleteStudent: (id: string) => Promise<boolean>;
	toggleStudentStatus: (
		id: string,
		data: StudentToggleStatus,
	) => Promise<boolean>;
	changePassword: (data: PasswordChange) => Promise<boolean>;
	updateProfile: (data: StudentSelfUpdate) => Promise<boolean>;
	// Error management
	clearError: () => void;

	// Filters
	setSelectedSemesterId: (semesterId: string | null) => void;
	setSelectedMajorId: (majorId: string | null) => void;
	setSelectedStatus: (status: string) => void;
	setSearchText: (text: string) => void;
	filterStudents: () => void;

	// Utilities
	reset: () => void;
	clearStudents: () => void;
	getStudentById: (id: string) => Student | undefined;
	isStudentLoading: (id: string) => boolean;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Filter function for students
const studentSearchFilter = createSearchFilter<Student>((student) => [
	student.fullName,
	student.email,
	student.studentCode,
]);

// Helper function to process students without group response
const processStudentsWithoutGroupResponse = (
	response: ApiResponse<Student[]>,
	set: (state: Partial<StudentState>) => void,
	get: () => StudentState,
): boolean => {
	const result = handleApiResponse(response, 'Success', '');

	if (result.success && result.data) {
		// Filter only active students
		const activeStudents = result.data.filter(
			(student: Student) => student.isActive,
		);

		set({
			students: activeStudents,
			loading: false,
		});

		// Apply current filters
		get().filterStudents();
		return true;
	} else if (result.error) {
		handleResultError(result.error, set);
		return false;
	}
	return false;
};

export const useStudentStore = create<StudentState>()(
	devtools(
		(set, get) => ({
			// Initial state
			students: [],
			filteredStudents: [],
			currentProfile: null,
			loading: false,
			creating: false,
			updating: false,
			deleting: false,
			creatingMany: false,
			creatingManyStudents: false,
			togglingStatus: false,
			changingPassword: false,
			updatingProfile: false,
			loadingProfile: false,
			lastError: null,
			selectedSemesterId: null,
			selectedMajorId: null,
			selectedStatus: 'All',
			searchText: '',
			lastSemesterId: null,

			// Internal spam protection state
			_toggleOperations: new Map(),
			_studentLoadingStates: new Map(),
			_backgroundRefreshRunning: false,
			_lastBackgroundRefresh: 0,

			// Cache utilities
			cache: {
				clear: () => cacheInvalidation.invalidateEntity(ENTITY_NAME),
				stats: () => cacheUtils.getStats(ENTITY_NAME),
				invalidate: () => cacheInvalidation.invalidateEntity(ENTITY_NAME),
			},

			// Actions using cached fetch
			fetchStudents: createCachedFetchAction(studentService, ENTITY_NAME, {
				ttl: 2 * 60 * 1000, // 2 minutes for students (more frequent updates)
				maxSize: 5000, // Support up to 5000 students in cache (accommodate growth)
				enableLocalStorage: false, // Students data is sensitive, don't store in localStorage
			})(set, get),

			fetchStudentsBySemester: createFetchBySemesterAction(
				studentService,
				ENTITY_NAME,
			)(set, get),

			fetchStudentsWithoutGroup: async (semesterId: string) => {
				set({ loading: true, lastError: null });
				try {
					const response =
						await studentService.findStudentsWithoutGroup(semesterId);

					processStudentsWithoutGroupResponse(response, set, get);
				} catch (error) {
					handleActionError(error, ENTITY_NAME, 'fetch without group', set);
				} finally {
					set({ loading: false });
				}
			},

			fetchStudentsWithoutGroupAuto: async () => {
				set({ loading: true, lastError: null });
				try {
					// First, get all semesters to find the one with "Preparing" status
					const semesterResponse = await semesterService.findAll();
					const semesterResult = handleApiResponse(
						semesterResponse,
						'Success',
						'',
					);

					if (!semesterResult.success || !semesterResult.data) {
						if (semesterResult.error) {
							handleResultError(semesterResult.error, set);
						}
						return;
					}

					// Find semester with "Preparing" status
					const preparingSemester = semesterResult.data.find(
						(semester) => semester.status === 'Preparing',
					);

					if (!preparingSemester) {
						const error = createErrorState({
							message: 'No semester with "Preparing" status found',
							statusCode: 404,
						});
						set({ lastError: error, loading: false });
						return;
					}

					// Now fetch students without group for this semester
					const response = await studentService.findStudentsWithoutGroup(
						preparingSemester.id,
					);

					processStudentsWithoutGroupResponse(response, set, get);
				} catch (error) {
					handleActionError(
						error,
						ENTITY_NAME,
						'fetch without group auto',
						set,
					);
				} finally {
					set({ loading: false });
				}
			},

			// Fetch detailed profile data
			fetchProfile: async (
				id: string,
				force = false,
			): Promise<StudentProfile | null> => {
				const { currentProfile, loadingProfile } = get();

				// Return cached profile if available and not forcing refresh
				if (!force && currentProfile && currentProfile.id === id) {
					return currentProfile;
				}

				// Prevent multiple concurrent requests
				if (loadingProfile) {
					return currentProfile;
				}

				set({ loadingProfile: true, lastError: null });

				try {
					const response = await studentService.findOne(id);
					const result = handleApiResponse(response, 'Silent');

					if (result.success && result.data) {
						set({ currentProfile: result.data, loadingProfile: false });
						return result.data;
					}

					if (result.error) {
						handleResultError(result.error, set);
					}
				} catch (error) {
					handleActionError(error, ENTITY_NAME, 'fetch profile', set);
				} finally {
					set({ loadingProfile: false });
				}

				return null;
			},

			// Enhanced CRUD actions with smart cache management
			createStudent: async (data: StudentCreate) => {
				const result = await createCreateAction(studentService, ENTITY_NAME)(
					set,
					get,
				)(data);
				if (result) {
					// Only invalidate cache for create operations (new data added)
					cacheInvalidation.invalidateEntity(ENTITY_NAME);
				}
				return result;
			},

			updateStudent: async (id: string, data: StudentUpdate) => {
				const result = await createUpdateAction(studentService, ENTITY_NAME)(
					set,
					get,
				)(id, data);
				if (result) {
					// createUpdateAction already handles optimistic update with fresh data from server
					// Only invalidate cache for future fetches, no need to refetch immediately
					cacheInvalidation.invalidateEntity(ENTITY_NAME);
				}
				return result;
			},

			deleteStudent: async (id: string) => {
				const { selectedSemesterId } = get();

				if (!selectedSemesterId) {
					const error = createErrorState({
						message: 'No semester selected. Please select a semester first.',
						statusCode: 400,
					});
					set({ lastError: error });
					return false;
				}

				set({ deleting: true, lastError: null });
				try {
					const response = await studentService.deleteBySemester(
						id,
						selectedSemesterId,
					);
					const result = handleApiResponse(
						response,
						'Success',
						'Student deleted successfully',
					);

					if (result.success) {
						// Optimistic update: Remove from students array immediately
						set((state) => ({
							students: state.students.filter((student) => student.id !== id),
							filteredStudents: state.filteredStudents.filter(
								(student) => student.id !== id,
							),
						}));

						// Only invalidate cache for future fetches, no need to refetch immediately
						// since we already have optimistic update and server confirmed deletion
						cacheInvalidation.invalidateEntity(ENTITY_NAME);

						return true;
					}

					if (result.error) {
						handleResultError(result.error, set);
						return false;
					}
				} catch (error) {
					handleActionError(error, ENTITY_NAME, 'delete', set);
					return false;
				} finally {
					set({ deleting: false });
				}
				return false;
			},

			createManyStudents: async (data: ImportStudent) => {
				const result = await createBatchCreateAction(
					studentService,
					ENTITY_NAME,
				)(
					set,
					get,
				)(data);
				if (result) {
					// Batch operations need full cache invalidation
					cacheInvalidation.invalidateEntity(ENTITY_NAME);
				}
				return result;
			},

			// Optimized toggle function using shared helpers
			toggleStudentStatus: createStudentToggleFunction(get, set, () =>
				get().filterStudents(),
			),

			// Change password action
			changePassword: async (data: PasswordChange) => {
				set({ changingPassword: true, lastError: null });
				try {
					const response = await AuthService.changePassword(data);
					const result = handleApiResponse(
						response,
						'Success',
						'Password changed successfully. You will be logged out.',
					);

					if (result.success) {
						// Auto logout after successful password change for security
						try {
							await AuthService.logout({ redirect: false });
							// Redirect to login page after logout
							window.location.href = '/login';
						} catch (logoutError) {
							// Log error for debugging purposes - this is a critical flow
							// eslint-disable-next-line no-console
							console.error('Logout error after password change:', logoutError);
							// Force redirect even if logout fails
							window.location.href = '/login';
						}
						return true;
					}

					if (result.error) {
						handleResultError(result.error, set);
						return false;
					}
				} catch (error) {
					handleActionError(error, ENTITY_NAME, 'change password', set);
					return false;
				} finally {
					set({ changingPassword: false });
				}
				return false;
			},

			// Update profile action (for student self-update)
			updateProfile: async (data: StudentSelfUpdate) => {
				set({ updatingProfile: true, lastError: null });
				try {
					const response = await studentService.updateProfile(data);
					const result = handleApiResponse(
						response,
						'Success',
						'Profile updated successfully',
					);

					if (result.success) {
						// Clear current profile and invalidate cache to ensure fresh data
						set({ currentProfile: null });
						cacheInvalidation.invalidateEntity(ENTITY_NAME);
						return true;
					}

					if (result.error) {
						handleResultError(result.error, set);
						return false;
					}
				} catch (error) {
					handleActionError(error, ENTITY_NAME, 'update profile', set);
					return false;
				} finally {
					set({ updatingProfile: false });
				}
				return false;
			},

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()),

			// Filters
			setSelectedSemesterId: (semesterId: string | null) => {
				// Clear students when changing semester to avoid stale data
				set({
					students: [],
					filteredStudents: [],
					selectedSemesterId: semesterId,
				});
				// Apply filters with empty data
				get().filterStudents();
			},
			setSelectedMajorId: commonStoreUtilities.createFieldSetter(
				'selectedMajorId',
				'filterStudents',
			)(set, get),
			setSelectedStatus: commonStoreUtilities.createFieldSetter(
				'selectedStatus',
				'filterStudents',
			)(set, get),
			setSearchText: commonStoreUtilities.createSetSearchText('filterStudents')(
				set,
				get,
			),

			filterStudents: () => {
				const { students, selectedMajorId, selectedStatus, searchText } = get();

				let filtered = students;

				// Note: Semester filtering is now handled by fetching students by semester
				// using the fetchStudentsBySemester method instead of client-side filtering

				if (selectedMajorId && selectedMajorId !== 'All') {
					filtered = filtered.filter(
						(student) => student.majorId === selectedMajorId,
					);
				}

				if (selectedStatus !== 'All') {
					filtered = filtered.filter(
						(student) => student.isActive === (selectedStatus === 'Active'),
					);
				}

				// Apply text search
				filtered = studentSearchFilter(filtered, searchText);

				set({ filteredStudents: filtered });
			},

			// Utilities
			reset: () => {
				// Cancel all pending toggle operations
				const operations = get()._toggleOperations;
				operations.forEach((op) => op.controller.abort());
				operations.clear();

				set(
					commonStoreUtilities.createReset(ENTITY_NAME, {
						currentProfile: null,
						selectedSemesterId: null,
						selectedMajorId: null,
						selectedStatus: 'All',
						_toggleOperations: new Map(),
						_studentLoadingStates: new Map(),
						_backgroundRefreshRunning: false,
						_lastBackgroundRefresh: 0,
					})(),
				);
			},
			clearStudents: () => set({ students: [], filteredStudents: [] }),
			getStudentById:
				commonStoreUtilities.createGetById<Student>(ENTITY_NAME)(get),

			// Check if a specific student is currently being toggled
			isStudentLoading: (id: string) => {
				return get()._studentLoadingStates.get(id) ?? false;
			},
		}),
		{
			name: STORE_NAME,
		},
	),
);
