import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { ApiResponse } from '@/schemas/_common';

// Type definitions for Zustand store functions - using any to match Zustand's actual types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZustandSetter = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZustandGetter = any;

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
		let errorTitle = 'Error';
		switch (result.error.statusCode) {
			case 400:
				errorTitle = 'Validation Error';
				break;
			case 409:
				errorTitle = 'Conflict Error';
				break;
			case 422:
				errorTitle = 'Invalid Data';
				break;
			default:
				errorTitle = `Error ${result.error.statusCode}`;
		}
		showNotification.error(errorTitle, result.error.message);
	}
};

// Generic batch create action
export function createBatchCreateAction<T extends { id: string }, TCreate>(
	service: { createMany: (data: TCreate[]) => Promise<ApiResponse<T[]>> },
	entityName: string,
) {
	return (set: ZustandSetter, get: ZustandGetter) =>
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
				const apiError = handleApiError(
					error,
					`Failed to create ${entityName}s`,
				);
				const errorState = createErrorState(apiError);
				set({ lastError: errorState });
				showNotification.error('Error', apiError.message);
				return false;
			} finally {
				set({ [loadingField]: false });
			}
			return false;
		};
}

// Generic fetch action
export function createFetchAction<T extends { id: string }>(
	service: { findAll: () => Promise<ApiResponse<T[]>> },
	entityName: string,
) {
	return (set: ZustandSetter, get: ZustandGetter) => async () => {
		set({ loading: true, lastError: null });
		try {
			const response = await service.findAll();
			const result = handleApiResponse(response);
			if (result.success && result.data) {
				set({
					[`${entityName}s`]: result.data,
					[`filtered${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`]:
						result.data,
				});
				const currentState = get();
				const filterFunction =
					currentState[
						`filter${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`
					];
				if (typeof filterFunction === 'function') {
					filterFunction();
				}
			} else if (result.error) {
				const error = createErrorState(result.error);
				set({ lastError: error });
				showNotification.error('Error', result.error.message);
			}
		} catch (error) {
			const apiError = handleApiError(error, `Failed to fetch ${entityName}s`);
			const errorState = createErrorState(apiError);
			set({ lastError: errorState });
			showNotification.error('Error', apiError.message);
		} finally {
			set({ loading: false });
		}
	};
}

// Generic create action
export function createCreateAction<T extends { id: string }, TCreate>(
	service: { create: (data: TCreate) => Promise<ApiResponse<T>> },
	entityName: string,
) {
	return (set: ZustandSetter, get: ZustandGetter) =>
		async (data: TCreate): Promise<boolean> => {
			set({ creating: true, lastError: null });
			try {
				const response = await service.create(data);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} created successfully`,
				);
				if (result.success && result.data) {
					// Add to items array
					set((state: Record<string, unknown>) => ({
						...state,
						[`${entityName}s`]: [
							...(state[`${entityName}s`] as T[]),
							result.data!,
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
				const apiError = handleApiError(
					error,
					`Failed to create ${entityName}`,
				);
				const errorState = createErrorState(apiError);
				set({ lastError: errorState });
				showNotification.error('Error', apiError.message);
				return false;
			} finally {
				set({ creating: false });
			}
			return false;
		};
}

// Generic update action
export function createUpdateAction<T extends { id: string }, TUpdate>(
	service: { update: (id: string, data: TUpdate) => Promise<ApiResponse<T>> },
	entityName: string,
) {
	return (set: ZustandSetter, get: ZustandGetter) =>
		async (id: string, data: TUpdate): Promise<boolean> => {
			set({ updating: true, lastError: null });
			try {
				const response = await service.update(id, data);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} updated successfully`,
				);
				if (result.success && result.data) {
					// Update item in array
					set((state: Record<string, unknown>) => ({
						...state,
						[`${entityName}s`]: (state[`${entityName}s`] as T[]).map(
							(item: T) => (item.id === id ? result.data! : item),
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
					return true;
				} else if (result.error) {
					const error = createErrorState(result.error);
					set({ lastError: error });
					showNotification.error('Error', result.error.message);
					return false;
				}
			} catch (error) {
				const apiError = handleApiError(
					error,
					`Failed to update ${entityName}`,
				);
				const errorState = createErrorState(apiError);
				set({ lastError: errorState });
				showNotification.error('Error', apiError.message);
				return false;
			} finally {
				set({ updating: false });
			}
			return false;
		};
}

// Generic delete action
export function createDeleteAction<T extends { id: string }>(
	service: { delete: (id: string) => Promise<ApiResponse<void>> },
	entityName: string,
) {
	return (set: ZustandSetter, get: ZustandGetter) =>
		async (id: string): Promise<boolean> => {
			set({ deleting: true, lastError: null });
			try {
				const response = await service.delete(id);
				const result = handleApiResponse(
					response,
					`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} deleted successfully`,
				);
				if (result.success) {
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
					return true;
				} else if (result.error) {
					const error = createErrorState(result.error);
					set({ lastError: error });
					showNotification.error('Error', result.error.message);
					return false;
				}
			} catch (error) {
				const apiError = handleApiError(
					error,
					`Failed to delete ${entityName}`,
				);
				const errorState = createErrorState(apiError);
				set({ lastError: errorState });
				showNotification.error('Error', apiError.message);
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

// Common store utilities
export const commonStoreUtilities = {
	clearError: () => ({ lastError: null }),
	createSetSearchText:
		(filterFunctionName: string) =>
		(set: ZustandSetter, get: ZustandGetter) =>
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
		(set: ZustandSetter, get: ZustandGetter) =>
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
		(get: ZustandGetter) =>
		(id: string): T | undefined => {
			const currentState = get();
			const items = currentState[`${entityName}s`] as T[];
			return items?.find((item: T) => item.id === id);
		},
};
