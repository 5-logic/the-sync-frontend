'use client';

import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { ConfirmationModal } from '@/components/common/ConfirmModal';
import { TablePagination } from '@/components/common/TablePagination';
import { useNavigationLoader } from '@/hooks/ux/useNavigationLoader';
import { showNotification } from '@/lib/utils/notification';
import { Checklist } from '@/schemas/checklist';
import { useChecklistStore } from '@/store';

interface Props {
	readonly data: Checklist[];
	readonly getTotalItems: (checklistId: string) => number;
	readonly loading?: boolean;
}

export default function ChecklistTable({
	data,
	getTotalItems,
	loading = false,
}: Props) {
	const { navigateWithLoading } = useNavigationLoader();
	const { deleteChecklist } = useChecklistStore();
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	const handleDelete = (checklist: Checklist) => {
		ConfirmationModal.show({
			title: 'Delete Checklist',
			message: 'Are you sure you want to delete this checklist?',
			details: checklist.name,
			note: 'This action cannot be undone.',
			noteType: 'danger',
			okText: 'Yes, Delete',
			cancelText: 'Cancel',
			okType: 'danger',
			onOk: async () => {
				setDeletingIds((prev) => new Set(prev).add(checklist.id));
				const success = await deleteChecklist(checklist.id);
				setDeletingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(checklist.id);
					return newSet;
				});

				if (success) {
					showNotification.success('Success', 'Checklist deleted successfully');
				} else {
					showNotification.error('Delete Failed', 'Failed to delete checklist');
				}
			},
		});
	};

	const handleView = (checklist: Checklist) => {
		navigateWithLoading(`/lecturer/checklist-management/${checklist.id}`);
	};

	const columns: ColumnsType<Checklist> = [
		{
			title: 'Checklist Name',
			dataIndex: 'name',
			key: 'name',
			width: '30%',
			sorter: (a, b) => a.name.localeCompare(b.name),
			ellipsis: {
				showTitle: false,
			},
			render: (text: string) => (
				<Tooltip title={text} placement="topLeft">
					<div
						style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{text}
					</div>
				</Tooltip>
			),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			width: '35%',
			ellipsis: {
				showTitle: false,
			},
			render: (text: string | null) => {
				if (!text) {
					return <i style={{ color: '#999' }}>No description</i>;
				}
				return (
					<Tooltip title={text} placement="topLeft">
						<div
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{text}
						</div>
					</Tooltip>
				);
			},
		},
		{
			title: 'Milestone',
			dataIndex: 'milestone',
			key: 'milestone',
			width: '12%',
			ellipsis: {
				showTitle: false,
			},
			render: (milestone: { name: string } | null) => {
				if (!milestone?.name) {
					return <i>-</i>;
				}
				return (
					<Tooltip title={milestone.name} placement="topLeft">
						<div
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{milestone.name}
						</div>
					</Tooltip>
				);
			},
		},
		{
			title: 'Items',
			key: 'totalItems',
			width: '8%',
			sorter: (a, b) => getTotalItems(a.id) - getTotalItems(b.id),
			render: (_, record) => <span>{getTotalItems(record.id)}</span>,
		},
		{
			title: 'Actions',
			key: 'actions',
			width: '15%',
			align: 'center',
			render: (_, record) => (
				<Space size="small">
					<Tooltip title="View Details">
						<Button
							type="text"
							icon={<EyeOutlined />}
							size="small"
							onClick={() => handleView(record)}
						/>
					</Tooltip>
					<Tooltip title="Edit">
						<Button
							type="text"
							icon={<EditOutlined />}
							size="small"
							onClick={() => {
								navigateWithLoading(
									`/lecturer/checklist-management/${record.id}/edit`,
								);
							}}
						/>
					</Tooltip>
					<Tooltip title="Delete">
						<Button
							type="text"
							icon={<DeleteOutlined />}
							size="small"
							danger
							loading={deletingIds.has(record.id)}
							onClick={() => handleDelete(record)}
						/>
					</Tooltip>
				</Space>
			),
		},
	];

	return (
		<>
			<Table
				rowKey="id"
				columns={columns}
				dataSource={data}
				loading={loading}
				pagination={{
					...TablePagination,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (total, range) =>
						`${range[0]}-${range[1]} of ${total} checklists`,
				}}
				scroll={{ x: 800 }}
				size="middle"
				showSorterTooltip={false}
				style={{ background: '#fff' }}
				locale={{
					emptyText: (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description="No checklists found"
						/>
					),
				}}
			/>
		</>
	);
}
