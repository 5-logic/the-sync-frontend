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
	refreshing: boolean;
	updating: boolean;
	error: string | null;
	changeSupervisor: (
		thesisId: string,
		currentSupervisorId: string,
		newSupervisorId: string,
		silent?: boolean,
	) => Promise<boolean>;
	refreshData: () => Promise<void>;
	fetchData: (forceRefresh?: boolean, semesterId?: string) => Promise<void>;
	bulkAssignSupervisors: (
		assignments: Array<{
			thesisId: string;
			lecturerIds: string[];
		}>,
		silent?: boolean,
	) => Promise<boolean>;
}

/**
 * Custom hook for supervisor assignment logic
 * No auto-fetch to prevent loading issues when navigating between pages
 */
export function useAssignSupervisor(): UseAssignSupervisorReturn {
	const {
		data,
		lecturers,
		loading,
		refreshing,
		updating,
		lastError,
		fetchData,
		changeSupervisor,
		refreshData,
		bulkAssignSupervisors,
	} = useAssignSupervisorStore();

	// No auto-fetch to prevent loading issues when navigating between pages
	// Manual fetch will be triggered by components

	return {
		data,
		lecturers,
		loading,
		refreshing,
		updating,
		error: lastError,
		changeSupervisor,
		refreshData,
		fetchData,
		bulkAssignSupervisors,
	};
}
