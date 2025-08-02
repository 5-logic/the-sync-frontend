import { Card, Space, Spin, Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useExportGroups } from '@/hooks/admin/useExportGroups';
import { useSessionData } from '@/hooks/auth/useAuth';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import { type GroupTableData } from '@/store/useCapstoneManagementStore';

const { Title, Text } = Typography;

export function GroupInfo() {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

	// Get user session to check role
	const { session } = useSessionData();
	const isAdmin = session?.user?.role === 'admin';

	// Use export hook
	const { handleExportExcel } = useExportGroups();

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

	// Wrapper function to match FilterBar expected signature
	const handleExportClick = () => {
		handleExportExcel(selectedSemesterId, filteredData, selectedSemesterName);
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
						onExportExcel={isAdmin ? handleExportClick : undefined}
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
