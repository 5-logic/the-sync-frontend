import { Card, Space, Spin, Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { calculateRowSpansForExport } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useSessionData } from '@/hooks/auth/useAuth';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import {
	GroupTableDataForExport,
	exportToExcel,
} from '@/lib/utils/excelExporter';
import { showNotification } from '@/lib/utils/notification';
import { getCleanThesisNameForExport } from '@/lib/utils/thesisUtils';
import { type GroupTableData } from '@/store/useCapstoneManagementStore';

const { Title, Text } = Typography;

export function GroupInfo() {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

	// Get user session to check role
	const { session } = useSessionData();
	const isAdmin = session?.user?.role === 'admin';

	// Use the same hook as CapstoneProjectManagement
	const {
		filteredData,
		availableSemesters,
		loading,
		loadingGroups,
		refresh,
		selectedSemesterName,
	} = useCapstoneManagement(selectedSemesterId, debouncedSearchValue);

	// Set the first available semester as default when semesters are loaded
	React.useEffect(() => {
		if (availableSemesters.length > 0 && !selectedSemesterId) {
			setSelectedSemesterId(availableSemesters[0].id);
		}
	}, [availableSemesters, selectedSemesterId]);

	const handleRefresh = async () => {
		await refresh();
	};

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
			semesterDisplayName: semesterDisplayName,
			filename: `Groups_${semesterDisplayName}_${new Date().toISOString().split('T')[0]}`,
		});

		showNotification.success(
			'Export Successful',
			'Data has been exported to Excel successfully',
		);
	};

	// Use the same column configuration but simplified for dashboard
	const columns = useMemo(
		() =>
			getColumns(debouncedSearchValue, {
				showAbbreviationSupervisor: true,
				showSemester: false, // Hide semester since we show for one semester
				dataSource: filteredData,
			}),
		[debouncedSearchValue, filteredData],
	);

	return (
		<Card>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<div>
					<Title level={4} style={{ margin: 0, marginBottom: 8 }}>
						Groups Table
					</Title>
					<Text type="secondary">
						List of student groups that have selected and been assigned thesis
						topics.
					</Text>
				</div>

				<Spin spinning={loading || loadingGroups}>
					<FilterBar
						searchText={searchValue}
						onSearchChange={setSearchValue}
						selectedSemester={selectedSemesterId}
						onSemesterChange={setSelectedSemesterId}
						availableSemesters={availableSemesters}
						onExportExcel={isAdmin ? handleExportExcel : undefined}
						onRefresh={handleRefresh}
						showExportExcel={isAdmin} // Only show export button for admin
						loading={loading || loadingGroups}
						searchPlaceholder="Search thesis, group, supervisor"
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
						{
							new Set(filteredData.map((item: GroupTableData) => item.groupId))
								.size
						}{' '}
						thesis projects
					</Text>
				</Spin>
			</Space>
		</Card>
	);
}
