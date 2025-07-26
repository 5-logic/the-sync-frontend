import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import thesisService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Thesis, ThesisCreate, ThesisUpdate } from '@/schemas/thesis';
import {
	cacheUtils,
	createCachedFetchByLecturerAction,
} from '@/store/helpers/cacheHelpers';
import {
	createErrorState,
	createSearchFilter,
	handleActionError,
	handleCreateError,
} from '@/store/helpers/storeHelpers';

// Type alias for thesis status filter
type ThesisStatusFilter =
	| 'approved'
	| 'pending'
	| 'rejected'
	| 'new'
	| undefined;

// Thesis management filters
export interface ThesisFilters {
	searchText: string;
	selectedStatus: ThesisStatusFilter;
	selectedDomain?: string;
	selectedOwned?: boolean;
	selectedSemester?: string;
}

// Complete thesis store state
interface ThesisState {
	// Data
	theses: Thesis[];
	filteredTheses: Thesis[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	deleting: boolean;
	toggling: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// Individual loading states for each thesis
	_thesisLoadingStates: Map<string, boolean>;

	// Background refresh management
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;

	// UI states - filters
	searchText: string;
	selectedStatus: ThesisStatusFilter;
	selectedDomain: string | undefined;
	selectedOwned: boolean | undefined;
	selectedSemester: string | undefined;

	// Current lecturer
	currentLecturerId: string | null;
	sessionLecturerId: string | null;

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchTheses: (force?: boolean) => Promise<void>;
	fetchThesesByLecturer: (lecturerId: string, force?: boolean) => Promise<void>;
	fetchThesesBySemester: (semesterId: string, force?: boolean) => Promise<void>;
	createThesis: (data: ThesisCreate) => Promise<boolean>;
	updateThesis: (id: string, data: ThesisUpdate) => Promise<boolean>;
	deleteThesis: (id: string) => Promise<boolean>;
	toggleThesisPublishStatus: (id: string) => Promise<boolean>;
	submitThesis: (id: string) => Promise<boolean>;
	reviewThesis: (
		id: string,
		status: 'Approved' | 'Rejected',
	) => Promise<boolean>;

	// Error management
	clearError: () => void;

	// Filters
	setSearchText: (text: string) => void;
	setSelectedStatus: (status: ThesisStatusFilter) => void;
	setSelectedDomain: (domain: string | undefined) => void;
	setSelectedOwned: (owned: boolean | undefined) => void;
	setSelectedSemester: (semester: string | undefined) => void;
	filterTheses: () => void;

	// Utilities
	reset: () => void;
	clearTheses: () => void;
	getThesisById: (id: string) => Thesis | undefined;
	updateThesisInStore: (updatedThesis: Thesis) => void;
	isThesisLoading: (id: string) => boolean;
	setSessionLecturerId: (lecturerId: string | null) => void;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Helper function to create error message with nullish coalescing
const getErrorMessage = (
	errorMessage: string | undefined,
	fallback: string,
): string => {
	return errorMessage ?? fallback;
};

// Filter function for theses
const thesisSearchFilter = createSearchFilter<Thesis>((thesis) => [
	thesis.englishName,
	thesis.vietnameseName,
	thesis.abbreviation ?? '',
	thesis.description ?? '',
	thesis.domain ?? '',
]);

// Initialize cache for thesis
cacheUtils.initCache<Thesis[]>('thesis', {
	ttl: 5 * 60 * 1000, // 5 minutes for theses
	maxSize: 1000, // Support up to 1000 theses in cache
	enableLocalStorage: false, // Don't store in localStorage
});

export const useThesisStore = create<ThesisState>()(
	devtools(
		(set, get) => ({
			// Initial state
			theses: [],
			filteredTheses: [],
			loading: false,
			creating: false,
			updating: false,
			deleting: false,
			toggling: false,
			lastError: null,
			searchText: '',
			selectedStatus: undefined,
			selectedDomain: undefined,
			selectedOwned: undefined,
			selectedSemester: undefined,
			currentLecturerId: null,
			sessionLecturerId: null,

			// Internal loading states
			_thesisLoadingStates: new Map(),
			_backgroundRefreshRunning: false,
			_lastBackgroundRefresh: 0,

			// Cache utilities
			cache: {
				clear: () => {
					cacheUtils.clear('thesis');
				},
				stats: () => cacheUtils.getStats('thesis'),
				invalidate: () => {
					cacheUtils.clear('thesis');
				},
			},

			// Fetch all theses with sorting and caching
			fetchTheses: async (force = false) => {
				const cacheKey = 'all';

				// Try to get from cache first
				if (!force) {
					const cachedData = cacheUtils.get<Thesis[]>('thesis', cacheKey);
					if (cachedData) {
						// Sort cached data
						const sortedData = [...cachedData].sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);
						set({
							theses: sortedData,
							filteredTheses: sortedData,
						});
						get().filterTheses();
						return;
					}
				}

				// Check if we should fetch
				if (!cacheUtils.shouldFetch('thesis', force)) {
					return;
				}

				set({ loading: true, lastError: null });

				try {
					const response = await thesisService.findAll();
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Sort data by createdAt desc (newest first)
						const sortedData = [...result.data].sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);

						// Cache the sorted data
						cacheUtils.set('thesis', cacheKey, sortedData);

						set({
							theses: sortedData,
							filteredTheses: sortedData,
						});

						// Apply filters
						get().filterTheses();
					} else {
						throw new Error(
							getErrorMessage(result.error?.message, 'Failed to fetch theses'),
						);
					}
				} catch {
					set({
						lastError: {
							message: 'Failed to fetch theses',
							statusCode: 500,
							timestamp: new Date(),
						},
					});
				} finally {
					set({ loading: false });
				}
			},

			// Fetch theses by lecturer ID with caching
			fetchThesesByLecturer: createCachedFetchByLecturerAction(
				thesisService,
				'thesis',
				{
					ttl: 5 * 60 * 1000, // 5 minutes for theses
					maxSize: 1000, // Support up to 1000 theses in cache
					enableLocalStorage: false, // Don't store in localStorage
				},
			)(set, get),

			// Create thesis
			createThesis: async (data: ThesisCreate) => {
				set({ creating: true, lastError: null });
				try {
					const response = await thesisService.create(data);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Add to theses array and sort by createdAt desc (newest first)
						const { theses } = get();
						const updatedTheses = [...theses, result.data].sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);
						set({
							theses: updatedTheses,
							creating: false,
						});

						// Re-apply filters
						get().filterTheses();

						// Update cache with new thesis instead of invalidating
						cacheUtils.set('thesis', 'all', updatedTheses);

						return true;
					}

					if (result.error) {
						const error = createErrorState(result.error);
						set({ lastError: error, creating: false });
						handleCreateError(result);
						return false;
					}
				} catch (error) {
					handleActionError(error, 'thesis', 'create', set);
					set({ creating: false });
					return false;
				}

				set({ creating: false });
				return false;
			},

