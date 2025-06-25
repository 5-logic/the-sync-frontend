/**
 * Shared utilities for toggle operations across stores
 * Eliminates code duplication and ensures consistency
 */

export interface ToggleOperationData {
	controller: AbortController;
	timestamp: number;
	pendingValue: boolean;
}

export interface BackgroundRefreshConfig {
	refreshCooldown: number;
	debounceDelay: number;
	backgroundRefreshDelay: number;
}

export const DEFAULT_TOGGLE_CONFIG: BackgroundRefreshConfig = {
	refreshCooldown: 2000, // 2 seconds minimum between refreshes
	debounceDelay: 300, // 300ms debounce
	backgroundRefreshDelay: 500, // 500ms delay before background refresh
};

/**
 * Generic function to handle background refresh logic
 */
export const createBackgroundRefreshHandler = <T>(
	controller: AbortController,
	refreshService: () => Promise<{ success: boolean; data?: T[] }>,
	updateStore: (data: T[]) => void,
	getState: () => {
		_backgroundRefreshRunning: boolean;
		_lastBackgroundRefresh: number;
	},
	setState: (state: {
		_backgroundRefreshRunning: boolean;
		_lastBackgroundRefresh?: number;
		loading?: boolean;
	}) => void,
	config: BackgroundRefreshConfig = DEFAULT_TOGGLE_CONFIG,
) => {
	return async () => {
		try {
			if (!controller.signal.aborted) {
				const currentState = getState();
				const now = Date.now();

				// Enhanced check: running OR recent refresh
				if (currentState._backgroundRefreshRunning) {
					return;
				}

				if (
					now - currentState._lastBackgroundRefresh <
					config.refreshCooldown
				) {
					return;
				}

				// Set flag AND timestamp IMMEDIATELY to prevent race conditions
				setState({
					_backgroundRefreshRunning: true,
					_lastBackgroundRefresh: now,
				});

				const freshResponse = await refreshService();
				if (freshResponse.success && freshResponse.data) {
					// Update store quietly WITHOUT setting loading: true
					updateStore(freshResponse.data);
					setState({
						_backgroundRefreshRunning: false,
						loading: false,
					});
				} else {
					// Clear flag on failure too
					setState({ _backgroundRefreshRunning: false });
				}
			}
		} catch {
			// Clear flag on background refresh error
			setState({ _backgroundRefreshRunning: false });
		}
	};
};

/**
 * Generic function to handle toggle operation setup
 */
export const setupToggleOperation = (
	id: string,
	pendingValue: boolean,
	loadingStates: Map<string, boolean>,
	operations: Map<string, ToggleOperationData>,
	config: BackgroundRefreshConfig = DEFAULT_TOGGLE_CONFIG,
): {
	controller: AbortController;
	operationData: ToggleOperationData;
	shouldProceed: boolean;
} => {
	// Check if this entity is already being processed
	if (loadingStates.get(id)) {
		return {
			controller: new AbortController(),
			operationData: {} as ToggleOperationData,
			shouldProceed: false,
		};
	}

	const currentTime = Date.now();

	// Set loading state immediately to prevent spam
	loadingStates.set(id, true);

	// Check for existing operation
	const existingOp = operations.get(id);
	if (existingOp) {
		const timeDiff = currentTime - existingOp.timestamp;

		// If recent operation (within debounce window), cancel it first
		if (timeDiff < config.debounceDelay) {
			existingOp.controller.abort();
			operations.delete(id);
		}
	}

	// Create new abort controller for this operation
	const controller = new AbortController();
	const operationData: ToggleOperationData = {
		controller,
		timestamp: currentTime,
		pendingValue,
	};
	operations.set(id, operationData);

	return {
		controller,
		operationData,
		shouldProceed: true,
	};
};

/**
 * Generic function to handle optimistic update
 */
export const performOptimisticUpdate = <T extends { id: string }>(
	id: string,
	updateData: Partial<T>,
	currentItems: T[],
	updateStore: (items: T[]) => void,
	applyFilters: () => void,
): T | undefined => {
	const targetItem = currentItems.find((item) => item.id === id);

	if (targetItem) {
		const updatedItems = currentItems.map((item) =>
			item.id === id ? { ...item, ...updateData } : item,
		);

		// Update UI immediately - no loading delay for user
		updateStore(updatedItems);
		applyFilters(); // Re-apply filters with updated data
	}

	return targetItem;
};

/**
 * Generic function to revert optimistic update
 */
export const revertOptimisticUpdate = <T extends { id: string }>(
	id: string,
	originalItem: T,
	currentItems: T[],
	updateStore: (items: T[]) => void,
	applyFilters: () => void,
) => {
	const revertedItems = currentItems.map((item) =>
		item.id === id ? originalItem : item,
	);
	updateStore(revertedItems);
	applyFilters();
};

/**
 * Generic function to clean up toggle operation
 */
export const cleanupToggleOperation = (
	id: string,
	operations: Map<string, ToggleOperationData>,
	loadingStates: Map<string, boolean>,
) => {
	operations.delete(id);
	loadingStates.set(id, false);
};
