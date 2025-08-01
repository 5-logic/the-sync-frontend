import { create } from "zustand";
import { devtools } from "zustand/middleware";

import checklistItemService from "@/lib/services/checklist-item.service";
import checklistService from "@/lib/services/checklist.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import {
	Checklist,
	ChecklistCreate,
	ChecklistItem,
	ChecklistItemCreate,
	ChecklistUpdate,
} from "@/schemas/checklist";
import { cacheUtils } from "@/store/helpers/cacheHelpers";
import {
	createErrorState,
	createSearchFilter,
	handleActionError,
	handleCreateError,
} from "@/store/helpers/storeHelpers";

// Constants
const STORE_NAME = "checklist-store";

interface ChecklistState {
	// Data
	checklists: Checklist[];
	filteredChecklists: Checklist[];
	currentChecklist: Checklist | null;

	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;
	deleting: boolean;

	// Error states
	lastError: {
		message: string;
		statusCode: number;
		timestamp: Date;
	} | null;

	// Individual loading states for each checklist
	_checklistLoadingStates: Map<string, boolean>;

	// Background refresh management
	_backgroundRefreshRunning: boolean;
	_lastBackgroundRefresh: number;

	// UI states
	searchText: string;
	selectedMilestoneId: string | null;

	// Cache management
	_lastFetchTime: number;
	_isInitialized: boolean;

	// Current lecturer
	currentLecturerId: string | null;
	sessionLecturerId: string | null;

	// Cache utilities
	cache: {
		clear: () => void;
		stats: () => Record<string, unknown> | null;
		invalidate: () => void;
	};

	// Actions
	fetchChecklists: (force?: boolean) => Promise<void>;
	fetchChecklistById: (
		id: string,
		force?: boolean,
	) => Promise<Checklist | null>;
	createChecklist: (data: ChecklistCreate) => Promise<Checklist | null>;
	updateChecklist: (id: string, data: ChecklistUpdate) => Promise<boolean>;
	updateChecklistItems: (
		checklistId: string,
		items: {
			id: string;
			name: string;
			description: string;
			isRequired: boolean;
		}[],
	) => Promise<boolean>;
	createChecklistItems: (
		checklistId: string,
		items: {
			name: string;
			description: string;
			isRequired: boolean;
		}[],
	) => Promise<ChecklistItem[]>;
	createChecklistItem: (data: ChecklistItemCreate) => Promise<boolean>;
	deleteChecklistItem: (id: string) => Promise<boolean>;
	deleteChecklist: (id: string) => Promise<boolean>;
	setSearchText: (text: string) => void;
	setSelectedMilestoneId: (milestoneId: string | null) => void;
	filterChecklists: () => void;
	clearError: () => void;
	reset: () => void;
	getChecklistById: (id: string) => Checklist | undefined;
	getTotalItems: (checklistId: string) => number;
	updateChecklistInStore: (updatedChecklist: Checklist) => void;
	isChecklistLoading: (id: string) => boolean;
	setSessionLecturerId: (lecturerId: string | null) => void;
	setCurrentChecklist: (checklist: Checklist | null) => void;
	getRequiredItemsCount: (checklistId: string) => number;
	getOptionalItemsCount: (checklistId: string) => number;
	getReviewsCount: (checklistId: string) => number;
	hasValidMilestone: (checklistId: string) => boolean;
	clearCurrentChecklist: () => void;
	refreshChecklistCounts: () => void;
	forceRefreshChecklist: (checklistId: string) => Promise<void>;

	// Index signature for Zustand compatibility
	[key: string]: unknown;
}

// Helper function to create error message with nullish coalescing
const getErrorMessage = (
	errorMessage: string | undefined,
	fallback: string,
): string => {
	return errorMessage ?? fallback;
};

// Constants for cache operations
const CACHE_KEYS = {
	ALL: "all",
	DETAIL: (id: string) => `detail-${id}`,
} as const;

// Helper function to sort checklists by creation date
const sortChecklistsByDate = (checklists: Checklist[]): Checklist[] => {
	return [...checklists].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
};

// Helper function to update checklist in array
const updateChecklistInArray = (
	checklists: Checklist[],
	checklistId: string,
	updateFn: (checklist: Checklist) => Checklist,
): Checklist[] => {
	const existingIndex = checklists.findIndex((c) => c.id === checklistId);
	if (existingIndex === -1) return checklists;

	const updatedChecklists = [...checklists];
	updatedChecklists[existingIndex] = updateFn(updatedChecklists[existingIndex]);
	return updatedChecklists;
};

