'use client';

import { Button, Col, Modal, Row, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { ExtendedFilterBar } from '@/components/features/admin/CapstoneProjectManagement/ExtendedFilterBar';
import { highlightText } from '@/components/features/admin/CapstoneProjectManagement/HighlightText';
import { RowSpanCell } from '@/components/features/admin/CapstoneProjectManagement/RowSpanCell';
import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

const { Text } = Typography;

type ThesisTableData = {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	status: string;
	groupId: string;
	semester: string;
	rowSpanGroup: number;
	rowSpanMajor: number;
	rowSpanSemester: number;
};

const GroupResults = () => {
	const [searchText, setSearchText] = useState('');
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);

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
					semester: group.semesterId, // Thêm semester từ group
					rowSpanGroup: 0,
					rowSpanMajor: 0,
					rowSpanSemester: 0,
				}))
				.sort((a, b) => a.major.localeCompare(b.major));
			tempData.push(...groupMembers);
		});

		return calculateRowSpans(tempData);
	}, []);

	// Get unique semesters for filter buttons
	const availableSemesters = useMemo(() => {
		const semesters = new Set(baseData.map((item) => item.semester));
		return Array.from(semesters).sort();
	}, [baseData]);

	// Sử dụng dữ liệu từ group.ts
	const dataToUse = baseData;

	const handleSearch = (value: string) => {
		setSearchText(value.toLowerCase());
	};

	const handleExportPdf = () => {
		// TODO: Implement PDF export functionality
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
		// TODO: Implement API call to save status changes
		console.log('Status updates to save:', statusUpdates);

		// For now, just clear the updates and show success
		setStatusUpdates({});
		setSelectedRowKeys([]);

		// You can add notification here
		// showNotification.success('Changes Saved', 'Defense results updated successfully');
	};

	const handleBulkStatusUpdate = () => {
		if (selectedRowKeys.length === 0) return;

		// Get selected students info for display
		const selectedStudents = filteredData.filter((student) =>
			selectedRowKeys.includes(`${student.studentId}-${student.groupId}`),
		);

		Modal.confirm({
			title: 'Update Defense Results',
			width: 500,
			content: (
				<div style={{ marginTop: 16 }}>
					<p style={{ fontSize: '16px', marginBottom: 16 }}>
						You are about to update defense results for{' '}
						<strong>{selectedRowKeys.length} student(s)</strong>:
					</p>
					<div
						style={{
							maxHeight: '200px',
							overflowY: 'auto',
							border: '1px solid #d9d9d9',
							borderRadius: '6px',
							padding: '12px',
							backgroundColor: '#fafafa',
							marginBottom: 16,
						}}
					>
						{selectedStudents.map((student, index) => (
							<div
								key={student.studentId}
								style={{
									padding: '4px 0',
									borderBottom:
										index < selectedStudents.length - 1
											? '1px solid #e8e8e8'
											: 'none',
								}}
							>
								<strong>{student.studentId}</strong> - {student.name}
								<br />
								<span style={{ color: '#666', fontSize: '12px' }}>
									Current: {getDisplayStatus(student.status, student.studentId)}
								</span>
							</div>
						))}
					</div>
					<p style={{ color: '#666', marginBottom: 0 }}>
						Please choose the result to apply to all selected students:
					</p>
				</div>
			),
			okText: 'PASS',
			cancelText: 'FAILED',
			okType: 'primary',
			okButtonProps: {
				style: { backgroundColor: '#52c41a', borderColor: '#52c41a' },
			},
			cancelButtonProps: {
				danger: true,
				style: { color: '#ff4d4f', borderColor: '#ff4d4f' },
			},
			onOk: () => {
				// Apply Pass status to all selected students
				selectedRowKeys.forEach((key) => {
					const rowKey = String(key);
					const studentId = rowKey.split('-')[0];
					handleStatusChange(studentId, 'Pass');
				});
				// Clear selection after update
				setSelectedRowKeys([]);
			},
			onCancel: () => {
				// Apply Failed status to all selected students
				selectedRowKeys.forEach((key) => {
					const rowKey = String(key);
					const studentId = rowKey.split('-')[0];
					handleStatusChange(studentId, 'Failed');
				});
				// Clear selection after update
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
			// Search filter
			const matchesSearch =
				!searchText ||
				[
					item.name,
					item.studentId,
					item.thesisName,
					item.major,
					item.status,
					item.semester,
				].some((field) => field.toLowerCase().includes(searchText));

			// Semester filter
			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;

			return matchesSearch && matchesSemester;
		});
		return calculateRowSpans(filtered);
	}, [dataToUse, searchText, selectedSemester]);

	const renderHighlightText = (
		text: string,
		align: 'left' | 'center' = 'left',
	) => (
		<div style={{ textAlign: align }}>{highlightText(text, searchText)}</div>
	);

	const renderCellWithRowSpan = (content: React.ReactNode, rowSpan: number) =>
		RowSpanCell(content, rowSpan);

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
			title: 'Semester',
			dataIndex: 'semester',
			key: 'semester',
			align: 'center',
			render: (text: string, record: ThesisTableData) =>
				renderCellWithRowSpan(
					highlightText(text, searchText),
					record.rowSpanSemester,
				),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			align: 'center',
			render: (status: string, record: ThesisTableData) => {
				const currentStatus = getDisplayStatus(status, record.studentId);
				const isModified = statusUpdates[record.studentId] !== undefined;

				return (
					<Select
						value={currentStatus}
						onChange={(newStatus) =>
							handleStatusChange(record.studentId, newStatus)
						}
						style={{
							width: 120,
							border: isModified ? '2px solid #faad14' : undefined,
						}}
						size="small"
						dropdownStyle={{ minWidth: 120 }}
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
		getCheckboxProps: () => ({
			disabled: false, // Có thể thêm logic disable nếu cần
		}),
		columnWidth: 50,
	};

	return (
		<>
			{/* Header row with action buttons */}
			<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
				<Col flex="auto">{/* Empty space for alignment */}</Col>
				<Col>
					<Button
						type="default"
						size="middle"
						onClick={handleBulkStatusUpdate}
						disabled={selectedRowKeys.length === 0}
						style={{
							backgroundColor:
								selectedRowKeys.length > 0 ? '#f0f9ff' : '#f5f5f5',
							borderColor: selectedRowKeys.length > 0 ? '#1890ff' : '#d9d9d9',
							color: selectedRowKeys.length > 0 ? '#1890ff' : '#bfbfbf',
						}}
					>
						Update Defense Results
					</Button>
				</Col>
				<Col>
					<Button
						type="primary"
						size="middle"
						onClick={handleSaveChanges}
						disabled={!hasUnsavedChanges}
						style={{
							backgroundColor: hasUnsavedChanges ? '#52c41a' : '#f5f5f5',
							borderColor: hasUnsavedChanges ? '#52c41a' : '#d9d9d9',
							color: hasUnsavedChanges ? '#ffffff' : '#bfbfbf',
						}}
					>
						Save Changes{' '}
						{hasUnsavedChanges && `(${Object.keys(statusUpdates).length})`}
					</Button>
				</Col>
			</Row>

			<ExtendedFilterBar
				searchText={searchText}
				onSearchChange={handleSearch}
				selectedSemester={selectedSemester}
				onSemesterChange={setSelectedSemester}
				availableSemesters={availableSemesters}
				onExportPdf={handleExportPdf}
				searchPlaceholder="Search by name, student ID, thesis title, major, semester, or status"
				showExportPdf={true}
			/>

			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={TablePagination}
				rowKey={(record) => `${record.studentId}-${record.groupId}`}
				rowSelection={rowSelection}
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
				{selectedRowKeys.length > 0 && (
					<span style={{ marginLeft: 16, color: '#1890ff' }}>
						• {selectedRowKeys.length} student(s) selected
					</span>
				)}
				{hasUnsavedChanges && (
					<span style={{ marginLeft: 16, color: '#faad14' }}>
						• {Object.keys(statusUpdates).length} unsaved change(s)
					</span>
				)}
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
				/* Remove background color for all selected row cells */
				.ant-table-tbody > tr.ant-table-row-selected > td {
					background-color: transparent !important;
				}
				/* Only highlight first 3 columns (No., Student ID, Full Name) for selected rows */
				.ant-table-tbody > tr.ant-table-row-selected > td:nth-child(2),
				.ant-table-tbody > tr.ant-table-row-selected > td:nth-child(3),
				.ant-table-tbody > tr.ant-table-row-selected > td:nth-child(4) {
					background-color: #e6f4ff !important;
				}
				/* Hover effect for selected rows - only first 3 columns */
				.ant-table-tbody > tr.ant-table-row-selected:hover > td:nth-child(2),
				.ant-table-tbody > tr.ant-table-row-selected:hover > td:nth-child(3),
				.ant-table-tbody > tr.ant-table-row-selected:hover > td:nth-child(4) {
					background-color: #bae0ff !important;
				}
			`}</style>
		</>
	);
};

export default GroupResults;
