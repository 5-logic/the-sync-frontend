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

// Common constants to reduce duplication
const COMMON_VERSION = '1.0';
const COMMON_PUBLISH_STATUS = true;
const CURRENT_DATE = new Date();

// Common supervisor objects
const SUPERVISORS = {
	SARAH_CHEN: {
		name: 'Dr. Sarah Chen',
		phone: '0123456789',
		email: 'sarah.chen@university.edu',
	},
	ALEX_NGUYEN: {
		name: 'Dr. Alex Nguyen',
		phone: '0987654321',
		email: 'alex.nguyen@university.edu',
	},
	EMILY_TRAN: {
		name: 'Dr. Emily Tran',
		phone: '0111222333',
		email: 'emily.tran@university.edu',
	},
	DAVID_KIM: {
		name: 'Dr. David Kim',
		phone: '0222333444',
		email: 'david.kim@university.edu',
	},
	LISA_PARK: {
		name: 'Dr. Lisa Park',
		phone: '0333444555',
		email: 'lisa.park@university.edu',
	},
	ROBERT_KIM: {
		name: 'Dr. Robert Kim',
		phone: '0444555666',
		email: 'robert.kim@university.edu',
	},
	JENNIFER_LEE: {
		name: 'Dr. Jennifer Lee',
		phone: '0555666777',
		email: 'jennifer.lee@university.edu',
	},
	MARK_WILSON: {
		name: 'Dr. Mark Wilson',
		phone: '0666777888',
		email: 'mark.wilson@university.edu',
	},
	ANNA_SMITH: {
		name: 'Dr. Anna Smith',
		phone: '0777888999',
		email: 'anna.smith@university.edu',
	},
	TOM_BROWN: {
		name: 'Dr. Tom Brown',
		phone: '0888999000',
		email: 'tom.brown@university.edu',
	},
} as const;

// Common group members
const GROUP_MEMBERS = {
	JOHN_ANDERSON: {
		id: 's1',
		name: 'John Anderson',
		email: 'john.anderson@university.edu',
		isLeader: true,
		avatar: '/images/avatar-john.png',
	},
	SARAH_WILSON: {
		id: 's2',
		name: 'Sarah Wilson',
		email: 'sarah.wilson@university.edu',
		avatar: '/images/avatar-sarah.png',
	},
	MICHAEL_CHEN: {
		id: 's3',
		name: 'Michael Chen',
		email: 'michael.chen@university.edu',
		avatar: '/images/avatar-michael.png',
	},
} as const;

// Common reject reasons
const REJECT_REASONS = {
	MISALIGNED_MAJOR: "Topic is not aligned with the student's or group's major.",
	INSUFFICIENT_DESCRIPTION: 'Incomplete or insufficient topic description.',
} as const;

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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g1',
		lecturerId: 'lect1',
		createdAt: new Date('2024-01-10'),
		updatedAt: CURRENT_DATE,
		skills: ['Statistical Analysis', 'Programming', 'Data Modeling'],
		highlight: 'High Similarity',
		version: COMMON_VERSION,
		semester: 'Spring', // Added semester
		supervisor: SUPERVISORS.SARAH_CHEN,
		rejectReasons: [],
		group: {
			id: 'g1',
			members: [
				{ ...GROUP_MEMBERS.JOHN_ANDERSON },
				{ ...GROUP_MEMBERS.SARAH_WILSON },
				{ ...GROUP_MEMBERS.MICHAEL_CHEN },
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g2',
		lecturerId: 'lect2',
		createdAt: new Date('2024-01-08'),
		updatedAt: CURRENT_DATE,
		skills: ['Blockchain', 'Logistics'],
		version: COMMON_VERSION,
		semester: 'Fall', // Added semester
		supervisor: SUPERVISORS.ALEX_NGUYEN,
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
		updatedAt: CURRENT_DATE,
		skills: ['IoT', 'Smart City', 'Infrastructure'],
		version: COMMON_VERSION,
		semester: 'Spring', // Added semester
		supervisor: SUPERVISORS.EMILY_TRAN,
		rejectReasons: [
			REJECT_REASONS.MISALIGNED_MAJOR,
			REJECT_REASONS.INSUFFICIENT_DESCRIPTION,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g4',
		lecturerId: 'lect4',
		createdAt: new Date('2024-01-12'),
		updatedAt: CURRENT_DATE,
		skills: ['Cybersecurity', 'Network Security'],
		version: COMMON_VERSION,
		semester: 'Spring',
		supervisor: SUPERVISORS.DAVID_KIM,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g5',
		lecturerId: 'lect5',
		createdAt: new Date('2024-01-15'),
		updatedAt: CURRENT_DATE,
		skills: ['Web Development', 'AI', 'Database'],
		version: COMMON_VERSION,
		semester: 'Fall',
		supervisor: SUPERVISORS.LISA_PARK,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g6',
		lecturerId: 'lect6',
		createdAt: new Date('2024-01-18'),
		updatedAt: CURRENT_DATE,
		skills: ['Machine Learning', 'Data Analytics', 'Python'],
		version: COMMON_VERSION,
		semester: 'Spring',
		supervisor: SUPERVISORS.ROBERT_KIM,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g7',
		lecturerId: 'lect7',
		createdAt: new Date('2024-01-20'),
		updatedAt: CURRENT_DATE,
		skills: ['React Native', 'Mobile Development', 'JavaScript'],
		version: COMMON_VERSION,
		semester: 'Fall',
		supervisor: SUPERVISORS.JENNIFER_LEE,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g8',
		lecturerId: 'lect8',
		createdAt: new Date('2024-01-22'),
		updatedAt: CURRENT_DATE,
		skills: ['AWS', 'Cloud Architecture', 'DevOps'],
		version: COMMON_VERSION,
		semester: 'Spring',
		supervisor: SUPERVISORS.MARK_WILSON,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g9',
		lecturerId: 'lect9',
		createdAt: new Date('2024-01-25'),
		updatedAt: CURRENT_DATE,
		skills: ['Python', 'R', 'Statistical Analysis'],
		version: COMMON_VERSION,
		semester: 'Fall',
		supervisor: SUPERVISORS.ANNA_SMITH,
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
		isPublish: COMMON_PUBLISH_STATUS,
		groupId: 'g10',
		lecturerId: 'lect10',
		createdAt: new Date('2024-01-28'),
		updatedAt: CURRENT_DATE,
		skills: ['IoT', 'Arduino', 'Home Automation'],
		version: COMMON_VERSION,
		semester: 'Spring',
		supervisor: SUPERVISORS.TOM_BROWN,
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
