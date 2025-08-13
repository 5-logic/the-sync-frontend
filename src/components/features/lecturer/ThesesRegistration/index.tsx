"use client";

import { Alert, Space } from "antd";
import { useEffect } from "react";

import { Header } from "@/components/common/Header";
import ThesesRegistrationFilterBar from "./ThesesRegistrationFilterBar";
import ThesesRegistrationTable from "./ThesesRegistrationTable";
import { useThesisStore } from "@/store";

export default function ThesesRegistration() {
	const {
		filteredTheses,
		loading,
		lastError,
		searchText,
		selectedStatus,
		selectedSemester,
		fetchTheses,
		setSearchText,
		setSelectedStatus,
		setSelectedSemester,
		clearError,
	} = useThesisStore();

	// Fetch all theses when component mounts
	useEffect(() => {
		fetchTheses();
	}, [fetchTheses]);

	const handleRefresh = () => {
		fetchTheses(true); // Force refresh
	};

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Theses Registration"
				description="Review and approve/reject pending thesis submissions"
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

			<ThesesRegistrationFilterBar
				search={searchText}
				onSearchChange={setSearchText}
				status={selectedStatus}
				onStatusChange={setSelectedStatus}
				semester={selectedSemester}
				onSemesterChange={setSelectedSemester}
				onRefresh={handleRefresh}
			/>
			<ThesesRegistrationTable data={filteredTheses} loading={loading} />
		</Space>
	);
}
