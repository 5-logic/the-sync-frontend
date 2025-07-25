import { useMemo } from 'react';

import { Semester } from '@/schemas/semester';

interface ExportValidationResult {
	canExport: boolean;
	reason: string;
}

export const useSemesterExportValidation = (
	selectedSemester: string,
	semesters: Semester[],
): ExportValidationResult => {
	return useMemo(() => {
		if (selectedSemester !== 'all') {
			const selectedSemesterData = semesters.find(
				(s) => s.name === selectedSemester,
			);
			if (selectedSemesterData) {
				const { status, ongoingPhase } = selectedSemesterData;

				// Allow export for "End" status
				if (status === 'End') {
					return {
						canExport: true,
						reason: '',
					};
				}

				// Allow export for "Ongoing" status with "ScopeLocked" phase
				if (status === 'Ongoing' && ongoingPhase === 'ScopeLocked') {
					return {
						canExport: true,
						reason: '',
					};
				}

				// Block export for other cases
				if (status === 'Ongoing' && ongoingPhase !== 'ScopeLocked') {
					return {
						canExport: false,
						reason: `Export not allowed. Semester is in "Ongoing" status but phase is "${ongoingPhase}". Export requires "ScopeLocked" phase or "End" status.`,
					};
				}

				return {
					canExport: false,
					reason: `Export not allowed for semester with status "${status}". Export is only allowed for "Ongoing" semesters with "ScopeLocked" phase or "End" status.`,
				};
			}
		} else {
			// When "all" is selected, check if there are any valid semesters
			const validSemesters = semesters.filter(
				(s) =>
					s.status === 'End' ||
					(s.status === 'Ongoing' && s.ongoingPhase === 'ScopeLocked'),
			);
			if (validSemesters.length === 0) {
				return {
					canExport: false,
					reason:
						'Export not allowed. No semesters with valid export conditions found. Export requires "End" status or "Ongoing" status with "ScopeLocked" phase.',
				};
			}
		}
		return {
			canExport: true,
			reason: '',
		};
	}, [selectedSemester, semesters]);
};
