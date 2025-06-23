import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import majorService from '@/lib/services/majors.service';
import { Major } from '@/schemas/major';
import {
	commonStoreUtilities,
	createFetchAction,
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

	// Actions
	fetchMajors: () => Promise<void>;

	// Error management
	clearError: () => void;

	// Filters
	setSearchText: (text: string) => void;
	filterMajors: () => void;

	// Utilities
	reset: () => void;
	getMajorById: (id: string) => Major | undefined;
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

			// Actions using helpers
			fetchMajors: createFetchAction(majorService, 'major')(set, get),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()), // Filters
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
