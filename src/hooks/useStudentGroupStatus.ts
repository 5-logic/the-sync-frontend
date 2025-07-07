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
		// Using || instead of ?? is intentional here - we want to show loading
		// when either the store is loading OR when not yet initialized
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		loading: loading || !isInitialized,
		redirectToAppropriateScreen,
	};
};
