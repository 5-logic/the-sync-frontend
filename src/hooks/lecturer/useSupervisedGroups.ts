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

	const fetchGroupsBySemester = useCallback(async (semesterId: string) => {
		try {
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

			setGroups(result.data || []);
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
	}, []);

	const clearGroups = useCallback(() => {
		setGroups([]);
		setError(null);
	}, []);

	return {
		groups,
		loading,
		error,
		fetchGroupsBySemester,
		clearGroups,
	};
}
