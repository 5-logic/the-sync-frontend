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
	members: string[];
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
	phase?: string;
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

// ===== Dữ liệu chia theo đợt review =====
export const mockReviewGroups: Record<string, ExtendedGroup[]> = {
	Start: [],
	'Review 1': [extendedGroups[0], extendedGroups[1]],
	'Review 2': [extendedGroups[2]],
	'Review 3': [extendedGroups[2]],
	'Final Review': [extendedGroups[3]],
};

// Gom tất cả nhóm thành 1 danh sách kèm phase
export const allMockGroups: GroupWithPhase[] = Object.entries(
	mockReviewGroups,
).flatMap(([phase, groups]) =>
	groups.map((group) => ({
		...group,
		phase,
	})),
);

export default mockGroups;
