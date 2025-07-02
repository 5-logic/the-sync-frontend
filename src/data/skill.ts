import { Skill } from '@/schemas/skill';

function createSkill(
	id: string,
	name: string,
	skillSetId: string,
	createdAt = '2024-01-01T00:00:00Z',
	updatedAt = '2024-06-01T00:00:00Z',
): Skill {
	return {
		id,
		name,
		skillSetId,
		createdAt: new Date(createdAt),
		updatedAt: new Date(updatedAt),
	};
}

const mockSkills: Skill[] = [
	createSkill(
		'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
		'HTML5',
		'11111111-1111-1111-1111-111111111111',
	),
	createSkill(
		'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
		'CSS3',
		'11111111-1111-1111-1111-111111111111',
	),
	createSkill(
		'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
		'React',
		'11111111-1111-1111-1111-111111111111',
	),
	createSkill(
		'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
		'Node.js',
		'22222222-2222-2222-2222-222222222222',
	),
	createSkill(
		'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
		'Express',
		'22222222-2222-2222-2222-222222222222',
	),
	createSkill(
		'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
		'MongoDB',
		'22222222-2222-2222-2222-222222222222',
	),
];

export default mockSkills;
