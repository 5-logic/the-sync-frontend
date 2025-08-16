"use client";

import { Alert, Space } from "antd";
import { useEffect } from "react";

import { Header } from "@/components/common/Header";
import ThesisFilterBar from "@/components/features/lecturer/ThesisManagement/ThesisFilterBar";
import ThesisTable from "@/components/features/lecturer/ThesisManagement/ThesisTable";
import { useSessionData } from "@/hooks/auth/useAuth";
import { useThesisStore } from "@/store";

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

	// Set default filter to "My Thesis" when component mounts
	useEffect(() => {
		if (selectedOwned === undefined || selectedOwned === null) {
			setSelectedOwned(true); // Default to "My Thesis"
		}
	}, [selectedOwned, setSelectedOwned]);

	const handleRefresh = () => {
		fetchTheses(true); // Force refresh
	};

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
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
