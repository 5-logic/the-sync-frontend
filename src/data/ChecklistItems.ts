import { ChecklistItem } from '@/schemas/checklist';

const createChecklistItem = (
	id: string,
	name: string,
	acceptance: 'Yes' | 'No' | 'NotAvailable',
	description: string | null,
	isRequired: boolean,
	checklistId: string,
	createdAt: string,
): ChecklistItem => ({
	id,
	name,
	acceptance,
	description,
	isRequired,
	checklistId,
	createdAt: new Date(createdAt),
	updatedAt: new Date('2024-07-01'),
});

export const mockChecklistItems: ChecklistItem[] = [
	// Checklist c1 – 2024 – Review 1
	createChecklistItem(
		'i1',
		'Submit Proposal Document',
		'NotAvailable',
		'Upload your proposal as PDF',
		true,
		'c1',
		'2024-06-01',
	),
	createChecklistItem(
		'i2',
		'Supervisor Approval',
		'No',
		null,
		true,
		'c1',
		'2024-06-02',
	),
	createChecklistItem(
		'i3',
		'Initial Presentation',
		'Yes',
		'Slides + recording required',
		false,
		'c1',
		'2024-06-03',
	),

	// Checklist c2 – 2024 – Review 2
	createChecklistItem(
		'i4',
		'Submit Progress Report',
		'NotAvailable',
		'Report covering thesis progress',
		true,
		'c2',
		'2024-06-03',
	),
	createChecklistItem(
		'i5',
		'Midterm Feedback from Supervisor',
		'No',
		null,
		false,
		'c2',
		'2024-06-04',
	),

	// Checklist c3 – 2024 – Review 3
	createChecklistItem(
		'i6',
		'Submit Draft Report',
		'Yes',
		'Draft should include methodology and results',
		true,
		'c3',
		'2024-06-05',
	),
	createChecklistItem(
		'i7',
		'Supervisor Comment Summary',
		'NotAvailable',
		'Collect and summarize all feedback',
		false,
		'c3',
		'2024-06-06',
	),

	// Checklist c4 – 2024 – Final Review
	createChecklistItem(
		'i8',
		'Submit Final Thesis',
		'NotAvailable',
		'Final PDF version approved by supervisor',
		true,
		'c4',
		'2024-06-07',
	),
	createChecklistItem(
		'i9',
		'Anti-Plagiarism Report',
		'Yes',
		'Attach Turnitin or iThenticate report',
		true,
		'c4',
		'2024-06-08',
	),
	createChecklistItem(
		'i10',
		'Final Presentation Slides',
		'No',
		null,
		false,
		'c4',
		'2024-06-09',
	),

	// Checklist c5 – 2023 – Review 1
	createChecklistItem(
		'i11',
		'Submit Proposal Document',
		'NotAvailable',
		'Upload your proposal as PDF (2023)',
		true,
		'c5',
		'2023-06-01',
	),
	createChecklistItem(
		'i12',
		'Supervisor Assignment',
		'Yes',
		null,
		false,
		'c5',
		'2023-06-02',
	),

	// Checklist c6 – 2023 – Final Review
	createChecklistItem(
		'i13',
		'Submit Final Thesis',
		'Yes',
		'Approved PDF for 2023',
		true,
		'c6',
		'2023-06-10',
	),
	createChecklistItem(
		'i14',
		'Turnitin Report',
		'Yes',
		'Attach plagiarism report',
		true,
		'c6',
		'2023-06-11',
	),
];
