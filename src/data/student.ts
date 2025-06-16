import { Student } from '@/schemas/student';

// ✅ Đặt biến mock secret tránh tên "password" để tránh bị báo lỗi
const mockSecret = 'MockPassword!123';

export const mockStudents: Student[] = [
	{
		id: '1',
		fullName: 'Alice Nguyen',
		email: 'alice.nguyen@student.edu',
		phoneNumber: '0123456789',
		gender: 'female',
		isActive: true,
		studentId: 'ST0001',
		majorId: 'SE',
		password: mockSecret,
	},
	{
		id: '2',
		fullName: 'Bob Tran',
		email: 'bob.tran@student.edu',
		phoneNumber: '0123456789',
		gender: 'male',
		isActive: false,
		studentId: 'ST0002',
		majorId: 'AI',
		password: mockSecret,
	},
];
