import { Group } from '@/schemas/group';

export type ExtendedGroup = Group & {
	thesisTitle: string;
	supervisors: string[];
	members?: { id: string; name: string }[];
};

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

const groupMetaMap: Record<
	string,
	{
		thesisTitle: string;
		supervisors: string[];
		members: { id: string; name: string }[];
	}
> = {
	g1: {
		thesisTitle: 'AI-powered Healthcare System',
		supervisors: ['Dr. Sarah Johnson', 'Dr. Davis'],
		members: [
			{ id: 's1', name: 'Alice Nguyen' },
			{ id: 's2', name: 'Bob Tran' },
			{ id: 's3', name: 'Charlie Le' },
		],
	},
	g2: {
		thesisTitle: 'Blockchain Supply Chain',
		supervisors: ['Dr. Michael Chen', 'Dr. Martinez'],
		members: [
			{ id: 's4', name: 'David Pham' },
			{ id: 's5', name: 'Emma Do' },
			{ id: 's6', name: 'Fiona Bui' },
		],
	},
	g3: {
		thesisTitle: 'Smart City IoT Platform',
		supervisors: ['Dr. Emily Wong', 'Dr. Davis'],
		members: [
			{ id: 's7', name: 'George Ho' },
			{ id: 's8', name: 'Helen Vo' },
			{ id: 's9', name: 'Fiona Bui' },
		],
	},
};

export type FullMockGroup = ExtendedGroup & {
	title: string;
	supervisor: string;
	coSupervisor: string;
	submissionFile: string;
	submissionDate: string;
	uploadedBy: string;
	progress: number;
	milestones: string[];
	milestoneAlert: string;
};

export type GroupWithPhase = FullMockGroup & {
	phase: string;
};

export const mockReviewGroups: Record<string, FullMockGroup[]> = {
	Start: [],
	'Review 1': [mockGroups[0], mockGroups[1]].map((g, idx) => {
		const meta = groupMetaMap[g.id];
		return {
			...g,
			thesisTitle: meta.thesisTitle,
			supervisors: meta.supervisors,
			members: meta.members,
			title: meta.thesisTitle,
			supervisor: meta.supervisors[0] ?? '',
			coSupervisor: meta.supervisors[1] ?? '',
			submissionFile: 'review1_report.pdf',
			submissionDate: '2023-12-10',
			uploadedBy: 'Admin',
			progress: 40 + idx * 10,
			milestones: [
				'Review 1 - Completed on Dec 15, 2023',
				'Review 2 - In Progress - Feb 1, 2024',
				'Review 3 - Upcoming - Mar 15, 2024',
				'Final Report - Upcoming - Nov 15, 2024',
			],
			milestoneAlert: `Milestone 2 submission due in ${5 - idx} days`,
		};
	}),
	'Review 2': [mockGroups[2]].map((g, idx) => {
		const meta = groupMetaMap[g.id];
		return {
			...g,
			thesisTitle: meta.thesisTitle,
			supervisors: meta.supervisors,
			members: meta.members,
			title: meta.thesisTitle,
			supervisor: meta.supervisors[0] ?? '',
			coSupervisor: meta.supervisors[1] ?? '',
			submissionFile: 'review2_draft.pdf',
			submissionDate: '2024-02-15',
			uploadedBy: 'System',
			progress: 60,
			milestones: [
				'Review 1 - Completed on Jan 15, 2024',
				'Review 2 - In Progress - Feb 15, 2024',
				'Review 3 - Upcoming - Apr 10, 2024',
				'Final Report - Upcoming - Dec 1, 2024',
			],
			milestoneAlert: `Milestone 2 submission due in ${3 - idx} days`,
		};
	}),
	'Review 3': [mockGroups[2]].map((g) => {
		const meta = groupMetaMap[g.id];
		return {
			...g,
			thesisTitle: meta.thesisTitle,
			supervisors: meta.supervisors,
			members: meta.members,
			title: meta.thesisTitle,
			supervisor: meta.supervisors[0] ?? '',
			coSupervisor: meta.supervisors[1] ?? '',
			submissionFile: 'review3_final.pdf',
			submissionDate: '2024-04-10',
			uploadedBy: 'Linh Nguyen',
			progress: 75,
			milestones: [
				'Review 1 - Completed',
				'Review 2 - Completed',
				'Review 3 - In Progress - Apr 10, 2024',
				'Final Report - Upcoming - Dec 1, 2024',
			],
			milestoneAlert: 'Final Review submission due in 7 days',
		};
	}),
	'Final Review': [
		{
			...mockGroups[1],
			thesisTitle: 'Cybersecurity Framework',
			supervisors: groupMetaMap['g2'].supervisors,
			members: groupMetaMap['g2'].members,
			title: 'Cybersecurity Framework',
			supervisor: 'N/A',
			coSupervisor: 'N/A',
			submissionFile: 'final_report.pdf',
			submissionDate: '2024-11-25',
			uploadedBy: 'Group Leader',
			progress: 100,
			milestones: [
				'Review 1 - Completed',
				'Review 2 - Completed',
				'Review 3 - Completed',
				'Final Report - Submitted',
			],
			milestoneAlert: 'Final review completed',
		},
	],
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
