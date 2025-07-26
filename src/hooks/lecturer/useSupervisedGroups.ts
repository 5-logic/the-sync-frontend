import { useCallback, useState } from 'react';

import groupService, { SupervisedGroup } from '@/lib/services/groups.service';
import { handleApiResponse } from '@/lib/utils/handleApi';

interface UseSupervisedGroupsReturn {
	groups: SupervisedGroup[];
	loading: boolean;
	error: string | null;
	fetchGroupsBySemester: (semesterId: string) => Promise<void>;
	clearGroups: () => void;
}

export function useSupervisedGroups(): UseSupervisedGroupsReturn {
	const [groups, setGroups] = useState<SupervisedGroup[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastFetchedSemester, setLastFetchedSemester] = useState<string | null>(
		null,
	);

	const fetchGroupsBySemester = useCallback(
		async (semesterId: string) => {
			// Tránh fetch lại nếu:
			// 1. Đang loading cùng semester
			// 2. Hoặc đã fetch thành công semester này rồi
			if (
				(lastFetchedSemester === semesterId && loading) ||
				(lastFetchedSemester === semesterId && groups.length > 0 && !error)
			) {
				console.log('Skipping duplicate fetch for semester:', semesterId);
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
		[loading, lastFetchedSemester, groups.length, error],
	);

	const clearGroups = useCallback(() => {
		setGroups([]);
		setError(null);
		setLastFetchedSemester(null);
	}, []);

	return {
		groups,
		loading,
		error,
		fetchGroupsBySemester,
		clearGroups,
	};
}
