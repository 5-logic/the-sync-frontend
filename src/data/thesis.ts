import { Thesis } from '@/schemas/thesis';

export type ExtendedThesis = Thesis & {
	skills: string[];
	highlight?: string;
	version: string;
	semester?: string; // Add this line
	supervisor?: {
		name: string;
		phone: string;
		email: string;
	};
	rejectReasons: string[];
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
		rejectReasons: [],
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
		rejectReasons: [],
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
		semester: 'Spring', // Added semester
		supervisor: {
			name: 'Dr. Emily Tran',
			phone: '0111222333',
			email: 'emily.tran@university.edu',
		},
		rejectReasons: [
			"Topic is not aligned with the student's or group's major.",
			'Incomplete or insufficient topic description.',
		],
	},
	{
		id: 't4',
		englishName: 'Cybersecurity Framework',
		vietnameseName: 'Khung bảo mật mạng',
		abbreviation: 'CYBSEC',
		description: 'Advanced cybersecurity framework for enterprise systems.',
		domain: 'Cybersecurity',
		status: 'Approved',
		isPublish: true,
		groupId: 'g4',
		lecturerId: 'lect4',
		createdAt: new Date('2024-01-12'),
		updatedAt: new Date(),
		skills: ['Cybersecurity', 'Network Security'],
		version: '1.0',
		semester: 'Spring',
		supervisor: {
			name: 'Dr. David Kim',
			phone: '0222333444',
			email: 'david.kim@university.edu',
		},
		rejectReasons: [],
	},
	{
		id: 't5',
		englishName: 'E-commerce Platform',
		vietnameseName: 'Nền tảng thương mại điện tử',
		abbreviation: 'ECOMM',
		description: 'Modern e-commerce platform with AI recommendations.',
		domain: 'Web Development',
		status: 'Approved',
		isPublish: true,
		groupId: 'g5',
		lecturerId: 'lect5',
		createdAt: new Date('2024-01-15'),
		updatedAt: new Date(),
		skills: ['Web Development', 'AI', 'Database'],
		version: '1.0',
		semester: 'Fall',
		supervisor: {
			name: 'Dr. Lisa Park',
			phone: '0333444555',
			email: 'lisa.park@university.edu',
		},
		rejectReasons: [],
	},
	{
		id: 't6',
		englishName: 'Machine Learning Analytics',
		vietnameseName: 'Phân tích dữ liệu học máy',
		abbreviation: 'MLAN',
		description:
			'Advanced machine learning analytics for business intelligence.',
		domain: 'Data Science',
		status: 'Pending',
		isPublish: true,
		groupId: 'g6',
		lecturerId: 'lect6',
		createdAt: new Date('2024-01-18'),
		updatedAt: new Date(),
		skills: ['Machine Learning', 'Data Analytics', 'Python'],
		version: '1.0',
		semester: 'Spring',
		supervisor: {
			name: 'Dr. Robert Kim',
			phone: '0444555666',
			email: 'robert.kim@university.edu',
		},
		rejectReasons: [],
	},
	{
		id: 't7',
		englishName: 'Mobile App Development',
		vietnameseName: 'Phát triển ứng dụng di động',
		abbreviation: 'MOBDEV',
		description: 'Cross-platform mobile application development framework.',
		domain: 'Mobile Development',
		status: 'Approved',
		isPublish: true,
		groupId: 'g7',
		lecturerId: 'lect7',
		createdAt: new Date('2024-01-20'),
		updatedAt: new Date(),
		skills: ['React Native', 'Mobile Development', 'JavaScript'],
		version: '1.0',
		semester: 'Fall',
		supervisor: {
			name: 'Dr. Jennifer Lee',
			phone: '0555666777',
			email: 'jennifer.lee@university.edu',
		},
		rejectReasons: [],
	},
	{
		id: 't8',
		englishName: 'Cloud Computing Solution',
		vietnameseName: 'Giải pháp điện toán đám mây',
		abbreviation: 'CLOUD',
		description: 'Scalable cloud computing infrastructure solution.',
		domain: 'Cloud Computing',
		status: 'Pending',
		isPublish: true,
		groupId: 'g8',
		lecturerId: 'lect8',
		createdAt: new Date('2024-01-22'),
		updatedAt: new Date(),
		skills: ['AWS', 'Cloud Architecture', 'DevOps'],
		version: '1.0',
		semester: 'Spring',
		supervisor: {
			name: 'Dr. Mark Wilson',
			phone: '0666777888',
			email: 'mark.wilson@university.edu',
		},
		rejectReasons: [],
	},
	{
		id: 't9',
		englishName: 'Data Science Project',
		vietnameseName: 'Dự án khoa học dữ liệu',
		abbreviation: 'DATASCI',
		description:
			'Comprehensive data science project with predictive analytics.',
		domain: 'Data Science',
		status: 'Approved',
		isPublish: true,
		groupId: 'g9',
		lecturerId: 'lect9',
		createdAt: new Date('2024-01-25'),
		updatedAt: new Date(),
		skills: ['Python', 'R', 'Statistical Analysis'],
		version: '1.0',
		semester: 'Fall',
		supervisor: {
			name: 'Dr. Anna Smith',
			phone: '0777888999',
			email: 'anna.smith@university.edu',
		},
		rejectReasons: [],
	},
	{
		id: 't10',
		englishName: 'IoT Smart Home',
		vietnameseName: 'Nhà thông minh IoT',
		abbreviation: 'SMARTHOME',
		description: 'Internet of Things solution for smart home automation.',
		domain: 'Internet of Things',
		status: 'Pending',
		isPublish: true,
		groupId: 'g10',
		lecturerId: 'lect10',
		createdAt: new Date('2024-01-28'),
		updatedAt: new Date(),
		skills: ['IoT', 'Arduino', 'Home Automation'],
		version: '1.0',
		semester: 'Spring',
		supervisor: {
			name: 'Dr. Tom Brown',
			phone: '0888999000',
			email: 'tom.brown@university.edu',
		},
		rejectReasons: [],
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
