import { Student } from '@/schemas/student';

type CreateMockStudentParams = Omit<Student, 'phoneNumber'> & {
	phoneNumber?: string;
};

function createMockStudent({
	id,
	fullName,
	email,
	password,
	gender,
	isActive,
	studentId,
	majorId,
	phoneNumber = '0123456789',
}: CreateMockStudentParams): Student {
	return {
		id,
		fullName,
		email,
		password,
		phoneNumber,
		gender,
		isActive,
		studentId,
		majorId,
	};
}

export const mockStudents: Student[] = [
	createMockStudent({
		id: '1',
		fullName: 'Alice Nguyen',
		email: 'alice.nguyen@student.edu',
		password: 'password123',
		gender: 'female',
		isActive: true,
		studentId: 'ST0001',
		majorId: 'SE',
	}),
	createMockStudent({
		id: '2',
		fullName: 'Bob Tran',
		email: 'bob.tran@student.edu',
		password: 'password123',
		gender: 'male',
		isActive: false,
		studentId: 'ST0002',
		majorId: 'AI',
	}),
];