// Helper function to update both state and cache
const updateStateAndCache = (
	set: (partial: Partial<ChecklistState>) => void,
	get: () => ChecklistState,
	updatedChecklists: Checklist[],
	shouldFilter = true,
) => {
	set({ checklists: updatedChecklists });
	cacheUtils.set("checklist", CACHE_KEYS.ALL, updatedChecklists);
	if (shouldFilter) {
		get().filterChecklists();
	}
};

// Helper function to update current checklist and related caches
const updateCurrentChecklistAndCache = (
	set: (partial: Partial<ChecklistState>) => void,
	get: () => ChecklistState,
	updatedChecklist: Checklist,
) => {
	// Update current checklist
	set({ currentChecklist: updatedChecklist });

	// Update detail cache
	cacheUtils.set(
		"checklist",
		CACHE_KEYS.DETAIL(updatedChecklist.id),
		updatedChecklist,
	);

	// Update main checklists array if exists
	const { checklists } = get();
	const updatedChecklists = updateChecklistInArray(
		checklists,
		updatedChecklist.id,
		() => updatedChecklist,
	);

	if (updatedChecklists !== checklists) {
		updateStateAndCache(set, get, updatedChecklists);
	}
};

// Helper function to add items to checklist with improved consistency
const addItemsToChecklist = (
	set: (partial: Partial<ChecklistState>) => void,
	get: () => ChecklistState,
	checklistId: string,
	newItems: ChecklistItem[],
) => {
	const { currentChecklist, checklists } = get();

	// Helper function to normalize items to ensure consistent typing
	const normalizeItem = (
		item: Partial<ChecklistItem> & { id: string },
	): ChecklistItem => ({
		id: item.id,
		name: item.name || "",
		description: item.description || null,
		isRequired: item.isRequired || false,
		acceptance: item.acceptance || ("NotAvailable" as const),
		checklistId: item.checklistId || "",
		createdAt: item.createdAt || new Date(),
		updatedAt: item.updatedAt || new Date(),
	});

	// Helper function to merge items without duplicates and ensure consistent typing
	const mergeItems = (
		existingItems: (Partial<ChecklistItem> & { id: string })[],
		newItems: ChecklistItem[],
	): ChecklistItem[] => {
		const normalizedExisting = existingItems.map(normalizeItem);
		const existingIds = new Set(normalizedExisting.map((item) => item.id));
		const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
		const normalizedNewItems = uniqueNewItems.map(normalizeItem);
		return [...normalizedExisting, ...normalizedNewItems];
	};

	// Update currentChecklist if it matches
	if (currentChecklist && currentChecklist.id === checklistId) {
		const existingItems = currentChecklist.checklistItems || [];
		const updatedItems = mergeItems(existingItems, newItems);

		const updatedChecklist = {
			...currentChecklist,
			checklistItems: updatedItems,
			...(currentChecklist._count && {
				_count: {
					...currentChecklist._count,
					checklistItems: updatedItems.length,
				},
			}),
		};

		updateCurrentChecklistAndCache(set, get, updatedChecklist);
	}

	// Always update main checklists array to ensure consistency
	const updatedChecklists = updateChecklistInArray(
		checklists,
		checklistId,
		(existingChecklist) => {
			const existingItems = existingChecklist.checklistItems || [];
			const updatedItems = mergeItems(existingItems, newItems);
			return {
				...existingChecklist,
				checklistItems: updatedItems,
				...(existingChecklist._count && {
					_count: {
						...existingChecklist._count,
						checklistItems: updatedItems.length,
					},
				}),
			};
		},
	);

	if (updatedChecklists !== checklists) {
		updateStateAndCache(set, get, updatedChecklists);
	}
};

