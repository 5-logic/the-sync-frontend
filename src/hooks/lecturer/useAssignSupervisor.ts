import { useEffect } from 'react';

import { type SupervisorAssignmentData } from '@/schemas/supervision';
import { useAssignSupervisorStore } from '@/store/useAssignSupervisorStore';

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
