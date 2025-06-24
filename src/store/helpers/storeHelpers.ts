import type { StoreApi } from 'zustand';

import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { ApiResponse } from '@/schemas/_common';

// Error handling utilities
export const createErrorState = (error: {
	message: string;
	statusCode: number;
}) => ({
	message: error.message,
	statusCode: error.statusCode,
	timestamp: new Date(),
});

export const handleCreateError = (result: {
	success: boolean;
	error?: { message: string; statusCode: number };
}): void => {
	if (result.error) {
		const getErrorTitle = (statusCode: number): string => {
			switch (statusCode) {
				case 400:
					return 'Validation Error';
				case 409:
					return 'Conflict Error';
				case 422:
					return 'Invalid Data';
				default:
					return `Error ${statusCode}`;
			}
		};

		showNotification.error(
			getErrorTitle(result.error.statusCode),
			result.error.message,
		);
	}
};

// Helper function to handle API errors in actions
function handleActionError(
	error: unknown,
	entityName: string,
	operation: string,
	set: StoreApi<Record<string, unknown>>['setState'],
): void {
	const apiError = handleApiError(
		error,
		`Failed to ${operation} ${entityName}`,
	);
	const errorState = createErrorState(apiError);
	set({ lastError: errorState });
	showNotification.error('Error', apiError.message);
}

// Helper function to handle API result errors
function handleResultError(
	error: { message: string; statusCode: number },
	set: StoreApi<Record<string, unknown>>['setState'],
): void {
	const errorState = createErrorState(error);
	set({ lastError: errorState });
	showNotification.error('Error', error.message);
}

// Generic batch create action
export function createBatchCreateAction<T extends { id: string }, TCreate>(
	service: { createMany: (data: TCreate[]) => Promise<ApiResponse<T[]>> },
	entityName: string,
) {
	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (data: TCreate[]): Promise<boolean> => {
			const loadingField =
				entityName === 'student'
					? 'creatingMany'
					: `creating${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`;
			set({ [loadingField]: true, lastError: null });
			try {
				const response = await service.createMany(data);
				const result = handleApiResponse(
					response,
					`${data.length} ${entityName}s created successfully`,
				);
				if (result.success && result.data) {
					// Add all new items to the array
					set((state: Record<string, unknown>) => ({
						...state,
						[`${entityName}s`]: [
							...(state[`${entityName}s`] as T[]),
							...result.data!,
						],
					}));

					// Update filtered items
					const currentState = get();
					const filterFunction =
						currentState[
							`filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`
						];
					if (typeof filterFunction === 'function') {
						filterFunction();
					}
					return true;
				} else if (result.error) {
					const error = createErrorState(result.error);
					set({ lastError: error });
					handleCreateError(result);
					return false;
				}
			} catch (error) {
				handleActionError(error, `${entityName}s`, 'create', set);
				return false;
			} finally {
				set({ [loadingField]: false });
			}
			return false;
		};
}

// Helper function to handle successful fetch
function handleFetchSuccess<T extends { id: string }>(
	data: T[],
	entityName: string,
	set: StoreApi<Record<string, unknown>>['setState'],
	get: StoreApi<Record<string, unknown>>['getState'],
): void {
	set({
		[`${entityName}s`]: data,
		[`filtered${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`]:
			data,
	});

	const currentState = get();
	const filterFunction =
		currentState[
			`filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`
		];
	if (typeof filterFunction === 'function') {
		filterFunction();
	}
}

// Generic fetch action
export function createFetchAction<T extends { id: string }>(
	service: { findAll: () => Promise<ApiResponse<T[]>> },
	entityName: string,
) {
	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async () => {
			set({ loading: true, lastError: null });
			try {
				const response = await service.findAll();
				const result = handleApiResponse(response);
				if (result.success && result.data) {
					handleFetchSuccess(result.data, entityName, set, get);
					return;
				}

				if (result.error) {
					handleResultError(result.error, set);
				}
			} catch (error) {
				handleActionError(error, `${entityName}s`, 'fetch', set);
			} finally {
				set({ loading: false });
			}
		};
}

// Helper function to handle successful create
function handleCreateSuccess<T extends { id: string }>(
	data: T,
	entityName: string,
	set: StoreApi<Record<string, unknown>>['setState'],
	get: StoreApi<Record<string, unknown>>['getState'],
): void {
	// Add to items array
	set((state: Record<string, unknown>) => ({
		...state,
		[`${entityName}s`]: [...(state[`${entityName}s`] as T[]), data],
	}));

	// Update filtered items
	const currentState = get();
	const filterFunction =
		currentState[
			`filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`
		];
	if (typeof filterFunction === 'function') {
		filterFunction();
	}
}

