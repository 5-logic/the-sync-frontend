import { useCallback, useEffect, useState } from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { useCurrentSemester } from '@/hooks/semester';
import groupsService from '@/lib/services/groups.service';
import thesisApplicationService, {
	ThesisApplication,
} from '@/lib/services/thesis-application.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';

export const useThesisApplications = () => {
	const [applications, setApplications] = useState<ThesisApplication[]>([]);
	const [loading, setLoading] = useState(false);
	const [initialized, setInitialized] = useState(false);
	const [groupId, setGroupId] = useState<string | null>(null);
	const { currentSemester } = useCurrentSemester();
	const { session } = useSessionData();

	// Get group by student ID
	const fetchStudentGroup = useCallback(async () => {
		if (!session?.user?.id) return;

		try {
			const response = await groupsService.getStudentGroupById(session.user.id);
			const result = handleApiResponse(response, 'Success');

			if (result.success && result.data) {
				// groupsService returns array, take first group
				const group = Array.isArray(result.data) ? result.data[0] : result.data;
				setGroupId(group?.id);
			}
		} catch (error) {
			console.error('Error fetching student group:', error);
			const apiError = handleApiError(
				error,
				'Failed to fetch group information.',
			);
			showNotification.error('Error', apiError.message);
		}
	}, [session?.user?.id]);

	// Fetch thesis applications
	const fetchApplications = useCallback(async () => {
		if (!currentSemester?.id || !groupId) {
			setInitialized(true);
			return;
		}

		try {
			setLoading(true);

			const response = await thesisApplicationService.getThesisApplications(
				currentSemester.id,
				groupId,
			);
			const result = handleApiResponse(response, 'Success');

			if (result.success && result.data) {
				setApplications(result.data);
			}
		} catch (error) {
			console.error('Error fetching thesis applications:', error);
			const apiError = handleApiError(
				error,
				'Failed to fetch thesis applications.',
			);
			showNotification.error('Error', apiError.message);
		} finally {
			setLoading(false);
			setInitialized(true);
		}
	}, [currentSemester?.id, groupId]);

	// Refresh applications
	const refreshApplications = useCallback(async () => {
		await fetchApplications();
	}, [fetchApplications]);

	// Initialize data
	useEffect(() => {
		fetchStudentGroup();
	}, [fetchStudentGroup]);

	useEffect(() => {
		if (groupId) {
			fetchApplications();
		}
	}, [groupId, fetchApplications]);

	return {
		applications,
		loading,
		initialized,
		groupId,
		refreshApplications,
	};
};
