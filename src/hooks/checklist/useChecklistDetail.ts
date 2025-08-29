import { useEffect, useMemo } from 'react';

import { useChecklistStore } from '@/store/useChecklistStore';

/**
 * Custom hook for managing checklist details
 * @param checklistId - The ID of the checklist to fetch
 * @param autoFetch - Whether to automatically fetch the checklist on mount (default: true)
 * @param forceRefresh - Whether to force refresh data ignoring cache (default: false)
 * @returns Object containing checklist data, loading state, and utility functions
 */
export const useChecklistDetail = (
	checklistId: string,
	autoFetch: boolean = true,
	forceRefresh: boolean = false,
) => {
	const {
		currentChecklist,
		fetchChecklistById,
		isChecklistLoading,
		getTotalItems,
		getRequiredItemsCount,
		getOptionalItemsCount,
		getReviewsCount,
		hasValidMilestone,
		setCurrentChecklist,
		clearCurrentChecklist,
		lastError,
	} = useChecklistStore();

	// Fetch checklist details when component mounts or checklistId changes
	useEffect(() => {
		if (autoFetch && checklistId && checklistId.trim() !== '') {
			fetchChecklistById(checklistId, forceRefresh).catch((error) => {
				console.error('Failed to fetch checklist details:', error);
			});
		}
	}, [checklistId, autoFetch, forceRefresh, fetchChecklistById]);

	// Clear current checklist on unmount
	useEffect(() => {
		return () => {
			clearCurrentChecklist();
		};
	}, [clearCurrentChecklist]);

	// Memoized statistics to avoid recalculation
	const stats = useMemo(() => {
		if (!currentChecklist) return null;

		return {
			totalItems: getTotalItems(checklistId),
			requiredItems: getRequiredItemsCount(checklistId),
			optionalItems: getOptionalItemsCount(checklistId),
			reviewsCount: getReviewsCount(checklistId),
			hasValidMilestone: hasValidMilestone(checklistId),
		};
	}, [
		currentChecklist,
		checklistId,
		getTotalItems,
		getRequiredItemsCount,
		getOptionalItemsCount,
		getReviewsCount,
		hasValidMilestone,
	]);

	// Memoized checklist items grouped by type
	const groupedItems = useMemo(() => {
		if (!currentChecklist?.checklistItems) return null;

		const requiredItems = currentChecklist.checklistItems.filter(
			(item) => item.isRequired,
		);
		const optionalItems = currentChecklist.checklistItems.filter(
			(item) => !item.isRequired,
		);

		return {
			required: requiredItems,
			optional: optionalItems,
			all: currentChecklist.checklistItems,
		};
	}, [currentChecklist?.checklistItems]);

	// Manual refresh function
	const refresh = (force: boolean = true) => {
		if (checklistId) {
			return fetchChecklistById(checklistId, force);
		}
		return Promise.resolve(null);
	};

	// Check if this is the current checklist
	const isCurrentChecklist = currentChecklist?.id === checklistId;

	return {
		// Data - return checklist if it matches the requested ID, or null if loading/error
		checklist: isCurrentChecklist ? currentChecklist : null,
		isCurrentChecklist,

		// Loading & Error States
		isLoading: isChecklistLoading(checklistId),
		error: lastError,

		// Statistics
		stats,

		// Grouped Items
		items: groupedItems,

		// Actions
		refresh,
		clearCurrent: clearCurrentChecklist,
		setCurrent: setCurrentChecklist,

		// Utilities
		hasData: isCurrentChecklist && !!currentChecklist,
		hasItems: isCurrentChecklist && !!currentChecklist?.checklistItems?.length,
		hasReviews: isCurrentChecklist && !!currentChecklist?.reviews?.length,
		hasMilestone: isCurrentChecklist && !!currentChecklist?.milestone,
	};
};

export default useChecklistDetail;
