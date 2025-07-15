import { mockReviewGroups } from '@/data/group';

// Interface chi tiết cho từng milestone
export interface Milestone {
	id: number;
	title: string;
	date: string;
	status: 'Ended' | 'In Progress' | 'Upcoming';
	submitted?: boolean;
	fileName?: string;
	feedback?: string;
	supervisor?: string;
}

// Lấy danh sách milestone từ các key phase
export const mockMilestones: { value: string; label: string }[] = Object.keys(
	mockReviewGroups,
).map((phase) => ({
	value: phase,
	label: `Milestone ${phase}`,
}));

/**
 * Kết quả ví dụ:
 * [
 *   { value: 'Start', label: 'Milestone Start' },
 *   { value: 'Review 1', label: 'Milestone Review 1' },
 *   ...
 * ]
 */

// Danh sách dữ liệu chi tiết các mốc thời gian (dùng cho UI chi tiết)
export const mockMilestoneDetails: Milestone[] = [
	{
		id: 1,
		title: 'Submit Thesis',
		date: '2023-10-15',
		status: 'Ended',
		submitted: true,
		fileName: 'proposal_final.pdf',
		feedback: 'Well done. Your structure is clear and logic flows nicely.',
		supervisor: 'Dr. Nguyen Van A',
	},
	{
		id: 2,
		title: 'Review 1',
		date: '2023-11-15',
		status: 'Ended',
		submitted: true,
		fileName: 'review1_report.pdf',
		feedback: 'Please revise the introduction section. Too generic.',
		supervisor: 'Prof. Le Thi B',
	},
	{
		id: 3,
		title: 'Review 2',
		date: '2023-12-15',
		status: 'In Progress',
	},
	{
		id: 4,
		title: 'Review 3',
		date: '2024-03-15',
		status: 'Upcoming',
	},
	{
		id: 5,
		title: 'Final Report',
		date: '2024-05-15',
		status: 'Upcoming',
	},
];
