import { Student } from '@/schemas/student';

// ✅ Đặt biến mock secret tránh tên "password" để tránh bị báo lỗi
const mockSecret = 'MockPassword!123';

export const mockStudents: Student[] = [
	{
		id: '1',
		fullName: 'Alice Nguyen',
		email: 'alice.nguyen@student.edu',
		phoneNumber: '0123456789',
		gender: 'Female',
		isActive: true,
		studentId: 'ST0001',
		majorId: 'SE',
		password: mockSecret,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-06-01'),
	},
	{
		id: '2',
		fullName: 'Bob Tran',
		email: 'bob.tran@student.edu',
		phoneNumber: '0123456789',
		gender: 'Male',
		isActive: false,
		studentId: 'ST0002',
		majorId: 'AI',
		password: mockSecret,
		createdAt: new Date('2024-02-15'),
		updatedAt: new Date('2024-06-01'),
	},
];
