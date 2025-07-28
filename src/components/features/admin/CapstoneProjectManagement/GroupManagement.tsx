'use client';

import { Spin, Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { calculateRowSpansForExport } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import {
	GroupTableDataForExport,
	exportToExcel,
} from '@/lib/utils/excelExporter';
import { showNotification } from '@/lib/utils/notification';
import { getCleanThesisNameForExport } from '@/lib/utils/thesisUtils';
import { type GroupTableData } from '@/store/useCapstoneManagementStore';

const { Text } = Typography;

const GroupManagement: React.FC = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

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

	const handleExportExcel = () => {
		// Check if semester is selected
		if (!selectedSemesterId) {
			showNotification.error(
				'Export Not Allowed',
				'Please select a semester first',
			);
			return;
		}

		// Check if there's data to export
		if (filteredData.length === 0) {
			showNotification.error(
				'Export Not Allowed',
				'No data available to export',
			);
			return;
		}

		// Prepare export data without semester column and with proper rowSpans
		const exportData = calculateRowSpansForExport(
			filteredData.map((item: GroupTableData) => ({
				groupId: item.groupId,
				studentId: item.studentId,
				name: item.name,
				major: item.major,
				thesisName: getCleanThesisNameForExport(item.thesisName),
				abbreviation: item.abbreviation,
				supervisor: item.supervisor,
			})),
		) as GroupTableDataForExport[];

		// Get semester display name
		const semesterDisplayName = selectedSemesterName || selectedSemesterId;

		exportToExcel({
			data: exportData,
			selectedSemester: selectedSemesterId,
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
				onExportExcel={handleExportExcel}
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
