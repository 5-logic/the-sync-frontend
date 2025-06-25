import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import studentService from '@/lib/services/students.service';
import {
	ImportStudent,
	Student,
	StudentCreate,
	StudentToggleStatus,
	StudentUpdate,
} from '@/schemas/student';
import {
	commonStoreUtilities,
	createBatchCreateAction,
	createCreateAction,
	createFetchAction,
	createFetchBySemesterAction,
	createSearchFilter,
	createToggleStatusAction,
	createUpdateAction,
} from '@/store/helpers/storeHelpers';

interface StudentState {
	// Data
	students: Student[];
	filteredStudents: Student[];

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	creatingMany: boolean; // Legacy field for backward compatibility
	creatingManyStudents: boolean; // New field for consistency
	togglingStatus: boolean;

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
	fetchStudentsBySemester: (semesterId: string) => Promise<void>;
	createStudent: (data: StudentCreate) => Promise<boolean>;
	createManyStudents: (data: ImportStudent) => Promise<boolean>;
	updateStudent: (id: string, data: StudentUpdate) => Promise<boolean>;
	toggleStudentStatus: (
		id: string,
		data: StudentToggleStatus,
	) => Promise<boolean>;

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
	clearStudents: () => void;
	getStudentById: (id: string) => Student | undefined;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Filter function for students
const studentSearchFilter = createSearchFilter<Student>((student) => [
	student.fullName,
	student.email,
	student.studentId,
]);

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
			togglingStatus: false,
			lastError: null,
			selectedSemesterId: null,
			selectedMajorId: null,
			selectedStatus: 'All',
			searchText: '',

			// Actions using helpers
			fetchStudents: createFetchAction(studentService, 'student')(set, get),
			fetchStudentsBySemester: createFetchBySemesterAction(
				studentService,
				'student',
			)(set, get),
			createStudent: createCreateAction(studentService, 'student')(set, get),
			updateStudent: createUpdateAction(studentService, 'student')(set, get),
			createManyStudents: createBatchCreateAction(studentService, 'student')(
				set,
				get,
			),
			toggleStudentStatus: createToggleStatusAction(studentService, 'student')(
				set,
				get,
			),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()),

			// Filters
			setSelectedSemesterId: (semesterId: string | null) => {
				// Clear students when changing semester to avoid stale data
				set({
					students: [],
					filteredStudents: [],
					selectedSemesterId: semesterId,
				});
				// Apply filters with empty data
				const currentState = get();
				const filterFunction = currentState.filterStudents;
				if (typeof filterFunction === 'function') {
					filterFunction();
				}
			},
			setSelectedMajorId: commonStoreUtilities.createFieldSetter(
				'selectedMajorId',
				'filterStudents',
			)(set, get),
			setSelectedStatus: commonStoreUtilities.createFieldSetter(
				'selectedStatus',
				'filterStudents',
			)(set, get),
			setSearchText: commonStoreUtilities.createSetSearchText('filterStudents')(
				set,
				get,
			),

			filterStudents: () => {
				const { students, selectedMajorId, selectedStatus, searchText } = get();

				let filtered = students;

				// Note: Semester filtering is now handled by fetching students by semester
				// using the fetchStudentsBySemester method instead of client-side filtering

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

				// Apply text search
				filtered = studentSearchFilter(filtered, searchText);

				set({ filteredStudents: filtered });
			},

			// Utilities
			reset: () =>
				set(
					commonStoreUtilities.createReset('student', {
						selectedSemesterId: null,
						selectedMajorId: null,
						selectedStatus: 'All',
					})(),
				),
			clearStudents: () => set({ students: [], filteredStudents: [] }),
			getStudentById:
				commonStoreUtilities.createGetById<Student>('student')(get),
		}),
		{
			name: 'student-store',
		},
	),
);
