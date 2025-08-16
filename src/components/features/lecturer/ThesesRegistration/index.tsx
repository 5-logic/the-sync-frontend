"use client";

import { Alert, Space } from "antd";
import { useEffect, useMemo } from "react";

import { Header } from "@/components/common/Header";
import ThesesRegistrationFilterBar from "./ThesesRegistrationFilterBar";
import ThesesRegistrationTable from "./ThesesRegistrationTable";
import { useThesisStore } from "@/store";
import { createSearchFilter } from "@/store/helpers/storeHelpers";
import { Thesis } from "@/schemas/thesis";

// Create search filter for theses (same logic as in store)
const thesisSearchFilter = createSearchFilter<Thesis>((thesis) => [
	thesis.englishName,
	thesis.vietnameseName,
	thesis.abbreviation ?? "",
	thesis.description ?? "",
	thesis.domain ?? "",
]);

export default function ThesesRegistration() {
	const {
		theses, // Use unfiltered theses instead of filteredTheses to avoid cross-page filter interference
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

	/**
	 * Create filtered data specifically for ThesesRegistration page.
	 * This avoids interference from other filters like selectedOwned (My Thesis filter)
	 * that are used in the ThesisManagement page but shouldn't affect this page.
	 */
	const registrationFilteredTheses = useMemo(() => {
		let filtered = [...theses];

		// Apply search filter using same logic as store
		if (searchText.trim()) {
			filtered = thesisSearchFilter(filtered, searchText);
		}

		// Apply status filter
		if (selectedStatus) {
			filtered = filtered.filter((thesis) => {
				const thesisStatus = thesis.status.toLowerCase();
				return thesisStatus === selectedStatus;
			});
		}

		// Apply semester filter
		if (selectedSemester) {
			filtered = filtered.filter(
				(thesis) => thesis.semesterId === selectedSemester,
			);
		}

		return filtered;
	}, [theses, searchText, selectedStatus, selectedSemester]);

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
			<ThesesRegistrationTable
				data={registrationFilteredTheses}
				loading={loading}
			/>
		</Space>
	);
}
