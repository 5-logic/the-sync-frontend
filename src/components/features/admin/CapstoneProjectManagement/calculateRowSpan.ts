// Base interface for row span calculation
interface BaseRowSpanItem {
	groupId: string;
	major: string;
}

export interface FullRowSpanItem extends BaseRowSpanItem {
	stt: number;
	studentId: string;
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
		return data.filter(
			(d) => d.groupId === item.groupId && d.major === item.major,
		).length;
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
	const result: T[] = [];
	const groupCounts = calculateGroupCounts(data);
	const seenGroups = new Set<string>();
	const seenMajorInGroups = new Set<string>();
	const seenSemesterInGroups = new Set<string>();

	data.forEach((item) => {
		const newItem = { ...item } as T & {
			rowSpanGroup?: number;
			rowSpanMajor?: number;
			rowSpanSemester?: number;
		};

		newItem.rowSpanGroup = calculateGroupRowSpan(item, seenGroups, groupCounts);
		newItem.rowSpanMajor = calculateMajorRowSpan(item, data, seenMajorInGroups);
		newItem.rowSpanSemester = calculateSemesterRowSpan(
			item,
			data,
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
	const result: T[] = [];
	const groupCounts = calculateGroupCounts(data);
	const seenGroups = new Set<string>();
	const seenMajorInGroups = new Set<string>();

	data.forEach((item) => {
		const newItem = { ...item } as T & {
			rowSpanGroup?: number;
			rowSpanMajor?: number;
		};

		newItem.rowSpanGroup = calculateGroupRowSpan(item, seenGroups, groupCounts);
		newItem.rowSpanMajor = calculateMajorRowSpan(item, data, seenMajorInGroups);

		result.push(newItem);
	});

	return result;
};
