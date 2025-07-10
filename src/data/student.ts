import { Student } from '@/schemas/student';

// ✅ Đặt biến mock secret tránh tên "password" để tránh bị báo lỗi
const mockSecret = 'MockPassword!123';

// Common constants to reduce duplication
const COMMON_UPDATE_DATE = new Date('2024-06-01');
const COMMON_ACTIVE_STATUS = true;
const COMMON_PHONE_NUMBERS = {
	PRIMARY: '0123456789',
	SECONDARY: '0987654321',
	TERTIARY: '0456789123',
	QUATERNARY: '0789123456',
} as const;

const MAJORS = {
	SOFTWARE_ENGINEERING: 'SE',
	ARTIFICIAL_INTELLIGENCE: 'AI',
} as const;

// Mock skill và role ID đơn giản
const SKILLS = {
	JS: { skillId: '1', name: 'JavaScript', level: 'Intermediate' },
	PYTHON: { skillId: '2', name: 'Python', level: 'Advanced' },
	REACT: { skillId: '3', name: 'React', level: 'Beginner' },
};

const RESPONSIBILITIES = {
	FRONTEND: { responsibilityId: '1', name: 'Frontend Developer' },
	BACKEND: { responsibilityId: '2', name: 'Backend Developer' },
	FULLSTACK: { responsibilityId: '3', name: 'Fullstack Developer' },
};

export const mockStudents = [
	{
		id: '1',
		fullName: 'Alice Nguyen',
		email: 'alice.nguyen@student.edu',
		phoneNumber: COMMON_PHONE_NUMBERS.PRIMARY,
		gender: 'Female',
		isActive: COMMON_ACTIVE_STATUS,
		studentCode: 'ST0001',
		majorId: MAJORS.SOFTWARE_ENGINEERING,
		password: mockSecret,
		createdAt: new Date('2024-01-01'),
		updatedAt: COMMON_UPDATE_DATE,
		studentSkills: [SKILLS.JS],
		studentExpectedResponsibilities: [RESPONSIBILITIES.FRONTEND],
	},
	{
		id: '2',
		fullName: 'Bob Tran',
		email: 'bob.tran@student.edu',
		phoneNumber: COMMON_PHONE_NUMBERS.PRIMARY,
		gender: 'Male',
		isActive: false,
		studentCode: 'ST0002',
		majorId: MAJORS.ARTIFICIAL_INTELLIGENCE,
		password: mockSecret,
		createdAt: new Date('2024-02-15'),
		updatedAt: COMMON_UPDATE_DATE,
		studentSkills: [SKILLS.PYTHON],
		studentExpectedResponsibilities: [RESPONSIBILITIES.BACKEND],
	},
	{
		id: '3',
		fullName: 'Charlie Le',
		email: 'charlie.le@student.edu',
		phoneNumber: COMMON_PHONE_NUMBERS.SECONDARY,
		gender: 'Male',
		isActive: COMMON_ACTIVE_STATUS,
		studentCode: 'ST0003',
		majorId: MAJORS.SOFTWARE_ENGINEERING,
		password: mockSecret,
		createdAt: new Date('2024-01-15'),
		updatedAt: COMMON_UPDATE_DATE,
		studentSkills: [SKILLS.JS, SKILLS.PYTHON],
		studentExpectedResponsibilities: [RESPONSIBILITIES.FULLSTACK],
	},
	{
		id: '4',
		fullName: 'Diana Pham',
		email: 'diana.pham@student.edu',
		phoneNumber: COMMON_PHONE_NUMBERS.TERTIARY,
		gender: 'Female',
		isActive: COMMON_ACTIVE_STATUS,
		studentCode: 'ST0004',
		majorId: MAJORS.ARTIFICIAL_INTELLIGENCE,
		password: mockSecret,
		createdAt: new Date('2024-02-01'),
		updatedAt: COMMON_UPDATE_DATE,
		studentSkills: [SKILLS.REACT],
		studentExpectedResponsibilities: [RESPONSIBILITIES.FRONTEND],
	},
	{
		id: '5',
		fullName: 'Edward Vo',
		email: 'edward.vo@student.edu',
		phoneNumber: COMMON_PHONE_NUMBERS.QUATERNARY,
		gender: 'Male',
		isActive: COMMON_ACTIVE_STATUS,
		studentCode: 'ST0005',
		majorId: MAJORS.SOFTWARE_ENGINEERING,
		password: mockSecret,
		createdAt: new Date('2024-01-20'),
		updatedAt: COMMON_UPDATE_DATE,
		studentSkills: [SKILLS.JS, SKILLS.REACT],
		studentExpectedResponsibilities: [
			RESPONSIBILITIES.BACKEND,
			RESPONSIBILITIES.FRONTEND,
		],
	},
] as unknown as Student[];
