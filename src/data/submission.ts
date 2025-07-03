export type Submission = {
	id: string;
	groupId: string;
	milestone: string;
};

export const mockSubmissions: Submission[] = [
	{ id: 's1', groupId: 'g1', milestone: 'Review 1' },
	{ id: 's2', groupId: 'g2', milestone: 'Review 1' },
	{ id: 's3', groupId: 'g3', milestone: 'Review 2' },
	{ id: 's4', groupId: 'g4', milestone: 'Final Review' },
];
