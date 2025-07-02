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
	members: string[]; // Array of member names
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
	createGroup('g1', 'G1', 'Group A', '20251', 't1'),
	createGroup('g2', 'G2', 'Group B', '20242', 't2'),
	createGroup('g3', 'G3', 'Group C', '20252', 't3'),
	createGroup('g4', 'G4', 'Group D', '20252', 't4'),
	createGroup('g5', 'G5', 'Group E', '20252', 't5'),
	createGroup('g6', 'G6', 'Group F', '20252', 't6'),
	createGroup('g7', 'G7', 'Group G', '20252', 't7'),
	createGroup('g8', 'G8', 'Group H', '20252', 't8'),
	createGroup('g9', 'G9', 'Group I', '20252', 't9'),
	createGroup('g10', 'G10', 'Group J', '20252', 't10'),
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

// ===== Mock member data for FullMockGroup =====
type FullGroupMeta = {
	title: string;
	supervisors: string[];
	members: string[]; // Array of member names
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
	milestoneAlert?: string;
	progress: number;
	milestones: string[];
};

const fullGroupMetaData: Record<string, FullGroupMeta> = {
	g1: {
		title: 'AI-powered Healthcare System',
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
		members: ['John Doe', 'Alice Wang', 'Bob Chen', 'Emily Zhang'],
		status: 'Finalized',
		milestoneAlert: 'All milestones completed on time',
		progress: 95,
		milestones: [
			'Proposal Submitted - Completed',
			'Literature Review - Completed',
			'Implementation - In Progress',
			'Testing Phase - Pending',
		],
	},
	g2: {
		title: 'Blockchain Supply Chain',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		members: ['Jane Smith', 'David Kim', 'Lisa Park', 'Tom Wilson'],
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
			'Mike Johnson',
			'Sarah Lee',
			'Chris Brown',
			'Amy Liu',
			'Kevin Chen',
		],
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
		supervisors: [],
		members: [
			'Sarah Wilson',
			'Mark Davis',
			'Linda Garcia',
			'Jason Taylor',
			'Maria Rodriguez',
		],
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
	Start: [],
	'Review 1': [
		createFullMockGroup('g1', 'Review 1'),
		createFullMockGroup('g2', 'Review 1'),
	],
	'Review 2': [createFullMockGroup('g3', 'Review 2')],
	'Review 3': [createFullMockGroup('g3', 'Review 3')],
	'Final Review': [createFullMockGroup('g4', 'Final Review')],
};

// Gom tất cả nhóm thành 1 danh sách kèm phase
export const allMockGroups: FullMockGroup[] = Object.values(
	mockReviewGroups,
).flatMap((groups) => groups);

export default mockGroups;