// Helper function to remove items from checklist with consistency
const removeItemFromChecklist = (
	set: (partial: Partial<ChecklistState>) => void,
	get: () => ChecklistState,
	checklistId: string,
	itemId: string,
) => {
	const { currentChecklist, checklists } = get();

	// Update currentChecklist if it matches
	if (currentChecklist && currentChecklist.id === checklistId) {
		const filteredItems =
			currentChecklist.checklistItems?.filter((item) => item.id !== itemId) ||
			[];

		const updatedChecklist = {
			...currentChecklist,
			checklistItems: filteredItems,
			...(currentChecklist._count && {
				_count: {
					...currentChecklist._count,
					checklistItems: filteredItems.length,
				},
			}),
		};

		updateCurrentChecklistAndCache(set, get, updatedChecklist);
	}

	// Always update main checklists array to ensure consistency
	const updatedChecklists = updateChecklistInArray(
		checklists,
		checklistId,
		(existingChecklist) => {
			const filteredItems =
				existingChecklist.checklistItems?.filter(
					(item) => item.id !== itemId,
				) || [];
			return {
				...existingChecklist,
				checklistItems: filteredItems,
				...(existingChecklist._count && {
					_count: {
						...existingChecklist._count,
						checklistItems: filteredItems.length,
					},
				}),
			};
		},
	);

	if (updatedChecklists !== checklists) {
		updateStateAndCache(set, get, updatedChecklists);
	}
};

// Helper function for async operation with loading state management
const withLoadingState = async <T>(
	set: (partial: Partial<ChecklistState>) => void,
	loadingKey: keyof Pick<
		ChecklistState,
		"loading" | "creating" | "updating" | "deleting"
	>,
	operation: () => Promise<T>,
): Promise<T> => {
	set({ [loadingKey]: true, lastError: null } as Partial<ChecklistState>);
	try {
		const result = await operation();
		set({ [loadingKey]: false } as Partial<ChecklistState>);
		return result;
	} catch (error) {
		set({ [loadingKey]: false } as Partial<ChecklistState>);
		throw error;
	}
};

// Filter function for checklists
const checklistSearchFilter = createSearchFilter<Checklist>((checklist) => [
	checklist.name,
	checklist.description || "",
	checklist.milestone?.name || "",
]);

// Initialize cache for checklist
cacheUtils.initCache<Checklist[]>("checklist", {
	ttl: 5 * 60 * 1000, // 5 minutes for checklists
	maxSize: 1000, // Support up to 1000 checklists in cache
	enableLocalStorage: false, // Don't store in localStorage
});

