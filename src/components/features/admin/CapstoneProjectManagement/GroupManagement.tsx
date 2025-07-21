'use client';

import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { highlightText } from '@/components/features/admin/CapstoneProjectManagement/HighlightText';
import { RowSpanCell } from '@/components/features/admin/CapstoneProjectManagement/RowSpanCell';

import { ThesisTableData, useThesisTableData } from './useThesisTableData';

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

	const columns: ColumnsType<ThesisTableData> = [
		{
			title: 'No.',
			key: 'no',
			align: 'center',
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			key: 'studentId',
			align: 'center',
			render: (text) => highlightText(text, searchText),
		},
		{
			title: 'Full Name',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
			render: (text) => highlightText(text, searchText),
		},
		{
			title: 'Major',
			dataIndex: 'major',
			key: 'major',
			align: 'center',
			render: (text, record) =>
				RowSpanCell(highlightText(text, searchText), record.rowSpanMajor),
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisName',
			key: 'thesisName',
			align: 'center',
			render: (text, record) =>
				RowSpanCell(highlightText(text, searchText), record.rowSpanGroup),
		},
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
			align: 'center',
			render: (abbreviation, record) =>
				RowSpanCell(
					<Tag color="blue">{highlightText(abbreviation!, searchText)}</Tag>,
					record.rowSpanGroup,
				),
		},
		{
			title: 'Supervisor',
			dataIndex: 'supervisor',
			key: 'supervisor',
			align: 'center',
			render: (supervisor, record) =>
				RowSpanCell(
					supervisor ? (
						<div style={{ textAlign: 'left' }}>
							{supervisor
								.split(', ')
								.map((sup: React.Key | null | undefined) => (
									<div key={sup}>
										{highlightText(sup ? String(sup) : '', searchText)}
									</div>
								))}
						</div>
					) : (
						<span style={{ color: '#999' }}>-</span>
					),
					record.rowSpanGroup,
				),
		},
		{
			title: 'Semester',
			dataIndex: 'semester',
			key: 'semester',
			align: 'center',
			render: (text, record) =>
				RowSpanCell(highlightText(text, searchText), record.rowSpanSemester),
		},
	];

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
