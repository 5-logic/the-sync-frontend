import { DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Space,
	Table,
	Tag,
	Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { isTextMatch } from '@/lib/utils/textNormalization';

// Constants
const COLUMN_WIDTHS = {
	CODE: '15%',
	NAME: '35%',
	MEMBERS: '20%',
	STATUS: '15%',
	ACTIONS: '15%',
} as const;

export interface AdminGroup {
	id: string;
	name: string;
	semester: string;
	members: number;
	maxMembers: number;
	status: 'Active' | 'Full';
}

interface GroupsTableProps {
	data: AdminGroup[];
	onDelete: (id: string) => void;
	onViewDetail?: (id: string) => void;
}

const GroupsTable: React.FC<GroupsTableProps> = ({
	data,
	onDelete,
	onViewDetail,
}) => {
	const [groupSearch, setGroupSearch] = useState('');

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setGroupSearch(e.target.value);
		},
		[],
	);

	const filteredGroups = useMemo(() => {
		return data.filter((group) =>
			isTextMatch(groupSearch, [group.id, group.name, group.semester]),
		);
	}, [groupSearch, data]);

	const renderMembersCount = useCallback(
		(_: unknown, record: AdminGroup) =>
			`${record.members}/${record.maxMembers}`,
		[],
	);

	const renderStatus = useCallback(
		(_: unknown, record: AdminGroup) =>
			record.status === 'Active' ? (
				<Tag color="green">Active</Tag>
			) : (
				<Tag color="gray">Full</Tag>
			),
		[],
	);

	const renderActions = useCallback(
		(_: unknown, record: AdminGroup) => (
			<Space>
				{onViewDetail && (
					<Tooltip title="View Details">
						<Button
							type="link"
							icon={<EyeOutlined />}
							onClick={() => onViewDetail(record.id)}
							aria-label={`View details of group ${record.name}`}
						/>
					</Tooltip>
				)}
				<Tooltip title="Delete Group">
					<Button
						type="link"
						icon={<DeleteOutlined />}
						onClick={() => onDelete(record.id)}
						danger
						aria-label={`Delete group ${record.name}`}
					/>
				</Tooltip>
			</Space>
		),
		[onDelete, onViewDetail],
	);

	const columns: ColumnsType<AdminGroup> = useMemo(
		() => [
			{
				title: 'Group code',
				dataIndex: 'id',
				key: 'code',
				width: COLUMN_WIDTHS.CODE,
			},
			{
				title: 'Group name',
				dataIndex: 'name',
				key: 'name',
				width: COLUMN_WIDTHS.NAME,
			},
			{
				title: 'Members',
				render: renderMembersCount,
				key: 'members',
				width: COLUMN_WIDTHS.MEMBERS,
			},
			{
				title: 'Status',
				render: renderStatus,
				key: 'status',
				width: COLUMN_WIDTHS.STATUS,
			},
			{
				title: 'Actions',
				render: renderActions,
				key: 'actions',
				align: 'center' as const,
				width: COLUMN_WIDTHS.ACTIONS,
			},
		],
		[renderMembersCount, renderStatus, renderActions],
	);

	return (
		<Card title="Available Groups">
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
						onChange={handleSearchChange}
						aria-label="Search groups"
					/>
				</Col>
			</Row>
			<Table
				dataSource={filteredGroups}
				columns={columns}
				rowKey="id"
				pagination={TablePagination}
				scroll={{ x: 'max-content' }}
				aria-label="Groups table"
			/>
		</Card>
	);
};

export default GroupsTable;
