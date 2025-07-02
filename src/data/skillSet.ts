import { SkillSet } from '@/schemas/skill';

const mockSkillSets: SkillSet[] = [
	{
		id: '11111111-1111-1111-1111-111111111111',
		name: 'Frontend',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: new Date('2024-06-01T00:00:00Z'),
		skills: [
			{
				id: 'fe001111-1111-1111-1111-111111111111',
				name: 'React',
				skillSetId: '11111111-1111-1111-1111-111111111111',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
			{
				id: 'fe002222-2222-2222-2222-222222222222',
				name: 'Vue.js',
				skillSetId: '11111111-1111-1111-1111-111111111111',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
			{
				id: 'fe003333-3333-3333-3333-333333333333',
				name: 'Angular',
				skillSetId: '11111111-1111-1111-1111-111111111111',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
			{
				id: 'fe004444-4444-4444-4444-444444444444',
				name: 'TypeScript',
				skillSetId: '11111111-1111-1111-1111-111111111111',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
		],
	},
	{
		id: '22222222-2222-2222-2222-222222222222',
		name: 'Backend',
		createdAt: new Date('2024-01-01T00:00:00Z'),
		updatedAt: new Date('2024-06-01T00:00:00Z'),
		skills: [
			{
				id: 'be001111-1111-1111-1111-111111111111',
				name: 'Node.js',
				skillSetId: '22222222-2222-2222-2222-222222222222',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
			{
				id: 'be002222-2222-2222-2222-222222222222',
				name: 'Python',
				skillSetId: '22222222-2222-2222-2222-222222222222',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
			{
				id: 'be003333-3333-3333-3333-333333333333',
				name: 'Java',
				skillSetId: '22222222-2222-2222-2222-222222222222',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
			{
				id: 'be004444-4444-4444-4444-444444444444',
				name: 'Spring Boot',
				skillSetId: '22222222-2222-2222-2222-222222222222',
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-06-01T00:00:00Z'),
			},
		],
	},
];

export default mockSkillSets;
