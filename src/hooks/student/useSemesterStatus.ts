import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

import studentsService from '@/lib/services/students.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { cacheUtils } from '@/store/helpers/cacheHelpers';

export const useSemesterStatus = () => {
	const { data: session } = useSession();
	const [semesterStatus, setSemesterStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Initialize cache for semester status if not exists
	const entityName = 'semesterStatus';
	if (!cacheUtils.getCache(entityName)) {
		cacheUtils.initCache(entityName, { ttl: 2 * 60 * 1000 }); // 2 minutes cache
	}

	const fetchSemesterStatus = useCallback(async () => {
		if (!session?.user?.id) {
			setLoading(false);
			return;
		}

		const cacheKey = session.user.id;

		// Check cache first
		const cachedStatus = cacheUtils.get<string>(entityName, cacheKey);
		if (cachedStatus !== null) {
			setSemesterStatus(cachedStatus);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const studentResponse = await studentsService.findOne(session.user.id);
			const studentResult = handleApiResponse(studentResponse, 'Success');

			if (studentResult.success && studentResult.data?.enrollments?.[0]) {
				const status = studentResult.data.enrollments[0].semester.status;
				setSemesterStatus(status);

				// Cache the result
				cacheUtils.set(entityName, cacheKey, status);
			}
		} catch (error) {
			console.error('Error fetching semester status:', error);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id, entityName]);

	useEffect(() => {
		fetchSemesterStatus();
	}, [fetchSemesterStatus]);

	const isPicking = semesterStatus === 'Picking';

	const refreshStatus = useCallback(() => {
		if (session?.user?.id) {
			// Clear cache and refetch
			cacheUtils.clear(entityName);
		}
		// Always refetch after cache clear
		fetchSemesterStatus();
	}, [session?.user?.id, entityName, fetchSemesterStatus]);

	return {
		semesterStatus,
		isPicking,
		loading,
		refreshStatus,
	};
};
