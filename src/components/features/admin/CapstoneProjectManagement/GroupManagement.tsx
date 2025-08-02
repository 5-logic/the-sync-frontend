'use client';

import { Spin, Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useExportGroups } from '@/hooks/admin/useExportGroups';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import { type GroupTableData } from '@/store/useCapstoneManagementStore';

const { Text } = Typography;

const GroupManagement: React.FC = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

	// Use export hook
	const { handleExportExcel } = useExportGroups();

	// Use the new hook with simplified API integration
	const {
		filteredData,
		availableSemesters,
		selectedSemesterName,
		loading,
		loadingGroups,
		refresh,
	} = useCapstoneManagement(selectedSemesterId, debouncedSearchValue);

	// Set the first available semester as default when semesters are loaded
	React.useEffect(() => {
		if (availableSemesters.length > 0 && !selectedSemesterId) {
			setSelectedSemesterId(availableSemesters[0].id);
		}
	}, [availableSemesters, selectedSemesterId]);

	// Wrapper function to match FilterBar expected signature
	const handleExportClick = () => {
		handleExportExcel(selectedSemesterId, filteredData, selectedSemesterName);
	};

	const handleRefresh = async () => {
		await refresh();
	};

	const columns = useMemo(
		() =>
			getColumns(debouncedSearchValue, {
				showAbbreviationSupervisor: true,
				showSemester: false, // Hide semester column since we're showing data for one semester
				dataSource: filteredData, // Pass dataSource for major grouping logic
			}),
		[debouncedSearchValue, filteredData],
	);

	return (
		<Spin spinning={loading || loadingGroups}>
			<FilterBar
				searchText={searchValue}
				onSearchChange={setSearchValue}
				selectedSemester={selectedSemesterId}
				onSemesterChange={setSelectedSemesterId}
				availableSemesters={availableSemesters}
				onExportExcel={handleExportClick}
				onRefresh={handleRefresh}
				showExportExcel={true}
				loading={loading || loadingGroups}
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
