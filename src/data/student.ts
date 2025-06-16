import { Student } from '@/schemas/student';

const defaultPhoneNumber = '0123456789';
const defaultPassword = 'MockPassword!123'; // ✅ Đặt ra 1 biến rõ ràng, tránh hard-code lặp lại

function createMockStudent(
	id: string,
	fullName: string,
	email: string,
	gender: 'male' | 'female',
	isActive: boolean,
	studentId: string,
	majorId: string,
): Student {
	return {
		id,
		fullName,
		email,
		password: defaultPassword, // ✅ Bổ sung field password
		phoneNumber: defaultPhoneNumber,
		gender,
		isActive,
		studentId,
		majorId,
	};
}

export const mockStudents: Student[] = [
	createMockStudent(
		'1',
		'Alice Nguyen',
		'alice.nguyen@student.edu',
		'female',
		true,
		'ST0001',
		'SE',
	),
	createMockStudent(
		'2',
		'Bob Tran',
		'bob.tran@student.edu',
		'male',
		false,
		'ST0002',
		'AI',
	),
	createMockStudent(
		'3',
		'Hihi',
		'rfc@student.edu',
		'female',
		true,
		'ST0003',
		'SE',
	),
	createMockStudent(
		'4',
		'Huhu',
		'azxdf@student.edu',
		'male',
		false,
		'ST0004',
		'AI',
	),
	createMockStudent(
		'5',
		'Haha',
		'ert@student.edu',
		'female',
		true,
		'ST0005',
		'SE',
	),
	createMockStudent(
		'6',
		'Hoho',
		'jhgf@student.edu',
		'male',
		false,
		'ST0006',
		'AI',
	),
];
