import { ChecklistItem } from '@/schemas/checklist';

// Define parameter types for checklist items
type ChecklistItemParams = [
	string, // id
	string, // name
	'Yes' | 'No' | 'NotAvailable', // acceptance
	string, // description
	boolean, // isRequired
	string, // checklistId
	string, // createdAt
];

// Array of parameters for all checklist items
const checklistItemParams: ChecklistItemParams[] = [
	[
		'i1',
		'Did you submit the proposal document?',
		'NotAvailable',
		'Please upload your thesis proposal in PDF format.',
		true,
		'c1',
		'2024-06-01',
	],
	[
		'i2',
		'Has your supervisor approved the proposal?',
		'No',
		'Make sure your supervisor has formally approved it.',
		true,
		'c1',
		'2024-06-02',
	],
	[
		'i3',
		'Did you complete the initial presentation?',
		'Yes',
		'Slides and a video recording are required.',
		false,
		'c1',
		'2024-06-03',
	],
	[
		'i4',
		'Have you submitted the progress report?',
		'NotAvailable',
		'The report should reflect your current thesis progress.',
		true,
		'c2',
		'2024-06-03',
	],
	[
		'i5',
		'Did your supervisor provide midterm feedback?',
		'No',
		'You should have written or verbal feedback.',
		false,
		'c2',
		'2024-06-04',
	],
	[
		'i6',
		'Have you submitted a complete draft report?',
		'Yes',
		'The draft should include methodology and preliminary results.',
		true,
		'c3',
		'2024-06-05',
	],
	[
		'i7',
		'Did you summarize all supervisor comments?',
		'NotAvailable',
		'Consolidate all supervisor feedback into a summary.',
		false,
		'c3',
		'2024-06-06',
	],
	[
		'i8',
		'Have you submitted the final thesis?',
		'NotAvailable',
		'Ensure the final version is supervisor-approved and in PDF format.',
		true,
		'c4',
		'2024-06-07',
	],
	[
		'i9',
		'Did you attach an anti-plagiarism report?',
		'Yes',
		'Submit a Turnitin or iThenticate report.',
		true,
		'c4',
		'2024-06-08',
	],
	[
		'i10',
		'Have you prepared the final presentation slides?',
		'No',
		'Include key findings and recommendations in your slides.',
		false,
		'c4',
		'2024-06-09',
	],
	[
		'i11',
		'Did you submit the proposal document (2023)?',
		'NotAvailable',
		'Upload your thesis proposal in PDF format for 2023 review.',
		true,
		'c5',
		'2023-06-01',
	],
	[
		'i12',
		'Have you been assigned a supervisor?',
		'Yes',
		'Ensure your supervisor is registered in the system.',
		false,
		'c5',
		'2023-06-02',
	],
	[
		'i13',
		'Did you submit the final thesis (2023)?',
		'Yes',
		'Upload the final PDF version approved by your supervisor.',
		true,
		'c6',
		'2023-06-10',
	],
	[
		'i14',
		'Did you attach a Turnitin report?',
		'Yes',
		'Make sure it meets the plagiarism threshold.',
		true,
		'c6',
		'2023-06-11',
	],
];

// Create checklist items from parameters
export const mockChecklistItems: ChecklistItem[] = checklistItemParams.map(
	([
		id,
		name,
		acceptance,
		description,
		isRequired,
		checklistId,
		createdAt,
	]) => ({
		id,
		name,
		acceptance,
		description,
		isRequired,
		checklistId,
		createdAt: new Date(createdAt),
		updatedAt: new Date('2024-07-01'),
	}),
);
