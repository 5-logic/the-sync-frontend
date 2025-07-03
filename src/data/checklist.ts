import { Checklist } from '@/schemas/checklist';

export const mockChecklists: (Checklist & {
	semester: string;
	milestone: string;
})[] = [
	{
		id: 'c1',
		name: 'Phase 1 Review Checklist',
		description: 'Checklist for phase 1 of the thesis process',
		semester: '2024',
		milestone: 'Review 1',
		createdAt: new Date('2024-06-01'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'c2',
		name: 'Phase 2 Review Checklist',
		description: 'Checklist for phase 2 of the thesis process',
		semester: '2024',
		milestone: 'Review 2',
		createdAt: new Date('2024-06-03'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'c3',
		name: 'Phase 3 Review Checklist',
		description: 'Checklist for phase 3 of the thesis process',
		semester: '2024',
		milestone: 'Review 3',
		createdAt: new Date('2024-06-05'),
		updatedAt: new Date('2024-07-01'),
	},
	{
		id: 'c4',
		name: 'Final Submission Checklist',
		description: 'Checklist before submitting the final thesis',
		semester: '2024',
		milestone: 'Final Review',
		createdAt: new Date('2024-06-07'),
		updatedAt: new Date('2024-07-01'),
	},

	// Checklist for another semester
	{
		id: 'c5',
		name: 'Phase 1 Review Checklist - SP2023',
		description: 'Checklist for phase 1 of thesis in semester 2023',
		semester: '2023',
		milestone: 'Review 1',
		createdAt: new Date('2023-06-01'),
		updatedAt: new Date('2023-07-01'),
	},
	{
		id: 'c6',
		name: 'Final Review Checklist - SP2023',
		description: 'Checklist for final thesis submission in 2023',
		semester: '2023',
		milestone: 'Final Review',
		createdAt: new Date('2023-06-10'),
		updatedAt: new Date('2023-07-01'),
	},
];
