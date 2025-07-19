'use client';

import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

const { Text } = Typography;

const highlightText = (text: string, searchTerm: string) => {
	if (!searchTerm) return text;

	const regex = new RegExp(`(${searchTerm})`, 'gi');
	const parts = text.split(regex);

	return parts.map((part, index) =>
		regex.test(part) ? (
			<mark key={index} style={{ backgroundColor: '#fff2b8', padding: 0 }}>
				{part}
			</mark>
		) : (
			part
		),
	);
};

type ThesisTableData = {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	abbreviation: string;
	supervisor: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
	groupId: string;
};

const ThesisTable = () => {
	const [searchText, setSearchText] = useState('');

	const data = useMemo((): ThesisTableData[] => {
		let counter = 1;
		const tempData: ThesisTableData[] = [];

		allMockGroups.forEach((group) => {
			const thesis = mockTheses.find((t) => t.groupId === group.id);

			// Sử dụng dữ liệu member từ group.ts
			const groupMembers = group.members.map((member) => ({
				groupId: group.id,
				stt: counter++,
				studentId: member.id,
				name: member.name,
				major: member.major,
				thesisName: thesis?.englishName || group.title,
				abbreviation: thesis?.abbreviation || group.code,
				supervisor: group.supervisors.join(', '),
				rowSpanGroup: 0,
				rowSpanMajor: 0,
			}));

			// Sắp xếp lại theo major để group các sinh viên cùng chuyên ngành
			const sortedGroupMembers = groupMembers.sort((a, b) =>
				a.major.localeCompare(b.major),
			);
			tempData.push(...sortedGroupMembers);
		});

		// Tính toán rowSpan
		const result: ThesisTableData[] = [];
		const groupCounts: Record<string, number> = {};
		const seenGroups = new Set<string>();
		const seenMajorInGroups = new Set<string>(); // track "groupId-major"

		// Đếm số lượng member trong mỗi group
		allMockGroups.forEach((group) => {
			groupCounts[group.id] = group.members.length;
		});

		// Tính rowSpan cho từng item
		tempData.forEach((item) => {
			// RowSpan cho group (thesis, abbreviation, supervisor)
			if (!seenGroups.has(item.groupId)) {
				seenGroups.add(item.groupId);
				item.rowSpanGroup = groupCounts[item.groupId];
			} else {
				item.rowSpanGroup = 0;
			}

			// RowSpan cho major - tính trong từng group
			const majorKey = `${item.groupId}-${item.major}`;
			if (!seenMajorInGroups.has(majorKey)) {
				seenMajorInGroups.add(majorKey);
				// Đếm số sinh viên cùng major trong group này
				const majorCount = tempData.filter(
					(data) => data.groupId === item.groupId && data.major === item.major,
				).length;
				item.rowSpanMajor = majorCount;
			} else {
				item.rowSpanMajor = 0;
			}

			result.push(item);
		});

		return result;
	}, []);

	const handleSearch = (value: string) => {
		setSearchText(value.toLowerCase());
	};

	const filteredData = useMemo(() => {
		// Filter dữ liệu trước
		const filtered = data.filter((item) => {
			if (!searchText) return true;

			const searchTerm = searchText.toLowerCase();

			// Search trong các trường: name, studentId, thesisName, abbreviation, supervisor, major
			const matchesName = item.name.toLowerCase().includes(searchTerm);
			const matchesStudentId = item.studentId
				.toLowerCase()
				.includes(searchTerm);
			const matchesThesisTitle = item.thesisName
				.toLowerCase()
				.includes(searchTerm);
			const matchesAbbreviation = item.abbreviation
				.toLowerCase()
				.includes(searchTerm);
			const matchesSupervisor = item.supervisor
				.toLowerCase()
				.includes(searchTerm);
			const matchesMajor = item.major.toLowerCase().includes(searchTerm);

			return (
				matchesName ||
				matchesStudentId ||
				matchesThesisTitle ||
				matchesAbbreviation ||
				matchesSupervisor ||
				matchesMajor
			);
		});

		// Tính toán lại rowSpan cho dữ liệu đã filter
		const result: ThesisTableData[] = [];
		const groupCounts: Record<string, number> = {};
		const seenGroups = new Set<string>();
		const seenMajorInGroups = new Set<string>();

		// Đếm số lượng member trong mỗi group TRONG dữ liệu đã filter
		filtered.forEach((item) => {
			groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + 1;
		});

		// Tính rowSpan cho từng item dựa trên dữ liệu đã filter
		filtered.forEach((item) => {
			const newItem = { ...item };

			// RowSpan cho group (thesis, abbreviation, supervisor)
			if (!seenGroups.has(item.groupId)) {
				seenGroups.add(item.groupId);
				newItem.rowSpanGroup = groupCounts[item.groupId];
			} else {
				newItem.rowSpanGroup = 0;
			}

			// RowSpan cho major - tính trong từng group
			const majorKey = `${item.groupId}-${item.major}`;
			if (!seenMajorInGroups.has(majorKey)) {
				seenMajorInGroups.add(majorKey);
				// Đếm số sinh viên cùng major trong group này TRONG dữ liệu đã filter
				const majorCount = filtered.filter(
					(data) => data.groupId === item.groupId && data.major === item.major,
				).length;
				newItem.rowSpanMajor = majorCount;
			} else {
				newItem.rowSpanMajor = 0;
			}

			result.push(newItem);
		});

		return result;
	}, [data, searchText]);

	const columns: ColumnsType<ThesisTableData> = [
		{
			title: 'No.',
			key: 'no',
			align: 'center' as const,
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Student ID',
			dataIndex: 'studentId',
			key: 'studentId',
			align: 'center' as const,
			render: (text: string) => (
				<div style={{ textAlign: 'left' }}>
					{highlightText(text, searchText)}
				</div>
			),
		},
		{
			title: 'Full Name',
			dataIndex: 'name',
			key: 'name',
			align: 'center' as const,
			render: (text: string) => (
				<div style={{ textAlign: 'left' }}>
					{highlightText(text, searchText)}
				</div>
			),
		},
		{
			title: 'Major',
			dataIndex: 'major',
			key: 'major',
			align: 'center' as const,
			render: (text: string, record: ThesisTableData) => ({
				children: highlightText(text, searchText),
				props: {
					rowSpan: record.rowSpanMajor,
				},
			}),
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisName',
			key: 'thesisName',
			align: 'center' as const,
			render: (text: string, record: ThesisTableData) => ({
				children: highlightText(text, searchText),
				props: {
					rowSpan: record.rowSpanGroup,
				},
			}),
		},
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
			align: 'center' as const,
			render: (abbreviation: string, record: ThesisTableData) => ({
				children: (
					<Tag color="blue">{highlightText(abbreviation, searchText)}</Tag>
				),
				props: {
					rowSpan: record.rowSpanGroup,
				},
			}),
		},
		{
			title: 'Supervisor',
			dataIndex: 'supervisor',
			key: 'supervisor',
			align: 'center' as const,
			render: (supervisor: string, record: ThesisTableData) => ({
				children: supervisor ? (
					<div style={{ textAlign: 'left' }}>
						{supervisor.split(', ').map((sup) => (
							<div key={sup}>{highlightText(sup, searchText)}</div>
						))}
					</div>
				) : (
					<span style={{ color: '#999' }}>-</span>
				),
				props: {
					rowSpan: record.rowSpanGroup,
				},
			}),
		},
	];

	return (
		<>
			<Row
				gutter={[16, 16]}
				align="middle"
				style={{ marginBottom: 20, marginTop: 20 }}
			>
				<Col flex="auto">
					<Input
						placeholder="Search by name, student ID, thesis title, abbreviation, supervisor, or major"
						value={searchText}
						onChange={(e) => handleSearch(e.target.value)}
						prefix={<SearchOutlined />}
						allowClear
						size="middle"
					/>
				</Col>
				<Col style={{ width: 200 }}>
					<Button
						icon={<DownloadOutlined />}
						type="primary"
						size="middle"
						style={{ width: '100%' }}
					>
						Export PDF
					</Button>
				</Col>
			</Row>

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

export default ThesisTable;
