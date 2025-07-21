'use client';

import { Button, Col, Modal, Row, Space, Table, Typography } from 'antd';
import type {} from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useCallback, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { calculateRowSpans } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import {
	GroupTableData,
	useGroupTableData,
} from '@/components/features/admin/CapstoneProjectManagement/useGroupTableData';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import '@/styles/components.css';

const { Text } = Typography;

const GroupResults = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);
	const [baseDataState, setBaseDataState] = useState<GroupTableData[]>([]);
	const { baseData, availableSemesters } = useGroupTableData();

	// Initialize baseDataState when baseData changes
	React.useEffect(() => {
		setBaseDataState(baseData);
	}, [baseData]);

	const dataToUse = baseDataState;

	const handleSearch = (value: string) => {
		setSearchValue(value);
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

		// Update the baseDataState with new status values
		setBaseDataState((prevData) =>
			prevData.map((student) => {
				if (statusUpdates[student.studentId]) {
					return {
						...student,
						status: statusUpdates[student.studentId],
					};
				}
				return student;
			}),
		);

		// Clear the temporary updates and selection
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
					<div
						style={{
							maxHeight: 200,
							overflowY: 'auto',
							marginBottom: 5,
							marginTop: 16,
						}}
					>
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
			okButtonProps: {
				style: {
					backgroundColor: 'transparent',
					borderColor: '#52c41a',
					color: 'green',
				},
			},
			cancelButtonProps: {
				style: {
					borderColor: '#ff4d4f',
					color: 'red',
				},
			},
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

	const getDisplayStatus = useCallback(
		(originalStatus: string, studentId: string) => {
			return statusUpdates[studentId] || originalStatus;
		},
		[statusUpdates],
	);

	const filteredData = useMemo(() => {
		const filtered = dataToUse.filter((item: GroupTableData) => {
			const matchesSearch =
				!debouncedSearchValue.trim() ||
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
						.includes(debouncedSearchValue.toLowerCase().trim()),
				);
			const matchesSemester =
				selectedSemester === 'all' || item.semester === selectedSemester;
			return matchesSearch && matchesSemester;
		});

		return calculateRowSpans(filtered);
	}, [dataToUse, debouncedSearchValue, selectedSemester]);

	const columns = useMemo(
		() =>
			getColumns(debouncedSearchValue, {
				showAbbreviationSupervisor: false,
				showStatus: true,
				getDisplayStatus,
				statusUpdates,
				handleStatusChange,
			}),
		[getDisplayStatus, debouncedSearchValue, statusUpdates],
	);

	const rowSelection: TableRowSelection<GroupTableData> = {
		selectedRowKeys,
		onChange: handleRowSelectionChange,
	};

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Capstone Defense Results"
				description="View, import, and assess capstone defense results with detailed student info and final evaluation status."
			/>
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
				searchText={searchValue}
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
		</Space>
	);
};

export default GroupResults;
