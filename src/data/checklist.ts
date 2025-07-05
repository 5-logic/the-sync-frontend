import { Checklist } from '@/schemas/checklist';

const createChecklist = (
	id: string,
	name: string,
	description: string,
	semester: string,
	milestone: string,
	createdAt: string,
): Checklist & { semester: string; milestone: string } => ({
	id,
	name,
	description,
	semester,
	milestone,
	createdAt: new Date(createdAt),
	updatedAt: new Date('2024-07-01'),
});

export const mockChecklists: (Checklist & {
	semester: string;
	milestone: string;
})[] = [
	createChecklist(
		'c1',
		'Phase 1 Review Checklist',
		'Checklist for phase 1 of the thesis process',
		'2024',
		'Review 1',
		'2024-06-01',
	),
	createChecklist(
		'c2',
		'Phase 2 Review Checklist',
		'Checklist for phase 2 of the thesis process',
		'2024',
		'Review 2',
		'2024-06-03',
	),
	createChecklist(
		'c3',
		'Phase 3 Review Checklist',
		'Checklist for phase 3 of the thesis process',
		'2024',
		'Review 3',
		'2024-06-05',
	),
	createChecklist(
		'c4',
		'Final Submission Checklist',
		'Checklist before submitting the final thesis',
		'2024',
		'Final Review',
		'2024-06-07',
	),

	// Checklist for another semester
	createChecklist(
		'c5',
		'Phase 1 Review Checklist - SP2023',
		'Checklist for phase 1 of thesis in semester 2023',
		'2023',
		'Review 1',
		'2023-06-01',
	),
	createChecklist(
		'c6',
		'Final Review Checklist - SP2023',
		'Checklist for final thesis submission in 2023',
		'2023',
		'Final Review',
		'2023-06-10',
	),
];
