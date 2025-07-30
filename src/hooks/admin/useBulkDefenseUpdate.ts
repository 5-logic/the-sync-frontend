import { useCallback } from 'react';

import semesterService from '@/lib/services/semesters.service';
import {
	extractApiErrorMessage,
	extractApiSuccessMessage,
} from '@/lib/utils/defenseResultsApi';
import { showNotification } from '@/lib/utils/notification';

export interface Student {
	studentId: string;
	groupId: string;
	userId?: string;
	name: string;
	status?: string;
}

export interface Semester {
	id: string;
	name: string;
	status?: string;
	ongoingPhase?: string | null;
}

export interface BulkUpdateParams {
	selectedRowKeys: React.Key[];
	filteredData: Student[];
	selectedSemester: string;
	semesters: Semester[];
	onStatusChange: (studentId: string, status: string) => void;
	onSelectionClear: () => void;
	onRefresh: () => void;
}

/**
 * Custom hook for defense results bulk update operations
 * Separates business logic from UI components
 */
export const useBulkDefenseUpdate = () => {
	const updateBulkStatus = useCallback(
		async (
			status: 'Passed' | 'Failed',
			params: BulkUpdateParams,
		): Promise<{ success: boolean; message?: string }> => {
			const {
				selectedRowKeys,
				filteredData,
				selectedSemester,
				semesters,
				onStatusChange,
				onSelectionClear,
				onRefresh,
			} = params;

			try {
				// Validate semester
				const semester = semesters.find((s) => s.id === selectedSemester);
				if (!semester) {
					const errorMsg = 'Semester not found';
					showNotification.error('Error', errorMsg);
					return { success: false, message: errorMsg };
				}

				// Extract user IDs from selected rows
				const studentIds = selectedRowKeys
					.map((key) => {
						const studentCode = String(key).split('-')[0];
						const student = filteredData.find(
							(item) => item.studentId === studentCode,
						);
						return student?.userId;
					})
					.filter(Boolean) as string[];

				if (studentIds.length === 0) {
					const errorMsg = 'No valid students selected';
					showNotification.error('Error', errorMsg);
					return { success: false, message: errorMsg };
				}

				// Call API
				const response = await semesterService.updateEnrollments(semester.id, {
					studentIds,
					status,
				});

				// Update local state for immediate UI feedback
				selectedRowKeys.forEach((key) => {
					const studentId = String(key).split('-')[0];
					onStatusChange(studentId, status);
				});

				// Clear selection and refresh
				onSelectionClear();
				onRefresh();

				// Show success message
				const defaultMessage = `Updated ${studentIds.length} student(s) to ${status}`;
				const message = extractApiSuccessMessage(response, defaultMessage);
				showNotification.success('Success', message);

				return { success: true, message };
			} catch (error) {
				console.error('Error updating defense results:', error);
				const errorMessage = extractApiErrorMessage(error);
				showNotification.error('Error', errorMessage);
				return { success: false, message: errorMessage };
			}
		},
		[],
	);

	const updateIndividualStatus = useCallback(
		async (
			statusUpdates: Record<string, string>,
			params: Omit<BulkUpdateParams, 'selectedRowKeys'>,
		): Promise<{ success: boolean; message?: string }> => {
			const { filteredData, selectedSemester, semesters, onRefresh } = params;

			try {
				// Validate semester
				const semester = semesters.find((s) => s.id === selectedSemester);
				if (!semester) {
					const errorMsg = 'Semester not found';
					showNotification.error('Error', errorMsg);
					return { success: false, message: errorMsg };
				}

				// Group updates by status
				const studentsByStatus = {
					Passed: [] as string[],
					Failed: [] as string[],
				};

				Object.entries(statusUpdates).forEach(([studentCode, status]) => {
					const student = filteredData.find(
						(item) => item.studentId === studentCode,
					);
					if (student?.userId && (status === 'Passed' || status === 'Failed')) {
						studentsByStatus[status].push(student.userId);
					}
				});

				// Make API calls for each status group
				const updatePromises: Promise<unknown>[] = [];

				Object.entries(studentsByStatus).forEach(([status, studentIds]) => {
					if (studentIds.length > 0) {
						updatePromises.push(
							semesterService.updateEnrollments(semester.id, {
								studentIds,
								status: status as 'Passed' | 'Failed',
							}),
						);
					}
				});

				const responses = await Promise.all(updatePromises);

				// Refresh data
				onRefresh();

				// Show success message
				const defaultMessage = 'Defense results updated successfully!';
				const message =
					responses.length > 0
						? extractApiSuccessMessage(responses[0], defaultMessage)
						: defaultMessage;
				showNotification.success('Success', message);

				return { success: true, message };
			} catch (error) {
				console.error('Error updating defense results:', error);
				const errorMessage = extractApiErrorMessage(error);
				showNotification.error('Error', errorMessage);
				return { success: false, message: errorMessage };
			}
		},
		[],
	);

	return {
		updateBulkStatus,
		updateIndividualStatus,
	};
};
