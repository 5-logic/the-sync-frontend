import { mockReviewGroups } from '@/data/group';

// Interface chi tiết cho từng milestone
export interface Milestone {
	id: number;
	title: string;
	date: string;
	status: 'Ended' | 'In Progress' | 'Upcoming';
	semesterId: string;
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
		date: '2025-05-31',
		status: 'Ended',
		semesterId: 'Spring 2025',
		submitted: true,
		fileName: 'proposal_final.pdf',
		feedback: 'Well done. Your structure is clear and logic flows nicely.',
		supervisor: 'Dr. Nguyen Van A',
	},
	{
		id: 2,
		title: 'Review 1',
		date: '2025-07-02',
		status: 'Ended',
		semesterId: 'Spring 2025',
		submitted: true,
		fileName: 'review1_report.pdf',
		feedback: 'Please revise the introduction section. Too generic.',
		supervisor: 'Prof. Le Thi B',
	},
	{
		id: 3,
		title: 'Review 2',
		date: '2025-08-01',
		status: 'In Progress',
		semesterId: 'Spring 2025',
	},
	{
		id: 4,
		title: 'Review 3',
		date: '2025-08-30',
		status: 'Upcoming',
		semesterId: 'Spring 2025',
	},
	{
		id: 5,
		title: 'Final Report',
		date: '2025-09-15',
		status: 'Upcoming',
		semesterId: 'Spring 2025',
	},
];
