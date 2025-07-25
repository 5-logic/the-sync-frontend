'use client';

import { Spin, Table, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import { Group } from '@/lib/services/groups.service';
import { exportToExcel } from '@/lib/utils/excelExporter';
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
			filtered = filtered.filter((item) => item.semester === selectedSemester);
		}

		// Apply search filter
		if (debouncedSearchValue) {
			const term = debouncedSearchValue.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(term) ||
					item.studentId.toLowerCase().includes(term) ||
					item.major.toLowerCase().includes(term) ||
					item.thesisName.toLowerCase().includes(term) ||
					(item.supervisor && item.supervisor.toLowerCase().includes(term)),
			);
		}

		// Recalculate rowSpans for filtered data
		return calculateRowSpans(filtered) as GroupTableData[];
	}, [debouncedSearchValue, selectedSemester, tableData]);

	const handleExportExcel = () => {
		exportToExcel({
			data: filteredData,
			selectedSemester,
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
