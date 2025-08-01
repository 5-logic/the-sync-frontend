import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import milestoneService from '@/lib/services/milestones.service';
import { handleApiError } from '@/lib/utils/handleApi';
import {
	Milestone,
	MilestoneCreate,
	MilestoneUpdate,
} from '@/schemas/milestone';
import {
	cacheInvalidation,
	cacheUtils,
	createCachedFetchAction,
} from '@/store/helpers/cacheHelpers';
import {
	commonStoreUtilities,
	createCreateAction,
	createDeleteAction,
	createSearchFilter,
	createUpdateAction,
} from '@/store/helpers/storeHelpers';

// Filter function for milestones
const milestoneSearchFilter = createSearchFilter<Milestone>(
	(milestone: Milestone) => [milestone.name],
);

interface MilestoneState {
	// Data
	milestones: Milestone[];
	currentMilestone: Milestone | null;
	filteredMilestones: Milestone[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	deleting: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// UI states
	selectedSemesterId: string | null;
	searchText: string;

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchMilestones: (force?: boolean) => Promise<void>;
	fetchCurrentMilestone: () => Promise<void>;
	/**
	 * Fetch milestones by semesterId and update milestones state
	 */
	fetchMilestonesBySemester: (semesterId: string) => Promise<void>;
	createMilestone: (data: MilestoneCreate) => Promise<boolean>;
	updateMilestone: (id: string, data: MilestoneUpdate) => Promise<boolean>;
	deleteMilestone: (id: string) => Promise<boolean>;

	// Error management
	clearError: () => void;

	// Filters
	setSelectedSemesterId: (semesterId: string | null) => void;
	setSearchText: (text: string) => void;
	filterMilestones: () => void;

	// Utilities
	reset: () => void;
	getMilestoneById: (id: string) => Milestone | undefined;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

export const useMilestoneStore = create<MilestoneState>()(
	devtools(
		(set, get) => ({
			// Initial state
			milestones: [],
			currentMilestone: null,
			filteredMilestones: [],
			loading: false,
			creating: false,
			updating: false,
			deleting: false,
			lastError: null,
			selectedSemesterId: null,
			searchText: '',

			// Cache utilities
			cache: {
				clear: () => cacheInvalidation.invalidateEntity('milestone'),
				stats: () => cacheUtils.getStats('milestone'),
				invalidate: () => cacheInvalidation.invalidateEntity('milestone'),
			},

			// Actions using cached fetch
			fetchMilestones: createCachedFetchAction(milestoneService, 'milestone', {
				ttl: 3 * 60 * 1000, // 3 minutes
				enableLocalStorage: true,
			})(set, get),

			// Enhanced CRUD actions with cache invalidation
			createMilestone: async (data: MilestoneCreate) => {
				const result = await createCreateAction(milestoneService, 'milestone')(
					set,
					get,
				)(data);
				if (result) {
					// Invalidate cache after successful create
					cacheInvalidation.invalidateEntity('milestone');
				}
				return result;
			},

			updateMilestone: async (id: string, data: MilestoneUpdate) => {
				const result = await createUpdateAction(milestoneService, 'milestone')(
					set,
					get,
				)(id, data);
				if (result) {
					// Invalidate cache after successful update
					cacheInvalidation.invalidateEntity('milestone');
				}
				return result;
			},

			deleteMilestone: async (id: string) => {
				const result = await createDeleteAction(milestoneService, 'milestone')(
					set,
					get,
				)(id);
				if (result) {
					// Invalidate cache after successful delete
					cacheInvalidation.invalidateEntity('milestone');
				}
				return result;
			},

			// Custom action for fetching current milestone
			fetchCurrentMilestone: async () => {
				try {
					const response = await milestoneService.getCurrentMilestone();
					if (response.success) {
						set({ currentMilestone: response.data });
					}
				} catch (error) {
					console.error('Error fetching current milestone:', error);
				}
			},

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()),

			// Filters
			setSelectedSemesterId: (semesterId: string | null) => {
				set({ selectedSemesterId: semesterId });
				get().filterMilestones();
			},

			setSearchText: commonStoreUtilities.createSetSearchText(
				'filterMilestones',
			)(set, get),

			filterMilestones: () => {
				const { milestones, selectedSemesterId, searchText } = get();

				let filtered = milestones;

				// Filter by semester
				if (selectedSemesterId) {
					filtered = filtered.filter(
						(milestone: Milestone) =>
							milestone.semesterId === selectedSemesterId,
					);
				}

				// Filter by search text
				if (searchText) {
					filtered = milestoneSearchFilter(filtered, searchText);
				}

				set({ filteredMilestones: filtered });
			},

			fetchMilestonesBySemester: async (semesterId: string) => {
				const state = get();

				// Skip if already loading the same semester
				if (state.loading && state.selectedSemesterId === semesterId) {
					return;
				}

				set({ loading: true, selectedSemesterId: semesterId });

				try {
					// Generate specific cache key for this semester
					const cacheKey = `milestone-semester-${semesterId}`;
					const cached = cacheUtils.get('milestone', cacheKey);

					if (cached && Array.isArray(cached)) {
						// Use cached data and update store
						set({
							milestones: cached as Milestone[],
							loading: false,
							lastError: null,
						});

						// Apply filters
						get().filterMilestones();
						return;
					}

					// Fetch from API if not cached
					const response = await milestoneService.findAllBySemester(semesterId);

					if (response.success) {
						const milestonesData = response.data;

						// Cache the specific semester data
						cacheUtils.set('milestone', cacheKey, milestonesData);

						// Update store
						set({
							milestones: milestonesData,
							loading: false,
							lastError: null,
						});

						// Apply filters
						get().filterMilestones();
					} else {
						throw new Error(response.error);
					}
				} catch (error: unknown) {
					const apiError = handleApiError(
						error,
						'Failed to fetch milestones by semester',
					);
					set({
						loading: false,
						lastError: {
							message: apiError.message,
							statusCode: apiError.statusCode || 500,
							timestamp: new Date(),
						},
					});
				}
			},
			// Utilities
			reset: () =>
				set(
					commonStoreUtilities.createReset('milestone', {
						currentMilestone: null,
						selectedSemesterId: null,
					})(),
				),
			getMilestoneById:
				commonStoreUtilities.createGetById<Milestone>('milestone')(get),
		}),
		{
			name: 'milestone-store',
		},
	),
);