// Generic create action
export function createCreateAction<T extends { id: string }, TCreate>(
	service: { create: (data: TCreate) => Promise<ApiResponse<T>> },
	entityName: string,
) {
	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (data: TCreate): Promise<boolean> => {
			set({ creating: true, lastError: null });
			try {
				const response = await service.create(data);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} created successfully`,
				);
				if (result.success && result.data) {
					handleCreateSuccess(result.data, entityName, set, get);
					return true;
				}

				if (result.error) {
					const error = createErrorState(result.error);
					set({ lastError: error });
					handleCreateError(result);
					return false;
				}
			} catch (error) {
				handleActionError(error, entityName, 'create', set);
				return false;
			} finally {
				set({ creating: false });
			}
			return false;
		};
}

// Helper function to handle successful update
function handleUpdateSuccess<T extends { id: string }>(
	data: T,
	id: string,
	entityName: string,
	set: StoreApi<Record<string, unknown>>['setState'],
	get: StoreApi<Record<string, unknown>>['getState'],
): void {
	// Update item in array
	set((state: Record<string, unknown>) => ({
		...state,
		[`${entityName}s`]: (state[`${entityName}s`] as T[]).map((item: T) =>
			item.id === id ? data : item,
		),
	}));

	// Update filtered items
	const currentState = get();
	const filterFunction =
		currentState[
			`filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`
		];
	if (typeof filterFunction === 'function') {
		filterFunction();
	}
}

// Generic update action
export function createUpdateAction<T extends { id: string }, TUpdate>(
	service: { update: (id: string, data: TUpdate) => Promise<ApiResponse<T>> },
	entityName: string,
) {
	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (id: string, data: TUpdate): Promise<boolean> => {
			set({ updating: true, lastError: null });
			try {
				const response = await service.update(id, data);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} updated successfully`,
				);
				if (result.success && result.data) {
					handleUpdateSuccess(result.data, id, entityName, set, get);
					return true;
				}

				if (result.error) {
					handleResultError(result.error, set);
					return false;
				}
			} catch (error) {
				handleActionError(error, entityName, 'update', set);
				return false;
			} finally {
				set({ updating: false });
			}
			return false;
		};
}

// Helper function to handle successful delete
function handleDeleteSuccess<T extends { id: string }>(
	id: string,
	entityName: string,
	set: StoreApi<Record<string, unknown>>['setState'],
	get: StoreApi<Record<string, unknown>>['getState'],
): void {
	// Remove from items array
	set((state: Record<string, unknown>) => ({
		...state,
		[`${entityName}s`]: (state[`${entityName}s`] as T[]).filter(
			(item: T) => item.id !== id,
		),
	}));

	// Update filtered items
	const currentState = get();
	const filterFunction =
		currentState[
			`filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`
		];
	if (typeof filterFunction === 'function') {
		filterFunction();
	}
}

// Generic delete action
export function createDeleteAction<T extends { id: string }>(
	service: { delete: (id: string) => Promise<ApiResponse<void>> },
	entityName: string,
) {
	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (id: string): Promise<boolean> => {
			set({ deleting: true, lastError: null });
			try {
				const response = await service.delete(id);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} deleted successfully`,
				);
				if (result.success) {
					handleDeleteSuccess<T>(id, entityName, set, get);
					return true;
				}

				if (result.error) {
					handleResultError(result.error, set);
					return false;
				}
			} catch (error) {
				handleActionError(error, entityName, 'delete', set);
				return false;
			} finally {
				set({ deleting: false });
			}
			return false;
		};
}

// Common filter utility
export function createSearchFilter<T>(
	searchFields: (item: T) => (string | undefined)[],
) {
	return (items: T[], searchText: string): T[] => {
		if (!searchText) return items;

		const lowercaseSearch = searchText.toLowerCase();
		return items.filter((item) =>
			searchFields(item).some((field) =>
				field?.toLowerCase().includes(lowercaseSearch),
			),
		);
	};
}

// Generic toggle status action
export function createToggleStatusAction<T extends { id: string }, TToggle>(
	service: {
		toggleStatus: (id: string, data: TToggle) => Promise<ApiResponse<T>>;
	},
	entityName: string,
) {
	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (id: string, data: TToggle): Promise<boolean> => {
			const loadingField = 'togglingStatus';
			set({ [loadingField]: true, lastError: null });
			try {
				const response = await service.toggleStatus(id, data);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} status updated successfully`,
				);
				if (result.success && result.data) {
					handleUpdateSuccess(result.data, id, entityName, set, get);
					return true;
				}

				if (result.error) {
					handleResultError(result.error, set);
					return false;
				}
			} catch (error) {
				handleActionError(error, entityName, 'toggle status', set);
				return false;
			} finally {
				set({ [loadingField]: false });
			}
			return false;
		};
}

export const commonStoreUtilities = {
	clearError: () => ({ lastError: null }),
	createSetSearchText:
		(filterFunctionName: string) =>
		(
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		(text: string) => {
			set({ searchText: text });
			const currentState = get();
			const filterFunction = currentState[filterFunctionName];
			if (typeof filterFunction === 'function') {
				filterFunction();
			}
		},
	createFieldSetter:
		(fieldName: string, filterFunctionName: string) =>
		(
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		(value: unknown) => {
			set({ [fieldName]: value });
			const currentState = get();
			const filterFunction = currentState[filterFunctionName];
			if (typeof filterFunction === 'function') {
				filterFunction();
			}
		},
	createReset:
		(entityName: string, customFields?: Record<string, unknown>) => () => {
			const baseReset: Record<string, unknown> = {
				[`${entityName}s`]: [],
				[`filtered${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`]:
					[],
				loading: false,
				creating: false,
				updating: false,
				deleting: false,
				togglingStatus: false,
				lastError: null,
				searchText: '',
			};

			// Add creatingMany for student stores
			if (entityName === 'student') {
				baseReset.creatingMany = false;
			}

			return {
				...baseReset,
				...customFields,
			};
		},
	createGetById:
		<T extends { id: string }>(entityName: string) =>
		(get: StoreApi<Record<string, unknown>>['getState']) =>
		(id: string): T | undefined => {
			const currentState = get();
			const items = currentState[`${entityName}s`] as T[];
			return items?.find((item: T) => item.id === id);
		},
};
