// Base interface for row span calculation
interface BaseRowSpanItem {
	groupId: string;
	major: string;
}

export interface FullRowSpanItem extends BaseRowSpanItem {
	stt: number;
	studentId: string;
	userId: string;
	name: string;
	thesisName: string;
	semester: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
	rowSpanSemester: number;
	rowSpanStudentId?: number;
	abbreviation?: string;
	supervisor?: string;
	status?: string;
}

// Core calculation logic shared between functions
const calculateGroupCounts = <T extends BaseRowSpanItem>(
	data: T[],
): Record<string, number> => {
	const groupCounts: Record<string, number> = {};
	data.forEach((item) => {
		groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + 1;
	});
	return groupCounts;
};

const calculateGroupRowSpan = <T extends BaseRowSpanItem>(
	item: T,
	seenGroups: Set<string>,
	groupCounts: Record<string, number>,
): number => {
	if (!seenGroups.has(item.groupId)) {
		seenGroups.add(item.groupId);
		return groupCounts[item.groupId];
	}
	return 0;
};

const calculateMajorRowSpan = <T extends BaseRowSpanItem>(
	item: T,
	data: T[],
	seenMajorInGroups: Set<string>,
): number => {
	const majorKey = `${item.groupId}-${item.major}`;
	if (!seenMajorInGroups.has(majorKey)) {
		seenMajorInGroups.add(majorKey);
		// Get all students in the same group with the same major
		const sameGroupSameMajor = data.filter(
			(d) => d.groupId === item.groupId && d.major === item.major,
		);
		return sameGroupSameMajor.length;
	}
	return 0;
};

const calculateSemesterRowSpan = <T extends FullRowSpanItem>(
	item: T,
	data: T[],
	seenSemesterInGroups: Set<string>,
): number => {
	const semesterKey = `${item.groupId}-${item.semester}`;
	if (!seenSemesterInGroups.has(semesterKey)) {
		seenSemesterInGroups.add(semesterKey);
		return data.filter(
			(d) => d.groupId === item.groupId && d.semester === item.semester,
		).length;
	}
	return 0;
};

export const calculateRowSpans = <T extends FullRowSpanItem>(
	data: T[],
): T[] => {
	// Sort data to ensure proper row spanning
	// First by group, then by major within the group
	const sortedData = [...data].sort((a, b) => {
		if (a.groupId !== b.groupId) {
			return a.groupId.localeCompare(b.groupId);
		}
		// Within the same group, sort by major to group same majors together
		if (a.major !== b.major) {
			return a.major.localeCompare(b.major);
		}
		// Finally sort by student name for consistency
		return a.name.localeCompare(b.name);
	});

	const result: T[] = [];
	const groupCounts = calculateGroupCounts(sortedData);
	const seenGroups = new Set<string>();
	const seenMajorInGroups = new Set<string>();
	const seenSemesterInGroups = new Set<string>();

	sortedData.forEach((item) => {
		const newItem = { ...item } as T & {
			rowSpanGroup?: number;
			rowSpanMajor?: number;
			rowSpanSemester?: number;
		};

		newItem.rowSpanGroup = calculateGroupRowSpan(item, seenGroups, groupCounts);
		newItem.rowSpanMajor = calculateMajorRowSpan(
			item,
			sortedData,
			seenMajorInGroups,
		);
		newItem.rowSpanSemester = calculateSemesterRowSpan(
			item,
			sortedData,
			seenSemesterInGroups,
		);

		result.push(newItem);
	});

	return result;
};

// Function for export data that doesn't need semester rowspan
export const calculateRowSpansForExport = <T extends BaseRowSpanItem>(
	data: T[],
): T[] => {
	// Sort data to ensure proper row spanning
	const sortedData = [...data].sort((a, b) => {
		if (a.groupId !== b.groupId) {
			return a.groupId.localeCompare(b.groupId);
		}
		// Within the same group, sort by major to group same majors together
		return a.major.localeCompare(b.major);
	});

	const result: T[] = [];
	const groupCounts = calculateGroupCounts(sortedData);
	const seenGroups = new Set<string>();
	const seenMajorInGroups = new Set<string>();

	sortedData.forEach((item) => {
		const newItem = { ...item } as T & {
			rowSpanGroup?: number;
			rowSpanMajor?: number;
		};

		newItem.rowSpanGroup = calculateGroupRowSpan(item, seenGroups, groupCounts);
		newItem.rowSpanMajor = calculateMajorRowSpan(
			item,
			sortedData,
			seenMajorInGroups,
		);

		result.push(newItem);
	});

	return result;
};
