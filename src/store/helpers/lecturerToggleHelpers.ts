import lecturerService from '@/lib/services/lecturers.service';
import { showNotification } from '@/lib/utils/notification';
import { Lecturer } from '@/schemas/lecturer';
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
interface LecturerToggleState {
	lecturers: Lecturer[];
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;
}

interface LecturerStatusState extends LecturerToggleState {
	_lecturerStatusLoadingStates: Map<string, boolean>;
	_toggleStatusOperations: Map<string, ToggleOperationData>;
}

interface LecturerModeratorState extends LecturerToggleState {
	_lecturerModeratorLoadingStates: Map<string, boolean>;
	_toggleModeratorOperations: Map<string, ToggleOperationData>;
}

// Use function type instead of interface for setState (SonarCloud S6598)
type SetStateFunction = (state: {
	lecturers?: Lecturer[];
	_backgroundRefreshRunning?: boolean;
	_lastBackgroundRefresh?: number;
	loading?: boolean;
}) => void;

// Group parameters into an object to avoid too many parameters (SonarCloud S107)
type StatusToggleParams = {
	id: string;
	data: { isActive: boolean };
	operationData: ToggleOperationData;
	controller: AbortController;
	targetLecturer: Lecturer | null;
	getState: () => LecturerStatusState;
	setState: SetStateFunction;
	applyFilters: () => void;
};

type ModeratorToggleParams = {
	id: string;
	data: { isModerator: boolean };
	operationData: ToggleOperationData;
	controller: AbortController;
	targetLecturer: Lecturer | null;
	getState: () => LecturerModeratorState;
	setState: SetStateFunction;
	applyFilters: () => void;
};

// Extracted helper functions to reduce nesting
const handleStatusToggleSuccess = (
	data: { isActive: boolean },
	currentState: LecturerStatusState,
	setState: SetStateFunction,
	controller: AbortController,
) => {
	const statusText = data.isActive ? 'activated' : 'deactivated';
	showNotification.success(
		'Status Updated',
		`Lecturer status ${statusText} successfully`,
	);

	setTimeout(
		createBackgroundRefreshHandler(
			controller,
			() => lecturerService.findAll(),
			(lecturers) => setState({ lecturers }),
			() => ({
				_backgroundRefreshRunning: currentState._backgroundRefreshRunning,
				_lastBackgroundRefresh: currentState._lastBackgroundRefresh,
			}),
			setState,
		),
		DEFAULT_TOGGLE_CONFIG.backgroundRefreshDelay,
	);
};

const handleModeratorToggleSuccess = (
	data: { isModerator: boolean },
	currentState: LecturerModeratorState,
	setState: SetStateFunction,
	controller: AbortController,
) => {
	const roleText = data.isModerator
		? 'granted moderator access'
		: 'removed moderator access';
	showNotification.success('Role Updated', `Lecturer ${roleText} successfully`);

	setTimeout(
		createBackgroundRefreshHandler(
			controller,
			() => lecturerService.findAll(),
			(lecturers) => setState({ lecturers }),
			() => ({
				_backgroundRefreshRunning: currentState._backgroundRefreshRunning,
				_lastBackgroundRefresh: currentState._lastBackgroundRefresh,
			}),
			setState,
		),
		DEFAULT_TOGGLE_CONFIG.backgroundRefreshDelay,
	);
};

const performStatusToggleRequest = async (
	params: StatusToggleParams,
): Promise<boolean> => {
	const {
		id,
		data,
		operationData,
		controller,
		targetLecturer,
		getState,
		setState,
		applyFilters,
	} = params;
	if (controller.signal.aborted) {
		return true;
	}

	const currentState = getState();
	const latestOp = currentState._toggleStatusOperations.get(id);
	if (latestOp !== operationData) {
		return true;
	}

	const response = await lecturerService.toggleStatus(id, data);

	cleanupToggleOperation(
		id,
		currentState._toggleStatusOperations,
		currentState._lecturerStatusLoadingStates,
	);

	if (!response.success && targetLecturer) {
		revertOptimisticUpdate(
			id,
			targetLecturer,
			currentState.lecturers,
			(lecturers) => setState({ lecturers }),
			applyFilters,
		);
		return false;
	}

	handleStatusToggleSuccess(data, currentState, setState, controller);
	return true;
};

