'use client';

import { Button, Col, Modal, Row, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useCallback, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { FullRowSpanItem } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useSemesterExportValidation } from '@/hooks/admin/useSemesterExportValidation';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import semesterService from '@/lib/services/semesters.service';
import { exportDefenseResultsToExcel } from '@/lib/utils/defenseResultsExporter';
import { showNotification } from '@/lib/utils/notification';
import '@/styles/components.css';

const { Text } = Typography;

// Helper function to extract error message from API response
const extractErrorMessage = (error: unknown): string => {
	const defaultMessage = 'Failed to update defense results. Please try again.';

	if (error && typeof error === 'object' && 'response' in error) {
		const axiosError = error as { response?: { data?: { error?: string } } };
		return axiosError.response?.data?.error || defaultMessage;
	}

	return defaultMessage;
};

// Helper function to extract success message from API response
const extractSuccessMessage = (
	response: unknown,
	defaultMessage: string,
): string => {
	if (response && typeof response === 'object' && 'data' in response) {
		const apiResponse = response as { data?: { message?: string } };
		return apiResponse.data?.message || defaultMessage;
	}
	return defaultMessage;
};

const CapstoneDefenseResults = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);
	const [saving, setSaving] = useState(false);
	const [bulkUpdating, setBulkUpdating] = useState(false);
	const [exporting, setExporting] = useState(false);

	// Use custom hooks to reduce duplication
	const { semesters, filteredData, availableSemesters, refresh } =
		useCapstoneManagement(selectedSemester, debouncedSearchValue);

	// Set the first available semester as default when semesters are loaded
	React.useEffect(() => {
		if (availableSemesters.length > 0 && !selectedSemester) {
			setSelectedSemester(availableSemesters[0]);
		}
	}, [availableSemesters, selectedSemester]);

	// Export validation
	const exportValidation = useSemesterExportValidation(
		selectedSemester,
		semesters,
	);

	const handleSearch = (value: string) => {
		setSearchValue(value);
	};

	const handleRefresh = () => {
		refresh();
	};

	const handleExportExcel = async () => {
		// Always check validation and show notification if not allowed
		if (!exportValidation.canExport) {
			showNotification.error('Export Not Allowed', exportValidation.reason);
			return;
		}

		setExporting(true);
		try {
			const selectedStudents = filteredData.filter((student) =>
				selectedRowKeys.includes(`${student.studentId}-${student.groupId}`),
			);

			// Convert FullRowSpanItem to the format expected by export function
			const dataToExport =
				selectedStudents.length > 0 ? selectedStudents : filteredData;
			const dataForExport = dataToExport.map((item) => ({
				...item,
				thesisName:
					item.thesisName && item.thesisName !== 'Not assigned'
						? item.thesisName
						: '',
				rowSpanMajor: item.rowSpanMajor || 0,
				rowSpanGroup: item.rowSpanGroup || 0,
				rowSpanSemester: item.rowSpanSemester || 0,
			}));

			exportDefenseResultsToExcel({
				data: dataForExport,
				selectedSemester,
				statusUpdates,
			});

			showNotification.success('Success', 'Excel file exported successfully!');
		} catch (error) {
			console.error('Error exporting Excel:', error);
			showNotification.error(
				'Error',
				'Failed to export Excel file. Please try again.',
			);
		} finally {
			setExporting(false);
		}
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
		if (!selectedSemester || Object.keys(statusUpdates).length === 0) {
			return;
		}

		const updatesCount = Object.keys(statusUpdates).length;
		const passedCount = Object.values(statusUpdates).filter(
			(status) => status === 'Passed',
		).length;
		const failedCount = Object.values(statusUpdates).filter(
			(status) => status === 'Failed',
		).length;

		let detailMessage = '';
		if (passedCount > 0 && failedCount > 0) {
			detailMessage = `${passedCount} student(s) will be marked as Passed, ${failedCount} student(s) will be marked as Failed`;
		} else if (passedCount > 0) {
			detailMessage = `${passedCount} student(s) will be marked as Passed`;
		} else if (failedCount > 0) {
			detailMessage = `${failedCount} student(s) will be marked as Failed`;
		}

		ConfirmationModal.show({
			title: 'Save Defense Results',
			message: `Are you sure you want to save changes for ${updatesCount} student(s)?`,
			details: detailMessage,
			note: 'Once saved, the defense results will be updated and cannot be easily undone.',
			noteType: 'warning',
			okText: 'Yes, Save Changes',
			loading: saving,
			onOk: performSaveChanges,
		});
	};

	const performSaveChanges = async () => {
		if (!selectedSemester || Object.keys(statusUpdates).length === 0) {
			return;
		}

		setSaving(true);
		try {
			// Find the semester ID from the selected semester name
			const semester = semesters.find((s) => s.name === selectedSemester);
			if (!semester) {
				showNotification.error('Error', 'Semester not found');
				return;
			}

			// Group updates by status and get userId values
			const passedStudents: string[] = [];
			const failedStudents: string[] = [];

			Object.entries(statusUpdates).forEach(([studentCode, status]) => {
				// Find the user ID from the filtered data using studentCode
				const student = filteredData.find(
					(item) => item.studentId === studentCode,
				);
				if (student && student.userId) {
					if (status === 'Passed') {
						passedStudents.push(student.userId);
					} else if (status === 'Failed') {
						failedStudents.push(student.userId);
					}
				}
			});

			// Make API calls for each status group
			const updatePromises: Promise<unknown>[] = [];

			if (passedStudents.length > 0) {
				updatePromises.push(
					semesterService.updateEnrollments(semester.id, {
						studentIds: passedStudents,
						status: 'Passed',
					}),
				);
			}

			if (failedStudents.length > 0) {
				updatePromises.push(
					semesterService.updateEnrollments(semester.id, {
						studentIds: failedStudents,
						status: 'Failed',
					}),
				);
			}

			const responses = await Promise.all(updatePromises);

			// Clear the temporary updates and selection
			setStatusUpdates({});
			setSelectedRowKeys([]);

			// Refresh data to show updated statuses
			refresh();

			// Show success message from backend response
			const defaultMessage = 'Defense results updated successfully!';
			const message =
				responses.length > 0
					? extractSuccessMessage(responses[0], defaultMessage)
					: defaultMessage;
			showNotification.success('Success', message);
		} catch (error) {
			console.error('Error updating defense results:', error);
			showNotification.error('Error', extractErrorMessage(error));
		} finally {
			setSaving(false);
		}
	};

	const handleBulkStatusUpdate = async () => {
		if (selectedRowKeys.length === 0) return;

		const selectedStudents = filteredData.filter((student) =>
			selectedRowKeys.includes(`${student.studentId}-${student.groupId}`),
		);

		const handleBulkUpdate = async (status: 'Passed' | 'Failed') => {
			if (!selectedSemester) {
				showNotification.error('Error', 'Please select a semester');
				return;
			}

			setBulkUpdating(true);
			try {
				// Find the semester ID from the selected semester name
				const semester = semesters.find((s) => s.name === selectedSemester);
				if (!semester) {
					showNotification.error('Error', 'Semester not found');
					return;
				}

				// Get user IDs from selected rows
				const studentIds = selectedRowKeys
					.map((key) => {
						const studentCode = String(key).split('-')[0];
						const student = filteredData.find(
							(item) => item.studentId === studentCode,
						);
						return student?.userId;
					})
					.filter(Boolean) as string[];

				// Make API call
				const response = await semesterService.updateEnrollments(semester.id, {
					studentIds,
					status,
				});

				// Update local state for immediate UI feedback
				selectedRowKeys.forEach((key) => {
					const studentId = String(key).split('-')[0];
					handleStatusChange(studentId, status);
				});

				setSelectedRowKeys([]);
				Modal.destroyAll();

				// Refresh data to show updated statuses
				refresh();

				// Show message from backend response
				const defaultMessage = `Updated ${studentIds.length} student(s) to ${status}`;
				const message = extractSuccessMessage(response, defaultMessage);
				showNotification.success('Success', message);
			} catch (error) {
				console.error('Error updating defense results:', error);
				showNotification.error('Error', extractErrorMessage(error));
			} finally {
				setBulkUpdating(false);
			}
		};

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
									) || 'Not set'}
								</small>
							</div>
						))}
					</div>
					<p>Choose status to apply:</p>
				</div>
			),
			footer: () => (
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Button
						onClick={() => {
							setSelectedRowKeys([]);
							Modal.destroyAll();
						}}
					>
						Cancel
					</Button>
					<div style={{ display: 'flex', gap: 8 }}>
						<Button
							style={{
								borderColor: '#ff4d4f',
								color: 'red',
							}}
							loading={bulkUpdating}
							onClick={() => handleBulkUpdate('Failed')}
						>
							FAILED
						</Button>
						<Button
							type="primary"
							style={{
								backgroundColor: '#52c41a',
								borderColor: '#52c41a',
							}}
							loading={bulkUpdating}
							onClick={() => handleBulkUpdate('Passed')}
						>
							PASSED
						</Button>
					</div>
				</div>
			),
		});
	};

	const hasUnsavedChanges = Object.keys(statusUpdates).length > 0;

	const getDisplayStatus = useCallback(
		(originalStatus: string, studentId: string) => {
			return statusUpdates[studentId] || originalStatus;
		},
		[statusUpdates],
	);

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
							disabled={selectedRowKeys.length === 0 || saving || bulkUpdating}
							loading={bulkUpdating}
						>
							Update Defense Results
						</Button>
					</Col>
					<Col>
						<Button
							type="primary"
							onClick={handleSaveChanges}
							disabled={!hasUnsavedChanges || saving || bulkUpdating}
							loading={saving}
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
					onRefresh={handleRefresh}
					searchPlaceholder="Search..."
					showExportExcel={true}
					loading={saving || bulkUpdating || exporting}
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
