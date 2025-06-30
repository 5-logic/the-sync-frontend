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
	{
		title: 'Group Name',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: 'Thesis Title',
		dataIndex: 'thesisTitle',
		key: 'thesisTitle',
	},
	{
		title: 'Members',
		dataIndex: 'members',
		key: 'members',
		render: (members: number) => (
			<span style={{ color: 'inherit' }}>{members}</span>
		),
	},
	{
		title: 'Supervisor',
		dataIndex: 'supervisors',
		key: 'supervisors',
		render: renderSupervisors,
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		render: (status: string) => (
			<Tag color={statusColorMap[status] ?? 'default'}>{status}</Tag>
		),
	},
];
