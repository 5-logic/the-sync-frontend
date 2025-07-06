import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export const useStudentGroupStatus = () => {
	const { group, loading, fetchStudentGroup } = useGroupDashboardStore();
	const [isInitialized, setIsInitialized] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const checkGroupStatus = async () => {
			if (!isInitialized) {
				await fetchStudentGroup();
				setIsInitialized(true);
			}
		};

		checkGroupStatus();
	}, [fetchStudentGroup, isInitialized]);

	const hasGroup = group !== null;

	const redirectToAppropriateScreen = () => {
		if (hasGroup) {
			router.push('/student/group-dashboard');
		} else {
			router.push('/student/form-or-join-group');
		}
	};

	return {
		hasGroup,
		group,
		loading: loading || !isInitialized,
		redirectToAppropriateScreen,
	};
};
