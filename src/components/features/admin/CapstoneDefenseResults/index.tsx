'use client';

import { Button, Col, Row, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRowSelection } from 'antd/es/table/interface';
import React, { useCallback, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { Header } from '@/components/common/Header';
import { TablePagination } from '@/components/common/TablePagination';
import { getColumns } from '@/components/features/admin/CapstoneProjectManagement/Columns';
import { FilterBar } from '@/components/features/admin/CapstoneProjectManagement/FilterBar';
import { FullRowSpanItem } from '@/components/features/admin/CapstoneProjectManagement/calculateRowSpan';
import { useBulkDefenseUpdate } from '@/hooks/admin/useBulkDefenseUpdate';
import { useBulkUpdateModal } from '@/hooks/admin/useBulkUpdateModal';
import { useCapstoneManagement } from '@/hooks/admin/useCapstoneManagement';
import { useSemesterExportValidation } from '@/hooks/admin/useSemesterExportValidation';
import { useDebouncedSearch } from '@/hooks/ui/useDebounce';
import {
	createStatusUpdateSummary,
	getDefaultStatusBySemester,
} from '@/lib/utils/defenseResultsApi';
import { exportDefenseResultsToExcel } from '@/lib/utils/defenseResultsExporter';
import { showNotification } from '@/lib/utils/notification';
import '@/styles/components.css';

const { Text } = Typography;

const CapstoneDefenseResults = () => {
	const { searchValue, debouncedSearchValue, setSearchValue } =
		useDebouncedSearch('', 300);
	const [selectedSemester, setSelectedSemester] = useState<string>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>(
		{},
	);
	const [preConfirmStatusUpdates, setPreConfirmStatusUpdates] = useState<
		Record<string, string>
	>({});
	const [saving, setSaving] = useState(false);
	const [bulkUpdating, setBulkUpdating] = useState(false);
	const [exporting, setExporting] = useState(false);

	// Use new hooks for business logic
	const { updateIndividualStatus } = useBulkDefenseUpdate();
	const { showBulkUpdateModal } = useBulkUpdateModal();
	const { semesters, filteredData, availableSemesters, refresh, loading } =
		useCapstoneManagement(selectedSemester, debouncedSearchValue);

	// Set the first available semester as default when semesters are loaded
	React.useEffect(() => {
		if (availableSemesters.length > 0 && !selectedSemester) {
			setSelectedSemester(availableSemesters[0].id);
		}
	}, [availableSemesters, selectedSemester]);

	// Clear status updates when semester changes to ensure proper defaults
	React.useEffect(() => {
		if (selectedSemester) {
			setStatusUpdates({});
			setPreConfirmStatusUpdates({});
			setSelectedRowKeys([]);
		}
	}, [selectedSemester]);

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
		if (!selectedSemester || !hasActualChanges) {
			return;
		}

		const updatesCount = Object.keys(statusUpdates).length;
		const detailMessage = createStatusUpdateSummary(statusUpdates);

		// Store original values for potential restore (snapshot before confirm modal)
		setPreConfirmStatusUpdates({ ...statusUpdates });

		ConfirmationModal.show({
			title: 'Save Defense Results',
			message: `Are you sure you want to save changes for ${updatesCount} student(s)?`,
			details: detailMessage,
			note: 'Once saved, the defense results will be updated and cannot be easily undone.',
			noteType: 'warning',
			okText: 'Yes, Save Changes',
			loading: saving,
			onOk: performSaveChanges,
			onCancel: handleSaveCancel,
		});
	};

	const handleSaveCancel = () => {
		// Restore original values when user cancels
		setStatusUpdates(preConfirmStatusUpdates);
		setPreConfirmStatusUpdates({});
	};

	const performSaveChanges = async () => {
		if (!selectedSemester || !hasActualChanges) {
			return;
		}

		setSaving(true);
		try {
			const result = await updateIndividualStatus(statusUpdates, {
				filteredData,
				selectedSemester,
				semesters,
				onStatusChange: handleStatusChange,
				onSelectionClear: () => setSelectedRowKeys([]),
				onRefresh: refresh,
			});

			if (result.success) {
				// Clear the temporary updates and selection
				setStatusUpdates({});
				setPreConfirmStatusUpdates({});
				setSelectedRowKeys([]);
			} else {
				// Restore original values when save fails
				setStatusUpdates(preConfirmStatusUpdates);
			}
		} finally {
			setSaving(false);
			// Clear original status only after operation completes (success or error handled)
			setPreConfirmStatusUpdates({});
		}
	};

	const handleBulkStatusUpdate = () => {
		showBulkUpdateModal({
			selectedRowKeys,
			filteredData,
			selectedSemester,
			semesters,
			bulkUpdating,
			setBulkUpdating,
			onStatusChange: handleStatusChange,
			onSelectionClear: () => setSelectedRowKeys([]),
			onRefresh: refresh,
			getDisplayStatus,
		});
	};

	// Check if any changes actually differ from current displayed status
	const hasActualChanges = useMemo(() => {
		return Object.entries(statusUpdates).some(([studentId, newStatus]) => {
			const student = filteredData.find((item) => item.studentId === studentId);
			if (!student) return false;

			const currentDisplayedStatus =
				student.status && student.status !== 'NotYet'
					? student.status
					: getDefaultStatusBySemester(
							semesters.find((s) => s.id === selectedSemester) || null,
						);

			return newStatus !== currentDisplayedStatus;
		});
	}, [statusUpdates, filteredData, semesters, selectedSemester]);

	const getDisplayStatus = useCallback(
		(originalStatus: string, studentId: string) => {
			// Priority 1: User pending changes
			const pendingStatus = statusUpdates[studentId];
			if (pendingStatus) return pendingStatus;

			// Priority 2: Smart default based on current semester filter
			const currentSemester = semesters.find((s) => s.id === selectedSemester);
			const semesterBasedDefault = getDefaultStatusBySemester(
				currentSemester || null,
			);

			// Priority 3: Existing database status (only if it matches semester context)
			if (originalStatus && originalStatus !== 'NotYet') {
				// If semester suggests "NotYet" but DB has "Ongoing", prefer semester logic
				if (semesterBasedDefault === 'NotYet' && originalStatus === 'Ongoing') {
					return semesterBasedDefault;
				}
				return originalStatus;
			}

			// Priority 4: Semester-based default
			return semesterBasedDefault;
		},
		[statusUpdates, semesters, selectedSemester],
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
							disabled={!hasActualChanges || saving || bulkUpdating}
							loading={saving}
						>
							Save Changes{' '}
							{hasActualChanges && `(${Object.keys(statusUpdates).length})`}
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
				loading={loading || saving || bulkUpdating}
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
