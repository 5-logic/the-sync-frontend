import { useEffect } from 'react';

import { useAssignSupervisorStore } from '@/store/useAssignSupervisorStore';

export interface SupervisorAssignmentData {
	id: string;
	thesisTitle: string;
	groupName: string;
	memberCount: number;
	supervisors: string[];
	supervisorDetails: Array<{
		id: string;
		fullName: string;
		email: string;
	}>;
	status: 'Finalized' | 'Incomplete' | 'Unassigned';
	thesisId: string;
	groupId: string | null;
}

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
