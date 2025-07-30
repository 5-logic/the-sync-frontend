import { useMemo } from 'react';

import { Semester } from '@/schemas/semester';

interface ExportValidationResult {
	canExport: boolean;
	reason: string;
}

// Helper function to check if a semester allows export
const isSemesterExportAllowed = (semester: Semester): boolean => {
	return (
		semester.status === 'End' ||
		(semester.status === 'Ongoing' && semester.ongoingPhase === 'ScopeLocked')
	);
};

// Helper function to validate specific semester
const validateSpecificSemester = (
	semester: Semester,
): ExportValidationResult => {
	if (isSemesterExportAllowed(semester)) {
		return { canExport: true, reason: '' };
	}

	if (
		semester.status === 'Ongoing' &&
		semester.ongoingPhase !== 'ScopeLocked'
	) {
		return {
			canExport: false,
			reason: `Export requires "ScopeLocked" phase or "End" status.`,
		};
	}

	return {
		canExport: false,
		reason: `Export is only allowed for "Ongoing" semesters with "Scope Locked" phase or "End" status.`,
	};
};

export const useSemesterExportValidation = (
	selectedSemesterId: string,
	semesters: Semester[],
): ExportValidationResult => {
	return useMemo(() => {
		const selectedSemesterData = semesters.find(
			(s) => s.id === selectedSemesterId,
		);

		if (!selectedSemesterData) {
			return {
				canExport: false,
				reason: 'Please select a valid semester to export data.',
			};
		}

		return validateSpecificSemester(selectedSemesterData);
	}, [selectedSemesterId, semesters]);
};
