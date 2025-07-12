import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { type SupervisorAssignmentData } from '@/hooks/lecturer/useAssignSupervisor';

/**
 * Color mapping for supervisor assignment status
 */

export const statusColorMap: Record<string, string> = {
	Finalized: 'green',
	Incomplete: 'orange',
	Unassigned: 'red',
};

/**
 * Renders supervisor names in a vertical list
 */
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

/**
 * Base column definitions for supervisor assignment table
 */

export const baseColumns: ColumnsType<SupervisorAssignmentData> = [
	{
		title: 'Group Name',
		dataIndex: 'groupName',
		key: 'groupName',
	},
	{
		title: 'Thesis Title',
		dataIndex: 'thesisTitle',
		key: 'thesisTitle',
	},
	{
		title: 'Members',
		dataIndex: 'memberCount',
		key: 'memberCount',
		render: (memberCount: number, record: SupervisorAssignmentData) => {
			if (record.groupName === 'No Group') {
				return '-';
			}
			return memberCount || 0;
		},
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
