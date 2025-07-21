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

// Base data generation with proper memoization
const generateBaseData = (): GroupTableData[] => {
	let counter = 1;
	const tempData: GroupTableData[] = [];

	allMockGroups
		.filter((group) => group && group.members?.length > 0) // tránh group lỗi
		.forEach((group) => {
			const thesis = mockTheses.find((t) => t.groupId === group.id);

			const groupMembers = group.members
				.filter((member): member is NonNullable<typeof member> => !!member) // tránh member lỗi
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

// Hook for GroupManagement (thesis table data)
export const GroupTableData = () => {
	const baseData = useMemo(() => generateBaseData(), []);

	const availableSemesters = useMemo(() => {
		const semesters = Array.from(
			new Set(baseData.map((item) => item.semester)),
		);
		return ['all', ...semesters];
	}, [baseData]);

	return {
		baseData,
		availableSemesters,
	};
};

// Hook for GroupResults (group table data)
export const useGroupTableData = () => {
	const baseData = useMemo(() => generateBaseData(), []);

	const availableSemesters = useMemo(() => {
		const semesters = Array.from(
			new Set(baseData.map((item) => item.semester)),
		);
		return ['all', ...semesters];
	}, [baseData]);

	return {
		baseData,
		availableSemesters,
	};
};
