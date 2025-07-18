import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import checklistItemService from '@/lib/services/checklist-item.service';
import checklistService from '@/lib/services/checklist.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import {
	Checklist,
	ChecklistCreate,
	ChecklistItem,
	ChecklistItemCreate,
	ChecklistUpdate,
} from '@/schemas/checklist';
import { cacheUtils } from '@/store/helpers/cacheHelpers';
import {
	createErrorState,
	createSearchFilter,
	handleActionError,
	handleCreateError,
} from '@/store/helpers/storeHelpers';

// Constants
const STORE_NAME = 'checklist-store';

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

// Filter function for checklists
const checklistSearchFilter = createSearchFilter<Checklist>((checklist) => [
	checklist.name,
	checklist.description || '',
	checklist.milestone?.name || '',
]);

// Initialize cache for checklist
cacheUtils.initCache<Checklist[]>('checklist', {
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
			searchText: '',
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
					cacheUtils.clear('checklist');
				},
				stats: () => cacheUtils.getStats('checklist'),
				invalidate: () => {
					cacheUtils.clear('checklist');
				},
			},

			// Fetch all checklists with sorting and caching
			fetchChecklists: async (force = false) => {
				const cacheKey = 'all';

				// Try to get from cache first
				if (!force) {
					const cachedData = cacheUtils.get<Checklist[]>('checklist', cacheKey);
					if (cachedData) {
						// Sort cached data
						const sortedData = [...cachedData].sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);
						set({
							checklists: sortedData,
							filteredChecklists: sortedData,
						});
						get().filterChecklists();
						return;
					}
				}

				// Check if we should fetch
				if (!cacheUtils.shouldFetch('checklist', force)) {
					return;
				}

				set({ loading: true, lastError: null });

				try {
					const response = await checklistService.findAll();
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						// Sort data by createdAt desc (newest first)
						const sortedData = [...result.data].sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);

						// Cache the sorted data
						cacheUtils.set('checklist', cacheKey, sortedData);

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
								'Failed to fetch checklists',
							),
						);
					}
				} catch {
					set({
						lastError: {
							message: 'Failed to fetch checklists',
							statusCode: 500,
							timestamp: new Date(),
						},
					});
				} finally {
					set({ loading: false });
				}
			},

			// Fetch checklist by ID with detailed information
			fetchChecklistById: async (id: string, force = false) => {
				const cacheKey = `detail-${id}`;

				// Set individual loading state
				set((state) => ({
					_checklistLoadingStates: new Map(state._checklistLoadingStates).set(
						id,
						true,
					),
				}));

				// Try to get from cache first
				if (!force) {
					const cachedData = cacheUtils.get<Checklist>('checklist', cacheKey);
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

				// Check if we should fetch (respecting cache TTL)
				if (!force && !cacheUtils.shouldFetch('checklist', false)) {
					// If cache is still valid but no cached data, we should still try to fetch
					// This prevents the "not found" error when cache is valid but data is missing
				}

				set({ lastError: null });

				try {
					const response = await checklistService.findOne(id);
					const result = handleApiResponse(response);

					if (result.success && result.data) {
						const checklistDetail = result.data;

						// Cache the detailed checklist
						cacheUtils.set('checklist', cacheKey, checklistDetail);

						// Update current checklist
						set({ currentChecklist: checklistDetail });

						// Also update the checklist in the main array if it exists
						const { checklists } = get();
						const existingIndex = checklists.findIndex((c) => c.id === id);
						if (existingIndex !== -1) {
							const updatedChecklists = [...checklists];
							updatedChecklists[existingIndex] = checklistDetail;
							set({ checklists: updatedChecklists });

							// Update the main cache as well
							cacheUtils.set('checklist', 'all', updatedChecklists);
						}

						return checklistDetail;
					} else {
						console.error('❌ API call failed:', result.error);
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to fetch checklist details',
							),
						);
					}
				} catch (error) {
					console.error('🔥 Error in fetchChecklistById:', error);
					handleActionError(error, 'checklist', 'fetch detail', set);
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
				set({ creating: true, lastError: null });
				try {
					const response = await checklistService.create(data);
					const result = handleApiResponse(response);
					if (result.success && result.data) {
						// Add to checklists array and sort by createdAt desc (newest first)
						const { checklists } = get();
						const updatedChecklists = [...checklists, result.data].sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);
						set({
							checklists: updatedChecklists,
							creating: false,
						});

						// Re-apply filters
						get().filterChecklists();

						// Update cache with new checklist instead of invalidating
						cacheUtils.set('checklist', 'all', updatedChecklists);

						return result.data; // Return the created checklist instead of boolean
					}

					if (result.error) {
						const error = createErrorState(result.error);
						set({ lastError: error, creating: false });
						handleCreateError(result);
						return null;
					}
				} catch (error) {
					handleActionError(error, 'checklist', 'create', set);
					set({ creating: false });
					return null;
				}

				set({ creating: false });
				return null;
			},

			// Update checklist
			updateChecklist: async (id: string, data: ChecklistUpdate) => {
				set({ updating: true, lastError: null });
				try {
					const response = await checklistService.update(id, data);
					const result = handleApiResponse(response);
					if (result.success && result.data) {
						// Update local state
						const { checklists } = get();
						const updatedChecklists = checklists.map((checklist) =>
							checklist.id === id ? result.data! : checklist,
						);
						set({
							checklists: updatedChecklists,
							updating: false,
						});

						// Re-apply filters
						get().filterChecklists();

						// Update cache instead of invalidating
						cacheUtils.set('checklist', 'all', updatedChecklists);

						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to update checklist',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'checklist', 'update', set);
					set({ updating: false });
					return false;
				}
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
				set({ updating: true, lastError: null });
				try {
					const response = await checklistItemService.updateList(
						checklistId,
						items,
					);
					const result = handleApiResponse(response);
					if (result.success && result.data) {
						// Update local state instead of fetching from API
						const { currentChecklist } = get();
						if (currentChecklist && currentChecklist.id === checklistId) {
							// Update the items in the current checklist
							const updatedChecklist = {
								...currentChecklist,
								checklistItems: result.data,
							};

							// Update current checklist
							set({ currentChecklist: updatedChecklist });

							// Update cache
							cacheUtils.set(
								'checklist',
								`detail-${checklistId}`,
								updatedChecklist,
							);

							// Also update in main checklists array if it exists
							const { checklists } = get();
							const existingIndex = checklists.findIndex(
								(c) => c.id === checklistId,
							);
							if (existingIndex !== -1) {
								const updatedChecklists = [...checklists];
								updatedChecklists[existingIndex] = updatedChecklist;
								set({ checklists: updatedChecklists });
								cacheUtils.set('checklist', 'all', updatedChecklists);
							}
						}
						set({ updating: false });
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to update checklist items',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'checklist items', 'update', set);
					set({ updating: false });
					return false;
				}
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
				set({ creating: true, lastError: null });
				try {
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
						} else if (result.data && typeof result.data === 'object') {
							// Check if it has an items property
							const dataObj = result.data as { items?: ChecklistItem[] };
							if (dataObj.items && Array.isArray(dataObj.items)) {
								createdItems = dataObj.items;
							} else {
								// Single item response
								createdItems = [result.data as ChecklistItem];
							}
						}

						// Update local state instead of fetching from API
						const { currentChecklist } = get();
						if (currentChecklist && currentChecklist.id === checklistId) {
							// Check for duplicates before adding
							const existingIds = (currentChecklist.checklistItems || []).map(
								(item) => item.id,
							);
							const duplicateIds = createdItems.filter((item) =>
								existingIds.includes(item.id),
							);

							if (duplicateIds.length > 0) {
								// Filter out duplicates
								const uniqueNewItems = createdItems.filter(
									(item) => !existingIds.includes(item.id),
								);
								createdItems = uniqueNewItems;
							}

							// Add the new items to the current checklist
							const updatedChecklist = {
								...currentChecklist,
								checklistItems: [
									...(currentChecklist.checklistItems || []),
									...createdItems,
								],
							};

							// Update current checklist
							set({ currentChecklist: updatedChecklist });

							// Update cache
							cacheUtils.set(
								'checklist',
								`detail-${currentChecklist.id}`,
								updatedChecklist,
							);

							// Also update in main checklists array if it exists
							const { checklists } = get();
							const existingIndex = checklists.findIndex(
								(c) => c.id === currentChecklist.id,
							);
							if (existingIndex !== -1) {
								const updatedChecklists = [...checklists];
								updatedChecklists[existingIndex] = updatedChecklist;
								set({ checklists: updatedChecklists });
								cacheUtils.set('checklist', 'all', updatedChecklists);
								// Force re-filter to update the filtered list
								get().filterChecklists();
							}
						} else {
							// If no current checklist, try to update the main checklists array directly
							const { checklists } = get();
							const existingIndex = checklists.findIndex(
								(c) => c.id === checklistId,
							);
							if (existingIndex !== -1) {
								const updatedChecklists = [...checklists];
								const existingChecklist = updatedChecklists[existingIndex];
								updatedChecklists[existingIndex] = {
									...existingChecklist,
									checklistItems: [
										...(existingChecklist.checklistItems || []),
										...createdItems,
									],
								};
								set({ checklists: updatedChecklists });
								cacheUtils.set('checklist', 'all', updatedChecklists);
								// Force re-filter to update the filtered list
								get().filterChecklists();
							}
						}
						set({ creating: false });
						return createdItems;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to create checklist items',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'checklist items', 'create', set);
					set({ creating: false });
					throw error;
				}
			},

			// Create checklist item
			createChecklistItem: async (data: ChecklistItemCreate) => {
				set({ creating: true, lastError: null });
				try {
					const response = await checklistItemService.create(data);
					const result = handleApiResponse(response);
					if (result.success && result.data) {
						// Update local state instead of fetching from API
						const { currentChecklist } = get();
						if (currentChecklist && currentChecklist.id === data.checklistId) {
							// Add the new item to the current checklist
							const updatedChecklist = {
								...currentChecklist,
								checklistItems: [
									...(currentChecklist.checklistItems || []),
									result.data,
								],
							};

							// Update current checklist
							set({ currentChecklist: updatedChecklist });

							// Update cache
							cacheUtils.set(
								'checklist',
								`detail-${currentChecklist.id}`,
								updatedChecklist,
							);

							// Also update in main checklists array if it exists
							const { checklists } = get();
							const existingIndex = checklists.findIndex(
								(c) => c.id === currentChecklist.id,
							);
							if (existingIndex !== -1) {
								const updatedChecklists = [...checklists];
								updatedChecklists[existingIndex] = updatedChecklist;
								set({ checklists: updatedChecklists });
								cacheUtils.set('checklist', 'all', updatedChecklists);
							}
						}
						set({ creating: false });
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to create checklist item',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'checklist item', 'create', set);
					set({ creating: false });
					return false;
				}
			},

			// Delete checklist item
			deleteChecklistItem: async (id: string) => {
				set({ deleting: true, lastError: null });
				try {
					const response = await checklistItemService.delete(id);
					const result = handleApiResponse(response);
					if (result.success) {
						// Update local state instead of fetching from API
						const { currentChecklist } = get();
						if (currentChecklist) {
							// Remove the item from the current checklist
							const updatedChecklist = {
								...currentChecklist,
								checklistItems:
									currentChecklist.checklistItems?.filter(
										(item) => item.id !== id,
									) || [],
							};

							// Update current checklist
							set({ currentChecklist: updatedChecklist });

							// Update cache
							cacheUtils.set(
								'checklist',
								`detail-${currentChecklist.id}`,
								updatedChecklist,
							);

							// Also update in main checklists array if it exists
							const { checklists } = get();
							const existingIndex = checklists.findIndex(
								(c) => c.id === currentChecklist.id,
							);
							if (existingIndex !== -1) {
								const updatedChecklists = [...checklists];
								updatedChecklists[existingIndex] = updatedChecklist;
								set({ checklists: updatedChecklists });
								cacheUtils.set('checklist', 'all', updatedChecklists);
							}
						}
						set({ deleting: false });
						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to delete checklist item',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'checklist item', 'delete', set);
					set({ deleting: false });
					return false;
				}
			},

			// Delete checklist
			deleteChecklist: async (id: string) => {
				set({ deleting: true, lastError: null });
				try {
					const response = await checklistService.delete(id);
					const result = handleApiResponse(response);
					if (result.success) {
						// Remove from local state
						const { checklists } = get();
						const updatedChecklists = checklists.filter(
							(checklist) => checklist.id !== id,
						);
						set({
							checklists: updatedChecklists,
							deleting: false,
						});

						// Re-apply filters
						get().filterChecklists();

						// Update cache with filtered data instead of invalidating
						cacheUtils.set('checklist', 'all', updatedChecklists);

						return true;
					} else {
						throw new Error(
							getErrorMessage(
								result.error?.message,
								'Failed to delete checklist',
							),
						);
					}
				} catch (error) {
					handleActionError(error, 'checklist', 'delete', set);
					set({ deleting: false });
					return false;
				}
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
				const checklist = get().checklists.find((c) => c.id === checklistId);
				return (
					checklist?.checklistItems?.length ||
					checklist?._count?.checklistItems ||
					0
				);
			},

			// Utility functions
			reset: () => {
				cacheUtils.clear('checklist');
				set({
					checklists: [],
					filteredChecklists: [],
					currentChecklist: null,
					loading: false,
					creating: false,
					updating: false,
					deleting: false,
					lastError: null,
					searchText: '',
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
				const updatedChecklists = checklists.map((checklist) =>
					checklist.id === updatedChecklist.id ? updatedChecklist : checklist,
				);

				set({ checklists: updatedChecklists });

				// Update both main cache and detail cache
				cacheUtils.set('checklist', 'all', updatedChecklists);
				cacheUtils.set(
					'checklist',
					`detail-${updatedChecklist.id}`,
					updatedChecklist,
				);

				// Update current checklist if it's the same
				const { currentChecklist } = get();
				if (currentChecklist?.id === updatedChecklist.id) {
					set({ currentChecklist: updatedChecklist });
				}

				get().filterChecklists();
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
		}),
		{
			name: STORE_NAME,
		},
	),
);
