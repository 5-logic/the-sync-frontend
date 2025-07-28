import { useEffect, useMemo } from 'react';

import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { getCleanThesisNameForSearch } from '@/lib/utils/thesisUtils';
import { Semester } from '@/schemas/semester';
import {
	type GroupTableData,
	useCapstoneManagementStore,
} from '@/store/useCapstoneManagementStore';

export const useCapstoneManagement = (
	selectedSemesterId: string,
	debouncedSearchValue: string,
) => {
	const {
		semesters,
		loading,
		loadingGroups,
		tableData,
		fetchSemesters,
		fetchGroupsBySemester,
	} = useCapstoneManagementStore();

	// Fetch semesters on component mount
	useEffect(() => {
		fetchSemesters();
	}, [fetchSemesters]);

	// Fetch groups when semester is selected
	useEffect(() => {
		if (selectedSemesterId) {
			fetchGroupsBySemester(selectedSemesterId);
		}
	}, [selectedSemesterId, fetchGroupsBySemester]);

	// Get available semesters for filter (return semester objects with id and name)
	const availableSemesters = useMemo(() => {
		return semesters.map((semester: Semester) => ({
			id: semester.id,
			name: semester.name,
			code: semester.code,
		}));
	}, [semesters]);

	// Get filtered data using direct filtering and search
	const filteredData: GroupTableData[] = useMemo(() => {
		let filtered = [...tableData]; // Start with all data from store

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
	}, [debouncedSearchValue, tableData]);

	// Get semester name for display
	const selectedSemesterName = useMemo(() => {
		const semester = semesters.find(
			(s: Semester) => s.id === selectedSemesterId,
		);
		return semester?.name || '';
	}, [semesters, selectedSemesterId]);

	return {
		// Data
		semesters,
		tableData,
		filteredData,
		availableSemesters,
		selectedSemesterName,

		// Loading states - should be true when either is loading
		loading: loading || loadingGroups,
		loadingGroups,

		// Actions
		refresh: () =>
			Promise.all([
				fetchSemesters(true),
				selectedSemesterId
					? fetchGroupsBySemester(selectedSemesterId, true)
					: Promise.resolve(),
			]),
	};
};
