'use client';

import { Spin, Table, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import {
	calculateRowSpans,
	calculateRowSpansForExport,
} from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import { Group } from '@/lib/services/groups.service';
import {
	GroupTableDataForExport,
	exportToExcel,
} from '@/lib/utils/excelExporter';
import { showNotification } from '@/lib/utils/notification';
import { Semester } from '@/schemas/semester';
import { type GroupTableData, useCapstoneManagementStore } from '@/store';

const { Text } = Typography;

const GroupManagement: React.FC = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');

	// Use store instead of mock data
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

		// Apply semester filter only if not 'all' or undefined
		if (selectedSemester && selectedSemester !== 'all') {
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
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(term) ||
					item.studentId.toLowerCase().includes(term) ||
					item.major.toLowerCase().includes(term) ||
					(item.thesisName &&
						item.thesisName !== 'Not assigned' &&
						item.thesisName.toLowerCase().includes(term)) ||
					item.supervisor?.toLowerCase().includes(term),
			);
		}

		// Recalculate rowSpans for filtered data
		return calculateRowSpans(filtered) as GroupTableData[];
	}, [debouncedSearchValue, selectedSemester, tableData, semesters]);

	// Check if export is allowed based on semester status
	const exportValidation = useMemo(() => {
		if (selectedSemester !== 'all') {
			const selectedSemesterData = semesters.find(
				(s) => s.name === selectedSemester,
			);
			if (selectedSemesterData) {
				const { status, ongoingPhase } = selectedSemesterData;

				// Allow export for "End" status
				if (status === 'End') {
					return {
						canExport: true,
						reason: '',
					};
				}

				// Allow export for "Ongoing" status with "ScopeLocked" phase
				if (status === 'Ongoing' && ongoingPhase === 'ScopeLocked') {
					return {
						canExport: true,
						reason: '',
					};
				}

				// Block export for other cases
				if (status === 'Ongoing' && ongoingPhase !== 'ScopeLocked') {
					return {
						canExport: false,
						reason: `Export not allowed. Semester is in "Ongoing" status but phase is "${ongoingPhase}". Export requires "ScopeLocked" phase or "End" status.`,
					};
				}

				return {
					canExport: false,
					reason: `Export not allowed for semester with status "${status}". Export is only allowed for "Ongoing" semesters with "ScopeLocked" phase or "End" status.`,
				};
			}
		} else {
			// When "all" is selected, check if there are any valid semesters
			const validSemesters = semesters.filter(
				(s) =>
					s.status === 'End' ||
					(s.status === 'Ongoing' && s.ongoingPhase === 'ScopeLocked'),
			);
			if (validSemesters.length === 0) {
				return {
					canExport: false,
					reason:
						'Export not allowed. No semesters with valid export conditions found. Export requires "End" status or "Ongoing" status with "ScopeLocked" phase.',
				};
			}
		}
		return {
			canExport: true,
			reason: '',
		};
	}, [selectedSemester, semesters]);

	const handleExportExcel = () => {
		// Always check validation and show notification if not allowed
		if (!exportValidation.canExport) {
			showNotification.error('Export Not Allowed', exportValidation.reason);
			return;
		}

		// Prepare export data without semester column and with proper rowSpans
		const exportData = calculateRowSpansForExport(
			filteredData.map((item) => ({
				groupId: item.groupId,
				studentId: item.studentId,
				name: item.name,
				major: item.major,
				thesisName:
					item.thesisName && item.thesisName !== 'Not assigned'
						? item.thesisName
						: '',
				abbreviation: item.abbreviation,
				supervisor: item.supervisor,
			})),
		) as GroupTableDataForExport[];

		// Get semester display name
		const semesterDisplayName =
			selectedSemester === 'all'
				? 'ALL SEMESTERS'
				: semesters.find((s) => s.name === selectedSemester)?.name ||
					selectedSemester.toUpperCase();

		exportToExcel({
			data: exportData,
			selectedSemester,
			semesterDisplayName,
		});
	};

	const handleRefresh = async () => {
		await refresh();
	};

	const columns = useMemo(
		() =>
			getColumns(debouncedSearchValue, {
				showAbbreviationSupervisor: true,
			}),
		[debouncedSearchValue],
	);

	return (
		<Spin spinning={loading || loadingDetails}>
			<FilterBar
				searchText={searchValue}
				onSearchChange={setSearchValue}
				selectedSemester={selectedSemester}
				onSemesterChange={setSelectedSemester}
				availableSemesters={availableSemesters}
				onExportExcel={handleExportExcel}
				onRefresh={handleRefresh}
				showExportExcel={true}
				loading={loading || loadingDetails}
			/>

			<Table
				columns={columns}
				dataSource={filteredData}
				rowKey="studentId"
				pagination={TablePagination}
				bordered
			/>

			<Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
				List includes {filteredData.length} students and{' '}
				{new Set(filteredData.map((item: GroupTableData) => item.groupId)).size}{' '}
				thesis projects
			</Text>
		</Spin>
	);
};

export default GroupManagement;
