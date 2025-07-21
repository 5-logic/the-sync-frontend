'use client';

import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Group } from '@/lib/services/groups.service';

interface Props {
	data: Group[];
	searchText: string;
	onSearchChange: (value: string) => void;
	selectedGroup?: Group;
	onGroupSelect: (group: Group) => void;
	loading?: boolean;
	onRefresh?: () => void;
}

export default function GroupSearchTable({
	searchText,
	onSearchChange,
	data,
	selectedGroup,
	onGroupSelect,
	loading = false,
	onRefresh,
}: Readonly<Props>) {
	const columns: ColumnsType<Group> = [
		{
			title: 'Group Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Group Code',
			dataIndex: 'code',
			key: 'code',
		},
		{
			title: 'Thesis Title',
			key: 'thesisTitle',
			render: () => '-', // API chưa trả về thesis, để trống như yêu cầu
		},
		{
			title: 'Project Direction',
			dataIndex: 'projectDirection',
			key: 'projectDirection',
			render: (value: string) => value || '-',
		},
		{
			title: 'Leader',
			key: 'leader',
			render: (_, record) => record.leader?.student?.user?.fullName || '-',
		},
		{
			title: 'Members',
			dataIndex: 'memberCount',
			key: 'memberCount',
		},
		{
			title: 'Semester',
			key: 'semester',
			render: (_, record) => record.semester?.name || '-',
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => onGroupSelect(record)}
				>
					View
				</Button>
			),
		},
	];

	return (
		<Space direction="vertical" size="small" style={{ width: '100%' }}>
			<div
				style={{
					display: 'flex',
					gap: 8,
					marginBottom: 8,
					flexWrap: 'wrap',
				}}
			>
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search groups by name or project direction"
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					style={{ flex: 1, minWidth: 200 }}
				/>
				{onRefresh && (
					<Button
						icon={<ReloadOutlined />}
						onClick={onRefresh}
						loading={loading}
						style={{ flexShrink: 0 }}
					>
						Refresh
					</Button>
				)}
			</div>

			<Table
				columns={columns}
				dataSource={data}
				pagination={TablePagination}
				rowKey="id"
				loading={loading}
				rowClassName={(record) =>
					record.id === selectedGroup?.id ? 'ant-table-row-selected' : ''
				}
			/>
		</Space>
	);
}
