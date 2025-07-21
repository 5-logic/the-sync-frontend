import { useMemo } from 'react';

import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

export type GroupTableData = {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	semester: string;
	groupId: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
	rowSpanSemester: number;
	abbreviation?: string;
	supervisor?: string;
	status?: string;
};

const generateBaseData = (): GroupTableData[] => {
	let counter = 1;
	const tempData: GroupTableData[] = [];

	allMockGroups
		.filter((group) => group && group.members?.length > 0)
		.forEach((group) => {
			const thesis = mockTheses.find((t) => t.groupId === group.id);

			const groupMembers = group.members
				.filter((member): member is NonNullable<typeof member> => !!member)
				.map((member) => ({
					groupId: group.id,
					stt: counter++,
					studentId: member.id,
					name: member.name,
					major: member.major,
					thesisName: thesis?.englishName || group.title,
					abbreviation: thesis?.abbreviation || group.code,
					supervisor: group.supervisors?.join(', ') || '',
					semester: group.semesterId,
					status: member.defenseStatus || 'Pass',
					rowSpanGroup: 0,
					rowSpanMajor: 0,
					rowSpanSemester: 0,
				}))
				.sort((a, b) => a.major.localeCompare(b.major));

			tempData.push(...groupMembers);
		});

	return calculateRowSpans(tempData);
};

// Logic dùng chung
const getGroupTableData = () => {
	const baseData = generateBaseData();

	const availableSemesters = Array.from(
		new Set(baseData.map((item) => item.semester)),
	);

	return {
		baseData,
		availableSemesters: ['all', ...availableSemesters],
	};
};

// Hook cho GroupManagement
export const GroupTableData = () => {
	const data = useMemo(() => getGroupTableData(), []);
	return data;
};

// Hook cho GroupResults
export const useGroupTableData = () => {
	const data = useMemo(() => getGroupTableData(), []);
	return data;
};
