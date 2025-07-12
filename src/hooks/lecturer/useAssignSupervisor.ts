import { useEffect } from 'react';

import {
	type SupervisorAssignmentData,
	useAssignSupervisorStore,
} from '@/store/useAssignSupervisorStore';

// Re-export types for external use
export type { SupervisorAssignmentData };

/**
 * Return type for useAssignSupervisor hook
 */
export interface UseAssignSupervisorReturn {
	data: SupervisorAssignmentData[];
	lecturers: Array<{ id: string; fullName: string; email: string }>;
	loading: boolean;
	error: string | null;
	assignSupervisor: (thesisId: string, lecturerId: string) => Promise<boolean>;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
}

/**
 * Custom hook for supervisor assignment logic
 */
export function useAssignSupervisor(): UseAssignSupervisorReturn {
	const {
		data,
		lecturers,
		loading,
		lastError,
		fetchData,
		assignSupervisor,
		changeSupervisor,
		refreshData,
	} = useAssignSupervisorStore();

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		lecturers,
		loading,
		error: lastError,
		assignSupervisor,
		changeSupervisor,
		refreshData,
	};
}
