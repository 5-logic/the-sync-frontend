import { mockReviewGroups } from '@/data/group';

// Lấy danh sách milestone từ các key phase
export const mockMilestones: { value: string; label: string }[] = Object.keys(
	mockReviewGroups,
).map((phase) => ({
	value: phase,
	label: `Milestone ${phase}`,
}));

// Ví dụ kết quả:[
// 	{ value: 'Start', label: 'Milestone Start' },
// 	{ value: 'Review 1', label: 'Milestone Review 1' },
// 	{ value: 'Review 2', label: 'Milestone Review 2' },
// 	{ value: 'Review 3', label: 'Milestone Review 3' },
// 	{ value: 'Final Review', label: 'Milestone Final Review' }
// ]