export const useChecklistStore = create<ChecklistState>()(
	devtools(
		(set, get) => ({
			// Initial state
			checklists: [],
			filteredChecklists: [],
			currentChecklist: null,
			loading: false,
			creating: false,
			updating: false,
			deleting: false,
			lastError: null,
			searchText: "",
			selectedMilestoneId: null,
			_lastFetchTime: 0,
			_isInitialized: false,
			currentLecturerId: null,
			sessionLecturerId: null,

			// Internal loading states
			_checklistLoadingStates: new Map(),
			_backgroundRefreshRunning: false,
			_lastBackgroundRefresh: 0,

			// Cache utilities
			cache: {
				clear: () => {
					cacheUtils.clear("checklist");
				},
				stats: () => cacheUtils.getStats("checklist"),
				invalidate: () => {
					cacheUtils.clear("checklist");
				},
			},

			// Fetch all checklists with sorting and caching
			fetchChecklists: async (force = false) => {
				// Try to get from cache first
				if (!force) {
					const cachedData = cacheUtils.get<Checklist[]>(
						"checklist",
						CACHE_KEYS.ALL,
					);
					if (cachedData) {
						const sortedData = sortChecklistsByDate(cachedData);
						set({
							checklists: sortedData,
							filteredChecklists: sortedData,
						});
						get().filterChecklists();
						return;
					}
				}

				// Check if we should fetch
				if (!cacheUtils.shouldFetch("checklist", force)) {
					return;
				}

				await withLoadingState(set, "loading", async () => {
					const response = await checklistService.findAll();
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						const sortedData = sortChecklistsByDate(result.data);

						// Cache and update state
						cacheUtils.set("checklist", CACHE_KEYS.ALL, sortedData);
						set({
							checklists: sortedData,
							filteredChecklists: sortedData,
							_lastFetchTime: Date.now(),
							_isInitialized: true,
						});

						// Apply filters
						get().filterChecklists();
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to fetch checklists",
							),
						);
					}
				}).catch(() => {
					set({
						lastError: {
							message: "Failed to fetch checklists",
							statusCode: 500,
							timestamp: new Date(),
						},
					});
				});
			},

			// Fetch checklist by ID with detailed information
			fetchChecklistById: async (id: string, force = false) => {
				const cacheKey = CACHE_KEYS.DETAIL(id);

				// Set individual loading state
				set((state) => ({
					_checklistLoadingStates: new Map(state._checklistLoadingStates).set(
						id,
						true,
					),
				}));

				// Try to get from cache first
				if (!force) {
					const cachedData = cacheUtils.get<Checklist>("checklist", cacheKey);
					if (cachedData) {
						set({ currentChecklist: cachedData });

						// Update loading state
						set((state) => ({
							_checklistLoadingStates: new Map(
								state._checklistLoadingStates,
							).set(id, false),
						}));

						return cachedData;
					}
				}

				set({ lastError: null });

				try {
					const response = await checklistService.findOne(id);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						const checklistDetail = result.data;

						// Cache the detailed checklist
						cacheUtils.set("checklist", cacheKey, checklistDetail);

						// Update current checklist
						set({ currentChecklist: checklistDetail });

						// Also update the checklist in the main array if it exists
						const { checklists } = get();
						const updatedChecklists = updateChecklistInArray(
							checklists,
							id,
							() => checklistDetail,
						);

						if (updatedChecklists !== checklists) {
							// Update the main cache as well
							cacheUtils.set("checklist", CACHE_KEYS.ALL, updatedChecklists);
							set({ checklists: updatedChecklists });
						}

						return checklistDetail;
					} else {
						console.error("❌ API call failed:", result.error);
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to fetch checklist details",
							),
						);
					}
				} catch (error) {
					console.error("🔥 Error in fetchChecklistById:", error);
					handleActionError(error, "checklist", "fetch detail", set);
					return null;
				} finally {
					// Clear individual loading state
					set((state) => ({
						_checklistLoadingStates: new Map(state._checklistLoadingStates).set(
							id,
							false,
						),
					}));
				}
			},

			// Create checklist
			createChecklist: async (data: ChecklistCreate) => {
				return await withLoadingState(set, "creating", async () => {
					const response = await checklistService.create(data);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Add to checklists array and sort by createdAt desc (newest first)
						const { checklists } = get();
						const updatedChecklists = sortChecklistsByDate([
							...checklists,
							result.data,
						]);

						updateStateAndCache(set, get, updatedChecklists);
						return result.data;
					}

					if (result.error) {
						const error = createErrorState(result.error);
						set({ lastError: error });
						handleCreateError(result);
						return null;
					}

					return null;
				}).catch((error) => {
					handleActionError(error, "checklist", "create", set);
					return null;
				});
			},

			// Update checklist
			updateChecklist: async (id: string, data: ChecklistUpdate) => {
				return await withLoadingState(set, "updating", async () => {
					const response = await checklistService.update(id, data);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Update local state
						const { checklists } = get();
						const updatedChecklists = updateChecklistInArray(
							checklists,
							id,
							() => result.data!,
						);

						updateStateAndCache(set, get, updatedChecklists);
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to update checklist",
							),
						);
					}
				}).catch((error) => {
					handleActionError(error, "checklist", "update", set);
					return false;
				});
			},

			// Update checklist items
			updateChecklistItems: async (
				checklistId: string,
				items: {
					id: string;
					name: string;
					description: string;
					isRequired: boolean;
				}[],
			) => {
				return await withLoadingState(set, "updating", async () => {
					const response = await checklistItemService.updateList(
						checklistId,
						items,
					);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						const { currentChecklist } = get();
						if (currentChecklist && currentChecklist.id === checklistId) {
							const updatedChecklist = {
								...currentChecklist,
								checklistItems: result.data,
								// Also update _count if it exists
								...(currentChecklist._count && {
									_count: {
										...currentChecklist._count,
										checklistItems: result.data.length,
									},
								}),
							};

							updateCurrentChecklistAndCache(set, get, updatedChecklist);
						}
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to update checklist items",
							),
						);
					}
				}).catch((error) => {
					handleActionError(error, "checklist items", "update", set);
					return false;
				});
			},

			// Create checklist items
			createChecklistItems: async (
				checklistId: string,
				items: {
					name: string;
					description: string;
					isRequired: boolean;
				}[],
			) => {
				return await withLoadingState(set, "creating", async () => {
					const response = await checklistItemService.createList(
						checklistId,
						items,
					);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Handle different response formats
						let createdItems: ChecklistItem[] = [];

						if (Array.isArray(result.data)) {
							createdItems = result.data;
						} else if (result.data && typeof result.data === "object") {
							// Check if it has an items property
							const dataObj = result.data as { items?: ChecklistItem[] };
							if (dataObj.items && Array.isArray(dataObj.items)) {
								createdItems = dataObj.items;
							} else {
								// Single item response
								createdItems = [result.data as ChecklistItem];
							}
						}

						// Use helper function to add items
						addItemsToChecklist(set, get, checklistId, createdItems);
						return createdItems;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to create checklist items",
							),
						);
					}
				}).catch((error) => {
					handleActionError(error, "checklist items", "create", set);
					throw error;
				});
			},

			// Create checklist item
			createChecklistItem: async (data: ChecklistItemCreate) => {
				return await withLoadingState(set, "creating", async () => {
					const response = await checklistItemService.create(data);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Use helper function to add single item
						addItemsToChecklist(set, get, data.checklistId, [result.data]);
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to create checklist item",
							),
						);
					}
				}).catch((error) => {
					handleActionError(error, "checklist item", "create", set);
					return false;
				});
			},

			// Delete checklist item
			deleteChecklistItem: async (id: string) => {
				// Helper function to find target checklist ID
				const findTargetChecklistId = (
					currentChecklist: Checklist | null,
					checklists: Checklist[],
					itemId: string,
				): string => {
					// Check current checklist first
					if (
						currentChecklist?.checklistItems?.some((item) => item.id === itemId)
					) {
						return currentChecklist.id;
					}

					// Search in main checklists array
					const parentChecklist = checklists.find((checklist) =>
						checklist.checklistItems?.some((item) => item.id === itemId),
					);

					return parentChecklist?.id || "";
				};

				return await withLoadingState(set, "deleting", async () => {
					const response = await checklistItemService.delete(id);
					const result = handleApiResponse(response);

					if (result.success) {
						const { currentChecklist, checklists } = get();
						const targetChecklistId = findTargetChecklistId(
							currentChecklist,
							checklists,
							id,
						);

						if (targetChecklistId) {
							removeItemFromChecklist(set, get, targetChecklistId, id);
						}
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to delete checklist item",
							),
						);
					}
				}).catch((error) => {
					handleActionError(error, "checklist item", "delete", set);
					return false;
				});
			},

			// Delete checklist
			deleteChecklist: async (id: string) => {
				return await withLoadingState(set, "deleting", async () => {
					const response = await checklistService.delete(id);
					const result = handleApiResponse(response);

					if (result.success) {
						// Remove from local state
						const { checklists } = get();
						const updatedChecklists = checklists.filter(
							(checklist) => checklist.id !== id,
						);

						updateStateAndCache(set, get, updatedChecklists);
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								"Failed to delete checklist",
							),
						);
					}
				}).catch((error) => {
					handleActionError(error, "checklist", "delete", set);
					return false;
				});
			},

			setSearchText: (text: string) => {
				set({ searchText: text });
				get().filterChecklists();
			},

			setSelectedMilestoneId: (milestoneId: string | null) => {
				set({ selectedMilestoneId: milestoneId });
				get().filterChecklists();
			},

			filterChecklists: () => {
				const { checklists, searchText, selectedMilestoneId } = get();
				let filtered = checklists;

				// Apply milestone filter
				if (selectedMilestoneId) {
					filtered = filtered.filter(
						(checklist) => checklist.milestoneId === selectedMilestoneId,
					);
				}

				// Apply text search
				filtered = checklistSearchFilter(filtered, searchText);

				set({ filteredChecklists: filtered });
			},

			getTotalItems: (checklistId: string) => {
				// First check currentChecklist if it matches the requested ID
				const { currentChecklist, checklists } = get();
				if (currentChecklist && currentChecklist.id === checklistId) {
					// Use current checklist data which is most up-to-date
					if (currentChecklist.checklistItems) {
						return currentChecklist.checklistItems.length;
					}
					return currentChecklist._count?.checklistItems || 0;
				}

				// Fallback to checklists array
				const checklist = checklists.find((c) => c.id === checklistId);
				if (checklist?.checklistItems) {
					return checklist.checklistItems.length;
				}
				return checklist?._count?.checklistItems || 0;
			},

			// Utility functions
			reset: () => {
				cacheUtils.clear("checklist");
				set({
					checklists: [],
					filteredChecklists: [],
					currentChecklist: null,
					loading: false,
					creating: false,
					updating: false,
					deleting: false,
					lastError: null,
					searchText: "",
					selectedMilestoneId: null,
					_lastFetchTime: 0,
					_isInitialized: false,
					currentLecturerId: null,
					sessionLecturerId: null,
					_checklistLoadingStates: new Map(),
					_backgroundRefreshRunning: false,
					_lastBackgroundRefresh: 0,
				});
			},

			clearError: () => set({ lastError: null }),

			getChecklistById: (id: string) => {
				const { checklists } = get();
				return checklists.find((checklist) => checklist.id === id);
			},

			// Update checklist in store and sync with cache
			updateChecklistInStore: (updatedChecklist: Checklist) => {
				const { checklists } = get();
				const updatedChecklists = updateChecklistInArray(
					checklists,
					updatedChecklist.id,
					() => updatedChecklist,
				);

				// Update both main cache and detail cache
				cacheUtils.set("checklist", CACHE_KEYS.ALL, updatedChecklists);
				cacheUtils.set(
					"checklist",
					CACHE_KEYS.DETAIL(updatedChecklist.id),
					updatedChecklist,
				);

				// Update current checklist if it's the same
				const { currentChecklist } = get();
				if (currentChecklist?.id === updatedChecklist.id) {
					set({ currentChecklist: updatedChecklist });
				}

				updateStateAndCache(set, get, updatedChecklists, false);
			},

			isChecklistLoading: (id: string) => {
				const { _checklistLoadingStates } = get();
				return _checklistLoadingStates.get(id) ?? false;
			},

			setSessionLecturerId: (lecturerId: string | null) => {
				set({ sessionLecturerId: lecturerId });
				// Re-apply filters since owned filter might depend on sessionLecturerId
				get().filterChecklists();
			},

			setCurrentChecklist: (checklist: Checklist | null) => {
				set({ currentChecklist: checklist });
			},

			// Get total required items count for a checklist
			getRequiredItemsCount: (checklistId: string) => {
				const checklist = get().checklists.find((c) => c.id === checklistId);
				return (
					checklist?.checklistItems?.filter((item) => item.isRequired).length ||
					0
				);
			},

			// Get total optional items count for a checklist
			getOptionalItemsCount: (checklistId: string) => {
				const checklist = get().checklists.find((c) => c.id === checklistId);
				return (
					checklist?.checklistItems?.filter((item) => !item.isRequired)
						.length || 0
				);
			},

			// Get reviews count for a checklist
			getReviewsCount: (checklistId: string) => {
				const checklist = get().checklists.find((c) => c.id === checklistId);
				return checklist?._count?.reviews || 0;
			},

			// Check if checklist has milestone
			hasValidMilestone: (checklistId: string) => {
				const checklist = get().checklists.find((c) => c.id === checklistId);
				return !!(checklist?.milestone && checklist.milestoneId);
			},

			// Clear current checklist
			clearCurrentChecklist: () => {
				set({ currentChecklist: null });
			},

			// Refresh counts for all checklists based on their actual checklistItems
			refreshChecklistCounts: () => {
				const { checklists } = get();
				const updatedChecklists = checklists.map((checklist) => ({
					...checklist,
					...(checklist._count && {
						_count: {
							...checklist._count,
							checklistItems: checklist.checklistItems?.length || 0,
						},
					}),
				}));

				if (JSON.stringify(updatedChecklists) !== JSON.stringify(checklists)) {
					updateStateAndCache(set, get, updatedChecklists, false);
				}
			},

			// Force refresh a specific checklist from server
			forceRefreshChecklist: async (checklistId: string) => {
				try {
					const refreshedChecklist = await get().fetchChecklistById(
						checklistId,
						true,
					);
					if (refreshedChecklist) {
						// Update both current checklist and main array
						const { currentChecklist } = get();
						if (currentChecklist && currentChecklist.id === checklistId) {
							updateCurrentChecklistAndCache(set, get, refreshedChecklist);
						}
					}
				} catch (error) {
					console.error("Failed to force refresh checklist:", error);
				}
			},
		}),
		{
			name: STORE_NAME,
		},
	),
);
