import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import studentService from '@/lib/services/students.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { Student, StudentCreate, StudentUpdate } from '@/schemas/student';

interface StudentState {
	// Data
	students: Student[];
	filteredStudents: Student[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	creatingMany: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// UI states
	selectedSemesterId: string | null;
	selectedMajorId: string | null;
	selectedStatus: string;
	searchText: string;

	// Actions
	fetchStudents: () => Promise<void>;
	createStudent: (data: StudentCreate) => Promise<boolean>;
	createManyStudents: (data: StudentCreate[]) => Promise<boolean>;
	updateStudent: (id: string, data: StudentUpdate) => Promise<boolean>;

	// Error management
	clearError: () => void;

	// Filters
	setSelectedSemesterId: (semesterId: string | null) => void;
	setSelectedMajorId: (majorId: string | null) => void;
	setSelectedStatus: (status: string) => void;
	setSearchText: (text: string) => void;
	filterStudents: () => void;

	// Utilities
	reset: () => void;
	getStudentById: (id: string) => Student | undefined;
}

export const useStudentStore = create<StudentState>()(
	devtools(
		(set, get) => ({
			// Initial state
			students: [],
			filteredStudents: [],
			loading: false,
			creating: false,
			updating: false,
			creatingMany: false,
			lastError: null,
			selectedSemesterId: null,
			selectedMajorId: null,
			selectedStatus: 'All',
			searchText: '',

			// Actions
			fetchStudents: async () => {
				set({ loading: true, lastError: null });
				try {
					const response = await studentService.findAll();
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						set({
							students: result.data,
							filteredStudents: result.data,
						});
						get().filterStudents();
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
					const apiError = handleApiError(error, 'Failed to fetch students');
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

			createStudent: async (data: StudentCreate) => {
				set({ creating: true, lastError: null });
				try {
					const response = await studentService.create(data);
					const result = handleApiResponse(
						response,
						'Student created successfully',
					);

					if (result.success && result.data) {
						// Add to students array
						set((state) => ({
							students: [...state.students, result.data!],
						}));

						// Update filtered students
						get().filterStudents();
						return true;
					} else if (result.error) {
						const error = {
							message: result.error.message,
							statusCode: result.error.statusCode,
							timestamp: new Date(),
						};
						set({ lastError: error });

						// Hiển thị error message chi tiết dựa trên status code
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
					const apiError = handleApiError(error, 'Failed to create student');
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

			createManyStudents: async (data: StudentCreate[]) => {
				set({ creatingMany: true, lastError: null });
				try {
					const response = await studentService.createMany(data);
					const result = handleApiResponse(
						response,
						`${data.length} students created successfully`,
					);

					if (result.success && result.data) {
						// Add all new students to the array
						set((state) => ({
							students: [...state.students, ...result.data!],
						}));

						// Update filtered students
						get().filterStudents();
						return true;
					} else if (result.error) {
						const error = {
							message: result.error.message,
							statusCode: result.error.statusCode,
							timestamp: new Date(),
						};
						set({ lastError: error });

						// Display detailed error message based on status code
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
					const apiError = handleApiError(error, 'Failed to create students');
					const errorState = {
						message: apiError.message,
						statusCode: apiError.statusCode,
						timestamp: new Date(),
					};
					set({ lastError: errorState });

					showNotification.error(`Error`, apiError.message);
					return false;
				} finally {
					set({ creatingMany: false });
				}
				return false;
			},

			updateStudent: async (id: string, data: StudentUpdate) => {
				set({ updating: true, lastError: null });
				try {
					const response = await studentService.update(id, data);
					const result = handleApiResponse(
						response,
						'Student updated successfully',
					);

					if (result.success && result.data) {
						// Update student in array
						set((state) => ({
							students: state.students.map((student) =>
								student.id === id ? result.data! : student,
							),
						}));

						// Update filtered students
						get().filterStudents();
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
					const apiError = handleApiError(error, 'Failed to update student');
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

			// Error management
			clearError: () => {
				set({ lastError: null });
			},

			// Filters
			setSelectedSemesterId: (semesterId: string | null) => {
				set({ selectedSemesterId: semesterId });
				get().filterStudents();
			},

			setSelectedMajorId: (majorId: string | null) => {
				set({ selectedMajorId: majorId });
				get().filterStudents();
			},

			setSelectedStatus: (status: string) => {
				set({ selectedStatus: status });
				get().filterStudents();
			},

			setSearchText: (text: string) => {
				set({ searchText: text });
				get().filterStudents();
			},

			filterStudents: () => {
				const {
					students,
					selectedSemesterId,
					selectedMajorId,
					selectedStatus,
					searchText,
				} = get();

				let filtered = students;

				if (selectedSemesterId && selectedSemesterId !== 'All') {
					filtered = filtered.filter(
						(student) => student.semesterId === selectedSemesterId,
					);
				}

				if (selectedMajorId && selectedMajorId !== 'All') {
					filtered = filtered.filter(
						(student) => student.majorId === selectedMajorId,
					);
				}

				if (selectedStatus !== 'All') {
					filtered = filtered.filter(
						(student) => student.isActive === (selectedStatus === 'Active'),
					);
				}

				if (searchText) {
					const lowercaseSearch = searchText.toLowerCase();
					filtered = filtered.filter((student) =>
						[student.fullName, student.email, student.studentId].some((field) =>
							field?.toLowerCase().includes(lowercaseSearch),
						),
					);
				}

				set({ filteredStudents: filtered });
			},

			// Utilities
			reset: () => {
				set({
					students: [],
					filteredStudents: [],
					loading: false,
					creating: false,
					updating: false,
					creatingMany: false,
					lastError: null,
					selectedSemesterId: null,
					selectedMajorId: null,
					selectedStatus: 'All',
					searchText: '',
				});
			},

			getStudentById: (id: string) => {
				return get().students.find((student) => student.id === id);
			},
		}),
		{
			name: 'student-store',
		},
	),
);
