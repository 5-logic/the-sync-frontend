import { Group } from '@/schemas/group';

export type ExtendedGroup = Group & {
	thesisTitle: string;
	supervisors: string[];
	members: number;
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
};

// ===== Gốc: Dữ liệu group =====
const mockGroups: Group[] = [
	{
		id: 'g1',
		code: 'G1',
		name: 'Group A',
		semesterId: '20251',
		thesisId: 't1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 'g2',
		code: 'G2',
		name: 'Group B',
		semesterId: '20242',
		thesisId: 't2',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 'g3',
		code: 'G3',
		name: 'Group C',
		semesterId: '20252',
		thesisId: 't3',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 'g4',
		code: 'G4',
		name: 'Group D',
		semesterId: '20252',
		thesisId: 't4',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

// ===== Metadata bổ sung =====
type GroupMeta = Omit<ExtendedGroup, keyof Group>;
const metaData: Record<string, GroupMeta> = {
	g1: {
		thesisTitle: 'AI-powered Healthcare System',
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
		members: 5,
		status: 'Finalized',
	},
	g2: {
		thesisTitle: 'Blockchain Supply Chain',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		members: 5,
		status: 'Finalized',
	},
	g3: {
		thesisTitle: 'Smart City IoT Platform',
		supervisors: ['Dr. Emily Wong'],
		members: 4,
		status: 'Incomplete',
	},
	g4: {
		thesisTitle: 'Cybersecurity Framework',
		supervisors: [],
		members: 5,
		status: 'Unassigned',
	},
};

// ===== Hàm merge gọn gàng (tránh duplication) =====
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

export default mockGroups;
