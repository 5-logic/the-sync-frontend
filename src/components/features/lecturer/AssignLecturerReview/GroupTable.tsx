'use client';

import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { FullMockGroup } from '@/data/group';
import { SubmissionGroup } from '@/lib/services/submission.service';

interface Props {
	groups: SubmissionGroup[];
	onAssign: (group: FullMockGroup) => void;
}

export default function GroupTable({ groups, onAssign }: Readonly<Props>) {
	const columns: ColumnsType<SubmissionGroup> = [
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
			render: (_, record) => (
				<Button
					type="primary"
					onClick={() => onAssign(record as FullMockGroup)}
				>
					Assign
				</Button>
			),
		},
	];

	return (
		<Table<SubmissionGroup>
			rowKey="id"
			dataSource={groups}
			columns={columns}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
		/>
	);
}
