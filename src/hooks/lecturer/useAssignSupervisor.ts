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
	updating: boolean;
	error: string | null;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
	bulkAssignSupervisors: (
		assignments: Array<{
			thesisId: string;
			lecturerIds: string[];
		}>,
	) => Promise<boolean>;
}

/**
 * Custom hook for supervisor assignment logic
 */
export function useAssignSupervisor(): UseAssignSupervisorReturn {
	const {
		data,
		lecturers,
		loading,
		updating,
		lastError,
		fetchData,
		changeSupervisor,
		refreshData,
		bulkAssignSupervisors,
	} = useAssignSupervisorStore();

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		lecturers,
		loading,
		updating,
		error: lastError,
		changeSupervisor,
		refreshData,
		bulkAssignSupervisors,
	};
}
