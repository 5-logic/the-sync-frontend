'use client';

import { Table, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';

import { getColumns } from './Columns';
import { useThesisTableData } from './useThesisTableData';

const { Text } = Typography;

const GroupManagement = () => {
	const [searchText, setSearchText] = useState('');
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const { baseData, availableSemesters } = useThesisTableData();

	const filteredData = useMemo(() => {
		const filtered = baseData.filter((item) => {
			const matchesSearch =
				!searchText ||
				[
					item.name,
					item.studentId,
					item.thesisName,
					item.abbreviation,
					item.supervisor,
					item.major,
					item.semester,
				].some((field) => (field ?? '').toLowerCase().includes(searchText));
			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;
			return matchesSearch && matchesSemester;
		});
		return filtered;
	}, [baseData, searchText, selectedSemester]);

	const handleExportExcel = () => {
		console.log('Exporting to Excel...');
	};

	const columns = useMemo(
		() =>
			getColumns(searchText, {
				showAbbreviationSupervisor: true,
			}),
		[searchText],
	);

	return (
		<>
			<FilterBar
				searchText={searchText}
				onSearchChange={setSearchText}
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
				{new Set(filteredData.map((item) => item.groupId)).size} thesis projects
			</Text>
		</>
	);
};

export default GroupManagement;
