'use client';

import { EditOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import EditMilestoneDialog from '@/components/features/admin/MilestoneManagement/EditMilestoneDialog';
import { formatDate } from '@/lib/utils/dateFormat';
import { SemesterStatus } from '@/schemas/_enums';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

// Status tag mapping
const STATUS_TAG: Record<SemesterStatus, JSX.Element> = {
	NotYet: <Tag color="blue">Not Yet</Tag>,
	Preparing: <Tag color="orange">Preparing</Tag>,
	Picking: <Tag color="purple">Picking</Tag>,
	Ongoing: <Tag color="green">Ongoing</Tag>,
	End: <Tag color="gray">End</Tag>,
};

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

	// Handle edit milestone
	const handleEdit = (milestone: Milestone) => {
		setSelectedMilestone(milestone);
		setEditDialogOpen(true);
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
						{STATUS_TAG[semester.status]}
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
				const isDisabled = hasStarted || semesterNotOngoing;

				let tooltipTitle = 'Edit';
				if (hasStarted) {
					tooltipTitle = 'Cannot edit milestone that has started';
				} else if (semesterNotOngoing) {
					tooltipTitle = 'Cannot edit milestone in non-ongoing semester';
				}

				return (
					<Space size="middle">
						<Tooltip title={tooltipTitle}>
							<Button
								icon={<EditOutlined />}
								size="small"
								type="text"
								disabled={isDisabled}
								onClick={() => handleEdit(record)}
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
