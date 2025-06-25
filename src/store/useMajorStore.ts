import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import majorService from '@/lib/services/majors.service';
import { Major } from '@/schemas/major';
import {
	cacheInvalidation,
	cacheUtils,
	createCachedFetchAction,
} from '@/store/helpers/cacheHelpers';
import {
	commonStoreUtilities,
	createSearchFilter,
} from '@/store/helpers/storeHelpers';

interface MajorState {
	// Data
	majors: Major[];
	filteredMajors: Major[];

	// Loading states
	loading: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// UI states
	searchText: string;

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchMajors: (force?: boolean) => Promise<void>;

	// Error management
	clearError: () => void;

	// Filters
	setSearchText: (text: string) => void;
	filterMajors: () => void;

	// Utilities
	reset: () => void;
	getMajorById: (id: string) => Major | undefined;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Filter function for majors
const majorSearchFilter = createSearchFilter<Major>((major) => [
	major.name,
	major.code,
]);

export const useMajorStore = create<MajorState>()(
	devtools(
		(set, get) => ({
			// Initial state
			majors: [],
			filteredMajors: [],
			loading: false,
			lastError: null,
			searchText: '',

			// Cache utilities
			cache: {
				clear: () => cacheInvalidation.invalidateEntity('major'),
				stats: () => cacheUtils.getStats('major'),
				invalidate: () => cacheInvalidation.invalidateEntity('major'),
			},

			// Actions using cached fetch
			fetchMajors: createCachedFetchAction(majorService, 'major', {
				ttl: 10 * 60 * 1000, // 10 minutes for majors (rarely change)
				enableLocalStorage: true,
			})(set, get),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()),

			// Filters
			setSearchText: commonStoreUtilities.createSetSearchText('filterMajors')(
				set,
				get,
			),

			filterMajors: () => {
				const { majors, searchText } = get();
				const filtered = majorSearchFilter(majors, searchText);
				set({ filteredMajors: filtered });
			},

			// Utilities
			reset: () => set(commonStoreUtilities.createReset('major')()),
			getMajorById: commonStoreUtilities.createGetById<Major>('major')(get),
		}),
		{
			name: 'major-store',
		},
	),
);
