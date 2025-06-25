import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import lecturerService from '@/lib/services/lecturers.service';
import {
	Lecturer,
	LecturerCreate,
	LecturerToggleStatus,
	LecturerUpdate,
} from '@/schemas/lecturer';
import {
	commonStoreUtilities,
	createBatchCreateAction,
	createCreateAction,
	createFetchAction,
	createSearchFilter,
	createToggleStatusAction,
	createUpdateAction,
} from '@/store/helpers/storeHelpers';

interface LecturerState {
	// Data
	lecturers: Lecturer[];
	filteredLecturers: Lecturer[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	creatingMany: boolean; // Legacy field for backward compatibility
	creatingManyLecturers: boolean; // New field for consistency
	togglingStatus: boolean;

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

	// Actions
	fetchLecturers: () => Promise<void>;
	createLecturer: (data: LecturerCreate) => Promise<boolean>;
	createManyLecturers: (data: LecturerCreate[]) => Promise<boolean>;
	updateLecturer: (id: string, data: LecturerUpdate) => Promise<boolean>;
	toggleLecturerStatus: (
		id: string,
		data: LecturerToggleStatus,
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
	getLecturerById: (id: string) => Lecturer | undefined;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Filter function for lecturers
const lecturerSearchFilter = createSearchFilter<Lecturer>((lecturer) => [
	lecturer.fullName,
	lecturer.email,
	lecturer.phoneNumber,
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
			creatingMany: false,
			togglingStatus: false,
			lastError: null,
			selectedStatus: 'All',
			selectedModerator: 'All',
			searchText: '',

			// Actions using helpers
			fetchLecturers: createFetchAction(lecturerService, 'lecturer')(set, get),
			createLecturer: createCreateAction(lecturerService, 'lecturer')(set, get),
			updateLecturer: createUpdateAction(lecturerService, 'lecturer')(set, get),
			createManyLecturers: createBatchCreateAction(lecturerService, 'lecturer')(
				set,
				get,
			),
			toggleLecturerStatus: createToggleStatusAction(
				lecturerService,
				'lecturer',
			)(set, get),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()), // Filters
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
			}, // Utilities
			reset: () =>
				set(
					commonStoreUtilities.createReset('lecturer', {
						selectedStatus: 'All',
						selectedModerator: 'All',
					})(),
				),
			getLecturerById:
				commonStoreUtilities.createGetById<Lecturer>('lecturer')(get),
		}),
		{
			name: 'lecturer-store',
		},
	),
);
