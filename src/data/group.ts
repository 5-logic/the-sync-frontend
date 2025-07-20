import { Group } from '@/schemas/group';

export type ExtendedGroup = Group & {
	thesisTitle: string;
	supervisors: string[];
	members: number;
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
};

export type GroupWithPhase = ExtendedGroup & {
	phase: string;
};

export type FullMockGroup = Group & {
	title: string;
	supervisors: string[];
	members: StudentMember[];
	leader: string;
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
	phase?: string;
	submissionFile?: string;
	submissionDate?: string;
	uploadedBy?: string;
	milestoneAlert?: string;
	progress: number;
	milestones: string[];
};

// ======= Helpers =======
const now = new Date();

const createGroup = (
	id: string,
	code: string,
	name: string,
	semesterId: string,
	thesisId: string,
): Group => ({
	id,
	code,
	name,
	semesterId,
	thesisId,
	createdAt: now,
	updatedAt: now,
});

// ===== Gốc: Dữ liệu group =====
const mockGroups: Group[] = [
	createGroup('g1', 'G1', 'Group A', '2023', 't1'),
	createGroup('g2', 'G2', 'Group B', '2023', 't2'),
	createGroup('g3', 'G3', 'Group C', '2023', 't3'),
	createGroup('g4', 'G4', 'Group D', '2024', 't4'),
];

// ===== Metadata bổ sung =====
type GroupMeta = Omit<ExtendedGroup, keyof Group>;
const metaData: Record<string, GroupMeta> = {
	g1: {
		thesisTitle: 'AI-powered Healthcare System',
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
		members: 4,
		status: 'Finalized',
	},
	g2: {
		thesisTitle: 'Blockchain Supply Chain',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		members: 4,
		status: 'Finalized',
	},
	g3: {
		thesisTitle: 'Smart City IoT Platform',
		supervisors: ['Dr. Emily Wong'],
		members: 5,
		status: 'Incomplete',
	},
	g4: {
		thesisTitle: 'Cybersecurity Framework',
		supervisors: [],
		members: 5,
		status: 'Unassigned',
	},
	g5: {
		thesisTitle: 'E-commerce Platform',
		supervisors: ['Dr. Lisa Park'],
		members: 4,
		status: 'Finalized',
	},
	g6: {
		thesisTitle: 'Machine Learning Analytics',
		supervisors: ['Dr. Robert Kim'],
		members: 3,
		status: 'Incomplete',
	},
	g7: {
		thesisTitle: 'Mobile App Development',
		supervisors: ['Dr. Jennifer Lee'],
		members: 4,
		status: 'Finalized',
	},
	g8: {
		thesisTitle: 'Cloud Computing Solution',
		supervisors: ['Dr. Mark Wilson'],
		members: 5,
		status: 'Incomplete',
	},
	g9: {
		thesisTitle: 'Data Science Project',
		supervisors: ['Dr. Anna Smith'],
		members: 3,
		status: 'Finalized',
	},
	g10: {
		thesisTitle: 'IoT Smart Home',
		supervisors: ['Dr. Tom Brown'],
		members: 4,
		status: 'Incomplete',
	},
};

// ===== Student data type =====
export type StudentMember = {
	id: string;
	name: string;
	major: 'Software Engineering' | 'Artificial Intelligence';
	isLeader?: boolean;
	defenseStatus?: 'Pass' | 'Not Pass';
};

// ===== Mock member data for FullMockGroup =====
type FullGroupMeta = {
	title: string;
	supervisors: string[];
	members: StudentMember[];
	leader: string;
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
	milestoneAlert?: string;
	progress: number;
	milestones: string[];
};

