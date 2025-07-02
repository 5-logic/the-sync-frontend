'use client';

import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { TablePagination } from '@/components/common/TablePagination';
import { FullMockGroup } from '@/data/group';
import { mockLecturers } from '@/data/lecturers';
import { mockReviews } from '@/data/review';
import { mockSubmissions } from '@/data/submission';

interface Props {
	groups: FullMockGroup[];
	onAssign: (group: FullMockGroup) => void;
}

function getReviewersForGroup(groupId: string): string[] {
	const submission = mockSubmissions.find((s) => s.groupId === groupId);
	if (!submission) return [];

	return mockReviews
		.filter((r) => r.submissionId === submission.id)
		.map((r) => mockLecturers.find((l) => l.id === r.lecturerId)?.fullName)
		.filter(Boolean) as string[];
}

function renderSupervisors(supervisors: string[]) {
	return supervisors.length > 0 ? (
		<div>
			{supervisors.map((sup) => (
				<div key={sup}>{sup}</div>
			))}
		</div>
	) : (
		'-'
	);
}

export default function GroupTable({ groups, onAssign }: Props) {
	const columns: ColumnsType<FullMockGroup> = [
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
			title: 'Supervisor',
			key: 'supervisors',
			render: (_, record) => renderSupervisors(record.supervisors),
		},
		{
			title: 'Reviewers',
			key: 'reviewers',
			render: (_, record) => {
				const reviewers = getReviewersForGroup(record.id);
				return reviewers.length > 0 ? reviewers.join(', ') : 'Not assigned';
			},
		},
		{
			title: 'Action',
			key: 'action',
			render: (_, record) => (
				<Button type="primary" onClick={() => onAssign(record)}>
					Assign
				</Button>
			),
		},
	];

	return (
		<Table
			rowKey="id"
			dataSource={groups}
			columns={columns}
			pagination={TablePagination}
			scroll={{ x: 'max-content' }}
		/>
	);
}
