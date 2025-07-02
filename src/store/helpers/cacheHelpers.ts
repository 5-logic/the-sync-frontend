import type { StoreApi } from 'zustand';

import { handleApiResponse } from '@/lib/utils/handleApi';
import { ApiResponse } from '@/schemas/_common';

// Cache configuration
interface CacheConfig {
	ttl?: number; // Time to live in milliseconds (default: 5 minutes)
	maxSize?: number; // Maximum cache entries (default: 100)
	enableLocalStorage?: boolean; // Store in localStorage for persistence
	background?: boolean; // Enable background refresh
}

// Cache entry structure
interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
	key: string;
}

// Cache store for each entity
interface EntityCache<T> {
	entries: Map<string, CacheEntry<T>>;
	config: Required<CacheConfig>;
	lastFetch: number;
}

// Global cache registry
const cacheRegistry = new Map<string, EntityCache<unknown>>();

// Default cache configuration
const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
	ttl: 5 * 60 * 1000, // 5 minutes
	maxSize: 100,
	enableLocalStorage: false,
	background: false,
};

/**
 * Helper functions to reduce duplication
 */
const cacheHelpers = {
	// Generate entity names for store properties
	getEntityNames(entityName: string) {
		const pluralEntityName =
			entityName === 'thesis' ? 'theses' : `${entityName}s`;
		const capitalizedEntityName =
			entityName.charAt(0).toUpperCase() + entityName.slice(1);
		const filteredPropertyName =
			entityName === 'thesis'
				? 'filteredTheses'
				: `filtered${capitalizedEntityName}s`;
		const filterFunctionName =
			entityName === 'thesis'
				? 'filterTheses'
				: `filter${capitalizedEntityName}s`;

		return {
			pluralEntityName,
			capitalizedEntityName,
			filteredPropertyName,
			filterFunctionName,
		};
	},

	// Update store with data and apply filters
	updateStoreAndApplyFilters<T>(
		entityName: string,
		data: T[],
		set: StoreApi<Record<string, unknown>>['setState'],
		get: StoreApi<Record<string, unknown>>['getState'],
		additionalProps: Record<string, unknown> = {},
	) {
		const { pluralEntityName, filteredPropertyName, filterFunctionName } =
			this.getEntityNames(entityName);

		// Update store
		set({
			[pluralEntityName]: data,
			[filteredPropertyName]: data,
			...additionalProps,
		});

		// Apply filters
		const currentState = get();
		const filterFunction = currentState[filterFunctionName];
		if (typeof filterFunction === 'function') {
			filterFunction();
		}
	},

	// Handle cache retrieval and store update
	handleCacheHit<T>(
		entityName: string,
		cachedData: T[],
		set: StoreApi<Record<string, unknown>>['setState'],
		get: StoreApi<Record<string, unknown>>['getState'],
		additionalProps: Record<string, unknown> = {},
	) {
		this.updateStoreAndApplyFilters(
			entityName,
			cachedData,
			set,
			get,
			additionalProps,
		);
	},

	// Create error object
	createError(entityName: string): {
		message: string;
		statusCode: number;
		timestamp: Date;
	} {
		return {
			message: `Failed to fetch ${entityName}s`,
			statusCode: 500,
			timestamp: new Date(),
		};
	},
};

