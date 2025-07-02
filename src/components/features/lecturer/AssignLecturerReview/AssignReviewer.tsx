'use client';

import { Button, Divider, Drawer, Select, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { FullMockGroup } from '@/data/group';
import { mockLecturers } from '@/data/lecturers';
import { mockReviews } from '@/data/review';
import { mockSubmissions } from '@/data/submission';

interface Props {
	group: FullMockGroup | null;
	onClose: () => void;
}

// 👉 Hàm lấy reviewer theo groupId (tạm để tại chỗ)
function getReviewersForGroup(groupId: string): string[] {
	const submission = mockSubmissions.find((s) => s.groupId === groupId);
	if (!submission) return [];

	return mockReviews
		.filter((r) => r.submissionId === submission.id)
		.map((r) => mockLecturers.find((l) => l.id === r.lecturerId)?.fullName)
		.filter(Boolean) as string[];
}

export default function AssignReviewer({ group, onClose }: Props) {
	const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);

	const currentReviewers = useMemo(
		() => getReviewersForGroup(group?.id ?? ''),
		[group],
	);

	if (!group) return null;

	return (
		<Drawer
			title={`Assign Reviewers for Group: ${group.name}`}
			open={!!group}
			onClose={onClose}
			width={400}
		>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<div>
					<Typography.Text strong>Group Code:</Typography.Text>
					<div>{group.code}</div>
				</div>

				<div>
					<Typography.Text strong>Supervisors:</Typography.Text>
					{group.supervisors.length > 0 ? (
						group.supervisors.map((s) => <div key={s}>{s}</div>)
					) : (
						<div className="text-gray-400 italic">No supervisor assigned</div>
					)}
				</div>

				<Divider />

				<div>
					<Typography.Text strong>Select Reviewers</Typography.Text>
					<Select
						mode="multiple"
						allowClear
						showSearch
						placeholder="Search and select lecturers"
						style={{ width: '100%' }}
						options={mockLecturers.map((l) => ({
							label: l.fullName,
							value: l.id,
						}))}
						value={selectedLecturers}
						onChange={setSelectedLecturers}
					/>
				</div>

				<div>
					<Typography.Text strong>Current Reviewers</Typography.Text>
					{currentReviewers.length > 0 ? (
						<ul className="list-disc ml-4">
							{currentReviewers.map((r) => (
								<li key={r}>{r}</li>
							))}
						</ul>
					) : (
						<div className="text-gray-400 italic">No reviewers assigned</div>
					)}
				</div>

				<Divider />

				<Space className="flex justify-end w-full">
					<Button onClick={onClose}>Cancel</Button>
					<Button type="primary">Assign Lecturer</Button>
				</Space>
			</Space>
		</Drawer>
	);
}
