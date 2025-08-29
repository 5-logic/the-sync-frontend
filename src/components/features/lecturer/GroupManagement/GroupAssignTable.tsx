import {
	DeleteOutlined,
	EyeOutlined,
	FormatPainterOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Space, Spin, Tooltip } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import SemesterFilter from '@/components/features/lecturer/GroupProgess/SemesterFilter';
import { useAdminGroupActions } from '@/hooks/admin/useAdminGroupActions';
import { useFormatGroups } from '@/hooks/admin/useFormatGroups';
import groupService, { Group } from '@/lib/services/groups.service';
import { handleApiError, handleApiResponse } from '@/lib/utils/handleApi';
import { showNotification } from '@/lib/utils/notification';
import { isTextMatch } from '@/lib/utils/textNormalization';
import { useGroupsStore } from '@/store/useGroupsStore';
import { useSemesterStore } from '@/store/useSemesterStore';

import CustomGroupTable from './GroupTable';

interface Props {
	readonly onView?: (group: Group) => void;
	readonly onDelete?: (group: Group) => void;
	readonly isAdminMode?: boolean; // New prop to determine if admin actions should be used
}

export default function GroupAssignTable({
	onView,
	onDelete,
	isAdminMode = false,
}: Props) {
	const [groupSearch, setGroupSearch] = useState('');
	const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
	const { groups, loading, fetchGroups } = useGroupsStore();
	const { semesters, fetchSemesters } = useSemesterStore();

	// Use admin-specific delete hook when in admin mode
	const { deleteGroup: adminDeleteGroup } = useAdminGroupActions();

	// Use format groups hook when in admin mode
	const { isFormatting, formatGroups } = useFormatGroups();

	useEffect(() => {
		// Fetch groups and semesters data when component mounts
		fetchGroups();
		fetchSemesters();
	}, [fetchGroups, fetchSemesters]);

	// Auto-select first active semester (prefer Preparing, Picking, Ongoing), but allow any semester
	useEffect(() => {
		if (!selectedSemester && semesters.length > 0) {
			// Prioritize active semesters for auto-selection
			const activeSemesters = semesters.filter(
				(semester) => semester.status !== 'NotYet' && semester.status !== 'End',
			);

			// Select active semester if available, otherwise select any semester
			const semesterToSelect =
				activeSemesters.length > 0 ? activeSemesters[0] : semesters[0];

			if (semesterToSelect) {
				setSelectedSemester(semesterToSelect.id);
			}
		}
	}, [selectedSemester, semesters]);

	const handleRefresh = useCallback(() => {
		useGroupsStore.getState().refetch(); // Use refetch method for forced refresh
	}, []);

	const handleFormatGroups = useCallback(
		async (semesterId: string) => {
			if (!semesterId || !isAdminMode) return;

			const semester = semesters.find((s) => s.id === semesterId);
			const semesterName = semester?.name || 'Unknown Semester';

			try {
				await formatGroups(semesterId, semesterName);
				// After successful formatting, refresh the groups data
				handleRefresh();
			} catch (error) {
				// This will catch both API errors and user cancellation
				if (
					error instanceof Error &&
					error.message !== 'User cancelled the operation'
				) {
					console.error('Format groups failed:', error);
				}
				// Don't refresh if formatting failed or was cancelled
			}
		},
		[isAdminMode, semesters, formatGroups, handleRefresh],
	);

	const handleDeleteGroup = useCallback(
		async (group: Group) => {
			if (isAdminMode) {
				// Use admin-specific delete method with enhanced error handling
				try {
					await adminDeleteGroup(group.id, group.name, () => {
						handleRefresh(); // Refresh the groups list
						onDelete?.(group); // Call optional callback
					});
				} catch (error) {
					// Error is already handled by the admin hook
					console.error('Admin delete failed:', error);
				}
				return;
			}

			// Original student/lecturer delete logic
			try {
				setDeleteLoading(group.id);

				const response = await groupService.deleteGroup(group.id);
				const result = handleApiResponse(response);

				if (result.success) {
					showNotification.success(
						'Group Deleted',
						`Group "${group.name}" has been deleted successfully!`,
					);
					handleRefresh(); // Refresh the groups list
					onDelete?.(group); // Call optional callback
				} else {
					// Handle API response error (when success: false)
					showNotification.error(
						'Delete Failed',
						result.error?.message || 'Failed to delete group',
					);
				}
			} catch (error) {
				// Handle actual errors (network, server errors, etc.)
				const { message } = handleApiError(error, 'Failed to delete group');
				showNotification.error('Delete Failed', message);
			} finally {
				setDeleteLoading(null);
			}
		},
		[isAdminMode, adminDeleteGroup, onDelete, handleRefresh],
	);

	const showDeleteConfirm = useCallback(
		(group: Group) => {
			if (isAdminMode) {
				// Use admin delete method directly (it handles its own confirmation)
				handleDeleteGroup(group);
				return;
			}

			// Original confirmation modal for student/lecturer mode
			ConfirmationModal.show({
				title: 'Delete Group',
				message: 'Are you sure you want to delete this group?',
				details: `${group.name} (${group.code})`,
				note: 'This action cannot be undone. All group data will be permanently deleted.',
				noteType: 'danger',
				okText: 'Yes, Delete',
				okType: 'danger',
				onOk: () => handleDeleteGroup(group),
				loading: deleteLoading === group.id,
			});
		},
		[isAdminMode, deleteLoading, handleDeleteGroup],
	);

	const filteredGroups = useMemo(() => {
		return groups
			.filter((group) => {
				// Filter by selected semester if available
				if (selectedSemester && group.semester.id !== selectedSemester) {
					return false;
				}
				// If no semester selected, show all groups (including End and NotYet semesters)
				return true;
			})
			.filter((group) =>
				isTextMatch(groupSearch, [
					group.code,
					group.name,
					group.leader?.student?.user?.fullName,
				]),
			);
	}, [groupSearch, groups, selectedSemester]);

	// Helper function to extract number from group code for sorting
	const extractGroupNumber = useCallback((code: string): number => {
		// Extract numbers from the end of the code (e.g., "SU25SEAI001" -> 1, "GROUP003" -> 3)
		// Using a more specific regex that matches 1-10 digits at the end to prevent potential ReDoS
		const regex = /(\d{1,10})$/;
		const match = regex.exec(code);
		return match ? parseInt(match[1], 10) : 0;
	}, []);

	const groupColumns = useMemo(() => {
		return [
			{
				title: 'Group code',
				dataIndex: 'code',
				key: 'code',
				width: '15%',
				sorter: (a: Group, b: Group) => {
					const numA = extractGroupNumber(a.code);
					const numB = extractGroupNumber(b.code);
					return numA - numB;
				},
				sortDirections: ['ascend', 'descend'] as SortOrder[],
			},
			{
				title: 'Group name',
				dataIndex: 'name',
				key: 'name',
				width: '35%',
			},
			{
				title: 'Members',
				dataIndex: 'memberCount',
				key: 'members',
				width: '20%',
				sorter: (a: Group, b: Group) => a.memberCount - b.memberCount,
				sortDirections: ['ascend', 'descend'] as SortOrder[],
			},
			{
				title: 'Leader',
				render: (_: unknown, record: Group) =>
					record.leader?.student?.user?.fullName || 'No leader',
				key: 'leader',
				width: '20%',
			},
			{
				title: 'Actions',
				render: (_: unknown, record: Group) => (
					<Space>
						<Tooltip title={'Assign Student'}>
							<Button
								type="link"
								icon={<EyeOutlined />}
								onClick={() => {
									onView?.(record);
								}}
							/>
						</Tooltip>
						{isAdminMode && (
							<Tooltip title="Delete Group">
								<Button
									type="link"
									icon={<DeleteOutlined />}
									onClick={() => showDeleteConfirm(record)}
									loading={deleteLoading === record.id}
									danger
								/>
							</Tooltip>
						)}
					</Space>
				),
				key: 'actions',
				align: 'center' as const,
				width: '15%',
			},
		];
	}, [
		onView,
		deleteLoading,
		showDeleteConfirm,
		isAdminMode,
		extractGroupNumber,
	]);

	return (
		<Card title="Active Groups">
			<Row
				gutter={[16, 16]}
				align="middle"
				justify="space-between"
				style={{ marginBottom: 16 }}
			>
				<Col flex="auto">
					<Input
						allowClear
						prefix={<SearchOutlined />}
						placeholder="Search groups"
						value={groupSearch}
						onChange={(e) => setGroupSearch(e.target.value)}
					/>
				</Col>
				<Col flex="none">
					<SemesterFilter
						selectedSemester={selectedSemester}
						onSemesterChange={setSelectedSemester}
						loading={loading}
					/>
				</Col>
				<Col flex="none">
					<Button
						icon={<ReloadOutlined />}
						onClick={handleRefresh}
						type="default"
						loading={loading} // Match loading state
					>
						Refresh
					</Button>
				</Col>
				{isAdminMode && (
					<Col flex="none">
						<Tooltip title="Format and reorganize groups in the selected semester">
							<Button
								icon={<FormatPainterOutlined />}
								onClick={() =>
									selectedSemester && handleFormatGroups(selectedSemester)
								}
								type="primary"
								loading={isFormatting}
								disabled={!selectedSemester || isFormatting}
							>
								Format
							</Button>
						</Tooltip>
					</Col>
				)}
			</Row>
			<Spin spinning={loading} tip="Loading groups...">
				<CustomGroupTable data={filteredGroups} columns={groupColumns} />
			</Spin>
		</Card>
	);
}
