'use client';

import { Alert, Space } from 'antd';
import { useEffect } from 'react';

import { Header } from '@/components/common/Header';
import ThesisFilterBar from '@/components/features/lecturer/ThesisManagement/ThesisFilterBar';
import ThesisTable from '@/components/features/lecturer/ThesisManagement/ThesisTable';
import { useSessionData } from '@/hooks/auth/useAuth';
import { useThesisStore } from '@/store';

export default function ThesisManagement() {
	const { session } = useSessionData();

	const {
		filteredTheses,
		loading,
		lastError,
		searchText,
		selectedStatus,
		selectedOwned,
		selectedSemester,
		fetchTheses,
		setSearchText,
		setSelectedStatus,
		setSelectedOwned,
		setSelectedSemester,
		setSessionLecturerId,
		clearError,
	} = useThesisStore();

	// Check if user is moderator
	const isModerator =
		session?.user?.role === 'moderator' || session?.user?.isModerator;

	// Fetch all theses when component mounts
	useEffect(() => {
		fetchTheses();
	}, [fetchTheses]);

	// Set session lecturer ID for filtering
	useEffect(() => {
		if (session?.user?.id) {
			setSessionLecturerId(session.user.id);
		}
	}, [session?.user?.id, setSessionLecturerId]);

	// Set default filter based on user role
	useEffect(() => {
		if (selectedOwned === undefined || selectedOwned === null) {
			if (isModerator) {
				setSelectedOwned(false); // Default to "All Theses" for moderator
			} else {
				setSelectedOwned(true); // Default to "My Thesis" for regular lecturer
			}
		}
	}, [selectedOwned, setSelectedOwned, isModerator]);

	const handleRefresh = () => {
		fetchTheses(true); // Force refresh
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Thesis Management"
				description="Create and manage Thesis, registration windows, and capstone-specific
					rules"
			/>

			{/* Error display */}
			{lastError && (
				<Alert
					message="Error"
					description={lastError.message}
					type="error"
					showIcon
					closable
					onClose={clearError}
				/>
			)}

			<ThesisFilterBar
				search={searchText}
				onSearchChange={setSearchText}
				status={selectedStatus}
				onStatusChange={setSelectedStatus}
				owned={selectedOwned}
				onOwnedChange={setSelectedOwned}
				semester={selectedSemester}
				onSemesterChange={setSelectedSemester}
				onRefresh={handleRefresh}
			/>
			<ThesisTable data={filteredTheses} loading={loading} />
		</Space>
	);
}