			// Update thesis
			updateThesis: async (id: string, data: ThesisUpdate) => {
				set({ updating: true, lastError: null });
				try {
					const response = await thesisService.update(id, data);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Update local state
						const { theses } = get();
						const updatedTheses = theses.map((thesis) =>
							thesis.id === id ? result.data! : thesis,
						);
						set({
							theses: updatedTheses,
							updating: false,
						});

						// Re-apply filters
						get().filterTheses();

						// Update cache instead of invalidating
						cacheUtils.set('thesis', 'all', updatedTheses);

						return true;
					} else {
						throw new Error(
							getErrorMessage(result.error?.message, 'Failed to update thesis'),
						);
					}
				} catch (error) {
					handleActionError(error, 'thesis', 'update', set);
					set({ updating: false });
					return false;
				}
			},

			// Delete thesis
			deleteThesis: async (id: string) => {
				set({ deleting: true, lastError: null });
				try {
					const response = await thesisService.delete(id);
					const result = handleApiResponse(response);

					if (result.success) {
						// Remove from local state
						const { theses } = get();
						const updatedTheses = theses.filter((thesis) => thesis.id !== id);
						set({
							theses: updatedTheses,
							deleting: false,
						});

						// Re-apply filters
						get().filterTheses();

						// Update cache with filtered data instead of invalidating
						cacheUtils.set('thesis', 'all', updatedTheses);

						return true;
					} else {
						throw new Error(
							getErrorMessage(result.error?.message, 'Failed to delete thesis'),
						);
					}
				} catch (error) {
					handleActionError(error, 'thesis', 'delete', set);
					set({ deleting: false });
					return false;
				}
			},

			// Toggle publish status
			toggleThesisPublishStatus: async (id: string) => {
				set({ toggling: true, lastError: null });
				try {
					// Get current thesis to determine new publish state
					const { theses } = get();
					const currentThesis = theses.find((thesis) => thesis.id === id);
					if (!currentThesis) {
						throw new Error('Thesis not found');
					}

					// Use bulk API for single thesis toggle
					const response = await thesisService.publishTheses({
						thesisIds: [id],
						isPublish: !currentThesis.isPublish,
					});
					const result = handleApiResponse(response);

					if (result.success) {
						// Update local state
						const updatedTheses = theses.map((thesis) =>
							thesis.id === id
								? { ...thesis, isPublish: !thesis.isPublish }
								: thesis,
						);
						set({
							theses: updatedTheses,
							toggling: false,
						});

						// Re-apply filters
						get().filterTheses();

						// Update cache
						cacheUtils.set('thesis', 'all', updatedTheses);

						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to toggle publish status',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'thesis', 'toggle publish status', set);
					set({ toggling: false });
					return false;
				}
			},

			// Submit thesis
			submitThesis: async (id: string) => {
				set({ toggling: true, lastError: null });
				try {
					const response = await thesisService.submitThesis(id);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Update local state
						const { theses } = get();
						const updatedTheses = theses.map((thesis) =>
							thesis.id === id
								? { ...thesis, status: 'Pending' as const }
								: thesis,
						);
						set({
							theses: updatedTheses,
							toggling: false,
						});

						// Re-apply filters
						get().filterTheses();

						// Update cache
						cacheUtils.set('thesis', 'all', updatedTheses);

						return true;
					} else {
						throw new Error(
							getErrorMessage(result.error?.message, 'Failed to submit thesis'),
						);
					}
				} catch (error) {
					handleActionError(error, 'thesis', 'submit', set);
					set({ toggling: false });
					return false;
				}
			},

			// Review thesis (approve/reject)
			reviewThesis: async (id: string, status: 'Approved' | 'Rejected') => {
				set({ toggling: true, lastError: null });
				try {
					const response = await thesisService.reviewThesis(id, {
						status,
					});
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Update local state with new status
						const { theses } = get();
						const updatedTheses = theses.map((thesis) =>
							thesis.id === id ? { ...thesis, status } : thesis,
						);
						set({
							theses: updatedTheses,
							toggling: false,
						});

						// Re-apply filters
						get().filterTheses();

						// Update cache
						cacheUtils.set('thesis', 'all', updatedTheses);

						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								`Failed to ${status.toLowerCase()} thesis`,
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'thesis', 'review', set);
					set({ toggling: false });
					return false;
				}
			},

			// Error management
			clearError: () => set({ lastError: null }),

			// Filter actions
			setSearchText: (text: string) => {
				set({ searchText: text });
				get().filterTheses();
			},

			setSelectedStatus: (status: ThesisStatusFilter) => {
				set({ selectedStatus: status });
				get().filterTheses();
			},

			setSelectedDomain: (domain: string | undefined) => {
				set({ selectedDomain: domain });
				get().filterTheses();
			},

			setSelectedOwned: (owned: boolean | undefined) => {
				set({ selectedOwned: owned });
				get().filterTheses();
			},

			setSelectedSemester: (semester: string | undefined) => {
				set({ selectedSemester: semester });
				get().filterTheses();
			},

			filterTheses: () => {
				const {
					theses,
					searchText,
					selectedStatus,
					selectedDomain,
					selectedOwned,
					selectedSemester,
					sessionLecturerId,
				} = get();

				let filtered = theses;

				// Filter by search text
				if (searchText.trim()) {
					filtered = thesisSearchFilter(filtered, searchText);
				}

				// Filter by status
				if (selectedStatus) {
					filtered = filtered.filter(
						(thesis) => thesis.status.toLowerCase() === selectedStatus,
					);
				}

				// Filter by domain
				if (selectedDomain) {
					filtered = filtered.filter(
						(thesis) => thesis.domain === selectedDomain,
					);
				}

				// Filter by semester
				if (selectedSemester) {
					filtered = filtered.filter(
						(thesis) => thesis.semesterId === selectedSemester,
					);
				}

				// Filter by owned
				if (selectedOwned !== undefined) {
					if (selectedOwned && sessionLecturerId) {
						// Show only my theses
						filtered = filtered.filter(
							(thesis) => thesis.lecturerId === sessionLecturerId,
						);
					}
					// If selectedOwned is false, show all theses (no additional filter)
				}

				set({ filteredTheses: filtered });
			},

			// Utility functions
			reset: () => {
				cacheUtils.clear('thesis');
				set({
					theses: [],
					filteredTheses: [],
					loading: false,
					creating: false,
					updating: false,
					deleting: false,
					toggling: false,
					lastError: null,
					searchText: '',
					selectedStatus: undefined,
					selectedDomain: undefined,
					selectedOwned: undefined,
					currentLecturerId: null,
					sessionLecturerId: null,
					_thesisLoadingStates: new Map(),
					_backgroundRefreshRunning: false,
					_lastBackgroundRefresh: 0,
				});
			},

			clearTheses: () => {
				set({ theses: [], filteredTheses: [] });
			},

			getThesisById: (id: string) => {
				const { theses } = get();
				return theses.find((thesis) => thesis.id === id);
			},

			updateThesisInStore: (updatedThesis: Thesis) => {
				const { theses } = get();
				const updatedTheses = theses.map((thesis) =>
					thesis.id === updatedThesis.id ? updatedThesis : thesis,
				);
				set({ theses: updatedTheses });
				cacheUtils.clear('thesis');
				get().filterTheses();
			},

			isThesisLoading: (id: string) => {
				const { _thesisLoadingStates } = get();
				return _thesisLoadingStates.get(id) ?? false;
			},

			setSessionLecturerId: (lecturerId: string | null) => {
				set({ sessionLecturerId: lecturerId });
				// Re-apply filters since owned filter depends on sessionLecturerId
				get().filterTheses();
			},
		}),
		{
			name: 'thesis-store',
		},
	),
);
