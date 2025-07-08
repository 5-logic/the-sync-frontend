import { Thesis } from '@/schemas/thesis';

export type ExtendedThesis = Thesis & {
	skills: string[];
	highlight?: string;
	version: string;
	semester?: string;
	supervisor?: {
		name: string;
		phone: string;
		email: string;
	};
	group?: {
		id: string;
		members: {
			id: string;
			name: string;
			email: string;
			isLeader?: boolean;
			avatar?: string;
		}[];
	};
	// Add thesisVersions to support download functionality
	thesisVersions?: {
		id: string;
		version: number;
		supportingDocument: string;
	}[];
};

export const mockTheses: ExtendedThesis[] = [
	{
		id: 't1',
		englishName: 'AI-Powered Smart City Infrastructure Management',
		vietnameseName:
			'Hệ thống quản lý cơ sở hạ tầng thành phố thông minh hỗ trợ AI',
		abbreviation: 'SCIM',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		domain: 'Blockchain',
		status: 'Approved',
		isPublish: true,
		groupId: 'g1',
		lecturerId: 'lect1',
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date(),
		skills: ['Statistical Analysis', 'Programming', 'Data Modeling'],
		highlight: 'High Similarity',
		version: '1.0',
		semester: 'Spring', // Added semester
		supervisor: {
			name: 'Dr. Sarah Chen',
			phone: '0123456789',
			email: 'sarah.chen@university.edu',
		},
		group: {
			id: 'g1',
			members: [
				{
					id: 's1',
					name: 'John Anderson',
					email: 'john.anderson@university.edu',
					isLeader: true,
					avatar: '/images/avatar-john.png',
				},
				{
					id: 's2',
					name: 'Sarah Wilson',
					email: 'sarah.wilson@university.edu',
					avatar: '/images/avatar-sarah.png',
				},
				{
					id: 's3',
					name: 'Michael Chen',
					email: 'michael.chen@university.edu',
					avatar: '/images/avatar-michael.png',
				},
			],
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
		semester: 'Fall', // Added semester
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
		isPublish: true,
		groupId: 'g3',
		lecturerId: 'lect3',
		createdAt: new Date('2024-01-05'),
		updatedAt: new Date(),
		skills: ['IoT', 'Smart City', 'Infrastructure'],
		version: '1.0',
		semester: 'Spring', // Added semester
		supervisor: {
			name: 'Dr. Emily Tran',
			phone: '0111222333',
			email: 'emily.tran@university.edu',
		},
	},
];

// Version control for thesis t1
export const currentVersion = {
	version: '3.0',
	fileName: 'thesis_proposal_v3.0.pdf',
	fileSize: '2.5 MB',
	uploadedAt: 'Jan 10, 2024',
};

export const previousVersions = [
	{
		version: '2.0',
		fileName: 'thesis_proposal_v2.0.pdf',
		fileSize: '2.5 MB',
		uploadedAt: 'Jan 10, 2024',
	},
];
