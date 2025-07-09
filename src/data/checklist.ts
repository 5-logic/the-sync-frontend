import { ChecklistItem } from '@/schemas/checklist';
// import { ChecklistReviewAcceptance } from '@/schemas/_enums';
import { Checklist } from '@/schemas/checklist';

// ========== MOCK CHECKLISTS THEO PHASE ==========

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

// ========== MOCK CHECKLIST ITEMS THEO PHASE/MILESTONE ==========
export const mockChecklistByPhase: Record<string, ChecklistItem[]> = {
	'Review 1': [
		{
			id: 'r1-1',
			name: 'Submit proposal document',
			description: 'Student must submit a detailed proposal.',
			isRequired: true,
			checklistId: 'c1',
			acceptance: 'Yes',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 'r1-2',
			name: 'Initial supervisor meeting',
			description: 'Student must attend the first meeting with supervisor.',
			isRequired: false,
			checklistId: 'c1',
			createdAt: new Date(),
			updatedAt: new Date(),
			acceptance: 'Yes',
		},
	],
	'Review 2': [
		{
			id: 'r2-1',
			name: 'Submit mid-term report',
			description: 'Student must submit a mid-term report with progress.',
			isRequired: true,
			checklistId: 'c2',
			createdAt: new Date(),
			updatedAt: new Date(),
			acceptance: 'Yes',
		},
	],
	'Review 3': [
		{
			id: 'r3-1',
			name: 'Submit final draft',
			description: 'Final draft of thesis must be uploaded.',
			isRequired: true,
			checklistId: 'c3',
			acceptance: 'Yes',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
	'Final Review': [
		{
			id: 'f1',
			name: 'Submit final report',
			description: 'Upload and submit the final thesis document.',
			isRequired: true,
			checklistId: 'c4',
			acceptance: 'Yes',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	],
};
