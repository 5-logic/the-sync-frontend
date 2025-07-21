// src/hooks/useThesisTableData.ts
import { useMemo } from 'react';

import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

export type ThesisTableData = {
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

export const useThesisTableData = () => {
	const baseData: ThesisTableData[] = useMemo(() => {
		let counter = 1;
		const tempData: ThesisTableData[] = [];

		allMockGroups.forEach((group) => {
			const thesis = mockTheses.find((t) => t.groupId === group.id);

			const groupMembers = group.members
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
	}, []);

	const availableSemesters = useMemo(() => {
		const semesters = new Set(baseData.map((item) => item.semester));
		return Array.from(semesters).sort();
	}, [baseData]);

	return { baseData, availableSemesters };
};
