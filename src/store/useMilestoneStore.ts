import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import milestoneService from '@/lib/services/milestones.service';
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
	fetchMilestonesBySemester: (semesterId: string) => Promise<void>;
	fetchCurrentMilestone: () => Promise<void>;
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
