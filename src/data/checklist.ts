import { ChecklistReviewAcceptance } from '@/schemas/_enums';
import { ChecklistItem } from '@/schemas/checklist';

const now = new Date();

const createChecklistItem = (
	id: string,
	name: string,
	acceptance: ChecklistReviewAcceptance,
	isRequired: boolean,
	checklistId: string,
): ChecklistItem => ({
	id,
	name,
	acceptance,
	description: null,
	isRequired,
	checklistId,
	createdAt: now,
	updatedAt: now,
});

const checklistPhase1: ChecklistItem[] = [
	createChecklistItem(
		'p1-item-1',
		'Submit the initial thesis draft.',
		'NotAvailable',
		true,
		'1',
	),
	createChecklistItem(
		'p1-item-2',
		'Check plagiarism score.',
		'NotAvailable',
		true,
		'1',
	),
	createChecklistItem(
		'p1-item-3',
		'Initial formatting check.',
		'NotAvailable',
		false,
		'1',
	),
];

const checklistPhase2: ChecklistItem[] = [
	createChecklistItem(
		'p2-item-1',
		'Code has been peer reviewed.',
		'NotAvailable',
		true,
		'2',
	),
	createChecklistItem(
		'p2-item-2',
		'Core features are complete.',
		'NotAvailable',
		true,
		'2',
	),
	createChecklistItem(
		'p2-item-3',
		'Initial testing completed.',
		'NotAvailable',
		false,
		'2',
	),
];

const checklistPhase3: ChecklistItem[] = [
	createChecklistItem(
		'p3-item-1',
		'Security audit completed.',
		'NotAvailable',
		true,
		'3',
	),
	createChecklistItem(
		'p3-item-2',
		'Load testing done.',
		'NotAvailable',
		false,
		'3',
	),
	createChecklistItem(
		'p3-item-3',
		'Accessibility review passed.',
		'NotAvailable',
		false,
		'3',
	),
];

const checklistPhase4: ChecklistItem[] = [
	createChecklistItem(
		'p4-item-1',
		'Supervisor approval obtained.',
		'NotAvailable',
		true,
		'4',
	),
	createChecklistItem(
		'p4-item-2',
		'Presentation slides submitted.',
		'NotAvailable',
		true,
		'4',
	),
	createChecklistItem(
		'p4-item-3',
		'Final document proofreading.',
		'NotAvailable',
		false,
		'4',
	),
];

const checklistPhase5: ChecklistItem[] = [
	createChecklistItem(
		'p5-item-1',
		'Final thesis uploaded.',
		'NotAvailable',
		true,
		'5',
	),
	createChecklistItem(
		'p5-item-2',
		'Thesis approved by the committee.',
		'NotAvailable',
		true,
		'5',
	),
	createChecklistItem(
		'p5-item-3',
		'Archival requirements met.',
		'NotAvailable',
		false,
		'5',
	),
];

export const mockChecklistByPhase: Record<string, ChecklistItem[]> = {
	'Submit Thesis': checklistPhase1,
	'Review 1': checklistPhase2,
	'Review 2': checklistPhase3,
	'Review 3': checklistPhase4,
	'Final Report': checklistPhase5,
};