const performModeratorToggleRequest = async (
	params: ModeratorToggleParams,
): Promise<boolean> => {
	const {
		id,
		data,
		operationData,
		controller,
		targetLecturer,
		getState,
		setState,
		applyFilters,
	} = params;
	if (controller.signal.aborted) {
		return true;
	}

	const currentState = getState();
	const latestOp = currentState._toggleModeratorOperations.get(id);
	if (latestOp !== operationData) {
		return true;
	}

	const response = await lecturerService.toggleStatus(id, data);

	cleanupToggleOperation(
		id,
		currentState._toggleModeratorOperations,
		currentState._lecturerModeratorLoadingStates,
	);

	if (!response.success && targetLecturer) {
		revertOptimisticUpdate(
			id,
			targetLecturer,
			currentState.lecturers,
			(lecturers) => setState({ lecturers }),
			applyFilters,
		);
		return false;
	}

	handleModeratorToggleSuccess(data, currentState, setState, controller);
	return true;
};

const handleToggleError = (
	id: string,
	controller: AbortController,
	targetLecturer: Lecturer | null,
	getState: () => LecturerStatusState | LecturerModeratorState,
	setState: SetStateFunction,
	applyFilters: () => void,
	isStatusToggle: boolean,
): boolean => {
	const currentState = getState();

	if (isStatusToggle) {
		const statusState = currentState as LecturerStatusState;
		cleanupToggleOperation(
			id,
			statusState._toggleStatusOperations,
			statusState._lecturerStatusLoadingStates,
		);
	} else {
		const moderatorState = currentState as LecturerModeratorState;
		cleanupToggleOperation(
			id,
			moderatorState._toggleModeratorOperations,
			moderatorState._lecturerModeratorLoadingStates,
		);
	}

	if (controller.signal.aborted) {
		return true;
	}

	if (targetLecturer) {
		revertOptimisticUpdate(
			id,
			targetLecturer,
			currentState.lecturers,
			(lecturers) => setState({ lecturers }),
			applyFilters,
		);
	}

	return false;
};

/**
 * Creates a reusable toggle function for lecturer status
 */
export const createLecturerStatusToggleFunction = (
	getState: () => LecturerStatusState,
	setState: SetStateFunction,
	applyFilters: () => void,
) => {
	return async (id: string, data: { isActive: boolean }): Promise<boolean> => {
		const state = getState();
		const { controller, operationData, shouldProceed } = setupToggleOperation(
			id,
			data.isActive,
			state._lecturerStatusLoadingStates,
			state._toggleStatusOperations,
		);

		if (!shouldProceed) {
			return true;
		}

		// Optimistic update FIRST
		const targetLecturer =
			performOptimisticUpdate(
				id,
				{ isActive: data.isActive },
				state.lecturers,
				(lecturers) => setState({ lecturers }),
				applyFilters,
			) ?? null;

		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				try {
					const result = await performStatusToggleRequest({
						id,
						data,
						operationData,
						controller,
						targetLecturer,
						getState,
						setState,
						applyFilters,
					});
					resolve(result);
				} catch {
					const errorResult = handleToggleError(
						id,
						controller,
						targetLecturer,
						getState,
						setState,
						applyFilters,
						true, // isStatusToggle
					);
					resolve(errorResult);
				}
			}, DEFAULT_TOGGLE_CONFIG.debounceDelay);
		});
	};
};

/**
 * Creates a reusable toggle function for lecturer moderator role
 */
export const createLecturerModeratorToggleFunction = (
	getState: () => LecturerModeratorState,
	setState: SetStateFunction,
	applyFilters: () => void,
) => {
	return async (
		id: string,
		data: { isModerator: boolean },
	): Promise<boolean> => {
		const state = getState();
		const { controller, operationData, shouldProceed } = setupToggleOperation(
			id,
			data.isModerator,
			state._lecturerModeratorLoadingStates,
			state._toggleModeratorOperations,
		);

		if (!shouldProceed) {
			return true;
		}

		// Optimistic update FIRST
		const targetLecturer =
			performOptimisticUpdate(
				id,
				{ isModerator: data.isModerator },
				state.lecturers,
				(lecturers) => setState({ lecturers }),
				applyFilters,
			) ?? null;

		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				try {
					const result = await performModeratorToggleRequest({
						id,
						data,
						operationData,
						controller,
						targetLecturer,
						getState,
						setState,
						applyFilters,
					});
					resolve(result);
				} catch {
					const errorResult = handleToggleError(
						id,
						controller,
						targetLecturer,
						getState,
						setState,
						applyFilters,
						false, // isStatusToggle
					);
					resolve(errorResult);
				}
			}, DEFAULT_TOGGLE_CONFIG.debounceDelay);
		});
	};
};
