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
	createdAt?: string,
	updatedAt?: string,
	checklistId?: string | null,
): Milestone {
	return {
		id: crypto.randomUUID(),
		name,
		semesterId,
		startDate: new Date(start),
		endDate: new Date(end),
		checklistId: checklistId ?? null,
		createdAt: createdAt ? new Date(createdAt) : new Date(),
		updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
	};
}

export const initialMilestoneData: Milestone[] = [
	createMilestone(
		'Project Proposal',
		SEMESTERS.FALL_2023,
		'2023-09-01',
		'2023-09-15',
		'2023-08-01T10:00:00Z',
		'2023-08-01T10:00:00Z',
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