const fullGroupMetaData: Record<string, FullGroupMeta> = {
	g1: {
		title: 'AI-powered Healthcare System',
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
		members: [
			{
				id: 'ST001',
				name: 'John Doe',
				major: 'Software Engineering',
				isLeader: true,
				defenseStatus: 'Pass',
			},
			{
				id: 'ST002',
				name: 'Alice Wang',
				major: 'Artificial Intelligence',
				defenseStatus: 'Pass',
			},
			{
				id: 'ST003',
				name: 'Bob Chen',
				major: 'Software Engineering',
				defenseStatus: 'Not Pass',
			},
			{
				id: 'ST004',
				name: 'Emily Zhang',
				major: 'Artificial Intelligence',
				defenseStatus: 'Pass',
			},
		],
		leader: 'John Doe',
		status: 'Finalized',
		milestoneAlert: 'All milestones completed on time',
		progress: 95,
		milestones: [
			'Review 1 - Completed on Dec 15, 2023',
			'Review 2 - Completed on Dec 30, 2023',
			'Reivew 3 - In Progress - Due Feb 1, 2024',
			'Final review - Pending',
		],
	},
	g2: {
		title: 'Blockchain Supply Chain',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		members: [
			{
				id: 'ST005',
				name: 'Jane Smith',
				major: 'Software Engineering',
				defenseStatus: 'Pass',
			},
			{
				id: 'ST006',
				name: 'David Kim',
				major: 'Artificial Intelligence',
				defenseStatus: 'Not Pass',
			},
			{
				id: 'ST007',
				name: 'Lisa Park',
				major: 'Software Engineering',
				isLeader: true,
				defenseStatus: 'Pass',
			},
			{
				id: 'ST008',
				name: 'Tom Wilson',
				major: 'Software Engineering',
				defenseStatus: 'Pass',
			},
		],
		leader: 'Lisa Park',
		status: 'Finalized',
		milestoneAlert: 'Minor delay in final documentation',
		progress: 85,
		milestones: [
			'Proposal Submitted - Completed',
			'Architecture Design - Completed',
			'Smart Contract Development - In Progress',
			'Integration Testing - Pending',
		],
	},
	g3: {
		title: 'Smart City IoT Platform',
		supervisors: ['Dr. Emily Wong'],
		members: [
			{
				id: 'ST009',
				name: 'Mike Johnson',
				major: 'Software Engineering',
				isLeader: true,
				defenseStatus: 'Not Pass',
			},
			{
				id: 'ST010',
				name: 'Sarah Lee',
				major: 'Artificial Intelligence',
				defenseStatus: 'Pass',
			},
			{
				id: 'ST011',
				name: 'Chris Brown',
				major: 'Software Engineering',
				defenseStatus: 'Pass',
			},
			{
				id: 'ST012',
				name: 'Amy Liu',
				major: 'Artificial Intelligence',
				defenseStatus: 'Not Pass',
			},
			{
				id: 'ST013',
				name: 'Kevin Chen',
				major: 'Artificial Intelligence',
				defenseStatus: 'Pass',
			},
		],
		leader: 'Mike Johnson',
		status: 'Incomplete',
		milestoneAlert: 'Behind schedule - requires attention',
		progress: 60,
		milestones: [
			'Proposal Submitted - Completed',
			'System Design - Completed',
			'Prototype Development - In Progress',
			'Performance Testing - Pending',
			'Final Integration - Pending',
		],
	},
	g4: {
		title: 'Cybersecurity Framework',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		members: [
			{
				id: 'ST014',
				name: 'Sarah Wilson',
				major: 'Software Engineering',
				isLeader: true,
				defenseStatus: 'Pass',
			},
			{
				id: 'ST015',
				name: 'Mark Davis',
				major: 'Software Engineering',
				defenseStatus: 'Pass',
			},
			{
				id: 'ST016',
				name: 'Linda Garcia',
				major: 'Artificial Intelligence',
				defenseStatus: 'Not Pass',
			},
			{
				id: 'ST017',
				name: 'Jason Taylor',
				major: 'Artificial Intelligence',
				defenseStatus: 'Pass',
			},
			{
				id: 'ST018',
				name: 'Maria Rodriguez',
				major: 'Software Engineering',
				defenseStatus: 'Not Pass',
			},
		],
		leader: 'Sarah Wilson',
		status: 'Unassigned',
		milestoneAlert: 'Awaiting supervisor assignment',
		progress: 30,
		milestones: [
			'Initial Research - Completed',
			'Requirement Analysis - In Progress',
			'Framework Design - Pending',
			'Implementation - Pending',
			'Security Testing - Pending',
		],
	},
};

// ===== Merge group + metadata =====
export const extendedGroups: ExtendedGroup[] = mockGroups.map((group) => ({
	...group,
	...(metaData[group.id] ?? {
		thesisTitle: 'Untitled Thesis',
		supervisors: [],
		members: 0,
		status: 'Unassigned',
	}),
}));

// ===== Mock submission data for FullMockGroup =====
type SubmissionMeta = {
	submissionFile?: string;
	submissionDate?: string;
	uploadedBy?: string;
};

const submissionMetaData: Record<string, SubmissionMeta> = {
	g1: {
		submissionFile: 'AI_Healthcare_Proposal.pdf',
		submissionDate: '2025-06-15',
		uploadedBy: 'John Doe',
	},
	g2: {
		submissionFile: 'Blockchain_Analysis.pdf',
		submissionDate: '2025-06-20',
		uploadedBy: 'Jane Smith',
	},
	g3: {
		submissionFile: 'IoT_Platform_Design.pdf',
		submissionDate: '2025-06-25',
		uploadedBy: 'Mike Johnson',
	},
	g4: {
		submissionFile: 'Security_Framework.pdf',
		submissionDate: '2025-06-28',
		uploadedBy: 'Sarah Wilson',
	},
};

// ===== Helper function to create FullMockGroup =====
export const createFullMockGroup = (
	groupId: string,
	phase: string,
): FullMockGroup => {
	const baseGroup = mockGroups.find((g) => g.id === groupId);
	const fullMeta = fullGroupMetaData[groupId];
	const submissionMeta = submissionMetaData[groupId];

	if (!baseGroup || !fullMeta) {
		throw new Error(`Group with id ${groupId} not found`);
	}

	return {
		...baseGroup,
		title: fullMeta.title,
		supervisors: fullMeta.supervisors,
		members: fullMeta.members,
		leader: fullMeta.leader,
		status: fullMeta.status,
		phase,
		submissionFile: submissionMeta?.submissionFile,
		submissionDate: submissionMeta?.submissionDate,
		uploadedBy: submissionMeta?.uploadedBy,
		milestoneAlert: fullMeta.milestoneAlert,
		progress: fullMeta.progress,
		milestones: fullMeta.milestones,
	};
};

// ===== Dữ liệu chia theo đợt review =====
export const mockReviewGroups: Record<string, FullMockGroup[]> = {
	'Review 1': [
		createFullMockGroup('g1', 'Review 1'),
		createFullMockGroup('g2', 'Review 1'),
	],
	'Review 2': [createFullMockGroup('g3', 'Review 2')],
	'Review 3': [],
	'Final Review': [createFullMockGroup('g4', 'Final Review')],
};

// Gom tất cả nhóm thành 1 danh sách kèm phase
export const allMockGroups: FullMockGroup[] = Object.values(
	mockReviewGroups,
).flatMap((groups) => groups);

export default mockGroups;
