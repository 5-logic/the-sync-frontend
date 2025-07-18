'use client';

import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';

export interface GroupTableProps {
	code: string;
	name: string;
	title: string;
	supervisors: string[];
	reviewers: string[];
}
interface Props {
	groups: GroupTableProps[];
	// onAssign: (group: FullMockGroup) => void;
	loading?: boolean;
	noMilestone?: boolean;
}

export default function GroupTable({
	groups,
	// onAssign,
	loading,
	noMilestone,
}: Readonly<Props>) {
	const columns: ColumnsType<GroupTableProps> = [
		{
			title: 'Group Code',
			dataIndex: 'code',
			key: 'code',
		},
		{
			title: 'Group Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Thesis Title',
			dataIndex: 'title',
			key: 'title',
		},
		{
			title: 'Supervisors',
			key: 'supervisors',
		},
		{
			title: 'Reviewers',
			key: 'reviewers',
		},

		{
			title: 'Action',
			key: 'action',
			render: () => <Button type="primary">Assign</Button>,
		},
	];

	return (
		<Table<GroupTableProps>
			rowKey="id"
			dataSource={groups}
			columns={columns}
			pagination={TablePagination}
			loading={loading}
			scroll={{ x: 'max-content' }}
			locale={noMilestone ? { emptyText: 'No Data (No Milestone)' } : undefined}
		/>
	);
}
