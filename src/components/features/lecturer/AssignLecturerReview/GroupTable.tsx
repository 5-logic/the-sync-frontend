'use client';

import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { Lecturer } from '@/lib/services/review.service';

export interface GroupTableProps {
	id: string;
	code: string;
	name: string;
	title: string;
	supervisors: Lecturer[];
	reviewers: Lecturer[];
	submissionId?: string;
	phase?: string;
}
interface Props {
	groups: GroupTableProps[];
	onAssign: (group: GroupTableProps) => void;
	loading?: boolean;
	noMilestone?: boolean;
}

export default function GroupTable({
	groups,
	onAssign,
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
			title: 'English Name',
			dataIndex: 'title',
			key: 'title',
		},
		{
			title: 'Supervisors',
			key: 'supervisors',
			render: (_, record) => (
				<div>
					{record.supervisors && record.supervisors.length > 0
						? record.supervisors.map((lecturer, idx) => (
								<div key={idx}>{lecturer.fullName}</div>
							))
						: ''}
				</div>
			),
		},
		{
			title: 'Reviewers',
			key: 'reviewers',
			render: (_, record) => (
				<div>
					{record.reviewers && record.reviewers.length > 0
						? record.reviewers.map((lecturer, idx) => (
								<div key={idx}>{lecturer.fullName}</div>
							))
						: ''}
				</div>
			),
		},

		{
			title: 'Action',
			key: 'action',
			render: (_, record) => (
				<Button type="primary" onClick={() => onAssign(record)}>
					{record.reviewers && record.reviewers.length > 0
						? 'Change'
						: 'Assign'}
				</Button>
			),
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
