import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';
import { ExtendedGroup } from '@/data/group';
import { Group } from '@/lib/services/groups.service';
import { useGroupsStore } from '@/store/useGroupsStore';

interface Props {
	readonly onView?: (group: ExtendedGroup) => void;
}

export default function GroupAssignTable({ onView }: Props) {
	const [groupSearch, setGroupSearch] = useState('');
	const { groups, loading, fetchGroups } = useGroupsStore();

	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	const mapGroupToExtendedGroup = (group: Group): ExtendedGroup => ({
		id: group.id,
		code: group.code,
		name: group.name,
		semesterId: group.semester.id,
		createdAt: new Date(group.createdAt),
		updatedAt: new Date(group.updatedAt),
		projectDirection: group.projectDirection || null,
		thesisId: null,
		thesisTitle: group.projectDirection || 'Untitled Thesis',
		supervisors: group.leader ? [group.leader.student.user.fullName] : [],
		members: group.memberCount,
		status:
			group.leader && group.leader.student.user.fullName
				? group.leader.student.user.fullName.length === 2
					? 'Finalized'
					: group.leader.student.user.fullName.length === 1
						? 'Incomplete'
						: 'Unassigned'
				: 'Unassigned',
	});

	const filteredGroups = useMemo(() => {
		const searchText = groupSearch.toLowerCase();
		return groups
			.map(mapGroupToExtendedGroup)
			.filter((item) =>
				[item.name, item.thesisTitle].some((field) =>
					field.toLowerCase().includes(searchText),
				),
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
				dataIndex: 'members',
				key: 'members',
				width: '20%',
			},
			{
				title: 'Leader',
				render: (_: unknown, record: ExtendedGroup) =>
					record.supervisors[0] || 'No leader',
				key: 'leader',
				width: '20%',
			},
			{
				title: 'Actions',
				render: (_: unknown, record: ExtendedGroup) => (
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
		<Card title="Thesis Groups">
			<div style={{ marginBottom: 16 }}>
				<GroupSearchBar value={groupSearch} onChange={setGroupSearch} />
			</div>
			<Spin spinning={loading}>
				<GroupOverviewTable
					data={filteredGroups}
					columns={groupColumns}
					hideStatusColumn={true}
				/>
			</Spin>
		</Card>
	);
}
