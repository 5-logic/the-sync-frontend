import { Thesis } from '@/schemas/thesis';

export type ExtendedThesis = Thesis & {
	skills: string[];
	highlight?: string;
	version: string;
	supervisor?: {
		name: string;
		phone: string;
		email: string;
	};
};

export const mockTheses: ExtendedThesis[] = [
	{
		id: 't1',
		englishName: 'AI-Powered Smart City Infrastructure Management',
		vietnameseName: 'Phân tích AI trong y tế',
		abbreviation: 'AIHCA',
		description: 'Thesis on applying AI in healthcare.',
		domain: 'AI',
		status: 'Approved',
		isPublish: true,
		groupId: 'g1',
		lecturerId: 'lect1',
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date(),
		skills: ['Python', 'AI', 'Healthcare'],
		highlight: 'High Similarity',
		version: '1.0',
		supervisor: {
			name: 'Dr. Sarah Chen',
			phone: '0123456789',
			email: 'sarah.chen@university.edu',
		},
	},
	{
		id: 't2',
		englishName: 'Blockchain Supply Chain',
		vietnameseName: 'Chuỗi cung ứng Blockchain',
		abbreviation: 'BLSC',
		description: 'Blockchain for supply chain transparency.',
		domain: 'Blockchain',
		status: 'Pending',
		isPublish: true,
		groupId: 'g2',
		lecturerId: 'lect2',
		createdAt: new Date('2024-01-08'),
		updatedAt: new Date(),
		skills: ['Blockchain', 'Logistics'],
		version: '1.0',
		supervisor: {
			name: 'Dr. Alex Nguyen',
			phone: '0987654321',
			email: 'alex.nguyen@university.edu',
		},
	},
	{
		id: 't3',
		englishName: 'Smart City IoT Platform',
		vietnameseName: 'Nền tảng IoT cho thành phố thông minh',
		abbreviation: 'SCIOT',
		description: 'Building a scalable IoT platform.',
		domain: 'IoT',
		status: 'Rejected',
		isPublish: false,
		groupId: 'g3',
		lecturerId: 'lect3',
		createdAt: new Date('2024-01-05'),
		updatedAt: new Date(),
		skills: ['IoT', 'Smart City', 'Infrastructure'],
		version: '1.0',
		supervisor: {
			name: 'Dr. Emily Tran',
			phone: '0111222333',
			email: 'emily.tran@university.edu',
		},
	},
];
