'use client';

import { Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import {
	GroupTableData,
	GroupTableData as GroupTableDataType,
} from '@/components/features/admin/CapstoneProjectManagement/useGroupTableData';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';

const { Text } = Typography;

const GroupManagement = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const { baseData, availableSemesters } = GroupTableData();

	const filteredData = useMemo(() => {
		const filtered = baseData.filter((item: GroupTableDataType) => {
			const matchesSearch =
				!debouncedSearchValue.trim() ||
				[
					item.name,
					item.studentId,
					item.thesisName,
					item.abbreviation,
					item.supervisor,
					item.major,
					item.semester,
				].some((field) =>
					(field ?? '')
						.toLowerCase()
						.includes(debouncedSearchValue.toLowerCase().trim()),
				);
			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;
			return matchesSearch && matchesSemester;
		});

		// Recalculate rowSpans for filtered data
		return calculateRowSpans(filtered);
	}, [baseData, debouncedSearchValue, selectedSemester]);

	const handleExportExcel = () => {
		console.log('Exporting to Excel...');
	};

	const columns = useMemo(
		() =>
			getColumns(debouncedSearchValue, {
				showAbbreviationSupervisor: true,
			}),
		[debouncedSearchValue],
	);

	return (
		<>
			<FilterBar
				searchText={searchValue}
				onSearchChange={setSearchValue}
				selectedSemester={selectedSemester}
				onSemesterChange={setSelectedSemester}
				availableSemesters={availableSemesters}
				onExportExcel={handleExportExcel}
				showExportExcel={true}
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
					new Set(filteredData.map((item: GroupTableDataType) => item.groupId))
						.size
				}{' '}
				thesis projects
			</Text>
		</>
	);
};

export default GroupManagement;
