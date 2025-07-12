import { EyeOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useMemo, useState } from 'react';

import GroupOverviewTable from '@/components/features/lecturer/AssignSupervisor/GroupOverviewTable';
import GroupSearchBar from '@/components/features/lecturer/AssignSupervisor/GroupSearchBar';
import { baseColumns } from '@/components/features/lecturer/AssignSupervisor/SupervisorColumns';
import { ExtendedGroup, extendedGroups } from '@/data/group';

interface Props {
	readonly onView?: (group: ExtendedGroup) => void;
}

export default function GroupAssignTable({ onView }: Props) {
	const [groupSearch, setGroupSearch] = useState('');

	const filteredGroups = useMemo(() => {
		const searchText = groupSearch.toLowerCase();
		return extendedGroups.filter((item) =>
			[item.name, item.thesisTitle].some((field) =>
				field.toLowerCase().includes(searchText),
			),
		);
	}, [groupSearch]);

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
