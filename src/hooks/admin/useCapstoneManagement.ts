import { useEffect, useMemo } from 'react';

import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { Group } from '@/lib/services/groups.service';
import { getCleanThesisNameForSearch } from '@/lib/utils/thesisUtils';
import { Semester } from '@/schemas/semester';
import { type GroupTableData, useCapstoneManagementStore } from '@/store';

export const useCapstoneManagement = (
	selectedSemester: string,
	debouncedSearchValue: string,
) => {
	const {
		semesters,
		loading,
		loadingDetails,
		groups,
		tableData,
		fetchGroups,
		fetchGroupDetails,
		fetchSemesters,
		refresh,
	} = useCapstoneManagementStore();

	// Fetch data on component mount
	useEffect(() => {
		const initializeData = async () => {
			await Promise.all([fetchGroups(), fetchSemesters()]);
		};
		initializeData();
	}, [fetchGroups, fetchSemesters]);

	// Fetch group details when groups are loaded
	useEffect(() => {
		if (groups.length > 0) {
			const groupIds = groups.map((group: Group) => group.id);
			fetchGroupDetails(groupIds);
		}
	}, [groups, fetchGroupDetails]);

	// Get available semesters for filter
	const availableSemesters = useMemo(() => {
		return semesters.map((semester: Semester) => semester.name);
	}, [semesters]);

	// Get filtered data using direct filtering
	const filteredData: GroupTableData[] = useMemo(() => {
		let filtered = [...tableData]; // Start with all data from store

		// Apply semester filter - always filter by specific semester
		if (selectedSemester) {
			// Find the semester code based on the selected semester name
			const semesterCode = semesters.find(
				(s) => s.name === selectedSemester,
			)?.code;
			if (semesterCode) {
				filtered = filtered.filter((item) => item.semester === semesterCode);
			}
		}

		// Apply search filter
		if (debouncedSearchValue) {
			const term = debouncedSearchValue.toLowerCase();
			filtered = filtered.filter((item) => {
				const thesisNameForSearch = getCleanThesisNameForSearch(
					item.thesisName,
				);
				return (
					item.name.toLowerCase().includes(term) ||
					item.studentId.toLowerCase().includes(term) ||
					item.major.toLowerCase().includes(term) ||
					thesisNameForSearch?.toLowerCase().includes(term) ||
					item.supervisor?.toLowerCase().includes(term)
				);
			});
		}

		// Recalculate rowSpans for filtered data
		return calculateRowSpans(filtered) as GroupTableData[];
	}, [debouncedSearchValue, selectedSemester, tableData, semesters]);

	return {
		// Data
		semesters,
		groups,
		tableData,
		filteredData,
		availableSemesters,

		// Loading states
		loading,
		loadingDetails,

		// Actions
		refresh,
	};
};
