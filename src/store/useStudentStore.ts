import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { AuthService } from '@/lib/services/auth';
import studentService from '@/lib/services/students.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import {
	ImportStudent,
	Student,
	StudentCreate,
	StudentPasswordUpdate,
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

interface StudentState {
	// Data
	students: Student[];
	filteredStudents: Student[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	deleting: boolean;
	creatingManyStudents: boolean; // Batch creation state
	togglingStatus: boolean;
	changingPassword: boolean;
	updatingProfile: boolean;

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

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchStudents: (force?: boolean) => Promise<void>;
	fetchStudentsBySemester: (semesterId: string) => Promise<void>;
	createStudent: (data: StudentCreate) => Promise<boolean>;
	createManyStudents: (data: ImportStudent) => Promise<boolean>;
	updateStudent: (id: string, data: StudentUpdate) => Promise<boolean>;
	deleteStudent: (id: string) => Promise<boolean>;
	toggleStudentStatus: (
		id: string,
		data: StudentToggleStatus,
	) => Promise<boolean>;
	changePassword: (data: StudentPasswordUpdate) => Promise<boolean>;
	updateProfile: (data: StudentUpdate) => Promise<boolean>;

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

export const useStudentStore = create<StudentState>()(
	devtools(
		(set, get) => ({
			// Initial state
			students: [],
			filteredStudents: [],
			loading: false,
			creating: false,
			updating: false,
			deleting: false,
			creatingManyStudents: false,
			togglingStatus: false,
			changingPassword: false,
			updatingProfile: false,
			lastError: null,
			selectedSemesterId: null,
			selectedMajorId: null,
			selectedStatus: 'All',
			searchText: '',

			// Internal spam protection state
			_toggleOperations: new Map(),
			_studentLoadingStates: new Map(),
			_backgroundRefreshRunning: false,
			_lastBackgroundRefresh: 0,

			// Cache utilities
			cache: {
				clear: () => cacheInvalidation.invalidateEntity('student'),
				stats: () => cacheUtils.getStats('student'),
				invalidate: () => cacheInvalidation.invalidateEntity('student'),
			},

			// Actions using cached fetch
			fetchStudents: createCachedFetchAction(studentService, 'student', {
				ttl: 2 * 60 * 1000, // 2 minutes for students (more frequent updates)
				maxSize: 5000, // Support up to 5000 students in cache (accommodate growth)
				enableLocalStorage: false, // Students data is sensitive, don't store in localStorage
			})(set, get),

			fetchStudentsBySemester: createFetchBySemesterAction(
				studentService,
				'student',
			)(set, get),

			// Enhanced CRUD actions with smart cache management
			createStudent: async (data: StudentCreate) => {
				const result = await createCreateAction(studentService, 'student')(
					set,
					get,
				)(data);
				if (result) {
					// Only invalidate cache for create operations (new data added)
					cacheInvalidation.invalidateEntity('student');
				}
				return result;
			},

			updateStudent: async (id: string, data: StudentUpdate) => {
				const result = await createUpdateAction(studentService, 'student')(
					set,
					get,
				)(id, data);
				if (result) {
					// createUpdateAction already handles optimistic update with fresh data from server
					// Only invalidate cache for future fetches, no need to refetch immediately
					cacheInvalidation.invalidateEntity('student');
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
						set((state: Record<string, unknown>) => ({
							...state,
							students: (state.students as Student[]).filter(
								(student: Student) => student.id !== id,
							),
						}));

						// Update filtered students immediately
						get().filterStudents();

						// Only invalidate cache for future fetches, no need to refetch immediately
						// since we already have optimistic update and server confirmed deletion
						cacheInvalidation.invalidateEntity('student');

						return true;
					}

					if (result.error) {
						handleResultError(result.error, set);
						return false;
					}
				} catch (error) {
					handleActionError(error, 'student', 'delete', set);
					return false;
				} finally {
					set({ deleting: false });
				}
				return false;
			},

			createManyStudents: async (data: ImportStudent) => {
				const result = await createBatchCreateAction(studentService, 'student')(
					set,
					get,
				)(data);
				if (result) {
					// Batch operations need full cache invalidation
					cacheInvalidation.invalidateEntity('student');
				}
				return result;
			},

			// Optimized toggle function using shared helpers
			toggleStudentStatus: createStudentToggleFunction(get, set, () =>
				get().filterStudents(),
			),

			// Change password action
			changePassword: async (data: StudentPasswordUpdate) => {
				set({ changingPassword: true, lastError: null });
				try {
					const response = await studentService.changePassword(data);
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
					handleActionError(error, 'student', 'change password', set);
					return false;
				} finally {
					set({ changingPassword: false });
				}
				return false;
			},

			// Update profile action (for student self-update)
			updateProfile: async (data: StudentUpdate) => {
				set({ updatingProfile: true, lastError: null });
				try {
					const response = await studentService.updateProfile(data);
					const result = handleApiResponse(
						response,
						'Success',
						'Profile updated successfully',
					);

					if (result.success) {
						return true;
					}

					if (result.error) {
						handleResultError(result.error, set);
						return false;
					}
				} catch (error) {
					handleActionError(error, 'student', 'update profile', set);
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
				const state = get();
				if (typeof state.filterStudents === 'function') {
					state.filterStudents();
				}
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
					commonStoreUtilities.createReset('student', {
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
				commonStoreUtilities.createGetById<Student>('student')(get),

			// Check if a specific student is currently being toggled
			isStudentLoading: (id: string) => {
				return get()._studentLoadingStates.get(id) ?? false;
			},
		}),
		{
			name: 'student-store',
		},
	),
);
