import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export const useStudentGroupStatus = () => {
	const { group, loading, fetchStudentGroup } = useGroupDashboardStore();
	const [isInitialized, setIsInitialized] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isInitialized) {
			console.log('useStudentGroupStatus: fetching group status...');

			// Debug: Check localStorage
			try {
				const storedData = localStorage.getItem('group-dashboard-storage');
				console.log('Stored group data:', storedData);
			} catch (e) {
				console.log('Error reading localStorage:', e);
			}

			// Force refresh to bypass any cache issues
			fetchStudentGroup(true);
			setIsInitialized(true);
		}
		// ESLint disabled: We want this to run only once to initialize
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized]); // Only depend on isInitialized

	const hasGroup = group !== null;

	console.log('useStudentGroupStatus state:', {
		hasGroup,
		group: group?.id,
		loading,
		isInitialized,
	});

	const redirectToAppropriateScreen = () => {
		if (hasGroup) {
			router.push('/student/group-dashboard');
		} else {
			router.push('/student/form-or-join-group');
		}
	};

	const resetInitialization = () => {
		setIsInitialized(false);
	};

	return {
		hasGroup,
		group,
		// Using || instead of ?? is intentional here - we want to show loading
		// when either the store is loading OR when not yet initialized
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		loading: loading || !isInitialized,
		resetInitialization,
		redirectToAppropriateScreen,
	};
};
