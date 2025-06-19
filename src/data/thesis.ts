import { Thesis } from '@/schemas/thesis';

const mockTheses: Thesis[] = [
	{
		id: 't1',
		englishName: 'AI for Healthcare Analysis',
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
	},
	{
		id: 't2',
		englishName: 'Blockchain Supply Chain',
		vietnameseName: 'Chuỗi cung ứng Blockchain',
		abbreviation: 'BLSC',
		description: 'Blockchain for supply chain transparency.',
		domain: 'Blockchain',
		status: 'Approved',
		isPublish: true,
		groupId: 'g2',
		lecturerId: 'lect2',
		createdAt: new Date('2024-01-08'),
		updatedAt: new Date(),
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
	},
];

export default mockTheses;
