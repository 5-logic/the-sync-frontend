import { Group } from '@/schemas/group';

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

export default mockGroups;
