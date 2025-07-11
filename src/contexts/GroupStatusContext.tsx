'use client';

import { ReactNode, createContext, useContext } from 'react';

import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { GroupDashboard } from '@/schemas/group';

interface GroupStatusContextType {
	hasGroup: boolean;
	group: GroupDashboard | null;
	loading: boolean;
	resetInitialization: () => void;
	redirectToAppropriateScreen: () => void;
}

const GroupStatusContext = createContext<GroupStatusContextType | undefined>(
	undefined,
);

interface GroupStatusProviderProps {
	readonly children: ReactNode;
}

export function GroupStatusProvider({ children }: GroupStatusProviderProps) {
	const groupStatus = useStudentGroupStatus();

	return (
		<GroupStatusContext.Provider value={groupStatus}>
			{children}
		</GroupStatusContext.Provider>
	);
}

export function useGroupStatus(): GroupStatusContextType {
	const context = useContext(GroupStatusContext);
	if (context === undefined) {
		throw new Error('useGroupStatus must be used within a GroupStatusProvider');
	}
	return context;
}
