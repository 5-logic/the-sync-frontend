import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import CustomGroupTable from '@/components/features/lecturer/AssignStudent/GroupTable';
import { Group } from '@/lib/services/groups.service';
import { isTextMatch } from '@/lib/utils/textNormalization';
import { useGroupsStore } from '@/store/useGroupsStore';

interface Props {
	readonly onView?: (group: Group) => void;
}

export default function GroupAssignTable({ onView }: Props) {
	const [groupSearch, setGroupSearch] = useState('');
	const { groups, loading, fetchGroups } = useGroupsStore();

	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	const handleRefresh = () => {
		useGroupsStore.getState().refetch(); // Use refetch method for forced refresh
	};

	const filteredGroups = useMemo(() => {
		return groups
			.filter((group) => group.semester.status === 'Preparing') // Only show groups from Preparing semester
			.sort((a, b) => a.memberCount - b.memberCount) // Sort by members ascending
			.filter((group) =>
				isTextMatch(groupSearch, [
					group.code,
					group.name,
					group.leader?.student?.user?.fullName,
				]),
			);
	}, [groupSearch, groups]);

	const groupColumns = useMemo(() => {
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
				dataIndex: 'memberCount',
				key: 'members',
				width: '20%',
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
				<CustomGroupTable data={filteredGroups} columns={groupColumns} />
			</Spin>
		</Card>
	);
}
