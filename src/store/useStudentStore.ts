import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import studentService from '@/lib/services/students.service';
import { Student, StudentCreate, StudentUpdate } from '@/schemas/student';
import {
	commonStoreUtilities,
	createBatchCreateAction,
	createCreateAction,
	createFetchAction,
	createSearchFilter,
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
			lastError: null,
			selectedSemesterId: null,
			selectedMajorId: null,
			selectedStatus: 'All',
			searchText: '', // Actions using helpers where applicable
			fetchStudents: createFetchAction(studentService, 'student')(set, get),
			createStudent: createCreateAction(studentService, 'student')(set, get),
			updateStudent: createUpdateAction(studentService, 'student')(set, get),

			// Custom action for creating many students
			createManyStudents: createBatchCreateAction(studentService, 'student')(
				set,
				get,
			),

			// Error management
			clearError: () => set(commonStoreUtilities.clearError()),

			// Filters
			setSelectedSemesterId: commonStoreUtilities.createFieldSetter(
				'selectedSemesterId',
				'filterStudents',
			)(set, get),
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
			getStudentById:
				commonStoreUtilities.createGetById<Student>('student')(get),
		}),
		{
			name: 'student-store',
		},
	),
);
