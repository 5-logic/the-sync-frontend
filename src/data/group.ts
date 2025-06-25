import { Group } from '@/schemas/group';

export type ExtendedGroup = Group & {
	thesisTitle: string;
	supervisors: string[];
};

// Dữ liệu gốc của các group
const mockGroups: Group[] = [
	{
		id: 'g1',
		code: 'G1',
		name: 'Group 1',
		semesterId: '20251',
		thesisId: 't1',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 'g2',
		code: 'G2',
		name: 'Group 2',
		semesterId: '20242',
		thesisId: 't2',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: 'g3',
		code: 'G3',
		name: 'Group 3',
		semesterId: '20252',
		thesisId: 't3',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

// Map thêm thông tin đề tài & giảng viên tương ứng cho từng groupId
const groupMetaMap: Record<
	string,
	{ thesisTitle: string; supervisors: string[] }
> = {
	g1: {
		thesisTitle: 'AI-powered Healthcare System',
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
	},
	g2: {
		thesisTitle: 'Blockchain Supply Chain',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
	},
	g3: {
		thesisTitle: 'Smart City IoT Platform',
		supervisors: ['Dr. Emily Wong', 'Dr. Davis'],
	},
};

// Gán group vào từng đợt review (theo groupId hoặc code tuỳ bạn)
export const mockReviewGroups: Record<string, ExtendedGroup[]> = {
	Start: [],
	'Review 1': [mockGroups[0], mockGroups[1]].map((g) => ({
		...g,
		...groupMetaMap[g.id],
	})),
	'Review 2': [mockGroups[2]].map((g) => ({
		...g,
		...groupMetaMap[g.id],
	})),
	'Review 3': [mockGroups[2]].map((g) => ({
		...g,
		...groupMetaMap[g.id],
	})),
	'Final Review': [
		{
			...mockGroups[1],
			thesisTitle: 'Cybersecurity Framework',
			supervisors: [],
		},
	],
};

export default mockGroups;
