import { Button, Drawer, Select, Space, Typography } from 'antd';

import { FullMockGroup } from '@/data/group';
import { mockLecturers } from '@/data/lecturers';
import { mockReviews } from '@/data/review';

interface Props {
	group: FullMockGroup | null;
	onClose: () => void;
}

export default function AssignReviewerDrawer({ group, onClose }: Props) {
	if (!group) return null;

	// ✅ Tạm ánh xạ submissionId theo groupId (hardcoded)
	const submissionMap: Record<string, string> = {
		g1: 's1',
		g2: 's2',
		g3: 's3',
		g4: 's4',
	};

	// ✅ Lấy danh sách reviewer name
	const reviewerNames =
		group.id in submissionMap
			? mockReviews
					.filter((r) => r.submissionId === submissionMap[group.id])
					.map((r) => {
						const lecturer = mockLecturers.find((l) => l.id === r.lecturerId);
						return lecturer?.fullName ?? r.lecturerId;
					})
			: [];

	return (
		<Drawer
			title={`Assign Reviewers for Group: ${group.name}`}
			open={!!group}
			onClose={onClose}
			width={400}
		>
			<Typography.Paragraph>
				<strong>Group Code:</strong> {group.code}
			</Typography.Paragraph>
			<Typography.Paragraph>
				<strong>Supervisor:</strong>
				<br />
				{group.supervisors.length > 0 ? (
					group.supervisors.map((s) => <div key={s}>{s}</div>)
				) : (
					<div>-</div>
				)}
			</Typography.Paragraph>

			<Space direction="vertical" style={{ width: '100%' }}>
				<Select
					mode="multiple"
					allowClear
					placeholder="Search and select lecturers"
					style={{ width: '100%' }}
				/>
				<div>
					<Typography.Text strong>Current Reviewers</Typography.Text>
					<ul>
						{reviewerNames.length > 0 ? (
							reviewerNames.map((name) => <li key={name}>{name}</li>)
						) : (
							<li>-</li>
						)}
					</ul>
				</div>
				<Space>
					<Button onClick={onClose}>Cancel</Button>
					<Button type="primary">Assign Lecturer</Button>
				</Space>
			</Space>
		</Drawer>
	);
}
