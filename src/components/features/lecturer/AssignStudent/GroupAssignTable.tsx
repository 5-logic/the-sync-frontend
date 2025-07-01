import GroupOverviewTable from '../AssignSupervisor/GroupOverviewTable';
import { baseColumns } from '../AssignSupervisor/SupervisorColumns';
import { EyeOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import type { ExtendedGroup } from '@/data/group';

interface Props {
	data: ReadonlyArray<ExtendedGroup>;
	onView?: (group: ExtendedGroup) => void;
}

export default function GroupAssignTable({ data, onView }: Readonly<Props>) {
	const columns = [
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

	return <GroupOverviewTable data={[...data]} columns={columns} />;
}
