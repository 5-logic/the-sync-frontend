import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import semesterService from '@/lib/services/semesters.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { Semester, SemesterCreate, SemesterUpdate } from '@/schemas/semester';

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
}

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
			searchText: '',

			// Actions
			fetchSemesters: async () => {
				set({ loading: true, lastError: null });
				try {
					const response = await semesterService.findAll();
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						set({
							semesters: result.data,
							filteredSemesters: result.data,
						});
						get().filterSemesters();
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
					const apiError = handleApiError(error, 'Failed to fetch semesters');
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

			createSemester: async (data: SemesterCreate) => {
				set({ creating: true, lastError: null });
				try {
					const response = await semesterService.create(data);
					const result = handleApiResponse(
						response,
						'Semester created successfully',
					);

					if (result.success && result.data) {
						// Add to semesters array
						set((state) => ({
							semesters: [...state.semesters, result.data!],
						}));

						// Update filtered semesters
						get().filterSemesters();
						return true;
					} else if (result.error) {
						const error = {
							message: result.error.message,
							statusCode: result.error.statusCode,
							timestamp: new Date(),
						};
						set({ lastError: error });

						let errorTitle = 'Error';
						switch (result.error.statusCode) {
							case 400:
								errorTitle = 'Validation Error';
								break;
							case 409:
								errorTitle = 'Conflict Error';
								break;
							case 422:
								errorTitle = 'Invalid Data';
								break;
							default:
								errorTitle = `Error ${result.error.statusCode}`;
						}

						showNotification.error(errorTitle, result.error.message);
						return false;
					}
				} catch (error) {
					const apiError = handleApiError(error, 'Failed to create semester');
					const errorState = {
						message: apiError.message,
						statusCode: apiError.statusCode,
						timestamp: new Date(),
					};
					set({ lastError: errorState });

					showNotification.error(`Error`, apiError.message);
					return false;
				} finally {
					set({ creating: false });
				}
				return false;
			},

			updateSemester: async (id: string, data: SemesterUpdate) => {
				set({ updating: true, lastError: null });
				try {
					const response = await semesterService.update(id, data);
					const result = handleApiResponse(
						response,
						'Semester updated successfully',
					);

					if (result.success && result.data) {
						// Update semester in array
						set((state) => ({
							semesters: state.semesters.map((semester) =>
								semester.id === id ? result.data! : semester,
							),
						}));

						// Update filtered semesters
						get().filterSemesters();
						return true;
					} else if (result.error) {
						const error = {
							message: result.error.message,
							statusCode: result.error.statusCode,
							timestamp: new Date(),
						};
						set({ lastError: error });

						showNotification.error(`Error`, result.error.message);
						return false;
					}
				} catch (error) {
					const apiError = handleApiError(error, 'Failed to update semester');
					const errorState = {
						message: apiError.message,
						statusCode: apiError.statusCode,
						timestamp: new Date(),
					};
					set({ lastError: errorState });

					showNotification.error(`Error`, apiError.message);
					return false;
				} finally {
					set({ updating: false });
				}
				return false;
			},

			deleteSemester: async (id: string) => {
				set({ deleting: true, lastError: null });
				try {
					const response = await semesterService.delete(id);
					const result = handleApiResponse(
						response,
						'Semester deleted successfully',
					);

					if (result.success) {
						// Remove from semesters array
						set((state) => ({
							semesters: state.semesters.filter(
								(semester) => semester.id !== id,
							),
						}));

						// Update filtered semesters
						get().filterSemesters();
						return true;
					} else if (result.error) {
						const error = {
							message: result.error.message,
							statusCode: result.error.statusCode,
							timestamp: new Date(),
						};
						set({ lastError: error });

						showNotification.error(`Error`, result.error.message);
						return false;
					}
				} catch (error) {
					const apiError = handleApiError(error, 'Failed to delete semester');
					const errorState = {
						message: apiError.message,
						statusCode: apiError.statusCode,
						timestamp: new Date(),
					};
					set({ lastError: errorState });

					showNotification.error(`Error`, apiError.message);
					return false;
				} finally {
					set({ deleting: false });
				}
				return false;
			},

			// Error management
			clearError: () => {
				set({ lastError: null });
			},

			// Filters
			setSearchText: (text: string) => {
				set({ searchText: text });
				get().filterSemesters();
			},

			filterSemesters: () => {
				const { semesters, searchText } = get();

				let filtered = semesters;

				// Filter by search text (name or code)
				if (searchText) {
					const lowercaseSearch = searchText.toLowerCase();
					filtered = filtered.filter((semester) =>
						[semester.name, semester.code].some((field) =>
							field?.toLowerCase().includes(lowercaseSearch),
						),
					);
				}

				set({ filteredSemesters: filtered });
			},

			// Utilities
			reset: () => {
				set({
					semesters: [],
					filteredSemesters: [],
					loading: false,
					creating: false,
					updating: false,
					deleting: false,
					lastError: null,
					searchText: '',
				});
			},

			getSemesterById: (id: string) => {
				return get().semesters.find((semester) => semester.id === id);
			},

			getSemesterByCode: (code: string) => {
				return get().semesters.find((semester) => semester.code === code);
			},
		}),
		{
			name: 'semester-store',
		},
	),
);
