import GroupOverviewTable from '../AssignSupervisor/GroupOverviewTable';
import { baseColumns } from '../AssignSupervisor/SupervisorColumns';
import { EyeOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import type { ExtendedGroup } from '@/data/group';

export default function GroupAssignTable({
	data,
	onView,
}: {
	data: ExtendedGroup[];
	onView?: (group: ExtendedGroup) => void;
}) {
	const columns = [
		...baseColumns,
		{
			title: 'Actions',
			render: (_: unknown, record: ExtendedGroup) => (
				<Button
					type="link"
					icon={<EyeOutlined />}
					onClick={() => onView?.(record)}
				></Button>
			),
		},
	];

	return <GroupOverviewTable data={data} columns={columns} />;
}
