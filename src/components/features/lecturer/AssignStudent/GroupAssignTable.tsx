import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { isTextMatch } from '@/lib/utils/textNormalization';
import { GroupService as Group } from '@/schemas/group';
import { useGroupsStore } from '@/store/useGroupsStore';

interface Props {
	readonly onView?: (group: Group) => void;
}

export default function GroupAssignTable({ onView }: Props) {
	const [groupSearch, setGroupSearch] = useState('');
	const { groups, loading, fetchGroups, refetch } = useGroupsStore();

	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	const handleRefresh = () => {
		refetch(); // Use refetch method for forced refresh
	};

	const filteredGroups = useMemo(() => {
		return groups
			.filter((group) => group.semester.status === 'Preparing') // Only show groups from Preparing semester
			.sort((a, b) => (a.memberCount || 0) - (b.memberCount || 0)) // Sort by members ascending
			.filter((group) =>
				isTextMatch(groupSearch, [
					group.code,
					group.name,
					group.leader?.user?.fullName,
				]),
			);
	}, [groupSearch, groups]);

	const groupColumns: ColumnsType<Group> = useMemo(() => {
		return [
			{
				title: 'Group code',
				dataIndex: 'code',
				key: 'code',
				width: '15%',
			},
			{
				title: 'Group name',
				dataIndex: 'name',
				key: 'name',
				width: '35%',
			},
			{
				title: 'Members',
				key: 'members',
				width: '20%',
				render: (_, record: Group) => record.memberCount || 0,
			},
			{
				title: 'Leader',
				render: (_: unknown, record: Group) =>
					record.leader?.user?.fullName || 'No leader',
				key: 'leader',
				width: '20%',
			},
			{
				title: 'Actions',
				render: (_: unknown, record: Group) => (
					<Button
						type="link"
						icon={<EyeOutlined />}
						onClick={() => {
							onView?.(record);
						}}
					/>
				),
				key: 'actions',
				align: 'center' as const,
				width: '10%',
			},
		];
	}, [onView]);

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
					<Button
						icon={<ReloadOutlined />}
						onClick={handleRefresh}
						type="default"
						loading={loading} // Match loading state
					>
						Refresh
					</Button>
				</Col>
			</Row>
			<Spin spinning={loading} tip="Loading groups...">
				<Table
					rowKey="id"
					columns={groupColumns}
					dataSource={filteredGroups}
					pagination={TablePagination}
					scroll={{ x: 'max-content' }}
				/>
			</Spin>
		</Card>
	);
}
