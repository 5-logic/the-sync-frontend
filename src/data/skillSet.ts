import { SkillSet } from '@/schemas/skill';

// Helper function to create skill object
const createSkill = (
	id: string,
	name: string,
	skillSetId: string,
	createdAt: Date = new Date('2024-01-01T00:00:00Z'),
	updatedAt: Date = new Date('2024-06-01T00:00:00Z'),
) => ({
	id,
	name,
	skillSetId,
	createdAt,
	updatedAt,
});

// Helper function to create skillset object
const createSkillSet = (
	id: string,
	name: string,
	skillsData: Array<{ id: string; name: string }>,
	createdAt: Date = new Date('2024-01-01T00:00:00Z'),
	updatedAt: Date = new Date('2024-06-01T00:00:00Z'),
): SkillSet => ({
	id,
	name,
	createdAt,
	updatedAt,
	skills: skillsData.map((skill) =>
		createSkill(skill.id, skill.name, id, createdAt, updatedAt),
	),
});

// Skill data definitions
const frontendSkillsData = [
	{ id: 'fe001111-1111-1111-1111-111111111111', name: 'React' },
	{ id: 'fe002222-2222-2222-2222-222222222222', name: 'Vue.js' },
	{ id: 'fe003333-3333-3333-3333-333333333333', name: 'Angular' },
	{ id: 'fe004444-4444-4444-4444-444444444444', name: 'TypeScript' },
];

const backendSkillsData = [
	{ id: 'be001111-1111-1111-1111-111111111111', name: 'Node.js' },
	{ id: 'be002222-2222-2222-2222-222222222222', name: 'Python' },
	{ id: 'be003333-3333-3333-3333-333333333333', name: 'Java' },
	{ id: 'be004444-4444-4444-4444-444444444444', name: 'Spring Boot' },
];

// Generate mock skillsets using helper functions
const mockSkillSets: SkillSet[] = [
	createSkillSet(
		'11111111-1111-1111-1111-111111111111',
		'Frontend',
		frontendSkillsData,
	),
	createSkillSet(
		'22222222-2222-2222-2222-222222222222',
		'Backend',
		backendSkillsData,
	),
];

export default mockSkillSets;
