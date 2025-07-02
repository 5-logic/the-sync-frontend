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

// Hàm lấy tên reviewer từ groupId
function getReviewersForGroup(groupId: string, phase: string): string[] {
	const submission = mockSubmissions.find(
		(s) => s.groupId === groupId && s.milestone === phase,
	);
	if (!submission) return [];

	return mockReviews
		.filter((r) => r.submissionId === submission.id)
		.map((r) => {
			const lecturer = mockLecturers.find((l) => l.id === r.lecturerId);
			return lecturer?.fullName;
		})
		.filter(Boolean) as string[];
}

// Hàm hiển thị danh sách Reviewer
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

// Hàm hiển thị danh sách Reviewer
function renderReviewers(group: FullMockGroup) {
	const reviewers = getReviewersForGroup(group.id, group.phase || '');
	return reviewers.length > 0 ? (
		<div>
			{reviewers.map((name) => (
				<div key={name}>{name}</div>
			))}
		</div>
	) : (
		<span style={{ color: '#aaa' }}>Not assigned</span>
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
			title: 'Reviewer',
			key: 'reviewers',
			render: (_, record) => renderReviewers(record),
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
