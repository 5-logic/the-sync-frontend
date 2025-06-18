import { Milestone } from '@/schemas/milestone';

const SEMESTERS = {
	FALL_2023: 'f1234567-aaaa-bbbb-cccc-111111111111',
	SPRING_2024: 's1234567-aaaa-bbbb-cccc-222222222222',
};

function createMilestone(
	name: string,
	semesterId: string,
	start: string,
	end: string,
	createdAt?: Date,
	updatedAt?: Date,
): Milestone {
	console.log(`createdAt: ${createdAt}, updatedAt: ${updatedAt}`);
	return {
		id: crypto.randomUUID(),
		name,
		semesterId,
		startDate: new Date(start),
		endDate: new Date(end),
	};
}

export const initialMilestoneData: Milestone[] = [
	createMilestone(
		'Project Proposal',
		SEMESTERS.FALL_2023,
		'2023-09-01',
		'2023-09-15',
	),
	createMilestone(
		'Literature Review',
		SEMESTERS.FALL_2023,
		'2023-09-16',
		'2023-10-15',
	),
	createMilestone(
		'Methodology',
		SEMESTERS.FALL_2023,
		'2023-10-16',
		'2023-11-15',
	),
	createMilestone(
		'Progress Report',
		SEMESTERS.SPRING_2024,
		'2024-01-15',
		'2024-02-15',
	),
	createMilestone(
		'Final Presentation',
		SEMESTERS.SPRING_2024,
		'2024-04-15',
		'2024-05-15',
	),
];
