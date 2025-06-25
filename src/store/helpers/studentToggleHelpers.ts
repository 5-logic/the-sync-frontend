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

// Helper types for cleaner code
interface StudentToggleState {
	students: Student[];
	_studentLoadingStates: Map<string, boolean>;
	_toggleOperations: Map<string, ToggleOperationData>;
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;
}

interface SetStateFunction {
	(state: {
		students?: Student[];
		_backgroundRefreshRunning?: boolean;
		_lastBackgroundRefresh?: number;
		loading?: boolean;
	}): void;
}

// Extracted helper functions to reduce nesting
const handleStudentToggleSuccess = (
	data: { isActive: boolean },
	currentState: StudentToggleState,
	setState: SetStateFunction,
	controller: AbortController,
) => {
	const statusText = data.isActive ? 'activated' : 'deactivated';
	showNotification.success(
		'Status Updated',
		`Student status ${statusText} successfully`,
	);

	setTimeout(
		createBackgroundRefreshHandler(
			controller,
			() => studentService.findAll(),
			(students) => setState({ students }),
			() => ({
				_backgroundRefreshRunning: currentState._backgroundRefreshRunning,
				_lastBackgroundRefresh: currentState._lastBackgroundRefresh,
			}),
			setState,
		),
		DEFAULT_TOGGLE_CONFIG.backgroundRefreshDelay,
	);
};

const performStudentToggleRequest = async (
	id: string,
	data: { isActive: boolean },
	operationData: ToggleOperationData,
	controller: AbortController,
	targetStudent: Student | null,
	getState: () => StudentToggleState,
	setState: SetStateFunction,
	applyFilters: () => void,
): Promise<boolean> => {
	if (controller.signal.aborted) {
		return true;
	}

	const currentState = getState();
	const latestOp = currentState._toggleOperations.get(id);
	if (latestOp !== operationData) {
		return true;
	}

	const response = await studentService.toggleStatus(id, data);

	cleanupToggleOperation(
		id,
		currentState._toggleOperations,
		currentState._studentLoadingStates,
	);

	if (!response.success && targetStudent) {
		revertOptimisticUpdate(
			id,
			targetStudent,
			currentState.students,
			(students) => setState({ students }),
			applyFilters,
		);
		return false;
	}

	handleStudentToggleSuccess(data, currentState, setState, controller);
	return true;
};

const handleStudentToggleError = (
	id: string,
	controller: AbortController,
	targetStudent: Student | null,
	getState: () => StudentToggleState,
	setState: SetStateFunction,
	applyFilters: () => void,
): boolean => {
	const currentState = getState();
	cleanupToggleOperation(
		id,
		currentState._toggleOperations,
		currentState._studentLoadingStates,
	);

	if (controller.signal.aborted) {
		return true;
	}

	if (targetStudent) {
		revertOptimisticUpdate(
			id,
			targetStudent,
			currentState.students,
			(students) => setState({ students }),
			applyFilters,
		);
	}

	return false;
};

/**
 * Creates a reusable toggle function for student status
 */
export const createStudentToggleFunction = (
	getState: () => StudentToggleState,
	setState: SetStateFunction,
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
		const targetStudent =
			performOptimisticUpdate(
				id,
				{ isActive: data.isActive },
				state.students,
				(students) => setState({ students }),
				applyFilters,
			) || null;

		// Debounced API call
		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				try {
					const result = await performStudentToggleRequest(
						id,
						data,
						operationData,
						controller,
						targetStudent,
						getState,
						setState,
						applyFilters,
					);
					resolve(result);
				} catch {
					const errorResult = handleStudentToggleError(
						id,
						controller,
						targetStudent,
						getState,
						setState,
						applyFilters,
					);
					resolve(errorResult);
				}
			}, DEFAULT_TOGGLE_CONFIG.debounceDelay);
		});
	};
};
