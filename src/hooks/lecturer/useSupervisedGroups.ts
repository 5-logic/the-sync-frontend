import { useCallback, useState } from 'react';

import groupService, { SupervisedGroup } from '@/lib/services/groups.service';
import { handleApiResponse } from '@/lib/utils/handleApi';

interface UseSupervisedGroupsReturn {
	groups: SupervisedGroup[];
	loading: boolean;
	error: string | null;
	fetchGroupsBySemester: (semesterId: string, force?: boolean) => Promise<void>;
	clearGroups: () => void;
	isInitialLoad: boolean;
	isRefreshing: boolean;
}

// Global cache to persist data across component unmounts
const globalGroupsCache: {
	[semesterId: string]: {
		data: SupervisedGroup[];
		timestamp: number;
	};
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function useSupervisedGroups(): UseSupervisedGroupsReturn {
	const [groups, setGroups] = useState<SupervisedGroup[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [cachedSemester, setCachedSemester] = useState<string | null>(null);
	const [hasEverLoaded, setHasEverLoaded] = useState(false);

	const fetchGroupsBySemester = useCallback(
		async (semesterId: string, force = false) => {
			try {
				// Check global cache first
				const cached = globalGroupsCache[semesterId];
				const now = Date.now();

				// Use cache if available, valid, and not forcing
				if (!force && cached && now - cached.timestamp < CACHE_DURATION) {
					setGroups(cached.data);
					setCachedSemester(semesterId);
					setHasEverLoaded(true);
					return;
				}

				// If we already have data for this semester and not forcing, don't refetch
				if (!force && cachedSemester === semesterId && groups.length > 0) {
					return;
				}

				setLoading(true);
				setError(null);

				const response =
					await groupService.findSuperviseGroupsBySemester(semesterId);
				const result = handleApiResponse(response);

				if (!result.success) {
					throw new Error(
						result.error?.message || 'Failed to fetch supervised groups',
					);
				}

				const data = result.data || [];
				setGroups(data);
				setCachedSemester(semesterId);
				setHasEverLoaded(true);

				// Update global cache
				globalGroupsCache[semesterId] = {
					data,
					timestamp: now,
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Failed to fetch supervised groups';
				setError(errorMessage);
				console.error('Error fetching supervised groups:', error);
			} finally {
				setLoading(false);
			}
		},
		[cachedSemester, groups.length],
	);

	const clearGroups = useCallback(() => {
		setGroups([]);
		setError(null);
		setCachedSemester(null);
		// Don't reset hasEverLoaded to avoid skeleton on semester switch
	}, []);

	// Loading states - skeleton only for very first app load AND no cached data exists
	const hasAnyCachedData = Object.keys(globalGroupsCache).length > 0;
	const isInitialLoad = loading && !hasEverLoaded && !hasAnyCachedData;
	const isRefreshing = loading && (hasEverLoaded || hasAnyCachedData);

	return {
		groups,
		loading,
		error,
		fetchGroupsBySemester,
		clearGroups,
		isInitialLoad,
		isRefreshing,
	};
}