// Cache utilities
export const cacheUtils = {
	// Initialize cache for an entity
	initCache<T>(entityName: string, config: CacheConfig = {}): EntityCache<T> {
		const finalConfig = { ...DEFAULT_CACHE_CONFIG, ...config };
		const cache: EntityCache<T> = {
			entries: new Map(),
			config: finalConfig,
			lastFetch: 0,
		};

		cacheRegistry.set(entityName, cache);

		// Load from localStorage if enabled
		if (finalConfig.enableLocalStorage) {
			try {
				const stored = localStorage.getItem(`cache_${entityName}`);
				if (stored) {
					const parsedEntries = JSON.parse(stored);
					cache.entries = new Map(parsedEntries);
				}
			} catch {
				// Failed to load cache from localStorage
			}
		}

		return cache;
	},

	// Get cache for entity
	getCache<T>(entityName: string): EntityCache<T> | null {
		return (cacheRegistry.get(entityName) as EntityCache<T>) || null;
	},

	// Check if cache is valid
	isValid<T>(entry: CacheEntry<T>): boolean {
		return Date.now() - entry.timestamp < entry.ttl;
	},

	// Check if entity cache should fetch
	shouldFetch(entityName: string, force = false): boolean {
		if (force) return true;

		const cache = cacheRegistry.get(entityName);
		if (!cache) return true;

		// Check if last fetch is within TTL
		const timeSinceLastFetch = Date.now() - cache.lastFetch;
		return timeSinceLastFetch > cache.config.ttl;
	},

	// Set cache entry
	set<T>(entityName: string, key: string, data: T): void {
		const cache = cacheRegistry.get(entityName);
		if (!cache) return;

		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now(),
			ttl: cache.config.ttl,
			key,
		};

		// Add entry
		cache.entries.set(key, entry);
		cache.lastFetch = Date.now();

		// Cleanup if exceeds max size
		if (cache.entries.size > cache.config.maxSize) {
			const oldestKey = Array.from(cache.entries.keys())[0];
			cache.entries.delete(oldestKey);
		}

		// Persist to localStorage if enabled
		if (cache.config.enableLocalStorage) {
			try {
				const entriesToStore = Array.from(cache.entries.entries());
				localStorage.setItem(
					`cache_${entityName}`,
					JSON.stringify(entriesToStore),
				);
			} catch {
				// Failed to persist cache to localStorage
			}
		}
	},

	// Get cache entry
	get<T>(entityName: string, key: string): T | null {
		const cache = cacheRegistry.get(entityName);
		if (!cache) return null;

		const entry = cache.entries.get(key);
		if (!entry) return null;

		// Check if entry is still valid
		if (!this.isValid(entry)) {
			cache.entries.delete(key);
			return null;
		}

		return entry.data as T;
	},

	// Clear cache for entity
	clear(entityName: string): void {
		const cache = cacheRegistry.get(entityName);
		if (!cache) return;

		cache.entries.clear();
		cache.lastFetch = 0;

		if (cache.config.enableLocalStorage) {
			localStorage.removeItem(`cache_${entityName}`);
		}
	},

	// Clear all caches
	clearAll(): void {
		const entityNames = Array.from(cacheRegistry.keys());
		for (const entityName of entityNames) {
			this.clear(entityName);
		}
	},

	// Get cache stats
	getStats(entityName: string) {
		const cache = cacheRegistry.get(entityName);
		if (!cache) return null;

		return {
			size: cache.entries.size,
			maxSize: cache.config.maxSize,
			lastFetch: cache.lastFetch,
			timeSinceLastFetch: Date.now() - cache.lastFetch,
			ttl: cache.config.ttl,
			entries: Array.from(cache.entries.keys()),
		};
	},
};

// Helper function to get error message with fallback
const getErrorMessage = (
	message: string | undefined,
	fallback: string,
): string => {
	return (message ?? '') === '' ? fallback : message!;
};

// Enhanced fetch action with caching
export function createCachedFetchAction<T extends { id: string }>(
	service: { findAll: () => Promise<ApiResponse<T[]>> },
	entityName: string,
	cacheConfig: CacheConfig = {},
) {
	// Initialize cache
	cacheUtils.initCache<T[]>(entityName, cacheConfig);

	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (force = false) => {
			const cacheKey = 'all';

			// Try to get from cache first
			if (!force) {
				const cachedData = cacheUtils.get<T[]>(entityName, cacheKey);
				if (cachedData) {
					cacheHelpers.handleCacheHit(entityName, cachedData, set, get);
					return;
				}
			}

			// Check if we should fetch
			if (!cacheUtils.shouldFetch(entityName, force)) {
				return;
			}

			set({ loading: true, lastError: null });

			try {
				const response = await service.findAll();
				const result = handleApiResponse(response);

				if (result.success && result.data) {
					// Cache the data
					cacheUtils.set(entityName, cacheKey, result.data);
					// Update store and apply filters
					cacheHelpers.updateStoreAndApplyFilters(
						entityName,
						result.data,
						set,
						get,
					);
				} else {
					throw new Error(
						getErrorMessage(result.error?.message, 'Failed to fetch data'),
					);
				}
			} catch {
				set({ lastError: cacheHelpers.createError(entityName) });
			} finally {
				set({ loading: false });
			}
		};
}

