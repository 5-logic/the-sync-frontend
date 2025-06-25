import studentService from '@/lib/services/students.service';
import { showNotification } from '@/lib/utils/notification';
import { Student } from '@/schemas/student';
import {
	DEFAULT_TOGGLE_CONFIG,
	type ToggleOperationData,
	cleanupToggleOperation,
	createBackgroundRefreshHandler,
	performOptimisticUpdate,
	revertOptimisticUpdate,
	setupToggleOperation,
} from '@/store/helpers/toggleHelpers';

/**
 * Creates a reusable toggle function for student status
 */
export const createStudentToggleFunction = (
	getState: () => {
		students: Student[];
		_studentLoadingStates: Map<string, boolean>;
		_toggleOperations: Map<string, ToggleOperationData>;
		_backgroundRefreshRunning: boolean;
		_lastBackgroundRefresh: number;
	},
	setState: (state: {
		students?: Student[];
		_backgroundRefreshRunning?: boolean;
		_lastBackgroundRefresh?: number;
		loading?: boolean;
	}) => void,
	applyFilters: () => void,
) => {
	return async (id: string, data: { isActive: boolean }): Promise<boolean> => {
		const state = getState();
		const { controller, operationData, shouldProceed } = setupToggleOperation(
			id,
			data.isActive,
			state._studentLoadingStates,
			state._toggleOperations,
		);

		if (!shouldProceed) {
			return true; // Already processing, ignore this request
		}

		// Optimistic update FIRST
		const targetStudent = performOptimisticUpdate(
			id,
			{ isActive: data.isActive },
			state.students,
			(students) => setState({ students }),
			applyFilters,
		);

		// Debounced API call
		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				try {
					// Check if operation was cancelled
					if (controller.signal.aborted) {
						resolve(true);
						return;
					}

					// Verify we still have the latest operation
					const currentState = getState();
					const latestOp = currentState._toggleOperations.get(id);
					if (latestOp !== operationData) {
						resolve(true);
						return;
					}

					// Make API call
					const response = await studentService.toggleStatus(id, data);

					// Clean up operation tracking
					cleanupToggleOperation(
						id,
						currentState._toggleOperations,
						currentState._studentLoadingStates,
					);

					if (!response.success && targetStudent) {
						// If API fails, revert the optimistic update
						revertOptimisticUpdate(
							id,
							targetStudent,
							currentState.students,
							(students) => setState({ students }),
							applyFilters,
						);
						resolve(false);
						return;
					}

					// Show success notification
					const statusText = data.isActive ? 'activated' : 'deactivated';
					showNotification.success(
						'Status Updated',
						`Student status ${statusText} successfully`,
					);

					// Background refresh
					setTimeout(
						createBackgroundRefreshHandler(
							controller,
							() => studentService.findAll(),
							(students) => setState({ students }),
							() => ({
								_backgroundRefreshRunning:
									currentState._backgroundRefreshRunning,
								_lastBackgroundRefresh: currentState._lastBackgroundRefresh,
							}),
							setState,
						),
						DEFAULT_TOGGLE_CONFIG.backgroundRefreshDelay,
					);

					resolve(true);
				} catch {
					// Clean up on error
					const currentState = getState();
					cleanupToggleOperation(
						id,
						currentState._toggleOperations,
						currentState._studentLoadingStates,
					);

					// If request was aborted, don't treat as error
					if (controller.signal.aborted) {
						resolve(true);
						return;
					}

					// API error: revert optimistic update
					if (targetStudent) {
						revertOptimisticUpdate(
							id,
							targetStudent,
							currentState.students,
							(students) => setState({ students }),
							applyFilters,
						);
					}

					resolve(false);
				}
			}, DEFAULT_TOGGLE_CONFIG.debounceDelay);
		});
	};
};
