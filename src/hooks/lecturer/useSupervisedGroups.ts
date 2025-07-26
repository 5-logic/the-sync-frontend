import { useCallback, useState } from 'react';

import groupService, { SupervisedGroup } from '@/lib/services/groups.service';
import { handleApiResponse } from '@/lib/utils/handleApi';

interface UseSupervisedGroupsReturn {
	groups: SupervisedGroup[];
	loading: boolean;
	error: string | null;
	fetchGroupsBySemester: (semesterId: string, force?: boolean) => Promise<void>;
	clearGroups: () => void;
	refreshCache: () => void;
}

// Simple cache với TTL
interface CacheEntry {
	data: SupervisedGroup[];
	timestamp: number;
	semesterId: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 phút
const groupsCache = new Map<string, CacheEntry>();

export function useSupervisedGroups(): UseSupervisedGroupsReturn {
	const [groups, setGroups] = useState<SupervisedGroup[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedSemester, setLastFetchedSemester] = useState<string | null>(
		null,
	);

	// Check if cache is valid
	const isCacheValid = (semesterId: string): boolean => {
		const cached = groupsCache.get(semesterId);
		if (!cached) {
			return false;
		}
		return Date.now() - cached.timestamp < CACHE_TTL;
	};

	const fetchGroupsBySemester = useCallback(
		async (semesterId: string, force = false) => {
			// Smart caching logic
			if (!force && isCacheValid(semesterId)) {
				const cached = groupsCache.get(semesterId)!;
				console.log('📦 Using cached groups for semester:', semesterId);
				setGroups(cached.data);
				setLastFetchedSemester(semesterId);
				setError(null);
				return;
			}

			// Tránh duplicate fetch khi đang loading
			if (lastFetchedSemester === semesterId && loading && !force) {
				console.log('⏳ Already fetching groups for semester:', semesterId);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				setLastFetchedSemester(semesterId);

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

				// Cache the result
				groupsCache.set(semesterId, {
					data,
					timestamp: Date.now(),
					semesterId,
				});
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
		[loading, lastFetchedSemester],
	);

	const clearGroups = useCallback(() => {
		setGroups([]);
		setError(null);
		setLastFetchedSemester(null);
		// Clear cache khi clear groups
		groupsCache.clear();
	}, []);

	const refreshCache = useCallback(() => {
		groupsCache.clear();
		console.log('🗑️ Groups cache cleared');
	}, []);

	return {
		groups,
		loading,
		error,
		fetchGroupsBySemester,
		clearGroups,
		refreshCache,
	};
}
