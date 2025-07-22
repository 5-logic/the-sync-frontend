'use client';

import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import type { FullMockGroup } from '@/data/group';
import { Group } from '@/lib/services/groups.service';

// Union type to support both real API data and mock data
type GroupData = Group | FullMockGroup;

interface Props<T extends GroupData = Group> {
	data: T[];
	searchText: string;
	onSearchChange: (value: string) => void;
	selectedGroup?: T;
	onGroupSelect: (group: T) => void;
	loading?: boolean;
	onRefresh?: () => void;
}

export default function GroupSearchTable<T extends GroupData = Group>({
	searchText,
	onSearchChange,
	data,
	selectedGroup,
	onGroupSelect,
	loading = false,
	onRefresh,
}: Readonly<Props<T>>) {
	const columns: ColumnsType<T> = [
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
			render: (_, record) => {
				// Handle both Group and FullMockGroup types
				if ('title' in record && record.title) {
					return record.title;
				}
				return '-';
			},
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
			render: (_, record) => {
				// Handle both Group and FullMockGroup types
				if ('leader' in record) {
					if (typeof record.leader === 'string') {
						return record.leader; // FullMockGroup case
					}
					if (
						record.leader &&
						typeof record.leader === 'object' &&
						'student' in record.leader
					) {
						return record.leader.student?.user?.fullName || '-'; // Group case
					}
				}
				return '-';
			},
		},
		{
			title: 'Members',
			key: 'memberCount',
			render: (_, record) => {
				// Handle both Group and FullMockGroup types
				if ('memberCount' in record) {
					return record.memberCount; // Group case
				}
				if ('members' in record && Array.isArray(record.members)) {
					return record.members.length; // FullMockGroup case
				}
				return '-';
			},
		},

		{
			title: 'Actions',
			align: 'center',
			key: 'actions',
			render: (_, record) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => onGroupSelect(record)}
				></Button>
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
