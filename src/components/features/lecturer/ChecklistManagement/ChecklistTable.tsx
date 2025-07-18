'use client';

import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { useNavigationLoader } from '@/hooks/ux/useNavigationLoader';
import { Checklist } from '@/schemas/checklist';
import { useChecklistStore } from '@/store';

const { Text } = Typography;

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
	const { deleteChecklist, deleting } = useChecklistStore();

	const handleDelete = (checklist: Checklist) => {
		Modal.confirm({
			title: 'Delete Checklist',
			content: (
				<div>
					Are you sure you want to delete the checklist{' '}
					<Text strong>&quot;{checklist.name}&quot;</Text>?
					<br />
					This action cannot be undone.
				</div>
			),
			okText: 'Delete',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: async () => {
				await deleteChecklist(checklist.id);
			},
			centered: true,
		});
	};

	const handleView = (checklist: Checklist) => {
		navigateWithLoading(`/lecturer/checklist-detail/${checklist.id}`);
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
								navigateWithLoading(`/lecturer/checklist-edit/${record.id}`);
							}}
						/>
					</Tooltip>
					<Tooltip title="Delete">
						<Button
							type="text"
							icon={<DeleteOutlined />}
							size="small"
							danger
							loading={deleting}
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
					emptyText: 'No checklists found',
				}}
			/>
		</>
	);
}
