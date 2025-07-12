import { EyeOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';
import { baseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
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
			...baseColumns,
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
			},
		];
	}, [onView]);

	return (
		<Card title="Thesis Groups">
			{loading && <p>Loading...</p>}
			<div style={{ marginBottom: 16 }}>
				<GroupSearchBar value={groupSearch} onChange={setGroupSearch} />
			</div>
			<GroupOverviewTable
				data={filteredGroups}
				columns={groupColumns}
				hideStatusColumn={true}
			/>
		</Card>
	);
}