// Cache invalidation helpers
export const cacheInvalidation = {
	// Invalidate cache after create/update/delete
	invalidateEntity(entityName: string): void {
		cacheUtils.clear(entityName);
	},

	// Smart invalidation - only clear related caches
	invalidateRelated(entityName: string, relatedEntities: string[] = []): void {
		cacheUtils.clear(entityName);
		relatedEntities.forEach((related) => cacheUtils.clear(related));
	},

	// Background refresh
	scheduleBackgroundRefresh(
		entityName: string,
		fetchFunction: () => Promise<void>,
		interval = 5 * 60 * 1000, // 5 minutes
	): NodeJS.Timeout {
		return setInterval(async () => {
			try {
				await fetchFunction();
			} catch {
				// Background refresh failed
			}
		}, interval);
	},
};

// Enhanced fetch by lecturer action with caching
export function createCachedFetchByLecturerAction<T extends { id: string }>(
	service: {
		findByLecturerId: (lecturerId: string) => Promise<ApiResponse<T[]>>;
	},
	entityName: string,
	cacheConfig: CacheConfig = {},
) {
	// Initialize cache
	cacheUtils.initCache<T[]>(entityName, cacheConfig);

	return (
			set: StoreApi<Record<string, unknown>>['setState'],
			get: StoreApi<Record<string, unknown>>['getState'],
		) =>
		async (lecturerId: string, force = false) => {
			const cacheKey = `lecturer_${lecturerId}`;

			// Try to get from cache first
			if (!force) {
				const cachedData = cacheUtils.get<T[]>(entityName, cacheKey);
				if (cachedData) {
					cacheHelpers.handleCacheHit(entityName, cachedData, set, get, {
						currentLecturerId: lecturerId,
					});
					return;
				}
			}

			// Prevent duplicate calls
			const { loading, _backgroundRefreshRunning } = get();
			if (loading || _backgroundRefreshRunning) return;

			set({
				loading: true,
				lastError: null,
				currentLecturerId: lecturerId,
				_backgroundRefreshRunning: true,
			});

			try {
				const response = await service.findByLecturerId(lecturerId);
				const result = handleApiResponse(response);

				if (result.success && result.data) {
					// Cache the data with lecturer-specific key
					cacheUtils.set(entityName, cacheKey, result.data);
					// Update store and apply filters
					cacheHelpers.updateStoreAndApplyFilters(
						entityName,
						result.data,
						set,
						get,
					);
				} else {
					throw new Error(
						getErrorMessage(result.error?.message, 'Failed to fetch data'),
					);
				}
			} catch {
				set({ lastError: cacheHelpers.createError(entityName) });
			} finally {
				set({
					loading: false,
					_backgroundRefreshRunning: false,
				});
			}
		};
}

// Cache middleware for Zustand
export function createCacheMiddleware<T>(
	entityName: string,
	config: CacheConfig = {},
) {
	return (
			storeInitializer: (set: unknown, get: unknown, api: unknown) => unknown,
		) =>
		(set: unknown, get: unknown, api: unknown) => {
			const store = storeInitializer(set, get, api);

			// Initialize cache for this entity
			cacheUtils.initCache<T>(entityName, config);

			return {
				...(store as Record<string, unknown>),
				// Add cache utilities to store
				cache: {
					clear: () => cacheUtils.clear(entityName),
					stats: () => cacheUtils.getStats(entityName),
					invalidate: () => cacheInvalidation.invalidateEntity(entityName),
				},
			};
		};
}
