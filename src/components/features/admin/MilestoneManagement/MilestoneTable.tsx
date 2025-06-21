'use client';

import { EditOutlined } from '@ant-design/icons';
import { Button, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import EditMilestoneDialog from '@/components/features/admin/MilestoneManagement/EditMilestoneDialog';
import { Milestone } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

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
	};

	// Create semester lookup map
	const semesterMap = semesters.reduce(
		(acc, semester) => {
			acc[semester.id] = `${semester.name} (${semester.code})`;
			return acc;
		},
		{} as Record<string, string>,
	);
	const columns: ColumnsType<Milestone> = [
		{
			title: 'Milestone Name',
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			showSorterTooltip: false,
			width: '20%',
		},
		{
			title: 'Semester',
			dataIndex: 'semesterId',
			key: 'semesterId',
			render: (semesterId: string) => semesterMap[semesterId] ?? 'Unknown',
			sorter: (a, b) => {
				const semesterA = semesterMap[a.semesterId] || 'Unknown';
				const semesterB = semesterMap[b.semesterId] || 'Unknown';
				return semesterA.localeCompare(semesterB);
			},
			showSorterTooltip: false,
			width: '20%',
		},
		{
			title: 'Start Date',
			dataIndex: 'startDate',
			key: 'startDate',
			render: (date: Date) => new Date(date).toLocaleDateString(),
			sorter: (a, b) =>
				new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
			showSorterTooltip: false,
			width: '15%',
		},
		{
			title: 'End Date',
			dataIndex: 'endDate',
			key: 'endDate',
			render: (date: Date) => new Date(date).toLocaleDateString(),
			sorter: (a, b) =>
				new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
			showSorterTooltip: false,
			width: '15%',
		},
		{
			title: 'Created Date',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (date: Date) => new Date(date).toLocaleDateString(),
			sorter: (a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			showSorterTooltip: false,
			width: '15%',
		},
		{
			title: 'Actions',
			key: 'actions',
			width: '15%',
			align: 'center',
			render: (_, record: Milestone) => (
				<Space size="middle">
					<Tooltip title="Edit">
						<Button
							icon={<EditOutlined />}
							size="small"
							type="text"
							onClick={() => handleEdit(record)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];
	return (
		<>
			<Table
				columns={columns}
				dataSource={data}
				loading={loading}
				rowKey="id"
				pagination={{
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} items`,
					showSizeChanger: true,
					pageSizeOptions: ['5', '10', '20', '50'],
					defaultPageSize: 10,
				}}
				scroll={{ x: 'max-content' }}
				locale={{
					emptyText: loading ? 'Loading...' : 'No milestones found',
				}}
				bordered
				size="middle"
			/>{' '}
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
