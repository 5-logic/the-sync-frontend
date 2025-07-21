'use client';

import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

import { ExtendedFilterBar } from './ExtendedFilterBar';
import { highlightText } from './HighlightText';
import { RowSpanCell } from './RowSpanCell';
import { calculateRowSpans } from './calculateRowSpan';

const { Text } = Typography;

type ThesisTableData = {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	abbreviation: string;
	supervisor: string;
	semester: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
	rowSpanSemester: number;
	groupId: string;
};

const GroupManagement = () => {
	const [searchText, setSearchText] = useState('');
	const [selectedSemester, setSelectedSemester] = useState<string>('all');

	const baseData = useMemo((): ThesisTableData[] => {
		let counter = 1;
		const tempData: ThesisTableData[] = [];

		allMockGroups.forEach((group) => {
			const thesis = mockTheses.find((t) => t.groupId === group.id);

			const groupMembers = group.members
				.map((member) => ({
					groupId: group.id,
					stt: counter++,
					studentId: member.id,
					name: member.name,
					major: member.major,
					thesisName: thesis?.englishName || group.title,
					abbreviation: thesis?.abbreviation || group.code,
					supervisor: group.supervisors.join(', '),
					semester: group.semesterId,
					rowSpanGroup: 0,
					rowSpanMajor: 0,
					rowSpanSemester: 0,
				}))
				.sort((a, b) => a.major.localeCompare(b.major));

			tempData.push(...groupMembers);
		});

		return calculateRowSpans(tempData);
	}, []);

	const availableSemesters = useMemo(() => {
		const semesters = new Set(baseData.map((item) => item.semester));
		return Array.from(semesters).sort();
	}, [baseData]);

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
				].some((field) => field.toLowerCase().includes(searchText));

			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;

			return matchesSearch && matchesSemester;
		});
		return calculateRowSpans(filtered);
	}, [baseData, searchText, selectedSemester]);

	const renderHighlightText = (
		text: string,
		align: 'left' | 'center' = 'left',
	) => (
		<div style={{ textAlign: align }}>{highlightText(text, searchText)}</div>
	);

	const handleExportExcel = () => {
		// TODO: Implement Excel export functionality
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
			render: (text) => renderHighlightText(text),
		},
		{
			title: 'Full Name',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
			render: (text) => renderHighlightText(text),
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
					<Tag color="blue">{highlightText(abbreviation, searchText)}</Tag>,
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
							{supervisor.split(', ').map((sup: string) => (
								<div key={sup}>{highlightText(sup, searchText)}</div>
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
			<ExtendedFilterBar
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
				pagination={TablePagination}
				rowKey="studentId"
				bordered
				rowClassName={(record, index) => {
					const currentGroup = record.groupId;
					const nextGroup = filteredData[index + 1]?.groupId;
					return currentGroup !== nextGroup ? 'group-end-row' : '';
				}}
			/>

			<Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
				List includes {filteredData.length} students and{' '}
				{new Set(filteredData.map((item) => item.groupId)).size} thesis projects
			</Text>

			<style>{`
				.group-end-row {
					position: relative;
				}
				.group-end-row::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 0;
					height: 2px;
					width: 100%;
					background-color: #d9d9d9;
				}
			`}</style>
		</>
	);
};

export default GroupManagement;
