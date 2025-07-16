import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export const useStudentGroupStatus = () => {
	const { group, loading, fetchStudentGroup } = useGroupDashboardStore();
	const { data: session } = useSession();
	const [isInitialized, setIsInitialized] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isInitialized) {
			// Force refresh to bypass any cache issues
			fetchStudentGroup(true);
			setIsInitialized(true);
		}
		// ESLint disabled: We want this to run only once to initialize
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized]); // Only depend on isInitialized

	const hasGroup = group !== null;
	// Check if current user is the leader by comparing user IDs
	const currentUserId = session?.user?.id;
	const isLeader = hasGroup && group?.leader?.user?.id === currentUserId;

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
		isLeader,
		// Using || instead of ?? is intentional here - we want to show loading
		// when either the store is loading OR when not yet initialized
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		loading: loading || !isInitialized,
		resetInitialization,
		redirectToAppropriateScreen,
	};
};
