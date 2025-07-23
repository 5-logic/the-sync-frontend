export const calculateRowSpans = <
	T extends { groupId: string; major: string; semester: string },
>(
	data: T[],
): T[] => {
	const result: T[] = [];
	const groupCounts: Record<string, number> = {};
	const seenGroups = new Set<string>();
	const seenMajorInGroups = new Set<string>();
	const seenSemesterInGroups = new Set<string>();

	data.forEach((item) => {
		groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + 1;
	});

	data.forEach((item) => {
		const newItem = { ...item } as T & {
			rowSpanGroup?: number;
			rowSpanMajor?: number;
			rowSpanSemester?: number;
		};

		if (!seenGroups.has(item.groupId)) {
			seenGroups.add(item.groupId);
			newItem.rowSpanGroup = groupCounts[item.groupId];
		} else {
			newItem.rowSpanGroup = 0;
		}

		const majorKey = `${item.groupId}-${item.major}`;
		if (!seenMajorInGroups.has(majorKey)) {
			seenMajorInGroups.add(majorKey);
			newItem.rowSpanMajor = data.filter(
				(d) => d.groupId === item.groupId && d.major === item.major,
			).length;
		} else {
			newItem.rowSpanMajor = 0;
		}

		const semesterKey = `${item.groupId}-${item.semester}`;
		if (!seenSemesterInGroups.has(semesterKey)) {
			seenSemesterInGroups.add(semesterKey);
			newItem.rowSpanSemester = data.filter(
				(d) => d.groupId === item.groupId && d.semester === item.semester,
			).length;
		} else {
			newItem.rowSpanSemester = 0;
		}

		result.push(newItem);
	});

	return result;
};
