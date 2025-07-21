'use client';

import { FilterBar } from '../CapstoneProjectManagement/FilterBar';
import {
	ThesisTableData,
	useThesisTableData,
} from '../CapstoneProjectManagement/useThesisTableData';
import { Button, Col, Modal, Row, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { highlightText } from '@/components/features/admin/CapstoneProjectManagement/HighlightText';
import { RowSpanCell } from '@/components/features/admin/CapstoneProjectManagement/RowSpanCell';
import '@/styles/components.css';

const { Text } = Typography;

const GroupResults = () => {
	const [searchText, setSearchText] = useState('');
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);
	const { baseData, availableSemesters } = useThesisTableData();

	const dataToUse = baseData;

	const handleSearch = (value: string) => {
		setSearchText(value.toLowerCase());
	};

	const handleExportPdf = () => {
		console.log('Exporting to PDF...');
	};

	const handleRowSelectionChange = (newSelectedKeys: React.Key[]) => {
		setSelectedRowKeys(newSelectedKeys);
	};

	const handleStatusChange = (studentId: string, newStatus: string) => {
		setStatusUpdates((prev) => ({
			...prev,
			[studentId]: newStatus,
		}));
	};

	const handleSaveChanges = () => {
		console.log('Status updates to save:', statusUpdates);
		setStatusUpdates({});
		setSelectedRowKeys([]);
	};

	const handleBulkStatusUpdate = () => {
		if (selectedRowKeys.length === 0) return;

		const selectedStudents = filteredData.filter((student) =>
			selectedRowKeys.includes(`${student.studentId}-${student.groupId}`),
		);

		Modal.confirm({
			title: 'Update Defense Results',
			width: 500,
			content: (
				<div>
					<p>
						<strong>{selectedRowKeys.length}</strong> student(s) will be
						updated:
					</p>
					<div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
						{selectedStudents.map((student) => (
							<div key={student.studentId}>
								<b>{student.studentId}</b> - {student.name}
								<br />
								<small>
									Current:{' '}
									{getDisplayStatus(student.status!, student.studentId)}
								</small>
							</div>
						))}
					</div>
					<p>Choose status to apply:</p>
				</div>
			),
			okText: 'PASS',
			cancelText: 'FAILED',
			okType: 'primary',
			onOk: () => {
				selectedRowKeys.forEach((key) => {
					const studentId = String(key).split('-')[0];
					handleStatusChange(studentId, 'Pass');
				});
				setSelectedRowKeys([]);
			},
			onCancel: () => {
				selectedRowKeys.forEach((key) => {
					const studentId = String(key).split('-')[0];
					handleStatusChange(studentId, 'Failed');
				});
				setSelectedRowKeys([]);
			},
		});
	};

	const hasUnsavedChanges = Object.keys(statusUpdates).length > 0;

	const getDisplayStatus = (originalStatus: string, studentId: string) => {
		return statusUpdates[studentId] || originalStatus;
	};

	const filteredData = useMemo(() => {
		const filtered = dataToUse.filter((item) => {
			const matchesSearch =
				!searchText ||
				[
					item.name,
					item.studentId,
					item.thesisName,
					item.major,
					item.status,
					item.semester,
				].some((field) => (field ?? '').toLowerCase().includes(searchText));
			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;
			return matchesSearch && matchesSemester;
		});
		return filtered;
	}, [dataToUse, searchText, selectedSemester]);

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
			title: 'Semester',
			dataIndex: 'semester',
			key: 'semester',
			align: 'center',
			render: (text, record) =>
				RowSpanCell(highlightText(text, searchText), record.rowSpanSemester),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			render: (status, record) => {
				const currentStatus = getDisplayStatus(status!, record.studentId);
				const isModified = statusUpdates[record.studentId] !== undefined;
				return (
					<Select
						value={currentStatus}
						onChange={(value) => handleStatusChange(record.studentId, value)}
						style={{
							width: 120,
							border: isModified ? '2px solid #faad14' : undefined,
						}}
						size="small"
					>
						<Select.Option value="Pass">
							<span style={{ color: '#52c41a' }}>Pass</span>
						</Select.Option>
						<Select.Option value="Failed">
							<span style={{ color: '#ff4d4f' }}>Failed</span>
						</Select.Option>
					</Select>
				);
			},
		},
	];

	const rowSelection: TableRowSelection<ThesisTableData> = {
		selectedRowKeys,
		onChange: handleRowSelectionChange,
	};

	return (
		<>
			<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
				<Col flex="auto" />
				<Col>
					<Button
						onClick={handleBulkStatusUpdate}
						disabled={selectedRowKeys.length === 0}
					>
						Update Defense Results
					</Button>
				</Col>
				<Col>
					<Button
						type="primary"
						onClick={handleSaveChanges}
						disabled={!hasUnsavedChanges}
					>
						Save Changes{' '}
						{hasUnsavedChanges && `(${Object.keys(statusUpdates).length})`}
					</Button>
				</Col>
			</Row>

			<FilterBar
				searchText={searchText}
				onSearchChange={handleSearch}
				selectedSemester={selectedSemester}
				onSemesterChange={setSelectedSemester}
				availableSemesters={availableSemesters}
				onExportPdf={handleExportPdf}
				searchPlaceholder="Search..."
				showExportPdf={true}
			/>

			<Table
				className="group-results-table"
				columns={columns}
				dataSource={filteredData}
				rowKey={(record) => `${record.studentId}-${record.groupId}`}
				rowSelection={rowSelection}
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

export default GroupResults;
