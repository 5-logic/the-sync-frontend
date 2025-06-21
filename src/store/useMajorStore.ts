import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import majorService from '@/lib/services/majors.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { Major } from '@/schemas/major';

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

export const useMajorStore = create<MajorState>()(
	devtools(
		(set, get) => ({
			// Initial state
			majors: [],
			filteredMajors: [],
			loading: false,
			lastError: null,
			searchText: '',

			// Actions
			fetchMajors: async () => {
				set({ loading: true, lastError: null });
				try {
					const response = await majorService.findAll();
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						set({
							majors: result.data,
							filteredMajors: result.data,
						});
						get().filterMajors();
					} else if (result.error) {
						const error = {
							message: result.error.message,
							statusCode: result.error.statusCode,
							timestamp: new Date(),
						};
						set({ lastError: error });

						showNotification.error(`Error`, result.error.message);
					}
				} catch (error) {
					const apiError = handleApiError(error, 'Failed to fetch majors');
					const errorState = {
						message: apiError.message,
						statusCode: apiError.statusCode,
						timestamp: new Date(),
					};
					set({ lastError: errorState });

					showNotification.error(`Error`, apiError.message);
				} finally {
					set({ loading: false });
				}
			},

			// Error management
			clearError: () => {
				set({ lastError: null });
			},

			// Filters
			setSearchText: (text: string) => {
				set({ searchText: text });
				get().filterMajors();
			},

			filterMajors: () => {
				const { majors, searchText } = get();

				let filtered = majors;

				// Filter by search text (name or code)
				if (searchText) {
					const lowercaseSearch = searchText.toLowerCase();
					filtered = filtered.filter((major) =>
						[major.name, major.code].some((field) =>
							field?.toLowerCase().includes(lowercaseSearch),
						),
					);
				}

				set({ filteredMajors: filtered });
			},

			// Utilities
			reset: () => {
				set({
					majors: [],
					filteredMajors: [],
					loading: false,
					lastError: null,
					searchText: '',
				});
			},

			getMajorById: (id: string) => {
				return get().majors.find((major) => major.id === id);
			},
		}),
		{
			name: 'major-store',
		},
	),
);
