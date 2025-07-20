'use client';

import {
	ExportOutlined,
	ImportOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	Row,
	Table,
	Tag,
	Typography,
	Upload,
	message,
} from 'antd';
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
			<mark
				key={`highlight-${part}-${index}`}
				style={{ backgroundColor: '#fff2b8', padding: 0 }}
			>
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
	status: string;
	groupId: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
};

const calculateRowSpans = (data: ThesisTableData[]): ThesisTableData[] => {
	const result: ThesisTableData[] = [];
	const groupCounts: Record<string, number> = {};
	const seenGroups = new Set<string>();
	const seenMajorInGroups = new Set<string>();

	data.forEach((item) => {
		groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + 1;
	});

	data.forEach((item) => {
		const newItem = { ...item };
		if (!seenGroups.has(item.groupId)) {
			seenGroups.add(item.groupId);
			newItem.rowSpanGroup = groupCounts[item.groupId];
		} else {
			newItem.rowSpanGroup = 0;
		}

		const majorKey = `${item.groupId}-${item.major}`;
		if (!seenMajorInGroups.has(majorKey)) {
			seenMajorInGroups.add(majorKey);
			const majorCount = data.filter(
				(d) => d.groupId === item.groupId && d.major === item.major,
			).length;
			newItem.rowSpanMajor = majorCount;
		} else {
			newItem.rowSpanMajor = 0;
		}

		result.push(newItem);
	});

	return result;
};

const ThesisTable = () => {
	const [searchText, setSearchText] = useState('');
	const [showTable, setShowTable] = useState(false);

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
					status: member.defenseStatus || 'Pass', // Sử dụng defenseStatus từ data
					rowSpanGroup: 0,
					rowSpanMajor: 0,
				}))
				.sort((a, b) => a.major.localeCompare(b.major));
			tempData.push(...groupMembers);
		});

		return calculateRowSpans(tempData);
	}, []);

	// Sử dụng dữ liệu từ group.ts
	const dataToUse = baseData;

	const handleSearch = (value: string) => {
		setSearchText(value.toLowerCase());
	};

	const filteredData = useMemo(() => {
		const filtered = dataToUse.filter((item) => {
			if (!searchText) return true;
			const searchFields = [
				item.name,
				item.studentId,
				item.thesisName,
				item.major,
				item.status,
			];
			return searchFields.some((field) =>
				field.toLowerCase().includes(searchText),
			);
		});
		return calculateRowSpans(filtered);
	}, [dataToUse, searchText]);

	const renderHighlightText = (
		text: string,
		align: 'left' | 'center' = 'left',
	) => (
		<div style={{ textAlign: align }}>{highlightText(text, searchText)}</div>
	);

	const renderCellWithRowSpan = (
		content: React.ReactNode,
		rowSpan: number,
	) => ({
		children: content,
		props: { rowSpan },
	});

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
			render: (text: string) => renderHighlightText(text),
		},
		{
			title: 'Full Name',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
			render: (text: string) => renderHighlightText(text),
		},
		{
			title: 'Major',
			dataIndex: 'major',
			key: 'major',
			align: 'center',
			render: (text: string, record: ThesisTableData) =>
				renderCellWithRowSpan(
					highlightText(text, searchText),
					record.rowSpanMajor,
				),
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisName',
			key: 'thesisName',
			align: 'center',
			render: (text: string, record: ThesisTableData) =>
				renderCellWithRowSpan(
					highlightText(text, searchText),
					record.rowSpanGroup,
				),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			render: (status: string) => (
				<Tag color={status === 'Pass' ? 'green' : 'red'}>{status}</Tag>
			),
		},
	];

	const handleExcelImport = () => {
		// Chỉ hiển thị table, không xử lý file thực tế
		setShowTable(true);
		message.success('File imported successfully!');
		return false;
	};

	return (
		<>
			{/* Import Section */}
			<Row justify="center" style={{ marginBottom: 24 }}>
				<Col>
					<Upload
						beforeUpload={handleExcelImport}
						accept=".xlsx"
						showUploadList={false}
					>
						<Button
							icon={<ImportOutlined />}
							size="large"
							type="primary"
							style={{ height: 48, padding: '0 32px', fontSize: '16px' }}
						>
							Import Excel File
						</Button>
					</Upload>
				</Col>
			</Row>

			{/* Chỉ hiển thị search và table khi đã nhấn import */}
			{showTable && (
				<>
					<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 20 }}>
						<Col flex="auto">
							<Input
								placeholder="Search by name, student ID, thesis title, major, or status"
								value={searchText}
								onChange={(e) => handleSearch(e.target.value)}
								prefix={<SearchOutlined />}
								allowClear
								size="middle"
							/>
						</Col>
						<Col>
							<Button icon={<ExportOutlined />} type="primary" size="middle">
								Export PDF
							</Button>
						</Col>
					</Row>

					<Table
						columns={columns}
						dataSource={filteredData}
						pagination={TablePagination}
						rowKey={(record) => record.studentId + record.groupId}
						bordered
						rowClassName={(record, index) => {
							const currentGroup = record.groupId;
							const nextGroup = filteredData[index + 1]?.groupId;
							return currentGroup !== nextGroup ? 'group-end-row' : '';
						}}
					/>

					<Text type="secondary" style={{ marginTop: 16, display: 'block' }}>
						List includes {filteredData.length} students and{' '}
						{new Set(filteredData.map((item) => item.groupId)).size} thesis
						projects
					</Text>
				</>
			)}

			{/* Hiển thị hướng dẫn khi chưa import */}
			{!showTable && (
				<div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
					<ImportOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
					<h3 style={{ color: '#999', fontWeight: 'normal' }}>
						Please import an Excel file to view capstone defense results
					</h3>
					<p style={{ color: '#999' }}>
						The file should contain columns: Student ID, Full Name, Major,
						Thesis Title, Status, Group ID
					</p>
				</div>
			)}

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
