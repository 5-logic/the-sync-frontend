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

/**
 * Creates a reusable toggle function for lecturer status
 */
export const createLecturerStatusToggleFunction = (
	getState: () => {
		lecturers: Lecturer[];
		_lecturerStatusLoadingStates: Map<string, boolean>;
		_toggleStatusOperations: Map<string, ToggleOperationData>;
		_backgroundRefreshRunning: boolean;
		_lastBackgroundRefresh: number;
	},
	setState: (state: {
		lecturers?: Lecturer[];
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
			state._lecturerStatusLoadingStates,
			state._toggleStatusOperations,
		);

		if (!shouldProceed) {
			return true;
		}

		// Optimistic update FIRST
		const targetLecturer = performOptimisticUpdate(
			id,
			{ isActive: data.isActive },
			state.lecturers,
			(lecturers) => setState({ lecturers }),
			applyFilters,
		);

		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				try {
					if (controller.signal.aborted) {
						resolve(true);
						return;
					}

					const currentState = getState();
					const latestOp = currentState._toggleStatusOperations.get(id);
					if (latestOp !== operationData) {
						resolve(true);
						return;
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
						resolve(false);
						return;
					}

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
					const currentState = getState();
					cleanupToggleOperation(
						id,
						currentState._toggleStatusOperations,
						currentState._lecturerStatusLoadingStates,
					);

					if (controller.signal.aborted) {
						resolve(true);
						return;
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

					resolve(false);
				}
			}, DEFAULT_TOGGLE_CONFIG.debounceDelay);
		});
	};
};

/**
 * Creates a reusable toggle function for lecturer moderator role
 */
export const createLecturerModeratorToggleFunction = (
	getState: () => {
		lecturers: Lecturer[];
		_lecturerModeratorLoadingStates: Map<string, boolean>;
		_toggleModeratorOperations: Map<string, ToggleOperationData>;
		_backgroundRefreshRunning: boolean;
		_lastBackgroundRefresh: number;
	},
	setState: (state: {
		lecturers?: Lecturer[];
		_backgroundRefreshRunning?: boolean;
		_lastBackgroundRefresh?: number;
		loading?: boolean;
	}) => void,
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
		const targetLecturer = performOptimisticUpdate(
			id,
			{ isModerator: data.isModerator },
			state.lecturers,
			(lecturers) => setState({ lecturers }),
			applyFilters,
		);

		return new Promise<boolean>((resolve) => {
			setTimeout(async () => {
				try {
					if (controller.signal.aborted) {
						resolve(true);
						return;
					}

					const currentState = getState();
					const latestOp = currentState._toggleModeratorOperations.get(id);
					if (latestOp !== operationData) {
						resolve(true);
						return;
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
						resolve(false);
						return;
					}

					const roleText = data.isModerator
						? 'granted moderator access'
						: 'removed moderator access';
					showNotification.success(
						'Role Updated',
						`Lecturer ${roleText} successfully`,
					);

					setTimeout(
						createBackgroundRefreshHandler(
							controller,
							() => lecturerService.findAll(),
							(lecturers) => setState({ lecturers }),
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
					const currentState = getState();
					cleanupToggleOperation(
						id,
						currentState._toggleModeratorOperations,
						currentState._lecturerModeratorLoadingStates,
					);

					if (controller.signal.aborted) {
						resolve(true);
						return;
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

					resolve(false);
				}
			}, DEFAULT_TOGGLE_CONFIG.debounceDelay);
		});
	};
};
