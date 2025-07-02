import { Checklist, ChecklistItem } from '@/schemas/checklist';

export const mockChecklists: Checklist[] = [
	{
		id: 'c1',
		name: 'Phase 1 Review Checklist',
		description: 'Checklist for phase 1 of the thesis process',
		createdAt: new Date('2024-06-01'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'c2',
		name: 'Final Submission Checklist',
		description: 'Checklist before submitting the final thesis',
		createdAt: new Date('2024-06-05'),
		updatedAt: new Date('2024-07-01'),
	},
];

export const mockChecklistItems: ChecklistItem[] = [
	// Items for Checklist c1
	{
		id: 'i1',
		name: 'Submit Proposal Document',
		acceptance: 'NotAvailable',
		description: 'Upload your proposal as PDF',
		isRequired: true,
		checklistId: 'c1',
		createdAt: new Date('2024-06-01'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'i2',
		name: 'Supervisor Approval',
		acceptance: 'No',
		description: null,
		isRequired: true,
		checklistId: 'c1',
		createdAt: new Date('2024-06-02'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'i3',
		name: 'Initial Presentation',
		acceptance: 'Yes',
		description: 'Slides + recording required',
		isRequired: false,
		checklistId: 'c1',
		createdAt: new Date('2024-06-03'),
		updatedAt: new Date('2024-07-01'),
	},

	// Items for Checklist c2
	{
		id: 'i4',
		name: 'Submit Final Thesis',
		acceptance: 'NotAvailable',
		description: 'Final PDF version approved by supervisor',
		isRequired: true,
		checklistId: 'c2',
		createdAt: new Date('2024-06-05'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'i5',
		name: 'Anti-Plagiarism Report',
		acceptance: 'Yes',
		description: 'Attach Turnitin or iThenticate report',
		isRequired: true,
		checklistId: 'c2',
		createdAt: new Date('2024-06-06'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'i6',
		name: 'Final Presentation Slides',
		acceptance: 'No',
		description: null,
		isRequired: false,
		checklistId: 'c2',
		createdAt: new Date('2024-06-07'),
		updatedAt: new Date('2024-07-01'),
	},
];
