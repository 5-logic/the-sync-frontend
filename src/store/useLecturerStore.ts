import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { AuthService } from '@/lib/services/auth';
import lecturerService from '@/lib/services/lecturers.service';
import { showNotification } from '@/lib/utils';
import { handleApiError } from '@/lib/utils/handleApi';
import { PasswordChange } from '@/schemas/_common';
import { Lecturer, LecturerCreate, LecturerUpdate } from '@/schemas/lecturer';
import {
	cacheInvalidation,
	cacheUtils,
	createCachedFetchAction,
} from '@/store/helpers/cacheHelpers';
import {
	createLecturerModeratorToggleFunction,
	createLecturerStatusToggleFunction,
} from '@/store/helpers/lecturerToggleHelpers';
import {
	commonStoreUtilities,
	createBatchCreateAction,
	createCreateAction,
	createSearchFilter,
	createUpdateAction,
} from '@/store/helpers/storeHelpers';
import { type ToggleOperationData } from '@/store/helpers/toggleHelpers';

interface LecturerState {
	// Data
	lecturers: Lecturer[];
	filteredLecturers: Lecturer[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	updatingProfile: boolean;
	deleting: boolean;
	creatingMany: boolean; // Legacy field for backward compatibility
	creatingManyLecturers: boolean; // New field for consistency
	togglingStatus: boolean;
	togglingModerator: boolean;
	changingPassword: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// UI states
	selectedStatus: string;
	selectedModerator: string;
	searchText: string;

	// Background refresh protection (similar to student store)
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;

	// Anti-spam protection for toggle operations - separate for status and moderator
	_toggleStatusOperations: Map<string, ToggleOperationData>;
	_toggleModeratorOperations: Map<string, ToggleOperationData>;

	// Individual loading states for each lecturer - separate for status and moderator
	_lecturerStatusLoadingStates: Map<string, boolean>;
	_lecturerModeratorLoadingStates: Map<string, boolean>;

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchLecturers: (force?: boolean) => Promise<void>;
	createLecturer: (data: LecturerCreate) => Promise<boolean>;
	createManyLecturers: (data: {
		lecturers: LecturerCreate[];
	}) => Promise<boolean>;
	updateLecturer: (id: string, data: LecturerUpdate) => Promise<boolean>;
	updateProfile: (data: LecturerUpdate) => Promise<boolean>;
	deleteLecturer: (id: string) => Promise<boolean>;
	changePassword: (data: PasswordChange) => Promise<boolean>;

	// Separate toggle methods for better type safety and state management
	toggleLecturerStatus: (
		id: string,
		data: { isActive: boolean },
	) => Promise<boolean>;
	toggleLecturerModerator: (
		id: string,
		data: { isModerator: boolean },
	) => Promise<boolean>;

	// Error management
	clearError: () => void;

	// Filters
	setSelectedStatus: (status: string) => void;
	setSelectedModerator: (moderator: string) => void;
	setSearchText: (text: string) => void;
	filterLecturers: () => void;

	// Utilities
	reset: () => void;
	clearLecturers: () => void;
	getLecturerById: (id: string) => Lecturer | undefined;
	isLecturerStatusLoading: (id: string) => boolean;
	isLecturerModeratorLoading: (id: string) => boolean;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Filter function for lecturers
const lecturerSearchFilter = createSearchFilter<Lecturer>((lecturer) => [
	lecturer.fullName,
	lecturer.email,
]);

export const useLecturerStore = create<LecturerState>()(
	devtools(
		(set, get) => ({
			// Initial state
			lecturers: [],
			filteredLecturers: [],
			loading: false,
			creating: false,
			updating: false,
			updatingProfile: false,
			deleting: false,
			creatingMany: false,
			creatingManyLecturers: false,
			togglingStatus: false,
			togglingModerator: false,
			changingPassword: false,
			lastError: null,
			selectedStatus: 'All',
			selectedModerator: 'All',
			searchText: '',

			// Background refresh protection
			_backgroundRefreshRunning: false,
			_lastBackgroundRefresh: 0,

			// Internal spam protection state - separate for status and moderator
			_toggleStatusOperations: new Map(),
			_toggleModeratorOperations: new Map(),
			_lecturerStatusLoadingStates: new Map(),
			_lecturerModeratorLoadingStates: new Map(),

			// Cache utilities
			cache: {
				clear: () => cacheInvalidation.invalidateEntity('lecturer'),
				stats: () => cacheUtils.getStats('lecturer'),
				invalidate: () => cacheInvalidation.invalidateEntity('lecturer'),
			},

			// Actions using cached fetch
			fetchLecturers: createCachedFetchAction(lecturerService, 'lecturer', {
				ttl: 5 * 60 * 1000, // 5 minutes for lecturers (less frequent updates than students)
				maxSize: 2000, // Support up to 2000 lecturers in cache
				enableLocalStorage: false, // Lecturers data is sensitive, don't store in localStorage
			})(set, get),

			// Enhanced CRUD actions with smart cache management
			createLecturer: async (data: LecturerCreate) => {
				const result = await createCreateAction(lecturerService, 'lecturer')(
					set,
					get,
				)(data);
				if (result) {
					// Only invalidate cache for create operations (new data added)
					cacheInvalidation.invalidateEntity('lecturer');
				}
				return result;
			},

			updateLecturer: async (id: string, data: LecturerUpdate) => {
				const result = await createUpdateAction(lecturerService, 'lecturer')(
					set,
					get,
				)(id, data);
				if (result) {
					// createUpdateAction already handles optimistic update with fresh data from server
					// Only invalidate cache for future fetches, no need to refetch immediately
					cacheInvalidation.invalidateEntity('lecturer');
				}
				return result;
			},

			// Update profile action (for lecturer self-update)
			updateProfile: async (data: LecturerUpdate) => {
				set({ updatingProfile: true, lastError: null });
				try {
					const response = await lecturerService.updateProfile(data);

					if (response.success) {
						// Show success notification
						const { showNotification } = await import(
							'@/lib/utils/notification'
						);
						showNotification.success('Success', 'Profile updated successfully');

						// Invalidate cache for future fetches
						cacheInvalidation.invalidateEntity('lecturer');

						return true;
					} else {
						// Handle error response
						const errorMessage = response.error ?? 'Failed to update profile';
						set({
							lastError: {
								message: errorMessage,
								statusCode: response.statusCode,
								timestamp: new Date(),
							},
						});

						// Show error notification
						const { showNotification } = await import(
							'@/lib/utils/notification'
						);
						showNotification.error('Error', errorMessage);

						return false;
					}
				} catch (error) {
					// Handle network/unexpected errors
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to update profile';
					const statusCode =
						(error as { response?: { status?: number } })?.response?.status ??
						500;

					set({
						lastError: {
							message: errorMessage,
							statusCode,
							timestamp: new Date(),
						},
					});

					// Show error notification
					const { showNotification } = await import('@/lib/utils/notification');
					showNotification.error('Error', errorMessage);

					return false;
				} finally {
					set({ updatingProfile: false });
				}
			},

			createManyLecturers: async (data: { lecturers: LecturerCreate[] }) => {
				const result = await createBatchCreateAction(
					lecturerService,
					'lecturer',
				)(
					set,
					get,
				)(data.lecturers);
				if (result) {
					// Batch operations need full cache invalidation
					cacheInvalidation.invalidateEntity('lecturer');
				}
				return result;
			},

			// Optimized toggle functions using shared helpers
			toggleLecturerStatus: createLecturerStatusToggleFunction(get, set, () =>
				get().filterLecturers(),
			),

			toggleLecturerModerator: createLecturerModeratorToggleFunction(
				get,
				set,
				() => get().filterLecturers(),
			),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()),

			// Filters
			setSelectedStatus: commonStoreUtilities.createFieldSetter(
				'selectedStatus',
				'filterLecturers',
			)(set, get),
			setSelectedModerator: commonStoreUtilities.createFieldSetter(
				'selectedModerator',
				'filterLecturers',
			)(set, get),
			setSearchText: commonStoreUtilities.createSetSearchText(
				'filterLecturers',
			)(set, get),

			filterLecturers: () => {
				const { lecturers, selectedStatus, selectedModerator, searchText } =
					get();

				let filtered = lecturers;

				if (selectedStatus !== 'All') {
					filtered = filtered.filter(
						(lecturer) => lecturer.isActive === (selectedStatus === 'Active'),
					);
				}

				if (selectedModerator !== 'All') {
					filtered = filtered.filter(
						(lecturer) =>
							lecturer.isModerator === (selectedModerator === 'Moderator'),
					);
				}

				// Apply text search
				filtered = lecturerSearchFilter(filtered, searchText);

				set({ filteredLecturers: filtered });
			},

			// Utilities
			reset: () => {
				// Cancel all pending toggle operations
				const statusOperations = get()._toggleStatusOperations;
				const moderatorOperations = get()._toggleModeratorOperations;

				statusOperations.forEach((op) => op.controller.abort());
				statusOperations.clear();

				moderatorOperations.forEach((op) => op.controller.abort());
				moderatorOperations.clear();

				set(
					commonStoreUtilities.createReset('lecturer', {
						selectedStatus: 'All',
						selectedModerator: 'All',
						_toggleStatusOperations: new Map(),
						_toggleModeratorOperations: new Map(),
						_lecturerStatusLoadingStates: new Map(),
						_lecturerModeratorLoadingStates: new Map(),
						_backgroundRefreshRunning: false,
						_lastBackgroundRefresh: 0,
					})(),
				);
			},
			clearLecturers: () => set({ lecturers: [], filteredLecturers: [] }),
			getLecturerById:
				commonStoreUtilities.createGetById<Lecturer>('lecturer')(get),

			// Check if a specific lecturer is currently being toggled (status)
			isLecturerStatusLoading: (id: string) => {
				return get()._lecturerStatusLoadingStates.get(id) ?? false;
			},

			// Check if a specific lecturer is currently being toggled (moderator)
			isLecturerModeratorLoading: (id: string) => {
				return get()._lecturerModeratorLoadingStates.get(id) ?? false;
			},

			// Change password action
			changePassword: async (data: PasswordChange) => {
				set({ changingPassword: true, lastError: null });
				try {
					const response = await AuthService.changePassword(data);

					if (response.success) {
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
					} else {
						const errorMessage = response.error ?? 'Failed to change password';
						set({
							lastError: {
								message: errorMessage,
								statusCode: response.statusCode,
								timestamp: new Date(),
							},
						});
						return false;
					}
				} catch (error: unknown) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Failed to change password';
					const statusCode =
						error &&
						typeof error === 'object' &&
						'response' in error &&
						error.response
							? ((error.response as { status?: number }).status ?? 500)
							: 500;

					set({
						lastError: {
							message: errorMessage,
							statusCode,
							timestamp: new Date(),
						},
					});
					return false;
				} finally {
					set({ changingPassword: false });
				}
			},

			deleteLecturer: async (id: string) => {
				set({ deleting: true, lastError: null });

				try {
					const response = await lecturerService.delete(id);

					if (response.success) {
						// Remove lecturer from local state
						const { lecturers } = get();
						const updatedLecturers = lecturers.filter(
							(lecturer) => lecturer.id !== id,
						);
						set({ lecturers: updatedLecturers });

						// Refresh filtered data
						get().filterLecturers();

						// Invalidate cache
						cacheInvalidation.invalidateEntity('lecturer');

						showNotification.success(
							'Success',
							'Lecturer deleted successfully',
						);

						set({ deleting: false });
						return true;
					} else {
						throw new Error(response.error ?? 'Failed to delete lecturer');
					}
				} catch (error: unknown) {
					// Use handleApiError to get proper error message from backend
					const apiError = handleApiError(error, 'Failed to delete lecturer');

					set({
						deleting: false,
						lastError: {
							message: apiError.message,
							statusCode: apiError.statusCode,
							timestamp: new Date(),
						},
					});

					// Show error notification to user with backend message
					const { showNotification } = await import('@/lib/utils/notification');
					showNotification.error('Error', apiError.message);

					return false;
				}
			},
		}),
		{
			name: 'lecturer-store',
		},
	),
);
