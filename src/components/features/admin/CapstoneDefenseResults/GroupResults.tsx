'use client';

import { getColumns } from '../CapstoneProjectManagement/Columns';
import { Button, Col, Modal, Row, Table, Typography } from 'antd';
import type {} from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useCallback, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import {
	GroupTableData,
	useGroupTableData,
} from '@/components/features/admin/CapstoneProjectManagement/useGroupTableData';
import '@/styles/components.css';

const { Text } = Typography;

const GroupResults = () => {
	const [searchText, setSearchText] = useState('');
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);
	const { baseData, availableSemesters } = useGroupTableData();

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

		const selectedStudents = filteredData.filter(
			(student: { studentId: unknown; groupId: unknown }) =>
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
						{selectedStudents.map((student: GroupTableData) => (
							<div key={String(student.studentId)}>
								<b>{student.studentId}</b> - {student.name}
								<br />
								<small>
									Current:{' '}
									{getDisplayStatus(
										student.status ?? '',
										String(student.studentId),
									)}
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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getDisplayStatus = useCallback(
		(originalStatus: string, studentId: string) => {
			return statusUpdates[studentId] || originalStatus;
		},
		[statusUpdates],
	);

	const filteredData = useMemo(() => {
		const filtered = dataToUse.filter((item: GroupTableData) => {
			const matchesSearch =
				!searchText ||
				[
					item.name,
					item.studentId,
					item.thesisName,
					item.major,
					item.status,
					item.semester,
				].some((field) =>
					String(field ?? '')
						.toLowerCase()
						.includes(searchText),
				);
			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;
			return matchesSearch && matchesSemester;
		});
		return filtered;
	}, [dataToUse, searchText, selectedSemester]);

	const columns = useMemo(
		() =>
			getColumns(searchText, {
				showStatus: true,
				getDisplayStatus,
				statusUpdates,
				handleStatusChange,
			}),
		[getDisplayStatus, searchText, statusUpdates],
	);

	const rowSelection: TableRowSelection<GroupTableData> = {
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
				{
					new Set(
						filteredData.map((item: { groupId: unknown }) => item.groupId),
					).size
				}{' '}
				thesis projects
			</Text>
		</>
	);
};

export default GroupResults;
