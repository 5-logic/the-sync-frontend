'use client';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import EditMilestoneDialog from '@/components/features/admin/MilestoneManagement/EditMilestoneDialog';
import { SEMESTER_STATUS_TAGS } from '@/lib/constants/semester';
import { formatDate } from '@/lib/utils/dateFormat';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';
import { useMilestoneStore } from '@/store/useMilestoneStore';

type Props = Readonly<{
	data: Milestone[];
	loading?: boolean;
	semesters: Semester[];
}>;

export default function MilestoneTable({
	data,
	loading,
	semesters = [],
}: Props) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
		null,
	);

	// Get delete function from store
	const { deleteMilestone, deleting } = useMilestoneStore();

	// Handle edit milestone
	const handleEdit = (milestone: Milestone) => {
		setSelectedMilestone(milestone);
		setEditDialogOpen(true);
	};

	// Handle delete milestone with confirmation
	const handleDelete = (milestone: Milestone) => {
		Modal.confirm({
			title: 'Delete Milestone',
			content: (
				<div>
					<p>Are you sure you want to delete this milestone?</p>
					<p>
						<strong>Milestone:</strong> {milestone.name}
					</p>
					<p>
						<strong>Duration:</strong> {formatDate(milestone.startDate)} -{' '}
						{formatDate(milestone.endDate)}
					</p>
					<p style={{ color: '#ff4d4f', marginTop: 12 }}>
						⚠️ This action cannot be undone.
					</p>
				</div>
			),
			okText: 'Delete',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: async () => {
				return await deleteMilestone(milestone.id);
			},
		});
	};

	// Handle close edit dialog
	const handleCloseEditDialog = () => {
		setEditDialogOpen(false);
		setSelectedMilestone(null);
	}; // Create semester lookup map
	const semesterMap = semesters.reduce(
		(acc, semester) => {
			acc[semester.id] = semester;
			return acc;
		},
		{} as Record<string, Semester>,
	);
	const columns: ColumnsType<Milestone> = [
		{
			title: <FormLabel text="Milestone Name" isBold />,
			dataIndex: 'name',
			key: 'name',
			width: '20%',
		},
		{
			title: <FormLabel text="Semester" isBold />,
			dataIndex: 'semesterId',
			key: 'semesterId',
			render: (semesterId: string) => {
				const semester = semesterMap[semesterId];
				if (!semester) return 'Unknown';
				return (
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<span>{semester.name}</span>
						{SEMESTER_STATUS_TAGS[semester.status]}
					</div>
				);
			},
			width: '20%',
		},
		{
			title: <FormLabel text="Start Date" isBold />,
			dataIndex: 'startDate',
			key: 'startDate',
			render: (date: Date) => formatDate(date),
			width: '15%',
		},
		{
			title: <FormLabel text="End Date" isBold />,
			dataIndex: 'endDate',
			key: 'endDate',
			render: (date: Date) => formatDate(date),
			width: '15%',
		},
		{
			title: <FormLabel text="Created Date" isBold />,
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: Date) => formatDate(date),
			width: '15%',
		},
		{
			title: <FormLabel text="Actions" isBold />,
			key: 'actions',
			width: '15%',
			align: 'center',
			render: (_, record: Milestone) => {
				const hasStarted = dayjs(record.startDate).isBefore(dayjs(), 'day');
				const semester = semesterMap[record.semesterId];
				const semesterNotOngoing = semester
					? semester.status !== 'Ongoing'
					: true;
				const isDisabled = hasStarted ?? semesterNotOngoing;

				let editTooltipTitle = 'Edit';
				if (hasStarted) {
					editTooltipTitle = 'Cannot edit milestone that has started';
				} else if (semesterNotOngoing) {
					editTooltipTitle = 'Cannot edit milestone in non-ongoing semester';
				}

				let deleteTooltipTitle = 'Delete';
				if (hasStarted) {
					deleteTooltipTitle = 'Cannot delete milestone that has started';
				} else if (semesterNotOngoing) {
					deleteTooltipTitle =
						'Cannot delete milestone in non-ongoing semester';
				}

				return (
					<Space size="middle">
						<Tooltip title={editTooltipTitle}>
							<Button
								icon={<EditOutlined />}
								size="small"
								type="text"
								disabled={isDisabled}
								onClick={() => handleEdit(record)}
							/>
						</Tooltip>
						<Tooltip title={deleteTooltipTitle}>
							<Button
								icon={<DeleteOutlined />}
								size="small"
								type="text"
								danger
								disabled={isDisabled ?? deleting}
								onClick={() => handleDelete(record)}
							/>
						</Tooltip>
					</Space>
				);
			},
		},
	];

	// Sort data by created date (newest first)
	const sortedData = [...data].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	return (
		<>
			<Table
				columns={columns}
				dataSource={sortedData}
				loading={loading}
				rowKey="id"
				pagination={{
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
					showSizeChanger: true,
					pageSizeOptions: ['10', '20', '50', '100'],
					defaultPageSize: 10,
				}}
				scroll={{ x: 'max-content' }}
				locale={{
					emptyText: loading ? 'Loading...' : 'No milestones found',
				}}
				size="middle"
			/>
			<EditMilestoneDialog
				open={editDialogOpen}
				milestone={selectedMilestone}
				semesters={semesters}
				existingMilestones={data}
				onClose={handleCloseEditDialog}
			/>
		</>
	);
}
