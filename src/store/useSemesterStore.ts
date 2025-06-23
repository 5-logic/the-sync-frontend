import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import semesterService from '@/lib/services/semesters.service';
import { Semester, SemesterCreate, SemesterUpdate } from '@/schemas/semester';
import {
	commonStoreUtilities,
	createCreateAction,
	createDeleteAction,
	createFetchAction,
	createSearchFilter,
	createUpdateAction,
} from '@/store/helpers/storeHelpers';

interface SemesterState {
	// Data
	semesters: Semester[];
	filteredSemesters: Semester[];

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
	searchText: string;

	// Actions
	fetchSemesters: () => Promise<void>;
	createSemester: (data: SemesterCreate) => Promise<boolean>;
	updateSemester: (id: string, data: SemesterUpdate) => Promise<boolean>;
	deleteSemester: (id: string) => Promise<boolean>;

	// Error management
	clearError: () => void;

	// Filters
	setSearchText: (text: string) => void;
	filterSemesters: () => void;

	// Utilities
	reset: () => void;
	getSemesterById: (id: string) => Semester | undefined;
	getSemesterByCode: (code: string) => Semester | undefined;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Filter function for semesters
const semesterSearchFilter = createSearchFilter<Semester>(
	(semester: Semester) => [semester.name, semester.code],
);

export const useSemesterStore = create<SemesterState>()(
	devtools(
		(set, get) => ({
			// Initial state
			semesters: [],
			filteredSemesters: [],
			loading: false,
			creating: false,
			updating: false,
			deleting: false,
			lastError: null,
			searchText: '', // Actions using helpers
			fetchSemesters: createFetchAction(semesterService, 'semester')(set, get),
			createSemester: createCreateAction(semesterService, 'semester')(set, get),
			updateSemester: createUpdateAction(semesterService, 'semester')(set, get),
			deleteSemester: createDeleteAction(semesterService, 'semester')(set, get),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()), // Filters
			setSearchText: commonStoreUtilities.createSetSearchText(
				'filterSemesters',
			)(set, get),

			filterSemesters: () => {
				const { semesters, searchText } = get();
				const filtered = semesterSearchFilter(semesters, searchText);
				set({ filteredSemesters: filtered });
			},

			// Utilities
			reset: () => set(commonStoreUtilities.createReset('semester')()),
			getSemesterById:
				commonStoreUtilities.createGetById<Semester>('semester')(get),

			getSemesterByCode: (code: string) => {
				return get().semesters.find((semester) => semester.code === code);
			},
		}),
		{
			name: 'semester-store',
		},
	),
);
