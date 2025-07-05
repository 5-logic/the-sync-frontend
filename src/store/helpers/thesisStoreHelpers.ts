import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { cacheInvalidation, cacheUtils } from '@/store/helpers/cacheHelpers';
import { createSearchFilter } from '@/store/helpers/storeHelpers';

// Generic error state
export interface ErrorState {
	message: string;
	statusCode: number;
	timestamp: Date;
}

// Generic loading states
export interface LoadingStates {
	loading: boolean;
	refreshing: boolean;
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;
}

// Generic cache utilities
export interface CacheUtilities {
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};
}

// Base thesis store configuration
export interface ThesisStoreConfig<T, F = Record<string, unknown>> {
	entityName: string;
	fetchFn: () => Promise<T[]>;
	searchFields?: (item: T) => string[];
	filterFn?: (items: T[], filters: F) => T[];
	sortFn?: (items: T[]) => T[];
	cacheTTL?: number;
	maxCacheSize?: number;
	enableLocalStorage?: boolean;
}

// Base thesis store state
export interface BaseThesisStoreState<T, F = Record<string, unknown>> {
	// Core data
	items: T[];
	filteredItems: T[];

	// Loading states
	loading: boolean;
	refreshing: boolean;
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;

	// Error state
	lastError: ErrorState | null;

	// Filters (generic)
	filters: F;

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Core actions
	fetchItems: (force?: boolean) => Promise<void>;
	setFilters: (filters: Partial<F>) => void;
	filterItems: () => void;
	clearError: () => void;
	reset: () => void;
	getItemById: (id: string) => T | undefined;
	[key: string]: unknown;
}

// Default sort function (by createdAt desc if available)
const defaultSortFn = <T extends Record<string, unknown>>(items: T[]): T[] => {
	return [...items].sort((a, b) => {
		const aDate = (a as unknown as { createdAt?: string | number | Date })
			.createdAt;
		const bDate = (b as unknown as { createdAt?: string | number | Date })
			.createdAt;
		if (
			aDate &&
			bDate &&
			(typeof aDate === 'string' ||
				typeof aDate === 'number' ||
				aDate instanceof Date) &&
			(typeof bDate === 'string' ||
				typeof bDate === 'number' ||
				bDate instanceof Date)
		) {
			return new Date(bDate).getTime() - new Date(aDate).getTime();
		}
		return 0;
	});
};

// Create thesis store factory
export const createThesisStoreFactory = <
	T extends Record<string, unknown>,
	F = Record<string, unknown>,
>(
	config: ThesisStoreConfig<T, F>,
) => {
	const {
		entityName,
		fetchFn,
		searchFields,
		filterFn,
		sortFn = defaultSortFn,
		cacheTTL = 5 * 60 * 1000, // 5 minutes default
		maxCacheSize = 1000,
		enableLocalStorage = false,
	} = config;

	// Initialize cache
	cacheUtils.initCache<T[]>(entityName, {
		ttl: cacheTTL,
		maxSize: maxCacheSize,
		enableLocalStorage,
	});

	// Create search filter if searchFields provided
	const searchFilter = searchFields
		? createSearchFilter<T>(searchFields)
		: null;

	return create<BaseThesisStoreState<T, F>>()(
		devtools(
			(set, get) => ({
				// Initial state
				items: [],
				filteredItems: [],
				loading: false,
				refreshing: false,
				_backgroundRefreshRunning: false,
				_lastBackgroundRefresh: 0,
				lastError: null,
				filters: {} as F,

				// Cache utilities
				cache: {
					clear: () => cacheInvalidation.invalidateEntity(entityName),
					stats: () => cacheUtils.getStats(entityName),
					invalidate: () => cacheInvalidation.invalidateEntity(entityName),
				},

				// Fetch items with caching
				fetchItems: async (force = false) => {
					const cacheKey = 'all';

					// Try to get from cache first
					if (!force) {
						const cachedData = cacheUtils.get<T[]>(entityName, cacheKey);
						if (cachedData) {
							const sortedData = sortFn(cachedData);
							set({
								items: sortedData,
								filteredItems: sortedData,
							});
							get().filterItems();
							return;
						}
					}

					// Check if we should fetch
					if (!cacheUtils.shouldFetch(entityName, force)) {
						return;
					}

					set((state) => ({
						loading: !force && state.items.length === 0,
						refreshing: force,
						lastError: null,
					}));

					try {
						const response = await fetchFn();

						// Sort data
						const sortedData = sortFn(response);

						// Cache the sorted data
						cacheUtils.set(entityName, cacheKey, sortedData);

						set({
							items: sortedData,
							filteredItems: sortedData,
							loading: false,
							refreshing: false,
						});

						// Apply filters
						get().filterItems();
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: `Failed to fetch ${entityName}`;

						set({
							lastError: {
								message: errorMessage,
								statusCode: 500,
								timestamp: new Date(),
							},
							loading: false,
							refreshing: false,
						});
					}
				},

				// Set filters
				setFilters: (newFilters: Partial<F>) => {
					set((state) => ({
						filters: { ...state.filters, ...newFilters },
					}));
					get().filterItems();
				},

				// Filter items
				filterItems: () => {
					const { items, filters } = get();

					let filtered = items;

					// Apply custom filter function if provided
					if (filterFn) {
						filtered = filterFn(filtered, filters);
					}

					// Apply search filter if available and search text exists
					if (
						searchFilter &&
						filters &&
						typeof filters === 'object' &&
						'searchText' in filters
					) {
						const searchText = (filters as { searchText?: string }).searchText;
						if (
							searchText &&
							typeof searchText === 'string' &&
							searchText.trim()
						) {
							filtered = searchFilter(filtered, searchText.trim());
						}
					}

					set({ filteredItems: filtered });
				},

				// Clear error
				clearError: () => set({ lastError: null }),

				// Reset store
				reset: () => {
					set({
						items: [],
						filteredItems: [],
						loading: false,
						refreshing: false,
						lastError: null,
						filters: {} as F,
					});
					cacheInvalidation.invalidateEntity(entityName);
				},

				// Get item by ID
				getItemById: (id: string) => {
					return get().items.find((item: T) => item.id === id);
				},
			}),
			{
				name: `${entityName}-store`,
			},
		),
	);
};

// Type helper for thesis store actions
export type ThesisStoreActions<T, F> = {
	fetchItems: (force?: boolean) => Promise<void>;
	setFilters: (filters: Partial<F>) => void;
	filterItems: () => void;
	clearError: () => void;
	reset: () => void;
	getItemById: (id: string) => T | undefined;
};

// Type helper for extending base store
export type ExtendThesisStore<T, F, A = unknown> = BaseThesisStoreState<T, F> &
	A;
