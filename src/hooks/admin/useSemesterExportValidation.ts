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
			reason: `Export not allowed. Semester is in "Ongoing" status but phase is "${semester.ongoingPhase}". Export requires "ScopeLocked" phase or "End" status.`,
		};
	}

	return {
		canExport: false,
		reason: `Export not allowed for semester with status "${semester.status}". Export is only allowed for "Ongoing" semesters with "ScopeLocked" phase or "End" status.`,
	};
};

// Helper function to validate when "all" semesters are selected
const validateAllSemesters = (
	semesters: Semester[],
): ExportValidationResult => {
	const validSemesters = semesters.filter(isSemesterExportAllowed);

	if (validSemesters.length === 0) {
		return {
			canExport: false,
			reason:
				'Export not allowed. No semesters with valid export conditions found. Export requires "End" status or "Ongoing" status with "ScopeLocked" phase.',
		};
	}

	return { canExport: true, reason: '' };
};

export const useSemesterExportValidation = (
	selectedSemester: string,
	semesters: Semester[],
): ExportValidationResult => {
	return useMemo(() => {
		if (selectedSemester === 'all') {
			return validateAllSemesters(semesters);
		}

		const selectedSemesterData = semesters.find(
			(s) => s.name === selectedSemester,
		);

		if (!selectedSemesterData) {
			return { canExport: true, reason: '' };
		}

		return validateSpecificSemester(selectedSemesterData);
	}, [selectedSemester, semesters]);
};
