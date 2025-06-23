import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { ExtendedGroup } from '@/data/group';

export const statusColorMap: Record<string, string> = {
	Finalized: 'green',
	Incomplete: 'orange',
	Unassigned: 'red',
};

export const renderSupervisors = (supervisors: string[]) =>
	supervisors.length > 0 ? (
		<div>
			{supervisors.map((sup) => (
				<div key={sup}>{sup}</div>
			))}
		</div>
	) : (
		'-'
	);

export const baseColumns: ColumnsType<ExtendedGroup> = [
	{ title: 'Group Name', dataIndex: 'name' },
	{ title: 'Thesis Title', dataIndex: 'thesisTitle' },
	{ title: 'Members', dataIndex: 'members' },
	{
		title: 'Supervisor',
		dataIndex: 'supervisors',
		render: renderSupervisors,
	},
	{
		title: 'Status',
		dataIndex: 'status',
		render: (status: string) => (
			<Tag color={statusColorMap[status]}>{status}</Tag>
		),
	},
];
