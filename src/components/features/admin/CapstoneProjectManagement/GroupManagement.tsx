'use client';

import { Spin, Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { calculateRowSpansForExport } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useSemesterExportValidation } from '@/hooks/admin/useSemesterExportValidation';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import {
	GroupTableDataForExport,
	exportToExcel,
} from '@/lib/utils/excelExporter';
import { showNotification } from '@/lib/utils/notification';
import { getCleanThesisNameForExport } from '@/lib/utils/thesisUtils';
import { type GroupTableData } from '@/store';

const { Text } = Typography;

const GroupManagement: React.FC = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('');

	// Use custom hooks to reduce duplication
	const {
		semesters,
		filteredData,
		availableSemesters,
		loading,
		loadingDetails,
		refresh,
	} = useCapstoneManagement(selectedSemester, debouncedSearchValue);

	// Set the first available semester as default when semesters are loaded
	React.useEffect(() => {
		if (availableSemesters.length > 0 && !selectedSemester) {
			setSelectedSemester(availableSemesters[0]);
		}
	}, [availableSemesters, selectedSemester]);

	// Export validation
	const exportValidation = useSemesterExportValidation(
		selectedSemester,
		semesters,
	);

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
				thesisName: getCleanThesisNameForExport(item.thesisName),
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
