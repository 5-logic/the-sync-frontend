import { Lecturer } from '@/schemas/lecturer';

const baseLecturer: Omit<
	Lecturer,
	'id' | 'fullName' | 'email' | 'phoneNumber' | 'gender' | 'createdAt'
> & {
	instructionGroups: string;
} = {
	password: '',
	instructionGroups: '03',
	updatedAt: new Date('2024-06-01'),
	isActive: true,
	isModerator: false,
};

function createLecturer(
	id: string,
	fullName: string,
	email: string,
	phoneNumber: string,
	gender: 'Male' | 'Female',
	createdAt: Date,
	override?: Partial<Lecturer & { instructionGroups: string }>,
): Lecturer & { instructionGroups: string } {
	return {
		id,
		fullName,
		email,
		phoneNumber,
		gender,
		createdAt,
		...baseLecturer,
		...override,
	};
}

export const mockLecturers: (Lecturer & { instructionGroups: string })[] = [
	createLecturer(
		'l1',
		'Dr. Sarah Johnson',
		'sarah.johnson@university.edu',
		'0444444444',
		'Female',
		new Date('2024-01-01'),
	),
	createLecturer(
		'l2',
		'Dr. Davis',
		'davis@university.edu',
		'0555555555',
		'Male',
		new Date('2024-02-15'),
		{
			isModerator: true,
		},
	),
	createLecturer(
		'l3',
		'Dr. Emily Wong',
		'emily.wong@university.edu',
		'0666666666',
		'Female',
		new Date('2023-11-20'),
		{
			isActive: false,
			updatedAt: new Date('2024-05-20'),
		},
	),
	createLecturer(
		'l4',
		'Dr. Michael Chen',
		'michael.chen@university.edu',
		'0777777777',
		'Male',
		new Date('2024-03-01'),
	),
	createLecturer(
		'l5',
		'Dr. Martinez',
		'martinez@university.edu',
		'0888888888',
		'Male',
		new Date('2024-04-01'),
	),
	createLecturer(
		'l6',
		'Dr. John Smith',
		'john.smith@university.edu',
		'0999999999',
		'Male',
		new Date('2024-04-10'),
	),
	createLecturer(
		'l7',
		'Dr. Lan',
		'lan@university.edu',
		'0111111111',
		'Female',
		new Date('2024-04-15'),
	),
];
