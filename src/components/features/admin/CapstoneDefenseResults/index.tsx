'use client';

import {
	Button,
	Col,
	Modal,
	Row,
	Space,
	Table,
	Typography,
	message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useCallback, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import {
	FullRowSpanItem,
	calculateRowSpans,
} from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import { exportDefenseResultsToExcel } from '@/lib/utils/defenseResultsExporter';
import { Semester } from '@/schemas/semester';
import { type GroupTableData, useCapstoneManagementStore } from '@/store';
import '@/styles/components.css';

const { Text } = Typography;

const CapstoneDefenseResults = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);

	// Use store instead of mock data
	const {
		semesters,
		groups,
		tableData,
		fetchGroups,
		fetchGroupDetails,
		fetchSemesters,
	} = useCapstoneManagementStore();

	// Fetch data on component mount
	React.useEffect(() => {
		const initializeData = async () => {
			await Promise.all([fetchGroups(), fetchSemesters()]);
		};
		initializeData();
	}, [fetchGroups, fetchSemesters]);

	// Fetch group details when groups are loaded
	React.useEffect(() => {
		if (groups.length > 0) {
			const groupIds = groups.map((group) => group.id);
			fetchGroupDetails(groupIds);
		}
	}, [groups, fetchGroupDetails]);

	// Get available semesters for filter
	const availableSemesters = useMemo(() => {
		return semesters.map((semester: Semester) => semester.name);
	}, [semesters]);

	const handleSearch = (value: string) => {
		setSearchValue(value);
	};

	const handleExportExcel = () => {
		const selectedStudents = filteredData.filter((student) =>
			selectedRowKeys.includes(`${student.studentId}-${student.groupId}`),
		);

		// Convert FullRowSpanItem to the format expected by export function
		const dataToExport =
			selectedStudents.length > 0 ? selectedStudents : filteredData;
		const dataForExport = dataToExport.map((item) => ({
			...item,
			rowSpanMajor: item.rowSpanMajor || 0,
			rowSpanGroup: item.rowSpanGroup || 0,
			rowSpanSemester: item.rowSpanSemester || 0,
		}));

		exportDefenseResultsToExcel({
			data: dataForExport,
			selectedSemester,
			statusUpdates,
		});
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
		// Clear the temporary updates and selection
		setStatusUpdates({});
		setSelectedRowKeys([]);
		message.success('Cập nhật thành công!');
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
					<div
						style={{
							maxHeight: 200,
							overflowY: 'auto',
							marginBottom: 5,
							marginTop: 16,
						}}
					>
						{selectedStudents.map((student) => (
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
		const filtered = tableData.filter((item: GroupTableData) => {
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
	}, [tableData, debouncedSearchValue, selectedSemester]);

	const columns = useMemo(
		() =>
			getColumns(debouncedSearchValue, {
				showAbbreviationSupervisor: false,
				showStatus: true,
				getDisplayStatus,
				statusUpdates,
				handleStatusChange,
			}) as ColumnsType<FullRowSpanItem>, // Type assertion for compatibility
		[getDisplayStatus, debouncedSearchValue, statusUpdates],
	);

	const rowSelection: TableRowSelection<FullRowSpanItem> = {
		selectedRowKeys,
		onChange: handleRowSelectionChange,
	};

	return (
		<Space direction="vertical" size="small" style={{ width: '100%' }}>
			<div>
				<Header title="Capstone Defense Results" />
				<Row gutter={[16, 16]} align="middle" style={{ marginTop: -4 }}>
					<Col flex="auto">
						<Typography.Text type="secondary">
							View, import, and assess capstone defense results with detailed
							student info and final evaluation status.
						</Typography.Text>
					</Col>
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
			</div>

			<div style={{ marginTop: 24 }}>
				<FilterBar
					searchText={searchValue}
					onSearchChange={handleSearch}
					selectedSemester={selectedSemester}
					onSemesterChange={setSelectedSemester}
					availableSemesters={availableSemesters}
					onExportExcel={handleExportExcel}
					searchPlaceholder="Search..."
					showExportExcel={true}
				/>
			</div>

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

export default CapstoneDefenseResults;
