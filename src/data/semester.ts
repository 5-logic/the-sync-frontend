// mock-semester.ts
import mockGroups from '@/data/group';

// Trích xuất các semesterId duy nhất
const uniqueSemesterIds = Array.from(
	new Set(mockGroups.map((group) => group.semesterId)),
);

// Tạo mock data cho dropdown filter
export const mockSemesters: { value: string; label: string }[] =
	uniqueSemesterIds.map((id) => ({
		value: id,
		label: `Semester ${id}`,
	}));

// Ví dụ kết quả:
// [
//   { value: '2023', label: 'Semester 2023' },
//   { value: '2024', label: 'Semester 2024' }
// ]
