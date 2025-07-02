'use client';

import { Alert, Space, Typography } from 'antd';
import { useEffect } from 'react';

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
		fetchTheses,
		setSearchText,
		setSelectedStatus,
		setSelectedOwned,
		setSessionLecturerId,
		clearError,
	} = useThesisStore();

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

	const handleRefresh = () => {
		fetchTheses(true); // Force refresh
	};

	const { Title, Paragraph } = Typography;

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Thesis Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage Thesis, registration windows, and capstone-specific
					rules
				</Paragraph>
			</div>

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
				onRefresh={handleRefresh}
			/>
			<ThesisTable data={filteredTheses} loading={loading} />
		</Space>
	);
}
